import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Sparkles, ArrowLeft, Lock } from 'lucide-react';
import type { AITool } from '../data/tools';
import { db, isSupabaseConfigured } from '../lib/supabaseClient';

interface SubmitToolViewProps {
  user: any;
  onNavigateHome: () => void;
  onAuthRequired: () => void;
  fromProfile?: boolean;
}

export const SubmitToolView: React.FC<SubmitToolViewProps> = ({
  user,
  onNavigateHome,
  onAuthRequired,
  fromProfile = false
}) => {
  // Form fields states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [category, setCategory] = useState<AITool['category']>('Coding');
  const [pricingType, setPricingType] = useState<AITool['pricingType']>('Freemium');
  const [priceRange, setPriceRange] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');
  const [useCasesStr, setUseCasesStr] = useState('');
  const [description, setDescription] = useState('');
  
  // Platform selections
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Web']);
  const platformsOptions = ['Web', 'macOS', 'Windows', 'Linux', 'iOS', 'Android', 'Chrome Extension'];

  // Submission control states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rightsAgreed, setRightsAgreed] = useState(false);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!rightsAgreed) {
      setErrorMessage('You must represent that you have the necessary rights to submit this information and agree to the Terms of Service.');
      return;
    }

    if (!name.trim() || !tagline.trim() || !websiteUrl.trim() || !description.trim()) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Format text inputs to arrays
    const features = featuresStr
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    const useCases = useCasesStr
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    try {
      await db.addTool({
        name: name.trim(),
        tagline: tagline.trim(),
        websiteUrl: websiteUrl.trim(),
        category,
        pricingType,
        priceRange: priceRange.trim() || 'Free',
        features: features.length > 0 ? features : ['AI Assistance'],
        useCases: useCases.length > 0 ? useCases : ['General AI Usage'],
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['Web'],
        description: description.trim(),
        userId: user.id
      });

      setIsSuccess(true);
    } catch (err) {
      setErrorMessage('Could not list product. Please review your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <main className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel neon-border text-center" style={{ maxWidth: '480px', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={28} />
          </div>
          <h3 className="section-title" style={{ fontSize: '1.4rem', border: 'none', margin: 0, padding: 0 }}>Authentication Required</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            You must be logged in to submit an AI product to the directory. This helps us combat spam and maintain high-quality listings.
          </p>
          <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
            <button className="btn-primary" onClick={onAuthRequired} style={{ flex: 1 }}>
              Sign In / Register
            </button>
            <button 
              className="btn-secondary" 
              onClick={onNavigateHome}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {fromProfile ? 'Back to Profile' : 'Back to Directory'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container scale-up" style={{ minHeight: '80vh', paddingTop: '110px', paddingBottom: '80px' }}>
      {/* Back navigation */}
      <button 
        onClick={onNavigateHome} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          cursor: 'pointer',
          marginBottom: '24px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}
        className="btn-hover-white"
      >
        <ArrowLeft size={16} />
        <span>{fromProfile ? 'Back to Profile' : 'Back to Directory'}</span>
      </button>

      <div className="glass-panel neon-border" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 30px' }}>
        {isSuccess ? (
          // Success Screen Layout
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', marginBottom: 20 }}>
              <CheckCircle size={36} />
            </div>
            <h3 className="section-title" style={{ justifyContent: 'center', borderBottom: 'none', fontSize: '1.8rem', paddingBottom: 0 }}>
              Tool Submitted Successfully!
            </h3>
            <p className="text-secondary" style={{ maxWidth: 450, margin: '16px auto 28px auto', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              {isSupabaseConfigured
                ? 'Your submission has been queued. Our moderators will review and approve your listing on findai.store shortly!'
                : 'Since the platform is running in Local Mode, your tool has been instantly approved and listed in the catalog!'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" onClick={onNavigateHome}>
                {fromProfile ? 'Go to Profile' : 'Go to Homepage'}
              </button>
              <button 
                onClick={() => { setIsSuccess(false); setName(''); setTagline(''); setWebsiteUrl(''); setPriceRange(''); setFeaturesStr(''); setUseCasesStr(''); setDescription(''); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Submit Another
              </button>
            </div>
          </div>
        ) : (
          // Submission Form Layout
          <div>
            <h3 className="section-title" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 0, borderBottom: 'none' }}>
              <Sparkles size={24} color="var(--primary)" />
              <span>List Your AI Product</span>
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 32 }}>
              Submit your project details to index it on findai.store and reach thousands of AI developers.
            </p>

            <form className="submit-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Row 1: Name and website */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="toolName">Product Name *</label>
                  <input
                    id="toolName"
                    type="text"
                    required
                    placeholder="e.g. ChatDoc"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="toolUrl">Website URL *</label>
                  <input
                    id="toolUrl"
                    type="url"
                    required
                    placeholder="e.g. https://chatdoc.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Tagline */}
              <div className="form-group">
                <label htmlFor="toolTag">Short Tagline *</label>
                <input
                  id="toolTag"
                  type="text"
                  required
                  placeholder="e.g. Chat with any PDF document in seconds."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Row 3: Category & Pricing Type */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="toolCat">Category *</label>
                  <select
                    id="toolCat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AITool['category'])}
                  >
                    <option value="Coding">Coding</option>
                    <option value="Writing">Writing</option>
                    <option value="Image Generation">Image Generation</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Education">Education</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Data Analytics">Data Analytics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="toolPriceModel">Pricing Type *</label>
                  <select
                    id="toolPriceModel"
                    value={pricingType}
                    onChange={(e) => setPricingType(e.target.value as AITool['pricingType'])}
                  >
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Free Trial">Free Trial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Price details starting point */}
              <div className="form-group">
                <label htmlFor="toolPrice">Price Range Details</label>
                <input
                  id="toolPrice"
                  type="text"
                  placeholder="e.g. Free tier, Pro at $10/mo (Leave empty if completely free)"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                />
              </div>

              {/* Row 5: Features & Use Cases comma-separated */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="toolFeats">Key Features (comma-separated)</label>
                  <input
                    id="toolFeats"
                    type="text"
                    placeholder="e.g. PDF parsing, Multi-file chat, OCR"
                    value={featuresStr}
                    onChange={(e) => setFeaturesStr(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="toolUses">Use Cases (comma-separated)</label>
                  <input
                    id="toolUses"
                    type="text"
                    placeholder="e.g. Document parsing, Research help"
                    value={useCasesStr}
                    onChange={(e) => setUseCasesStr(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 6: Platforms */}
              <div className="form-group">
                <label style={{ marginBottom: 10, display: 'block' }}>Supported Platforms</label>
                <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                  {platformsOptions.map((plat) => (
                    <label key={plat} className="filter-checkbox-label" style={{ fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(plat)}
                        onChange={() => handlePlatformToggle(plat)}
                      />
                      <span>{plat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 7: Description */}
              <div className="form-group">
                <label htmlFor="toolDesc">Detailed Description *</label>
                <textarea
                  id="toolDesc"
                  required
                  placeholder="Provide a comprehensive summary explaining what your tool accomplishes, target user profiles, and why developers choose it."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ height: 140, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '8px 0' }}>
                <input
                  id="rightsAgreeCheckbox"
                  type="checkbox"
                  checked={rightsAgreed}
                  onChange={(e) => setRightsAgreed(e.target.checked)}
                  required
                  style={{ marginTop: 4, width: 'auto', height: 'auto', cursor: 'pointer', flexShrink: 0 }}
                />
                <label htmlFor="rightsAgreeCheckbox" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                  I represent that I have the necessary rights to submit this information and agree to the Terms of Service.
                </label>
              </div>

              {errorMessage && (
                <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>{errorMessage}</p>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, marginTop: 10, fontSize: '0.95rem' }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Listing Product...' : 'Submit Product'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
};
