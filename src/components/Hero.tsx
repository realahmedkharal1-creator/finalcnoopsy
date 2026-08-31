import React from 'react';
import { ArrowUpRight, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { getWhatsAppQuoteUrl, PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { PortfolioItem } from '../types';

interface HeroProps {
  onSeeWork: () => void;
  onOpenLightbox: (item: PortfolioItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSeeWork, onOpenLightbox }) => {
  const featuredItem = PORTFOLIO_PROJECTS[0]; // Real Estate featured
  const secondaryItem1 = PORTFOLIO_PROJECTS[1]; // YouTube featured
  const secondaryItem2 = PORTFOLIO_PROJECTS[2]; // Reels featured

  return (
    <section
      id="hero"
      className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden border-b border-brand"
    >
      {/* Background Soft Glow Radial Blobs */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none opacity-40 blur-[120px]"
        style={{ background: 'var(--glow-strong)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (55%) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Monospace Section Index Marker */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="font-mono-ui text-xs font-bold text-brand-muted tracking-widest">
                (#)
              </span>
              <span className="h-px w-6 bg-border" />
              <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
                VIDEO EDITING & CONTENT PRODUCTION
              </span>
            </div>

            {/* Headline H1 */}
            <h1
              id="hero-headline"
              className="font-mono-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-brand-primary uppercase leading-[1.08] tracking-tight mb-6"
            >
              YOUR FOOTAGE, EDITED BY PEOPLE WHO UNDERSTAND WHAT MAKES VIEWERS <span className="text-accent-brand">STAY</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-brand-secondary leading-relaxed max-w-2xl mb-8 font-normal">
              From YouTube long-form to real estate walkthroughs to scroll-stopping Reels — Cnoopsy
              turns raw footage into content built to hold attention and get results.
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <a
                id="hero-primary-cta"
                href={getWhatsAppQuoteUrl("Hi Cnoopsy, I'd like to talk about a video editing project.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-accent-brand text-black font-mono-ui font-bold text-sm uppercase transition-all duration-200 hover:opacity-95 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span>Get a Custom Quote</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <button
                id="hero-secondary-cta"
                onClick={onSeeWork}
                className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-brand bg-elevated text-brand-primary font-mono-ui font-semibold text-sm uppercase transition-all duration-200 hover:border-accent-brand hover:text-accent-brand focus:outline-none"
              >
                <span>See Our Work</span>
                <span className="text-accent-brand group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-mono-ui text-brand-muted pt-2 border-t border-subtle w-full">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-brand" />
                <span>Custom Platform Pacing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-brand" />
                <span>100% Bespoke Sound & Color</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-brand" />
                <span>Rapid Revision Cycle</span>
              </div>
            </div>
          </div>

          {/* Right Column (45%) — Cinematic Collage */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            {/* Stacked Offset Decorative Card 2 (Back) */}
            <div
              className="absolute -top-4 -right-4 w-full h-full rounded-2xl border border-brand bg-elevated/40 transform rotate-3 scale-95 pointer-events-none -z-10 hidden sm:block"
              style={{ boxShadow: '0 10px 40px var(--glow)' }}
            />

            {/* Stacked Offset Decorative Card 1 (Mid) */}
            <div className="absolute -top-2 -left-2 w-full h-full rounded-2xl border border-brand bg-elevated/70 transform -rotate-2 scale-98 pointer-events-none -z-10 hidden sm:block" />

            {/* Front Featured Card */}
            <div
              id="hero-featured-card"
              onClick={() => onOpenLightbox(featuredItem)}
              className="group relative rounded-2xl border border-brand bg-elevated overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent-brand hover:shadow-2xl"
            >
              {/* Aspect Ratio 16:9 Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={featuredItem.thumbnailUrl}
                  alt={featuredItem.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent-brand/90 backdrop-blur-md flex items-center justify-center text-black transform group-hover:scale-110 group-hover:bg-accent-brand transition-all shadow-lg">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>

                {/* Top Badge: Category */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono-ui font-bold text-accent uppercase">
                    {featuredItem.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono-ui text-white/80">
                    {featuredItem.duration}
                  </span>
                </div>

                {/* Bottom Card Title Banner */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <p className="font-mono-heading text-sm sm:text-base font-bold text-white uppercase line-clamp-1 mb-0.5">
                    {featuredItem.title}
                  </p>
                  <p className="text-xs text-white/70 line-clamp-1">
                    {featuredItem.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Peeking Mini Thumbnail Accents */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => onOpenLightbox(secondaryItem1)}
                className="flex-1 flex items-center gap-2.5 p-2 rounded-lg border border-brand bg-elevated hover:border-accent-brand transition-all text-left group"
              >
                <div className="relative w-12 h-8 rounded overflow-hidden bg-black shrink-0">
                  <img
                    src={secondaryItem1.thumbnailUrl}
                    alt={secondaryItem1.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 text-accent-brand fill-current" />
                  </div>
                </div>
                <div className="overflow-hidden">
                  <span className="block text-[10px] font-mono-ui text-accent-brand uppercase font-bold">
                    YouTube Edit
                  </span>
                  <span className="block text-xs font-mono-heading text-brand-primary truncate">
                    {secondaryItem1.title}
                  </span>
                </div>
              </button>

              <button
                onClick={() => onOpenLightbox(secondaryItem2)}
                className="flex-1 flex items-center gap-2.5 p-2 rounded-lg border border-brand bg-elevated hover:border-accent-brand transition-all text-left group"
              >
                <div className="relative w-12 h-8 rounded overflow-hidden bg-black shrink-0">
                  <img
                    src={secondaryItem2.thumbnailUrl}
                    alt={secondaryItem2.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 text-accent-brand fill-current" />
                  </div>
                </div>
                <div className="overflow-hidden">
                  <span className="block text-[10px] font-mono-ui text-accent-brand uppercase font-bold">
                    Reel Edit
                  </span>
                  <span className="block text-xs font-mono-heading text-brand-primary truncate">
                    {secondaryItem2.title}
                  </span>
                </div>
              </button>
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
              <p className="text-sm text-brand-secondary font-normal leading-relaxed">
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
              <p className="text-sm text-brand-secondary font-normal leading-relaxed">
                Property walkthroughs and social content that get listings — and profiles — noticed.
              </p>
            </div>
          </div>

          {/* Thin Strip Image / Thumbnail Collage */}
          <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {PORTFOLIO_PROJECTS.map((p, idx) => (
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
                  <span className="text-[10px] font-mono-ui text-white font-bold truncate">
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
