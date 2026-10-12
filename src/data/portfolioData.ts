import { PortfolioItem, ServiceItem, TestimonialItem, ProcessStep } from '../types';

export const WHATSAPP_BASE_URL = 'https://wa.me/923026660854';
export const FIVERR_URL = 'https://www.fiverr.com/cnoopsy';

export function getWhatsAppQuoteUrl(message?: string): string {
  const defaultText = "Hi Cnoopsy, I'd like to talk about a video editing project.";
  const encoded = encodeURIComponent(message || defaultText);
  return `${WHATSAPP_BASE_URL}?text=${encoded}`;
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'youtube-editing',
    title: 'YouTube Content Editing',
    category: 'YouTube',
    description:
      'Long-form videos and Shorts edited for retention — pacing, sound design, captions, and thumbnails that match how the algorithm actually works.',
    whatsappMessage: "Hi Cnoopsy, I'd like a quote for YouTube content editing.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
    youtubeId: 'tX3WAFQmHGE',
    duration: '01:15',
    tags: ['Long-form', 'Shorts', 'Retention Pacing', 'Sound Design'],
  },
  {
    id: 'real-estate-editing',
    title: 'Real Estate Video Editing',
    category: 'Real Estate',
    description:
      'Listing videos with clean transitions, motion graphics, and pacing that makes a property feel like the best one on the street.',
    whatsappMessage: "Hi Cnoopsy, I'd like a quote for Real Estate video editing.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    youtubeId: 'IYxO3AqMZgY',
    duration: '00:45',
    tags: ['Cinematic Walkthrough', 'Drone Boundary Maps', 'Callout Labels'],
  },
  {
    id: 'home-tour-videos',
    title: 'Home Tour Videos',
    category: 'Home Tours',
    description:
      'Walkthrough footage turned into a smooth, guided tour — the kind that gets a listing shared, not just viewed.',
    whatsappMessage: "Hi Cnoopsy, I'd like a quote for Home Tour video editing.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    youtubeId: 'JnhKoCtKkQM',
    duration: '01:05',
    tags: ['Guided Walkthrough', 'Stabilized Flow', 'Architectural Showcase'],
  },
  {
    id: 'reels-shorts-editing',
    title: 'Reels & Shorts Editing',
    category: 'Reels',
    description:
      'Fast-paced, trend-aware edits for Instagram, TikTok, and Facebook Reels — built to stop the scroll in the first second.',
    whatsappMessage: "Hi Cnoopsy, I'd like a quote for Reels & Shorts editing.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    youtubeId: 'JnWTrh6C2Io',
    duration: '00:30',
    tags: ['9:16 Vertical', 'Hook-First Beats', 'Kinetic Typography'],
  },
  {
    id: 'talking-head-editing',
    title: 'Talking Head Video Editing',
    category: 'Talking Head',
    description:
      'Podcast clips, interviews, and solo-creator videos — clean cuts, jump-cut pacing, captions, and B-roll that keep a single face on screen genuinely watchable.',
    whatsappMessage: "Hi Cnoopsy, I'd like a quote for Talking Head video editing.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
    youtubeId: 'GalATixG0AM',
    duration: '01:20',
    tags: ['Podcast Cuts', 'Dynamic B-Roll', 'Multi-Cam Sync', 'Auto-Captions'],
  },
  {
    id: 'general-video-editing',
    title: 'General Video Editing',
    category: 'General',
    description:
      'Corporate videos, event recaps, ads — anything that doesn\'t fit a neat category still gets the same attention to pacing and polish.',
    whatsappMessage: "Hi Cnoopsy, I'd like a quote for General video editing.",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80',
    youtubeId: 'gvC1byhS8ws',
    duration: '01:45',
    tags: ['Brand Commercials', 'Event Recaps', 'Product Teasers'],
  },
];

// Service cards use their video's own YouTube thumbnail
SERVICES_DATA.forEach((sv) => {
  if (sv.youtubeId) sv.thumbnailUrl = `https://img.youtube.com/vi/${sv.youtubeId}/hqdefault.jpg`;
});

