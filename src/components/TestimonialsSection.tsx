import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { TESTIMONIALS_DATA, FIVERR_URL } from '../data/portfolioData';

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex items-center gap-0.5 text-[1.15rem] leading-none" role="img" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} aria-hidden="true" style={{ color: 'var(--accent)' }}>
        ★
      </span>
    ))}
  </div>
);

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="font-hud text-xs text-brand-muted">(06)</span>
              <span className="h-px w-6 bg-border" />
              <span className="font-hud text-xs text-accent-brand">Proven satisfaction</span>
            </div>
            <h2 className="font-mono-heading text-3xl sm:text-4xl md:text-5xl text-brand-primary uppercase">
              WHAT CLIENTS <span className="text-accent-brand">SAY</span>
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full pill-tint font-hud text-[11px] self-start md:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-brand shrink-0" />
            <span>100% 5.0★ rated by US &amp; international clients</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS_DATA.map((item) => (
            <div
              key={item.id}
              id={`testimonial-${item.id}`}
              className="p-6 sm:p-8 rounded-2xl card-surface flex flex-col justify-between hover:-translate-y-1 group relative"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <Stars count={item.rating} />
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full pill-tint font-hud text-[10px]">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Verified client review ({item.location})</span>
                  </span>
                </div>

                <blockquote className="text-base sm:text-lg text-brand-primary leading-[1.65] mb-6">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              <div className="pt-4 border-t border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-brand-primary">{item.author}</span>
                <span className="px-2.5 py-1 rounded-full bg-elevated-2 border border-brand font-hud text-[10px] text-brand-secondary w-fit">
                  {item.projectType}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={FIVERR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-brand-secondary hover:text-accent-brand transition-colors"
          >
            <span>See the full review history</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
