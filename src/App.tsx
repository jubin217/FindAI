import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { 
  Filter, 
  RotateCcw, 
  AlertCircle, 
  Globe, 
  ArrowUpRight 
} from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DotField } from './components/DotField';
import { ToolCard } from './components/ToolCard';
import InfiniteMenu, { generateCardImage } from './components/InfiniteMenu';
import { ToolDetailsModal } from './components/ToolDetailsModal';
import { ComparisonDrawer } from './components/ComparisonDrawer';
import { ComparisonModal } from './components/ComparisonModal';
import { AboutSection } from './components/AboutSection';
import { PrivacyModal } from './components/PrivacyModal';
import { TermsModal } from './components/TermsModal';
import { AttributionModal } from './components/AttributionModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmModal } from './components/ConfirmModal';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import type { AITool } from './data/tools';
import { db } from './lib/supabaseClient';
import { useScrollAnimation } from './hooks/useScrollAnimation';

// Lazy load secondary views to optimize initial bundle size
const SubmitToolView = lazy(() => import('./components/SubmitToolView').then(m => ({ default: m.SubmitToolView })));
const ProfileView = lazy(() => import('./components/ProfileView').then(m => ({ default: m.ProfileView })));
const AdminReviewView = lazy(() => import('./components/AdminReviewView').then(m => ({ default: m.AdminReviewView })));

// Helper functions for category slugs mapping
const CATEGORIES = [
  'Writing', 'Coding', 'Image Generation', 'Video Editing', 'Marketing',
  'Productivity', 'Education', 'Customer Support', 'Data Analytics'
];

const PRICING_OPTIONS = ['Free', 'Freemium', 'Free Trial', 'Paid'];
const PLATFORM_OPTIONS = ['Web', 'macOS', 'Windows', 'Linux', 'iOS', 'Android', 'Chrome Extension'];

