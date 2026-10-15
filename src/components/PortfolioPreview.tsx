import React, { useState } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { PortfolioItem } from '../types';

interface PortfolioPreviewProps {
  onSeeAllWork: () => void;
  onOpenLightbox: (item: PortfolioItem) => void;
}

const PREVIEW_ORDER: { category: PortfolioItem['category']; label: string }[] = [
  { category: 'Real Estate', label: 'Real Estate' },
  { category: 'YouTube', label: 'YouTube' },
  { category: 'Talking Head', label: 'Talking Head' },
  { category: 'Reels', label: 'Reels & Shorts' },
];

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({
  onSeeAllWork,
  onOpenLightbox,
}) => {
  const previewItems = PREVIEW_ORDER.map((o) => ({
    item: PORTFOLIO_PROJECTS.find((p) => p.category === o.category)!,
    label: o.label,
  })).filter((x) => x.item);
  const [activeIndex, setActiveIndex] = useState(0);

  const { item: currentItem } = previewItems[activeIndex];
  const isVertical = currentItem.aspectRatio === '9:16';

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % previewItems.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + previewItems.length) % previewItems.length);

  return (
    <section id="portfolio-preview" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="font-hud text-xs text-brand-muted">(04)</span>
              <span className="h-px w-6 bg-border" />
              <span className="font-hud text-xs text-accent-brand">Case highlights</span>
            </div>
            <h2 className="font-mono-heading text-3xl sm:text-4xl md:text-5xl text-brand-primary uppercase">
              WORK YOU&apos;LL WANT TO <span className="text-accent-brand">WATCH</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-hud text-xs text-brand-muted mr-2 hidden sm:inline">
              0{activeIndex + 1} / 0{previewItems.length}
            </span>
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-lg border border-brand bg-elevated text-brand-primary hover:border-accent-brand hover:text-accent-brand transition-colors"
              aria-label="Previous preview project"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-lg border border-brand bg-elevated text-brand-primary hover:border-accent-brand hover:text-accent-brand transition-colors"
              aria-label="Next preview project"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div id="featured-preview-card" className="max-w-6xl mx-auto">
          {/* Hero player: 16:9 widescreen in a dark studio bezel */}
          <div
            className="rounded-[1.5rem] p-2 sm:p-3 border border-white/10"
            style={{
              background: 'linear-gradient(180deg, #15181B 0%, #0B0D0F 100%)',
              boxShadow: '0 40px 90px -40px rgba(0,0,0,0.9), 0 0 60px -20px var(--glow)',
            }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-label={`Play ${currentItem.title}`}
              onClick={() => onOpenLightbox(currentItem)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenLightbox(currentItem);
                }
              }}
              className="group relative aspect-video w-full rounded-xl overflow-hidden bg-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {isVertical && (
                <img
                  src={currentItem.thumbnailUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                />
              )}
              <img
                src={currentItem.thumbnailUrl}
                alt={currentItem.title}
                className={`relative w-full h-full transform group-hover:scale-[1.02] transition-transform duration-700 ${
                  isVertical ? 'object-contain' : 'object-cover'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

              <span className="absolute top-4 left-4 px-3 py-1 rounded-full font-hud text-[11px] pill-tint backdrop-blur-md">
                {currentItem.category}
              </span>
              <span className="absolute top-4 right-4 hidden sm:flex items-center gap-2 font-hud text-[10px] text-white/80 bg-black/50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC 00:14:48:23
              </span>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full btn-parrot flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                </span>
              </div>
            </div>
          </div>

          {/* Case details + specification panel */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 rounded-2xl card-surface">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-accent-brand animate-pulse" />
                <span className="font-hud text-xs text-brand-muted">Featured case study</span>
              </div>
              <h3 className="font-mono-heading text-2xl sm:text-3xl text-brand-primary uppercase mb-4">
                {currentItem.title}
              </h3>
              <p className="body-copy text-brand-secondary">{currentItem.description}</p>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between gap-6 lg:pl-8 lg:border-l border-subtle">
              <ul className="space-y-3">
                {currentItem.keyFeatures.slice(0, 3).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[0.95rem] leading-snug text-brand-primary/90">
                    <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full pill-tint flex items-center justify-center text-[11px] font-bold">
                      ✓
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onOpenLightbox(currentItem)}
                  className="flex-1 py-3.5 px-4 rounded-xl btn-parrot font-mono-ui text-xs uppercase flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Full Cut</span>
                </button>
                <button
                  onClick={onSeeAllWork}
                  className="py-3.5 px-5 rounded-xl border border-brand bg-elevated-2 text-brand-primary font-mono-ui font-semibold text-xs uppercase hover:border-accent-brand hover:text-accent-brand transition-all"
                >
                  View All Samples
                </button>
              </div>
            </div>
          </div>

          {/* Quick Select Tabs */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {previewItems.map(({ item, label }, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`px-4 py-2.5 rounded-full font-hud text-[11px] transition-all ${
                  activeIndex === idx
                    ? 'btn-parrot'
                    : 'border border-brand bg-elevated text-brand-secondary hover:text-brand-primary hover:border-accent-brand/50'
                }`}
              >
                0{idx + 1}. {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            id="portfolio-all-work-btn"
            onClick={onSeeAllWork}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-brand bg-elevated hover:border-accent-brand text-brand-primary font-mono-ui font-bold text-sm uppercase transition-all hover:shadow-lg"
          >
            <span>All Work</span>
            <span className="text-accent-brand group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};
