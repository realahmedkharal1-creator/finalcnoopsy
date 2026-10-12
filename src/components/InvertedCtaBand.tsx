import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Clock, Video, Zap } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../data/portfolioData';
import { ThemeMode } from '../types';

interface InvertedCtaBandProps {
  theme: ThemeMode;
  onGetQuote: () => void;
}

export const InvertedCtaBand: React.FC<InvertedCtaBandProps> = ({ theme, onGetQuote }) => {
  // Live decorative studio timecode
  const [timecode, setTimecode] = useState('01:24:18:22');

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      const f = String(Math.floor(date.getMilliseconds() / 33.3)).padStart(2, '0');
      setTimecode(`${h}:${m}:${s}:${f}`);
    }, 33);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="cta-band"
      className="py-20 lg:py-24 relative overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: 'var(--inv-bg)',
        color: 'var(--inv-text-primary)',
        borderTop: '1px solid var(--inv-border)',
        borderBottom: '1px solid var(--inv-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Block (7 cols): Bold Statement & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 mb-4">
              <span
                className="font-mono-ui text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--inv-text-secondary)' }}
              >
                (#######)
              </span>
              <span
                className="h-px w-6"
                style={{ backgroundColor: 'var(--inv-border)' }}
              />
              <span
                className="font-mono-ui text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--inv-accent)' }}
              >
                NEXT-LEVEL PRODUCTION
              </span>
            </div>

            <h2 className="font-mono-heading text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-bold uppercase leading-[1.12] mb-8">
              WE EDIT VIDEO THAT DOESN'T JUST LOOK GOOD — IT GETS WATCHED, SHARED, AND ACTED ON.
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
              <button
                id="cta-band-whatsapp-btn"
                type="button"
                onClick={onGetQuote}
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-mono-ui font-bold text-sm uppercase transition-all duration-200 shadow-xl active:scale-95 focus:outline-none"
                style={{
                  backgroundColor: 'var(--inv-btn-bg)',
                  color: 'var(--inv-btn-text)',
                }}
              >
                <span>Get a Custom Quote</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <p
                className="text-xs font-mono-ui max-w-xs leading-relaxed"
                style={{ color: 'var(--inv-text-secondary)' }}
              >
                Grow past generic content. Talk to Cnoopsy about your next video.
              </p>
            </div>
          </div>

          {/* Right Block (5 cols): Timecode Graphic + Mini Collage */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Monospace Timecode Readout Box */}
            <div
              className="p-5 sm:p-6 rounded-2xl border flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--inv-bg-elevated)',
                borderColor: 'var(--inv-border)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span
                    className="font-mono-ui text-[11px] font-bold uppercase"
                    style={{ color: 'var(--inv-text-secondary)' }}
                  >
                    REC // TIMECODE
                  </span>
                </div>
                <span
                  className="font-mono-ui text-[11px] font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--inv-bg)',
                    color: 'var(--inv-accent)',
                  }}
                >
                  4K DCI 60FPS
                </span>
              </div>

              <div className="font-mono-heading text-3xl sm:text-4xl font-bold tracking-wider my-2 text-center sm:text-left select-all">
                {timecode}
              </div>

              <div
                className="pt-3 border-t text-[11px] font-mono-ui flex items-center justify-between"
                style={{
                  borderColor: 'var(--inv-border)',
                  color: 'var(--inv-text-secondary)',
                }}
              >
                <span>SEQUENCE: CNOOPSY_MASTER_V1</span>
                <span>STATUS: READY</span>
              </div>
            </div>

            {/* Collage of 3 mini thumbnails */}
            <div className="grid grid-cols-3 gap-2">
              {PORTFOLIO_PROJECTS.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-video rounded-lg overflow-hidden border"
                  style={{ borderColor: 'var(--inv-border)' }}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-1 left-1.5 text-[9px] font-mono-ui text-white font-bold">
                    {item.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
