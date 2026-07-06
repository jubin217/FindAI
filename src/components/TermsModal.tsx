import React from 'react';
import { X, FileText, Calendar } from 'lucide-react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  useLockBodyScroll();

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }} data-lenis-prevent>
      <div 
        className="modal-content neon-border terms-modal-content"
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
            <FileText size={22} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Terms of Service</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <Calendar size={12} />
              <span>Last Updated: June 23, 2026</span>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="terms-body text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>1. Acceptance of Terms</h3>
            <p>
              Welcome to FindAI. These Terms of Service ("Terms") govern your access to and use of the website located at <a href="https://findai.store" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>https://findai.store</a> and any related websites, applications, features, content, and services (collectively, the "Services").
            </p>
            <p style={{ marginTop: 10 }}>
              By accessing or using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Services.
            </p>
            <p style={{ marginTop: 10 }}>
              If you are accessing or using the Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms, and references to "you" and "your" include that organization.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>2. Description of Services</h3>
            <p>
              FindAI is an independent platform designed to help users discover, explore, compare, and learn about artificial intelligence tools, products, services, companies, and related information.
            </p>
            <p style={{ marginTop: 8 }}>The Services may include, without limitation:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>AI tool listings and directories;</li>
              <li>Product descriptions and summaries;</li>
              <li>Search and discovery features;</li>
              <li>Rankings, recommendations, and trending information;</li>
              <li>Comparisons and analytics;</li>
              <li>User-generated submissions and contributions;</li>
              <li>Links and references to third-party products and services.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              FindAI reserves the right to modify, suspend, discontinue, or restrict any portion of the Services at any time without notice or liability.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>3. Eligibility</h3>
            <p>
              You must be at least 13 years of age, or the minimum age required by applicable law in your jurisdiction, to access or use the Services.
            </p>
            <p style={{ marginTop: 8 }}>By using the Services, you represent and warrant that:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>You meet the applicable age requirements;</li>
              <li>You have the legal capacity to enter into these Terms;</li>
              <li>You will comply with all applicable laws and regulations.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>4. Accounts</h3>
            <p>Certain features of the Services may require the creation of an account.</p>
            <p style={{ marginTop: 8 }}>You agree to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Provide accurate, complete, and current information;</li>
              <li>Maintain the confidentiality of your credentials;</li>
              <li>Promptly update your information if it changes;</li>
              <li>Accept responsibility for all activities occurring under your account.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              You are solely responsible for safeguarding your account credentials. We reserve the right to suspend, restrict, or terminate accounts at our discretion.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>5. User Content and Submissions</h3>
            <p>
              The Services may permit users to submit content, including tool submissions, reviews, comments, ratings, feedback, and other materials ("User Content").
            </p>
            <p style={{ marginTop: 10 }}>
              You retain ownership of your User Content. However, by submitting User Content, you grant FindAI a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to use, host, store, reproduce, modify, adapt, publish, translate, display, distribute, and create derivative works from such User Content solely for the purposes of operating, improving, promoting, and providing the Services.
            </p>
            <p style={{ marginTop: 10 }}>You represent and warrant that:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>You own or have the necessary rights to submit the content;</li>
              <li>The content does not infringe any third-party rights;</li>
              <li>The content is accurate and not misleading;</li>
              <li>The content does not violate any applicable laws.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              FindAI reserves the right, but has no obligation, to review, remove, edit, refuse, or restrict any User Content at its sole discretion.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>6. Third-Party Products and Services</h3>
            <p>
              The Services may contain references, information, integrations, advertisements, or links relating to third-party products, websites, and services.
            </p>
            <p style={{ marginTop: 8 }}>Unless expressly stated otherwise:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>FindAI does not own or operate most products listed on the platform;</li>
              <li>FindAI does not endorse, guarantee, or warrant any third-party product or service;</li>
              <li>FindAI is not responsible for the availability, functionality, security, legality, or content of third-party services.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              Your interactions and transactions with third parties are solely between you and the applicable third party.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>7. Rankings, Recommendations, and Information</h3>
            <p>
              The Services may provide rankings, trending indicators, recommendations, popularity scores, comparisons, reviews, traffic estimates, market insights, summaries, and analyses. Such information may be generated using algorithms, publicly available information, third-party sources, automated systems, and user interactions.
            </p>
            <p style={{ marginTop: 8 }}>Unless expressly stated otherwise:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Information provided through the Services is for informational purposes only;</li>
              <li>Rankings and scores are estimates and opinions generated by our methodologies;</li>
              <li>Information may change over time and may not always be complete, accurate, or current.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              You should independently evaluate any products or services before relying upon them.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>8. Intellectual Property Rights</h3>
            <p>
              The Services, including all software, code, design, graphics, trademarks, logos, text, databases, compilations, and other content provided by FindAI, are owned by or licensed to FindAI and are protected by intellectual property and other applicable laws.
            </p>
            <p style={{ marginTop: 8 }}>Except as expressly permitted by these Terms, you may not:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Copy, reproduce, modify, distribute, sell, license, or exploit any portion of the Services;</li>
              <li>Reverse engineer or decompile any components of the Services.</li>
            </ul>
            <p style={{ marginTop: 10 }}>All rights not expressly granted are reserved.</p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>9. Third-Party Intellectual Property</h3>
            <p>
              Names, logos, trademarks, service marks, product names, and brands appearing on the Services may belong to their respective owners. Such references are used solely for identification, informational, commentary, indexing, comparison, and discovery purposes.
            </p>
            <p style={{ marginTop: 8 }}>Unless expressly stated otherwise, their inclusion on FindAI does not imply:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Ownership, sponsorship, affiliation, partnership, endorsement, or approval by the respective rights holders.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              If you believe your intellectual property rights have been infringed, please contact us.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>10. Acceptable Use</h3>
            <p>You agree not to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Violate any applicable law or regulation;</li>
              <li>Infringe the rights of others;</li>
              <li>Submit unlawful, fraudulent, defamatory, abusive, or misleading content;</li>
              <li>Attempt unauthorized access to the Services or related systems;</li>
              <li>Interfere with or disrupt the Services, or circumvent security measures;</li>
              <li>Introduce malware or malicious code;</li>
              <li>Use automated systems to access, scrape, or collect data from the Services in a manner that imposes unreasonable demands on our infrastructure.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              FindAI reserves the right to investigate violations and take appropriate action, including suspension or termination of access.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>11. Availability of Services</h3>
            <p>We strive to provide reliable Services but do not guarantee that the Services will:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>Be uninterrupted, secure, error-free, or continuously available;</li>
              <li>Meet your expectations or requirements.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              The Services may experience maintenance periods, outages, delays, inaccuracies, or interruptions.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>12. Disclaimer of Warranties</h3>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
              THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS.
            </p>
            <p style={{ marginTop: 10 }}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FINDAI DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, RELIABILITY, AVAILABILITY, OR SECURITY.
            </p>
            <p style={{ marginTop: 10 }}>
              WE DO NOT WARRANT THAT THE SERVICES WILL BE ERROR-FREE OR THAT ANY INFORMATION PROVIDED THROUGH THE SERVICES IS COMPLETE, ACCURATE, OR CURRENT.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>13. Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FINDAI, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, CONTRACTORS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICES.
            </p>
            <p style={{ marginTop: 10 }}>
              IN NO EVENT SHALL FINDAI'S AGGREGATE LIABILITY EXCEED THE GREATER OF (A) ONE HUNDRED U.S. DOLLARS (US$100); OR (B) THE AMOUNT YOU PAID TO FINDAI, IF ANY, DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>14. Indemnification</h3>
            <p>
              You agree to defend, indemnify, and hold harmless FindAI, its affiliates, officers, directors, employees, contractors, and licensors from and against any claims, damages, liabilities, losses, expenses, and costs, including reasonable legal fees, arising out of or relating to your use of the Services, your User Content, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>15. Termination</h3>
            <p>
              We may suspend, restrict, or terminate your access to all or any part of the Services at any time, with or without notice, for any reason, including if we reasonably believe that you have violated these Terms, your activities create risks, or we are required to do so by law.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>16. Changes to the Services and Terms</h3>
            <p>
              We may modify the Services and these Terms from time to time. If we make material changes, we may provide notice through the Services or by other reasonable means. Your continued use of the Services after changes become effective constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>17. Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India, without regard to conflict of law principles.
            </p>
            <p style={{ marginTop: 10 }}>
              Any disputes arising out of or relating to these Terms or the Services shall be subject to the exclusive jurisdiction of the courts located in Kerala, India.
            </p>
          </section>

          <section style={{ marginBottom: 10 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>18. Contact Information</h3>
            <p>If you have any questions, requests, or concerns regarding these Terms or the Services, please contact us at:</p>
            <div className="skeuo-inset" style={{ marginTop: 10, padding: '16px 20px', borderRadius: '10px', display: 'inline-block' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>FindAI</strong>
              <span>Website: </span><a href="https://findai.store" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>https://findai.store</a><br />
              <span>Email: </span><a href="mailto:support@findai.store" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@findai.store</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
