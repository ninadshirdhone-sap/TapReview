import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DEFAULT_BUSINESSES, DEFAULT_PROMPTS } from './src/data/defaultData';
import { Business, ReviewPrompt, SheetsSyncStatus } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Persistent local sheet configuration storage
const CONFIG_FILE = path.resolve(__dirname, 'sheet_config.json');

function loadSheetConfig(): { sheetId?: string; apiKey?: string } {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

function saveSheetConfig(config: { sheetId?: string; apiKey?: string }) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[Smart_Review] Could not persist sheet_config.json:', err.message);
  }
}

const initialSaved = loadSheetConfig();
let activeSheetId: string = initialSaved.sheetId || (process.env.GOOGLE_SHEET_ID ? process.env.GOOGLE_SHEET_ID.trim() : '');
let activeApiKey: string = initialSaved.apiKey || (process.env.GOOGLE_SHEETS_API_KEY ? process.env.GOOGLE_SHEETS_API_KEY.trim() : '');

// In-memory cache for Google Sheets data
let cachedBusinesses: Business[] = [...DEFAULT_BUSINESSES];
let cachedPrompts: ReviewPrompt[] = [...DEFAULT_PROMPTS];
let lastSyncedAt = new Date().toISOString();
let isUsingLiveSheet = false;
let currentSyncError: string | null = null;
let currentMethod: SheetsSyncStatus['method'] = 'sample_data';

/**
 * Helper to parse CSV text into array of object rows
 */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse header
  const headers = splitCsvRow(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvRow(lines[i]);
    if (values.length === 0) continue;
    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      const val = values[index] !== undefined ? values[index].trim().replace(/^["']|["']$/g, '') : '';
      rowObj[header] = val;
    });
    rows.push(rowObj);
  }

  return rows;
}

function splitCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Cleanly extracts a valid Google Sheet ID from any input:
 * - Direct ID: 1ghUovqB8NqnIKFqfwIruDS5InZN2cDEgteiypvHUWD0
 * - Text with backticks: "The Google Sheet ID for this spreadsheet is: `1ghUovqB8NqnIKFqfwIruDS5InZN2cDEgteiypvHUWD0`"
 * - Full Google Sheet URL: https://docs.google.com/spreadsheets/d/1ghUovqB8NqnIKFqfwIruDS5InZN2cDEgteiypvHUWD0/edit#gid=0
 * - Quoted strings: "1ghUovqB8NqnIKFqfwIruDS5InZN2cDEgteiypvHUWD0"
 */
