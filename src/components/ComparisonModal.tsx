import React from 'react';
import { X, Check, Globe } from 'lucide-react';
import type { AITool } from '../data/tools';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { db } from '../lib/supabaseClient';

interface ComparisonModalProps {
  selectedTools: AITool[];
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  selectedTools,
  onClose
}) => {
  useLockBodyScroll();

  // Aggregate all unique features from the compared tools
  const uniqueFeatures = Array.from(
    new Set(selectedTools.flatMap((t) => t.features))
  ).slice(0, 8); // limit to top 8 unique features for clean display

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
        className="modal-content glass-panel neon-border compare-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close trigger */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <h3 className="section-title" style={{ fontSize: '1.6rem', marginBottom: 6 }}>Tool Comparison</h3>
        <p className="text-secondary" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Side-by-side evaluation of features, ratings, platforms, and pricing details.
        </p>

        {/* Spec table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="compare-grid-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Specifications</th>
                {selectedTools.map((tool) => (
                  <th key={tool.id} className="compare-column-header" style={{ width: `${75 / selectedTools.length}%` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div 
                        style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 8, 
                          background: 'var(--bg-dark-800)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          border: '1px solid var(--glass-border)'
                        }}
                      >
                        {getInitials(tool.name)}
                      </div>
                      <span className="compare-tool-name">{tool.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row: Category */}
              <tr>
                <td><strong>Category</strong></td>
                {selectedTools.map((tool) => (
                  <td key={tool.id} className="compare-value">
                    <span className="tag-cat">{tool.category}</span>
                  </td>
                ))}
              </tr>

              {/* Row: Pricing */}
              <tr>
                <td><strong>Pricing Tier</strong></td>
                {selectedTools.map((tool) => (
                  <td key={tool.id} className="compare-value">
                    <span style={{ fontWeight: 600, color: 'white' }}>{tool.pricingType}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {tool.priceRange}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Free Trial Availability */}
              <tr>
                <td><strong>Free Trial Available</strong></td>
                {selectedTools.map((tool) => {
                  const hasFreeTrial = tool.pricingType === 'Free Trial' || 
                    tool.pricingType === 'Freemium' || 
                    tool.pricingType === 'Free' || 
                    tool.priceRange.toLowerCase().includes('trial');
                  return (
                    <td key={tool.id} className="compare-value">
                      {hasFreeTrial ? (
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Yes</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Ratings */}
              <tr>
                <td><strong>Users Rating</strong></td>
                {selectedTools.map((tool) => (
                  <td key={tool.id} className="compare-value">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{tool.rating.toFixed(1)}</span>
                      <span style={{ color: 'var(--accent-amber)' }}>★</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({tool.reviewCount} reviews)
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Platforms */}
              <tr>
                <td><strong>Platforms</strong></td>
                {selectedTools.map((tool) => (
                  <td key={tool.id} className="compare-value">
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {tool.platforms.map((p, idx) => (
                        <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Rows: Dynamic Feature Comparisons */}
              {uniqueFeatures.map((feat) => (
                <tr key={feat}>
                  <td>{feat}</td>
                  {selectedTools.map((tool) => {
                    const hasFeature = tool.features.includes(feat);
                    return (
                      <td key={tool.id} className="compare-value">
                        {hasFeature ? (
                          <Check size={18} color="var(--accent-emerald)" style={{ margin: '0 auto' }} />
                        ) : (
                          <X size={20} color="var(--accent-rose)" style={{ margin: '0 auto' }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Row: CTA links */}
              <tr>
                <td><strong>Action</strong></td>
                {selectedTools.map((tool) => (
                  <td key={tool.id} className="compare-value">
                    <a 
                      href={tool.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-primary"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '0.8rem', 
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onClick={async () => {
                        await db.recordClick(tool.id);
                      }}
                    >
                      <Globe size={12} />
                      <span>Visit Site</span>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
