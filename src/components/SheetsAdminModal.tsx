import React, { useState } from 'react';
import { 
  X, 
  Database, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  Terminal,
  Copy,
  Check,
  KeyRound
} from 'lucide-react';
import { SheetsSyncStatus } from '../types';
import { DEFAULT_BUSINESSES, DEFAULT_PROMPTS } from '../data/defaultData';
import { testCustomGoogleSheet, disconnectGoogleSheet } from '../services/api';

interface SheetsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SheetsSyncStatus;
  onRefresh: () => void;
  isSyncing: boolean;
}

export const SheetsAdminModal: React.FC<SheetsAdminModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
  isSyncing
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'instructions' | 'test'>('status');
  const [testSheetId, setTestSheetId] = useState<string>('');
  const [testApiKey, setTestApiKey] = useState<string>('');
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [copiedEnv, setCopiedEnv] = useState<boolean>(false);
  const [copiedHeaders, setCopiedHeaders] = useState<boolean>(false);
  const [copiedReviewHeaders, setCopiedReviewHeaders] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate All-In-One Single Tab CSV Template
  const downloadAllInOneCsv = () => {
    const headers = [
      'Business ID',
      'Business name',
      'Business Type (restaurant, salon, gym)',
      'google place ID(review)',
      'Insta URL',
      'Whatsapp chanel Url',
      'active/disactive status',
      'smart review'
    ];

    const sampleRows = [
      ['spice-hub', 'Spice Hub Fine Dining', 'restaurant', 'ChIJrTLr-GyuEmsRBfy61i59si0', 'https://instagram.com/spicehub_dining', 'https://chat.whatsapp.com/sampleSpiceHubOffers', 'active', 'yes'],
      ['glow-salon', 'Glow Studio & Luxury Spa', 'salon', 'ChIJo7g38Vp_EmsR_dE3zC6kG1g', 'https://instagram.com/glowstudio_luxury', 'https://chat.whatsapp.com/sampleGlowVIPPerks', 'active', 'yes'],
      ['urban-fit', 'Urban Fit Performance Gym', 'gym', 'ChIJB9g38Vp_EmsR_dE3zC6kG1e', 'https://instagram.com/urbanfit_india', 'https://chat.whatsapp.com/sampleUrbanFitCommunity', 'active', 'yes'],
      ['cafe-roma', 'Café Roma & Artisanal Roastery', 'cafe', 'ChIJN1t_tDeuEmsRUsoyG83frY4', 'https://instagram.com/caferoma_specialty', 'https://chat.whatsapp.com/sampleCafeRomaVIPClub', 'active', 'yes'],
      ['apex-dental', 'Apex Smile Dental Clinic', 'clinic', 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA', 'https://instagram.com/apex_dental', 'https://wa.me/919876543210', 'active', 'yes'],
      ['heritage-crafts', 'Heritage Living Boutique', 'retail', 'ChIJv98f-GyuEmsRBfy61i59si1', 'https://instagram.com/heritageliving_in', '', 'active', 'no']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'All_In_One_Smart_Review_Template.csv';
    link.click();
  };

  const copyAllInOneHeaders = () => {
    const text = 'Business ID\tBusiness name\tBusiness Type (restaurant, salon, gym)\tgoogle place ID(review)\tInsta URL\tWhatsapp chanel Url\tactive/disactive status\tsmart review';
    navigator.clipboard.writeText(text);
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2000);
  };

  // Generate Review Comments & Sentences CSV Template
  const downloadReviewCommentsCsv = () => {
    const headers = ['Business Type', 'Star Rating', 'Tag / Highlight', 'Comment / Sentence Template', 'Active'];
    const sampleRows = [
      ['Universal', '5', 'Overall', 'Had an absolutely outstanding experience here today!', 'TRUE'],
      ['Universal', '5', 'Overall', 'Truly a 5-star establishment that exceeds expectations every single time.', 'TRUE'],
      ['Universal', '5', 'Overall', 'Hands down one of the finest spots in town. Cannot recommend enough!', 'TRUE'],
      ['Universal', '5', 'Overall', 'From the warm welcome to the farewell, everything was flawless.', 'TRUE'],
      ['restaurant', '5', 'Overall', 'Easily one of the best dining experiences I have had in a long time!', 'TRUE'],
      ['restaurant', '5', 'Food Quality', 'The dishes were bursting with authentic flavors, top-tier ingredients, and impeccable presentation.', 'TRUE'],
      ['restaurant', '5', 'Food Quality', 'Every course was prepared to absolute perfection and served piping hot.', 'TRUE'],
      ['restaurant', '5', 'Portions', 'Portion sizes were generous and every dish was seasoned just right.', 'TRUE'],
      ['restaurant', '5', 'Hospitality', 'The servers were attentive, courteous, and made wonderful recommendations.', 'TRUE'],
      ['restaurant', '5', 'Ambience', 'The ambience was cozy and sophisticated, perfect for a relaxed dinner.', 'TRUE'],
      ['salon', '5', 'Overall', 'Left feeling pampered, refreshed, and looking my absolute best!', 'TRUE'],
      ['salon', '5', 'Styling & Care', 'The stylist understood exactly what I wanted and executed the look with precision.', 'TRUE'],
      ['salon', '5', 'Relaxation & Spa', 'An incredibly relaxing session with premium products and skilled hands.', 'TRUE'],
      ['gym', '5', 'Overall', 'High energy, motivating community, and top-tier training environment!', 'TRUE'],
      ['gym', '5', 'Equipment', 'State-of-the-art, well-maintained equipment with plenty of space to train.', 'TRUE'],
      ['gym', '5', 'Coaching', 'The trainers are knowledgeable, motivating, and keep the energy electric.', 'TRUE'],
      ['cafe', '5', 'Coffee & Drinks', 'The coffee is brewed to perfection—smooth, aromatic, and rich in flavor.', 'TRUE'],
      ['Universal', '4', 'Overall', 'Overall a very pleasant experience and well worth a repeat visit.', 'TRUE'],
      ['Universal', '4', 'Overall', 'Really good service and atmosphere. Just minor tweaks needed for a perfect 5.', 'TRUE'],
      ['restaurant', '4', 'Food Quality', 'Food was delicious and tasty, with just one dish being slightly on the milder side.', 'TRUE'],
      ['Universal', '3', 'Overall', 'A decent experience overall, but there is noticeable room for improvement.', 'TRUE'],
      ['restaurant', '3', 'Food Quality', 'The food was average—flavors were okay but did not quite match the hype.', 'TRUE'],
      ['Universal', '3', 'Wait Time', 'Wait times were longer than expected both for seating and order delivery.', 'TRUE'],
      ['Universal', '2', 'Overall', 'Unfortunately, our experience today fell well short of expectations.', 'TRUE'],
      ['restaurant', '2', 'Food Quality', 'The food was served lukewarm and lacked flavor or fresh ingredients.', 'TRUE'],
      ['Universal', '1', 'Overall', 'A very frustrating experience from start to finish. We expected much better standards.', 'TRUE'],
      ['Universal', '1', 'Hospitality', 'Staff was dismissive and unresponsive when we politely pointed out the issues.', 'TRUE']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Review_Comments_SmartReview.csv';
    link.click();
  };

  const copyReviewCommentsHeaders = () => {
    const text = 'Business Type\tStar Rating\tTag / Highlight\tComment / Sentence Template\tActive';
    navigator.clipboard.writeText(text);
    setCopiedReviewHeaders(true);
    setTimeout(() => setCopiedReviewHeaders(false), 2000);
  };

  // Generate downloadable CSV for Businesses
  const downloadBusinessesCsv = () => {
    const headers = ['businessId', 'name', 'category', 'googleReviewUrl', 'instagramUrl', 'whatsappUrl', 'active', 'tagline', 'address', 'accentColor', 'ratingCount', 'averageRating'];
    const rows = DEFAULT_BUSINESSES.map(b => [
      `"${b.businessId}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      `"${b.googleReviewUrl || ''}"`,
      `"${b.instagramUrl || ''}"`,
      `"${b.whatsappUrl || ''}"`,
      `"${b.active ? 'TRUE' : 'FALSE'}"`,
      `"${(b.tagline || '').replace(/"/g, '""')}"`,
      `"${b.address || ''}"`,
      `"${b.accentColor || ''}"`,
      b.ratingCount || 100,
      b.averageRating || 4.8
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Businesses_Tab_SmartReview.csv';
    link.click();
  };

  // Generate downloadable CSV for ReviewPrompts
  const downloadPromptsCsv = () => {
    downloadReviewCommentsCsv();
  };

  const handleTestSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSheetId.trim()) return;

    setTestLoading(true);
    setTestResult(null);

    const res = await testCustomGoogleSheet(testSheetId.trim(), testApiKey.trim() || undefined);
    setTestLoading(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: `Connected successfully! Loaded ${res.sampleBusinesses?.length || 0} businesses from your Google Sheet.`
      });
      onRefresh();
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Failed to connect. Ensure your sheet is shared as "Anyone with the link can view".'
      });
    }
  };

  const handleDisconnect = async () => {
    setTestLoading(true);
    await disconnectGoogleSheet();
    setTestLoading(false);
    setTestResult({
      success: true,
      message: 'Disconnected from Google Sheet. Using sample database.'
    });
    setTestSheetId('');
    onRefresh();
  };

  const copyEnvSample = () => {
    const text = `GOOGLE_SHEET_ID="your_google_sheet_id_here"\nGOOGLE_SHEETS_API_KEY=""\nAPP_URL="https://your-domain.vercel.app"`;
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-auto relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Google Sheets Database Hub
              </h3>
              <p className="text-xs text-slate-500">
                Live sync, schema specification & deployment guide
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl my-4 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'status' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Status
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'schema' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sheets Schema
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'test' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Connect Sheet
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'instructions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vercel Setup
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-xs text-slate-700">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border ${
                status.isLiveConnected 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {status.isLiveConnected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Connected to Live Google Sheet</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Using Built-In Sample Database</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={onRefresh}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white/80 hover:bg-white rounded-lg border border-slate-200 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                </div>

                <p className="text-xs leading-relaxed opacity-90 mb-3">
                  {status.isLiveConnected
                    ? 'Server is pulling business profiles and review templates directly from your Google Sheets tabs in real-time.'
                    : 'Currently demonstrating with pre-seeded sample data (Café Roma, Glow Salon, Spice Hub, Apex Dental). You can connect your Google Sheet in the "Connect Sheet" tab.'}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/50">
                    <div className="text-[10px] text-slate-500 font-sans uppercase">Businesses</div>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{status.businessCount}</div>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/50">
                    <div className="text-[10px] text-slate-500 font-sans uppercase">Sentence Prompts</div>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{status.promptsCount}</div>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/50 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-500 font-sans uppercase">Method</div>
                    <div className="text-xs font-bold text-slate-900 truncate">{status.method}</div>
                  </div>
                </div>
              </div>

              {/* Sample Quick Action */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">Download Sample Google Sheet Templates</h4>
                <p className="text-xs text-slate-600 mb-3">
                  Import these ready-made CSV files directly into a new Google Spreadsheet to bootstrap your own database in 10 seconds.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={downloadAllInOneCsv}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-sm text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Businesses Sheet (.csv)</span>
                  </button>
                  <button
                    onClick={downloadReviewCommentsCsv}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-sm text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Review Comments Sheet (.csv)</span>
                  </button>
                  <button
                    onClick={copyAllInOneHeaders}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-semibold border border-slate-200 transition-colors cursor-pointer text-xs"
                  >
                    {copiedHeaders ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedHeaders ? 'Headers Copied!' : 'Copy Business Headers'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              {/* PRIMARY: All-in-One Single Sheet */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Recommended · 1 Single Tab Only
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>All-In-One Google Sheet Layout</span>
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyAllInOneHeaders}
                      className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {copiedHeaders ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHeaders ? 'Copied' : 'Copy Headers'}</span>
                    </button>
                    <button
                      onClick={downloadAllInOneCsv}
                      className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  You only need <strong>one single tab</strong> in your Google Sheet (e.g. <code>Sheet1</code> or <code>Businesses</code>) with these exact 7 columns:
                </p>

                <div className="overflow-x-auto text-[11px] bg-white rounded-xl border border-emerald-100 p-2 mb-3">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500 font-mono">
                        <th className="py-1 pr-3">#</th>
                        <th className="py-1 pr-3">Column Name in Sheet</th>
                        <th className="py-1 pr-3">Example Values</th>
                        <th className="py-1">Features & Behavior</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      <tr>
                        <td className="py-1.5 font-mono text-slate-400">1</td>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Business ID</td>
                        <td className="py-1.5 font-mono text-slate-600"><code>spice-hub</code>, <code>glow-salon</code></td>
                        <td className="py-1.5">Standee URL slug (encoded in QR/NFC: <code>/b/spice-hub</code>)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-400">2</td>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Business name</td>
                        <td className="py-1.5 text-slate-800">Spice Hub Fine Dining</td>
                        <td className="py-1.5">Main display title on standee</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-400">3</td>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Business Type (restaurant, salon, gym)</td>
                        <td className="py-1.5 text-slate-800 font-medium"><code>restaurant</code>, <code>salon</code>, <code>gym</code>, <code>cafe</code>, <code>clinic</code></td>
                        <td className="py-1.5">Auto-loads category-specific review highlights and sentence templates</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-400">4</td>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">google place ID(review)</td>
                        <td className="py-1.5 font-mono text-slate-600"><code>ChIJrTLr-GyuEmsRBfy61i59si0</code> or full URL</td>
                        <td className="py-1.5">Auto-converted to direct Google write review URL!</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-400">5</td>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Insta URL</td>
                        <td className="py-1.5 font-mono text-slate-600"><code>https://instagram.com/spicehub</code> or <code>@spicehub</code></td>
                        <td className="py-1.5">Instagram Follow button (hidden if empty)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-400">6</td>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Whatsapp chanel Url</td>
                        <td className="py-1.5 font-mono text-slate-600"><code>https://chat.whatsapp.com/...</code> or phone number</td>
                        <td className="py-1.5">WhatsApp Offers button (hidden if empty)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-400">7</td>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">active/disactive status</td>
                        <td className="py-1.5 font-mono text-slate-600 font-semibold"><code>active</code> or <code>disactive</code></td>
                        <td className="py-1.5">If disactive/inactive, standee shows polite offline notice</td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="py-1.5 font-mono text-amber-700 font-bold">8</td>
                        <td className="py-1.5 font-mono text-amber-950 font-bold">smart review</td>
                        <td className="py-1.5 font-mono text-amber-900 font-semibold"><code>yes</code> or <code>no</code></td>
                        <td className="py-1.5 text-amber-950">
                          <strong>yes</strong>: shows Smart Review (generates review comments & tags).<br />
                          <strong>no</strong>: shows normal direct Google Review interface!
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-emerald-900 bg-emerald-100/70 p-2.5 rounded-lg flex items-center justify-between">
                  <span>💡 <strong>Tip:</strong> Sentence review templates for Restaurant, Salon, Gym, Cafe, and Healthcare are built-in automatically. No second tab required!</span>
                </div>
              </div>

              {/* Sheet 2: Review Comments & Sentences */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                      Sheet 2 · Review Comments & Sentences
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      <span>Review Sentences Database (for Random Generation)</span>
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyReviewCommentsHeaders}
                      className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {copiedReviewHeaders ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedReviewHeaders ? 'Copied' : 'Copy Headers'}</span>
                    </button>
                    <button
                      onClick={downloadReviewCommentsCsv}
                      className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Comments CSV</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Store comments categorized by <strong>Business Type</strong>, <strong>Star Rating</strong>, and <strong>Tag / Highlight</strong>. The app randomly selects and combines them into unique, non-repeating reviews every single time!
                </p>

                <div className="overflow-x-auto text-[11px] bg-white rounded-xl border border-blue-100 p-2 mb-3">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500 font-mono">
                        <th className="py-1 pr-3">Column Name</th>
                        <th className="py-1 pr-3">Example Values</th>
                        <th className="py-1">How Generator Uses It</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      <tr>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Business Type</td>
                        <td className="py-1.5 font-mono text-slate-600"><code>restaurant</code>, <code>salon</code>, <code>gym</code>, <code>Universal</code></td>
                        <td className="py-1.5">Matched with the Business Type from your Businesses sheet. Use <code>Universal</code> for comments that apply to all businesses.</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Star Rating</td>
                        <td className="py-1.5 font-mono text-slate-600"><code>5</code>, <code>4</code>, <code>3</code>, <code>2</code>, <code>1</code></td>
                        <td className="py-1.5">Rating chosen by customer. Supports rave reviews for 5★ and constructive feedback for 1-2★.</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Tag / Highlight</td>
                        <td className="py-1.5 font-mono text-slate-600"><code>Overall</code>, <code>Food Quality</code>, <code>Staff</code>, <code>Ambience</code></td>
                        <td className="py-1.5">
                          <strong>Overall</strong> (or blank) = comments only for stars.<br />
                          <strong>Specific Tag</strong> = used when customer selects that highlight tag.
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Comment / Sentence Template</td>
                        <td className="py-1.5 text-slate-800">"The dishes were bursting with authentic flavors and top-tier presentation."</td>
                        <td className="py-1.5">The natural sentence randomly picked and assembled into the customer's draft.</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 font-mono text-slate-900 font-bold">Active</td>
                        <td className="py-1.5 font-mono text-slate-600 font-semibold"><code>TRUE</code></td>
                        <td className="py-1.5">Set to <code>TRUE</code> to enable, <code>FALSE</code> to disable.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-blue-900 bg-blue-100/70 p-2.5 rounded-lg">
                  🎲 <strong>Randomization:</strong> Add 3 to 10 sentence variations per tag or star rating. Every time a customer taps a star, tag, or clicks <em>"Shuffle / New Review"</em>, the website generates a completely different, fresh review draft!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              {/* Currently Connected Sheet Banner */}
              {status.isLiveConnected && status.sheetId ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Live Google Sheet Connected</span>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      disabled={testLoading}
                      className="text-[11px] text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      Disconnect Sheet
                    </button>
                  </div>
                  <div className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-100 mb-2 truncate">
                    Sheet ID: <strong className="text-emerald-950">{status.sheetId}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${status.sheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2"
                    >
                      <span>Open Sheet in Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-slate-500 text-[11px]">
                      Last synced: {new Date(status.lastSyncedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Connect / Change Sheet Form */}
              <form onSubmit={handleTestSheet} className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    {status.isLiveConnected ? 'Change Connected Google Sheet' : 'Connect Your Google Sheet'}
                  </h4>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    Paste your <strong>Google Spreadsheet URL</strong> or <strong>Sheet ID</strong> below. Ensure your sheet is shared as <strong>"Anyone with the link can view"</strong>.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Google Sheet URL or Sheet ID:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="https://docs.google.com/spreadsheets/d/1ghUovqB8.../edit or raw ID"
                        value={testSheetId}
                        onChange={(e) => setTestSheetId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-slate-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Tip: You can paste the full browser URL directly from Google Sheets!
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Google Sheets API Key (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="Optional if sheet is shared as Anyone with the link can view"
                        value={testApiKey}
                        onChange={(e) => setTestApiKey(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-slate-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={testLoading}
                        className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
                        <span>{testLoading ? 'Connecting & Verifying...' : 'Connect & Save Sheet'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isSyncing}
                        className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Force fresh sync from Google Sheets right now"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>Sync Now</span>
                      </button>
                    </div>
                  </div>
                </div>

                {testResult && (
                  <div className={`p-3.5 rounded-xl text-xs border ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </form>

              {/* HOW TO TEST AFTER EDITING SHEET */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2.5">
                <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>How to test changes after editing your Google Sheet</span>
                </h4>
                
                <p className="text-xs text-slate-700 leading-relaxed">
                  When you make changes to your Google Sheet (e.g. adding new businesses, changing review comments, tags, or changing <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">smart review</code> to <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">yes</code> or <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">no</code>), you can test them in <strong>3 simple ways</strong>:
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-slate-900">Instant Sync button:</strong>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        Click the <strong className="text-slate-800">"Sync Now"</strong> button in the top navigation bar or inside this modal. It immediately re-fetches without reloading the page.
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-slate-900">Standard Page Refresh:</strong>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        Simply press <strong>Refresh (F5 or ⌘R)</strong> in your browser. The server automatically checks Google Sheets every 5 seconds with zero caching delay.
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-slate-900">Force Refresh URL Parameter:</strong>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        Append <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono">?sync=true</code> to your URL (e.g. <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono">?b=spice-hub&sync=true</code>) to force an immediate fresh fetch directly from Google.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-blue-900/90 pt-1 flex items-center gap-1.5">
                  <span>⏱️ <strong>Note:</strong> When typing in Google Sheets, Google's cloud takes about 2 to 3 seconds to publish cell changes before external apps can read them.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  <span>Vercel / Production Deployment Environment</span>
                </h4>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  When deploying to Vercel, simply add your Google Sheet ID in the <strong>Project Settings ➔ Environment Variables</strong> panel.
                </p>

                <div className="relative bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto mb-3">
                  <pre>{`GOOGLE_SHEET_ID="your_google_sheet_id_here"\nGOOGLE_SHEETS_API_KEY=""\nAPP_URL="https://smart-review.in"`}</pre>
                  <button
                    onClick={copyEnvSample}
                    className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                  >
                    {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                    <span>Create a new Google Spreadsheet and create two tabs: <code>Businesses</code> and <code>ReviewPrompts</code>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                    <span>Paste the schema columns or import the sample CSVs from the <strong>Sheets Schema</strong> tab.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                    <span>Click <strong>Share</strong> in Google Sheets and choose <strong>"Anyone with the link can view"</strong> (or generate a Google Cloud API Key with Google Sheets API enabled).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-[10px]">4</span>
                    <span>Set <code>GOOGLE_SHEET_ID</code> in Vercel environment variables and redeploy!</span>
                  </div>
                </div>
              </div>

              {/* Service Account & Private Key Guide */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>How to Find & Generate GOOGLE_PRIVATE_KEY</span>
                </h4>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  If your Google Sheet is strictly private (cannot be shared with a link), follow these steps to get your Service Account Private Key:
                </p>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                    <span>Go to <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Google Cloud Console ➔ IAM & Admin ➔ Service Accounts</a>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                    <span>Click <strong>+ Create Service Account</strong> (e.g. <code>smart-review-sheets</code>), then click <strong>Done</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                    <span>Click on the created Service Account, open the <strong>Keys</strong> tab, click <strong>Add Key ➔ Create new key</strong>, and select <strong>JSON</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">4</span>
                    <span>Open the downloaded <code>.json</code> file in a text editor. Look for the <code>"private_key"</code> and <code>"client_email"</code> fields.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">5</span>
                    <span>Share your Google Sheet with that <code>client_email</code> (as <strong>Viewer</strong>).</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <strong>Important Note on Line Breaks:</strong> In Vercel or <code>.env</code>, keep the surrounding quotes and literal <code>\n</code> characters:
                  <div className="mt-1 font-mono text-[11px] bg-white p-2 rounded border border-amber-300 text-slate-800 break-all select-all">
                    GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Smart_Review.in v1.0 · Google Sheets Backend
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
