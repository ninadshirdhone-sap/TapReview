import { Business, ReviewPrompt } from '../types';

export const DEFAULT_BUSINESSES: Business[] = [
  {
    businessId: 'cafe-roma',
    name: 'Café Roma & Artisanal Roastery',
    category: 'Cafe',
    tagline: 'Freshly roasted single-origin coffees, hand-rolled pastries & warm vibes.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    instagramUrl: 'https://instagram.com/caferoma_specialty',
    whatsappUrl: 'https://chat.whatsapp.com/sampleCafeRomaVIPClub',
    active: true,
    smartReview: true,
    address: 'Bandra West, Mumbai',
    accentColor: '#B45309', // Warm amber / coffee
    avatarIcon: 'Coffee',
    ratingCount: 384,
    averageRating: 4.8,
    whatsappOfferTitle: 'Join the Coffee Club on WhatsApp',
    whatsappOfferSubtitle: 'Get a free cinnamon roll on your next visit + weekly secret brew drops.'
  },
  {
    businessId: 'glow-salon',
    name: 'Glow Studio & Luxury Spa',
    category: 'Salon & Spa',
    tagline: 'Premium hair styling, restorative facials & bridal artistry.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJo7g38Vp_EmsR_dE3zC6kG1g',
    instagramUrl: 'https://instagram.com/glowstudio_luxury',
    whatsappUrl: 'https://chat.whatsapp.com/sampleGlowVIPPerks',
    active: true,
    smartReview: true,
    address: 'Indiranagar, Bengaluru',
    accentColor: '#9333EA', // Luxury violet
    avatarIcon: 'Sparkles',
    ratingCount: 512,
    averageRating: 4.9,
    whatsappOfferTitle: 'VIP Spa Insider Club',
    whatsappOfferSubtitle: 'Claim 15% off your next session and early access to weekend appointment slots.'
  },
  {
    businessId: 'spice-hub',
    name: 'Spice Hub Fine Dining',
    category: 'Restaurant',
    tagline: 'Authentic royal Mughlai cuisine, tandoori grills & modern cocktails.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJrTLr-GyuEmsRBfy61i59si0',
    instagramUrl: 'https://instagram.com/spicehub_dining',
    whatsappUrl: 'https://chat.whatsapp.com/sampleSpiceHubOffers',
    active: true,
    smartReview: true,
    address: 'Connaught Place, New Delhi',
    accentColor: '#E11D48', // Rich crimson
    avatarIcon: 'Utensils',
    ratingCount: 920,
    averageRating: 4.7,
    whatsappOfferTitle: 'Join Spice Hub Diners Circle',
    whatsappOfferSubtitle: 'Unlock complimentary chef appetizers, event invites & celebratory birthday perks.'
  },
  {
    businessId: 'dental-care',
    name: 'Apex Smile Dental & Implant Clinic',
    category: 'Healthcare',
    tagline: 'Gentle, modern dentistry with digital scan technology and expert care.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
    instagramUrl: 'https://instagram.com/apex_smiledental',
    whatsappUrl: 'https://wa.me/919876543210?text=Hello%20Apex%20Dental,%20I%20would%20like%20to%20inquire%20about%20an%20appointment',
    active: true,
    smartReview: true,
    address: 'Koregaon Park, Pune',
    accentColor: '#0284C7', // Clinical modern cyan/blue
    avatarIcon: 'Stethoscope',
    ratingCount: 246,
    averageRating: 4.9,
    whatsappOfferTitle: 'Dental Health Concierge on WhatsApp',
    whatsappOfferSubtitle: 'Direct dental advice, post-care reminders & complimentary annual checkup bookings.'
  },
  {
    businessId: 'urban-fit',
    name: 'Urban Fit Performance Gym',
    category: 'Fitness',
    tagline: 'State-of-the-art strength training, HIIT zones & certified athletic coaching.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJB9g38Vp_EmsR_dE3zC6kG1e',
    instagramUrl: 'https://instagram.com/urbanfit_india',
    whatsappUrl: 'https://chat.whatsapp.com/sampleUrbanFitCommunity',
    active: true,
    smartReview: true,
    address: 'Jubilee Hills, Hyderabad',
    accentColor: '#059669', // Emerald
    avatarIcon: 'Activity',
    ratingCount: 430,
    averageRating: 4.8,
    whatsappOfferTitle: 'Urban Fit Community Channel',
    whatsappOfferSubtitle: 'Workout schedules, daily nutritionist tips and seasonal challenge rewards.'
  },
  {
    businessId: 'heritage-crafts',
    name: 'Heritage Living Boutique',
    category: 'Retail',
    tagline: 'Handcrafted home decor, sustainable ceramics & artisanal textiles.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJv98f-GyuEmsRBfy61i59si1',
    instagramUrl: 'https://instagram.com/heritageliving_in',
    whatsappUrl: '', // Missing URL on purpose to test conditional rendering rule!
    active: true,
    smartReview: false, // Normal Google review mode!
    address: 'Fort, Mumbai',
    accentColor: '#D97706',
    avatarIcon: 'ShoppingBag',
    ratingCount: 164,
    averageRating: 4.6,
    whatsappOfferTitle: '',
    whatsappOfferSubtitle: ''
  },
  {
    businessId: 'sunset-rooftop-lounge',
    name: 'Sunset Sky Lounge & Bar',
    category: 'Restaurant',
    tagline: 'Panoramic skyline sunsets, craft mixology and chill acoustic evenings.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ0-VgeAK6j4ARbn5u_wAGqWB',
    instagramUrl: 'https://instagram.com/sunsets_lounge',
    whatsappUrl: 'https://chat.whatsapp.com/sampleSunsetLounge',
    active: false, // Inactive on purpose to test inactive standee page!
    smartReview: true,
    address: 'Worli, Mumbai',
    accentColor: '#6366F1',
    avatarIcon: 'Wine',
    ratingCount: 110,
    averageRating: 4.4
  },
  {
    businessId: 'the-brand-essence',
    name: 'The Brand Essence',
    category: 'Clothing',
    tagline: 'Curated premium fashion, designer apparel & bespoke lifestyle wear.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJq03_QAa35zsRE8Fuva23ptQ',
    instagramUrl: 'https://www.instagram.com/be_13.02.2024/',
    whatsappUrl: '',
    active: true,
    smartReview: true,
    address: 'Premium Fashion District',
    accentColor: '#4F46E5',
    avatarIcon: 'ShoppingBag',
    ratingCount: 128,
    averageRating: 4.9,
    whatsappOfferTitle: 'VIP Style Club',
    whatsappOfferSubtitle: 'Direct updates on seasonal collections, private previews & member perks.'
  },
  {
    businessId: 'apex-dental',
    name: 'Apex Smile Dental Clinic',
    category: 'Healthcare',
    tagline: 'Gentle, modern dentistry with digital scan technology and expert care.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
    instagramUrl: 'https://instagram.com/apex_smiledental',
    whatsappUrl: 'https://wa.me/919876543210',
    active: true,
    smartReview: true,
    address: 'Koregaon Park, Pune',
    accentColor: '#0284C7',
    avatarIcon: 'Stethoscope',
    ratingCount: 246,
    averageRating: 4.9,
    whatsappOfferTitle: 'Dental Health Concierge on WhatsApp',
    whatsappOfferSubtitle: 'Direct dental advice, post-care reminders & complimentary checkup bookings.'
  },
  {
    businessId: 'heritage-boutique',
    name: 'Heritage Living Boutique',
    category: 'Retail',
    tagline: 'Handcrafted home decor, sustainable ceramics & artisanal textiles.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJv98f-GyuEmsRBfy61i59si1',
    instagramUrl: 'https://instagram.com/heritageliving_in',
    whatsappUrl: '',
    active: true,
    smartReview: false, // Normal Google review mode!
    address: 'Fort, Mumbai',
    accentColor: '#D97706',
    avatarIcon: 'ShoppingBag',
    ratingCount: 164,
    averageRating: 4.6
  },
  {
    businessId: 'sunset-lounge',
    name: 'Sunset Sky Lounge & Bar',
    category: 'Restaurant',
    tagline: 'Panoramic skyline sunsets, craft mixology and chill acoustic evenings.',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ0-VgeAK6j4ARbn5u_wAGqWB',
    instagramUrl: 'https://instagram.com/sunsets_lounge',
    whatsappUrl: 'https://chat.whatsapp.com/sampleSunsetLounge',
    active: false,
    smartReview: true,
    address: 'Worli, Mumbai',
    accentColor: '#6366F1',
    avatarIcon: 'Wine',
    ratingCount: 110,
    averageRating: 4.4
  }
];

