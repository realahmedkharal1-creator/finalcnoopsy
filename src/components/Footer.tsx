import React, { useState } from 'react';
import { ArrowUpRight, MessageCircle, Instagram, Youtube, Mail, ExternalLink, Shield } from 'lucide-react';
import { getWhatsAppQuoteUrl, FIVERR_URL, SERVICES_DATA, AHMED_CONFIG } from '../data/portfolioData';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface FooterProps {
  onNavigate: (view: 'home' | 'work', sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer id="main-footer" className="bg-elevated border-t border-brand pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-subtle">
            {/* Brand Column (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div>
                <button
                  onClick={() => onNavigate('home', 'hero')}
                  className="flex items-center gap-1 group text-left cursor-pointer focus:outline-none mb-3"
                >
                  <span className="font-mono-heading text-2xl font-bold tracking-tight text-brand-primary group-hover:opacity-90">
                    cnoopsy
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-brand inline-block" />
                </button>
                <p className="text-base text-brand-secondary max-w-sm mb-6">
                  Video editing & content production studio. Built for retention, pacing, and
                  conversions.
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="footer-start-project-btn"
                  type="button"
                  onClick={() => onNavigate('home', 'contact')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg btn-parrot font-mono-ui font-bold text-xs uppercase transition-all"
                >
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Services Column (3 cols) */}
            <div className="lg:col-span-3">
              <h4 className="font-mono-ui text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">
                Services
              </h4>
              <ul className="space-y-2.5 text-xs font-mono-ui">
                {SERVICES_DATA.map((service) => (
                  <li key={service.id}>
                    <button
                      onClick={() => onNavigate('home', 'services')}
                      className="text-brand-secondary hover:text-accent-brand transition-colors text-left"
                    >
                      {service.title}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => onNavigate('work')}
                    className="text-accent-brand hover:underline font-bold mt-1 inline-block"
                  >
                    → Browse Full Portfolio
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Channels Column (3 cols) */}
            <div className="lg:col-span-3">
              <h4 className="font-mono-ui text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">
                Contact & Hiring
              </h4>
              <ul className="space-y-3 text-xs font-mono-ui">
                <li>
                  <a
                    href={getWhatsAppQuoteUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-secondary hover:text-accent-brand transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-accent-brand" />
                    <span>WhatsApp: +92 302 6660854</span>
                  </a>
                </li>
                <li>
                  <a
                    href={FIVERR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-secondary hover:text-accent-brand transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-accent-brand" />
                    <span>Fiverr: fiverr.com/cnoopsy</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${AHMED_CONFIG.businessEmail}`}
                    className="flex items-center gap-2 text-brand-secondary hover:text-accent-brand transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-accent-brand" />
                    <span>{AHMED_CONFIG.businessEmail}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Column (2 cols) */}
            <div className="lg:col-span-2">
              <h4 className="font-mono-ui text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">
                Social Channels
              </h4>
              <div className="flex flex-col gap-2.5 text-xs font-mono-ui">
                <a
                  href={AHMED_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-secondary hover:text-accent-brand transition-colors"
                >
                  <Instagram className="w-4 h-4 text-accent-brand" />
                  <span>Instagram</span>
                </a>
                <a
                  href={AHMED_CONFIG.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-secondary hover:text-accent-brand transition-colors"
                >
                  <Youtube className="w-4 h-4 text-accent-brand" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar (Section 6.8) */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-ui text-brand-muted">
            <p>© 2026 Cnoopsy. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-accent-brand transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy & Media Policy</span>
              </button>
              <span>Lahore, Pakistan // Global Clients</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
};
