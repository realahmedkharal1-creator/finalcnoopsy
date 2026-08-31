import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-brand bg-elevated p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-subtle pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-brand" />
            <h3 className="font-mono-heading text-lg font-bold text-brand-primary uppercase">
              Privacy & Client Media Policy
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-brand bg-elevated-2 text-brand-primary hover:border-accent-brand"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-brand-secondary leading-relaxed font-normal">
          <p>
            At <strong className="text-brand-primary font-mono-heading">Cnoopsy</strong>, client footage confidentiality, intellectual property protection, and media security are our top priorities.
          </p>

          <h4 className="font-mono-heading text-xs font-bold text-brand-primary uppercase pt-2">
            1. Raw Footage & Asset Confidentiality
          </h4>
          <p>
            All raw files, project assets, audio stems, and project briefs shared with Cnoopsy are stored on encrypted, secure storage and accessible solely by your assigned lead editor. We do not distribute, sell, or reuse unreleased client media under any circumstance.
          </p>

          <h4 className="font-mono-heading text-xs font-bold text-brand-primary uppercase pt-2">
            2. Portfolio Permissions
          </h4>
          <p>
            Completed video deliverables are only featured in our public portfolio showcase after they have been published publicly by the client or with prior written consent.
          </p>

          <h4 className="font-mono-heading text-xs font-bold text-brand-primary uppercase pt-2">
            3. Contact Information
          </h4>
          <p>
            Contact details provided via our WhatsApp or project request form are used exclusively for quote preparation, project milestones, and editorial communication.
          </p>
        </div>

        <div className="pt-4 border-t border-subtle flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-accent-brand text-black font-mono-ui font-bold text-xs uppercase"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
};
