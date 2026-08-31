import React, { useState, useRef } from 'react';
import {
  ArrowUpRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Folder,
  RotateCcw,
} from 'lucide-react';
import { SERVICES_DATA, getWhatsAppQuoteUrl } from '../data/portfolioData';
import { ServiceItem } from '../types';

interface ServiceVideoCardProps {
  service: ServiceItem;
  idx: number;
}

const ServiceVideoCard: React.FC<ServiceVideoCardProps> = ({ service, idx }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [hasStarted, setHasStarted] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((curr / dur) * 100);
    setCurrentTime(formatTime(curr));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * (videoRef.current.duration || 1);
    videoRef.current.currentTime = newTime;
    setProgress(pos * 100);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const restartVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    setHasStarted(true);
  };

  const quoteUrl = getWhatsAppQuoteUrl(service.whatsappMessage);

  return (
    <div
      id={`service-card-${service.id}`}
      className="group rounded-2xl border border-brand bg-elevated overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-accent-brand hover:shadow-2xl"
    >
      {/* Embedded Single Video Media Stage (No scrollbars, single video) */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-black border-b border-subtle select-none cursor-pointer"
        onClick={() => togglePlay()}
      >
        {/* HTML5 Video Element */}
        <video
          ref={videoRef}
          src={service.sampleVideoUrl}
          poster={service.thumbnailUrl}
          playsInline
          muted={isMuted}
          loop
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Top Badges & Controls */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/15 font-mono-ui text-[11px] text-accent font-bold">
              0{idx + 1}
            </span>
            <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono-ui text-white/90 uppercase font-semibold">
              {service.category}
            </span>
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            {hasStarted && (
              <button
                onClick={restartVideo}
                className="p-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white/80 hover:text-accent hover:border-accent transition-colors"
                title="Restart video"
                aria-label="Restart video"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white/80 hover:text-accent hover:border-accent transition-colors"
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-accent" />}
            </button>
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white/80 hover:text-accent hover:border-accent transition-colors"
              title="Fullscreen"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Central Play/Pause Trigger Button (Visible when paused or hovered) */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 transition-opacity duration-300">
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-accent-brand text-black flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-95 transition-all"
              aria-label={`Play ${service.title} video`}
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
            <span className="text-[11px] font-mono-ui font-bold text-white bg-black/80 px-3 py-1 rounded-full border border-white/15 backdrop-blur-md">
              Click to Watch Edit ({service.duration || '01:00'})
            </span>
          </div>
        )}

        {/* Bottom Interactive Video Progress Scrubber */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 pt-4 transition-opacity duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-full h-1.5 bg-white/20 hover:h-2 rounded-full cursor-pointer overflow-hidden transition-all duration-200 relative mb-1.5"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-accent-brand rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono-ui text-white/80">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="hover:text-accent font-bold uppercase flex items-center gap-1 text-[10px]"
              >
                {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <span>•</span>
              <span>{currentTime}</span>
            </div>
            <span className="text-white/60 font-mono-ui">{service.duration || '01:00'}</span>
          </div>
        </div>
      </div>

      {/* Card Content Information */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-mono-heading text-lg font-bold text-brand-primary uppercase group-hover:text-accent-brand transition-colors mb-2">
            {service.title}
          </h3>
          <p className="text-sm text-brand-secondary leading-relaxed mb-5 font-normal">
            {service.description}
          </p>
        </div>

        {/* Action Buttons & Drive Reference */}
        <div className="pt-4 border-t border-subtle flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 max-w-[60%]">
            <a
              href={service.driveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-elevated-2 border border-brand text-[10px] font-mono-ui text-brand-muted hover:text-accent-brand hover:border-accent-brand transition-colors inline-flex items-center gap-1"
              title="Open Google Drive raw project folder"
            >
              <Folder className="w-3 h-3 text-accent-brand" />
              <span>Drive Folder</span>
            </a>
            {service.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-elevated-2 text-[10px] font-mono-ui text-brand-muted truncate hidden sm:inline"
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={quoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono-ui font-bold text-accent-brand hover:underline group/btn shrink-0"
          >
            <span>Get a Quote</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

export const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="font-mono-ui text-xs font-bold text-brand-muted tracking-widest">
                (###)
              </span>
              <span className="h-px w-6 bg-border" />
              <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
                SPECIALIZED DISCIPLINES
              </span>
            </div>
            <h2 className="font-mono-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary uppercase">
              WHAT WE EDIT
            </h2>
          </div>
          <p className="text-sm font-mono-ui text-brand-secondary max-w-md">
            Platform-native video editing tailored to hold viewer attention and maximize retention.
            Click any card to play our sample edit.
          </p>
        </div>

        {/* 6 Services Grid (3 cols desktop, 2 tablet, 1 mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service, idx) => (
            <ServiceVideoCard key={service.id} service={service} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};