function cleanSheetId(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed === 'your_google_sheet_id_here') return '';

  // 1. Backtick extraction
  const backtickMatch = trimmed.match(/`([a-zA-Z0-9-_]{20,})`/);
  if (backtickMatch) return backtickMatch[1];

  // 2. URL extraction
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{20,})/);
  if (urlMatch) return urlMatch[1];

  // 3. Substring 25+ chars standard ID
  const directMatch = trimmed.match(/([a-zA-Z0-9-_]{25,})/);
  if (directMatch) return directMatch[1];

  return trimmed.replace(/['"`\s]/g, '');
}

/**
 * Fetch rows from Google Sheets using either:
 * 1. Google Sheets API v4 (if GOOGLE_SHEETS_API_KEY provided)
 * 2. Public CSV endpoint (gviz/tq) if sheet is shared with link
 * Attempts multiple candidate tab names gracefully.
 */
async function fetchSheetTab(sheetId: string, candidateTabs: string[], apiKey?: string): Promise<Record<string, string>[]> {
  for (const tabName of candidateTabs) {
    // 1. If apiKey provided, attempt Google Sheets API v4
    if (apiKey) {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}?key=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as { values?: string[][] };
          if (data.values && data.values.length >= 2) {
            const headers = data.values[0].map(h => String(h || '').trim());
            const rows: Record<string, string>[] = [];
            for (let i = 1; i < data.values.length; i++) {
              const rowArr = data.values[i];
              const rowObj: Record<string, string> = {};
              headers.forEach((h, idx) => {
                rowObj[h] = rowArr[idx] !== undefined ? String(rowArr[idx]).trim() : '';
              });
              rows.push(rowObj);
            }
            if (rows.length > 0) return rows;
          }
        }
      } catch {
        // Continue to CSV fallback
      }
    }

    // 2. CSV endpoint fallback (works if shared with link)
    try {
      const timestamp = Date.now();
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&t=${timestamp}`;
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        // If Google redirected to HTML login page (e.g. 401/302), don't parse as CSV
        if (!contentType.includes('text/html')) {
          const csvText = await res.text();
          // Skip if Google responded with an error or invalid query payload
          if (
            csvText.startsWith('/*O_o*/') ||
            csvText.includes('google.visualization.Query.setResponse') ||
            csvText.includes('"status":"error"') ||
            csvText.includes('invalid_query')
          ) {
            continue;
          }
          const rows = parseCsv(csvText);
          if (rows.length > 0) return rows;
        }
      }
    } catch {
      // Continue next candidate tab
    }
  }

  return [];
}

/**
 * Synchronize from configured Google Sheet
 */
async function syncFromGoogleSheets(targetSheetId?: string, targetApiKey?: string): Promise<{ success: boolean; error?: string }> {
  const rawSheetId = targetSheetId || activeSheetId || process.env.GOOGLE_SHEET_ID;
  const sheetId = cleanSheetId(rawSheetId);
  const apiKey = (targetApiKey !== undefined ? targetApiKey : activeApiKey).trim().replace(/['"`]/g, '');

  if (!sheetId) {
    // No valid sheet ID configured, use sample data
    cachedBusinesses = [...DEFAULT_BUSINESSES];
    cachedPrompts = [...DEFAULT_PROMPTS];
    isUsingLiveSheet = false;
    currentMethod = 'sample_data';
    currentSyncError = null;
    lastSyncedAt = new Date().toISOString();
    return { success: true };
  }

  try {
    // Fetch Businesses tab (try variations including default Sheet1)
    const businessesRows = await fetchSheetTab(
      sheetId, 
      ['Businesses', 'Business', 'Sheet1', 'Sheet 1', 'All in one', 'AllInOne', 'Standees', 'Data', 'Main'], 
      apiKey || undefined
    );

    let parsedBusinesses: Business[] = [];
    if (businessesRows.length > 0) {
      parsedBusinesses = businessesRows.map(row => {
        // Advanced fuzzy key finder that normalizes spaces, punctuation, parentheses
        const getVal = (patterns: string[]) => {
          const keys = Object.keys(row);
          for (const pattern of patterns) {
            const cleanPattern = pattern.toLowerCase().replace(/[^a-z0-9]/g, '');
            const foundKey = keys.find(k => {
              const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return cleanKey === cleanPattern || cleanKey.includes(cleanPattern);
            });
            if (foundKey && row[foundKey] && row[foundKey].trim()) {
              return row[foundKey].trim();
            }
          }
          return '';
        };

        // 1. Business ID
        const rawId = getVal(['businessid', 'business id', 'id', 'slug']);
        
        // 2. Business Name
        const name = getVal(['businessname', 'business name', 'name', 'business']) || 'My Business';
        
        // 3. Business Type (restaurant, salon, gym, cafe, clinic, etc.)
        const rawType = getVal(['businesstype', 'business type', 'type', 'category', 'industry']) || 'General';
        let category = rawType;
        const lowerType = rawType.toLowerCase();
        if (lowerType.includes('restaurant') || lowerType.includes('dining') || lowerType.includes('food')) {
          category = 'Restaurant';
        } else if (lowerType.includes('salon') || lowerType.includes('spa') || lowerType.includes('beauty') || lowerType.includes('parlour')) {
          category = 'Salon & Spa';
        } else if (lowerType.includes('gym') || lowerType.includes('fitness') || lowerType.includes('workout') || lowerType.includes('crossfit')) {
          category = 'Fitness';
        } else if (lowerType.includes('cafe') || lowerType.includes('coffee') || lowerType.includes('bakery')) {
          category = 'Cafe';
        } else if (lowerType.includes('dental') || lowerType.includes('clinic') || lowerType.includes('hospital') || lowerType.includes('health') || lowerType.includes('doctor')) {
          category = 'Healthcare';
        } else if (lowerType.includes('retail') || lowerType.includes('store') || lowerType.includes('shop') || lowerType.includes('boutique')) {
          category = 'Retail';
        } else {
          category = rawType.charAt(0).toUpperCase() + rawType.slice(1);
        }

        // 4. Google Place ID / Google Review URL
        const rawPlace = getVal(['googleplaceidreview', 'googleplaceid', 'placeid', 'place id', 'googlereviewurl', 'reviewurl', 'google review', 'google']);
        let googleReviewUrl = '';
        if (rawPlace) {
          if (rawPlace.startsWith('http://') || rawPlace.startsWith('https://')) {
            googleReviewUrl = rawPlace;
          } else {
            // Raw Google Place ID -> convert automatically to write-review URL
            googleReviewUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(rawPlace)}`;
          }
        }

        // 5. Instagram URL
        const rawInsta = getVal(['instaurl', 'insta url', 'instagramurl', 'instagram url', 'instagram', 'insta', 'ig']);
        let instagramUrl = '';
        if (rawInsta) {
          if (rawInsta.startsWith('http://') || rawInsta.startsWith('https://')) {
            instagramUrl = rawInsta;
          } else {
            const handle = rawInsta.replace(/^@/, '');
            instagramUrl = `https://instagram.com/${handle}`;
          }
        }

        // 6. WhatsApp Channel / Offer URL
        const rawWhatsapp = getVal(['whatsappchanelurl', 'whatsappchannelurl', 'whatsappurl', 'whatsapp chanel url', 'whatsapp channel url', 'whatsapp', 'chanelurl', 'channelurl', 'wa']);
        let whatsappUrl = '';
        if (rawWhatsapp) {
          if (rawWhatsapp.startsWith('http://') || rawWhatsapp.startsWith('https://')) {
            whatsappUrl = rawWhatsapp;
          } else {
            const digits = rawWhatsapp.replace(/[^0-9]/g, '');
            if (digits.length >= 7) {
              whatsappUrl = `https://wa.me/${digits}`;
            }
          }
        }

        // 7. Active / Disactive status
        const rawStatus = getVal(['activedisactivestatus', 'active/disactivestatus', 'active status', 'status', 'active', 'state']);
        const lowerStatus = rawStatus.toLowerCase();
        let active = true;
        if (
          lowerStatus.includes('disactive') || 
          lowerStatus.includes('inactive') || 
          lowerStatus === 'false' || 
          lowerStatus === '0' || 
          lowerStatus === 'no' || 
          lowerStatus === 'off' || 
          lowerStatus === 'closed' ||
          lowerStatus === 'disabled'
        ) {
          active = false;
        }

        // 8. Smart Review status (yes -> smart review with generated comments, no -> normal google review)
        const rawSmart = getVal(['smartreview', 'smart review', 'smart_review', 'issmartreview', 'is smart review', 'smart reviews', 'smart', 'review type', 'reviewtype', 'review mode', 'reviewmode']);
        let smartReview = true;
        if (rawSmart) {
          const lowerSmart = rawSmart.toLowerCase().trim();
          if (
            lowerSmart === 'no' || 
            lowerSmart === 'false' || 
            lowerSmart === '0' || 
            lowerSmart === 'n' || 
            lowerSmart === 'off' || 
            lowerSmart === 'disabled' || 
            lowerSmart === 'normal' ||
            lowerSmart === 'standard' ||
            lowerSmart === 'direct'
          ) {
            smartReview = false;
          } else if (
            lowerSmart === 'yes' || 
            lowerSmart === 'true' || 
            lowerSmart === '1' || 
            lowerSmart === 'y' || 
            lowerSmart === 'on' || 
            lowerSmart === 'enabled' || 
            lowerSmart === 'smart'
          ) {
            smartReview = true;
          }
        }

        // Business ID fallback
        const businessId = rawId || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

        // Dynamic Accent Colors by category
        const defaultAccent = 
          category === 'Restaurant' ? '#E11D48' :
          category === 'Salon & Spa' ? '#9333EA' :
          category === 'Fitness' ? '#059669' :
          category === 'Cafe' ? '#B45309' :
          category === 'Healthcare' ? '#0284C7' :
          '#1E293B';

        return {
          businessId,
          name,
          category,
          tagline: getVal(['tagline', 'description', 'about']) || `Welcome to ${name}! Tap or scan to leave a review and unlock offers.`,
          googleReviewUrl,
          instagramUrl: instagramUrl || undefined,
          whatsappUrl: whatsappUrl || undefined,
          active,
          smartReview,
          address: getVal(['address', 'location', 'city']) || undefined,
          accentColor: getVal(['accentcolor', 'color']) || defaultAccent,
          ratingCount: Number(getVal(['ratingcount', 'reviews'])) || 150,
          averageRating: Number(getVal(['averagerating', 'rating'])) || 4.8,
          whatsappOfferTitle: getVal(['whatsappoffertitle', 'offertitle']) || `Join ${name} VIP Club`,
          whatsappOfferSubtitle: getVal(['whatsappoffersubtitle', 'offersubtitle']) || 'Get exclusive member offers, secret discounts & instant updates.'
        };
      }).filter(b => Boolean(b.businessId));
    }

    // Fetch Review Comments / Sentence Prompts
    // Supports either same spreadsheet or dedicated GOOGLE_REVIEWS_SHEET_ID
    const reviewsSheetId = cleanSheetId(process.env.GOOGLE_REVIEWS_SHEET_ID) || sheetId;
    const isSeparateReviewsSheet = Boolean(process.env.GOOGLE_REVIEWS_SHEET_ID && cleanSheetId(process.env.GOOGLE_REVIEWS_SHEET_ID) !== sheetId);

    const candidatePromptTabs = isSeparateReviewsSheet 
      ? ['Sheet1', 'Sheet 1', 'ReviewComments', 'Review Comments', 'review comments', 'reviewcomments', 'Review_Comments', 'ReviewSentences', 'Reviews', 'reviews', 'Comments', 'comments', 'Sentences', 'ReviewPrompts', 'Main']
      : ['ReviewComments', 'Review Comments', 'review comments', 'reviewcomments', 'Review_Comments', 'ReviewSentences', 'Review Sentences', 'Reviews', 'reviews', 'Comments', 'comments', 'Sentences', 'ReviewPrompts', 'Review Prompts', 'Prompts', 'Sheet1', 'Sheet 1', 'Sheet2'];

    const promptsRows = await fetchSheetTab(reviewsSheetId, candidatePromptTabs, apiKey || undefined);

    let parsedPrompts: ReviewPrompt[] = [];
    if (promptsRows.length > 0) {
      parsedPrompts = promptsRows.map((row, idx) => {
        const getVal = (patterns: string[]) => {
          const keys = Object.keys(row);
          for (const pattern of patterns) {
            const cleanPattern = pattern.toLowerCase().replace(/[^a-z0-9]/g, '');
            const foundKey = keys.find(k => {
              const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return cleanKey === cleanPattern || cleanKey.includes(cleanPattern);
            });
            if (foundKey && row[foundKey] && row[foundKey].trim()) {
              return row[foundKey].trim();
            }
          }
          return '';
        };

        // 1. Business Type (restaurant, salon, gym, cafe, clinic, universal, clothing, retail, etc.)
        const rawCat = getVal(['businesstype', 'business type', 'category', 'type', 'industry', 'business']) || 'Universal';
        let category = 'Universal';
        const lowerCat = rawCat.toLowerCase().trim();
        if (lowerCat.includes('restaurant') || lowerCat.includes('dining') || lowerCat.includes('food')) {
          category = 'Restaurant';
        } else if (lowerCat.includes('salon') || lowerCat.includes('spa') || lowerCat.includes('beauty')) {
          category = 'Salon & Spa';
        } else if (lowerCat.includes('gym') || lowerCat.includes('fitness') || lowerCat.includes('workout')) {
          category = 'Fitness';
        } else if (lowerCat.includes('cafe') || lowerCat.includes('coffee') || lowerCat.includes('bakery')) {
          category = 'Cafe';
        } else if (lowerCat.includes('dental') || lowerCat.includes('clinic') || lowerCat.includes('healthcare') || lowerCat.includes('doctor')) {
          category = 'Healthcare';
        } else if (lowerCat.includes('cloth') || lowerCat.includes('apparel') || lowerCat.includes('fashion') || lowerCat.includes('wear') || lowerCat.includes('boutique')) {
          category = 'Clothing';
        } else if (lowerCat.includes('retail') || lowerCat.includes('shop') || lowerCat.includes('store')) {
          category = 'Retail';
        } else if (lowerCat.includes('all') || lowerCat.includes('any') || lowerCat.includes('universal') || lowerCat.includes('general') || lowerCat === '') {
          category = 'Universal';
        } else {
          category = rawCat.trim().charAt(0).toUpperCase() + rawCat.trim().slice(1);
        }

        // 2. Star Rating (1 to 5)
        const rawRating = getVal(['starrating', 'star rating', 'rating', 'stars', 'star']);
        const rating = Number(rawRating.replace(/[^0-9]/g, '')) || 5;

        // 3. Tag / Highlight (Overall for stars only, or specific tag)
        const rawTag = getVal([
          'taghighlight', 'tag / highlight', 'tag/highlight', 'tag', 'tags', 'highlight', 'highlights', 'aspect', 'aspects', 'feature', 'features', 'topic'
        ]) || 'Overall';
        let tag = rawTag.trim();
        const lowerTag = tag.toLowerCase();
        if (!rawTag || lowerTag === 'overall' || lowerTag === 'general' || lowerTag.includes('star only') || lowerTag.includes('stars only') || lowerTag === 'none' || lowerTag === 'all' || lowerTag === 'star') {
          tag = 'Overall';
        }

        // 4. Comment / Sentence Template
        const sentenceTemplate = getVal([
          'commentsentencetemplate', 'comment / sentence template', 'comment/sentence template',
          'sentence template', 'sentencetemplate', 'review comment', 'review comments', 'comment', 'comments',
          'sentence', 'sentences', 'template', 'templates', 'review', 'reviews', 'text', 'message'
        ]) || '';

        // 5. Active
        const rawActive = getVal(['active', 'status', 'enabled', 'state']) || 'true';
        const active = !rawActive.toLowerCase().includes('disactive') && !rawActive.toLowerCase().includes('inactive') && rawActive.toLowerCase() !== 'false' && rawActive.toLowerCase() !== '0';

        return {
          id: `prompt-${idx + 1}-${category}-${rating}-${tag}`,
          category,
          rating,
          tag,
          sentenceTemplate,
          active
        };
      }).filter(p => Boolean(p.sentenceTemplate));
    }

    if (parsedPrompts.length > 0) {
      // Find categories in parsedPrompts from the sheet
      const sheetCategories = new Set(parsedPrompts.map(p => p.category.toLowerCase().trim()));
      // Preserve rich default prompts for categories not yet added to the sheet (e.g. Healthcare, Dental)
      const supplementalDefaults = DEFAULT_PROMPTS.filter(p => !sheetCategories.has(p.category.toLowerCase().trim()));
      cachedPrompts = [...parsedPrompts, ...supplementalDefaults];
    }
    if (parsedBusinesses.length > 0) {
      cachedBusinesses = parsedBusinesses;
    }

    if (parsedBusinesses.length > 0 || parsedPrompts.length > 0) {
      isUsingLiveSheet = true;
      activeSheetId = sheetId;
      if (apiKey) activeApiKey = apiKey;
      saveSheetConfig({ sheetId: activeSheetId, apiKey: activeApiKey });
      currentMethod = apiKey ? 'api_key' : 'public_csv';
      currentSyncError = null;
      lastSyncedAt = new Date().toISOString();
      return { success: true };
    } else {
      // Rows could not be parsed (e.g. sheet is private / access denied)
      isUsingLiveSheet = false;
      currentMethod = 'sample_data';
      currentSyncError = `Could not access spreadsheet (${sheetId}). Please make sure the sheet is shared as "Anyone with the link can view" with tabs "Businesses" and "ReviewComments". Using default sample businesses in the meantime.`;
      console.warn(`[Smart_Review] Notice: ${currentSyncError}`);
      lastSyncedAt = new Date().toISOString();
      return { success: false, error: currentSyncError };
    }
  } catch (err: any) {
    currentSyncError = `Google Sheet access issue: ${err.message || 'Unable to load rows'}. Using default sample businesses.`;
    console.warn(`[Smart_Review] Notice: ${currentSyncError}`);
    isUsingLiveSheet = false;
    currentMethod = 'sample_data';
    lastSyncedAt = new Date().toISOString();
    return { success: false, error: currentSyncError };
  }
}

