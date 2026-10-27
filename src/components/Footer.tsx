import React from 'react';
import { QrCode, Database, Settings } from 'lucide-react';
import { Business } from '../types';

interface FooterProps {
  currentBusiness: Business;
  onOpenStandee: () => void;
  onOpenSheets: () => void;
  isAdmin: boolean;
  onEnableAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentBusiness,
  onOpenStandee,
  onOpenSheets,
  isAdmin,
  onEnableAdmin
}) => {
  if (!isAdmin) {
    return (
      <footer className="mt-8 pt-6 pb-12 border-t border-slate-200/80 text-center text-xs text-slate-500">
        <div className="max-w-md mx-auto px-4 space-y-2">
          <p className="text-slate-700 font-semibold text-xs">
            Thank you for visiting {currentBusiness.name}!
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            Your reviews and direct feedback help us maintain high standards and improve our service.
          </p>
          <div className="pt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <span>Powered by Smart Review</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={onEnableAdmin}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1"
              title="Merchant and store owner settings"
            >
              <Settings className="w-2.5 h-2.5" />
              <span>Merchant Admin</span>
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-8 pt-6 pb-12 border-t border-amber-200 bg-amber-50/50 rounded-2xl text-center text-xs text-slate-500 p-4">
      <div className="max-w-md mx-auto px-4 space-y-3">
        {/* Admin Navigation Links */}
        <div className="flex items-center justify-center gap-3 font-semibold text-xs">
          <button
            onClick={onOpenStandee}
            className="flex items-center gap-1.5 text-slate-800 hover:text-black transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-700" />
            <span>Generate Standee QR</span>
          </button>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <button
            onClick={onOpenSheets}
            className="flex items-center gap-1.5 text-slate-800 hover:text-black transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-slate-700" />
            <span>Google Sheets Setup</span>
          </button>
        </div>

        {/* Admin Metadata */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <span>Smart_Review.in</span>
          <span aria-hidden="true">·</span>
          <span>Admin Portal</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono font-medium">Active ID: {currentBusiness.businessId}</span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
          Admin tools are active. To share the direct customer link, use <code className="bg-amber-150 px-1 py-0.5 rounded font-mono text-slate-800">?b={currentBusiness.businessId}</code> without admin parameters.
        </p>
      </div>
    </footer>
  );
};