export const PORTFOLIO_PROJECTS: PortfolioItem[] = [
  {
    id: 'proj-real-estate-1',
    title: 'A Listing That Looks Worth the Price',
    category: 'Real Estate',
    description:
      'A property walkthrough edited with motion-graphics overlays for boundary lines, room callouts, and a map sequence.',
    client: 'David Bailey (Fiverr Client)',
    platform: 'Zillow & YouTube 4K',
    duration: '02:18',
    aspectRatio: '16:9',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85',
    youtubeId: 'IYxO3AqMZgY',
    embedType: 'youtube',
    specs: {
      resolution: '4K UHD (3840x2160)',
      fps: '60 fps Smooth Motion',
      colorGrade: 'Cinematic Golden Hour LUT',
      soundDesign: 'Ambient Spatial Mix & Acoustic Bed',
      motionGraphics: '3D Drone Parcel Boundary Tracking & Spec Pins',
    },
    keyFeatures: [
      '3D Camera tracking for boundary line graphics',
      'Dynamic speed ramps between interior wings',
      'Custom room dimension HUD callouts',
      'High dynamic range architectural color balance',
    ],
  },
  {
    id: 'proj-youtube-1',
    title: 'Built for Watch Time, Not Just Views',
    category: 'YouTube',
    description:
      'A long-form YouTube video re-paced in the edit to keep retention high past the first two minutes.',
    client: 'Creator Studio Network',
    platform: 'YouTube 1440p',
    duration: '11:42',
    aspectRatio: '16:9',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1400&q=85',
    youtubeId: 'tX3WAFQmHGE',
    embedType: 'youtube',
    specs: {
      resolution: '1440p QHD',
      fps: '30 fps Narrative Pacing',
      colorGrade: 'Punchy Studio Contrast Grade',
      soundDesign: 'Multi-layer Foley, Whooshes & Risers',
      motionGraphics: 'Custom Lower-Thirds & Chapter Markers',
    },
    keyFeatures: [
      'Hook-retention structural edit (first 45s reframed)',
      'Pattern interrupts every 8–12 seconds',
      'Seamless sound staging with sound effects',
      'Custom kinetic thumbnail frame design',
    ],
  },
  {
    id: 'proj-reels-1',
    title: 'Three Seconds to Earn the Scroll',
    category: 'Reels',
    description:
      'A short-form edit built around a hook-first structure for maximum completion rate.',
    client: 'Viral Brand Campaign',
    platform: 'Instagram Reels & TikTok',
    duration: '00:48',
    aspectRatio: '9:16',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    youtubeId: 'JnWTrh6C2Io',
    embedType: 'youtube',
    specs: {
      resolution: '1080x1920 Vertical',
      fps: '60 fps Ultra Crisp',
      colorGrade: 'High Saturation Pop LUT',
      soundDesign: 'Trending Audio Track Sync & Punch FX',
      motionGraphics: 'Karaoke-style Kinetic Captions',
    },
    keyFeatures: [
      'Aggressive audio hook in the first 1.2s',
      'Word-by-word animated highlights',
      'Micro zooms and seamless whip-pan cuts',
      'Safe-zone alignment for Instagram & TikTok UI overlays',
    ],
  },
  {
    id: 'proj-home-tours-1',
    title: 'Modern Estate Architectural Walkthrough',
    category: 'Home Tours',
    description:
      'Smooth stabilized walkthrough footage mapped into a flowing experience highlighting natural light and luxury finishes.',
    client: 'Prime Realty Partners',
    platform: 'Vimeo & MLS Direct',
    duration: '03:15',
    aspectRatio: '16:9',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    youtubeId: 'JnhKoCtKkQM',
    embedType: 'youtube',
    specs: {
      resolution: '4K Cinema DCI',
      fps: '24 fps Cinematic Cadence',
      colorGrade: 'Warm Minimalist Naturalism',
      soundDesign: 'Foley footsteps & calming acoustic ambient',
      motionGraphics: 'Floorplan mini-map overlay sync',
    },
    keyFeatures: [
      'Gimbal micro-jitter smoothing',
      'Window exposure sky replacement matching',
      'Feature title cards for appliances and finishes',
      'Seamless exterior to interior transitions',
    ],
  },
  {
    id: 'proj-talking-head-1',
    title: 'Executive Podcast & Solo Masterclass Series',
    category: 'Talking Head',
    description:
      'Multi-camera interview with jump-cut pacing, dynamic B-roll cutaways, and sound mastery to keep viewers locked in.',
    client: 'ckitch_2001 (eLearning Creator)',
    platform: 'YouTube & Course Portal',
    duration: '08:50',
    aspectRatio: '16:9',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1400&q=85',
    youtubeId: 'GalATixG0AM',
    embedType: 'youtube',
    specs: {
      resolution: '4K Ultra HD',
      fps: '30 fps Broadcast',
      colorGrade: 'Natural Skin Tone Isolation',
      soundDesign: 'Noise Reduction, Vocal EQ & Leveller',
      motionGraphics: 'Highlighted quotes & slide inserts',
    },
    keyFeatures: [
      'Automated dead-air and filler word trim',
      'Dual-camera angle cuts on emotional inflection',
      'Dynamic punch-ins for emphasis points',
      'Broadcast-grade audio cleanup and mastering',
    ],
  },
  {
    id: 'proj-general-1',
    title: 'Commercial Product Launch & Brand Reel',
    category: 'General',
    description:
      'High-energy product trailer combining sound-designed transitions, pacing shifts, and kinetic text typography.',
    client: 'NextGen Hardware',
    platform: 'Web, Paid Ads & YouTube',
    duration: '01:30',
    aspectRatio: '16:9',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85',
    youtubeId: 'gvC1byhS8ws',
    embedType: 'youtube',
    specs: {
      resolution: '4K 10-Bit ProRES',
      fps: '60 fps High Energy',
      colorGrade: 'Commercial High-Key Polish',
      soundDesign: 'Heavy Impact Drops & Bass Sweeps',
      motionGraphics: 'Custom 2D/3D Logo Stinger',
    },
    keyFeatures: [
      'Rhythmic cuts synchronized to BPM beat drops',
      'Speed-ramped macro product details',
      'Motion blur camera whip pans',
      'Deliverables in 16:9, 9:16 and 1:1 square formats',
    ],
  },
];