export const DEFAULT_PROMPTS: ReviewPrompt[] = [
  // ===================== 5 STARS (EXCEPTIONAL) =====================
  // General / Overall
  {
    category: 'Universal',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Had an absolutely outstanding experience here today!',
    active: true
  },
  {
    category: 'Universal',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Truly a 5-star establishment that exceeds expectations every single time.',
    active: true
  },
  {
    category: 'Universal',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Hands down one of the finest spots in town. Cannot recommend enough!',
    active: true
  },

  // Food / Drinks
  {
    category: 'Cafe',
    rating: 5,
    tag: 'Coffee & Drinks',
    sentenceTemplate: 'The coffee is brewed to perfection—smooth, aromatic, and rich in flavor.',
    active: true
  },
  {
    category: 'Cafe',
    rating: 5,
    tag: 'Pastries & Food',
    sentenceTemplate: 'The artisanal baked goods were warm, flaky, and exceptionally fresh.',
    active: true
  },
  {
    category: 'Restaurant',
    rating: 5,
    tag: 'Food Quality',
    sentenceTemplate: 'The dishes were bursting with authentic flavors, top-tier ingredients, and impeccable presentation.',
    active: true
  },
  {
    category: 'Restaurant',
    rating: 5,
    tag: 'Portions',
    sentenceTemplate: 'Portion sizes were generous and every course was seasoned just right.',
    active: true
  },

  // Service / Staff
  {
    category: 'Universal',
    rating: 5,
    tag: 'Staff & Hospitality',
    sentenceTemplate: 'The team was incredibly courteous, welcoming, and attentive to every detail.',
    active: true
  },
  {
    category: 'Universal',
    rating: 5,
    tag: 'Staff & Hospitality',
    sentenceTemplate: 'Staff went above and beyond to make sure our visit was seamless and memorable.',
    active: true
  },

  // Ambience / Cleanliness
  {
    category: 'Universal',
    rating: 5,
    tag: 'Ambience',
    sentenceTemplate: 'The vibe and aesthetic are gorgeous—tasteful music, comfortable seating, and wonderful lighting.',
    active: true
  },
  {
    category: 'Universal',
    rating: 5,
    tag: 'Cleanliness & Hygiene',
    sentenceTemplate: 'Spotlessly clean, well organized, and adheres to the highest hygiene standards.',
    active: true
  },

  // Value & Speed
  {
    category: 'Universal',
    rating: 5,
    tag: 'Value for Money',
    sentenceTemplate: 'Great value for the top-notch quality and care delivered.',
    active: true
  },
  {
    category: 'Universal',
    rating: 5,
    tag: 'Fast Service',
    sentenceTemplate: 'Prompt service with zero unnecessary waiting.',
    active: true
  },

  // Salon & Spa 5 Stars
  {
    category: 'Salon & Spa',
    rating: 5,
    tag: 'Styling & Care',
    sentenceTemplate: 'The stylist understood exactly what I wanted and executed the look with precision.',
    active: true
  },
  {
    category: 'Salon & Spa',
    rating: 5,
    tag: 'Relaxation & Spa',
    sentenceTemplate: 'An deeply relaxing, pampering session with premium products and skilled hands.',
    active: true
  },

  // Healthcare & Dental 5 Stars
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Had a truly seamless and reassuring experience at this clinic today.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Top-notch clinical care with an exceptionally compassionate and professional team.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Easily one of the most reassuring healthcare experiences I have had. Highly recommended!',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Gentle Care',
    sentenceTemplate: 'The doctor and staff were remarkably gentle, making the entire procedure calm, pain-free, and comfortable.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Gentle Care',
    sentenceTemplate: 'I usually feel anxious before dental treatments, but their calm, gentle touch put me completely at ease.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Clear Explanation',
    sentenceTemplate: 'Appreciated the thorough consultation and clear explanation of every step before beginning.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Clear Explanation',
    sentenceTemplate: 'The doctor patiently walked me through the scans and treatment plan with complete clarity and zero rush.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Wait Time',
    sentenceTemplate: 'Hardly any waiting time at all—appointments run right on schedule with smooth check-in.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Wait Time',
    sentenceTemplate: 'Extremely well-managed schedule; I was seen right at my appointed time.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Cleanliness & Hygiene',
    sentenceTemplate: 'Spotless clinic with sanitized modern equipment and top clinical hygiene standards.',
    active: true
  },
  {
    category: 'Healthcare',
    rating: 5,
    tag: 'Staff & Hospitality',
    sentenceTemplate: 'The front desk and clinical assistants were wonderfully welcoming and attentive.',
    active: true
  },

  // Fitness 5 Stars
  {
    category: 'Fitness',
    rating: 5,
    tag: 'Equipment',
    sentenceTemplate: 'High-end, well-maintained equipment and ample space to train comfortably.',
    active: true
  },
  {
    category: 'Fitness',
    rating: 5,
    tag: 'Coaching',
    sentenceTemplate: 'The trainers are knowledgeable, motivating, and keep the energy electric.',
    active: true
  },

  // Clothing & Fashion 5 Stars (Multiple variations for each combination)
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Hands down one of the best clothing stores I have shopped at in a long time!',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Exceptional designer fashion collection with a premium shopping experience.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Overall',
    sentenceTemplate: 'Left completely thrilled with my purchases and the overall customer experience.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Fabric & Quality',
    sentenceTemplate: 'The fabric quality, stitching, and finishing are top-tier and feel genuinely luxurious.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Fabric & Quality',
    sentenceTemplate: 'Incredibly breathable, durable fabrics with exquisite stitch detailing and craftsmanship.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Fabric & Quality',
    sentenceTemplate: 'Premium materials that look great, hold up wash after wash, and feel supremely comfortable.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Trendy Collection',
    sentenceTemplate: 'Loved the fresh collection—super stylish, modern cuts, and timeless color palettes.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Trendy Collection',
    sentenceTemplate: 'A wonderfully curated seasonal lineup featuring versatile, trendsetting pieces.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Trendy Collection',
    sentenceTemplate: 'Standout aesthetic with unique designs that are impossible to find in regular stores.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Fitting & Sizes',
    sentenceTemplate: 'The trial and fit were spot-on; true to size and extremely flattering.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Fitting & Sizes',
    sentenceTemplate: 'Tailored fit that feels custom-made, with great size inclusivity across ranges.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Fitting & Sizes',
    sentenceTemplate: 'Cuts drape effortlessly and accentuate comfort without compromising on style.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Store Ambience',
    sentenceTemplate: 'The store layout, lighting, and mirror displays make shopping such an enjoyable experience.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Store Ambience',
    sentenceTemplate: 'Chic, boutique aesthetic that is impeccably organized and relaxed to browse in.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Staff & Hospitality',
    sentenceTemplate: 'The styling team was courteous, attentive, and offered spot-on outfit recommendations.',
    active: true
  },
  {
    category: 'Clothing',
    rating: 5,
    tag: 'Value for Money',
    sentenceTemplate: 'High-end designer quality at very reasonable price points; worth every single rupee.',
    active: true
  },

  // ===================== 4 STARS (VERY GOOD) =====================
  {
    category: 'Universal',
    rating: 4,
    tag: 'Overall',
    sentenceTemplate: 'Overall a very pleasant experience and well worth a visit.',
    active: true
  },
  {
    category: 'Universal',
    rating: 4,
    tag: 'Overall',
    sentenceTemplate: 'Really good service and atmosphere. Just minor tweaks needed to make it a perfect five.',
    active: true
  },
  {
    category: 'Restaurant',
    rating: 4,
    tag: 'Food Quality',
    sentenceTemplate: 'Food was delicious and tasty, with just one dish being slightly on the milder side.',
    active: true
  },
  {
    category: 'Cafe',
    rating: 4,
    tag: 'Coffee & Drinks',
    sentenceTemplate: 'Really enjoyed the specialty drinks; would love to see a few more dairy-free options.',
    active: true
  },
  {
    category: 'Universal',
    rating: 4,
    tag: 'Staff & Hospitality',
    sentenceTemplate: 'The staff was friendly and accommodating throughout our time here.',
    active: true
  },
  {
    category: 'Universal',
    rating: 4,
    tag: 'Ambience',
    sentenceTemplate: 'Cozy and pleasant atmosphere, though it can get a little loud during peak hours.',
    active: true
  },
  {
    category: 'Universal',
    rating: 4,
    tag: 'Wait Time',
    sentenceTemplate: 'Slight waiting time during rush hour, but the team handled the queue well.',
    active: true
  },
  {
    category: 'Universal',
    rating: 4,
    tag: 'Value for Money',
    sentenceTemplate: 'Reasonably priced for the experience provided.',
    active: true
  },

  // ===================== 3 STARS (FAIR / AVERAGE) =====================
  {
    category: 'Universal',
    rating: 3,
    tag: 'Overall',
    sentenceTemplate: 'A decent experience overall, but there is noticeable room for improvement.',
    active: true
  },
  {
    category: 'Universal',
    rating: 3,
    tag: 'Overall',
    sentenceTemplate: 'Mixed impressions from our visit today. Some aspects were fine, others felt average.',
    active: true
  },
  {
    category: 'Restaurant',
    rating: 3,
    tag: 'Food Quality',
    sentenceTemplate: 'The food was average—flavors were okay but did not quite match the hype or menu description.',
    active: true
  },
  {
    category: 'Universal',
    rating: 3,
    tag: 'Staff & Hospitality',
    sentenceTemplate: 'Service was okay, though staff seemed rushed and could have been more attentive.',
    active: true
  },
  {
    category: 'Universal',
    rating: 3,
    tag: 'Wait Time',
    sentenceTemplate: 'Wait times were longer than expected both for seating and order delivery.',
    active: true
  },
  {
    category: 'Universal',
    rating: 3,
    tag: 'Ambience',
    sentenceTemplate: 'The space was quite crowded and noisy, making conversation difficult.',
    active: true
  },
  {
    category: 'Universal',
    rating: 3,
    tag: 'Value for Money',
    sentenceTemplate: 'Felt a bit overpriced compared to the actual portion and quality received.',
    active: true
  },

  // ===================== 2 STARS (POOR / DISAPPOINTING) =====================
  {
    category: 'Universal',
    rating: 2,
    tag: 'Overall',
    sentenceTemplate: 'Unfortunately, our experience today fell well short of expectations.',
    active: true
  },
  {
    category: 'Universal',
    rating: 2,
    tag: 'Overall',
    sentenceTemplate: 'Left rather underwhelmed. Several areas require management attention and retraining.',
    active: true
  },
  {
    category: 'Restaurant',
    rating: 2,
    tag: 'Food Quality',
    sentenceTemplate: 'The food was served lukewarm and lacked flavor or fresh ingredients.',
    active: true
  },
  {
    category: 'Universal',
    rating: 2,
    tag: 'Staff & Hospitality',
    sentenceTemplate: 'Staff appeared disinterested and took several reminders to address basic requests.',
    active: true
  },
  {
    category: 'Universal',
    rating: 2,
    tag: 'Wait Time',
    sentenceTemplate: 'Excessive waiting time without any proactive communication from the floor team.',
    active: true
  },
  {
    category: 'Universal',
    rating: 2,
    tag: 'Cleanliness & Hygiene',
    sentenceTemplate: 'Cleanliness was underwhelming; tables and restrooms needed prompt maintenance.',
    active: true
  },
  {
    category: 'Universal',
    rating: 2,
    tag: 'Value for Money',
    sentenceTemplate: 'Definitely not worth the price charged given the subpar quality and delayed service.',
    active: true
  },

  // ===================== 1 STAR (VERY DISSATISFIED / HONEST CRITIQUE) =====================
  {
    category: 'Universal',
    rating: 1,
    tag: 'Overall',
    sentenceTemplate: 'Extremely disappointing visit. We expected much better standards.',
    active: true
  },
  {
    category: 'Universal',
    rating: 1,
    tag: 'Overall',
    sentenceTemplate: 'A very frustrating experience from start to finish. Would not return unless major changes occur.',
    active: true
  },
  {
    category: 'Restaurant',
    rating: 1,
    tag: 'Food Quality',
    sentenceTemplate: 'The food quality was unacceptable—cold, poorly prepared, and orders were mixed up.',
    active: true
  },
  {
    category: 'Universal',
    rating: 1,
    tag: 'Staff & Hospitality',
    sentenceTemplate: 'Staff was dismissive and unresponsive when we politely pointed out the issues.',
    active: true
  },
  {
    category: 'Universal',
    rating: 1,
    tag: 'Wait Time',
    sentenceTemplate: 'Unreasonable delays of over 45 minutes with zero updates or apologies.',
    active: true
  },
  {
    category: 'Universal',
    rating: 1,
    tag: 'Cleanliness & Hygiene',
    sentenceTemplate: 'Hygiene and cleanliness were deeply concerning and need urgent remediation.',
    active: true
  },
  {
    category: 'Universal',
    rating: 1,
    tag: 'Value for Money',
    sentenceTemplate: 'Overpriced with zero accountability for the poor service provided.',
    active: true
  }
];

