import React, { useState } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import { SERVICES_DATA } from '../data/portfolioData';
import { ServiceItem } from '../types';

interface ServiceVideoCardProps {
  service: ServiceItem;
  idx: number;
  onGetQuote: () => void;
}

const ServiceVideoCard: React.FC<ServiceVideoCardProps> = ({ service, idx, onGetQuote }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      id={`service-card-${service.id}`}
      className="group rounded-2xl border border-brand bg-elevated overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-accent-brand hover:shadow-2xl"
    >
      {/* Video stage: thumbnail first, YouTube player on click */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black border-b border-subtle">
        {isPlaying && service.youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${service.youtubeId}?autoplay=1&rel=0`}
            title={service.title}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group/play absolute inset-0 w-full h-full text-left"
            aria-label={`Play ${service.title} video`}
          >
            <img src={service.thumbnailUrl} alt={service.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
              <span className="w-14 h-14 rounded-full bg-accent-brand text-black flex items-center justify-center shadow-2xl transform group-hover/play:scale-110 transition-all">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </span>
              <span className="text-[11px] font-mono-ui font-bold text-white bg-black/80 px-3 py-1 rounded-full border border-white/15">
                Click to Watch Edit
              </span>
            </div>
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-black/85 border border-white/15 font-mono-ui text-[11px] text-accent font-bold">
                0{idx + 1}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-[10px] font-mono-ui text-white/90 uppercase font-semibold">
                {service.category}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Card Content Information */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-mono-heading text-lg font-bold text-brand-primary uppercase group-hover:text-accent-brand transition-colors mb-2">
            {service.title}
          </h3>
          <p className="text-sm text-brand-secondary leading-relaxed mb-5 font-normal">
            {service.description}
          </p>
        </div>

        {/* Tags & quote */}
        <div className="pt-4 border-t border-subtle flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 max-w-[60%]">
            {service.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-elevated-2 text-[10px] font-mono-ui text-brand-muted truncate"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onGetQuote}
            className="inline-flex items-center gap-1 text-xs font-mono-ui font-bold text-accent-brand hover:underline group/btn shrink-0"
          >
            <span>Get a Quote</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ServicesSectionProps {
  onGetQuote: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onGetQuote }) => {
  return (
    <section id="services" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="font-mono-ui text-xs font-bold text-brand-muted tracking-widest">
                (###)
              </span>
              <span className="h-px w-6 bg-border" />
              <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
                SPECIALIZED DISCIPLINES
              </span>
            </div>
            <h2 className="font-mono-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary uppercase">
              WHAT WE EDIT
            </h2>
          </div>
          <p className="text-sm font-mono-ui text-brand-secondary max-w-md">
            Platform-native video editing tailored to hold viewer attention and maximize retention.
            Click any card to play our sample edit.
          </p>
        </div>

        {/* 6 Services Grid (3 cols desktop, 2 tablet, 1 mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service, idx) => (
            <ServiceVideoCard key={service.id} service={service} idx={idx} onGetQuote={onGetQuote} />
          ))}
        </div>
      </div>
    </section>
  );
};
