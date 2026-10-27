import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode, 
  Wifi, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Business } from '../types';

interface StandeePreviewModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
}

export const StandeePreviewModal: React.FC<StandeePreviewModalProps> = ({
  business,
  isOpen,
  onClose
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Compute full standalone URL for this business
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smart-review.in';
  const standeeUrl = `${origin}/b/${business.businessId}`;

  // Generate QR code whenever business changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(standeeUrl, {
      width: 480,
      margin: 1.5,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [standeeUrl, isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(standeeUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Smart_Review_${business.businessId}_QR.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const accent = business.accentColor || '#1E293B';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-auto relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Standee QR & NFC Generator
              </h3>
              <p className="text-xs text-slate-500">
                Physical tent card preview & tag encoder
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acrylic / Wood Standee Card Visual Mockup */}
        <div 
          ref={printRef}
          className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 text-center relative overflow-hidden mb-5"
        >
          {/* Top Brand Stripe */}
          <div 
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: accent }}
          />

          {/* Standee Header */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart_Review.in Standee</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-0.5">
            {business.name}
          </h2>
          <p className="text-xs text-slate-300 mb-4 max-w-xs mx-auto">
            {business.tagline || 'Tap or scan to review us & claim secret offers'}
          </p>

          {/* QR Code Container */}
          <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg mx-auto mb-3">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt={`QR code for ${business.name}`} 
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain mx-auto"
              />
            ) : (
              <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {/* NFC Tap Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 bg-slate-800/80 rounded-xl py-2 px-3.5 max-w-xs mx-auto border border-slate-700">
            <Wifi className="w-4 h-4 text-emerald-400 rotate-90" />
            <span>NFC Tap Enabled · Hold phone close</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-around text-[11px] text-slate-400">
            <span>⭐ Smart Google Review</span>
            <span>📷 Instagram</span>
            <span>🎁 WhatsApp Offers</span>
          </div>
        </div>

        {/* Encoded Standee URL */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Encoded Standee Target URL (NFC & QR):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={standeeUrl}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono rounded-xl px-3 py-2 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadQr}
            className="flex-1 min-h-[42px] px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download QR PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="min-h-[42px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Standee</span>
          </button>

          <a
            href={standeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
            title="Open standee page in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