const BASE_BY_ID = (id: string) => PORTFOLIO_PROJECTS.find((p) => p.id === id)!;

const EXTRA_VIDEOS: Record<string, string[]> = {
  'proj-youtube-1': ['b24SIQX-u8U', 'YtPkiBFtKgc', 'lepu4y5okTw'],
  'proj-real-estate-1': ['xNe42TgWqRE', 'D0F8C7_I1sw', 'JcQ17EQMAjs'],
  'proj-home-tours-1': ['A9YkiBUs8s0', 'CXbJ5g9l_nw', 'Fj8gtemfLbw'],
  'proj-reels-1': ['iKq5bzA_fqA', '3aCojHHGqHY', 'Rg5ZCj_LSco'],
  'proj-talking-head-1': ['cJhfdkDkIKY', 'DK2Oa2oP-9I'],
  'proj-general-1': ['2treeb2tBVA', 'sGX_myNdeuA'],
};

PORTFOLIO_PROJECTS.push(
  ...Object.entries(EXTRA_VIDEOS).flatMap(([baseId, videoIds]) =>
    videoIds.map((youtubeId, i): PortfolioItem => {
      const base = BASE_BY_ID(baseId);
      return {
        ...base,
        id: `${baseId}-${i + 2}`,
        title: `${base.category} Edit ${String(i + 2).padStart(2, '0')}`,
        youtubeId,
      };
    })
  )
);

