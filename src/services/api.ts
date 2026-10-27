import { Business, ReviewPrompt, SheetsSyncStatus } from '../types';
import { DEFAULT_BUSINESSES, DEFAULT_PROMPTS } from '../data/defaultData';

export async function fetchBusinessById(businessId: string): Promise<{ business: Business; source: string }> {
  try {
    const res = await fetch(`/api/business/${encodeURIComponent(businessId)}`);
    if (!res.ok) {
      if (res.status === 404) {
        // Fallback to local default data if present
        const local = DEFAULT_BUSINESSES.find(b => b.businessId.toLowerCase() === businessId.toLowerCase());
        if (local) {
          return { business: local, source: 'fallback_sample' };
        }
        throw new Error(`Business "${businessId}" not found`);
      }
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`[API] Falling back to local data for ${businessId}:`, err.message);
    const local = DEFAULT_BUSINESSES.find(b => b.businessId.toLowerCase() === businessId.toLowerCase());
    if (local) {
      return { business: local, source: 'offline_fallback' };
    }
    // Default to the first sample business if completely unmatched
    return { business: DEFAULT_BUSINESSES[0], source: 'offline_fallback' };
  }
}

export async function fetchAllBusinesses(): Promise<Business[]> {
  try {
    const res = await fetch('/api/businesses');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.businesses || DEFAULT_BUSINESSES;
  } catch (err: any) {
    console.warn('[API] Failed to fetch businesses list, using default:', err.message);
    return DEFAULT_BUSINESSES;
  }
}

export async function fetchReviewPrompts(category?: string, rating?: number): Promise<ReviewPrompt[]> {
  try {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (rating !== undefined) params.set('rating', String(rating));

    const res = await fetch(`/api/prompts?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.prompts || DEFAULT_PROMPTS;
  } catch (err: any) {
    console.warn('[API] Failed to fetch prompts from server, using default:', err.message);
    let filtered = [...DEFAULT_PROMPTS];
    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase() || p.category.toLowerCase() === 'universal');
    }
    if (rating) {
      filtered = filtered.filter(p => p.rating === rating);
    }
    return filtered;
  }
}

export async function fetchSheetsStatus(): Promise<SheetsSyncStatus> {
  try {
    const res = await fetch('/api/sheets-status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isLiveConnected: false,
      sheetId: null,
      method: 'sample_data',
      lastSyncedAt: new Date().toISOString(),
      businessCount: DEFAULT_BUSINESSES.length,
      promptsCount: DEFAULT_PROMPTS.length,
      error: 'Running in offline mode with sample standee data'
    };
  }
}

export async function triggerManualSync(): Promise<{ success: boolean; error?: string; businessCount: number }> {
  try {
    const res = await fetch('/api/sync', { method: 'POST' });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message, businessCount: DEFAULT_BUSINESSES.length };
  }
}

export async function testCustomGoogleSheet(sheetId: string, apiKey?: string): Promise<{ success: boolean; error?: string; sampleBusinesses?: Business[] }> {
  try {
    const res = await fetch('/api/test-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetId, apiKey })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function disconnectGoogleSheet(): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/disconnect-sheet', { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
