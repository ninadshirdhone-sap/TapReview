/**
 * Types for Smart_Review.in QR/NFC Business Standee Platform
 */

export interface Business {
  businessId: string;
  name: string;
  category: string;
  tagline?: string;
  googleReviewUrl: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  active: boolean;
  smartReview?: boolean; // If true (default), shows Smart Review generator with tags & generated comments; if false, shows Normal Google Review
  address?: string;
  location?: string;
  placeId?: string;
  accentColor?: string;
  avatarIcon?: string;
  ratingCount?: number;
  averageRating?: number;
  whatsappOfferTitle?: string;
  whatsappOfferSubtitle?: string;
}

export interface ReviewPrompt {
  id?: string;
  category: string;
  rating: number; // 1 | 2 | 3 | 4 | 5
  tag: string; // e.g. 'Food', 'Service', 'Ambience', 'Value', 'Wait Time', 'Staff', 'Hygiene', 'General'
  sentenceTemplate: string;
  active: boolean;
}

export interface ReviewDraftOptions {
  business: Business;
  rating: number;
  selectedTags: string[];
  prompts: ReviewPrompt[];
  variationSeed?: number;
}

export interface SheetsSyncStatus {
  isLiveConnected: boolean;
  sheetId: string | null;
  method: 'api_key' | 'service_account' | 'public_csv' | 'sample_data';
  lastSyncedAt: string;
  businessCount: number;
  promptsCount: number;
  error?: string | null;
}

export interface CategoryTagConfig {
  category: string;
  tags: {
    name: string;
    label: string;
    icon: string;
  }[];
}
