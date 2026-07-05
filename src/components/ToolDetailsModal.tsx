import React, { useState } from 'react';
import { X, Star, Check, Globe, MessageSquare, Send, LogIn } from 'lucide-react';
import type { AITool } from '../data/tools';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { db } from '../lib/supabaseClient';

interface ToolDetailsModalProps {
  tool: AITool;
  onClose: () => void;
  allTools: AITool[];
  onReviewAdded: () => void;
  onAlternativeClick: (tool: AITool) => void;
  user: any;
  onAuthRequired: () => void;
}

export const ToolDetailsModal: React.FC<ToolDetailsModalProps> = ({
  tool,
  onClose,
  allTools,
  onReviewAdded,
  onAlternativeClick,
  user,
  onAuthRequired
}) => {
  // Review form states
  const [authorName, setAuthorName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-fill reviewer name when user is available
  React.useEffect(() => {
    if (user) {
      setAuthorName(user.user_metadata?.name || user.email?.split('@')[0] || '');
    } else {
      setAuthorName('');
    }
  }, [user]);

  // Prevent background scrolling
  useLockBodyScroll();

  // Find alternatives: tools in same category excluding current tool, limit to 3
  const alternatives = allTools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 3);

  // Compute rating breakdown (5-star down to 1-star)
  const ratingBreakdown = [0, 0, 0, 0, 0]; // Index 0 = 5 star, Index 4 = 1 star
  tool.reviews.forEach((rev) => {
    const starIdx = 5 - Math.round(rev.rating);
    if (starIdx >= 0 && starIdx < 5) {
      ratingBreakdown[starIdx]++;
    }
  });

  const totalReviews = tool.reviews.length;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!authorName.trim() || !commentText.trim()) {
      setSubmitError('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await db.addReview(tool.id, {
        author: authorName.trim(),
        rating: reviewRating,
        comment: commentText.trim(),
        userId: user.id
      });

      // Reset form on success
      setCommentText('');
      
      // Notify parent to refetch tools lists
      onReviewAdded();
    } catch (err) {
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-lenis-prevent>
      <div 
        className="modal-content glass-panel neon-border" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Hero details header */}
        <div className="details-header">
          <div className="details-logo">
            {getInitials(tool.name)}
          </div>
          <div className="details-title-row">
            <h2>{tool.name}</h2>
            <p className="details-tagline">{tool.tagline}</p>
          </div>
          <div>
            <a 
              href={tool.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={async () => {
                await db.recordClick(tool.id);
              }}
            >
              <Globe size={16} />
              <span>Visit Site</span>
            </a>
          </div>
        </div>

        {/* Content grids */}
        <div className="details-content-grid">
          {/* Main info panel */}
          <div>
            <h3 className="section-title">Overview</h3>
            <p className="details-desc">{tool.description}</p>

            <h3 className="section-title">Use Cases</h3>
            <div className="pill-list">
              {tool.useCases.map((use, idx) => (
                <span key={idx} className="pill-tag">{use}</span>
              ))}
            </div>

            <h3 className="section-title">Key Features</h3>
            <div className="features-check-grid">
              {tool.features.map((feat, idx) => (
                <div key={idx} className="feature-check-item">
                  <Check size={16} color="var(--accent-emerald)" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar facts info panel */}
          <div className="info-sidebar">
            <div className="info-card">
              <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: 12 }}>Product Details</h3>
              <div className="info-row">
                <span className="info-label">Category</span>
                <span className="info-val" style={{ color: 'var(--secondary)' }}>{tool.category}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Pricing Type</span>
                <span className="info-val">{tool.pricingType}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Price Range</span>
                <span className="info-val" style={{ fontSize: '0.85rem' }}>{tool.priceRange}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Platforms</span>
                <span className="info-val" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
                  {tool.platforms.map((p, i) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem' }}>{p}</span>
                  ))}
                </span>
              </div>
            </div>

            {/* Alternatives component */}
            {alternatives.length > 0 && (
              <div className="info-card" style={{ background: 'rgba(9, 13, 22, 0.4)' }}>
                <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: 12 }}>Alternatives</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {alternatives.map((alt) => (
                    <div 
                      key={alt.id} 
                      onClick={() => onAlternativeClick(alt)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        transition: 'all var(--transition-fast)'
                      }}
                      className="neon-border-hover-trigger"
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <div 
                        style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 6, 
                          background: 'var(--bg-dark-800)', 
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--secondary)'
                        }}
                      >
                        {getInitials(alt.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{alt.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rating: {alt.rating.toFixed(1)} ⭐</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32 }}>
          <h3 className="section-title">Ratings & Reviews</h3>
          
          <div className="reviews-breakdown">
            {/* Average score card */}
            <div className="rating-avg-card">
              <div className="rating-avg-num">{tool.rating.toFixed(1)}</div>
              <div className="stars" style={{ justifyContent: 'center', marginTop: 8, marginBottom: 4 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.round(tool.rating) ? 'currentColor' : 'none'} 
                  />
                ))}
              </div>
              <span className="review-cnt" style={{ fontSize: '0.8rem' }}>{totalReviews} reviews</span>
            </div>

            {/* Stars Progress bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ratingBreakdown.map((cnt, i) => {
                const percent = totalReviews > 0 ? (cnt / totalReviews) * 100 : 0;
                return (
                  <div key={i} className="rating-bar-row">
                    <span>{5 - i} star</span>
                    <div className="rating-bar-bg">
                      <div className="rating-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="details-content-grid">
            {/* Reviews feed */}
            <div>
              <div className="reviews-list">
                {tool.reviews.length === 0 ? (
                  <p className="text-muted" style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No reviews yet. Be the first to write a review!</p>
                ) : (
                  tool.reviews.map((rev) => (
                    <div key={rev.id} className="review-item">
                      <div className="review-meta">
                        <span className="review-author">{rev.author}</span>
                        <div className="stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i < rev.rating ? 'currentColor' : 'none'} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submit review Form */}
            <div>
              {user ? (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={16} />
                    <span>Write a Review</span>
                  </h4>
                  
                  <div className="form-group" style={{ gap: 4 }}>
                    <label htmlFor="revName">Name</label>
                    <input
                      id="revName"
                      type="text"
                      placeholder="Your name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      readOnly
                      style={{ opacity: 0.8, cursor: 'not-allowed', background: 'rgba(255,255,255,0.02)' }}
                    />
                  </div>

                  <div className="form-group" style={{ gap: 4 }}>
                    <label>Rating</label>
                    <div className="stars-rating-select">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        return (
                          <span
                            key={i}
                            className={starValue <= reviewRating ? 'selected' : ''}
                            onClick={() => setReviewRating(starValue)}
                          >
                            ★
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group" style={{ gap: 4 }}>
                    <label htmlFor="revComment">Review</label>
                    <textarea
                      id="revComment"
                      placeholder="Share your experience using this AI tool..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                  </div>

                  {submitError && (
                    <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem' }}>{submitError}</p>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10 }}
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                  </button>
                </form>
              ) : (
                <div 
                  className="glass-panel" 
                  style={{ 
                    padding: '30px 24px', 
                    textAlign: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 12,
                    background: 'rgba(255,255,255,0.01)',
                    borderColor: 'var(--glass-border)'
                  }}
                >
                  <MessageSquare size={24} style={{ color: 'var(--primary)' }} />
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>Write a Review</h4>
                  <p className="text-secondary" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 8px 0', maxWidth: '300px', lineHeight: 1.4 }}>
                    Share your experience using this AI tool. Sign in to rate this product and publish your review.
                  </p>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={onAuthRequired} 
                    style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <LogIn size={14} />
                    <span>Sign In to Review</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
