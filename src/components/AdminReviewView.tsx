import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ExternalLink, Trash2, ShieldAlert, Lock, ArrowLeft, RefreshCw, Eye } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { db, isAdmin } from '../lib/supabaseClient';
import type { AITool } from '../data/tools';

interface AdminReviewViewProps {
  user: any;
  tools: AITool[];
  onRefresh: () => Promise<void>;
  onNavigateHome: () => void;
}

export const AdminReviewView: React.FC<AdminReviewViewProps> = ({
  user,
  tools,
  onRefresh,
  onNavigateHome
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Custom Confirm modal states
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [rejectToolTarget, setRejectToolTarget] = useState<{ id: string; name: string } | null>(null);

  // Validate admin access
  const isUserAdmin = isAdmin(user);

  if (!user) {
    return (
      <main className="container" style={{ minHeight: '85vh', display: 'grid', placeItems: 'center' }}>
        <div className="glass-panel text-center fade-in animated" style={{ padding: '48px 32px', maxWidth: 440, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <Lock size={24} color="var(--accent-rose)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Administrator Authentication Required</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            This page contains restricted moderation settings for FindAI.store. Please sign in with an administrator account to continue.
          </p>
          <button className="btn-primary" onClick={onNavigateHome} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', width: '100%', justifyContent: 'center' }}>
            <ArrowLeft size={16} />
            <span>Go Back to Directory</span>
          </button>
        </div>
      </main>
    );
  }

  if (!isUserAdmin) {
    return (
      <main className="container" style={{ minHeight: '85vh', display: 'grid', placeItems: 'center' }}>
        <div className="glass-panel text-center fade-in animated" style={{ padding: '48px 32px', maxWidth: 440, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <ShieldAlert size={24} color="var(--accent-rose)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Access Denied</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            You are signed in as <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong>, which does not have administrator privileges.
          </p>
          <button className="btn-primary" onClick={onNavigateHome} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', width: '100%', justifyContent: 'center' }}>
            <ArrowLeft size={16} />
            <span>Go Back to Directory</span>
          </button>
        </div>
      </main>
    );
  }

  // Filter tools based on approval status
  // Note: Seeded famous tools have approved = true. Submitted tools have approved = false.
  const pendingQueue = tools.filter(t => !t.approved);
  const approvedList = tools.filter(t => t.approved);

  const handleApprove = async (toolId: string) => {
    setLoading(true);
    setActionMessage(null);
    try {
      await db.updateTool(toolId, { approved: true });
      setActionMessage({ type: 'success', text: 'Tool successfully approved and published!' });
      await onRefresh();
    } catch (err) {
      console.error(err);
      setActionMessage({ type: 'error', text: 'Failed to approve tool. Check console logs.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (toolId: string) => {
    setLoading(true);
    setActionMessage(null);
    try {
      await db.updateTool(toolId, { approved: false });
      setActionMessage({ type: 'success', text: 'Tool approval successfully revoked and moved to queue.' });
      await onRefresh();
    } catch (err) {
      console.error(err);
      setActionMessage({ type: 'error', text: 'Failed to revoke approval.' });
    } finally {
      setLoading(false);
    }
  };

  const executeReject = async (toolId: string) => {
    setLoading(true);
    setActionMessage(null);
    try {
      await db.deleteTool(toolId);
      setActionMessage({ type: 'success', text: 'Tool submission rejected and deleted.' });
      await onRefresh();
    } catch (err) {
      console.error(err);
      setActionMessage({ type: 'error', text: 'Failed to delete tool.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container scale-up animated" style={{ paddingTop: '110px', paddingBottom: 60, minHeight: '80vh' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16, flexWrap: 'wrap' }} className="fade-in animated">
        <div>
          <button 
            onClick={onNavigateHome}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', marginBottom: 8, padding: 0 }}
          >
            <ArrowLeft size={14} />
            <span>Back to directory</span>
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Admin Control Panel</span>
            <span className="badge-category" style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--secondary)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              Moderator
            </span>
          </h1>
        </div>

        <button 
          className="btn-secondary" 
          onClick={onRefresh} 
          disabled={loading} 
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin-glow' : ''} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Action Notification Toast banner */}
      {actionMessage && (
        <div 
          className={`glass-panel slide-in-top animated`} 
          style={{ 
            padding: '12px 20px', 
            marginBottom: 24, 
            borderColor: actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            background: actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {actionMessage.type === 'success' ? (
              <CheckCircle size={18} color="var(--accent-emerald)" />
            ) : (
              <AlertTriangle size={18} color="var(--accent-rose)" />
            )}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{actionMessage.text}</span>
          </div>
          <button 
            onClick={() => setActionMessage(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', padding: 0 }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16, marginBottom: 28 }} className="fade-in animated">
        <button
          onClick={() => { setActiveTab('pending'); setActionMessage(null); }}
          className={`category-badge ${activeTab === 'pending' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', padding: '8px 16px', background: activeTab === 'pending' ? 'var(--primary)' : 'rgba(255,255,255,0.02)' }}
        >
          Pending Review Queue ({pendingQueue.length})
        </button>
        <button
          onClick={() => { setActiveTab('approved'); setActionMessage(null); }}
          className={`category-badge ${activeTab === 'approved' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', padding: '8px 16px', background: activeTab === 'approved' ? 'var(--primary)' : 'rgba(255,255,255,0.02)' }}
        >
          Live Published Catalog ({approvedList.length})
        </button>
      </div>

      {/* Grid displays */}
      {activeTab === 'pending' ? (
        pendingQueue.length === 0 ? (
          <div className="glass-panel text-center fade-in animated" style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <CheckCircle size={40} color="var(--accent-emerald)" style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Moderation Queue Clean!</h3>
            <p className="text-secondary" style={{ maxWidth: 420, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              All submitted tools have been reviewed. There are no pending submissions awaiting approval.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="fade-in animated">
            {pendingQueue.map((tool) => (
              <div 
                key={tool.id} 
                className="glass-panel tool-item-hover" 
                style={{ 
                  padding: 24, 
                  display: 'grid', 
                  gridTemplateColumns: '1fr auto', 
                  gap: 20, 
                  alignItems: 'center',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  background: 'rgba(255, 255, 255, 0.01)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tool.name}</h3>
                    <span className="badge-category">{tool.category}</span>
                    <span className="badge-pricing">{tool.pricingType}</span>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 12 }}>{tool.tagline}</p>
                  
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Price Range: <strong style={{ color: 'var(--text-primary)' }}>{tool.priceRange || 'N/A'}</strong></span>
                    <span>Website: <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>{tool.websiteUrl.substring(0, 30)}... <ExternalLink size={10} /></a></span>
                    {tool.userId && <span>Submitted by ID: <code style={{ color: '#ec4899', fontSize: '0.75rem' }}>{tool.userId.substring(0, 8)}...</code></span>}
                  </div>

                  <div style={{ marginTop: 14, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 6, fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Full Description:</strong>
                    <span className="text-secondary">{tool.description}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 120 }}>
                  <button 
                    onClick={() => handleApprove(tool.id)}
                    disabled={loading}
                    className="btn-primary" 
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', width: '100%', padding: '10px', fontSize: '0.85rem' }}
                  >
                    Approve & Publish
                  </button>
                  <button 
                    onClick={() => { setRejectToolTarget({ id: tool.id, name: tool.name }); setRejectConfirmOpen(true); }}
                    disabled={loading}
                    className="btn-secondary" 
                    style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)', width: '100%', padding: '10px', fontSize: '0.85rem' }}
                  >
                    Reject (Delete)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        approvedList.length === 0 ? (
          <div className="glass-panel text-center fade-in animated" style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <AlertTriangle size={40} color="var(--text-muted)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>No Approved Tools</h3>
            <p className="text-secondary" style={{ maxWidth: 420, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              There are no published tools in the catalog database. Run the sync command to seed famous tools.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-in animated">
            {approvedList.map((tool) => (
              <div 
                key={tool.id} 
                className="glass-panel" 
                style={{ 
                  padding: '16px 20px', 
                  display: 'grid', 
                  gridTemplateColumns: '1fr auto', 
                  gap: 16, 
                  alignItems: 'center',
                  borderColor: 'rgba(255, 255, 255, 0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{tool.name}</strong>
                    <span className="badge-category" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{tool.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({tool.clicks || 0} clicks • {tool.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                    {tool.tagline}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => handleRevoke(tool.id)}
                    disabled={loading}
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Eye size={12} />
                    <span>Revoke (Hide)</span>
                  </button>
                  <button 
                    onClick={() => { setRejectToolTarget({ id: tool.id, name: tool.name }); setRejectConfirmOpen(true); }}
                    disabled={loading}
                    className="btn-secondary" 
                    style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Custom Reject/Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={rejectConfirmOpen}
        title="Delete/Reject Submission"
        message={rejectToolTarget ? `Are you sure you want to permanently delete and reject the submission "${rejectToolTarget.name}"? This action cannot be undone.` : ''}
        confirmText="Permanently Reject"
        cancelText="Cancel"
        onConfirm={() => {
          if (rejectToolTarget) {
            executeReject(rejectToolTarget.id);
          }
          setRejectConfirmOpen(false);
          setRejectToolTarget(null);
        }}
        onCancel={() => {
          setRejectConfirmOpen(false);
          setRejectToolTarget(null);
        }}
        type="confirm"
      />
    </main>
  );
};
