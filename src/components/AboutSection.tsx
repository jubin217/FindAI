import React from 'react';
import { Sparkles, Zap, ArrowRight, ShieldCheck, Users, Compass, GitCompare, MessageSquare } from 'lucide-react';

interface AboutSectionProps {
  onNavigateToSubmit: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateToSubmit }) => {
  // Dynamic 3D tilt tracking for cards and panels
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // Calculate tilt values (-8 to +8 degrees max for larger panels)
    const tiltX = ((y / height) - 0.5) * -8;
    const tiltY = ((x / width) - 0.5) * 8;

    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
    el.style.setProperty('--tilt-x', `${tiltX}deg`);
    el.style.setProperty('--tilt-y', `${tiltY}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <section className="about-section scroll-animate">
      <div className="container">
        {/* About Header */}
        <div className="about-header text-center scroll-animate">
          <div className="about-badge">
            <Compass size={12} />
            <span>Our Mission</span>
          </div>
          <h2 className="about-title">
            Empowering Human Potential in the <span className="text-gradient">AI Era</span>
          </h2>
          <p className="about-subtitle text-secondary">
            FindAI is a curated, high-integrity discovery catalog designed to help creators, builders, and developers locate the perfect AI engine without the noise of the modern web.
          </p>
        </div>

        {/* 3D Bento Grid - Core Pillars */}
        <div className="bento-grid scroll-animate">
          {/* Card 1: col-span-2 */}
          <div 
            className="bento-item card-3d col-span-2"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
          >
            <div className="skeuo-screw" style={{ top: '10px', left: '10px' }} />
            <div className="skeuo-screw" style={{ top: '10px', right: '10px' }} />
            <div className="skeuo-screw" style={{ bottom: '10px', left: '10px' }} />
            <div className="skeuo-screw" style={{ bottom: '10px', right: '10px' }} />
            
            <div className="card-glow-bg" />
            <div className="bento-card-content">
              <span className="card-num">01 / CURATION INTEGRITY</span>
              <span className="card-icon"><ShieldCheck size={22} /></span>
              <h3>Quality Over Noise</h3>
              <p>
                The AI market is flooded with unverified wrappers and duplicate templates. FindAI manual-checks and filters every listing to ensure you only discover high-value, active, and fully functional tools.
              </p>
              <div className="card-bg-gradient blue-glow" />
            </div>
          </div>

          {/* Card 2: col-span-1 */}
          <div 
            className="bento-item card-3d"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
          >
            <div className="skeuo-screw" style={{ top: '10px', left: '10px' }} />
            <div className="skeuo-screw" style={{ top: '10px', right: '10px' }} />
            <div className="skeuo-screw" style={{ bottom: '10px', left: '10px' }} />
            <div className="skeuo-screw" style={{ bottom: '10px', right: '10px' }} />

            <div className="card-glow-bg" />
            <div className="bento-card-content">
              <span className="card-num">02 / COMPARE MATRIX</span>
              <span className="card-icon"><GitCompare size={22} /></span>
              <h3>Sandbox Comparisons</h3>
              <p>
                Evaluate pricing structures, core features, ratings, and platforms side-by-side inside our comparison drawer. Choose the right tool with absolute clarity.
              </p>
              <div className="card-bg-gradient silver-glow" />
            </div>
          </div>

          {/* Card 3: col-span-1 */}
          <div 
            className="bento-item card-3d"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
          >
            <div className="skeuo-screw" style={{ top: '10px', left: '10px' }} />
            <div className="skeuo-screw" style={{ top: '10px', right: '10px' }} />
            <div className="skeuo-screw" style={{ bottom: '10px', left: '10px' }} />
            <div className="skeuo-screw" style={{ bottom: '10px', right: '10px' }} />

            <div className="card-glow-bg" />
            <div className="bento-card-content">
              <span className="card-num">03 / ECHO SYSTEM</span>
              <span className="card-icon"><Users size={22} /></span>
              <h3>Supporting Indie Builders</h3>
              <p>
                We provide equal spotlight and visibility for independent indie creators and solo developers, alongside major tech conglomerates.
              </p>
              <div className="card-bg-gradient purple-glow" />
            </div>
          </div>

          {/* Card 4: col-span-2 */}
          <div 
            className="bento-item card-3d col-span-2"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
          >
            <div className="skeuo-screw" style={{ top: '10px', left: '10px' }} />
            <div className="skeuo-screw" style={{ top: '10px', right: '10px' }} />
            <div className="skeuo-screw" style={{ bottom: '10px', left: '10px' }} />
            <div className="skeuo-screw" style={{ bottom: '10px', right: '10px' }} />

            <div className="card-glow-bg" />
            <div className="bento-card-content">
              <span className="card-num">04 / WEBGL ORBIT</span>
              <span className="card-icon"><Sparkles size={22} /></span>
              <h3>Immersive 3D Space</h3>
              <p>
                Interact with hand-picked featured listings inside our responsive WebGL orbital core. Rotate, inspect card details dynamically, and access verified links directly.
              </p>
              <div className="card-bg-gradient blue-glow" />
            </div>
          </div>
        </div>

        {/* FindAI Genesis Story Timeline */}
        <div className="workflow-section scroll-animate" style={{ margin: '80px 0' }}>
          <h3 className="section-title" style={{ fontSize: '1.75rem', justifyContent: 'center', borderBottom: 'none', marginBottom: 40 }}>
            The Genesis of FindAI
          </h3>
          <div className="timeline">
            <div className="timeline-step">
              <div className="step-node">01</div>
              <div className="timeline-text-content">
                <h4>The AI Explosion</h4>
                <p>Generative intelligence explodes, launching thousands of new engines, models, and apps each week.</p>
              </div>
            </div>
            <div className="timeline-step">
              <div className="step-node">02</div>
              <div className="timeline-text-content">
                <h4>The Discovery Crisis</h4>
                <p>The web is flooded with low-quality clones and unverified wrappers. Builders experience severe search fatigue.</p>
              </div>
            </div>
            <div className="timeline-step">
              <div className="step-node">03</div>
              <div className="timeline-text-content">
                <h4>The Curation Gateway</h4>
                <p>FindAI is launched as a gateway of trust—offering manually audited, sandboxed, and verified AI directory lists.</p>
              </div>
            </div>
          </div>
        </div>

        {/* User-Centric Metrics & Commitments Panel */}
        <div className="about-metrics-layout scroll-animate">
          {/* Left panel: Platform Impact Metrics */}
          <div 
            className="metrics-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h3 className="panel-title">Directory Impact Metrics</h3>
            <p className="text-secondary panel-subtitle" style={{ fontSize: '0.85rem', marginBottom: 20 }}>
              Live indicators showing our community size and platform usage metrics.
            </p>
            
            <div className="metric-bar-group">
              <div className="metric-info">
                <span>Active AI Engines Indexed</span>
                <strong>5,190+</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-fill-100" />
              </div>
            </div>

            <div className="metric-bar-group">
              <div className="metric-info">
                <span>User Trust Rating</span>
                <strong>4.9 / 5.0</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-fill-99" />
              </div>
            </div>

            <div className="metric-bar-group">
              <div className="metric-info">
                <span>Sandboxed Comparison Sessions</span>
                <strong>25,400+</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-fill-92" />
              </div>
            </div>
          </div>

          {/* Right panel: Our Core Commitments */}
          <div 
            className="stack-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h3 className="panel-title">Our Core Commitments</h3>
            <p className="text-secondary panel-subtitle" style={{ fontSize: '0.85rem', marginBottom: 24 }}>
              The foundational values guiding the development of the FindAI catalog.
            </p>

            <div className="tech-stack-grid">
              <div className="tech-item">
                <div className="tech-icon-circle">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Absolute Quality</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>No spam or unverified wrappers.</span>
                </div>
              </div>
              
              <div className="tech-item">
                <div className="tech-icon-circle">
                  <Zap size={18} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Data Integrity</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>Automatic daily sync and crawler updates.</span>
                </div>
              </div>

              <div className="tech-item">
                <div className="tech-icon-circle">
                  <Users size={18} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Indie Spotlights</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>Equal exposure for solo developers.</span>
                </div>
              </div>

              <div className="tech-item">
                <div className="tech-icon-circle">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Verified Reviews</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>Feedback written by actual creators.</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div 
          className="about-cta scroll-animate text-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ marginTop: 60 }}
        >
          <div className="cta-glow" />
          <h3 className="cta-title">Are you building the future?</h3>
          <p className="cta-desc text-secondary">
            Submit your AI product today to get discovered by our active community of builders, researchers, and early adopters.
          </p>
          <button className="btn-primary cta-btn btn-3d" onClick={onNavigateToSubmit}>
            <span>Submit Your AI Tool Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
