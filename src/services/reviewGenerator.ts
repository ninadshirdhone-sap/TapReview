import { Business, ReviewPrompt } from '../types';

/**
 * Fast, seedable pseudo-random number generator (Mulberry32)
 * Ensures deterministic shuffling when needed and wide dispersion across seeds
 */
function mulberry32(seed: number): () => number {
  let s = Math.abs(seed) || 123456;
  return () => {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles an array with a PRNG generator
 */
function shuffleWithPrng<T>(array: T[], prng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Checks if a prompt category matches the business category or is universal
 */
/**
 * Checks if a prompt category matches the business category or is universal
 */
export function isCategoryMatch(promptCat: string, businessCat: string): boolean {
  if (!promptCat || !businessCat) return true;
  const p = promptCat.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const b = businessCat.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (p === b) return true;
  if (p === 'universal' || p === 'all' || p === 'general' || p === '') return true;

  // Domain aliases: Healthcare, Dental, Clinic
  const isHealth = (s: string) => s.includes('health') || s.includes('clinic') || s.includes('dental') || s.includes('doctor') || s.includes('medical');
  if (isHealth(p) && isHealth(b)) return true;

  // Domain aliases: Clothing & Fashion
  const isFashion = (s: string) => s.includes('cloth') || s.includes('apparel') || s.includes('fashion') || s.includes('wear') || s.includes('boutique');
  if (isFashion(p) && isFashion(b)) return true;

  // Domain aliases: Restaurant & Dining
  const isDining = (s: string) => s.includes('restaurant') || s.includes('food') || s.includes('dining') || s.includes('grill') || s.includes('bistro');
  if (isDining(p) && isDining(b)) return true;

  // Domain aliases: Cafe & Coffee
  if (p.includes('cafe') && b.includes('cafe')) return true;

  // Domain aliases: Salon & Spa
  const isBeauty = (s: string) => s.includes('salon') || s.includes('spa') || s.includes('parlour') || s.includes('beauty');
  if (isBeauty(p) && isBeauty(b)) return true;

  // Domain aliases: Gym & Fitness
  const isFitness = (s: string) => s.includes('gym') || s.includes('fitness') || s.includes('workout') || s.includes('crossfit');
  if (isFitness(p) && isFitness(b)) return true;

  // Retail
  if (p.includes('retail') && b.includes('retail')) return true;

  return false;
}

/**
 * Checks if a tag represents a star-only comment (overall review)
 */
export function isStarOnlyTag(tag?: string): boolean {
  if (!tag) return true;
  const t = tag.toLowerCase().trim();
  return (
    t === '' ||
    t === 'overall' ||
    t === 'general' ||
    t === 'stars' ||
    t === 'star' ||
    t === 'star only' ||
    t === 'stars only' ||
    t === 'all' ||
    t === 'none'
  );
}

/**
 * Checks if a prompt tag matches a selected tag
 */
export function isTagMatch(promptTag?: string, selectedTag?: string): boolean {
  if (!promptTag || !selectedTag) return false;
  const p = promptTag.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const s = selectedTag.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (p === s) return true;
  if (p.includes(s) || s.includes(p)) return true;

  // Fuzzy match domain keywords
  const keywords = [
    'fabric', 'cloth', 'fit', 'size', 'collection', 'trend', 'fashion',
    'food', 'drink', 'coffee', 'staff', 'service', 'hospitality',
    'ambience', 'vibe', 'clean', 'hygiene', 'price', 'value', 'equipment',
    'coach', 'gentle', 'care', 'explain', 'consult', 'wait', 'time', 'doctor', 'dentist'
  ];
  for (const kw of keywords) {
    if (p.includes(kw) && s.includes(kw)) return true;
  }

  return false;
}

/**
 * Intelligent review sentence assembler.
 * Generates fresh, natural human-sounding reviews every time without robotic repetition.
 */
export function generateReviewDraft(
  business: Business,
  rating: number,
  selectedTags: string[],
  allPrompts: ReviewPrompt[],
  variationSeed: number = Math.floor(Math.random() * 1000000)
): string {
  const prng = mulberry32(variationSeed + rating * 7919);
  const sentences: string[] = [];
  const usedSentences = new Set<string>();

  const addSentence = (text?: string) => {
    if (!text) return;
    const clean = text.trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    if (!usedSentences.has(lower)) {
      // Ensure ending punctuation
      const punctuated = /[.!?]$/.test(clean) ? clean : `${clean}.`;
      sentences.push(punctuated);
      usedSentences.add(lower);
    }
  };

  // 1. Filter active prompts matching this star rating and business category
  const activeRatingPrompts = (allPrompts || []).filter(
    p => p && p.active !== false && Number(p.rating) === rating && isCategoryMatch(p.category, business.category)
  );

  // 2. Separate into Star-Only comments vs Tag comments
  const starOnlyPrompts = activeRatingPrompts.filter(p => isStarOnlyTag(p.tag));
  const categoryStarPrompts = starOnlyPrompts.filter(p => p.category.toLowerCase().trim() === business.category.toLowerCase().trim());
  const universalStarPrompts = starOnlyPrompts.filter(p => p.category.toLowerCase().trim() !== business.category.toLowerCase().trim());

  // Shuffled pools
  const shuffledCatStars = shuffleWithPrng(categoryStarPrompts, prng);
  const shuffledUniStars = shuffleWithPrng(universalStarPrompts, prng);
  const starPool = [...shuffledCatStars, ...shuffledUniStars];

  // CASE 1: No tags selected (pure star-only review)
  if (!selectedTags || selectedTags.length === 0) {
    if (starPool.length > 0) {
      addSentence(starPool[0].sentenceTemplate);
      if (starPool.length > 1) {
        addSentence(starPool[1].sentenceTemplate);
      }
    } else {
      addSentence(getRandomOpener(rating, business.name, prng));
    }
  } 
  // CASE 2: Customer selected 1 or more highlight tags
  else {
    // A. Opening sentence
    if (starPool.length > 0) {
      addSentence(starPool[0].sentenceTemplate);
    } else {
      addSentence(getRandomOpener(rating, business.name, prng));
    }

    // B. Tag-specific sentences: for each selected tag, pick a matching sentence or rich varied phrasing
    selectedTags.forEach((tag, idx) => {
      const tagPrng = mulberry32(variationSeed + (idx + 1) * 31337 + rating * 101);
      
      // Find candidate prompts matching this tag and rating
      const tagCandidates = activeRatingPrompts.filter(p => !isStarOnlyTag(p.tag) && isTagMatch(p.tag, tag));
      
      // Prioritize business-specific category first, then universal
      const catSpecific = tagCandidates.filter(p => p.category.toLowerCase().trim() === business.category.toLowerCase().trim());
      const uniSpecific = tagCandidates.filter(p => p.category.toLowerCase().trim() !== business.category.toLowerCase().trim());

      const shuffledCatSpecific = shuffleWithPrng(catSpecific, tagPrng);
      const shuffledUniSpecific = shuffleWithPrng(uniSpecific, tagPrng);
      const candidatesPool = [...shuffledCatSpecific, ...shuffledUniSpecific];

      // Pick an unused matching sentence from the candidate pool if available
      const picked = candidatesPool.find(c => !usedSentences.has(c.sentenceTemplate.toLowerCase().trim()));
      if (picked) {
        addSentence(picked.sentenceTemplate);
      } else if (candidatesPool.length > 0) {
        addSentence(candidatesPool[0].sentenceTemplate);
      } else {
        // Natural human sentence variation (guarantees diverse grammar across multiple tags!)
        addSentence(getNaturalTagSentence(tag, rating, idx, tagPrng));
      }
    });
  }

  // 3. Add closing sentence based on rating sentiment
  const closer = getRandomCloser(rating, business.name, prng);
  if (closer) {
    addSentence(closer);
  }

  return sentences.join(' ');
}

function getRandomOpener(rating: number, businessName: string, prng: () => number): string {
  if (rating === 5) {
    const openers = [
      `Had a wonderful visit to ${businessName} today!`,
      `Had an exceptional experience at ${businessName}.`,
      `Visited ${businessName} and was thoroughly impressed from start to finish!`,
      `Such a pleasant experience visiting ${businessName}.`
    ];
    return openers[Math.floor(prng() * openers.length)];
  }
  if (rating === 4) {
    const openers = [
      `Had a very positive visit to ${businessName}.`,
      `Really good experience overall at ${businessName}.`,
      `Visited ${businessName} today; definitely a solid spot with great service.`
    ];
    return openers[Math.floor(prng() * openers.length)];
  }
  if (rating === 3) {
    return `Recently visited ${businessName}; sharing my honest feedback.`;
  }
  if (rating === 2) {
    return `Sharing my honest feedback following an underwhelming visit to ${businessName}.`;
  }
  return `Writing an honest review after an unfortunate and disappointing experience at ${businessName}.`;
}

/**
 * Generates natural, human-like sentences for any tag.
 * NEVER repeats template patterns like "The X was a standout highlight."
 */
function getNaturalTagSentence(tag: string, rating: number, tagIndex: number, prng: () => number): string {
  const t = tag.toLowerCase().trim();

  // ================= 4 & 5 STARS (POSITIVE EXPERIENCES) =================
  if (rating >= 4) {
    // 1. Healthcare / Dental: Gentle Care & Comfort
    if (t.includes('gentle') || t.includes('care') || t.includes('pain') || t.includes('comfort')) {
      const options = [
        'The doctor and staff were exceptionally gentle, making the entire procedure completely calm and comfortable.',
        'I really appreciated how gentle and reassuring the treatment was throughout my visit.',
        'Remarkably gentle touch and attentive care that put me completely at ease.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 2. Healthcare / Consultation: Clear Explanation & Diagnosis
    if (t.includes('explain') || t.includes('clear') || t.includes('diagnos') || t.includes('consult') || t.includes('guidance')) {
      const options = [
        'Appreciated the clear explanation and transparent consultation before starting anything.',
        'The doctor took time to explain every single step thoroughly and answered all questions patiently.',
        'Very clear, reassuring guidance with zero rush or confusing medical terms.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 3. Scheduling & Wait Time
    if (t.includes('wait') || t.includes('time') || t.includes('schedule') || t.includes('punctual')) {
      const options = [
        'Hardly any wait time at all—appointments run right on schedule.',
        'Very well organized with prompt service and zero unnecessary delays.',
        'I was seen right on time, which I truly appreciated.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 4. Staff & Hospitality
    if (t.includes('staff') || t.includes('service') || t.includes('hospitality') || t.includes('team') || t.includes('reception')) {
      const options = [
        'The team was warm, courteous, and attentive from start to finish.',
        'Staff members were welcoming, professional, and went out of their way to assist.',
        'Courteous and responsive hospitality throughout the entire visit.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 5. Cleanliness & Hygiene
    if (t.includes('clean') || t.includes('hygiene') || t.includes('spotless') || t.includes('sanit')) {
      const options = [
        'Noticeably spotless and well organized, with the highest hygiene standards.',
        'Impeccably clean facilities and sanitized equipment throughout.',
        'The space is thoroughly clean, tidy, and very well maintained.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 6. Ambience & Atmosphere
    if (t.includes('ambience') || t.includes('vibe') || t.includes('atmosphere') || t.includes('decor')) {
      const options = [
        'The ambience was soothing, tasteful, and very comfortable.',
        'Lovely setting with great lighting and a calm, welcoming aesthetic.',
        'A beautifully kept space that makes the entire experience relaxing.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 7. Clothing / Fabric / Material
    if (t.includes('fabric') || t.includes('cloth') || t.includes('material') || t.includes('quality')) {
      const options = [
        'The fabric quality and craftsmanship are genuinely premium and comfortable.',
        'Loved the high-grade materials, durable stitching, and luxurious feel.',
        'The texture and finish of the pieces reflect genuine attention to quality.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 8. Clothing / Collection & Trend
    if (t.includes('collection') || t.includes('trend') || t.includes('style') || t.includes('design')) {
      const options = [
        'The collection is fresh, modern, and curated with great aesthetic taste.',
        'A standout lineup with unique cuts and versatile pieces for every occasion.',
        'Impressed by the curated fashion styles and tasteful color palettes.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 9. Clothing / Fit & Sizing
    if (t.includes('fit') || t.includes('size')) {
      const options = [
        'The fitting and sizing options were spot-on and very flattering.',
        'Cuts drape effortlessly and offer great comfort without sacrificing style.',
        'True-to-size cuts that feel custom tailored.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 10. Food / Taste / Drinks
    if (t.includes('food') || t.includes('coffee') || t.includes('drinks') || t.includes('taste')) {
      const options = [
        'The flavors were fresh, vibrant, and prepared to absolute perfection.',
        'Delicious taste with authentic seasoning and top-tier presentation.',
        'Freshly made and rich in flavor—everything hit the right spot.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 11. Value for Money
    if (t.includes('value') || t.includes('price') || t.includes('worth')) {
      const options = [
        'Great value for the level of care and premium quality provided.',
        'Completely worth every penny considering the high standards and experience.',
        'Fair, transparent pricing for an exceptional standard of service.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 12. Equipment & Facilities
    if (t.includes('equipment') || t.includes('facility') || t.includes('gym')) {
      const options = [
        'Top-grade equipment and well-spaced, modern facilities.',
        'High-spec machines in pristine condition and ready to use.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // 13. Coaching / Training
    if (t.includes('coaching') || t.includes('trainer') || t.includes('instructor')) {
      const options = [
        'Trainers are knowledgeable, motivating, and highly professional.',
        'Expert guidance with personalized tips and great encouragement.'
      ];
      return options[Math.floor(prng() * options.length)];
    }

    // Dynamic, grammar-varied fallbacks for any custom tag (rotates by tagIndex so each sentence is structurally unique!)
    const customPatterns = [
      `I particularly appreciated the ${tag.toLowerCase()}, which made the entire experience so smooth.`,
      `Noticeable attention and care was given to the ${tag.toLowerCase()}.`,
      `The high standard of ${tag.toLowerCase()} definitely exceeded my expectations.`,
      `Everything regarding the ${tag.toLowerCase()} was handled with true professionalism.`,
      `Really impressed by how seamlessly the ${tag.toLowerCase()} was managed.`
    ];
    return customPatterns[tagIndex % customPatterns.length];
  } 
  
  // ================= 3 STARS (AVERAGE / MIXED) =================
  else if (rating === 3) {
    if (t.includes('wait') || t.includes('time')) {
      return 'The wait was slightly longer than anticipated, though staff remained polite.';
    }
    if (t.includes('explain') || t.includes('consult')) {
      return 'The consultation was decent, though a bit more detailed explanation would have helped.';
    }
    if (t.includes('service') || t.includes('staff')) {
      return 'Service was acceptable, though staff seemed somewhat rushed during peak hours.';
    }
    if (t.includes('fabric') || t.includes('cloth')) {
      return 'Fabric is fine for everyday use, though finishing could be refined.';
    }
    if (t.includes('food') || t.includes('taste')) {
      return 'The food was decent, but did not quite match initial expectations.';
    }
    const neutralPatterns = [
      `The ${tag.toLowerCase()} was reasonable, though there is certainly room for improvement.`,
      `Decent experience with the ${tag.toLowerCase()}, with a few minor tweaks needed.`,
      `The ${tag.toLowerCase()} met basic expectations, but did not particularly stand out.`
    ];
    return neutralPatterns[tagIndex % neutralPatterns.length];
  } 
  
  // ================= 1 & 2 STARS (CRITICAL FEEDBACK) =================
  else {
    if (t.includes('wait') || t.includes('time')) {
      return 'Experienced unreasonable delays with no proactive communication from the team.';
    }
    if (t.includes('care') || t.includes('gentle') || t.includes('treatment')) {
      return 'The treatment felt hurried and lacked the gentle, reassuring care one expects.';
    }
    if (t.includes('explain') || t.includes('consult')) {
      return 'Felt rushed through the consultation without sufficient clarity or answers to my questions.';
    }
    if (t.includes('service') || t.includes('staff')) {
      return 'Customer service was noticeably inattentive and dismissive of concerns.';
    }
    if (t.includes('clean') || t.includes('hygiene')) {
      return 'Cleanliness was concerning and requires immediate remediation by management.';
    }
    if (t.includes('fabric') || t.includes('quality')) {
      return 'Quality was disappointing and fell well short of what was promised.';
    }
    const criticalPatterns = [
      `The ${tag.toLowerCase()} was a notable source of disappointment during this visit.`,
      `Significant shortcomings were observed regarding the ${tag.toLowerCase()}.`,
      `Expected much better standards when it comes to the ${tag.toLowerCase()}.`
    ];
    return criticalPatterns[tagIndex % criticalPatterns.length];
  }
}

function getRandomCloser(rating: number, _businessName: string, prng: () => number): string {
  if (rating === 5) {
    const closers = [
      'Will definitely be coming back and recommending to friends and family!',
      'Kudos to the entire team for maintaining such high standards.',
      'A true gem—keep up the great work!',
      'Cannot wait to visit again soon.',
      'Easily one of my favorite places now.',
      '10/10 experience, definitely worth visiting.'
    ];
    return closers[Math.floor(prng() * closers.length)];
  }
  if (rating === 4) {
    const closers = [
      'Happy to recommend and looking forward to returning.',
      'Great job overall, keep it up!',
      'Worth checking out if you are in the area.',
      'Overall a solid experience and well worth a repeat visit.'
    ];
    return closers[Math.floor(prng() * closers.length)];
  }
  if (rating === 3) {
    const closers = [
      'Decent potential, hoping for a smoother experience next time.',
      'Fair visit, with a few noticeable tweaks needed.',
      'Hoping management takes this feedback to step up consistency.'
    ];
    return closers[Math.floor(prng() * closers.length)];
  }
  if (rating === 2) {
    const closers = [
      'Sharing constructive feedback so management can make necessary adjustments.',
      'Hopefully things improve, as the venue has good potential.',
      'Would appreciate seeing better consistency in the future.'
    ];
    return closers[Math.floor(prng() * closers.length)];
  }
  // 1 star
  const closers = [
    'Leaving this honest review in hopes that management reviews and addresses these serious lapses.',
    'Sharing this so other patrons and management are aware of these issues.',
    'Hopeful that genuine steps are taken to rectify these service flaws.'
  ];
  return closers[Math.floor(prng() * closers.length)];
}