// Initial sync attempt at boot
syncFromGoogleSheets().catch(err => {
  console.warn('[Smart_Review] Initial sync note:', err.message);
});

// ================= API ROUTES =================

let lastSyncTimestamp = 0;
async function refreshIfStale(force = false) {
  const now = Date.now();
  // Auto-refresh if forced, or older than 5 seconds when live sheet is connected (20s for fallback), or not yet connected
  const ttl = activeSheetId ? 5000 : 20000;
  if (force || now - lastSyncTimestamp > ttl || !isUsingLiveSheet) {
    lastSyncTimestamp = now;
    await syncFromGoogleSheets();
  }
}

/**
 * GET /api/business/:id
 * Fetches a single business by ID (auto-syncs from Google Sheets if forced or stale)
 */
app.get('/api/business/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const force = req.query.refresh === 'true' || req.query.sync === 'true';
  await refreshIfStale(force);

  let business = cachedBusinesses.find(b => b.businessId.toLowerCase() === id.toLowerCase());

  // If business still not found, try one forced direct re-sync in case it was just added in the sheet
  if (!business && activeSheetId) {
    await syncFromGoogleSheets();
    business = cachedBusinesses.find(b => b.businessId.toLowerCase() === id.toLowerCase());
  }

  if (!business) {
    res.status(404).json({
      error: 'Business not found',
      message: `No business exists with ID "${id}". Make sure it is added in the Google Sheet and that the sheet is shared as "Anyone with the link can view".`,
      availableIds: cachedBusinesses.map(b => b.businessId)
    });
    return;
  }

  res.json({
    business,
    source: isUsingLiveSheet ? 'google_sheets' : 'sample_data',
    lastSyncedAt
  });
});