const categoryToSlug = (cat: string) => {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const slugToCategory = (slug: string, categories: string[]) => {
  const normalized = slug.toLowerCase();
  if (normalized === 'all') return 'All';
  const found = categories.find(cat => categoryToSlug(cat) === normalized);
  return found || 'All';
};

// Glassmorphic spinner fallback layout for Suspense boundaries
const PageLoader = () => (
  <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div className="loader" style={{ width: 40, height: 40, border: '3px solid rgba(79, 70, 229, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  </div>
);

function App() {
  // Core state lists
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  // Auth & Routing View states
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'home' | 'submit-tool' | 'profile' | 'admin'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<'submit-tool' | 'profile' | 'admin' | null>(null);

  // Search & Filter criteria states
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortOption, setSortOption] = useState<string>('trending');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

  // Modal & Drawer management states
  const [selectedCompareTools, setSelectedCompareTools] = useState<AITool[]>([]);
  const [selectedDetailTool, setSelectedDetailTool] = useState<AITool | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAttributionModalOpen, setIsAttributionModalOpen] = useState(false);
  const [compareAlertOpen, setCompareAlertOpen] = useState(false);

  // Theme State (defaulting to system preference)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Dynamic SEO Meta tags and Titles based on navigation context
  useEffect(() => {
    let title = 'FindAI - The Best AI Tools Directory & Comparison Catalog (2026)';
    let description = 'Discover and compare the best artificial intelligence tools, software, and models. Filter by pricing types, platforms, ratings, and industries.';

    if (currentView === 'submit-tool') {
      title = 'Submit Your AI Product | FindAI';
      description = 'List your generative AI tool, API, or application on FindAI. Get discovered by thousands of developers, builders, and early adopters.';
    } else if (currentView === 'profile') {
      title = 'Developer Profile & Submissions | FindAI';
      description = 'Manage your submitted artificial intelligence applications, check approval status, and review platform feedback.';
    } else if (currentView === 'admin') {
      title = 'Review Dashboard & Content Moderation | FindAI';
      description = 'Moderator command center for reviewing pending applications and managing directory integrity.';
    } else if (selectedDetailTool) {
      title = `${selectedDetailTool.name} – Features, Pricing & Reviews | FindAI`;
      description = `${selectedDetailTool.name}: ${selectedDetailTool.tagline || selectedDetailTool.description.slice(0, 150)}`;
    } else if (selectedCategory && selectedCategory !== 'All') {
      title = `Best AI Tools for ${selectedCategory} (2026) | FindAI`;
      description = `Explore and compare the highest-rated AI tools for ${selectedCategory}. Read reviews, check pricing models (Free, Freemium, Paid), and filter by target platform.`;
    }

    document.title = title;
    
    // Update Meta Description dynamically for search engine crawlers
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Build dynamic JSON-LD Schema for GEO/SEO Authority search indexing
    let schemaData: any = null;

    if (selectedDetailTool) {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": selectedDetailTool.name,
        "description": selectedDetailTool.tagline || selectedDetailTool.description.slice(0, 150),
        "category": selectedDetailTool.category,
        "offers": {
          "@type": "Offer",
          "price": selectedDetailTool.pricingType === 'Free' ? '0' : '9.99',
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": selectedDetailTool.rating || 4.5,
          "reviewCount": selectedDetailTool.reviewCount || 1,
          "bestRating": "5",
          "worstRating": "1"
        }
      };
    } else if (selectedCategory && selectedCategory !== 'All') {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Best AI Tools for ${selectedCategory} (2026) | FindAI`,
        "url": `https://findai.store/category/${categoryToSlug(selectedCategory)}`,
        "description": description
      };
    } else {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "FindAI",
        "url": "https://findai.store/",
        "description": description,
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://findai.store/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };
    }

    // Inject/Update structured script in document head
    let scriptTag = document.getElementById('seo-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData, null, 2);
  }, [currentView, selectedCategory, selectedDetailTool]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch tools from the DB adapter
  const fetchToolsData = async () => {
    setLoading(true);
    try {
      const data = await db.getTools();
      setTools(data);
    } catch (err) {
      console.error('Error fetching tools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolsData();

    // Parse search queries directly on load for search engines / link sharing
    const searchParams = new URLSearchParams(window.location.search);
    const searchVal = searchParams.get('search');
    if (searchVal) {
      setSearchValue(searchVal);
    }

    if (isSupabaseConfigured && supabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      // Subscribe to authentication transitions
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Sync route target upon authentication success
  useEffect(() => {
    if (user && pendingRedirect) {
      window.location.hash = '#/' + pendingRedirect;
      setPendingRedirect(null);
    }
  }, [user, pendingRedirect]);

  // Reset visible tools count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedCategory, searchValue, selectedPricing, selectedPlatforms, minRating, sortOption, activeSection]);

  // Synchronize hash routing (Single source of truth)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      // 1. Intercept clean paths (for SEO crawler entry compatibility)
      if (path.startsWith('/category/')) {
        const slug = path.replace('/category/', '');
        const mappedCat = slugToCategory(slug, CATEGORIES);
        setSelectedCategory(mappedCat);
        setCurrentView('home');
        window.history.replaceState(null, '', '/#/category/' + slug);
        return;
      } else if (path.startsWith('/tool/')) {
        const toolId = path.replace('/tool/', '');
        const targetTool = tools.find((t) => t.id === toolId);
        if (targetTool) {
          setSelectedDetailTool(targetTool);
        }
        window.history.replaceState(null, '', '/');
        return;
      } else if (path === '/submit-tool') {
        setCurrentView('submit-tool');
        window.history.replaceState(null, '', '/#/submit-tool');
        return;
      } else if (path === '/profile') {
        setCurrentView('profile');
        window.history.replaceState(null, '', '/#/profile');
        return;
      } else if (path === '/admin') {
        setCurrentView('admin');
        window.history.replaceState(null, '', '/#/admin');
        return;
      }

      // 2. Fall back to standard Hash Routing
      if (hash === '#/admin') {
        setCurrentView('admin');
      } else if (hash === '#/profile') {
        setCurrentView('profile');
      } else if (hash.startsWith('#/submit-tool')) {
        setCurrentView('submit-tool');
      } else if (hash.startsWith('#/tool/')) {
        const toolId = hash.replace('#/tool/', '');
        const targetTool = tools.find((t) => t.id === toolId);
        if (targetTool) {
          setSelectedDetailTool(targetTool);
        }
        window.location.hash = ''; // reset hash back to home view cleanly
      } else if (hash.startsWith('#/category/')) {
        const slug = hash.replace('#/category/', '');
        const mappedCat = slugToCategory(slug, CATEGORIES);
        setSelectedCategory(mappedCat);
        setCurrentView('home');
      } else if (hash === '' || hash === '#/') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Trigger initially
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [tools]);



  // Static options lists for sidebar filters linked to global constants
  const categories = CATEGORIES;
  const pricingOptions = PRICING_OPTIONS;
  const platformOptions = PLATFORM_OPTIONS;

  // Filter & Sort computation
  const filteredTools = useMemo(() => {
    // Only display approved tools on the public directory catalog
    let result = tools.filter((tool) => tool.approved);

    // Search query matching
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.tagline.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query) ||
          tool.pricingType.toLowerCase().includes(query) ||
          tool.useCases.some((uc) => uc.toLowerCase().includes(query)) ||
          tool.features.some((f) => f.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((tool) => tool.category === selectedCategory);
    }

    // Pricing filters
    if (selectedPricing.length > 0) {
      result = result.filter((tool) => selectedPricing.includes(tool.pricingType));
    }

    // Platforms filters
    if (selectedPlatforms.length > 0) {
      result = result.filter((tool) =>
        tool.platforms.some((p) => selectedPlatforms.includes(p))
      );
    }

    // Minimum rating filter
    if (minRating > 0) {
      result = result.filter((tool) => tool.rating >= minRating);
    }

    // Active Section filter
    if (activeSection === 'trending') {
      result = result.filter((tool) => {
        if (!tool.userId) {
          return (tool.trendingScore || 0) > 40 || (tool.clicks || 0) > 800; // Famous pre-seeded tools
        } else {
          return (tool.rating >= 4.0 && tool.reviewCount >= 1) || (tool.clicks || 0) > 20; // Active user tools
        }
      });
      result.sort((a, b) => {
        const scoreA = a.trendingScore !== undefined ? a.trendingScore : (!a.userId ? (a.clicks || 0) / 10 : ((a.rating || 0) * (a.reviewCount || 0) * 10 + (a.clicks || 0) / 10));
        const scoreB = b.trendingScore !== undefined ? b.trendingScore : (!b.userId ? (b.clicks || 0) / 10 : ((b.rating || 0) * (b.reviewCount || 0) * 10 + (b.clicks || 0) / 10));
        return scoreB - scoreA;
      });
    } else if (activeSection === 'new') {
      result = result.filter((tool) => new Date(tool.createdAt).getFullYear() >= 2024);
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeSection === 'editors') {
      result = result.filter((tool) => tool.rating >= 4.7);
    } else if (activeSection === 'free') {
      result = result.filter((tool) => tool.pricingType === 'Free' || tool.pricingType === 'Freemium');
    }

    // Sort order (applied if activeSection is 'all')
    if (activeSection === 'all') {
      if (sortOption === 'trending') {
        result.sort((a, b) => (b.trendingScore || b.clicks || 0) - (a.trendingScore || a.clicks || 0));
      } else if (sortOption === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
      } else if (sortOption === 'newest') {
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }

    return result;
  }, [tools, searchValue, selectedCategory, selectedPricing, selectedPlatforms, minRating, sortOption, activeSection]);

  const visibleTools = useMemo(() => {
    return filteredTools.slice(0, visibleCount);
  }, [filteredTools, visibleCount]);

  // Generate items for the 3D InfiniteMenu from the tools database
  const featuredMenuItems = useMemo(() => {
    // Select approved tools from the active filtered catalog list matching active search & category tags
    let showcaseList = filteredTools.filter(t => t.approved);
    
    // Sort by popularity (clicks or rating) to display the best tools prominently
    showcaseList = [...showcaseList].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

    // Limit to 45 items to prevent browser lag and preserve high WebGL rendering performance
    showcaseList = showcaseList.slice(0, 45);
    
    if (showcaseList.length === 0) {
      return [];
    }

    return showcaseList.map(tool => {
      let color = '#3b82f6';
      switch (tool.category) {
        case 'Coding': color = '#10b981'; break;
        case 'Writing': color = '#8b5cf6'; break;
        case 'Image Generation': color = '#06b6d4'; break;
        case 'Video Editing': color = '#f43f5e'; break;
        case 'Marketing': color = '#ec4899'; break;
        case 'Productivity': color = '#3b82f6'; break;
        case 'Education': color = '#f59e0b'; break;
        case 'Customer Support': color = '#a855f7'; break;
        case 'Data Analytics': color = '#14b8a6'; break;
      }

      const cardImage = generateCardImage(tool.name, tool.category, color);

      return {
        image: cardImage,
        link: `#/tool/${tool.id}`,
        title: tool.name,
        description: tool.tagline,
        category: tool.category
      };
    });
  }, [filteredTools, theme]);

  // Sync scroll animations on changes to the catalog items list
  useScrollAnimation([
    visibleTools,
    currentView,
    loading
  ]);

  // Handle addition/removal of tools in the comparison pool (Max 3)
  const handleCompareToggle = (tool: AITool, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setSelectedCompareTools((prev) => {
      const isAlreadyIn = prev.some((t) => t.id === tool.id);
      if (isAlreadyIn) {
        return prev.filter((t) => t.id !== tool.id);
      }
      if (prev.length >= 3) {
        setCompareAlertOpen(true);
        return prev;
      }
      return [...prev, tool];
    });
  };

  const handleRemoveCompare = (toolId: string) => {
    setSelectedCompareTools((prev) => prev.filter((t) => t.id !== toolId));
  };

  const resetFilters = () => {
    setSelectedPricing([]);
    setSelectedPlatforms([]);
    setMinRating(0);
    setSearchValue('');
    setSelectedCategory('All');
    setActiveSection('all');
  };

  // Callback to sync details state if the currently opened tool's rating was updated
  const handleReviewAdded = async () => {
    await fetchToolsData();
    if (selectedDetailTool) {
      const freshTools = await db.getTools();
      const updatedTool = freshTools.find((t) => t.id === selectedDetailTool.id);
      if (updatedTool) {
        setSelectedDetailTool(updatedTool);
      }
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
      setUser(null);
      resetFilters();
      window.location.hash = '';
    }
  };

  return (
    <>
      {/* Background neon blur blobs and grid lines */}
      <div className="bg-glow-container">
        <div className="bg-glow-blob blob-purple" />
        <div className="bg-glow-blob blob-cyan" />
        <div className="bg-glow-blob blob-emerald" />
      </div>
      <div className="bg-grid-overlay" />

      {/* Interactive DotField background animation layered above the cement texture */}
      <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: -8, pointerEvents: 'none' }}>
        <DotField
          dotRadius={1.8}
          dotSpacing={22}
          bulgeStrength={50}
          glowRadius={180}
          sparkle={true}
          waveAmplitude={1.5}
          gradientFrom={theme === 'dark' ? "rgba(255, 255, 255, 0.45)" : "rgba(79, 70, 229, 0.4)"}
          gradientTo={theme === 'dark' ? "rgba(148, 163, 184, 0.22)" : "rgba(14, 165, 233, 0.2)"}
          glowColor={theme === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(79, 70, 229, 0.06)"}
        />
      </div>



      {/* Header navbar */}
      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSubmitClick={() => {
          if (user) {
            window.location.hash = '#/submit-tool';
          } else {
            setPendingRedirect('submit-tool');
            setIsAuthModalOpen(true);
          }
        }}
        onCompareClick={() => setIsCompareModalOpen(true)}
        compareCount={selectedCompareTools.length}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onSignOutClick={handleSignOut}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'submit-tool' && !user) {
            setPendingRedirect('submit-tool');
            setIsAuthModalOpen(true);
          } else if (view === 'profile' && !user) {
            setPendingRedirect('profile');
            setIsAuthModalOpen(true);
          } else {
            window.location.hash = view === 'home' ? '' : '#/' + view;
          }
        }}
      />

      {/* 1. Main Directory View */}
      {currentView === 'home' && (
        <>
          {/* Hero section */}
          <Hero
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            tools={tools}
            onToolClick={(tool) => setSelectedDetailTool(tool)}
          />



          {/* Main Browse Catalog Section */}
          <main className="container" style={{ minHeight: '60vh' }}>
            {/* Quick Category Badges Row */}
            <div className="category-badges-container scale-up animated">
              <button
                className={`category-badge ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => { window.location.hash = '#/'; }}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-badge ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => { window.location.hash = `#/category/${categoryToSlug(cat)}`; }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="mobile-filter-toggle-container">
              <button 
                className="btn-secondary mobile-filter-toggle btn-3d"
                onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}
              >
                <Filter size={16} />
                <span>{mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
            </div>

            <div className="main-layout">
              {/* Sidebar Filter Panel */}
              <aside className={`sidebar-filters glass-panel slide-in-left animated ${mobileFiltersExpanded ? 'expanded' : ''}`}>
                {/* Header filters controls */}
                <div className="filter-section-title">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={16} />
                    <span>Filters</span>
                  </span>
                  <button 
                    onClick={resetFilters}
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}
                    title="Reset Filters"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Pricing Model Section */}
                <div>
                  <h4 className="filter-section-title" style={{ fontSize: '0.95rem' }}>Pricing Model</h4>
                  <div className="filter-list">
                    {pricingOptions.map((price) => (
                      <label key={price} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedPricing.includes(price)}
                          onChange={() => {
                            setSelectedPricing((prev) =>
                              prev.includes(price)
                                ? prev.filter((p) => p !== price)
                                : [...prev, price]
                            );
                          }}
                        />
                        <span>{price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter Section */}
                <div>
                  <h4 className="filter-section-title" style={{ fontSize: '0.95rem' }}>Minimum Rating</h4>
                  <div className="filter-list">
                    {[4.5, 4.0, 3.0].map((rating) => (
                      <label key={rating} className="filter-checkbox-label">
                        <input
                          type="radio"
                          name="ratingFilter"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          style={{ borderRadius: '50%' }}
                        />
                        <span>{rating.toFixed(1)}+ Stars</span>
                      </label>
                    ))}
                    <label className="filter-checkbox-label">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={minRating === 0}
                        onChange={() => setMinRating(0)}
                        style={{ borderRadius: '50%' }}
                      />
                      <span>Any Rating</span>
                    </label>
                  </div>
                </div>

                {/* Supported Platforms Section */}
                <div>
                  <h4 className="filter-section-title" style={{ fontSize: '0.95rem' }}>Platforms</h4>
                  <div className="filter-list">
                    {platformOptions.map((plat) => (
                      <label key={plat} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(plat)}
                          onChange={() => {
                            setSelectedPlatforms((prev) =>
                              prev.includes(plat)
                                ? prev.filter((p) => p !== plat)
                                : [...prev, plat]
                            );
                          }}
                        />
                        <span>{plat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Right side Grid results */}
              <section>
                {/* Featured Collections Selector Tabs */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }} className="scroll-animate animated">
                  <button 
                    className={`category-badge ${activeSection === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveSection('all')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px', background: activeSection === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.03)' }}
                  >
                    All Tools
                  </button>
                  <button 
                    className={`category-badge ${activeSection === 'trending' ? 'active' : ''}`}
                    onClick={() => setActiveSection('trending')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px', background: activeSection === 'trending' ? 'var(--primary)' : 'rgba(255,255,255,0.03)' }}
                  >
                    🔥 Trending Today
                  </button>
                  <button 
                    className={`category-badge ${activeSection === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveSection('new')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px', background: activeSection === 'new' ? 'var(--primary)' : 'rgba(255,255,255,0.03)' }}
                  >
                    🚀 New This Week
                  </button>
                  <button 
                    className={`category-badge ${activeSection === 'editors' ? 'active' : ''}`}
                    onClick={() => setActiveSection('editors')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px', background: activeSection === 'editors' ? 'var(--primary)' : 'rgba(255,255,255,0.03)' }}
                  >
                    ⭐ Editor's Picks
                  </button>
                  <button 
                    className={`category-badge ${activeSection === 'free' ? 'active' : ''}`}
                    onClick={() => setActiveSection('free')}
                    style={{ fontSize: '0.8rem', padding: '6px 14px', background: activeSection === 'free' ? 'var(--primary)' : 'rgba(255,255,255,0.03)' }}
                  >
                    💸 Top Free Tools
                  </button>
                </div>

                {/* Control bar */}
                <div className="catalog-controls scroll-animate animated">
                  <div className="results-count">
                    Showing <span>{filteredTools.length}</span> tools
                  </div>
                  
                  <div className="sort-wrapper">
                    <label htmlFor="sortSelect">Sort By:</label>
                    <select
                      id="sortSelect"
                      className="sort-select"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="trending">Trending (Clicks)</option>
                      <option value="rating">Top Rated</option>
                      <option value="newest">New Launches</option>
                    </select>
                  </div>
                </div>

                {/* Grid List */}
                {loading ? (
                  <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin-glow 1s infinite linear' }} />
                      <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Searching Directory Database...</p>
                    </div>
                  </div>
                ) : filteredTools.length === 0 ? (
                  /* Empty results frame */
                  <div className="glass-panel scroll-animate animated" style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <AlertCircle size={40} color="var(--text-muted)" />
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No AI Tools Match Your Filters</h4>
                    <p className="text-secondary" style={{ maxWidth: 400, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Try resetting your active sidebar categories, platforms, or search queries to find listed products.
                    </p>
                    <button 
                      className="btn-primary" 
                      onClick={resetFilters} 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      <RotateCcw size={14} />
                      <span>Reset All Filters</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="tool-grid">
                      {visibleTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          onClick={() => setSelectedDetailTool(tool)}
                          isComparing={selectedCompareTools.some((t) => t.id === tool.id)}
                          onCompareToggle={(e) => handleCompareToggle(tool, e)}
                        />
                      ))}
                    </div>

                    {filteredTools.length > visibleCount && (
                      <div className="load-more-section scroll-animate animated">
                        <div className="load-more-stats text-secondary">
                          Showing <span>{visibleTools.length}</span> of <span>{filteredTools.length}</span> tools
                        </div>
                        <div className="load-more-progress">
                          <div 
                            className="load-more-progress-fill" 
                            style={{ width: `${Math.min(100, (visibleTools.length / filteredTools.length) * 100)}%` }} 
                          />
                        </div>
                        <button 
                          className="btn-primary load-more-btn" 
                          onClick={() => setVisibleCount((prev) => prev + 20)}
                        >
                          Load More Tools
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          </main>

          {/* Interactive 3D Orbit Showcase Section */}
          {featuredMenuItems.length > 0 && (
            <section className="showcase-3d-section container scroll-animate">
              <div className="showcase-header">
                <div className="showcase-badge" style={{ background: 'rgba(241, 245, 249, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
                  <span>👈 Hold and Drag to Rotate 👉</span>
                </div>
                <h2 className="showcase-title">Featured Interactive Orb</h2>
                <p className="showcase-subtitle">
                  Click and drag the sphere to explore top-rated systems. Click the arrow button on the active card to open details.
                </p>
              </div>
              <div className="showcase-menu-wrapper">
                <InfiniteMenu items={featuredMenuItems} scale={1.05} theme={theme} />
              </div>
            </section>
          )}

          {/* Modern Animated About Section */}
          <AboutSection onNavigateToSubmit={() => { window.location.hash = '#/submit-tool'; }} />

          {/* Floating comparison drawer */}
          <ComparisonDrawer
            selectedTools={selectedCompareTools}
            onRemove={handleRemoveCompare}
            onClear={() => setSelectedCompareTools([])}
            onCompareClick={() => setIsCompareModalOpen(true)}
          />
        </>
      )}

      {/* 2. Developer Submission, Profile, and Admin views with lazy dynamic loading boundaries */}
      <Suspense fallback={<PageLoader />}>
        {currentView === 'submit-tool' && (
          <SubmitToolView
            user={user}
            onNavigateHome={() => {
              if (window.location.hash.includes('from=profile')) {
                window.location.hash = '#/profile';
              } else {
                window.location.hash = '';
              }
            }}
            onAuthRequired={() => {
              setPendingRedirect('submit-tool');
              setIsAuthModalOpen(true);
            }}
            fromProfile={window.location.hash.includes('from=profile')}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            user={user}
            onNavigateHome={() => { window.location.hash = ''; }}
            onNavigateToSubmit={() => { window.location.hash = '#/submit-tool?from=profile'; }}
          />
        )}

        {currentView === 'admin' && (
          <AdminReviewView
            user={user}
            tools={tools}
            onRefresh={fetchToolsData}
            onNavigateHome={() => { window.location.hash = ''; }}
          />
        )}
      </Suspense>

      {/* Global Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleReviewAdded}
        />
      )}

      {/* Full detail modal overlay */}
      {selectedDetailTool && (
        <ToolDetailsModal
          tool={selectedDetailTool}
          onClose={() => setSelectedDetailTool(null)}
          allTools={tools}
          onReviewAdded={handleReviewAdded}
          onAlternativeClick={(alt) => setSelectedDetailTool(alt)}
          user={user}
          onAuthRequired={() => {
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* Side-by-side comparison modal overlay */}
      {isCompareModalOpen && (
        <ComparisonModal
          selectedTools={selectedCompareTools}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}

      {/* Privacy policy modal overlay */}
      {isPrivacyModalOpen && (
        <PrivacyModal
          onClose={() => setIsPrivacyModalOpen(false)}
        />
      )}

      {/* Terms of service modal overlay */}
      {isTermsModalOpen && (
        <TermsModal
          onClose={() => setIsTermsModalOpen(false)}
        />
      )}

      {/* Attribution & Trademark modal overlay */}
      {isAttributionModalOpen && (
        <AttributionModal
          onClose={() => setIsAttributionModalOpen(false)}
        />
      )}

      {/* Compare Limit Alert Modal */}
      <ConfirmModal
        isOpen={compareAlertOpen}
        title="Comparison Limit Reached"
        message="You can compare up to 3 tools side-by-side. Please remove a tool before adding another."
        confirmText="OK"
        onConfirm={() => setCompareAlertOpen(false)}
        type="alert"
      />

      {/* Immersive Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img 
                    src="/logoonly-removebg.webp" 
                    alt="FindAI Brand Logo - Find AI Tools Directory" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain'
                    }} 
                  />
                </div>
                <span className="logo-text" style={{ fontSize: '1.4rem' }}>FindAI<span className="logo-suffix">.store</span></span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 300, marginTop: 0 }}>
                Discover, evaluate, and compare the world's leading AI engines and products in one search. The independent developer discovery registry.
              </p>
            </div>
            
            <div className="footer-links-col">
              <h4>Directory</h4>
              <ul>
                <li><a href="#/category/coding" onClick={() => window.scrollTo(0, 500)}>Coding Tools</a></li>
                <li><a href="#/category/writing" onClick={() => window.scrollTo(0, 500)}>Writing Assistants</a></li>
                <li><a href="#/category/image-generation" onClick={() => window.scrollTo(0, 500)}>Image Generators</a></li>
                <li><a href="#/category/video-editing" onClick={() => window.scrollTo(0, 500)}>Video Editors</a></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4>Community</h4>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
                <a href="https://findai.store" style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Globe size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} FindAI.store. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsPrivacyModalOpen(true); }}>Privacy Policy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsTermsModalOpen(true); }}>Terms of Service</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsAttributionModalOpen(true); }}>Attribution & Trademarks</a>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (user) {
                    window.location.hash = '#/submit-tool';
                  } else {
                    setPendingRedirect('submit-tool');
                    setIsAuthModalOpen(true);
                  }
                }} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)' }}
              >
                <span>Submit a Tool</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
