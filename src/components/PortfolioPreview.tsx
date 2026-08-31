import React, { useState } from 'react';
import { ArrowUpRight, Play, Eye, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { PortfolioItem } from '../types';

interface PortfolioPreviewProps {
  onSeeAllWork: () => void;
  onOpenLightbox: (item: PortfolioItem) => void;
}

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({
  onSeeAllWork,
  onOpenLightbox,
}) => {
  // Rotate between first 3 featured sample projects
  const previewItems = PORTFOLIO_PROJECTS.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentItem = previewItems[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % previewItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + previewItems.length) % previewItems.length);
  };

  return (
    <section id="portfolio-preview" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="font-mono-ui text-xs font-bold text-brand-muted tracking-widest">
                (####)
              </span>
              <span className="h-px w-6 bg-border" />
              <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
                CASE HIGHLIGHTS
              </span>
            </div>
            <h2 className="font-mono-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary uppercase">
              WORK YOU'LL WANT TO WATCH
            </h2>
          </div>

          {/* Quick tab controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-ui text-brand-muted mr-2 hidden sm:inline">
              0{activeIndex + 1} / 0{previewItems.length}
            </span>
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg border border-brand bg-elevated text-brand-primary hover:border-accent-brand hover:text-accent-brand transition-colors"
              aria-label="Previous preview project"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg border border-brand bg-elevated text-brand-primary hover:border-accent-brand hover:text-accent-brand transition-colors"
              aria-label="Next preview project"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stacked Card Showcase Layout */}
        <div className="relative max-w-5xl mx-auto my-8">
          {/* Card stack decorative offsets (Background layers) */}
          <div
            className="absolute -top-3 left-4 right-4 h-full rounded-2xl border border-brand bg-elevated/40 scale-[0.98] pointer-events-none -z-10 transition-all duration-300"
            style={{ boxShadow: '0 10px 30px var(--glow)' }}
          />
          <div className="absolute -top-6 left-8 right-8 h-full rounded-2xl border border-brand bg-elevated/20 scale-[0.96] pointer-events-none -z-20 transition-all duration-300" />

          {/* Front Active Interactive Card */}
          <div
            id="featured-preview-card"
            className="rounded-2xl border border-brand bg-elevated overflow-hidden shadow-2xl transition-all duration-300 group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Media Player Area (7 cols) */}
              <div
                onClick={() => onOpenLightbox(currentItem)}
                className="lg:col-span-7 relative aspect-video lg:aspect-auto min-h-[320px] sm:min-h-[380px] bg-black overflow-hidden cursor-pointer"
              >
                <img
                  src={currentItem.thumbnailUrl}
                  alt={currentItem.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Centered Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-accent-brand/90 backdrop-blur-md flex items-center justify-center text-black transform group-hover:scale-110 group-hover:bg-accent-brand transition-all shadow-xl">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono-ui font-bold text-accent uppercase">
                    {currentItem.category}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-xs font-mono-ui text-white/90">
                    {currentItem.duration}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono-ui text-white/80">
                  <span className="bg-black/60 px-2 py-0.5 rounded">Click to Play Sample</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded">{currentItem.platform}</span>
                </div>
              </div>

              {/* Details & Specs Area (5 cols) */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-elevated">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-accent-brand animate-pulse" />
                    <span className="font-mono-ui text-xs text-brand-muted uppercase">
                      Featured Case Study
                    </span>
                  </div>

                  <h3 className="font-mono-heading text-xl sm:text-2xl font-bold text-brand-primary uppercase leading-tight mb-4">
                    {currentItem.title}
                  </h3>

                  <p className="text-sm text-brand-secondary leading-relaxed mb-6">
                    {currentItem.description}
                  </p>

                  {/* Highlights list */}
                  <div className="space-y-2 mb-6">
                    {currentItem.keyFeatures.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-brand-secondary font-normal">
                        <span className="text-accent-brand font-mono-ui font-bold">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="pt-4 border-t border-subtle mb-6 flex items-center justify-between text-xs font-mono-ui text-brand-muted">
                    <span>Client: {currentItem.client}</span>
                    <span className="text-accent-brand font-bold">{currentItem.specs.resolution}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onOpenLightbox(currentItem)}
                      className="flex-1 py-3 rounded-lg bg-accent-brand text-black font-mono-ui font-bold text-xs uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Full Cut</span>
                    </button>
                    <button
                      onClick={onSeeAllWork}
                      className="px-4 py-3 rounded-lg border border-brand bg-elevated-2 text-brand-primary font-mono-ui font-semibold text-xs uppercase hover:border-accent-brand hover:text-accent-brand transition-all"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Select Buttons Underneath */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {previewItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`px-4 py-2 rounded-full font-mono-ui text-xs uppercase transition-all ${
                  activeIndex === idx
                    ? 'bg-accent-brand text-black font-bold'
                    : 'border border-brand bg-elevated text-brand-secondary hover:text-brand-primary hover:border-accent-brand/50'
                }`}
              >
                0{idx + 1}. {item.category}
              </button>
            ))}
          </div>
        </div>

        {/* Center All Work Button (Section 6.4) */}
        <div className="mt-12 text-center">
          <button
            id="portfolio-all-work-btn"
            onClick={onSeeAllWork}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-brand bg-elevated hover:border-accent-brand text-brand-primary font-mono-ui font-bold text-sm uppercase transition-all hover:shadow-lg"
          >
            <span>All Work</span>
            <span className="text-accent-brand group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
