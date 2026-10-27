import React from 'react';
import { QrCode, Database, RefreshCw, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Business, SheetsSyncStatus } from '../types';

interface TopNavigationProps {
  currentBusiness: Business;
  allBusinesses: Business[];
  onSelectBusiness: (business: Business) => void;
  sheetsStatus: SheetsSyncStatus;
  onOpenStandeeModal: () => void;
  onOpenSheetsModal: () => void;
  onRefreshSync: () => void;
  isSyncing: boolean;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentBusiness,
  allBusinesses,
  onSelectBusiness,
  sheetsStatus,
  onOpenStandeeModal,
  onOpenSheetsModal,
  onRefreshSync,
  isSyncing,
  isAdmin,
  onToggleAdmin
}) => {
  // CUSTOMER VIEW: Clean, distraction-free branding strictly for that particular business
  if (!isAdmin) {
    return (
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Business Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
              style={{ backgroundColor: currentBusiness.accentColor || '#1E293B' }}
            >
              {currentBusiness.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-slate-900 tracking-tight leading-none truncate">
                {currentBusiness.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                Official Feedback & Review
              </span>
            </div>
          </div>

          {/* Verified Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-[11px] font-semibold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Standee</span>
          </div>
        </div>
      </header>
    );
  }

  // ADMIN VIEW: Shown only when ?admin=true or merchant admin is toggled
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
      {/* Admin Mode Ribbon */}
      <div className="bg-amber-500 text-slate-950 text-[11px] font-bold px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ADMINISTRATOR MODE · Controls & Standee Generator</span>
        </div>
        <button
          onClick={onToggleAdmin}
          className="text-slate-900 hover:text-black underline underline-offset-2 text-[10px] uppercase font-extrabold cursor-pointer"
        >
          Exit Admin View
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
            SR
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-900 tracking-tight leading-none">
              Smart_Review<span className="text-amber-600">.in</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">QR & NFC Standee</span>
          </div>
        </div>

        {/* Business Selector (Admin only) */}
        <div className="relative shrink-0 max-w-[170px] sm:max-w-[210px]">
          <div className="relative flex items-center">
            <select
              aria-label="Select business standee"
              value={currentBusiness.businessId}
              onChange={(e) => {
                const b = allBusinesses.find(item => item.businessId === e.target.value);
                if (b) onSelectBusiness(b);
              }}
              className="appearance-none w-full bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-xs font-semibold rounded-lg pl-2.5 pr-7 py-1.5 transition-colors cursor-pointer truncate border border-slate-300 focus:border-slate-500 focus:outline-none"
            >
              {allBusinesses.map((b) => (
                <option key={b.businessId} value={b.businessId}>
                  {b.name} {!b.active ? '(Inactive)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Standee QR Preview Modal Trigger */}
          <button
            onClick={onOpenStandeeModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            title="Preview physical QR & NFC Standee Card"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-800" />
            <span className="hidden sm:inline">Standee Preview</span>
          </button>

          {/* Google Sheets Status & Setup Trigger */}
          <button
            onClick={onOpenSheetsModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
              sheetsStatus.isLiveConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Google Sheets Database Settings & Setup"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {sheetsStatus.isLiveConnected ? 'Live Sheets' : 'Sample DB'}
            </span>
          </button>

          {/* Quick Sync Button */}
          <button
            onClick={onRefreshSync}
            disabled={isSyncing}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh database from Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

