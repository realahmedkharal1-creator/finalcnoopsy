import React, { useState } from 'react';
import {
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { getWhatsAppQuoteUrl, FIVERR_URL, AHMED_CONFIG } from '../data/portfolioData';
import { ContactFormData } from '../types';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    projectType: 'YouTube',
    details: '',
    budget: '$500 - $1,500',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name or studio name';
    if (!formData.email.trim() || !formData.email.includes('@'))
      newErrors.email = 'Please provide a valid email address';
    if (!formData.details.trim() || formData.details.length < 10)
      newErrors.details = 'Please briefly describe your footage, video length, or editing goals (min 10 characters)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');

    try {
      /**
       * [Ahmed: Insert your form service endpoint / Webhook API key here]
       * Example: Formspree, Web3Forms, or EmailJS
       */
      if (AHMED_CONFIG.formEndpoint) {
        const res = await fetch(AHMED_CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`);
      } else {
        // No form service configured: open a pre-filled email so the brief is really delivered
        const subject = encodeURIComponent(`Project request: ${formData.projectType} editing`);
        const body = encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.projectType}\nBudget: ${formData.budget}\n\nBrief:\n${formData.details}`
        );
        window.location.href = `mailto:${AHMED_CONFIG.businessEmail}?subject=${subject}&body=${body}`;
      }

      setStatus('success');
    } catch (err) {
      console.error('Submission error', err);
      // Don't claim success: let the visitor retry or use WhatsApp / email instead
      setStatus('error');
    }
  };

  const handleCopySummary = () => {
    const summary = `CNOOPSY PROJECT BRIEF:\nName: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.projectType}\nBudget: ${formData.budget}\nBrief: ${formData.details}`;
    navigator.clipboard
      ?.writeText(summary)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});
  };

  return (
    <section id="contact" className="py-20 lg:py-28 border-b border-brand relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="font-mono-ui text-xs font-bold text-brand-muted tracking-widest">
              GET IN TOUCH
            </span>
            <span className="h-px w-6 bg-border" />
            <span className="font-mono-ui text-xs font-bold text-accent-brand uppercase tracking-widest">
              START A PROJECT
            </span>
          </div>
          <h2 className="font-mono-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-primary uppercase">
            LET'S TALK ABOUT YOUR NEXT VIDEO
          </h2>
          <p className="text-sm font-mono-ui text-brand-secondary mt-2 max-w-xl">
            Every project gets a custom quote based on footage length, turnaround, and motion design
            requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column (5 cols): Direct Priority Contact Channels */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Primary Channel: WhatsApp */}
            <div className="p-6 sm:p-7 rounded-2xl border-2 border-accent-brand/50 bg-elevated transition-all duration-300 hover:border-accent-brand hover:shadow-xl relative overflow-hidden group">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded bg-accent-brand text-black text-[10px] font-mono-ui font-bold uppercase">
                  Fastest Reply (10-30m)
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-brand/10 border border-accent-brand/30 flex items-center justify-center text-accent-brand">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono-heading text-lg font-bold text-brand-primary uppercase">
                    WhatsApp Direct
                  </h3>
                  <p className="text-xs text-brand-muted font-mono-ui">Primary studio channel</p>
                </div>
              </div>

              <p className="text-sm text-brand-secondary mb-6 leading-relaxed">
                Send a quick note about your footage and turnaround needs. You'll get an immediate
                response and custom project pricing.
              </p>

              <a
                id="contact-whatsapp-primary-btn"
                href={getWhatsAppQuoteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-accent-brand text-black font-mono-ui font-bold text-xs uppercase hover:opacity-95 active:scale-98 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message on WhatsApp (+92 302 6660854)</span>
              </a>
            </div>

            {/* Secondary Channel: Fiverr Profile */}
            <div className="p-6 rounded-2xl border border-brand bg-elevated flex flex-col justify-between hover:border-accent-brand/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-elevated-2 border border-brand flex items-center justify-center text-sm font-mono-ui font-bold text-accent-brand">
                    fi
                  </span>
                  <div>
                    <h3 className="font-mono-heading text-base font-bold text-brand-primary uppercase">
                      Fiverr Marketplace
                    </h3>
                    <span className="text-[10px] font-mono-ui text-brand-muted">5.0 Star Top Rated Seller</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-brand-muted" />
              </div>

              <p className="text-xs text-brand-secondary leading-relaxed mb-4">
                Prefer milestone escrow and ordering through Fiverr? Visit Cnoopsy's verified profile.
              </p>

              <a
                id="contact-fiverr-link"
                href={FIVERR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border border-brand bg-elevated-2 text-brand-primary hover:border-accent-brand hover:text-accent-brand font-mono-ui font-semibold text-xs uppercase transition-all"
              >
                <span>Hire on Fiverr (fiverr.com/cnoopsy)</span>
                <span>→</span>
              </a>
            </div>

            {/* Email Contact Detail */}
            <div className="p-5 rounded-2xl border border-subtle bg-elevated-2/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent-brand" />
                <div>
                  <span className="block text-[10px] font-mono-ui text-brand-muted uppercase">
                    Direct Email
                  </span>
                  <span className="text-xs font-mono-ui text-brand-primary">
                    {AHMED_CONFIG.businessEmail}
                  </span>
                </div>
              </div>
              <a
                href={`mailto:${AHMED_CONFIG.businessEmail}`}
                className="text-xs font-mono-ui text-accent-brand hover:underline"
              >
                Send Email
              </a>
            </div>
          </div>

          {/* Right Column (7 cols): Contact Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-brand bg-elevated shadow-lg relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-subtle">
              <div>
                <h3 className="font-mono-heading text-lg font-bold text-brand-primary uppercase">
                  Project Request Form
                </h3>
                <p className="text-xs font-mono-ui text-brand-muted mt-0.5">
                  Or submit your requirements here directly
                </p>
              </div>
              <span className="text-xs font-mono-ui text-accent-brand">⚡ 100% Confidential</span>
            </div>

            {status === 'success' ? (
              <div className="py-8 px-4 text-center flex flex-col items-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-accent-brand/20 border border-accent-brand flex items-center justify-center text-accent-brand mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-mono-heading text-xl font-bold text-brand-primary uppercase mb-2">
                  Request Received!
                </h4>
                <p className="text-sm text-brand-secondary max-w-md mb-6 leading-relaxed">
                  Thank you, <span className="font-bold text-brand-primary">{formData.name}</span>. We
                  have logged your brief for <span className="font-bold text-brand-primary">{formData.projectType}</span> editing.
                </p>

                {/* Quick actions for user */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                  <a
                    href={getWhatsAppQuoteUrl(
                      `Hi Cnoopsy, I just submitted a form for ${formData.projectType} editing. Name: ${formData.name}. Details: ${formData.details.slice(0, 80)}...`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex-1 py-3 px-4 rounded-xl bg-accent-brand text-black font-mono-ui font-bold text-xs uppercase flex items-center justify-center gap-2 hover:opacity-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Speed up on WhatsApp</span>
                  </a>

                  <button
                    onClick={handleCopySummary}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl border border-brand bg-elevated-2 text-brand-primary font-mono-ui font-semibold text-xs uppercase flex items-center justify-center gap-1.5 hover:border-accent-brand transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-accent-brand" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied Brief' : 'Copy Brief'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setStatus('idle');
                    setFormData({
                      name: '',
                      email: '',
                      projectType: 'YouTube',
                      details: '',
                      budget: '$500 - $1,500',
                    });
                  }}
                  className="mt-6 text-xs font-mono-ui text-brand-muted hover:text-accent-brand underline"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name & Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="form-name"
                      className="block text-xs font-mono-ui text-brand-secondary uppercase mb-1.5"
                    >
                      Your Name / Channel <span className="text-accent-brand">*</span>
                    </label>
                    <input
                      id="form-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Rivera / Prime Properties"
                      className={`w-full px-3.5 py-2.5 rounded-lg border bg-elevated-2 text-brand-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.name ? 'border-red-500' : 'border-brand'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-400 font-mono-ui mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="form-email"
                      className="block text-xs font-mono-ui text-brand-secondary uppercase mb-1.5"
                    >
                      Email Address <span className="text-accent-brand">*</span>
                    </label>
                    <input
                      id="form-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@domain.com"
                      className={`w-full px-3.5 py-2.5 rounded-lg border bg-elevated-2 text-brand-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.email ? 'border-red-500' : 'border-brand'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-400 font-mono-ui mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Type & Budget Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="form-project-type"
                      className="block text-xs font-mono-ui text-brand-secondary uppercase mb-1.5"
                    >
                      Project Type <span className="text-accent-brand">*</span>
                    </label>
                    <select
                      id="form-project-type"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-brand bg-elevated-2 text-brand-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                      <option value="YouTube">YouTube Content Editing</option>
                      <option value="Real Estate">Real Estate Video Editing</option>
                      <option value="Home Tour">Home Tour Videos</option>
                      <option value="Reels">Reels & Shorts Editing</option>
                      <option value="Talking Head">Talking Head Video Editing</option>
                      <option value="General">General Video Editing</option>
                      <option value="Not sure">Not sure / Mixed Package</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="form-budget"
                      className="block text-xs font-mono-ui text-brand-secondary uppercase mb-1.5"
                    >
                      Estimated Budget (Optional)
                    </label>
                    <select
                      id="form-budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-brand bg-elevated-2 text-brand-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                      <option value="< $500">&lt; $500 (Single clip / Short)</option>
                      <option value="$500 - $1,500">$500 – $1,500 (Multi-video / Standard)</option>
                      <option value="$1,500 - $3,000">$1,500 – $3,000 (Full Campaign / Monthly)</option>
                      <option value="$3,000+">$3,000+ (High Volume / Dedicated)</option>
                      <option value="Custom / Retainer">Custom / Ongoing Monthly Retainer</option>
                    </select>
                  </div>
                </div>

                {/* Project Details textarea */}
                <div>
                  <label
                    htmlFor="form-details"
                    className="block text-xs font-mono-ui text-brand-secondary uppercase mb-1.5"
                  >
                    Project Details & Footage Link <span className="text-accent-brand">*</span>
                  </label>
                  <textarea
                    id="form-details"
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Tell us about the project: raw footage length, target platform, reference links, graphics needed, and ideal turnaround date..."
                    className={`w-full px-3.5 py-2.5 rounded-lg border bg-elevated-2 text-brand-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent ${
                      errors.details ? 'border-red-500' : 'border-brand'
                    }`}
                  />
                  {errors.details && (
                    <p className="text-[11px] text-red-400 font-mono-ui mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.details}
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <p role="alert" className="text-xs font-mono-ui text-red-500">
                    Couldn't send the form. Please try again, or message us on WhatsApp / email directly.
                  </p>
                )}

                {/* Submit button */}
                <button
                  id="contact-form-submit-btn"
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3.5 px-6 rounded-xl bg-accent-brand text-black font-mono-ui font-bold text-sm uppercase flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{status === 'submitting' ? 'Submitting Brief...' : 'Send Project Details'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
