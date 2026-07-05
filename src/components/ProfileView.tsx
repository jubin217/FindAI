import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Database, Edit, ExternalLink, Save, X, ShieldAlert, Trash2, Sparkles } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import type { AITool } from '../data/tools';
import { db } from '../lib/supabaseClient';

interface ProfileViewProps {
  user: any;
  onNavigateHome: () => void;
  onNavigateToSubmit: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onNavigateHome, onNavigateToSubmit }) => {
  const [userTools, setUserTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [notices, setNotices] = useState<any[]>([]);

  // Custom Confirm/Alert Modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteToolTarget, setDeleteToolTarget] = useState<{ id: string; name: string } | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
  const [editCategory, setEditCategory] = useState<AITool['category']>('Coding');
  const [editPricingType, setEditPricingType] = useState<AITool['pricingType']>('Freemium');
  const [editPriceRange, setEditPriceRange] = useState('');
  const [editFeatures, setEditFeatures] = useState('');
  const [editUseCases, setEditUseCases] = useState('');
  const [editPlatforms, setEditPlatforms] = useState<string[]>([]);
  const [editDescription, setEditDescription] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const tiltX = ((y / height) - 0.5) * -10;
    const tiltY = ((x / width) - 0.5) * 10;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--tilt-x', `${tiltX}deg`);
    card.style.setProperty('--tilt-y', `${tiltY}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };

  const platformsOptions = ['Web', 'macOS', 'Windows', 'Linux', 'iOS', 'Android', 'Chrome Extension'];

  // Lock body scroll when editing tool details
  useEffect(() => {
    if (editingTool) {
      const originalOverflowHtml = document.documentElement.style.overflow;
      const originalOverflowBody = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = originalOverflowHtml;
        document.body.style.overflow = originalOverflowBody;
      };
    }
  }, [editingTool]);

  const fetchUserTools = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await db.getUserTools(user.id);
      setUserTools(data);
    } catch (err) {
      console.error('Error fetching user tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = () => {
    if (!user) return;
    const noticesKey = `findai_notices_${user.id}`;
    const dataStr = localStorage.getItem(noticesKey);
    if (dataStr) {
      try {
        setNotices(JSON.parse(dataStr));
      } catch (e) {
        setNotices([]);
      }
    } else {
      setNotices([]);
    }
  };

  const handleDismissNotice = (noticeId: string) => {
    const updated = notices.filter((n) => n.id !== noticeId);
    setNotices(updated);
    if (user) {
      const noticesKey = `findai_notices_${user.id}`;
      localStorage.setItem(noticesKey, JSON.stringify(updated));
    }
  };

  useEffect(() => {
    fetchUserTools();
    fetchNotices();
    window.scrollTo(0, 0);
  }, [user]);

  const handleStartEdit = (tool: AITool) => {
    setEditingTool(tool);
    setEditName(tool.name);
    setEditTagline(tool.tagline);
    setEditWebsiteUrl(tool.websiteUrl);
    setEditCategory(tool.category);
    setEditPricingType(tool.pricingType);
    setEditPriceRange(tool.priceRange);
    setEditFeatures(tool.features.join(', '));
    setEditUseCases(tool.useCases.join(', '));
    setEditPlatforms(tool.platforms);
    setEditDescription(tool.description);
    setSaveError('');
  };

  const handlePlatformToggle = (platform: string) => {
    setEditPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    if (!editName.trim() || !editTagline.trim() || !editWebsiteUrl.trim() || !editDescription.trim()) {
      setSaveError('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    setSaveError('');

    const features = editFeatures
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    const useCases = editUseCases
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    try {
      await db.updateTool(editingTool.id, {
        name: editName.trim(),
        tagline: editTagline.trim(),
        websiteUrl: editWebsiteUrl.trim(),
        category: editCategory,
        pricingType: editPricingType,
        priceRange: editPriceRange.trim(),
        features: features.length > 0 ? features : ['AI Assistance'],
        useCases: useCases.length > 0 ? useCases : ['General AI Usage'],
        platforms: editPlatforms.length > 0 ? editPlatforms : ['Web'],
        description: editDescription.trim()
      });

      setEditingTool(null);
      await fetchUserTools();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update tool details.');
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteTool = async (toolId: string) => {
    // Save previous state for rollback
    const previousTools = [...userTools];

    // Optimistically update UI state
    setUserTools((prev) => prev.filter((t) => t.id !== toolId));

    try {
      await db.deleteTool(toolId);
      await fetchUserTools();
    } catch (err: any) {
      console.error('Failed to delete tool:', err);
      setAlertTitle("Deletion Failed");
      setAlertMessage(err.message || 'Failed to delete tool. Please try again.');
      setAlertOpen(true);
      // Rollback UI state on failure
      setUserTools(previousTools);
    }
  };

  if (!user) {
    return (
      <main className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel neon-border text-center" style={{ maxWidth: '400px', padding: '30px' }}>
          <ShieldAlert size={40} color="var(--accent-rose)" style={{ marginBottom: 16 }} />
          <h3 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>Access Denied</h3>
          <p className="text-secondary" style={{ margin: '12px 0 20px 0', fontSize: '0.9rem' }}>
            Please sign in to view your developer profile dashboard.
          </p>
          <button className="btn-primary" onClick={onNavigateHome}>Back to Homepage</button>
        </div>
      </main>
    );
  }

  return (
    <main className="container scale-up" style={{ minHeight: '80vh', paddingTop: '110px', paddingBottom: '80px' }}>
      {/* Back button */}
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
        <span>Back to Directory</span>
      </button>

      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Sidebar Info Card */}
        <aside 
          className="profile-sidebar-card card-3d" 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Decorative Card top banner */}
          <div className="profile-card-banner" />
          
          <div className="profile-card-avatar-wrapper">
            <div className="profile-card-avatar">
              {user.user_metadata?.name ? user.user_metadata.name.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="profile-card-info">
            <h4 className="profile-card-name">
              {user.user_metadata?.name || 'Developer User'}
            </h4>
            <span className="profile-card-tag">
              <Sparkles size={10} style={{ marginRight: 2 }} />
              <span>FindAI Publisher</span>
            </span>
          </div>

          <div className="profile-card-meta">
            <div className="profile-meta-item">
              <div className="profile-meta-icon">
                <User size={14} />
              </div>
              <div className="profile-meta-details">
                <span className="profile-meta-label">Publisher ID</span>
                <span className="profile-meta-value">{user.id.substring(0, 8)}...</span>
              </div>
            </div>

            <div className="profile-meta-item">
              <div className="profile-meta-icon">
                <Mail size={14} />
              </div>
              <div className="profile-meta-details">
                <span className="profile-meta-label">Verified Email</span>
                <span className="profile-meta-value" title={user.email}>{user.email}</span>
              </div>
            </div>

            <div className="profile-meta-item">
              <div className="profile-meta-icon">
                <Database size={14} />
              </div>
              <div className="profile-meta-details">
                <span className="profile-meta-label">Listed Products</span>
                <span className="profile-meta-value">{userTools.length} tools</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Listings Panel */}
        <section className="profile-listings-panel">
          {/* Profile Notices Section */}
          {notices.length > 0 && (
            <div 
              className="glass-panel neon-border" 
              style={{ 
                padding: '20px 24px', 
                marginBottom: '24px', 
                background: 'rgba(245, 158, 11, 0.02)', 
                borderColor: 'rgba(245, 158, 11, 0.15)',
                borderRadius: '12px'
              }}
            >
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-amber)', margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>
                <ShieldAlert size={18} />
                <span>Verification Notices ({notices.length})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notices.map((notice) => (
                  <div 
                    key={notice.id} 
                    style={{ 
                      padding: '12px 16px', 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      borderLeft: '3px solid var(--accent-amber)', 
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.85rem',
                      position: 'relative'
                    }}
                  >
                    <button 
                      onClick={() => handleDismissNotice(notice.id)}
                      style={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-muted)', 
                        cursor: 'pointer',
                        padding: 4
                      }}
                      className="btn-hover-white"
                      title="Dismiss Notice"
                    >
                      <X size={14} />
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, paddingRight: 20 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{notice.toolName} ({notice.websiteUrl})</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, paddingRight: 20 }}>
                      {notice.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel neon-border scale-up" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <h3 className="section-title" style={{ fontSize: '1.4rem', borderBottom: 'none', paddingBottom: 0, margin: 0 }}>
                  Your AI Tool Submissions
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
                  Monitor status, edit configuration details, or view product pages of your listings.
                </p>
              </div>
              {userTools.length > 0 && (
                <button 
                  className="btn-primary" 
                  onClick={onNavigateToSubmit}
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  List a New Tool
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin-glow 1s infinite linear' }} />
              </div>
            ) : userTools.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                <p className="text-secondary" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  You haven't listed any AI tools yet.
                </p>
                <button className="btn-primary" onClick={onNavigateToSubmit}>List a New Tool</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {userTools.map((tool) => (
                  <div 
                    key={tool.id} 
                    className="user-tool-row" 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '16px 20px', 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid var(--glass-border)', 
                      borderRadius: '10px',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{tool.name}</h4>
                        <span 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            fontWeight: 600,
                            background: tool.approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: tool.approved ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                          }}
                        >
                          {tool.approved ? 'Approved' : 'Pending Review'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>{tool.tagline}</p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleStartEdit(tool)}
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.8rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 6,
                          color: 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => { setDeleteToolTarget({ id: tool.id, name: tool.name }); setDeleteConfirmOpen(true); }}
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.8rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6,
                          background: 'rgba(244, 63, 94, 0.05)',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                          borderRadius: 6,
                          color: 'var(--accent-rose)',
                          cursor: 'pointer'
                        }}
                        className="btn-hover-rose"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                      <a 
                        href={tool.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.8rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6,
                          background: 'none',
                          border: '1px solid transparent',
                          borderRadius: 6,
                          color: 'var(--text-muted)',
                          textDecoration: 'none'
                        }}
                        className="btn-hover-white"
                      >
                        <ExternalLink size={12} />
                        <span>Visit</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Inline edit Modal Overlay */}
      {editingTool && (
        <div className="modal-overlay" onClick={() => setEditingTool(null)} data-lenis-prevent>
          <div 
            className="modal-content glass-panel neon-border submit-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '720px' }}
          >
            <button className="modal-close-btn" onClick={() => setEditingTool(null)}>
              <X size={18} />
            </button>

            <h3 className="section-title" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 8, border: 'none', padding: 0 }}>
              <Edit size={18} color="var(--primary)" />
              <span>Edit Details for {editingTool.name}</span>
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Modify the specifications of your product below. Changes are saved instantly.
            </p>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="editName">Product Name *</label>
                  <input
                    id="editName"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editUrl">Website URL *</label>
                  <input
                    id="editUrl"
                    type="url"
                    required
                    value={editWebsiteUrl}
                    onChange={(e) => setEditWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="editTagline">Short Tagline *</label>
                <input
                  id="editTagline"
                  type="text"
                  required
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="editCat">Category *</label>
                  <select
                    id="editCat"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as AITool['category'])}
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
                  <label htmlFor="editPriceModel">Pricing Type *</label>
                  <select
                    id="editPriceModel"
                    value={editPricingType}
                    onChange={(e) => setEditPricingType(e.target.value as AITool['pricingType'])}
                  >
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Free Trial">Free Trial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="editPrice">Price Range Details</label>
                <input
                  id="editPrice"
                  type="text"
                  value={editPriceRange}
                  onChange={(e) => setEditPriceRange(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="editFeats">Key Features (comma-separated)</label>
                  <input
                    id="editFeats"
                    type="text"
                    value={editFeatures}
                    onChange={(e) => setEditFeatures(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editUses">Use Cases (comma-separated)</label>
                  <input
                    id="editUses"
                    type="text"
                    value={editUseCases}
                    onChange={(e) => setEditUseCases(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ marginBottom: 8, display: 'block' }}>Supported Platforms</label>
                <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {platformsOptions.map((plat) => (
                    <label key={plat} className="filter-checkbox-label" style={{ fontSize: '0.8rem' }}>
                      <input
                        type="checkbox"
                        checked={editPlatforms.includes(plat)}
                        onChange={() => handlePlatformToggle(plat)}
                      />
                      <span>{plat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="editDesc">Detailed Description *</label>
                <textarea
                  id="editDesc"
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ height: 100, resize: 'vertical' }}
                />
              </div>

              {saveError && (
                <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>{saveError}</p>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setEditingTool(null)}
                  style={{ 
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 6 }}
                >
                  {saving ? 'Saving...' : <><Save size={14} /><span>Save Changes</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete AI Product"
        message={deleteToolTarget ? `Are you sure you want to permanently delete the AI product "${deleteToolTarget.name}"? This action cannot be undone.` : ''}
        confirmText="Permanently Delete"
        cancelText="Keep Product"
        onConfirm={() => {
          if (deleteToolTarget) {
            executeDeleteTool(deleteToolTarget.id);
          }
          setDeleteConfirmOpen(false);
          setDeleteToolTarget(null);
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteToolTarget(null);
        }}
        type="confirm"
      />

      {/* Custom Alert Modal */}
      <ConfirmModal
        isOpen={alertOpen}
        title={alertTitle}
        message={alertMessage}
        confirmText="OK"
        onConfirm={() => setAlertOpen(false)}
        type="alert"
      />
    </main>
  );
};
