import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { Business, ReviewPrompt, SheetsSyncStatus } from './types';
import { DEFAULT_BUSINESSES, DEFAULT_PROMPTS } from './data/defaultData';
import { 
  fetchBusinessById, 
  fetchAllBusinesses, 
  fetchReviewPrompts, 
  fetchSheetsStatus, 
  triggerManualSync,
  testCustomGoogleSheet 
} from './services/api';
import { TopNavigation } from './components/TopNavigation';
import { BusinessCardHeader } from './components/BusinessCardHeader';
import { SmartReviewSection } from './components/SmartReviewSection';
import { NormalReviewSection } from './components/NormalReviewSection';
import { SocialActionButtons } from './components/SocialActionButtons';
import { InactiveBusinessState } from './components/InactiveBusinessState';
import { StandeePreviewModal } from './components/StandeePreviewModal';
import { SheetsAdminModal } from './components/SheetsAdminModal';
import { Footer } from './components/Footer';

export default function App() {
  const [businesses, setBusinesses] = useState<Business[]>(DEFAULT_BUSINESSES);
  const [currentBusiness, setCurrentBusiness] = useState<Business>(DEFAULT_BUSINESSES[0]);
  const [prompts, setPrompts] = useState<ReviewPrompt[]>(DEFAULT_PROMPTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState<boolean>(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === 'true' || params.has('admin') || window.location.hash === '#admin';
  });
  const [sheetsStatus, setSheetsStatus] = useState<SheetsSyncStatus>({
    isLiveConnected: false,
    sheetId: null,
    method: 'sample_data',
    lastSyncedAt: new Date().toISOString(),
    businessCount: DEFAULT_BUSINESSES.length,
    promptsCount: DEFAULT_PROMPTS.length
  });
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Extract businessId from URL pathname (/b/:id, /:id) or query parameter (?b=, ?id=, ?businessId=)
  const getBusinessIdFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return 'spice-hub';
    
    // 1. Check query parameters: ?b=, ?id=, ?businessId=, ?business=
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('b') || params.get('id') || params.get('businessId') || params.get('business');
    if (queryId && queryId.trim()) {
      return queryId.trim();
    }

    // 2. Check path /b/:id
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'b') {
      return pathParts[1].trim();
    }

    // 3. Check direct path /:id (excluding root or api paths)
    if (pathParts.length === 1 && pathParts[0] !== 'api') {
      return pathParts[0].trim();
    }

    return 'spice-hub';
  }, []);

  // Sync browser tab title to current business for a bespoke customer experience
  useEffect(() => {
    if (currentBusiness?.name) {
      document.title = `${currentBusiness.name} | Review & Connect`;
    }
  }, [currentBusiness]);

  // Load business data and synchronize
  const loadData = useCallback(async (targetId?: string) => {
    setIsLoading(true);
    const bId = targetId || getBusinessIdFromUrl();

    try {
      // If sheet query param is in URL, test/sync it automatically
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlSheet = params.get('sheet') || params.get('sheetId');
        if (urlSheet) {
          await testCustomGoogleSheet(urlSheet);
        }
        const forceSync = params.get('sync') === 'true' || params.get('refresh') === 'true' || params.has('sync') || params.has('refresh');
        if (forceSync) {
          await triggerManualSync();
        }
      }

      // 1. Fetch all businesses for switcher
      const allB = await fetchAllBusinesses();
      setBusinesses(allB);

      // 2. Fetch specific business
      const { business } = await fetchBusinessById(bId);
      setCurrentBusiness(business);

      // 3. Fetch review prompts for this business's category
      const loadedPrompts = await fetchReviewPrompts(business.category);
      setPrompts(loadedPrompts);

      // 4. Fetch Google Sheets connection health
      const status = await fetchSheetsStatus();
      setSheetsStatus(status);
    } catch (err) {
      console.error('Error loading standee data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getBusinessIdFromUrl]);

  // Initial load on mount & popstate listener for back/forward navigation
  useEffect(() => {
    loadData();

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsAdmin(params.get('admin') === 'true' || params.has('admin') || window.location.hash === '#admin');
      loadData();
    };

    // Keyboard shortcut: Ctrl+Shift+S or Cmd+Shift+S to force sync
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleRefreshSync();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loadData]);

  // Toggle admin view
  const handleToggleAdmin = () => {
    setIsAdmin(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (next) {
          url.searchParams.set('admin', 'true');
        } else {
          url.searchParams.delete('admin');
        }
        window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
      }
      return next;
    });
  };

  // Handle switching business (admin only)
  const handleSelectBusiness = (b: Business) => {
    setCurrentBusiness(b);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('b', b.businessId);
      window.history.pushState(null, '', url.pathname + url.search);
    }
    fetchReviewPrompts(b.category).then(newPrompts => {
      setPrompts(newPrompts);
    });
  };

  // Trigger manual sync with Google Sheets
  const handleRefreshSync = async () => {
    setIsSyncing(true);
    try {
      const syncResult = await triggerManualSync();
      await loadData(currentBusiness.businessId);
      if (syncResult.success) {
        setSyncToast({
          message: `Synced with Google Sheets! (${syncResult.businessCount} businesses ready)`,
          type: 'success'
        });
      } else {
        setSyncToast({
          message: syncResult.error || 'Synced with sample database',
          type: 'error'
        });
      }
      setTimeout(() => setSyncToast(null), 3500);
    } catch (err: any) {
      setSyncToast({
        message: `Sync issue: ${err.message}`,
        type: 'error'
      });
      setTimeout(() => setSyncToast(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header / Navigation Bar */}
      <TopNavigation
        currentBusiness={currentBusiness}
        allBusinesses={businesses}
        onSelectBusiness={handleSelectBusiness}
        sheetsStatus={sheetsStatus}
        onOpenStandeeModal={() => setIsStandeeModalOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onRefreshSync={handleRefreshSync}
        isSyncing={isSyncing}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center animate-pulse">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl mx-auto mb-3" />
            <div className="h-5 bg-slate-200 rounded w-48 mx-auto mb-2" />
            <div className="h-3 bg-slate-100 rounded w-32 mx-auto" />
          </div>
        ) : !currentBusiness.active ? (
          // Inactive standee state
          <InactiveBusinessState
            business={currentBusiness}
            isAdmin={isAdmin}
            onSelectActiveBusiness={() => {
              const activeOne = businesses.find(b => b.active) || businesses[0];
              handleSelectBusiness(activeOne);
            }}
          />
        ) : (
          // Active standee experience
          <div>
            {/* Business Header Card */}
            <BusinessCardHeader 
              business={currentBusiness} 
              isAdmin={isAdmin}
            />

            {/* Review Flow: Smart Review (with tags & AI generator) vs Normal Google Review */}
            {currentBusiness.smartReview !== false ? (
              <SmartReviewSection
                business={currentBusiness}
                prompts={prompts}
              />
            ) : (
              <NormalReviewSection
                business={currentBusiness}
              />
            )}

            {/* Features 2 & 3: Instagram Follow & WhatsApp Offers */}
            <SocialActionButtons business={currentBusiness} />
          </div>
        )}

        {/* Quiet Footer */}
        <Footer
          currentBusiness={currentBusiness}
          isAdmin={isAdmin}
          onOpenStandee={() => setIsStandeeModalOpen(true)}
          onOpenSheets={() => setIsSheetsModalOpen(true)}
          onEnableAdmin={handleToggleAdmin}
        />
      </main>

      {/* Standee QR & NFC Generator Modal */}
      {isStandeeModalOpen && (
        <StandeePreviewModal
          business={currentBusiness}
          isOpen={isStandeeModalOpen}
          onClose={() => setIsStandeeModalOpen(false)}
        />
      )}

      {/* Google Sheets Admin & Setup Modal */}
      {isSheetsModalOpen && (
        <SheetsAdminModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          status={sheetsStatus}
          onRefresh={handleRefreshSync}
          isSyncing={isSyncing}
        />
      )}

      {/* Floating Sync Notification Toast */}
      {syncToast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md transition-all animate-bounce-once bg-slate-900/95 text-white border-slate-800 max-w-sm">
          {syncToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="leading-snug">{syncToast.message}</span>
        </div>
      )}
    </div>
  );
}
