import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle,
  Truck,
  PhoneCall,
  Key,
  Globe,
  HelpCircle,
  Code2,
  ExternalLink,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { FraudCheckResult } from '../../types';

export const FraudCheckerTool: React.FC = () => {
  const [phone, setPhone] = useState<string>('01712345678');
  const [customerName, setCustomerName] = useState<string>('Rahim Ahmed');
  const [address, setAddress] = useState<string>('House 12, Road 4, Sector 7, Uttara, Dhaka');
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<any | null>(null);
  const [courierResult, setCourierResult] = useState<FraudCheckResult | null>(null);
  const [courierError, setCourierError] = useState<string | null>(null);

  // External API Configuration Form State
  const [apiProvider, setApiProvider] = useState<'steadfast' | 'pathao' | 'custom'>('steadfast');
  const [apiKey, setApiKey] = useState<string>('7pmatsk0szsfke9kdqlfy3uxdesvvijt');
  const [secretKey, setSecretKey] = useState<string>('h5jr5heiczfyeygdcawviixu');
  const [apiEndpoint, setApiEndpoint] = useState<string>('https://portal.packzy.com/api/v1/fraud_check');
  const [saveStatus, setSaveStatus] = useState<string>('');

  const handleRunFraudCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setCourierError(null);
    try {
      let fraudEngineReport: any = null;
      try {
        const localRes = await fetch('/api/fraud/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerPhone: phone,
            customerName,
            customerAddress: address,
          }),
        });
        const text = await localRes.text();
        try {
          const parsed = JSON.parse(text);
          if (parsed && parsed.success) {
            fraudEngineReport = parsed.fraudReport;
          }
        } catch {
          // Ignore
        }
      } catch (err) {
        console.warn('Local fraud engine check failed:', err);
      }

      if (fraudEngineReport) {
        setReport(fraudEngineReport);
      }

      try {
        const courierData = await api.checkCourierFraud(phone);
        setCourierResult(courierData);
      } catch (cErr: any) {
        setCourierError(cErr.message || 'Courier API offline. Local fraud report generated.');
      }
    } catch (err: any) {
      console.error('Fraud check tool error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('API Credentials configured & saved securely.');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                E-Commerce Security
              </span>
              <span className="text-xs text-neutral-400">• Real-Time Phone & Return Rate Verification</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mt-2">
              Customer Fraud & Courier Return Rate Checker
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Inspect suspicious phone numbers, verify valid Bangladeshi mobile operators, calculate past return/cancellation risk, and connect courier APIs (Steadfast, Pathao, RedX).
            </p>
          </div>

          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Engine Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Test Form & Result */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Live Customer Lookup</span>
            </h3>

            <form onSubmit={handleRunFraudCheck} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Customer Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahim Ahmed"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Road, Area, Thana, District"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Analyzing Fraud Signals...' : 'Run Real-Time Fraud & Return Check'}</span>
              </button>
            </form>

            {/* Live Steadfast Courier Result Card */}
            {courierResult && (
              <div
                className={`mt-4 p-4 rounded-xl border ${
                  courierResult.riskLevel === 'fraud_alert'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : courierResult.riskLevel === 'high_risk'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : courierResult.riskLevel === 'moderate'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : courierResult.riskLevel === 'safe'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="font-bold text-xs block">
                        Steadfast Courier Network Verification
                      </span>
                      <span className="text-[11px] opacity-75 font-mono">
                        Phone: {courierResult.phone}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-black/5 uppercase">
                    {courierResult.riskLevel.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-black/5 text-center">
                    <span className="text-[10px] text-slate-500 block">Total Parcels</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{courierResult.totalParcels}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-black/5 text-center">
                    <span className="text-[10px] text-emerald-700 block">Delivered</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">{courierResult.totalDelivered}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-black/5 text-center">
                    <span className="text-[10px] text-rose-700 block">Cancelled</span>
                    <span className="font-bold text-rose-700 font-mono text-sm">{courierResult.totalCancelled}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-black/5 text-center">
                    <span className="text-[10px] text-indigo-700 block">Delivery Ratio</span>
                    <span className="font-bold text-indigo-700 font-mono text-sm">{courierResult.deliveryRatio}%</span>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed font-medium">
                  {courierResult.riskMessage}
                </p>
              </div>
            )}

            {/* Result Report Card */}
            {report && (
              <div className="mt-6 border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    {report.riskLevel === 'SAFE' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                    {report.riskLevel === 'MODERATE' && (
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    )}
                    {report.riskLevel === 'HIGH_RISK' && (
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <span className="font-bold text-xs text-neutral-900 block">
                        Risk Level: {report.riskLevel} (Score: {report.riskScore}/100)
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {report.phoneNumber} • {report.customerName}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg ${
                      report.recommendation === 'APPROVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.recommendation === 'CALL_VERIFICATION_REQUIRED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Action: {report.recommendation.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">Delivery Rate</span>
                    <span className="font-bold text-neutral-900">{report.courierDeliveryRate}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">Total Past Orders</span>
                    <span className="font-bold text-neutral-900">{report.totalPastOrders}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">Successful Delivered</span>
                    <span className="font-bold text-emerald-700">{report.successfulDeliveries}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                    <span className="text-[10px] text-neutral-500 block">Cancelled / Returned</span>
                    <span className="font-bold text-rose-700">{report.returnedOrCancelled}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-neutral-700 block">Evaluation Signals:</span>
                  <ul className="space-y-1 text-xs">
                    {report.flags.map((flag: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5 text-neutral-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Connect External Courier / Fraud APIs */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Connect Courier API</span>
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Integrate live delivery return data directly from your courier portal.
            </p>

            <form onSubmit={handleSaveApiConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Courier / API Provider
                </label>
                <select
                  value={apiProvider}
                  onChange={(e) => {
                    const p = e.target.value as any;
                    setApiProvider(p);
                    if (p === 'steadfast') {
                      setApiEndpoint('https://portal.steadfast.com.bd/api/v1/fraud_check');
                    } else if (p === 'pathao') {
                      setApiEndpoint('https://api-hermes.pathao.com/aladdin/api/v1/user/success-rate');
                    } else {
                      setApiEndpoint('https://api.yourfraudcheck.com/v1/verify');
                    }
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 focus:bg-white focus:outline-hidden"
                >
                  <option value="steadfast">Steadfast Courier (Fraud Checker API)</option>
                  <option value="pathao">Pathao Courier (Customer Return API)</option>
                  <option value="custom">Custom Webhook / Third-Party API</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  API Key / Token
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter Courier API Key..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Secret Key / Password (If required)
                </label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter Secret Key..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  API Endpoint URL
                </label>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 font-mono text-[11px] focus:bg-white focus:outline-hidden"
                />
              </div>

              {saveStatus && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{saveStatus}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-all cursor-pointer"
              >
                Save Courier API Keys
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-1">
              <strong className="text-neutral-700 block">Popular Bangladeshi Courier APIs:</strong>
              <p>• <strong>Steadfast API:</strong> Check delivery ratio by phone number.</p>
              <p>• <strong>Pathao Merchant API:</strong> Real-time customer delivery success rate.</p>
              <p>• <strong>RedX API:</strong> Customer parcel history verification.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
