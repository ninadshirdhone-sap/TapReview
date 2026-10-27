import React from 'react';
import { ExternalLink, Tag, ArrowRight } from 'lucide-react';
import { Business } from '../types';

interface SocialActionButtonsProps {
  business: Business;
}

export const SocialActionButtons: React.FC<SocialActionButtonsProps> = ({ business }) => {
  const hasInstagram = Boolean(business.instagramUrl && business.instagramUrl.trim().length > 0);
  const hasWhatsapp = Boolean(business.whatsappUrl && business.whatsappUrl.trim().length > 0);

  // If both are missing, do not render this section
  if (!hasInstagram && !hasWhatsapp) {
    return null;
  }

  // Extract Instagram handle if possible
  const getInstagramHandle = (url?: string) => {
    if (!url) return '';
    try {
      const clean = url.replace(/\/+$/, '');
      const parts = clean.split('/');
      const last = parts[parts.length - 1];
      return last ? (last.startsWith('@') ? last : `@${last}`) : '@instagram';
    } catch {
      return '@instagram';
    }
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Feature 2: Instagram Follow */}
      {hasInstagram && (
        <a
          href={business.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 transition-all hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Instagram Gradient Logo */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                    2. Social Feed
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Follow on Instagram
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {getInstagramHandle(business.instagramUrl)} · Daily stories, reels & specials
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-rose-600 group-hover:text-rose-700 bg-rose-50 group-hover:bg-rose-100/80 px-3 py-2 rounded-xl transition-colors">
              <span>Follow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </a>
      )}

      {/* Feature 3: WhatsApp Offers & Channel */}
      {hasWhatsapp && (
        <a
          href={business.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-emerald-50/70 hover:bg-emerald-50 rounded-2xl border border-emerald-200/90 shadow-sm p-4 sm:p-5 transition-all hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5 min-w-0">
              {/* WhatsApp Green Badge */}
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm text-white">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.101-.477-.15-.678.15-.201.301-.778.98-.954 1.18-.176.2-.352.226-.653.076-.301-.15-1.272-.469-2.424-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.176.201-.301.302-.502.101-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.238-.244-.588-.493-.508-.678-.517-.176-.009-.377-.009-.578-.009s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.511s1.079 2.913 1.23 3.114c.151.201 2.123 3.242 5.143 4.547.718.31 1.279.496 1.716.635.722.23 1.379.197 1.9.119.58-.088 1.782-.728 2.033-1.432.251-.703.251-1.306.176-1.432-.076-.126-.277-.201-.578-.352z" />
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.066 22l4.98-1.306A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.63 0-3.14-.49-4.41-1.33l-.316-.208-2.96.776.79-2.885-.228-.363A8.204 8.204 0 0 1 3.75 12c0-4.549 3.701-8.25 8.25-8.25s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z" />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    3. WhatsApp Offers & VIP Club
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {business.whatsappOfferTitle || 'Join WhatsApp Channel for Offers'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {business.whatsappOfferSubtitle || 'Tap to join our WhatsApp Channel for instant discounts, secret menu drops & event updates.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 pt-1">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </a>
      )}
    </div>
  );
};
