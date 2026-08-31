import React from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { TESTIMONIALS_DATA, FIVERR_URL } from '../data/portfolioData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="font-mono-ui text-xs font-bold text-brand-muted tracking-widest">
                (######)
              </span>
              <span className="h-px w-6 bg-border" />
              <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
                PROVEN SATISFACTION
              </span>
            </div>
            <h2 className="font-mono-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary uppercase">
              WHAT CLIENTS SAY
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono-ui text-brand-muted">
            <span className="w-2 h-2 rounded-full bg-accent-brand" />
            <span>100% 5.0 Star Rated on Fiverr</span>
          </div>
        </div>

        {/* 4 Cards Grid / Mobile Scroll-Snap Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS_DATA.map((item) => (
            <div
              key={item.id}
              id={`testimonial-${item.id}`}
              className="p-6 sm:p-8 rounded-2xl border border-brand bg-elevated flex flex-col justify-between transition-all duration-300 hover:border-accent-brand hover:-translate-y-1 hover:shadow-xl group relative"
            >
              <div>
                {/* 5-Star Rating Row + Platform Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-elevated-2 border border-brand text-[11px] font-mono-ui text-brand-muted">
                    <CheckCircle className="w-3 h-3 text-accent-brand" />
                    <span>Verified {item.platform} Review</span>
                  </span>
                </div>

                {/* Verbatim Quote */}
                <blockquote className="text-base sm:text-lg text-brand-primary font-normal leading-relaxed mb-6">
                  "{item.quote}"
                </blockquote>
              </div>

              {/* Attribution Line */}
              <div className="pt-4 border-t border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-ui text-brand-muted">
                <div>
                  <span className="font-bold text-brand-primary font-mono-heading">
                    {item.author}
                  </span>
                  <span className="text-brand-secondary"> · {item.platform} ({item.location})</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-elevated-2 text-[10px] text-accent-brand w-fit">
                  {item.projectType}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Fiverr Link under Reviews */}
        <div className="mt-10 text-center">
          <a
            href={FIVERR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono-ui text-brand-secondary hover:text-accent-brand transition-colors"
          >
            <span>View full review history and feedback on Fiverr</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
