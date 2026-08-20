import React, { useState } from 'react';
import { api } from '../../services/api';
import { ResellerSession } from '../../types';
import { UserCheck, Phone, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface ResellerLoginProps {
  onLoginSuccess: (session: ResellerSession) => void;
  onCancel?: () => void;
}

export const ResellerLogin: React.FC<ResellerLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.resellerLogin(name.trim(), phone.trim());
      const session: ResellerSession = {
        id: res.reseller.id,
        name: res.reseller.name,
        phone: res.reseller.phone,
        email: res.reseller.email,
        joinedDate: res.reseller.joinedDate,
      };
      onLoginSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your details or ask Admin to register you.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const gUser = await api.signInWithGoogle();
      if (gUser.email) {
        const resellers = await api.getPublicResellers();
        const matched = resellers.find((r) => r.email?.toLowerCase() === gUser.email?.toLowerCase());
        if (matched) {
          const session: ResellerSession = {
            id: matched.id,
            name: matched.name,
            phone: matched.phone || '',
            email: matched.email,
            joinedDate: matched.joinedDate,
          };
          onLoginSuccess(session);
          return;
        }
      }
      // If general user, create lightweight session
      const session: ResellerSession = {
        id: `res_google_${gUser.uid}`,
        name: gUser.displayName || gUser.email?.split('@')[0] || 'Google User',
        phone: '',
        email: gUser.email || undefined,
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      onLoginSuccess(session);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('auth/unauthorized-domain')) {
        const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'your-domain.vercel.app';
        setError(`Unauthorized Domain: Firebase requires "${currentHostname}" to be added in Firebase Console > Authentication > Settings > Authorized Domains.`);
      } else {
        setError(errMsg || 'Google sign in failed');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemo = (demoName: string, demoPhone: string) => {
    setName(demoName);
    setPhone(demoPhone);
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white text-center relative">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Reseller Portal Login</h2>
          <p className="text-blue-100 text-xs mt-1">
            Access your orders, track delivery status & submit new sales
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In One-Click Option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-2xs flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Connecting Gmail...' : 'Connect with any Gmail Account'}</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400">or sign in with name & phone</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reseller Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanvir Rahman"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Registered Phone Number <span className="text-slate-400 font-normal">(Password)</span> <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01711223344"
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Your registered phone acts as your secure sign-in key.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Sign In to Reseller Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          {/* Quick Demo Resellers */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              One-Click Demo Resellers
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('Tanvir Rahman', '01711223344')}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 text-xs transition cursor-pointer"
              >
                <div className="font-medium text-slate-800">Tanvir Rahman</div>
                <div className="text-[10px] text-slate-500 font-mono">01711223344</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Sadia Islam', '01644556677')}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 text-xs transition cursor-pointer"
              >
                <div className="font-medium text-slate-800">Sadia Islam</div>
                <div className="text-[10px] text-slate-500 font-mono">01644556677</div>
              </button>
            </div>
            <div className="mt-3 p-2.5 bg-emerald-50/80 border border-emerald-200/60 rounded-lg text-[11px] text-emerald-900 leading-relaxed flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cloud Firestore Enabled:</strong> All order placements, delivery status changes, and shift logs are saved in real-time.
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
