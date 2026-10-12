import React, { useState, useMemo } from 'react';
import { Play, Filter, Sparkles, ArrowLeft, ExternalLink, ArrowUpRight } from 'lucide-react';
import { PORTFOLIO_PROJECTS, getWhatsAppQuoteUrl } from '../data/portfolioData';
import { VideoCategory, PortfolioItem } from '../types';

interface PortfolioPageProps {
  initialCategory?: VideoCategory;
  onOpenLightbox: (item: PortfolioItem) => void;
  onBackToHome: () => void;
}

const CATEGORIES: VideoCategory[] = [
  'All',
  'YouTube',
  'Real Estate',
  'Home Tours',
  'Reels',
  'Talking Head',
  'General',
];

// Vertical Reels only appear under the Reels filter, never in "All"
const ALL_TAB_PROJECTS = PORTFOLIO_PROJECTS.filter((p) => p.category !== 'Reels');

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  initialCategory = 'All',
  onOpenLightbox,
  onBackToHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>(initialCategory);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return ALL_TAB_PROJECTS;
    return PORTFOLIO_PROJECTS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div id="portfolio-archive-page" className="min-h-screen pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-mono-ui font-semibold text-brand-secondary hover:text-accent-brand mb-8 group focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
              CASE ARCHIVE
            </span>
            <span className="h-px w-6 bg-border" />
            <span className="font-mono-ui text-xs text-brand-muted">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'} Shown
            </span>
          </div>

          <h1 className="font-mono-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary uppercase tracking-tight mb-3">
            ALL WORK
          </h1>

          <p className="text-base font-normal text-brand-secondary max-w-2xl leading-relaxed">
            Every category, one place. Filter by the kind of video you need to see real pacing,
            motion design, and audio mastering in action.
          </p>
        </div>

        {/* Filter Bar (Section 7) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar border-b border-subtle">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const count =
              cat === 'All'
                ? ALL_TAB_PROJECTS.length
                : PORTFOLIO_PROJECTS.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                id={`filter-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono-ui font-bold uppercase transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-accent-brand text-black shadow-sm'
                    : 'border border-brand bg-elevated text-brand-secondary hover:text-brand-primary hover:border-accent-brand/50'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/20 text-black' : 'bg-elevated-2 text-brand-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Masonry / Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((item) => (
            <div
              key={item.id}
              id={`portfolio-card-${item.id}`}
              className="group rounded-2xl border border-brand bg-elevated overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-accent-brand hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer"
              onClick={() => onOpenLightbox(item)}
            >
              {/* Media Thumbnail Container */}
              <div
                className={`relative w-full overflow-hidden bg-black ${
                  item.aspectRatio === '9:16' ? 'aspect-[9/14]' : 'aspect-video'
                }`}
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                {/* Center Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-accent-brand/90 backdrop-blur-md flex items-center justify-center text-black transform group-hover:scale-110 group-hover:bg-accent-brand transition-all shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-start">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono-ui font-bold text-accent uppercase">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-mono-heading text-lg font-bold text-brand-primary uppercase mb-2.5 group-hover:text-accent-brand transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-brand-secondary leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-subtle flex items-center justify-between">
                  <span className="text-xs font-mono-ui text-brand-muted">
                    {item.aspectRatio} Aspect
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono-ui font-bold text-accent-brand group-hover:underline">
                    <span>Watch Edit</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Custom Quote Banner */}
        <div className="mt-20 p-8 sm:p-10 rounded-2xl border border-brand bg-elevated-2 text-center flex flex-col items-center">
          <h2 className="font-mono-heading text-2xl sm:text-3xl font-bold text-brand-primary uppercase mb-3">
            NEED A VIDEO IN A DIFFERENT STYLE?
          </h2>
          <p className="text-sm text-brand-secondary max-w-lg mb-6 leading-relaxed">
            We adapt pacing, sound design, and color grading specifically to your brand aesthetics
            and platform requirements.
          </p>
          <a
            href={getWhatsAppQuoteUrl("Hi Cnoopsy, I'm looking for a custom video editing style not listed on the portfolio.")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-xl bg-accent-brand text-black font-mono-ui font-bold text-xs uppercase inline-flex items-center gap-2 hover:opacity-95 shadow-md"
          >
            <span>Request Custom Style Quote</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
