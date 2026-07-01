import { createClient } from '@supabase/supabase-js';
import type { AITool, Review } from '../data/tools';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Status flag to detect if user has connected their real Supabase project
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to map DB row to frontend AITool interface
const mapDbTool = (t: any): AITool => {
  const reviews = t.reviews || [];
  // Recalculate average rating dynamically to prevent mismatch
  const avgRating = reviews.length > 0 
    ? Math.round((reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviews.length) * 10) / 10
    : (t.rating || 0);

  return {
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    category: t.category,
    useCases: t.use_cases || [],
    pricingType: t.pricing_type,
    priceRange: t.price_range,
    features: t.features || [],
    platforms: t.platforms || [],
    websiteUrl: t.website_url,
    rating: avgRating,
    reviewCount: reviews.length > 0 ? reviews.length : (t.review_count || 0),
    reviews: reviews.map((r: any) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      userId: r.user_id
    })),
    clicks: t.clicks || 0,
    createdAt: t.created_at,
    approved: t.approved,
    userId: t.user_id,
    githubRepo: t.github_repo,
    trendingScore: t.trending_score || 0
  };
};

// Interface for DB operations
export const db = {
  async getTools(): Promise<AITool[]> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    try {
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*, reviews(*)');

      if (toolsError) throw toolsError;
      return (toolsData || []).map(mapDbTool);
    } catch (err) {
      console.error('Error fetching tools from Supabase:', err);
      throw err;
    }
  },

  async getUserTools(userId: string): Promise<AITool[]> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    try {
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*, reviews(*)')
        .eq('user_id', userId);

      if (toolsError) throw toolsError;
      return (toolsData || []).map(mapDbTool);
    } catch (err) {
      console.error('Error fetching user tools from Supabase:', err);
      throw err;
    }
  },

  async addTool(tool: Omit<AITool, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'clicks' | 'createdAt' | 'approved'>): Promise<AITool> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    try {
      // 1. Fetch all tools to run the duplicate link verification check
      const allTools = await db.getTools();
      const normalizeUrl = (u: string) => u.toLowerCase().trim().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '');
      const normalizedNew = normalizeUrl(tool.websiteUrl);
      const isDuplicate = allTools.some(t => normalizeUrl(t.websiteUrl) === normalizedNew);

      const newToolId = tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
      
      // Auto-approve only if it is unique! If it is a duplicate, set approved to false.
      const approvedStatus = !isDuplicate;

      const newTool: AITool = {
        ...tool,
        id: newToolId,
        rating: 0,
        reviewCount: 0,
        reviews: [],
        clicks: 0,
        createdAt: new Date().toISOString(),
        approved: approvedStatus
      };

      // 2. Generate local profile notice if it is a duplicate
      if (isDuplicate && tool.userId) {
        const noticesKey = `findai_notices_${tool.userId}`;
        const currentNoticesStr = localStorage.getItem(noticesKey);
        const currentNotices = currentNoticesStr ? JSON.parse(currentNoticesStr) : [];
        const newNotice = {
          id: 'notice-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          toolName: tool.name,
          websiteUrl: tool.websiteUrl,
          message: `This tool is alredy listed by other people, if its yours, please file a complaint to "support@findai.store" with proofs.`,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(noticesKey, JSON.stringify([newNotice, ...currentNotices]));
      }

      // 3. Insert tool row into Supabase tools table
      const { error } = await supabase.from('tools').insert([{
        id: newTool.id,
        name: newTool.name,
        tagline: newTool.tagline,
        description: newTool.description,
        category: newTool.category,
        use_cases: newTool.useCases,
        pricing_type: newTool.pricingType,
        price_range: newTool.priceRange,
        features: newTool.features,
        platforms: newTool.platforms,
        website_url: newTool.websiteUrl,
        rating: 0,
        review_count: 0,
        clicks: 0,
        approved: approvedStatus,
        user_id: newTool.userId,
        github_repo: newTool.githubRepo
      }]);

      if (error) throw error;
      return newTool;
    } catch (err) {
      console.error('Error adding tool to Supabase:', err);
      throw err;
    }
  },

  async updateTool(toolId: string, updates: Partial<AITool>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.useCases !== undefined) dbUpdates.use_cases = updates.useCases;
      if (updates.pricingType !== undefined) dbUpdates.pricing_type = updates.pricingType;
      if (updates.priceRange !== undefined) dbUpdates.price_range = updates.priceRange;
      if (updates.features !== undefined) dbUpdates.features = updates.features;
      if (updates.platforms !== undefined) dbUpdates.platforms = updates.platforms;
      if (updates.websiteUrl !== undefined) dbUpdates.website_url = updates.websiteUrl;
      if (updates.approved !== undefined) dbUpdates.approved = updates.approved;
      if (updates.githubRepo !== undefined) dbUpdates.github_repo = updates.githubRepo;
      if (updates.trendingScore !== undefined) dbUpdates.trending_score = updates.trendingScore;

      const { error } = await supabase
        .from('tools')
        .update(dbUpdates)
        .eq('id', toolId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating tool in Supabase:', err);
      throw err;
    }
  },

  async addReview(toolId: string, review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    try {
      const newReview: Review = {
        id: 'rev-' + Math.random().toString(36).substring(2, 8),
        author: review.author,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date().toISOString(),
        userId: review.userId
      };

      const { error } = await supabase.from('reviews').insert([{
        id: newReview.id,
        tool_id: toolId,
        author: newReview.author,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: newReview.createdAt
      }]);

      if (error) throw error;
      return newReview;
    } catch (err) {
      console.error('Error adding review to Supabase:', err);
      throw err;
    }
  },

  async recordClick(toolId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    try {
      const { error } = await supabase.rpc('increment_tool_clicks', { tool_id: toolId });
      if (error) throw error;
    } catch (err) {
      console.error('Error recording click in Supabase:', err);
      throw err;
    }
  },

  async deleteTool(toolId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting tool from Supabase:', err);
      throw err;
    }
  }
};;

export const isAdmin = (user: any): boolean => {
  if (!user || !user.email) return false;
  const adminEmails = ['admin@findai.store', 'jubin@example.com'];
  return adminEmails.includes(user.email.toLowerCase());
};
