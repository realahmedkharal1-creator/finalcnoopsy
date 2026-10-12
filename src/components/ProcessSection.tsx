import React from 'react';
import { PROCESS_STEPS } from '../data/portfolioData';
import { ArrowRight, Check } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  return (
    <section id="process" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="font-mono-ui text-xs font-bold text-brand-muted tracking-widest">
                (#####)
              </span>
              <span className="h-px w-6 bg-border" />
              <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
                PRODUCTION PIPELINE
              </span>
            </div>
            <h2 className="font-mono-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary uppercase">
              HOW A PROJECT WORKS
            </h2>
          </div>
          <p className="text-sm font-mono-ui text-brand-secondary max-w-md">
            A frictionless workflow designed for creators and businesses who need speed without
            compromising craft.
          </p>
        </div>

        {/* 2-Column Numbered List (3 items per column on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={step.number}
              id={`process-step-${step.number}`}
              className="p-6 sm:p-7 rounded-2xl border border-brand bg-elevated transition-all duration-300 hover:border-accent-brand hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-heading text-2xl sm:text-3xl font-bold text-accent-brand">
                    {step.number}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-elevated-2 border border-brand text-[10px] font-mono-ui text-brand-muted uppercase">
                    Stage {step.number}
                  </span>
                </div>

                <h3 className="font-mono-heading text-lg sm:text-xl font-bold text-brand-primary uppercase mb-3 group-hover:text-accent-brand transition-colors">
                  {step.title}
                </h3>

                <p className="text-sm text-brand-secondary font-normal leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-subtle flex items-center justify-between text-xs font-mono-ui text-brand-muted">
                <span>Phase 0{idx + 1} of 06</span>
                <span className="text-accent-brand">
                  {idx === PROCESS_STEPS.length - 1 ? "✓ Final Step" : "→ Next Step"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
