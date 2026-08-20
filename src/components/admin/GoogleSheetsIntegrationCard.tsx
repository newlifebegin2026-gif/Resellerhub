import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Order } from '../../types';
import {
  TARGET_SPREADSHEET_ID,
  TARGET_SPREADSHEET_URL,
  SPREADSHEET_HEADERS,
  getSavedSheetsToken,
  authenticateGoogleSheets,
  clearSheetsToken,
  isSheetsAutoSyncEnabled,
  setSheetsAutoSyncEnabled,
  bulkSyncOrdersToGoogleSheet,
} from '../../services/googleSheets';

interface GoogleSheetsIntegrationCardProps {
  orders: Order[];
  onSyncCompleted?: () => void;
}

export const GoogleSheetsIntegrationCard: React.FC<GoogleSheetsIntegrationCardProps> = ({
  orders,
  onSyncCompleted,
}) => {
  const [token, setToken] = useState<string | null>(getSavedSheetsToken());
  const [autoSync, setAutoSync] = useState<boolean>(isSheetsAutoSyncEnabled());
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setToken(getSavedSheetsToken());
  }, []);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setErrorMessage(null);
      setStatusMessage(null);
      const newToken = await authenticateGoogleSheets();
      setToken(newToken);
      setStatusMessage('Connected to Google Sheets successfully! Orders will now automatically sync.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate with Google Sheets.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearSheetsToken();
    setToken(null);
    setStatusMessage('Google Sheets disconnected.');
  };

  const handleToggleAutoSync = () => {
    const next = !autoSync;
    setAutoSync(next);
    setSheetsAutoSyncEnabled(next);
  };

  const handleBulkSyncAll = async () => {
    if (orders.length === 0) {
      alert('No orders available to sync.');
      return;
    }

    try {
      setSyncing(true);
      setErrorMessage(null);
      setStatusMessage(null);
      const res = await bulkSyncOrdersToGoogleSheet(orders);
      setStatusMessage(res.message);
      setToken(getSavedSheetsToken());
      if (onSyncCompleted) onSyncCompleted();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to bulk sync orders to Google Sheet.');
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = Boolean(token);

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-neutral-900 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-xl relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Google Spreadsheet Real-Time Sync
                </h3>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Zap className="w-3.5 h-3.5" /> Action Needed
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
                Automatically appends customer name, phone, full address, products, delivery charges, COD amount, and profits into your Google Sheet the second an order is placed.
              </p>
            </div>
          </div>

          {/* Connect / Manage Button */}
          <div className="flex items-center gap-2 shrink-0">
            {isConnected ? (
              <button
                id="btn-disconnect-sheets"
                onClick={handleDisconnect}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                id="btn-connect-sheets"
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-950 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${connecting ? 'animate-spin' : ''}`} />
                <span>{connecting ? 'Connecting...' : 'Authorize & Connect Google Sheet'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status and Error banners */}
        {statusMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-900/40 border border-emerald-600/40 text-emerald-200 text-xs font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-900/40 border border-rose-600/40 text-rose-200 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Configuration Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Sheet Card */}
          <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
              Target Spreadsheet
            </span>
            <div className="font-mono text-xs text-neutral-200 truncate bg-neutral-950/60 p-2 rounded-lg border border-neutral-800">
              {TARGET_SPREADSHEET_ID}
            </div>
            <a
              id="link-open-google-sheet"
              href={TARGET_SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors pt-1"
            >
              <span>Open Spreadsheet in Google Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Instant Auto-Sync Switch */}
          <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Instant Order Append
              </span>
              <p className="text-xs text-neutral-300 mt-1">
                Every newly submitted order immediately triggers a row insertion in Google Sheets.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-medium text-neutral-200">
                Auto-Sync Trigger: <strong className={autoSync ? 'text-emerald-400' : 'text-neutral-500'}>{autoSync ? 'ENABLED' : 'DISABLED'}</strong>
              </span>
              <button
                id="btn-toggle-auto-sync"
                onClick={handleToggleAutoSync}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Toggle Instant Auto Sync"
              >
                {autoSync ? (
                  <ToggleRight className="w-7 h-7 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-neutral-600" />
                )}
              </button>
            </div>
          </div>

          {/* Bulk Sync Existing Orders */}
          <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Manual / Bulk Push
              </span>
              <p className="text-xs text-neutral-300 mt-1">
                Have existing Firestore orders? Push all {orders.length} order(s) to the spreadsheet now.
              </p>
            </div>
            <button
              id="btn-bulk-sync-orders"
              onClick={handleBulkSyncAll}
              disabled={syncing || orders.length === 0}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 transition-all cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : `Sync All ${orders.length} Orders to Sheet`}</span>
            </button>
          </div>
        </div>

        {/* Data Schema Columns Preview */}
        <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Spreadsheet Column Schema ({SPREADSHEET_HEADERS.length} Data Points)
            </span>
            <span className="text-[11px] text-emerald-400">Auto-Formatted with Bangladesh Phone & Timezone</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SPREADSHEET_HEADERS.map((header, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md text-[11px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300"
              >
                {header}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
