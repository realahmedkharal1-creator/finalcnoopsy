import React from 'react';
import { Zap, Clock, Sparkles, Layers, Sliders, Cpu } from 'lucide-react';
import { EDITING_SOFTWARE_TOOLS, AHMED_CONFIG } from '../data/portfolioData';

export const WhyCnoopsy: React.FC = () => {
  return (
    <section id="why-cnoopsy" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="font-mono-ui text-xs font-bold text-brand-muted tracking-widest">
              (##)
            </span>
            <span className="h-px w-6 bg-border" />
            <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
              UNCOMPROMISED POST-PRODUCTION
            </span>
          </div>
          <h2 className="font-mono-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary uppercase">
            WHY CNOOPSY
          </h2>
        </div>

        {/* 3-Card Grid (1 Large Card + 2 Stacked Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Large Card — Editing Toolkit (7 cols) */}
          <div
            id="card-editing-toolkit"
            className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-brand bg-elevated flex flex-col justify-between transition-all duration-300 hover:border-accent-brand hover:-translate-y-1 hover:shadow-xl group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-elevated-2 border border-brand flex items-center justify-center text-accent-brand">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h3 className="font-mono-heading text-lg sm:text-xl font-bold text-brand-primary uppercase">
                    Editing Toolkit
                  </h3>
                </div>
                <span className="text-[11px] font-mono-ui text-brand-muted uppercase">
                  Studio Standard
                </span>
              </div>

              {/* Tool Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {EDITING_SOFTWARE_TOOLS.map((tool) => (
                  <div
                    key={tool.name}
                    className="p-3.5 rounded-xl border border-brand bg-elevated-2 hover:border-accent-brand/50 transition-all flex flex-col justify-between group/tool"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="w-8 h-8 rounded-lg bg-page border border-brand group-hover/tool:border-accent-brand flex items-center justify-center text-xs font-mono-ui font-bold text-accent-brand transition-colors">
                        {tool.badge}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-brand" />
                    </div>
                    <p className="font-mono-heading text-xs font-bold text-brand-primary uppercase">
                      {tool.name}
                    </p>
                    <p className="text-[11px] text-brand-secondary mt-0.5">{tool.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm sm:text-base text-brand-secondary font-normal leading-relaxed border-t border-subtle pt-5">
              Every video is cut, graded, and sound-designed with professional tools — not templated
              auto-editors. That's the difference between content that looks made and content that
              looks found.
            </p>
          </div>

          {/* 2 Stacked Cards on the Right (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Small Card 1 — Fast Turnaround */}
            <div
              id="card-fast-turnaround"
              className="flex-1 p-6 sm:p-7 rounded-2xl border border-brand bg-elevated flex flex-col justify-between transition-all duration-300 hover:border-accent-brand hover:-translate-y-1 hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-elevated-2 border border-brand flex items-center justify-center text-accent-brand">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="font-mono-heading text-base sm:text-lg font-bold text-brand-primary uppercase">
                      Fast Turnaround
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-accent-brand/10 border border-accent-brand/30 text-[11px] font-mono-ui font-bold text-accent-brand">
                    {AHMED_CONFIG.typicalTurnaround}
                  </span>
                </div>

                <p className="text-sm text-brand-secondary font-normal leading-relaxed mt-3">
                  Most projects are delivered within{' '}
                  <span className="font-bold text-brand-primary">
                    {AHMED_CONFIG.typicalTurnaround}
                  </span>{' '}
                  of receiving footage and brief — because a video sitting in an editing queue
                  doesn't grow anyone's channel.
                </p>
              </div>

              <div className="text-[10px] font-mono-ui text-brand-muted mt-4 pt-3 border-t border-subtle flex items-center justify-between">
                <span>Direct Slack / WhatsApp Channel</span>
                <span className="text-accent-brand">High Priority</span>
              </div>
            </div>

            {/* Small Card 2 — Editor + Strategist Mindset */}
            <div
              id="card-editor-strategist"
              className="flex-1 p-6 sm:p-7 rounded-2xl border border-brand bg-elevated flex flex-col justify-between transition-all duration-300 hover:border-accent-brand hover:-translate-y-1 hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-elevated-2 border border-brand flex items-center justify-center text-accent-brand">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <h3 className="font-mono-heading text-base sm:text-lg font-bold text-brand-primary uppercase">
                      Editor + Strategist Mindset
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 my-2">
                  <span className="px-2.5 py-1 rounded bg-elevated-2 border border-brand text-[11px] font-mono-ui font-bold text-brand-primary">
                    EDITOR
                  </span>
                  <span className="text-accent-brand font-mono-ui font-bold">+</span>
                  <span className="px-2.5 py-1 rounded bg-accent-brand text-black text-[11px] font-mono-ui font-bold">
                    STRATEGIST
                  </span>
                </div>

                <p className="text-sm text-brand-secondary font-normal leading-relaxed mt-3">
                  Cnoopsy doesn't just follow a cut list — it thinks about hooks, pacing, and what
                  keeps a viewer from scrolling away, on every single project.
                </p>
              </div>

              <div className="text-[10px] font-mono-ui text-brand-muted mt-4 pt-3 border-t border-subtle flex items-center justify-between">
                <span>Audience Retention Focused</span>
                <span className="text-accent-brand">Algorithmic Insight</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
