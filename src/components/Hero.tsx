import React, { useState } from 'react';
import { ArrowUpRight, Play, CheckCircle2 } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { PortfolioItem, VideoCategory } from '../types';

interface HeroProps {
  onSeeWork: () => void;
  onGetQuote: () => void;
  onOpenLightbox: (item: PortfolioItem) => void;
}

const HERO_TABS: { label: string; category: Exclude<VideoCategory, 'All'> }[] = [
  { label: '01. Real Estate', category: 'Real Estate' },
  { label: '02. YouTube', category: 'YouTube' },
  { label: '03. Talking Head', category: 'Talking Head' },
  { label: '04. Reels & Shorts', category: 'Reels' },
];

export const Hero: React.FC<HeroProps> = ({ onSeeWork, onGetQuote, onOpenLightbox }) => {
  // Vertical Reels are only shown in the Reels section of the Work page, plus the hero Reels tab
  const showcase = PORTFOLIO_PROJECTS.filter((p) => p.category !== 'Reels');
  const [activeTab, setActiveTab] = useState(0);
  const featuredItem =
    PORTFOLIO_PROJECTS.find((p) => p.category === HERO_TABS[activeTab].category) ?? PORTFOLIO_PROJECTS[0];
  const isVertical = featuredItem.aspectRatio === '9:16';

  return (
    <section
      id="hero"
      className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden border-b border-brand"
    >
      {/* Background Soft Glow Radial Blobs */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] max-w-full rounded-full pointer-events-none opacity-40 blur-[120px]"
        style={{ background: 'var(--glow-strong)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start min-w-0">
            {/* Eyebrow badge */}
            <div className="inline-flex items-start sm:items-center gap-2 mb-6 px-3.5 py-2 rounded-2xl sm:rounded-full pill-tint font-hud text-[11px] sm:text-xs leading-snug max-w-full">
              <span className="w-1.5 h-1.5 mt-1 sm:mt-0 rounded-full bg-accent-brand animate-pulse shrink-0" />
              <span>Post-production studio for creators &amp; brands</span>
            </div>

            {/* Headline H1 */}
            <h1
              id="hero-headline"
              className="font-mono-heading text-[2rem] sm:text-5xl lg:text-[3.5rem] text-brand-primary uppercase mb-6 break-words"
            >
              YOUR RAW FOOTAGE, ENGINEERED TO <span className="text-accent-brand">KEEP VIEWERS WATCHING.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-brand-secondary leading-[1.65] max-w-[65ch] mb-9">
              From high-retention YouTube long-form and viral Reels to luxury real estate walkthroughs —
              Cnoopsy transforms raw timelines into polished, story-driven edits built for algorithmic reach
              and real-world conversions.
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-10 w-full sm:w-auto">
              <button
                id="hero-primary-cta"
                type="button"
                onClick={onGetQuote}
                className="group flex items-center justify-center gap-2 px-7 py-4 rounded-xl btn-parrot font-mono-ui text-sm uppercase focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span>Get a Custom Quote</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                id="hero-secondary-cta"
                type="button"
                onClick={() => onOpenLightbox(showcase[0])}
                className="group flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-md text-brand-primary font-mono-ui font-semibold text-sm uppercase transition-all duration-200 hover:bg-white/[0.1] hover:border-accent-brand focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span className="w-6 h-6 rounded-full bg-accent-brand text-on-accent flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span>Watch Showreel</span>
              </button>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-mono-ui text-brand-secondary pt-5 border-t border-subtle w-full">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent-brand" />
                <span>Custom Platform Pacing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent-brand" />
                <span>100% Bespoke Sound &amp; Color</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent-brand" />
                <span>Rapid Revision Cycle</span>
              </div>
            </div>
          </div>

          {/* Right Column — NLE-style showcase */}
          <div className="lg:col-span-5 relative min-w-0">
            <div
              id="hero-featured-card"
              className="relative rounded-2xl border border-brand bg-elevated overflow-hidden"
              style={{ boxShadow: '0 30px 80px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)' }}
            >
              {/* HUD title bar */}
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-subtle bg-elevated-2 font-hud text-[10px] text-brand-muted">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-brand-secondary">REC</span>
                  <span>00:14:48:23</span>
                </span>
                <span className="truncate">SEQ_01 · {featuredItem.category}</span>
              </div>

              {/* Monitor */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`Play ${featuredItem.title}`}
                onClick={() => onOpenLightbox(featuredItem)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenLightbox(featuredItem);
                  }
                }}
                className="group relative aspect-video w-full overflow-hidden bg-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {isVertical && (
                  <img
                    src={featuredItem.thumbnailUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110"
                  />
                )}
                <img
                  src={featuredItem.thumbnailUrl}
                  alt={featuredItem.title}
                  className={`relative w-full h-full transform group-hover:scale-[1.03] transition-transform duration-500 ${
                    isVertical ? 'object-contain' : 'object-cover'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none" />

                {/* Corner crop marks */}
                {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((c) => (
                  <span key={c} aria-hidden="true" className={`absolute w-4 h-4 border-white/50 pointer-events-none ${c}`} />
                ))}

                {/* Title (bottom-left) */}
                <div className="absolute left-4 bottom-4 right-24 pointer-events-none">
                  <span className="inline-block mb-1.5 px-2 py-0.5 rounded font-hud text-[10px] pill-tint">
                    {featuredItem.category}
                  </span>
                  <p className="font-mono-heading text-sm sm:text-base text-white uppercase line-clamp-2">
                    {featuredItem.title}
                  </p>
                </div>

                {/* Play trigger tucked bottom-right so the subject stays visible */}
                <span className="absolute right-4 bottom-4 w-14 h-14 rounded-full btn-parrot flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </span>
              </div>

              {/* Timeline scrubber */}
              <div className="px-3.5 py-2.5 border-t border-subtle bg-elevated-2" aria-hidden="true">
                <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-accent-brand" />
                </div>
                <div className="mt-1.5 flex justify-between font-hud text-[9px] text-brand-muted">
                  <span>00:00</span>
                  <span>V1 · A1 · A2</span>
                  <span>03:00</span>
                </div>
              </div>
            </div>

            {/* Category tabs */}
            <div role="tablist" aria-label="Featured work categories" className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HERO_TABS.map((t, i) => (
                <button
                  key={t.category}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === i}
                  onClick={() => setActiveTab(i)}
                  className={`px-2 py-2.5 rounded-lg font-hud text-[10px] leading-tight transition-all focus:outline-none focus:ring-2 focus:ring-accent ${
                    activeTab === i
                      ? 'btn-parrot'
                      : 'border border-brand bg-elevated text-brand-secondary hover:text-brand-primary hover:border-accent-brand/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Two-Column Tag Strip Below Hero (Section 6.1) */}
        <div className="mt-16 pt-10 border-t border-brand">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Block */}
            <div className="p-5 rounded-xl border border-brand bg-elevated flex flex-col justify-between">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-elevated-2 border border-brand text-xs font-mono-ui font-semibold text-brand-primary uppercase">
                  YouTube
                </span>
                <span className="px-2.5 py-1 rounded-full bg-elevated-2 border border-brand text-xs font-mono-ui font-semibold text-brand-primary uppercase">
                  Podcasts
                </span>
                <span className="px-2.5 py-1 rounded-full bg-elevated-2 border border-brand text-xs font-mono-ui font-semibold text-brand-primary uppercase">
                  Talking Head
                </span>
              </div>
              <p className="text-base text-brand-secondary font-normal leading-relaxed">
                Long-form and short-form editing for creators who publish on a schedule.
              </p>
            </div>

            {/* Right Block */}
            <div className="p-5 rounded-xl border border-brand bg-elevated flex flex-col justify-between">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-elevated-2 border border-brand text-xs font-mono-ui font-semibold text-brand-primary uppercase">
                  Real Estate
                </span>
                <span className="px-2.5 py-1 rounded-full bg-elevated-2 border border-brand text-xs font-mono-ui font-semibold text-brand-primary uppercase">
                  Home Tours
                </span>
                <span className="px-2.5 py-1 rounded-full bg-elevated-2 border border-brand text-xs font-mono-ui font-semibold text-brand-primary uppercase">
                  Reels
                </span>
              </div>
              <p className="text-base text-brand-secondary font-normal leading-relaxed">
                Property walkthroughs and social content that get listings — and profiles — noticed.
              </p>
            </div>
          </div>

          {/* Thin Strip Image / Thumbnail Collage */}
          <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {showcase.map((p) => (
              <button
                key={p.id}
                onClick={() => onOpenLightbox(p)}
                className="group relative aspect-video rounded-lg overflow-hidden border border-brand bg-black text-left cursor-pointer focus:outline-none"
                title={p.title}
              >
                <img
                  src={p.thumbnailUrl}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-70 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[10px] font-hud text-white font-bold truncate">
                    {p.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
