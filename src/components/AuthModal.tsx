import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, Sparkles, Database } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Prevent background scrolling
  useLockBodyScroll();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;

    if (activeTab === 'signup' && !agreed) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'signin') {
        const { error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        onSuccess?.();
        onClose();
      } else {
        const { error } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName,
            },
          },
        });
        if (error) throw error;

        setSuccessMsg('Registration successful! Please check your email inbox to verify your account.');
        // Clear inputs
        setFullName('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) return;

    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await supabase!.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize Google login.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-lenis-prevent>
      <div 
        className="modal-content glass-panel auth-modal-content neon-border" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', padding: '36px 28px' }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="logo-icon" style={{ margin: '0 auto 12px auto', width: '44px', height: '44px' }}>
            <Sparkles size={22} color="var(--primary)" />
          </div>
          <h3 className="section-title" style={{ fontSize: '1.4rem', margin: 0 }}>
            {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {activeTab === 'signin' ? 'Sign in to access submissions & write reviews' : 'Join FindAI to share and discover AI tools'}
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
            <Database size={24} color="var(--accent-rose)" style={{ marginBottom: 8 }} />
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 4 }}>Supabase Keys Missing</h4>
            <p className="text-secondary" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              To enable real authentication, you must configure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in your <code>.env</code> file.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              >
                Register
              </button>
            </div>

            {/* Error / Success Messages */}
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, padding: 10, fontSize: '0.8rem', color: '#ef4444', marginBottom: 16 }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 8, padding: 10, fontSize: '0.8rem', color: '#10b981', marginBottom: 16 }}>
                {successMsg}
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeTab === 'signup' && (
                <div className="form-group" style={{ gap: 6 }}>
                  <label htmlFor="authName" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      id="authName"
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ paddingLeft: 34 }}
                    />
                  </div>
                </div>
              )}

              <div className="form-group" style={{ gap: 6 }}>
                <label htmlFor="authEmail" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="authEmail"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: 34 }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ gap: 6 }}>
                <label htmlFor="authPassword" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="authPassword"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ paddingLeft: 34 }}
                  />
                </div>
              </div>

              {activeTab === 'signup' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '4px 0' }}>
                  <input
                    id="agreeCheckbox"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    required
                    style={{ marginTop: 4, width: 'auto', height: 'auto', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <label htmlFor="agreeCheckbox" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                    I agree to the Terms of Service and Privacy Policy.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px',
                  marginTop: 8,
                  fontSize: '0.9rem'
                }}
              >
                {activeTab === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
                <span>
                  {loading 
                    ? 'Processing...' 
                    : activeTab === 'signin' 
                      ? 'Sign In' 
                      : 'Create Account'
                  }
                </span>
              </button>
            </form>

            {/* Social Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px 0', gap: 10 }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            </div>

            {/* Google OAuth Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                padding: '10px',
                fontSize: '0.85rem'
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
