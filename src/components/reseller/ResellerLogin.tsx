import React, { useState } from 'react';
import { api } from '../../services/api';
import { ResellerSession } from '../../types';
import { Phone, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../Logo';

interface ResellerLoginProps {
  onLoginSuccess: (session: ResellerSession) => void;
  onCancel?: () => void;
}

export const ResellerLogin: React.FC<ResellerLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        phone: res.reseller.phone || phone.trim(),
        email: res.reseller.email,
        joinedDate: res.reseller.joinedDate,
      };
      onLoginSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your name and phone number as registered by Admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md border border-white/20 p-2">
            <Logo className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">ResellerHub Portal</h2>
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

          {/* Secure Reseller Login Note */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-3 bg-blue-50/80 border border-blue-200/60 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Confidential Reseller Portal:</strong> Each reseller account is completely isolated. Sign in with your registered Name and Phone number to access your dedicated sales and orders dashboard.
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
