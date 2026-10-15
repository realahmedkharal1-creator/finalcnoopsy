import React from 'react';
import { PROCESS_STEPS } from '../data/portfolioData';

export const ProcessSection: React.FC = () => {
  const total = PROCESS_STEPS.length;
  return (
    <section id="process" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="font-hud text-xs text-brand-muted">(05)</span>
              <span className="h-px w-6 bg-border" />
              <span className="font-hud text-xs text-accent-brand">Production pipeline</span>
            </div>
            <h2 className="font-mono-heading text-3xl sm:text-4xl md:text-5xl text-brand-primary uppercase">
              HOW A PROJECT <span className="text-accent-brand">WORKS</span>
            </h2>
          </div>
          <p className="text-base text-brand-secondary max-w-md">
            A frictionless workflow designed for creators and businesses who need speed without
            compromising craft.
          </p>
        </div>

        {/* Numbered pipeline (2 columns on desktop) */}
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 list-none p-0 m-0">
          {PROCESS_STEPS.map((step, idx) => {
            const isLast = idx === total - 1;
            const isLeftCol = idx % 2 === 0;
            return (
              <li
                key={step.number}
                id={`process-step-${step.number}`}
                className="relative p-6 sm:p-7 rounded-2xl card-surface hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-hud text-[28px] leading-none text-accent-brand">{step.number}</span>
                    <span className="px-2.5 py-1 rounded-full bg-elevated-2 border border-brand font-hud text-[10px] text-brand-muted">
                      Stage {step.number}
                    </span>
                  </div>

                  <h3 className="font-mono-heading text-xl sm:text-2xl text-brand-primary uppercase mb-3 group-hover:text-accent-brand transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-base text-brand-secondary leading-[1.65]">{step.description}</p>
                </div>

                {/* Non-interactive deliverable / turnaround indicator */}
                <div className="mt-6 pt-4 border-t border-subtle">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full pill-tint font-hud text-[11px] cursor-default select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-brand" />
                    Step {step.number} of 0{total} • {step.timing}
                  </span>
                </div>

                {/* Directional flow connectors */}
                {!isLast && (
                  <>
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-[1.65rem] left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-page border border-brand text-accent-brand flex items-center justify-center text-sm ${
                        isLeftCol ? 'md:hidden' : ''
                      }`}
                    >
                      ↓
                    </span>
                    {isLeftCol && (
                      <span
                        aria-hidden="true"
                        className="hidden md:flex absolute top-1/2 -right-[1.15rem] -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-page border border-brand text-accent-brand items-center justify-center text-sm"
                      >
                        →
                      </span>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