/**
 * GET /api/businesses
 * List all businesses (with auto-refresh)
 */
app.get('/api/businesses', async (req: Request, res: Response) => {
  const force = req.query.refresh === 'true' || req.query.sync === 'true';
  await refreshIfStale(force);
  res.json({
    businesses: cachedBusinesses,
    total: cachedBusinesses.length,
    isUsingLiveSheet,
    lastSyncedAt,
    sheetId: activeSheetId || null
  });
});

/**
 * GET /api/prompts
 * Returns templates filtered by category and rating (with auto-refresh from Google Sheets)
 */
app.get('/api/prompts', async (req: Request, res: Response) => {
  const force = req.query.refresh === 'true' || req.query.sync === 'true';
  await refreshIfStale(force);

  const { category, rating } = req.query;
  let filtered = [...cachedPrompts];

  if (category && typeof category === 'string') {
    const targetCat = category.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const isHealth = (s: string) => s.includes('health') || s.includes('clinic') || s.includes('dental') || s.includes('doctor') || s.includes('medical');

    filtered = filtered.filter(p => {
      const pCat = (p.category || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (pCat === targetCat || pCat === 'universal' || pCat === 'all' || pCat === 'general' || pCat === '') {
        return true;
      }
      if ((targetCat.includes('cloth') || targetCat.includes('apparel') || targetCat.includes('fashion')) && (pCat.includes('cloth') || pCat.includes('apparel') || pCat.includes('fashion'))) {
        return true;
      }
      if (targetCat.includes('restaurant') && (pCat.includes('restaurant') || pCat.includes('food'))) {
        return true;
      }
      if (targetCat.includes('salon') && (pCat.includes('salon') || pCat.includes('spa'))) {
        return true;
      }
      if (targetCat.includes('gym') && (pCat.includes('gym') || pCat.includes('fitness'))) {
        return true;
      }
      if (targetCat.includes('cafe') && pCat.includes('cafe')) {
        return true;
      }
      if (isHealth(targetCat) && isHealth(pCat)) {
        return true;
      }
      return false;
    });

    // If zero prompts match the target category, fallback to matching items from DEFAULT_PROMPTS
    if (filtered.length === 0) {
      filtered = DEFAULT_PROMPTS.filter(p => {
        const pCat = (p.category || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (pCat === targetCat || pCat === 'universal' || pCat === 'all' || pCat === 'general') return true;
        if (isHealth(targetCat) && isHealth(pCat)) return true;
        return false;
      });
    }
  }

  if (rating) {
    const numRating = Number(rating);
    if (!isNaN(numRating)) {
      filtered = filtered.filter(p => p.rating === numRating);
    }
  }

  res.json({
    prompts: filtered,
    total: filtered.length,
    lastSyncedAt
  });
});

/**
 * GET /api/sheets-status
 * Health & connection status of Google Sheets integration
 */
app.get('/api/sheets-status', async (req: Request, res: Response) => {
  const force = req.query.refresh === 'true' || req.query.sync === 'true';
  await refreshIfStale(force);

  const status: SheetsSyncStatus = {
    isLiveConnected: isUsingLiveSheet,
    sheetId: activeSheetId || cleanSheetId(process.env.GOOGLE_SHEET_ID) || null,
    method: currentMethod,
    lastSyncedAt,
    businessCount: cachedBusinesses.length,
    promptsCount: cachedPrompts.length,
    error: currentSyncError
  };
  res.json(status);
});

/**
 * POST /api/sync
 * Manually trigger immediate re-sync from configured Google Sheets
 */
app.post('/api/sync', async (_req: Request, res: Response) => {
  const result = await syncFromGoogleSheets();
  res.json({
    ...result,
    isLiveConnected: isUsingLiveSheet,
    sheetId: activeSheetId || null,
    businessCount: cachedBusinesses.length,
    promptsCount: cachedPrompts.length,
    lastSyncedAt
  });
});

/**
 * POST /api/test-sheets
 * Test and permanently connect a public or API-keyed sheet ID
 */
app.post('/api/test-sheets', async (req: Request, res: Response) => {
  const { sheetId, apiKey } = req.body;
  if (!sheetId) {
    res.status(400).json({ error: 'sheetId is required' });
    return;
  }

  const cleanedId = cleanSheetId(sheetId);
  const result = await syncFromGoogleSheets(cleanedId, apiKey);
  res.json({
    ...result,
    isLiveConnected: isUsingLiveSheet,
    sheetId: activeSheetId,
    businessCount: cachedBusinesses.length,
    promptsCount: cachedPrompts.length,
    sampleBusinesses: cachedBusinesses.slice(0, 5),
    lastSyncedAt
  });
});

/**
 * POST /api/disconnect-sheet
 * Reset connection back to sample default database
 */
app.post('/api/disconnect-sheet', (_req: Request, res: Response) => {
  activeSheetId = '';
  activeApiKey = '';
  saveSheetConfig({});
  cachedBusinesses = [...DEFAULT_BUSINESSES];
  cachedPrompts = [...DEFAULT_PROMPTS];
  isUsingLiveSheet = false;
  currentMethod = 'sample_data';
  currentSyncError = null;
  lastSyncedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Disconnected from Google Sheet. Using sample database.',
    businessCount: cachedBusinesses.length,
    promptsCount: cachedPrompts.length
  });
});

// Vite Middleware integration for development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Smart_Review.in server running on http://0.0.0.0:${PORT}`);
  });
}

// In standard Node/container environments, start the listener. In Vercel serverless, Vercel invokes the exported app.
if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}

export default app;
export { app };

