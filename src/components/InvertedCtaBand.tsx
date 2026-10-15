import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { ThemeMode } from '../types';

interface InvertedCtaBandProps {
  theme: ThemeMode;
  onGetQuote: () => void;
}

const FPS = 24;
const START_FRAMES = ((0 * 60 + 14) * 60 + 48) * FPS + 23; // 00:14:48:23

const formatTimecode = (total: number) => {
  const f = total % FPS;
  const secs = Math.floor(total / FPS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(secs / 3600))}:${pad(Math.floor(secs / 60) % 60)}:${pad(secs % 60)}:${pad(f)}`;
};

export const InvertedCtaBand: React.FC<InvertedCtaBandProps> = ({ onGetQuote }) => {
  // Decorative running studio timecode, starting at 00:14:48:23
  const [frames, setFrames] = useState(START_FRAMES);

  useEffect(() => {
    const interval = setInterval(() => setFrames((f) => f + 1), Math.round(1000 / FPS));
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="cta-band"
      className="py-16 lg:py-24 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--inv-bg)',
        color: 'var(--inv-text-primary)',
        borderTop: '1px solid var(--inv-border)',
        borderBottom: '1px solid var(--inv-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* NLE timeline frame */}
        <div
          className="relative rounded-3xl p-7 sm:p-10 lg:p-14"
          style={{
            border: '1px solid var(--inv-border)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))',
          }}
        >
          {['top-3 left-3 border-t border-l', 'top-3 right-3 border-t border-r', 'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'].map((c) => (
            <span key={c} aria-hidden="true" className={`absolute w-4 h-4 border-white/30 ${c}`} />
          ))}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: statement & CTA */}
            <div className="lg:col-span-7 flex flex-col items-start min-w-0">
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="font-hud text-xs" style={{ color: 'var(--inv-text-secondary)' }}>
                  (07)
                </span>
                <span className="h-px w-6" style={{ backgroundColor: 'var(--inv-border)' }} />
                <span className="font-hud text-xs" style={{ color: 'var(--inv-accent)' }}>
                  Next-level production
                </span>
              </div>

              <h2 className="font-mono-heading text-3xl sm:text-4xl lg:text-[2.75rem] uppercase mb-8 break-words">
                WE EDIT VIDEO THAT DOESN&apos;T JUST LOOK GOOD — IT GETS{' '}
                <span style={{ color: 'var(--inv-accent)' }}>WATCHED, SHARED, AND ACTED ON.</span>
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                <button
                  id="cta-band-whatsapp-btn"
                  type="button"
                  onClick={onGetQuote}
                  className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl btn-parrot font-mono-ui text-sm uppercase focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <span>Get a Custom Quote</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>

                <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--inv-text-secondary)' }}>
                  Grow past generic content. Talk to Cnoopsy about your next video.
                </p>
              </div>
            </div>

            {/* Right: timecode + mini collage */}
            <div className="lg:col-span-5 flex flex-col gap-4 min-w-0">
              <div
                className="p-5 sm:p-6 rounded-2xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--inv-bg-elevated)', borderColor: 'var(--inv-border)' }}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-hud text-[11px]" style={{ color: 'var(--inv-text-secondary)' }}>
                      REC
                    </span>
                  </div>
                  <span className="font-hud text-[11px] px-2 py-0.5 rounded pill-tint">4K 24FPS</span>
                </div>

                <div
                  className="font-hud text-3xl sm:text-4xl my-2 select-all tabular-nums break-all"
                  style={{ letterSpacing: '0.04em' }}
                  aria-label="Studio timecode"
                >
                  {formatTimecode(frames)}
                </div>

                <div
                  className="pt-3 border-t font-hud text-[10px] flex items-center justify-between gap-2"
                  style={{ borderColor: 'var(--inv-border)', color: 'var(--inv-text-secondary)' }}
                >
                  <span className="truncate">SEQ: CNOOPSY_MASTER_V1</span>
                  <span>READY</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PORTFOLIO_PROJECTS.filter((p) => p.category !== 'Reels').slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-video rounded-lg overflow-hidden border"
                    style={{ borderColor: 'var(--inv-border)' }}
                  >
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-1 left-1.5 font-hud text-[9px] text-white">{item.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
