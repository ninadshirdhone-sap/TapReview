import React, { useState, useMemo } from 'react';
import { 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Business } from '../types';

interface NormalReviewSectionProps {
  business: Business;
}

export const NormalReviewSection: React.FC<NormalReviewSectionProps> = ({ business }) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hasOpenedGoogle, setHasOpenedGoogle] = useState<boolean>(false);

  // Compute safe Google Review URL with fallback to search/place
  const googleReviewUrl = useMemo(() => {
    if (business.googleReviewUrl && business.googleReviewUrl.trim().length > 0) {
      return business.googleReviewUrl.trim();
    }
    if (business.placeId && business.placeId.trim().length > 0) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(business.placeId.trim())}`;
    }
    const query = `${business.name} ${business.location || business.address || ''}`.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }, [business.googleReviewUrl, business.placeId, business.name, business.location, business.address]);

  // Handle direct Google Review opening
  const handleOpenGoogleReview = (stars?: number) => {
    if (stars) {
      setSelectedRating(stars);
    }
    setHasOpenedGoogle(true);
    window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-4 p-5 sm:p-6 transition-all">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-900 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Google Customer Review</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Official Listing</span>
        </div>
      </div>

      {/* Main Pitch */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          How was your experience?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Your feedback helps us grow and helps others in the community discover {business.name}.
        </p>
      </div>

      {/* Interactive 5-Star Rating Selector */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 mb-5 text-center">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
          Select Your Rating
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleOpenGoogleReview(star)}
              className={`p-1.5 sm:p-2 rounded-xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer ${
                star <= selectedRating
                  ? 'text-amber-400 drop-shadow-sm'
                  : 'text-slate-300 hover:text-amber-200'
              }`}
              title={`Rate ${star} star${star > 1 ? 's' : ''} on Google`}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star 
                className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                  star <= selectedRating 
                    ? 'fill-amber-400 stroke-amber-500' 
                    : 'fill-transparent stroke-current'
                }`} 
              />
            </button>
          ))}
        </div>
        <p className="text-xs font-medium text-slate-600 mt-2">
          {selectedRating === 5 && '🌟 Outstanding! Tap to post your 5-star review'}
          {selectedRating === 4 && '👍 Great! Tap to post your 4-star review'}
          {selectedRating === 3 && '👌 Decent! Tap to share your thoughts'}
          {selectedRating === 2 && '👎 We can do better! Tap to give feedback'}
          {selectedRating === 1 && '⚠️ We apologize! Tap to leave feedback'}
        </p>
      </div>

      {/* Primary Big Google Review Action Button */}
      <button
        onClick={() => handleOpenGoogleReview()}
        className="w-full py-4 px-5 rounded-2xl font-bold text-base text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] group"
        style={{ 
          backgroundColor: '#1E293B',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
        }}
      >
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
        </div>
        <span>Write a Review on Google</span>
        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Post-Click Notification Banner */}
      {hasOpenedGoogle && (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Google Review opened!</span> If the tab did not open,{' '}
            <a 
              href={googleReviewUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline font-bold text-emerald-800 hover:text-emerald-950"
            >
              click here to open manually
            </a>.
          </div>
        </div>
      )}

      {/* 3 Simple Steps */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
          Direct Google Review · 3 Quick Steps
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold mx-auto mb-1 flex items-center justify-center">
              1
            </div>
            <div className="text-[11px] font-semibold text-slate-800 leading-tight">Tap Button</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Opens Google</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold mx-auto mb-1 flex items-center justify-center">
              2
            </div>
            <div className="text-[11px] font-semibold text-slate-800 leading-tight">Rate Stars</div>
            <div className="text-[10px] text-slate-500 mt-0.5">1 to 5 stars</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold mx-auto mb-1 flex items-center justify-center">
              3
            </div>
            <div className="text-[11px] font-semibold text-slate-800 leading-tight">Post Feedback</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Takes ~20s</div>
          </div>
        </div>
      </div>
    </section>
  );
};
