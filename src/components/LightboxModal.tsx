import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  MessageCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PortfolioItem } from '../types';

interface LightboxModalProps {
  item: PortfolioItem | null;
  itemsList: PortfolioItem[];
  onClose: () => void;
  onNavigate: (newItem: PortfolioItem) => void;
  onGetQuote: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  itemsList,
  onClose,
  onNavigate,
  onGetQuote,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Current item index in filtered list
  const currentIndex = item ? itemsList.findIndex((p) => p.id === item.id) : -1;

  // Keyboard navigation: Escape to close, Arrow keys to navigate
  useEffect(() => {
    // Only listen while the modal is open (otherwise arrow keys would pop it open)
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && currentIndex < itemsList.length - 1) {
        onNavigate(itemsList[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(itemsList[currentIndex - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, currentIndex, itemsList, onClose, onNavigate]);

  // Prevent background body scroll while modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
      setIsPlaying(false);
      setVideoFailed(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  if (!item) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onNavigate(itemsList[currentIndex - 1]);
    } else {
      onNavigate(itemsList[itemsList.length - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < itemsList.length - 1) {
      onNavigate(itemsList[currentIndex + 1]);
    } else {
      onNavigate(itemsList[0]);
    }
  };

  return (
    <div
      id="portfolio-lightbox-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto rounded-2xl border border-brand bg-elevated shadow-2xl flex flex-col no-scrollbar animate-scale-up"
      >
        {/* Top Control Bar */}
        <div className="sticky top-0 z-30 shrink-0 px-5 py-3.5 border-b border-brand bg-elevated/95 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2.5 py-0.5 rounded bg-accent-brand text-black text-xs font-mono-ui font-bold uppercase shrink-0">
              {item.category}
            </span>
            <span className="text-xs font-mono-ui text-brand-muted hidden sm:inline truncate">
              {item.title}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Previous & Next Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded hover:bg-elevated-2 text-brand-secondary hover:text-accent-brand transition-colors"
                title="Previous video (Left Arrow)"
                aria-label="Previous project"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded hover:bg-elevated-2 text-brand-secondary hover:text-accent-brand transition-colors"
                title="Next video (Right Arrow)"
                aria-label="Next project"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              id="lightbox-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-brand bg-elevated-2 hover:border-accent-brand text-brand-primary transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player / Showcase Stage */}
        <div className="relative w-full shrink-0 bg-black flex flex-col items-center justify-center overflow-hidden">
          <div
            className={`relative w-full ${
              item.aspectRatio === '9:16' ? 'max-w-md aspect-[9/16] my-4' : 'aspect-video'
            } bg-zinc-950 flex items-center justify-center overflow-hidden`}
          >
            {isPlaying && item.youtubeId ? (
              <iframe
                key={item.id}
                src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                title={item.title}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full z-20 border-0"
              />
            ) : isPlaying && item.videoPreviewUrl && !videoFailed ? (
              <video
                key={item.id}
                src={item.videoPreviewUrl}
                poster={item.thumbnailUrl}
                controls
                autoPlay
                playsInline
                onError={() => setVideoFailed(true)}
                className="absolute inset-0 w-full h-full object-contain bg-black z-20"
              />
            ) : (
              <img
                src={item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover opacity-90"
              />
            )}

            {/* Player Interface Overlay */}
            {!(isPlaying && (item.youtubeId || (item.videoPreviewUrl && !videoFailed))) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-2.5 sm:p-6">
              <div className="flex items-center justify-between text-xs font-mono-ui text-white/90">
                <span className="font-bold tracking-wider">cnoopsy. portfolio cut</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-3 min-h-0">
                <button
                  type="button"
                  className="w-11 h-11 sm:w-20 sm:h-20 rounded-full bg-accent-brand text-black flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                  onClick={() => {
                    setIsPlaying(true);
                  }}
                  aria-label="Play video"
                >
                  <Play className="w-5 h-5 sm:w-8 sm:h-8 fill-current ml-1" />
                </button>
                <span className="hidden sm:inline text-xs font-mono-ui text-white/90 bg-black/70 px-3 py-1 rounded-full border border-white/15">
                  Portfolio Sample Preview
                </span>
              </div>

              <div />
            </div>
            )}
          </div>
        </div>

        {/* Project Details & Technical Specs Grid */}
        <div className="p-6 sm:p-8 space-y-8 bg-elevated shrink-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="font-mono-heading text-xl sm:text-2xl md:text-3xl font-bold text-brand-primary uppercase mb-2">
                {item.title}
              </h2>
              <p className="text-sm sm:text-base text-brand-secondary leading-relaxed max-w-2xl font-normal">
                {item.description}
              </p>
            </div>

            {/* Actions: Quote */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={onGetQuote}
                className="px-6 py-3 rounded-xl bg-accent-brand text-black font-mono-ui font-bold text-xs uppercase inline-flex items-center justify-center gap-2 hover:opacity-95 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Quote for this Style</span>
              </button>
            </div>
          </div>

          {/* Key Production Features List */}
          <div>
            <h4 className="font-mono-ui text-xs font-bold text-brand-primary uppercase mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-brand" />
              <span>Key Editing Treatments Applied:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {item.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-subtle bg-elevated-2 flex items-center gap-2.5 text-xs text-brand-secondary"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-brand shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
