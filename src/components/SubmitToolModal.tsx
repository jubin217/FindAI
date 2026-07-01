import React, { useState } from 'react';
import { X, Send, CheckCircle, Sparkles } from 'lucide-react';
import type { AITool } from '../data/tools';
import { db, isSupabaseConfigured } from '../lib/supabaseClient';

interface SubmitToolModalProps {
  onClose: () => void;
  onToolSubmitted: () => void;
}

export const SubmitToolModal: React.FC<SubmitToolModalProps> = ({
  onClose,
  onToolSubmitted
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

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        description: description.trim()
      });

      setIsSuccess(true);
      onToolSubmitted();
    } catch (err) {
      setErrorMessage('Could not list product. Please review your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel neon-border submit-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {isSuccess ? (
          // Success Screen Layout
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', marginBottom: 20 }}>
              <CheckCircle size={36} />
            </div>
            <h3 className="section-title" style={{ justifyContent: 'center', borderBottom: 'none', fontSize: '1.8rem', paddingBottom: 0 }}>
              Tool Submitted Successfully!
            </h3>
            <p className="text-secondary" style={{ maxWidth: 450, margin: '16px auto 28px auto', fontSize: '0.95rem' }}>
              {isSupabaseConfigured
                ? "Your submission has been queued. Our moderators will review and approve your listing on findai.store shortly!"
                : "Since the platform is running in Local Mode, your tool has been instantly approved and listed in the catalog!"}
            </p>
            <button className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          // Submission Form Layout
          <div>
            <h3 className="section-title" style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 0, borderBottom: 'none' }}>
              <Sparkles size={22} color="var(--primary)" />
              <span>List Your AI Product</span>
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 24 }}>
              Submit your project details to index it on findai.store and reach thousands of AI developers.
            </p>

            <form className="submit-form" onSubmit={handleSubmit}>
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
                <label htmlFor="toolPrice">Price starting range</label>
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
                <label>Supported Platforms</label>
                <div className="checkbox-grid">
                  {platformsOptions.map((plat) => (
                    <label key={plat} className="filter-checkbox-label" style={{ fontSize: '0.8rem' }}>
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
                  style={{ height: 120, resize: 'vertical' }}
                />
              </div>

              {errorMessage && (
                <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>{errorMessage}</p>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, marginTop: 10 }}
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Listing Product...' : 'Submit Product'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
