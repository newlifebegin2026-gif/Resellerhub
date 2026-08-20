import React from 'react';
import {
  ShoppingBag,
  Clock,
  Shield,
  LogOut,
  Package,
  UserCheck,
  Cloud,
} from 'lucide-react';
import { ResellerSession } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  activeTab: 'order-entry' | 'my-orders' | 'daily-work' | 'admin' | 'reseller-login';
  setActiveTab: (tab: 'order-entry' | 'my-orders' | 'daily-work' | 'admin' | 'reseller-login') => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  resellerSession: ResellerSession | null;
  onOpenResellerLogin: () => void;
  onResellerLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onAdminLogout,
  resellerSession,
  onOpenResellerLogin,
  onResellerLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab(resellerSession ? 'my-orders' : 'order-entry')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 p-1 flex items-center justify-center shadow-xs shadow-slate-100">
              <Logo className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">ResellerHub</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5 text-emerald-600" />
                  Firebase Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Reseller Portal & Realtime Cloud Hub</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {/* 1. Order Entry Tab */}
            <button
              id="nav-submit-order"
              onClick={() => setActiveTab('order-entry')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'order-entry'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Place Order</span>
            </button>

            {/* 2. My Orders & Status (Reseller View) */}
            <button
              id="nav-my-orders"
              onClick={() => setActiveTab('my-orders')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'my-orders'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders & Status</span>
            </button>

            {/* 3. Daily Work Log */}
            <button
              id="nav-daily-work"
              onClick={() => setActiveTab('daily-work')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'daily-work'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden md:inline">Daily Work</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Reseller Account Profile or Login */}
            {resellerSession ? (
              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 rounded-xl px-2.5 py-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {resellerSession.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-bold text-slate-800 leading-tight">{resellerSession.name}</div>
                  <div className="text-[10px] text-indigo-700 font-mono">{resellerSession.phone}</div>
                </div>
                <button
                  onClick={onResellerLogout}
                  title="Sign out reseller"
                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-reseller-login"
                onClick={onOpenResellerLogin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Reseller Login</span>
              </button>
            )}

            {/* Admin Action */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1">
                <button
                  id="nav-admin-dashboard"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>

                <button
                  id="btn-admin-logout"
                  onClick={onAdminLogout}
                  title="Logout Admin"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-admin-login"
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Admin Login (Add/Remove Resellers & Products)"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
