import React from 'react';
import { 
  Star, 
  MapPin, 
  CheckCircle2, 
  Coffee, 
  Sparkles, 
  Utensils, 
  Stethoscope, 
  Activity, 
  ShoppingBag, 
  Store,
  Wifi
} from 'lucide-react';
import { Business } from '../types';

interface BusinessCardHeaderProps {
  business: Business;
  isAdmin?: boolean;
}

export const BusinessCardHeader: React.FC<BusinessCardHeaderProps> = ({ business, isAdmin }) => {
  // Render icon based on avatarIcon or category
  const renderCategoryIcon = () => {
    const iconName = business.avatarIcon?.toLowerCase() || business.category.toLowerCase();
    const props = { className: 'w-6 h-6 text-white' };

    if (iconName.includes('coffee') || iconName.includes('cafe')) return <Coffee {...props} />;
    if (iconName.includes('sparkle') || iconName.includes('salon') || iconName.includes('spa')) return <Sparkles {...props} />;
    if (iconName.includes('utensil') || iconName.includes('food') || iconName.includes('restaurant')) return <Utensils {...props} />;
    if (iconName.includes('steth') || iconName.includes('clinic') || iconName.includes('dental') || iconName.includes('health')) return <Stethoscope {...props} />;
    if (iconName.includes('gym') || iconName.includes('fit') || iconName.includes('activity')) return <Activity {...props} />;
    if (iconName.includes('shop') || iconName.includes('retail')) return <ShoppingBag {...props} />;
    return <Store {...props} />;
  };

  const accent = business.accentColor || '#1E293B';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-4">
      {/* Visual Accent Top Bar */}
      <div 
        className="h-2 w-full transition-colors"
        style={{ backgroundColor: accent }} 
      />

      <div className="p-5 sm:p-6">
        {/* Top Standee Context Bar - Only shown in Admin Mode */}
        {/* Top Standee Context Bar - Only shown in Admin Mode */}
        {isAdmin && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mb-3">
            <div className="flex items-center gap-1.5 font-medium">
              <Wifi className="w-3.5 h-3.5 text-amber-700 rotate-90" />
              <span>Standee Config</span>
              <span className="text-amber-400">·</span>
              <span className="font-semibold">
                Mode: {business.smartReview !== false ? (
                  <span className="text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px]">Smart Review (Tags & AI)</span>
                ) : (
                  <span className="text-blue-700 font-bold bg-blue-100/70 px-1.5 py-0.5 rounded text-[10px]">Normal Google Review</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <span className="text-amber-700">ID:</span>
              <span className="font-bold text-amber-950">{business.businessId}</span>
            </div>
          </div>
        )}

        {/* Business Primary Identity */}
        <div className="flex items-start gap-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform"
            style={{ backgroundColor: accent }}
          >
            {renderCategoryIcon()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                {business.name}
              </h1>
              <span title="Verified Business Profile" className="text-blue-600 shrink-0">
                <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
              </span>
            </div>

            {/* Zero-Pill Metadata Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-2">
              <span className="font-semibold text-slate-800">{business.category}</span>
              {business.address && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[200px]">{business.address}</span>
                  </span>
                </>
              )}
            </div>

            {/* Google Rating Counter */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200/60 rounded px-2 py-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-mono tabular-nums">{business.averageRating?.toFixed(1) || '4.8'}</span>
              </div>
              <span className="text-slate-500 font-medium">
                from <span className="font-mono tabular-nums font-semibold text-slate-700">{business.ratingCount || 100}+</span> Google reviews
              </span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        {business.tagline && (
          <p className="mt-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            {business.tagline}
          </p>
        )}
      </div>
    </div>
  );
};
