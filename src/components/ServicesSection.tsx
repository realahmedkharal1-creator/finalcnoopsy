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
      className="group h-full rounded-2xl card-surface overflow-hidden flex flex-col justify-between"
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
            <img
              src={service.thumbnailUrl}
              alt={service.title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors" />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white">
              <Play className="w-3 h-3 fill-current text-accent-brand" />
              Click to Preview Edit
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full btn-parrot flex items-center justify-center shadow-2xl transform group-hover/play:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </span>
            </span>
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-2 py-1 rounded bg-black/80 border border-white/15 font-hud text-[11px] text-accent">
                0{idx + 1}
              </span>
              <span className="px-2 py-1 rounded bg-black/70 border border-white/10 font-hud text-[10px] text-white/90">
                {service.category}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Card Content Information */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-mono-heading text-xl text-brand-primary uppercase group-hover:text-accent-brand transition-colors mb-3">
            {service.title}
          </h3>
          <p className="text-base text-brand-secondary leading-[1.65] mb-6">
            {service.description}
          </p>
        </div>

        {/* Tags & quote */}
        <div className="pt-4 border-t border-subtle flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 max-w-[60%]">
            {service.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full pill-tint font-hud text-[10px] truncate"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onGetQuote}
            className="inline-flex items-center gap-1 text-sm font-mono-ui font-bold text-accent-brand hover:text-accent-hover group/btn shrink-0"
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
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="font-hud text-xs text-brand-muted">(03)</span>
              <span className="h-px w-6 bg-border" />
              <span className="font-hud text-xs text-accent-brand">Specialized disciplines</span>
            </div>
            <h2 className="font-mono-heading text-3xl sm:text-4xl md:text-5xl text-brand-primary uppercase">
              WHAT WE <span className="text-accent-brand">EDIT</span>
            </h2>
          </div>
          <p className="text-base text-brand-secondary max-w-md">
            Platform-native video editing tailored to hold viewer attention and maximize retention.
            Click any card to play our sample edit.
          </p>
        </div>

        {/* 6 Services Grid (3 cols desktop, 2 tablet, 1 mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {SERVICES_DATA.map((service, idx) => (
            <ServiceVideoCard key={service.id} service={service} idx={idx} onGetQuote={onGetQuote} />
          ))}
        </div>
      </div>
    </section>
  );
};
