import React from 'react';
import { Sparkles, Cpu, Layers, Zap, ArrowRight, Database, Code, GitCompare } from 'lucide-react';

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
            <Sparkles size={12} />
            <span>Behind The Directory</span>
          </div>
          <h2 className="about-title">
            Navigating the <span className="text-gradient">AI Revolution</span>
          </h2>
          <p className="about-subtitle text-secondary">
            FindAI is a professional, developer-first intelligence platform created to curate, discover, and benchmark the world's most advanced artificial intelligence technologies in seconds.
          </p>
        </div>

        {/* 3D Bento Grid Restructure */}
        <div className="bento-grid scroll-animate">
          {/* Card 1: col-span-2 */}
          <div 
            className="bento-item card-3d col-span-2 glass-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="card-glow-bg" />
            <div className="bento-card-content">
              <span className="card-num">01 / CURATION ENGINE</span>
              <span className="card-icon"><Layers size={22} /></span>
              <h3>Intelligent Directory Categorization</h3>
              <p>
                Stop digging through unorganized lists. FindAI indexes products across 9 core industries. Leverage advanced tag filters, pricing selectors, and target platform parameters to discover your ideal tool stack in seconds.
              </p>
              <div className="card-bg-gradient blue-glow" />
            </div>
          </div>

          {/* Card 2: col-span-1 */}
          <div 
            className="bento-item card-3d glass-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="card-glow-bg" />
            <div className="bento-card-content">
              <span className="card-num">02 / BENCHMARK</span>
              <span className="card-icon"><GitCompare size={22} /></span>
              <h3>Comparison Sandbox</h3>
              <p>
                Toggle comparison check nodes to inspect up to three models side-by-side. Benchmark pricing scales, features, ratings, and integration setups instantly.
              </p>
              <div className="card-bg-gradient silver-glow" />
            </div>
          </div>

          {/* Card 3: col-span-1 */}
          <div 
            className="bento-item card-3d glass-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="card-glow-bg" />
            <div className="bento-card-content">
              <span className="card-num">03 / TRUST MATRIX</span>
              <span className="card-icon"><Cpu size={22} /></span>
              <h3>Verified Submissions</h3>
              <p>
                A fair ecosystem for AI builders. Duplicate submissions are checked, providing publishers with clear validation notices and secure profiles.
              </p>
              <div className="card-bg-gradient purple-glow" />
            </div>
          </div>

          {/* Card 4: col-span-2 */}
          <div 
            className="bento-item card-3d col-span-2 glass-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="card-glow-bg" />
            <div className="bento-card-content">
              <span className="card-num">04 / SHOWCASE</span>
              <span className="card-icon"><Sparkles size={22} /></span>
              <h3>Immersive WebGL Orbit Showcase</h3>
              <p>
                Interact with featured listings in a responsive 3D WebGL sphere. Drag and rotate the orbital core, hover to inspect glass-gilded processor chip details, and view direct integration links immediately.
              </p>
              <div className="card-bg-gradient blue-glow" />
            </div>
          </div>
        </div>

        {/* Developer Integration Timeline */}
        <div className="workflow-section scroll-animate" style={{ margin: '80px 0' }}>
          <h3 className="section-title" style={{ fontSize: '1.75rem', justifyContent: 'center', borderBottom: 'none', marginBottom: 40 }}>
            The FindAI Workflow
          </h3>
          <div className="timeline">
            <div className="timeline-step">
              <div className="step-node">01</div>
              <h4>Filter & Find</h4>
              <p>Narrow down search filters across platforms, categories, and rating scores in seconds.</p>
            </div>
            <div className="timeline-step">
              <div className="step-node">02</div>
              <h4>Contrast Models</h4>
              <p>Activate sandbox comparison slots to evaluate features, value, and integration side-by-side.</p>
            </div>
            <div className="timeline-step">
              <div className="step-node">03</div>
              <h4>Deploy Stack</h4>
              <p>Navigate directly to verified homepage links, check ratings, and integrate APIs.</p>
            </div>
          </div>
        </div>

        {/* Middle Stats & Stack Visualization */}
        <div className="about-metrics-layout scroll-animate">
          {/* Left panel: Animated metrics bars */}
          <div 
            className="metrics-panel glass-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h3 className="panel-title">System Benchmarks</h3>
            <p className="text-secondary panel-subtitle" style={{ fontSize: '0.85rem', marginBottom: 20 }}>
              Performance stats showing directory health and indexing efficiency.
            </p>
            
            <div className="metric-bar-group">
              <div className="metric-info">
                <span>Database Sync Speed</span>
                <strong>99.8%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-fill-99" />
              </div>
            </div>

            <div className="metric-bar-group">
              <div className="metric-info">
                <span>Verification Accuracy</span>
                <strong>100%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-fill-100" />
              </div>
            </div>

            <div className="metric-bar-group">
              <div className="metric-info">
                <span>API Query Latency</span>
                <strong>&lt; 45ms</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-fill-92" />
              </div>
            </div>
          </div>

          {/* Right panel: Modern Tech Stack grid */}
          <div 
            className="stack-panel glass-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h3 className="panel-title">Technical Architecture</h3>
            <p className="text-secondary panel-subtitle" style={{ fontSize: '0.85rem', marginBottom: 24 }}>
              The high-performance framework powering the FindAI directory.
            </p>

            <div className="tech-stack-grid">
              <div className="tech-item">
                <div className="tech-icon-circle">
                  <Code size={18} />
                </div>
                <span>React 19 & TS</span>
              </div>
              
              <div className="tech-item">
                <div className="tech-icon-circle">
                  <Database size={18} />
                </div>
                <span>Supabase Real DB</span>
              </div>

              <div className="tech-item">
                <div className="tech-icon-circle">
                  <Zap size={18} />
                </div>
                <span>Vite Bundler</span>
              </div>

              <div className="tech-item">
                <div className="tech-icon-circle">
                  <Layers size={18} />
                </div>
                <span>RLS Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div 
          className="about-cta glass-panel scroll-animate text-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ marginTop: 60 }}
        >
          <div className="cta-glow" />
          <h3 className="cta-title">Are you an AI Builder?</h3>
          <p className="cta-desc text-secondary">
            Get your AI product discovered by thousands of developers, researchers, and early adopters instantly.
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
