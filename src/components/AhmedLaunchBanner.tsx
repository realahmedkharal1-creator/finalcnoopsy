import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Folder,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PORTFOLIO_PROJECTS, AHMED_CONFIG } from '../data/portfolioData';

export const AhmedLaunchBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside aria-label="Pre-Launch Checklist" className="relative z-50 border-b border-accent-brand/40 bg-accent-brand/10 backdrop-blur-md text-xs font-mono-ui text-brand-primary">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="px-2 py-0.5 rounded bg-accent-brand text-black font-bold text-[10px] shrink-0 uppercase">
            Client Brief Guide
          </span>
          <span className="truncate text-brand-secondary">
            Section 14 &amp; 8 Pre-Launch Customization Checklist for Ahmed
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-brand bg-elevated text-brand-primary hover:border-accent-brand transition-colors text-[11px]"
          >
            <span>{isOpen ? 'Hide Checklist' : 'Review Checklist'}</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded hover:bg-elevated-2 text-brand-muted hover:text-brand-primary"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Checklist Tray */}
      {isOpen && (
        <div className="border-t border-brand bg-elevated/95 p-5 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs">
          <div>
            <h4 className="font-bold text-accent-brand uppercase mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Section 14 — Items to Fill Before Launch:</span>
            </h4>
            <ul className="space-y-2 text-brand-secondary">
              <li className="flex items-start gap-2">
                <span className="text-accent-brand font-bold">1.</span>
                <span>
                  <strong>Typical Turnaround:</strong> Set to "{AHMED_CONFIG.typicalTurnaround}" in{' '}
                  <code className="text-accent-brand">portfolioData.ts</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-brand font-bold">2.</span>
                <span>
                  <strong>Business Email:</strong> Configured as{' '}
                  <code className="text-accent-brand">{AHMED_CONFIG.businessEmail}</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-brand font-bold">3.</span>
                <span>
                  <strong>Social Links:</strong> Update Instagram &amp; YouTube channel URLs in footer.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-brand font-bold">4.</span>
                <span>
                  <strong>Form Endpoint:</strong> Add Formspree / Web3Forms endpoint in{' '}
                  <code className="text-accent-brand">portfolioData.ts</code> if desired.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-accent-brand uppercase mb-3 flex items-center gap-1.5">
              <Folder className="w-4 h-4" />
              <span>Section 8 — Video Embeds &amp; Google Drive Folders:</span>
            </h4>
            <div className="space-y-1.5 text-[11px]">
              {PORTFOLIO_PROJECTS.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1 border-b border-subtle">
                  <span className="font-bold text-brand-primary">{p.category}:</span>
                  <a
                    href={p.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-brand hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Drive Asset Folder</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-brand-muted mt-2">
              Note: Before final launch, upload drive clips as unlisted YouTube / Vimeo videos for optimal browser streaming.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
