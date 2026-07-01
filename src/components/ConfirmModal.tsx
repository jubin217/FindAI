import React from 'react';
import { ShieldAlert, X, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void; // Optional for alerts
  type?: 'alert' | 'confirm';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'confirm'
}) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 6, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      className="fade-in animated"
    >
      <div 
        className="glass-panel neon-border scale-up animated"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative'
        }}
      >
        {/* Close Button top-right (only show if cancel is possible) */}
        {type === 'confirm' && onCancel && (
          <button 
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            className="btn-hover-white"
          >
            <X size={18} />
          </button>
        )}

        {/* Icon */}
        <div 
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: type === 'confirm' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.08)',
            border: type === 'confirm' ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(99, 102, 241, 0.15)',
            color: type === 'confirm' ? 'var(--accent-rose)' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4
          }}
        >
          {type === 'confirm' ? <ShieldAlert size={28} /> : <Info size={28} />}
        </div>

        {/* Text Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h3 className="section-title" style={{ fontSize: '1.25rem', border: 'none', margin: 0, padding: 0, justifyContent: 'center' }}>
            {title}
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 12 }}>
          {type === 'confirm' && onCancel && (
            <button 
              className="btn-secondary" 
              onClick={onCancel}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {cancelText}
            </button>
          )}
          
          <button 
            className="btn-primary btn-3d" 
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: type === 'confirm' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
              color: 'white',
              boxShadow: type === 'confirm' ? '0 4px 15px rgba(239, 68, 68, 0.2)' : '0 4px 15px rgba(99, 102, 241, 0.2)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
