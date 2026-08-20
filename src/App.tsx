import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OrderEntryForm } from './components/reseller/OrderEntryForm';
import { DailyWorkForm } from './components/reseller/DailyWorkForm';
import { ResellerOrdersList } from './components/reseller/ResellerOrdersList';
import { ResellerLogin } from './components/reseller/ResellerLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { api } from './services/api';
import { ResellerSession } from './types';
import { UserCheck, Cloud, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'order-entry' | 'my-orders' | 'daily-work' | 'admin' | 'reseller-login'>('order-entry');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [resellerSession, setResellerSession] = useState<ResellerSession | null>(null);

  // Check existing sessions on load
  useEffect(() => {
    // 1. Check Admin Session
    const adminToken = localStorage.getItem('reseller_admin_token');
    if (adminToken) {
      api.getAdminProfile()
        .then(() => setIsAdminLoggedIn(true))
        .catch(() => {
          localStorage.removeItem('reseller_admin_token');
          setIsAdminLoggedIn(false);
        });
    }

    // 2. Check Reseller Session
    const resellerToken = localStorage.getItem('reseller_portal_token');
    if (resellerToken) {
      api.getMyResellerProfile()
        .then((res) => {
          setResellerSession({
            id: res.reseller.id,
            name: res.reseller.name,
            phone: res.reseller.phone || '',
            email: res.reseller.email,
            joinedDate: res.reseller.joinedDate,
          });
        })
        .catch(() => {
          localStorage.removeItem('reseller_portal_token');
          setResellerSession(null);
        });
    }
  }, []);

  const handleTabChange = (tab: 'order-entry' | 'my-orders' | 'daily-work' | 'admin' | 'reseller-login') => {
    if (tab === 'admin' && !isAdminLoggedIn) {
      setIsAdminModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('reseller_admin_token');
    localStorage.removeItem('reseller_admin_username');
    setIsAdminLoggedIn(false);
    setActiveTab('order-entry');
  };

  const handleResellerLoginSuccess = (session: ResellerSession) => {
    setResellerSession(session);
    setActiveTab('my-orders');
  };

  const handleResellerLogout = () => {
    api.resellerLogout();
    setResellerSession(null);
    setActiveTab('order-entry');
  };

  return (
    <div className="min-h-screen bg-slate-100/75 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onAdminLogout={handleAdminLogout}
        resellerSession={resellerSession}
        onOpenResellerLogin={() => setActiveTab('reseller-login')}
        onResellerLogout={handleResellerLogout}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 1. Order Entry Tab */}
        {activeTab === 'order-entry' && (
          <OrderEntryForm
            currentResellerSession={resellerSession}
            onViewMyOrders={() => {
              if (resellerSession) {
                setActiveTab('my-orders');
              } else {
                setActiveTab('reseller-login');
              }
            }}
          />
        )}

        {/* 2. Reseller Login Tab */}
        {activeTab === 'reseller-login' && (
          <div className="py-6">
            <ResellerLogin
              onLoginSuccess={handleResellerLoginSuccess}
              onCancel={() => setActiveTab('order-entry')}
            />
          </div>
        )}

        {/* 3. My Orders & Status Tab */}
        {activeTab === 'my-orders' && (
          <div>
            {resellerSession ? (
              <ResellerOrdersList
                session={resellerSession}
                onNavigateToNewOrder={() => setActiveTab('order-entry')}
              />
            ) : (
              <div className="max-w-md mx-auto py-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 border border-indigo-100">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Sign in to View Your Orders</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your registered name & phone number to track orders and delivery statuses in real-time.
                  </p>
                </div>
                <ResellerLogin onLoginSuccess={handleResellerLoginSuccess} />
              </div>
            )}
          </div>
        )}

        {/* 4. Daily Work Form */}
        {activeTab === 'daily-work' && (
          <div className="max-w-2xl mx-auto">
            <DailyWorkForm
              currentResellerSession={resellerSession}
              onWorkLogged={() => {}}
            />
          </div>
        )}

        {/* 5. Admin Portal */}
        {activeTab === 'admin' && isAdminLoggedIn && (
          <AdminDashboard />
        )}
      </main>

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">E-Commerce Reseller Management System</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Cloud className="w-3.5 h-3.5" />
              Connected to Google Cloud Firestore
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => handleTabChange('order-entry')}
              className="hover:text-indigo-600 transition cursor-pointer"
            >
              Order Entry
            </button>
            <button
              onClick={() => handleTabChange('my-orders')}
              className="hover:text-indigo-600 transition cursor-pointer"
            >
              My Orders & Status
            </button>
            <button
              onClick={() => handleTabChange('daily-work')}
              className="hover:text-indigo-600 transition cursor-pointer"
            >
              Daily Shift
            </button>
            <button
              onClick={() => {
                if (isAdminLoggedIn) {
                  setActiveTab('admin');
                } else {
                  setIsAdminModalOpen(true);
                }
              }}
              className="hover:text-indigo-600 font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
