import React from 'react';
import { X, Shield, Calendar } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  useLockBodyScroll();

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }} data-lenis-prevent>
      <div 
        className="modal-content glass-panel neon-border privacy-modal-content"
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
            <Shield size={22} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'white', margin: 0 }}>Privacy Policy</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <Calendar size={12} />
              <span>Last Updated: June 23, 2026</span>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="privacy-body text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>1. Introduction</h3>
            <p>
              Welcome to FindAI. This Privacy Policy explains how we collect, use, disclose, and protect information when you access or use our website located at <a href="https://findai.store" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>https://findai.store</a> and any related services, features, content, or applications (collectively, the "Services").
            </p>
            <p style={{ marginTop: 10 }}>
              FindAI is an independent platform that helps users discover, explore, compare, and learn about artificial intelligence tools, products, and services from third-party providers.
            </p>
            <p style={{ marginTop: 10 }}>
              By accessing or using our Services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>2. Information We Collect</h3>
            
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, margin: '14px 0 6px 0' }}>Information You Provide to Us</h4>
            <p>Depending on how you use our Services, we may collect information that you voluntarily provide, including:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Name</li>
              <li>Email address</li>
              <li>Account information, if registration is offered</li>
              <li>Communications, feedback, inquiries, or support requests</li>
              <li>Information submitted through forms, surveys, newsletters, or tool submissions</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, margin: '18px 0 6px 0' }}>Information Collected Automatically</h4>
            <p>When you access or use our Services, we may automatically collect certain information, including:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device identifiers</li>
              <li>Operating system</li>
              <li>Language preferences</li>
              <li>Pages visited and interactions with our Services</li>
              <li>Referral URLs</li>
              <li>Date and time of access</li>
              <li>Clickstream and usage data</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, margin: '18px 0 6px 0' }}>Information Obtained from Public Sources</h4>
            <p>As part of operating an AI discovery platform, we may collect and process information regarding artificial intelligence tools and companies from publicly available sources, including:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Public websites</li>
              <li>Official company announcements</li>
              <li>Product documentation</li>
              <li>RSS feeds</li>
              <li>Public APIs</li>
              <li>News publications</li>
              <li>Public repositories</li>
              <li>Publicly accessible social media content</li>
              <li>Publicly available market and trend information</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>3. How We Use Information</h3>
            <p>We may use information for legitimate business purposes, including to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Provide, maintain, and improve our Services</li>
              <li>Operate and administer the platform</li>
              <li>Display AI tool listings, rankings, and recommendations</li>
              <li>Analyze usage patterns and measure engagement</li>
              <li>Personalize content and user experiences</li>
              <li>Detect, investigate, and prevent fraud, abuse, security incidents, and unlawful activities</li>
              <li>Communicate with users regarding updates, announcements, and support requests</li>
              <li>Send newsletters and marketing communications where permitted by applicable law</li>
              <li>Develop new features and services</li>
              <li>Comply with legal obligations and enforce our terms and policies</li>
              <li>Protect our rights, users, and the integrity of our Services</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>4. Cookies and Similar Technologies</h3>
            <p>We use cookies, pixels, local storage technologies, and similar technologies to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Operate and secure the Services</li>
              <li>Remember preferences and settings</li>
              <li>Understand how users interact with the Services</li>
              <li>Measure traffic and performance</li>
              <li>Improve functionality and user experience</li>
              <li>Deliver and measure communications and promotional content</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              You may configure your browser settings to refuse or limit cookies. Certain features of the Services may not function properly if cookies are disabled.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>5. Analytics and Third-Party Services</h3>
            <p>We may use third-party service providers to assist in operating our Services, including providers of:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Hosting and infrastructure</li>
              <li>Analytics and performance monitoring</li>
              <li>Security services</li>
              <li>Email delivery</li>
              <li>Customer communications</li>
              <li>Search and indexing services</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              These service providers may process information on our behalf and only for purposes consistent with this Privacy Policy and applicable agreements.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>6. Disclosure of Information</h3>
            <p>We may disclose information in the following circumstances:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              <div>
                <strong style={{ color: 'white' }}>Service Providers: </strong>
                <span>To vendors and service providers who perform services on our behalf.</span>
              </div>
              <div>
                <strong style={{ color: 'white' }}>Legal Requirements: </strong>
                <span>To comply with applicable laws, regulations, legal processes, or governmental requests.</span>
              </div>
              <div>
                <strong style={{ color: 'white' }}>Protection of Rights: </strong>
                <span>To enforce our agreements, investigate potential violations, prevent fraud or security issues, and protect the rights, property, and safety of FindAI, our users, or others.</span>
              </div>
              <div>
                <strong style={{ color: 'white' }}>Corporate Transactions: </strong>
                <span>In connection with an actual or proposed merger, acquisition, financing transaction, asset sale, reorganization, bankruptcy, or similar corporate event.</span>
              </div>
              <div>
                <strong style={{ color: 'white' }}>With Consent: </strong>
                <span>With your consent or at your direction.</span>
              </div>
            </div>
            <p style={{ marginTop: 12, fontWeight: 600, color: 'white' }}>We do not sell personal information to third parties.</p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>7. Third-Party Products and Links</h3>
            <p>
              The Services may contain information about, references to, or links to third-party websites, products, applications, and services.
            </p>
            <p style={{ marginTop: 10 }}>
              FindAI does not own or operate most of the products listed on the platform and is not responsible for the privacy practices, content, availability, or security of third-party services.
            </p>
            <p style={{ marginTop: 10 }}>
              Your interactions with third-party services are governed by the privacy policies and terms of those third parties.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>8. AI Tool Listings and Public Information</h3>
            <p>FindAI aggregates and presents information concerning artificial intelligence tools and related companies from publicly available sources.</p>
            <p style={{ marginTop: 8 }}>Unless explicitly stated otherwise:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Listings are provided for informational purposes only;</li>
              <li>Product descriptions, metadata, rankings, and summaries may be generated, curated, or derived from publicly available information;</li>
              <li>Product names, logos, trademarks, and brands are the property of their respective owners;</li>
              <li>Inclusion on FindAI does not imply sponsorship, endorsement, affiliation, partnership, or approval by the respective companies.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>9. Data Retention</h3>
            <p>We retain information for as long as reasonably necessary to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Provide and improve our Services;</li>
              <li>Fulfill the purposes described in this Privacy Policy;</li>
              <li>Comply with legal obligations;</li>
              <li>Resolve disputes;</li>
              <li>Enforce agreements and protect our legal rights.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              Retention periods may vary depending on the nature of the information and applicable legal requirements.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>10. Data Security</h3>
            <p>
              We implement reasonable administrative, technical, and organizational safeguards designed to protect information against unauthorized access, loss, misuse, alteration, and disclosure.
            </p>
            <p style={{ marginTop: 10 }}>
              However, no method of electronic transmission or storage can be guaranteed to be completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>11. International Data Transfers</h3>
            <p>
              Your information may be processed and stored in countries other than your country of residence, which may have data protection laws that differ from those in your jurisdiction.
            </p>
            <p style={{ marginTop: 10 }}>
              Where required by applicable law, we implement appropriate safeguards for international transfers of personal information.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>12. Your Rights and Choices</h3>
            <p>Depending on your location and applicable law, you may have rights regarding your personal information, including rights to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Access information we hold about you;</li>
              <li>Request correction of inaccurate information;</li>
              <li>Request deletion of certain information;</li>
              <li>Object to or restrict certain processing activities;</li>
              <li>Withdraw consent where processing is based on consent;</li>
              <li>Request portability of information where applicable.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              Requests may be submitted by contacting us using the information provided below.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>13. Children's Privacy</h3>
            <p>
              The Services are not directed to children under the age of 13, or any higher minimum age required under applicable law.
            </p>
            <p style={{ marginTop: 10 }}>
              We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child in violation of applicable law, we will take reasonable steps to delete such information.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>14. Changes to This Privacy Policy</h3>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our Services, legal requirements, or business practices.
            </p>
            <p style={{ marginTop: 10 }}>
              When we make material changes, we will update the "Last Updated" date and may provide additional notice where required by applicable law.
            </p>
            <p style={{ marginTop: 10 }}>
              Your continued use of the Services after changes become effective constitutes acceptance of the revised Privacy Policy.
            </p>
          </section>

          <section style={{ marginBottom: 10 }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>15. Contact Us</h3>
            <p>If you have any questions, requests, or concerns regarding this Privacy Policy or our privacy practices, please contact us at:</p>
            <div style={{ marginTop: 10, background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--glass-border)', padding: '16px 20px', borderRadius: '10px', display: 'inline-block' }}>
              <strong style={{ color: 'white', display: 'block', marginBottom: 4 }}>FindAI</strong>
              <span>Website: </span><a href="https://findai.store" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>https://findai.store</a><br />
              <span>Email: </span><a href="mailto:support@findai.store" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@findai.store</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
