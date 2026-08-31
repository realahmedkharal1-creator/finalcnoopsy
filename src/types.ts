export type ThemeMode = 'dark' | 'light';

export type VideoCategory =
  | 'All'
  | 'YouTube'
  | 'Real Estate'
  | 'Home Tours'
  | 'Reels'
  | 'Talking Head'
  | 'General';

export interface PortfolioItem {
  id: string;
  title: string;
  category: Exclude<VideoCategory, 'All'>;
  description: string;
  client?: string;
  platform?: string;
  duration?: string;
  aspectRatio: '16:9' | '9:16' | '4:5' | '1:1';
  thumbnailUrl: string;
  videoPreviewUrl?: string;
  driveFolderId?: string;
  driveFolderUrl: string;
  driveEmbedUrl?: string;
  embedType?: 'video' | 'drive' | 'youtube' | 'vimeo' | 'placeholder';
  embedUrl?: string;
  specs: {
    resolution: string;
    fps: string;
    colorGrade: string;
    soundDesign: string;
    motionGraphics: string;
  };
  keyFeatures: string[];
}

export interface ServiceItem {
  id: string;
  title: string;
  category: Exclude<VideoCategory, 'All'>;
  description: string;
  whatsappMessage: string;
  thumbnailUrl: string;
  sampleVideoUrl?: string;
  duration?: string;
  driveFolderId: string;
  driveFolderUrl: string;
  driveEmbedUrl?: string;
  tags: string[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  platform: string;
  location: string;
  projectType: string;
  rating: number;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  projectType: string;
  details: string;
  budget?: string;
}
