import React, { useState, useEffect } from 'react';
import { Sun, Moon, MessageCircle, Menu, X, ArrowUpRight } from 'lucide-react';
import { ThemeMode } from '../types';
import { getWhatsAppQuoteUrl } from '../data/portfolioData';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeView: 'home' | 'work';
  onNavigate: (view: 'home' | 'work', sectionId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  activeView,
  onNavigate,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Background elevation trigger
      setIsScrolled(currentScrollY > 60);

    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (view: 'home' | 'work', sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-4 sm:py-5'
        }`}
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(8, 9, 10, 0.82)' : 'rgba(246, 247, 242, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo / Wordmark */}
          <button
            id="nav-logo-btn"
            onClick={() => handleLinkClick('home', 'hero')}
            className="flex items-center gap-1 group text-left cursor-pointer focus:outline-none"
            aria-label="Cnoopsy Home"
          >
            <span className="font-mono-heading text-xl sm:text-2xl font-bold tracking-tight text-brand-primary group-hover:opacity-90 transition-opacity">
              cnoopsy
            </span>
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent-brand inline-block transform group-hover:scale-125 transition-transform" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-mono-ui font-medium">
            <button
              id="nav-link-work"
              onClick={() => handleLinkClick('work')}
              data-active={activeView === 'work'}
              className={`nav-link transition-colors hover:text-brand-primary focus:outline-none ${
                activeView === 'work' ? 'text-brand-primary font-semibold' : 'text-brand-secondary'
              }`}
            >
              Work
            </button>
            <button
              id="nav-link-services"
              onClick={() => handleLinkClick('home', 'services')}
              className="nav-link text-brand-secondary hover:text-brand-primary transition-colors focus:outline-none"
            >
              Services
            </button>
            <button
              id="nav-link-why"
              onClick={() => handleLinkClick('home', 'why-cnoopsy')}
              className="nav-link text-brand-secondary hover:text-brand-primary transition-colors focus:outline-none"
            >
              Why Cnoopsy
            </button>
            <button
              id="nav-link-process"
              onClick={() => handleLinkClick('home', 'process')}
              className="nav-link text-brand-secondary hover:text-brand-primary transition-colors focus:outline-none"
            >
              Process
            </button>
            <button
              id="nav-link-testimonials"
              onClick={() => handleLinkClick('home', 'testimonials')}
              className="nav-link text-brand-secondary hover:text-brand-primary transition-colors focus:outline-none"
            >
              Reviews
            </button>
            <button
              id="nav-link-contact"
              onClick={() => handleLinkClick('home', 'contact')}
              className="nav-link text-brand-secondary hover:text-brand-primary transition-colors focus:outline-none"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-2.5 rounded-full border border-brand bg-elevated text-brand-primary hover:border-accent-brand hover:text-accent-brand transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-accent transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-accent transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* WhatsApp Quick CTA */}
            <a
              id="nav-whatsapp-cta"
              href={getWhatsAppQuoteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono-ui font-semibold rounded-lg border border-brand bg-elevated text-brand-primary hover:border-accent-brand hover:text-accent-brand transition-all"
              aria-label="Contact Cnoopsy on WhatsApp"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent-brand opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-brand" />
              </span>
              <span>WhatsApp</span>
            </a>

            {/* Primary Action Button */}
            <button
              id="nav-quote-cta"
              onClick={() => handleLinkClick('home', 'contact')}
              className="group flex items-center gap-1.5 px-4 py-2 text-xs font-mono-ui uppercase rounded-lg btn-parrot focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <span>Get a Quote</span>
              <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>

          {/* Mobile Menu & Theme button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full border border-brand bg-elevated text-brand-primary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-brand bg-elevated text-brand-primary focus:outline-none"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-overlay"
          className="fixed inset-0 z-40 bg-page/95 backdrop-blur-xl flex flex-col justify-between pt-24 pb-8 px-6 lg:hidden animate-fade-in overflow-y-auto"
        >
          <div className="flex flex-col gap-6 text-lg font-mono-ui font-semibold">
            <button
              onClick={() => handleLinkClick('work')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span><span className="font-hud text-accent-brand mr-2">01</span>Portfolio Work</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'services')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span><span className="font-hud text-accent-brand mr-2">02</span>Services</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'why-cnoopsy')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span><span className="font-hud text-accent-brand mr-2">03</span>Why Cnoopsy</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'process')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span><span className="font-hud text-accent-brand mr-2">04</span>Process</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'testimonials')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span><span className="font-hud text-accent-brand mr-2">05</span>Reviews</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'contact')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span><span className="font-hud text-accent-brand mr-2">06</span>Contact</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <a
              href={getWhatsAppQuoteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-mono-ui font-bold rounded-lg border border-brand bg-elevated text-brand-primary"
            >
              <MessageCircle className="w-4 h-4 text-accent-brand" />
              <span>Chat on WhatsApp</span>
            </a>
            <button
              onClick={() => handleLinkClick('home', 'contact')}
              className="w-full py-3.5 text-sm font-mono-ui font-bold uppercase rounded-lg btn-parrot flex items-center justify-center gap-2"
            >
              <span>Get a Custom Quote</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