export const CATEGORY_TAG_PRESETS: Record<string, string[]> = {
  'Cafe': ['Coffee & Drinks', 'Pastries & Food', 'Staff & Hospitality', 'Ambience', 'Fast Service', 'Value for Money', 'Cleanliness & Hygiene'],
  'Restaurant': ['Food Quality', 'Portions', 'Staff & Hospitality', 'Ambience', 'Wait Time', 'Value for Money', 'Cleanliness & Hygiene'],
  'Salon & Spa': ['Styling & Care', 'Relaxation & Spa', 'Staff & Hospitality', 'Cleanliness & Hygiene', 'Ambience', 'Value for Money'],
  'Healthcare': ['Gentle Care', 'Clear Explanation', 'Staff & Hospitality', 'Cleanliness & Hygiene', 'Wait Time', 'Ambience'],
  'Fitness': ['Equipment', 'Coaching', 'Cleanliness & Hygiene', 'Staff & Hospitality', 'Ambience', 'Value for Money'],
  'Retail': ['Staff & Hospitality', 'Ambience', 'Value for Money', 'Cleanliness & Hygiene', 'Fast Service'],
  'Clothing': ['Fabric & Quality', 'Trendy Collection', 'Fitting & Sizes', 'Staff & Hospitality', 'Value for Money', 'Store Ambience'],
  'Clothing & Retail': ['Fabric & Quality', 'Trendy Collection', 'Fitting & Sizes', 'Staff & Hospitality', 'Value for Money', 'Store Ambience'],
  'Apparel': ['Fabric & Quality', 'Trendy Collection', 'Fitting & Sizes', 'Staff & Hospitality', 'Value for Money', 'Store Ambience'],
  'Fashion': ['Fabric & Quality', 'Trendy Collection', 'Fitting & Sizes', 'Staff & Hospitality', 'Value for Money', 'Store Ambience']
};

export const UNIVERSAL_TAGS = ['Staff & Hospitality', 'Ambience', 'Wait Time', 'Cleanliness & Hygiene', 'Value for Money', 'Fast Service'];
