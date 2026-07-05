import React from 'react';
import { X, ShieldAlert, Calendar } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface AttributionModalProps {
  onClose: () => void;
}

export const AttributionModal: React.FC<AttributionModalProps> = ({ onClose }) => {
  useLockBodyScroll();

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }} data-lenis-prevent>
      <div 
        className="modal-content glass-panel neon-border attribution-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '800px', 
          width: '90%', 
          maxHeight: '85vh', 
          overflowY: 'auto',
          padding: '40px 32px',
          position: 'relative'
        }}
      >
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Attribution & Trademark Notice</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <Calendar size={12} />
              <span>Last Updated: June 23, 2026</span>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="attribution-body text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          <p>
            FindAI is an independent artificial intelligence discovery and information platform.
          </p>
          <p style={{ marginTop: 10 }}>
            The Services may display references to third-party companies, products, services, applications, logos, trademarks, service marks, trade names, and other proprietary materials for purposes including, but not limited to:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 10, listStyleType: 'disc' }}>
            <li>Identification and attribution;</li>
            <li>Search, indexing, and categorization;</li>
            <li>Product discovery and comparison;</li>
            <li>Commentary, review, and informational reporting;</li>
            <li>Market analysis and trend reporting;</li>
            <li>Editorial and educational content.</li>
          </ul>

          <p style={{ marginTop: 16 }}>
            All trademarks, service marks, logos, trade names, product names, and other proprietary rights appearing on the Services are the property of their respective owners.
          </p>

          <div 
            className="glass-panel" 
            style={{ 
              marginTop: 20, 
              marginBottom: 20, 
              padding: '16px 20px', 
              background: 'rgba(244, 63, 94, 0.02)', 
              borderColor: 'rgba(244, 63, 94, 0.15)',
              borderRadius: '10px' 
            }}
          >
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
              Unless expressly stated otherwise, the appearance of any third-party names, trademarks, logos, products, or services on FindAI does NOT imply:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'circle', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <li>Ownership by FindAI;</li>
              <li>Sponsorship of FindAI;</li>
              <li>Affiliation with FindAI;</li>
              <li>Partnership with FindAI;</li>
              <li>Endorsement of FindAI;</li>
              <li>Approval of FindAI's products, services, rankings, methodologies, opinions, or content.</li>
            </ul>
          </div>

          <p style={{ marginTop: 16 }}>
            Information regarding third-party products and services may be collected, aggregated, summarized, or generated from publicly available sources, including official websites, public documentation, product announcements, news publications, public repositories, public APIs, and other publicly accessible information sources.
          </p>
          
          <p style={{ marginTop: 10 }}>
            All descriptions, rankings, recommendations, scores, comparisons, and analyses available on FindAI are provided solely for informational purposes and may be based on automated systems, editorial processes, publicly available information, or proprietary methodologies. Such information may not always be complete, accurate, or current.
          </p>

          <p style={{ marginTop: 16 }}>
            If you are a trademark owner or authorized representative and believe that any content on FindAI inaccurately represents your product, improperly attributes intellectual property, or otherwise raises concerns regarding your rights, please contact us at:
          </p>

          <div style={{ marginTop: 12, background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--glass-border)', padding: '16px 20px', borderRadius: '10px', display: 'inline-block' }}>
            <span>Email: </span><a href="mailto:support@findai.store" style={{ color: 'var(--primary)', fontWeight: 600 }}>legal@findai.store</a>
          </div>

          <p style={{ marginTop: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            © FindAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
