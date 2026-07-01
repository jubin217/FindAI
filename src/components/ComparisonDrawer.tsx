import React from 'react';
import { X, GitCompare } from 'lucide-react';
import type { AITool } from '../data/tools';

interface ComparisonDrawerProps {
  selectedTools: AITool[];
  onRemove: (toolId: string) => void;
  onClear: () => void;
  onCompareClick: () => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  selectedTools,
  onRemove,
  onClear,
  onCompareClick
}) => {
  const isVisible = selectedTools.length > 0;

  return (
    <div className={`compare-drawer glass-panel ${isVisible ? 'show' : ''}`}>
      <div className="drawer-items">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8, color: 'var(--secondary)' }}>
          <GitCompare size={18} />
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Compare ({selectedTools.length}/3)</span>
        </div>
        
        {selectedTools.map((tool) => (
          <div key={tool.id} className="drawer-item">
            <span>{tool.name}</span>
            <X 
              size={12} 
              className="drawer-remove-btn" 
              onClick={() => onRemove(tool.id)} 
            />
          </div>
        ))}
      </div>

      <div className="drawer-cta">
        <button 
          onClick={onClear}
          style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
        >
          Clear All
        </button>
        <button 
          className="btn-primary" 
          disabled={selectedTools.length < 2}
          onClick={onCompareClick}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '8px', 
            fontSize: '0.8rem',
            opacity: selectedTools.length < 2 ? 0.5 : 1,
            cursor: selectedTools.length < 2 ? 'not-allowed' : 'pointer'
          }}
        >
          Compare Now
        </button>
      </div>
    </div>
  );
};
