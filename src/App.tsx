import React, { useState, useEffect } from 'react';
import { ThemeMode, PortfolioItem, VideoCategory } from './types';
import { PORTFOLIO_PROJECTS } from './data/portfolioData';

// Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhyCnoopsy } from './components/WhyCnoopsy';
import { ServicesSection } from './components/ServicesSection';
import { PortfolioPreview } from './components/PortfolioPreview';
import { ProcessSection } from './components/ProcessSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { InvertedCtaBand } from './components/InvertedCtaBand';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { PortfolioPage } from './components/PortfolioPage';
import { LightboxModal } from './components/LightboxModal';

export default function App() {
  // Theme Management (persistent in localStorage, defaulting to 'dark')
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('cnoopsy_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Active View ('home' | 'work')
  const [activeView, setActiveView] = useState<'home' | 'work'>('home');
  const [initialPortfolioCategory, setInitialPortfolioCategory] = useState<VideoCategory>('All');

  // Lightbox Modal State
  const [activeLightboxItem, setActiveLightboxItem] = useState<PortfolioItem | null>(null);

  // Sync theme with HTML document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cnoopsy_theme', theme);
  }, [theme]);

  // Handle URL hash changes or back/forward
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#work' || hash === '#portfolio') {
        setActiveView('work');
      } else {
        setActiveView('home');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNavigate = (view: 'home' | 'work', sectionId?: string) => {
    setActiveView(view);
    if (view === 'work') {
      setInitialPortfolioCategory('All');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const navOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGetQuote = () => {
    setActiveLightboxItem(null);
    handleNavigate('home', 'contact');
  };

  const handleOpenLightbox = (item: PortfolioItem) => {
    setActiveLightboxItem(item);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxItem(null);
  };

  return (
    <div className="relative min-h-screen bg-page text-brand-primary flex flex-col selection:bg-accent selection:text-black">
      {/* Subtle Full-page Film Grain Texture Overlay */}
      <div className="film-grain" aria-hidden="true" />

      {/* Global Sticky Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        activeView={activeView}
        onNavigate={handleNavigate}
      />

      {/* Main View Content */}
      <main className="flex-1">
        {activeView === 'home' ? (
          <>
            {/* Section (#): Hero */}
            <Hero
              onSeeWork={() => handleNavigate('work')}
              onGetQuote={handleGetQuote}
              onOpenLightbox={handleOpenLightbox}
            />

            {/* Section (##): Why Cnoopsy */}
            <WhyCnoopsy />

            {/* Section (###): Services */}
            <ServicesSection onGetQuote={handleGetQuote} />

            {/* Section (####): Portfolio Stacked-Card Showcase */}
            <PortfolioPreview
              onSeeAllWork={() => handleNavigate('work')}
              onOpenLightbox={handleOpenLightbox}
            />

            {/* Section (#####): Process 01–06 */}
            <ProcessSection />

            {/* Section (######): Testimonials 5-Star */}
            <TestimonialsSection />

            {/* Section (#######): Inverted Contrast CTA Band */}
            <InvertedCtaBand theme={theme} onGetQuote={handleGetQuote} />

            {/* Section: Direct Contact & Custom Quote Form */}
            <ContactSection />
          </>
        ) : (
          /* Dedicated /work Portfolio Page (Section 7) */
          <PortfolioPage
            initialCategory={initialPortfolioCategory}
            onOpenLightbox={handleOpenLightbox}
            onBackToHome={() => handleNavigate('home', 'hero')}
            onGetQuote={handleGetQuote}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Portfolio Video Lightbox Modal */}
      <LightboxModal
        item={activeLightboxItem}
        itemsList={PORTFOLIO_PROJECTS}
        onClose={handleCloseLightbox}
        onNavigate={(newItem) => setActiveLightboxItem(newItem)}
        onGetQuote={handleGetQuote}
      />
    </div>
  );
}
