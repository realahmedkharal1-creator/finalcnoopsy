import React, { useState } from 'react';
import {
  MessageCircle,
  Mail,
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
    budget: '$250 – $500 (Single Long-Form / Real Estate Listing)',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard
      ?.writeText(AHMED_CONFIG.businessEmail)
      .then(() => {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      })
      .catch(() => {});
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name or studio name';
    const contact = formData.email.trim();
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const looksLikePhone = /^\+?[\d\s().-]{7,}$/.test(contact) && contact.replace(/\D/g, '').length >= 7;
    if (!looksLikeEmail && !looksLikePhone)
      newErrors.email = 'Please provide a valid email address or WhatsApp number';
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
          `Name: ${formData.name}\nContact: ${formData.email}\nService: ${formData.projectType}\nBudget: ${formData.budget}\n\nBrief:\n${formData.details}`
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
    const summary = `CNOOPSY PROJECT BRIEF:\nName: ${formData.name}\nContact: ${formData.email}\nService: ${formData.projectType}\nBudget: ${formData.budget}\nBrief: ${formData.details}`;
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
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-hud text-xs text-brand-muted">(08)</span>
            <span className="h-px w-6 bg-border" />
            <span className="font-hud text-xs text-accent-brand">Start a project</span>
          </div>
          <h2 className="font-mono-heading text-3xl sm:text-4xl md:text-5xl text-brand-primary uppercase max-w-4xl">
            LET&apos;S TALK ABOUT YOUR <span className="text-accent-brand">NEXT VIDEO</span>
          </h2>
          <p className="text-base text-brand-secondary mt-4 max-w-[65ch]">
            Every project gets a custom quote based on footage length, turnaround, and motion design
            requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column (5 cols): Direct Priority Contact Channels */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Primary Channel: WhatsApp */}
            <div className="p-6 sm:p-7 rounded-2xl border border-accent-brand/50 bg-elevated transition-all duration-300 hover:border-accent-brand hover:bg-card-hover relative overflow-hidden group"
              style={{ boxShadow: 'var(--card-glow)' }}>
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full pill-tint font-hud text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-brand animate-pulse" />
                  Fastest Reply &lt; 30 mins
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
                  <p className="text-sm text-brand-muted">Primary studio channel</p>
                </div>
              </div>

              <p className="text-base text-brand-secondary mb-6 leading-[1.65]">
                Send a quick note about your footage and turnaround needs. You'll get an immediate
                response and custom project pricing.
              </p>

              <a
                id="contact-whatsapp-primary-btn"
                href={getWhatsAppQuoteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl btn-parrot font-mono-ui font-bold text-xs uppercase transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message on WhatsApp (+92 302 6660854)</span>
              </a>
            </div>

            {/* Escrow / marketplace option */}
            <div className="p-6 rounded-2xl card-surface flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg pill-tint flex items-center justify-center font-hud text-sm">
                    fi
                  </span>
                  <div>
                    <h3 className="font-mono-heading text-base text-brand-primary uppercase">
                      Fiverr Marketplace
                    </h3>
                    <span className="font-hud text-[10px] text-brand-muted">Escrow-protected orders</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-brand-muted" />
              </div>

              <p className="text-base text-brand-secondary leading-[1.65] mb-4">
                Prefer Escrow / Marketplace Protection? You can also commission us directly via our
                Top-Rated Fiverr Studio profile.
              </p>

              <a
                id="contact-fiverr-link"
                href={FIVERR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-brand bg-elevated-2 text-brand-primary hover:border-accent-brand hover:text-accent-brand font-mono-ui font-semibold text-xs uppercase transition-all"
              >
                <span>Hire on Fiverr (fiverr.com/cnoopsy)</span>
                <span>→</span>
              </a>
            </div>

            {/* Email Contact Detail */}
            <div className="p-5 rounded-2xl card-surface flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Mail className="w-5 h-5 text-accent-brand shrink-0" />
                <div className="min-w-0">
                  <span className="block font-hud text-[10px] text-brand-muted">Direct Email</span>
                  <span className="text-sm sm:text-base text-brand-primary break-all">
                    {AHMED_CONFIG.businessEmail}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand bg-elevated-2 text-xs font-semibold text-brand-primary hover:border-accent-brand transition-all"
                  aria-label="Copy email address"
                >
                  {emailCopied ? <Check className="w-3.5 h-3.5 text-accent-brand" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{emailCopied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={`mailto:${AHMED_CONFIG.businessEmail}`}
                  className="text-xs font-semibold text-accent-brand hover:text-accent-hover px-1"
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Contact Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-brand bg-elevated relative min-w-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-subtle">
              <div>
                <h3 className="font-mono-heading text-lg font-bold text-brand-primary uppercase">
                  Project Request Form
                </h3>
                <p className="text-sm text-brand-muted mt-0.5">
                  Or submit your requirements here directly
                </p>
              </div>
              <span className="font-hud text-[10px] text-accent-brand">100% Confidential</span>
            </div>

            {status === 'success' ? (
              <div className="py-8 px-4 text-center flex flex-col items-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-accent-brand/20 border border-accent-brand flex items-center justify-center text-accent-brand mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-mono-heading text-xl font-bold text-brand-primary uppercase mb-2">
                  Request Received!
                </h4>
                <p className="text-base text-brand-secondary max-w-md mb-6 leading-relaxed">
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
                    className="w-full flex-1 py-3 px-4 rounded-xl btn-parrot font-mono-ui font-bold text-xs uppercase flex items-center justify-center gap-2"
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
                      budget: '$250 – $500 (Single Long-Form / Real Estate Listing)',
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
                      className="block text-sm font-medium text-brand-secondary mb-1.5"
                    >
                      Your Name <span className="text-accent-brand">*</span>
                    </label>
                    <input
                      id="form-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Rivera / Prime Properties"
                      className={`field w-full px-4 py-3 rounded-xl text-base ${
                        errors.name ? '!border-red-500' : ''
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 font-mono-ui mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="form-email"
                      className="block text-sm font-medium text-brand-secondary mb-1.5"
                    >
                      Email / WhatsApp <span className="text-accent-brand">*</span>
                    </label>
                    <input
                      id="form-email"
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email or WhatsApp number"
                      className={`field w-full px-4 py-3 rounded-xl text-base ${
                        errors.email ? '!border-red-500' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 font-mono-ui mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Type & Budget Row */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label
                      htmlFor="form-project-type"
                      className="block text-sm font-medium text-brand-secondary mb-1.5"
                    >
                      Project Type <span className="text-accent-brand">*</span>
                    </label>
                    <select
                      id="form-project-type"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="field w-full px-4 py-3 rounded-xl text-base cursor-pointer"
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
                      className="block text-sm font-medium text-brand-secondary mb-1.5"
                    >
                      Estimated Budget
                    </label>
                    <select
                      id="form-budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="field w-full px-4 py-3 rounded-xl text-base cursor-pointer"
                    >
                      <option value="Under $250 (Single Trial Edit / Short-Form Pack)">Under $250 (Single Trial Edit / Short-Form Pack)</option>
                      <option value="$250 – $500 (Single Long-Form / Real Estate Listing)">$250 – $500 (Single Long-Form / Real Estate Listing)</option>
                      <option value="$500 – $1,500 (Monthly Retainer / Multi-Video Package)">$500 – $1,500 (Monthly Retainer / Multi-Video Package)</option>
                      <option value="$1,500+ (Full Channel Management / Custom Production)">$1,500+ (Full Channel Management / Custom Production)</option>
                    </select>
                  </div>
                </div>

                {/* Project Details textarea */}
                <div>
                  <label
                    htmlFor="form-details"
                    className="block text-sm font-medium text-brand-secondary mb-1.5"
                  >
                    Project Brief & Raw Footage Link <span className="text-accent-brand">*</span>
                  </label>
                  <textarea
                    id="form-details"
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Tell us about the project: raw footage length, target platform, reference links, graphics needed, and ideal turnaround date..."
                    className={`field w-full px-4 py-3 rounded-xl text-base ${
                        errors.details ? '!border-red-500' : ''
                      }`}
                  />
                  {errors.details && (
                    <p className="text-xs text-red-400 font-mono-ui mt-1 flex items-center gap-1">
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
                  className="w-full py-4 px-6 rounded-xl btn-parrot font-mono-ui text-sm uppercase flex items-center justify-center gap-2 text-center disabled:opacity-50 cursor-pointer"
                >
                  <span>{status === 'submitting' ? 'Submitting Brief...' : 'Send Project Brief & Get Custom Quote →'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
