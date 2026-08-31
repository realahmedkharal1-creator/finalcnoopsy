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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Background elevation trigger
      setIsScrolled(currentScrollY > 60);

      // Hide on scroll down, reveal on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLinkClick = (view: 'home' | 'work', sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled
            ? 'bg-page/90 backdrop-blur-md border-b border-brand shadow-sm py-3.5'
            : 'bg-transparent py-5'
        }`}
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
          <nav className="hidden md:flex items-center gap-8 text-sm font-mono-ui font-medium">
            <button
              id="nav-link-work"
              onClick={() => handleLinkClick('work')}
              className={`transition-colors uppercase hover:text-accent-brand focus:outline-none ${
                activeView === 'work' ? 'text-accent-brand font-bold' : 'text-brand-secondary'
              }`}
            >
              Work
            </button>
            <button
              id="nav-link-services"
              onClick={() => handleLinkClick('home', 'services')}
              className="text-brand-secondary hover:text-accent-brand transition-colors uppercase focus:outline-none"
            >
              Services
            </button>
            <button
              id="nav-link-why"
              onClick={() => handleLinkClick('home', 'why-cnoopsy')}
              className="text-brand-secondary hover:text-accent-brand transition-colors uppercase focus:outline-none"
            >
              Why Us
            </button>
            <button
              id="nav-link-process"
              onClick={() => handleLinkClick('home', 'process')}
              className="text-brand-secondary hover:text-accent-brand transition-colors uppercase focus:outline-none"
            >
              Process
            </button>
            <button
              id="nav-link-testimonials"
              onClick={() => handleLinkClick('home', 'testimonials')}
              className="text-brand-secondary hover:text-accent-brand transition-colors uppercase focus:outline-none"
            >
              Reviews
            </button>
            <button
              id="nav-link-contact"
              onClick={() => handleLinkClick('home', 'contact')}
              className="text-brand-secondary hover:text-accent-brand transition-colors uppercase focus:outline-none"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
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
              <MessageCircle className="w-3.5 h-3.5 text-accent-brand" />
              <span>WhatsApp</span>
            </a>

            {/* Primary Action Button */}
            <button
              id="nav-quote-cta"
              onClick={() => handleLinkClick('home', 'contact')}
              className="group flex items-center gap-1.5 px-4 py-2 text-xs font-mono-ui font-bold uppercase rounded-lg bg-accent-brand text-black hover:opacity-90 active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <span>Get a Quote</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu & Theme button */}
          <div className="flex sm:hidden items-center gap-2">
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
          className="fixed inset-0 z-40 bg-page/98 backdrop-blur-xl flex flex-col justify-between pt-24 pb-8 px-6 sm:hidden animate-fade-in"
        >
          <div className="flex flex-col gap-6 text-lg font-mono-ui font-semibold uppercase">
            <button
              onClick={() => handleLinkClick('work')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span>01 // Portfolio Work</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'services')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span>02 // Services</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'why-cnoopsy')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span>03 // Why Cnoopsy</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'process')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span>04 // Process</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'testimonials')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span>05 // Reviews</span>
              <ArrowUpRight className="w-4 h-4 text-accent-brand" />
            </button>
            <button
              onClick={() => handleLinkClick('home', 'contact')}
              className="text-left text-brand-primary hover:text-accent-brand py-2 border-b border-subtle flex items-center justify-between"
            >
              <span>06 // Contact</span>
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
              className="w-full py-3.5 text-sm font-mono-ui font-bold uppercase rounded-lg bg-accent-brand text-black flex items-center justify-center gap-2"
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
