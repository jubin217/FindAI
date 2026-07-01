import React from 'react';
import { Star, GitCompare } from 'lucide-react';
import type { AITool } from '../data/tools';

interface ToolCardProps {
  tool: AITool;
  onClick: () => void;
  isComparing: boolean;
  onCompareToggle: (e: React.MouseEvent) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onClick,
  isComparing,
  onCompareToggle
}) => {
  // High-end mouse-glow & 3D tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // Calculate tilt values (-12 to +12 degrees max)
    const tiltX = ((y / height) - 0.5) * -12;
    const tiltY = ((x / width) - 0.5) * 12;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--tilt-x', `${tiltX}deg`);
    card.style.setProperty('--tilt-y', `${tiltY}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };

  // Helper to format pricing badge styling class
  const getPricingClass = (type: AITool['pricingType']) => {
    switch (type) {
      case 'Free': return 'free';
      case 'Freemium': return 'freemium';
      case 'Paid': return 'paid';
      case 'Free Trial': return 'freetrial';
      default: return '';
    }
  };

  // Render initial letters as brand logo if no image url is provided (looks extremely modern)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Custom styling colors for cards based on category
  const getCategoryColor = (cat: AITool['category']) => {
    switch (cat) {
      case 'Coding': return '#10b981'; // emerald
      case 'Writing': return '#8b5cf6'; // violet
      case 'Image Generation': return '#06b6d4'; // cyan
      case 'Video Editing': return '#f43f5e'; // rose
      case 'Marketing': return '#ec4899'; // pink
      case 'Productivity': return '#3b82f6'; // blue
      case 'Education': return '#f59e0b'; // amber
      case 'Customer Support': return '#a855f7'; // purple
      case 'Data Analytics': return '#14b8a6'; // teal
      default: return 'var(--primary)';
    }
  };

  return (
    <div
      className="tool-card glass-panel neon-border scroll-animate"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow overlay */}
      <div className="card-glow-bg" />

      <div className="tool-card-content">
        {/* Header containing Logo & Tags */}
        <div className="card-header">
          <div 
            className="tool-logo-badge" 
            style={{ 
              borderColor: `${getCategoryColor(tool.category)}33`,
              boxShadow: `0 0 12px ${getCategoryColor(tool.category)}1a`,
              color: getCategoryColor(tool.category)
            }}
          >
            {getInitials(tool.name)}
          </div>
          <div className="card-tag-wrapper">
            <span className="tag-cat">{tool.category}</span>
            <span className={`pricing-badge ${getPricingClass(tool.pricingType)}`}>
              {tool.pricingType}
            </span>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="tool-card-title">{tool.name}</h3>
        <p className="tool-card-tagline">{tool.tagline}</p>

        {/* Ratings block */}
        <div className="rating-row">
          <div className="stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.round(tool.rating) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span style={{ fontWeight: 600 }}>{tool.rating.toFixed(1)}</span>
          <span className="review-cnt">({tool.reviewCount})</span>
        </div>

        {/* Footer actions */}
        <div className="card-footer" onClick={(e) => e.stopPropagation()}>
          {/* Compare toggle */}
          <div 
            className="compare-checkbox-trigger"
            onClick={(e) => onCompareToggle(e)}
            style={{ 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              color: isComparing ? 'var(--secondary)' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)'
            }}
          >
            <GitCompare size={16} />
            <span>{isComparing ? 'Comparing' : 'Compare'}</span>
          </div>

          {/* Details CTA */}
          <button className="details-btn" onClick={onClick}>
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
