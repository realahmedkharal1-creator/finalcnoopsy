import React from 'react';
import { Clock, Sliders, Cpu } from 'lucide-react';
import { EDITING_SOFTWARE_TOOLS, AHMED_CONFIG } from '../data/portfolioData';

export const WhyCnoopsy: React.FC = () => {
  return (
    <section id="why-cnoopsy" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-hud text-xs text-brand-muted">(02)</span>
            <span className="h-px w-6 bg-border" />
            <span className="font-hud text-xs text-accent-brand">Why Cnoopsy</span>
          </div>
          <h2 className="font-mono-heading text-3xl sm:text-4xl md:text-5xl text-brand-primary uppercase max-w-3xl">
            BUILT FOR RETENTION, <span className="text-accent-brand">NOT JUST CUTS.</span>
          </h2>
        </div>

        {/* Bento: toolkit (large) + 2 stacked cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 3 — Uncompromised Craft & Toolkit (7 cols) */}
          <div
            id="card-editing-toolkit"
            className="lg:col-span-7 p-6 sm:p-8 rounded-2xl card-surface flex flex-col justify-between hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-xl pill-tint flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="font-mono-heading text-xl sm:text-2xl text-brand-primary uppercase">
                    Uncompromised Craft &amp; Toolkit
                  </h3>
                </div>
              </div>

              <p className="body-copy text-brand-secondary mb-7">
                Every frame is cut, color-graded, motion-tracked, and sound-designed by hand — zero cheap
                AI auto-templates.
              </p>

              {/* Software pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {EDITING_SOFTWARE_TOOLS.map((tool) => (
                  <div
                    key={tool.name}
                    className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-brand bg-elevated-2 hover:border-accent-brand/60 transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="w-8 h-8 rounded-lg border border-brand bg-page flex items-center justify-center font-hud text-[11px] text-accent-brand"
                    >
                      {tool.badge}
                    </span>
                    <span className="text-sm font-semibold text-brand-primary whitespace-nowrap">
                      {tool.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-subtle pt-5 flex items-center justify-between gap-3 font-hud text-[11px] text-brand-muted">
              <span>Hand-built timelines</span>
              <span className="text-accent-brand">Studio Standard</span>
            </div>
          </div>

          {/* 2 Stacked Cards on the Right (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Card 1 — 48–72 Hour Turnaround */}
            <div
              id="card-fast-turnaround"
              className="flex-1 p-6 sm:p-7 rounded-2xl card-surface flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-xl pill-tint flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="font-mono-heading text-lg sm:text-xl text-brand-primary uppercase">
                      48–72 Hour Turnaround
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full pill-tint font-hud text-[10px] shrink-0">
                    Fast
                  </span>
                </div>
                <p className="text-brand-secondary text-base leading-[1.65]">
                  Most edits are delivered within {AHMED_CONFIG.typicalTurnaround} of receiving your footage
                  and brief — because a great video sitting in a post-production queue doesn&apos;t grow your
                  channel or close listings.
                </p>
              </div>
            </div>

            {/* Card 2 — Strategist Mindset */}
            <div
              id="card-editor-strategist"
              className="flex-1 p-6 sm:p-7 rounded-2xl card-surface flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl pill-tint flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="font-mono-heading text-lg sm:text-xl text-brand-primary uppercase">
                    Strategist Mindset
                  </h3>
                </div>
                <p className="text-brand-secondary text-base leading-[1.65]">
                  We don&apos;t just follow a cut list. Every timeline is structured around the first 3-second
                  hook, pattern interrupts, sound risers, and visual pacing that stop viewers from scrolling
                  away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
