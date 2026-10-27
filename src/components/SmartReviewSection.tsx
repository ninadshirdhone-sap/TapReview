import React, { useState, useEffect, useId, useMemo } from 'react';
import { 
  Star, 
  RotateCw, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Sparkles,
  Info,
  CheckCircle2,
  ClipboardCheck,
  X,
  ArrowRight
} from 'lucide-react';
import { Business, ReviewPrompt } from '../types';
import { generateReviewDraft, isCategoryMatch, isStarOnlyTag } from '../services/reviewGenerator';
import { CATEGORY_TAG_PRESETS, UNIVERSAL_TAGS } from '../data/defaultData';

interface SmartReviewSectionProps {
  business: Business;
  prompts: ReviewPrompt[];
}

export const SmartReviewSection: React.FC<SmartReviewSectionProps> = ({ business, prompts }) => {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draftText, setDraftText] = useState<string>('');
  const [variationSeed, setVariationSeed] = useState<number>(() => Date.now() + Math.floor(Math.random() * 1000000));
  const [copied, setCopied] = useState<boolean>(false);
  const [lastAction, setLastAction] = useState<'copied' | 'copied_and_opened' | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [showCopiedGuide, setShowCopiedGuide] = useState<boolean>(false);
  const textareaId = useId();

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

  // Dynamically derive available tags maintained in Google Sheet for this business type!
  const availableTags = useMemo(() => {
    const sheetTags: string[] = [];
    const seen = new Set<string>();
    const bCat = (business.category || '').toLowerCase().trim();

    // 1. Tags specific to this business category from the sheet prompts
    (prompts || []).forEach(p => {
      if (!p || p.active === false || isStarOnlyTag(p.tag)) return;
      if (isCategoryMatch(p.category, bCat) && p.category.toLowerCase().trim() === bCat) {
        const rawTag = (p.tag || '').trim();
        const lowerTag = rawTag.toLowerCase();
        if (rawTag && !seen.has(lowerTag)) {
          seen.add(lowerTag);
          sheetTags.push(rawTag);
        }
      }
    });

    // 2. Also check other matching prompts (e.g. aliases or related)
    (prompts || []).forEach(p => {
      if (!p || p.active === false || isStarOnlyTag(p.tag)) return;
      if (isCategoryMatch(p.category, bCat)) {
        const rawTag = (p.tag || '').trim();
        const lowerTag = rawTag.toLowerCase();
        if (rawTag && !seen.has(lowerTag)) {
          seen.add(lowerTag);
          sheetTags.push(rawTag);
        }
      }
    });

    // If tags were found in the sheet for this business type, use them directly!
    if (sheetTags.length > 0) {
      return sheetTags;
    }

    // Graceful fallback to category presets if sheet is still syncing or has only star comments
    return CATEGORY_TAG_PRESETS[business.category] || UNIVERSAL_TAGS;
  }, [business.category, prompts]);

  // Auto-select initial tags when availableTags change
  useEffect(() => {
    setSelectedTags(prev => {
      const valid = prev.filter(t => availableTags.some(at => at.toLowerCase() === t.toLowerCase()));
      if (valid.length > 0) return valid;
      return availableTags.slice(0, Math.min(2, availableTags.length));
    });
  }, [availableTags]);

  // Regenerate draft whenever rating, tags, or variation seed changes
  useEffect(() => {
    const newDraft = generateReviewDraft(
      business,
      rating,
      selectedTags,
      prompts,
      variationSeed
    );
    setDraftText(newDraft);
  }, [rating, selectedTags, variationSeed, business, prompts]);

  // Handle rating change - always generate a fresh random seed
  const handleRatingSelect = (newRating: number) => {
    setRating(newRating);
    setVariationSeed(Date.now() + Math.floor(Math.random() * 1000000));
    setCopied(false);
    setLastAction(null);
  };

  // Toggle tag selection - always generate a fresh random seed
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setVariationSeed(Date.now() + Math.floor(Math.random() * 1000000));
    setCopied(false);
    setLastAction(null);
  };

  // Shuffle / Generate a completely new review variation every time
  const handleRegenerate = () => {
    setIsRegenerating(true);
    setVariationSeed(Date.now() + Math.floor(Math.random() * 1000000));
    setCopied(false);
    setLastAction(null);
    setTimeout(() => setIsRegenerating(false), 220);
  };

  // Resilient multi-tier copy function
  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text) return false;
    let ok = false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        ok = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        ok = false;
      }
    }
    return ok;
  };

  // Copy text to clipboard only
  const handleCopyOnly = async () => {
    const ok = await copyToClipboard(draftText);
    if (ok) {
      setCopied(true);
      setLastAction('copied');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Core action: Automatically copies review text and opens Google Review
  const handleCopyAndOpenGoogle = async () => {
    // 1. Instantly copy review draft to user's clipboard
    await copyToClipboard(draftText);
    setCopied(true);
    setLastAction('copied_and_opened');
    setShowCopiedGuide(true);

    // 2. Open Google Review in new tab
    if (googleReviewUrl) {
      window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Semantic rating labels
  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5: return '5 Stars · Exceptional experience!';
      case 4: return '4 Stars · Very good, recommended';
      case 3: return '3 Stars · Average / Room for improvement';
      case 2: return '2 Stars · Underwhelming / Disappointing';
      case 1: return '1 Star · Significant issues encountered';
      default: return '';
    }
  };

  return (
    <>
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-4">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                1. Smart Review Assistant
              </h2>
              <p className="text-xs text-slate-500">
                Select rating & highlights to generate an instant review draft
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded px-2 py-0.5 hidden sm:inline-block">
            Honest Feedback
          </span>
        </div>

        {/* Step 1: Star Rating Selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Choose Your Star Rating:</span>
            <span className="text-amber-800 font-bold">{getRatingLabel(rating)}</span>
          </div>

          {/* 5 Big Touch Stars */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isSelected = starValue <= rating;
              const isCurrent = starValue === rating;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => handleRatingSelect(starValue)}
                  aria-label={`${starValue} star rating`}
                  className={`min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.03]'
                      : isSelected
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <Star 
                    className={`w-6 h-6 transition-transform ${
                      isSelected ? 'fill-current' : 'text-slate-300'
                    }`} 
                  />
                  <span className={`text-[11px] font-bold ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                    {starValue}★
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Interactive Highlights / Tags Selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <span>What stood out during your visit?</span>
              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/60 rounded px-1.5 py-0.5 font-medium">
                {availableTags.length} Highlights
              </span>
            </span>
            <span className="text-slate-400 font-normal text-[11px]">Select any that apply</span>
          </div>

          {/* Interactive Filter Buttons (Allow multi-select, not static pills) */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {availableTags.map((tag) => {
              const isChecked = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                    isChecked
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isChecked && <span className="mr-1 text-amber-400 font-bold">✓</span>}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Generated Review Draft Box */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor={textareaId} className="font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Generated Review Draft</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/90 active:scale-95 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-slate-200"
                title="Generate a completely new review variation every time"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
                <span>🎲 Shuffle / New Review</span>
              </button>
            </div>
          </div>

          {/* Editable Draft Text Area */}
          <div className="relative">
            <textarea
              id={textareaId}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={4}
              className="w-full text-xs sm:text-sm text-slate-800 bg-slate-50/70 border border-slate-300 rounded-xl p-3.5 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors resize-y leading-relaxed"
              placeholder="Your review draft will appear here..."
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1.5">
              <span className="flex items-center gap-1 text-slate-500">
                <Info className="w-3 h-3 text-slate-400" />
                <span>Freely edit text before posting</span>
              </span>
              <span className="font-mono tabular-nums text-slate-400">{draftText.length} chars</span>
            </div>
          </div>
        </div>

        {/* Honest Review Assurance (Compliant with Google policies) */}
        {rating <= 3 && (
          <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Honest Feedback Guarantee:</strong> We never filter or hide reviews. Your constructive criticism helps this business address operational issues. Feel free to post directly on Google!
            </p>
          </div>
        )}

        {/* Step 4: Primary Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            {/* Primary High-Visibility Action: Automatically Copies & Opens Google Review */}
            <button
              type="button"
              onClick={handleCopyAndOpenGoogle}
              className="flex-1 min-h-[54px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg cursor-pointer group"
            >
              {/* Google G Logo icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <div className="flex flex-col items-start text-left">
                <span className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base leading-tight">
                  <span>Copy Review & Open Google</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
                <span className="text-[11px] font-normal text-amber-400 leading-tight">
                  Copies automatically · You just paste & submit
                </span>
              </div>
            </button>

            {/* Separate Copy Only Button */}
            <button
              type="button"
              onClick={handleCopyOnly}
              className={`min-h-[54px] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border shrink-0 ${
                copied && lastAction === 'copied'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              title="Copy review text only"
            >
              {copied && lastAction === 'copied' ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy Text Only</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Guidance Footnote */}
          <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/50 flex items-center justify-between text-xs text-amber-950">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Clicking the button copies this review & opens Google Review</span>
            </span>
            <span className="text-[11px] text-amber-800 font-bold shrink-0">Just Paste & Post</span>
          </div>
        </div>
      </section>

      {/* Post-Click Step Guidance Modal / Drawer: Tells the user exactly how to paste */}
      {showCopiedGuide && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Review Copied to Clipboard!
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your generated review is ready to paste on Google
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCopiedGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Step Interactive Checklist */}
            <div className="space-y-3 mb-5 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <span className="font-bold text-slate-900">Step 1: Review text is copied</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    We automatically copied your {draftText.length}-character review to your device's clipboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div className="flex-1">
                  <span className="font-bold text-slate-900">Step 2: Google Review window</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    If Google didn't open automatically, tap the button below:
                  </p>
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200/80 transition-colors"
                  >
                    <span>Open Google Review Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <span className="font-bold text-slate-900">Step 3: Paste and submit</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    In the Google review box, <strong>long-press & tap "Paste"</strong> (or press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-mono">Ctrl+V</kbd>), then tap <strong>Post</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview of Copied Review */}
            <div className="mb-5 p-3 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-700">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                <span>Copied Review Text:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ClipboardCheck className="w-3 h-3" /> Ready on clipboard
                </span>
              </div>
              <p className="italic text-slate-800 line-clamp-3 leading-relaxed">
                "{draftText}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await copyToClipboard(draftText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>{copied ? 'Copied Again!' : 'Copy Again'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCopiedGuide(false)}
                className="flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Got it, thanks!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