// Use each video's own YouTube thumbnail
PORTFOLIO_PROJECTS.forEach((p) => {
  if (p.youtubeId) p.thumbnailUrl = `https://img.youtube.com/vi/${p.youtubeId}/hqdefault.jpg`;
});

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 't-1',
    quote:
      'Ahmed did a great job on our land listing video. He brought a lot of creativity and motion-design skill to the project — especially with the map sequence, boundary animation, and placing details.',
    author: 'David Bailey',
    platform: 'Fiverr',
    location: 'United States',
    projectType: 'Real Estate Promos',
    rating: 5,
  },
  {
    id: 't-2',
    quote:
      'Thank you so much for this. I will come back because I have a ton of ideas for my next videos.',
    author: 'ckitch_2001',
    platform: 'Fiverr',
    location: 'United States',
    projectType: 'eLearning Video Production',
    rating: 5,
  },
  {
    id: 't-3',
    quote: 'Very quick, creative and professional. Will do business again.',
    author: 'Jcarey450',
    platform: 'Fiverr',
    location: 'United States',
    projectType: 'Video Editing',
    rating: 5,
  },
  {
    id: 't-4',
    quote: 'Ahmed was awesome to work with. He was very cooperative when it came to the changes. Will use again!',
    author: 'Jaywalk2022',
    platform: 'Fiverr',
    location: 'United States',
    projectType: 'Video Editing',
    rating: 5,
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Brief & Footage',
    description:
      'You send over your raw footage and a short brief on the goal — YouTube upload, listing video, a Reel, whatever it is.',
  },
  {
    number: '02',
    title: 'Structure & Plan',
    description:
      'The footage gets reviewed and a cut structure is planned around the hook, pacing, and platform it\'s going to.',
  },
  {
    number: '03',
    title: 'First Cut',
    description:
      'A rough edit comes back for your review — structure and pacing locked before the fine details get polished.',
  },
  {
    number: '04',
    title: 'Sound, Color & Motion',
    description:
      'Sound design, color grading, captions, and any motion graphics (maps, callouts, lower-thirds) get added.',
  },
  {
    number: '05',
    title: 'Revisions',
    description:
      'Feedback goes in and revisions come back fast — no waiting a week for a two-minute fix.',
  },
  {
    number: '06',
    title: 'Final Delivery',
    description:
      'You get the final file in the format and specs your platform needs, ready to publish.',
  },
];

export const EDITING_SOFTWARE_TOOLS = [
  { name: 'Adobe Premiere Pro', badge: 'PR', color: '#9999FF', desc: 'Precision Timeline & Multi-cam' },
  { name: 'After Effects', badge: 'AE', color: '#9999FF', desc: 'Motion Graphics & VFX' },
  { name: 'DaVinci Resolve', badge: 'DVR', color: '#FF7F50', desc: 'Color Grading & Fairlight Audio' },
  { name: 'CapCut Pro', badge: 'CC', color: '#00F0FF', desc: 'High-Velocity Social Reels' },
  { name: 'Photoshop', badge: 'PS', color: '#31A8FF', desc: 'Thumbnail Craft & Asset Prep' },
];

/**
 * ============================================================================
 * LAUNCH PLACEHOLDERS (For Ahmed to customize before going live):
 * ============================================================================
 */
export const AHMED_CONFIG = {
  // [Ahmed: Fill in your real typical turnaround time before launch]
  typicalTurnaround: '2–3 days',
  
  // [Ahmed: Add your business email address for direct client inquiries]
  businessEmail: 'contact@cnoopsy.com',
  fallbackEmail: 'realahmedkharal1@gmail.com',

  // [Ahmed: Add links to your real social profiles]
  instagramUrl: 'https://instagram.com/cnoopsy',
  youtubeUrl: 'https://youtube.com/@cnoopsy',
  
  // [Ahmed: Insert your Formspree, Web3Forms, or EmailJS endpoint here]
  formEndpoint: '', // Leave empty to use mailto / client confirmation fallback
};
