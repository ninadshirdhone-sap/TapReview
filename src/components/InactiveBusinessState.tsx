import React from 'react';
import { AlertCircle, Store, ArrowLeft } from 'lucide-react';
import { Business } from '../types';

interface InactiveBusinessStateProps {
  business: Business;
  onSelectActiveBusiness?: () => void;
  isAdmin?: boolean;
}

export const InactiveBusinessState: React.FC<InactiveBusinessStateProps> = ({
  business,
  onSelectActiveBusiness,
  isAdmin
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 mx-auto flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-slate-400" />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        <Store className="w-3.5 h-3.5" />
        <span>Standee Offline</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
        {business.name}
      </h2>

      {isAdmin ? (
        <>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            This QR / NFC standee is currently set to inactive in the database (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{business.businessId}</code>).
          </p>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 max-w-sm mx-auto text-left mb-6 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold text-amber-950">Store Owner Notice:</div>
            <p>
              To re-activate this standee, open your Google Sheets database (<span className="font-semibold text-amber-950">Businesses</span> tab) and change the <span className="font-mono">active</span> column to <code className="text-emerald-700 font-bold">TRUE</code>.
            </p>
          </div>

          {onSelectActiveBusiness && (
            <button
              type="button"
              onClick={onSelectActiveBusiness}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Switch to Active Business</span>
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">
          The direct feedback standee for this location is temporarily resting. Please feel free to speak directly with our team members during your visit.
        </p>
      )}
    </div>
  );
};
