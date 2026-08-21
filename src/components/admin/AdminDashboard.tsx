import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Clock,
  DollarSign,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Database,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Package
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Reseller,
  Order,
  DailyWork,
  DashboardStats,
  ResellerPerformance,
  DatabaseInfo,
} from '../../types';
import { api } from '../../services/api';
import { BANGLADESH_DISTRICTS } from '../../constants/locations';
import { FraudCheckerTool } from './FraudCheckerTool';
import { ProductManagement } from './ProductManagement';
import { AdSpendManagement } from './AdSpendManagement';
import { Tag } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Main admin sub-tab
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'resellers' | 'products' | 'ad-spend' | 'orders' | 'daily-work' | 'reports' | 'fraud-checker' | 'mysql-guide'
  >('overview');

  // Filters
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedResellerFilter, setSelectedResellerFilter] = useState<string>('all');

  // Search & Filter state for Orders & Daily Work
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailyWorks, setDailyWorks] = useState<DailyWork[]>([]);
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [mysqlSql, setMysqlSql] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Modals
  const [isAddResellerModalOpen, setIsAddResellerModalOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [newResellerName, setNewResellerName] = useState('');
  const [newResellerPhone, setNewResellerPhone] = useState('');
  const [newResellerEmail, setNewResellerEmail] = useState('');
  const [newResellerNotes, setNewResellerNotes] = useState('');
  const [newResellerStatus, setNewResellerStatus] = useState<'active' | 'inactive'>('active');

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingDailyWork, setEditingDailyWork] = useState<DailyWork | null>(null);

  // Load all initial admin data
  useEffect(() => {
    loadAllData();
  }, [dateFilter, customStartDate, customEndDate, selectedResellerFilter]);

  const getDateRangeParams = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      return { startDate: todayStr, endDate: todayStr };
    }
    if (dateFilter === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
    }
    if (dateFilter === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
    }
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    return {};
  };

  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const dateParams = getDateRangeParams();
      const params = {
        ...dateParams,
        resellerId: selectedResellerFilter,
      };

      const [statsData, resellersList, ordersList, worksList, dbData] = await Promise.all([
        api.getDashboardStats(params),
        api.getAdminResellers(),
        api.getAdminOrders(params),
        api.getAdminDailyWorks(params),
        api.getDatabaseInfo(),
      ]);

      setStats(statsData);
      setResellers(resellersList);
      setOrders(ordersList);
      setDailyWorks(worksList);
      setDbInfo(dbData.dbInfo);
      setMysqlSql(dbData.mysqlSchemaSql);
    } catch (err: any) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- Reseller Actions ---
  const handleSaveReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResellerName.trim()) return;

    try {
      if (editingReseller) {
        await api.updateReseller(editingReseller.id, {
          name: newResellerName.trim(),
          phone: newResellerPhone.trim(),
          email: newResellerEmail.trim(),
          status: newResellerStatus,
          notes: newResellerNotes.trim(),
        });
      } else {
        await api.createReseller({
          name: newResellerName.trim(),
          phone: newResellerPhone.trim(),
          email: newResellerEmail.trim(),
          status: newResellerStatus,
          notes: newResellerNotes.trim(),
        });
      }
      setIsAddResellerModalOpen(false);
      setEditingReseller(null);
      resetResellerForm();
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save reseller.');
    }
  };

  const openEditReseller = (r: Reseller) => {
    setEditingReseller(r);
    setNewResellerName(r.name);
    setNewResellerPhone(r.phone || '');
    setNewResellerEmail(r.email || '');
    setNewResellerStatus(r.status);
    setNewResellerNotes(r.notes || '');
    setIsAddResellerModalOpen(true);
  };

  const handleDeleteReseller = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete reseller "${name}"?`)) return;
    try {
      await api.deleteReseller(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete reseller.');
    }
  };

  const resetResellerForm = () => {
    setNewResellerName('');
    setNewResellerPhone('');
    setNewResellerEmail('');
    setNewResellerNotes('');
    setNewResellerStatus('active');
  };

  // --- Order Actions ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.updateOrder(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      await api.updateOrder(editingOrder.id, editingOrder);
      setEditingOrder(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save order modifications.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    try {
      await api.deleteOrder(orderId);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete order.');
    }
  };

  // --- Daily Work Actions ---
  const handleSaveDailyWorkEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDailyWork) return;
    try {
      await api.updateDailyWork(editingDailyWork.id, editingDailyWork);
      setEditingDailyWork(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update daily work record.');
    }
  };

  const handleDeleteDailyWork = async (workId: string) => {
    if (!window.confirm(`Delete this work shift entry?`)) return;
    try {
      await api.deleteDailyWork(workId);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete daily work entry.');
    }
  };

  // --- Export CSV helper ---
  const handleExportOrdersCSV = () => {
    if (orders.length === 0) {
      alert('No orders available to export.');
      return;
    }
    const headers = [
      'Order ID',
      'Reseller Name',
      'Customer Name',
      'Phone',
      'District',
      'Thana',
      'Address',
      'Product Details',
      'Quantity',
      'Amount (BDT)',
      'Status',
      'Order Date',
      'Notes',
    ];
    const rows = orders.map((o) => [
      o.id,
      `"${o.resellerName}"`,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.district}"`,
      `"${o.thana || ''}"`,
      `"${o.customerAddress.replace(/"/g, '""')}"`,
      `"${o.productDetails.replace(/"/g, '""')}"`,
      o.quantity,
      o.orderAmount,
      o.status,
      o.orderDate,
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reseller_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered orders list for order search
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      orderSearchQuery === '' ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerPhone.includes(orderSearchQuery) ||
      o.productDetails.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase());

    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Admin Operations Panel</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Real-time tracking of reseller performance, customer orders, ad spend, and working hours.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-refresh-data"
            onClick={loadAllData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            id="btn-open-add-reseller"
            onClick={() => {
              setEditingReseller(null);
              resetResellerForm();
              setIsAddResellerModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reseller</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar (Date & Reseller) */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Range:
          </span>
          {(['all', 'today', '7days', '30days', 'custom'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateFilter(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 ${
                dateFilter === range
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {range === 'all'
                ? 'All Time'
                : range === 'today'
                ? 'Today'
                : range === '7days'
                ? 'Last 7 Days'
                : range === '30days'
                ? 'This Month'
                : 'Custom'}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-800"
            />
            <span className="text-xs text-neutral-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-800"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Reseller:
          </span>
          <select
            value={selectedResellerFilter}
            onChange={(e) => setSelectedResellerFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Resellers ({resellers.length})</option>
            {resellers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto">
        <button
          id="tab-overview"
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          id="tab-resellers"
          onClick={() => setActiveSubTab('resellers')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'resellers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Reseller Management ({resellers.length})</span>
        </button>

        <button
          id="tab-products"
          onClick={() => setActiveSubTab('products')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'products'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Products & Profit Margins</span>
        </button>

        <button
          id="tab-ad-spend"
          onClick={() => setActiveSubTab('ad-spend')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'ad-spend'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
              : 'border-transparent text-neutral-500 hover:text-purple-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-purple-600" />
          <span>Ad Spend Tracker</span>
        </button>

        <button
          id="tab-orders"
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order Management ({orders.length})</span>
        </button>

        <button
          id="tab-daily-work"
          onClick={() => setActiveSubTab('daily-work')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'daily-work'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily Work Shifts ({dailyWorks.length})</span>
        </button>

        <button
          id="tab-reports"
          onClick={() => setActiveSubTab('reports')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'reports'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Reports & Analytics</span>
        </button>

        <button
          id="tab-fraud-checker"
          onClick={() => setActiveSubTab('fraud-checker')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'fraud-checker'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50 rounded-t-lg'
              : 'border-transparent text-neutral-600 hover:text-rose-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Customer Fraud & Courier APIs</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
            API Check
          </span>
        </button>

        <button
          id="tab-mysql-guide"
          onClick={() => setActiveSubTab('mysql-guide')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === 'mysql-guide'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-neutral-600 hover:text-emerald-700'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Cloud Database & Firebase</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Active
          </span>
        </button>
      </div>

      {/* ========================================== */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Total Orders & Classification */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold">Total Orders</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-neutral-900">
                {stats?.totalOrders || 0}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-neutral-600">
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Direct: {stats?.directOrdersCount || 0}
                </span>
                <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                  Follow-up: {stats?.followUpOrdersCount || 0}
                </span>
              </div>
            </div>

            {/* Total Products Sold */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold">Total Items Sold</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-900 font-mono">
                {stats?.totalProductsCount || stats?.totalOrders || 0}
              </div>
              <span className="text-[11px] text-neutral-500">
                Across all shipments
              </span>
            </div>

            {/* Total Sales */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold">Gross Revenue</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                ৳{(stats?.totalSales || 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-neutral-500">Total COD Collected</span>
            </div>

            {/* Profit Before Ad Cost */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold">Profit Before Ad</span>
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-teal-700 font-mono">
                ৳{(stats?.totalProfitBeforeAdCost || Math.round((stats?.totalSales || 0) * 0.35)).toLocaleString()}
              </div>
              <span className="text-[10px] text-teal-600 font-medium">
                Price - (Prod+Pack+Delivery)
              </span>
            </div>

            {/* Total Ad Spend */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold">Total Ad Spend</span>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-700 font-mono">
                ৳{(stats?.totalAdSpend || 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">
                ROAS: {stats?.overallROAS || 0}x
              </span>
            </div>

            {/* Estimated Profit (Net) */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-emerald-100 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Estimated Profit</span>
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono">
                ৳{(stats?.estimatedProfit !== undefined
                  ? stats.estimatedProfit
                  : (stats?.totalProfitBeforeAdCost || Math.round((stats?.totalSales || 0) * 0.35)) - (stats?.totalAdSpend || 0)
                ).toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-100 font-medium block mt-0.5">
                Profit Before Ad - Ad Spend
              </span>
            </div>
          </div>

          {/* Graphical Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales vs Ad Spend Trend Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">Sales vs. Advertising Spend Trend</h3>
                  <p className="text-xs text-neutral-500">Comparison of daily gross sales and marketing expenditure</p>
                </div>
              </div>
              <div className="h-72 w-full">
                {stats?.salesByDate && stats.salesByDate.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.salesByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="adColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="sales" name="Sales (৳)" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#salesColor)" />
                      <Area type="monotone" dataKey="adSpend" name="Ad Spend (৳)" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#adColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                    No timeline chart data for the selected period
                  </div>
                )}
              </div>
            </div>

            {/* Reseller Order Breakdown Bar Chart */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <h3 className="font-bold text-neutral-900 text-base mb-1">Reseller Orders Distribution</h3>
              <p className="text-xs text-neutral-500 mb-4">Total orders generated per reseller</p>
              <div className="h-72 w-full">
                {stats?.resellerPerformance && stats.resellerPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.resellerPerformance.slice(0, 5)}
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="resellerName" tick={{ fontSize: 11 }} width={85} />
                      <Tooltip
                        formatter={(val: any) => [`${val} orders`, 'Orders']}
                        contentStyle={{ borderRadius: 12, fontSize: 12 }}
                      />
                      <Bar dataKey="totalOrders" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                    No reseller orders found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reseller Performance Summary Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Reseller Performance Matrix</h3>
                <p className="text-xs text-neutral-500">Key metrics for each reseller (Orders, Sales, Ad Spend, Hours, ROAS, AOV)</p>
              </div>
              <button
                onClick={() => setActiveSubTab('resellers')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Resellers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Reseller</th>
                    <th className="py-3 px-4 text-center">Orders Breakdown</th>
                    <th className="py-3 px-4 text-center">Products Sold</th>
                    <th className="py-3 px-4 text-right">Gross Sales</th>
                    <th className="py-3 px-4 text-right">Profit Before Ad</th>
                    <th className="py-3 px-4 text-right">Ad Spend</th>
                    <th className="py-3 px-4 text-right">Estimated Net Profit</th>
                    <th className="py-3 px-4 text-center">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {stats?.resellerPerformance.map((rp) => (
                    <tr key={rp.resellerId} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${rp.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                          <span>{rp.resellerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-neutral-800">{rp.totalOrders} total</div>
                        <div className="text-[10px] text-neutral-500 flex items-center justify-center gap-1 mt-0.5">
                          <span className="text-emerald-700 font-medium">⚡{rp.directOrders || 0} Direct</span>
                          <span>•</span>
                          <span className="text-indigo-700 font-medium">🔄{rp.followUpOrders || 0} Follow-up</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-purple-800">
                        {rp.totalProductsCount || rp.totalOrders} pcs
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ৳{rp.totalSales.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-teal-700">
                        ৳{(rp.profitBeforeAdCost || Math.round(rp.totalSales * 0.35)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">
                        ৳{rp.totalAdSpend.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 bg-emerald-50/40">
                        ৳{(rp.estimatedProfit !== undefined
                          ? rp.estimatedProfit
                          : (rp.profitBeforeAdCost || Math.round(rp.totalSales * 0.35)) - rp.totalAdSpend
                        ).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                          rp.roas >= 3 ? 'bg-emerald-100 text-emerald-800' : rp.roas >= 1.5 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rp.roas > 0 ? `${rp.roas}x` : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Latest Customer Orders</h3>
                <p className="text-xs text-neutral-500">Most recent orders submitted by resellers</p>
              </div>
              <button
                onClick={() => setActiveSubTab('orders')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Orders ({orders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Reseller</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-neutral-600 text-xs">
                        #{o.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        {o.resellerName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">{o.customerName}</div>
                        <div className="text-xs text-neutral-500 font-mono">{o.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-neutral-700 text-xs">
                        {o.district} {o.thana ? `(${o.thana})` : ''}
                      </td>
                      <td className="py-3 px-4 text-neutral-800 text-xs max-w-xs truncate">
                        {o.productDetails} (x{o.quantity})
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ৳{o.orderAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : o.status === 'Confirmed'
                            ? 'bg-purple-100 text-purple-800'
                            : o.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. RESELLER MANAGEMENT TAB */}
      {/* ========================================== */}
      {activeSubTab === 'resellers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Registered Resellers ({resellers.length})</h2>
              <p className="text-xs text-neutral-500">
                Manage reseller accounts, contact details, status, and track aggregate earnings & spend.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingReseller(null);
                resetResellerForm();
                setIsAddResellerModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Reseller</span>
            </button>
          </div>

          {/* Resellers Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resellers.map((r) => {
              const perf = stats?.resellerPerformance.find((p) => p.resellerId === r.id);
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-neutral-900 text-base">{r.name}</h3>
                        <p className="text-xs text-neutral-500">Joined: {r.joinedDate || 'Recently'}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        r.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-neutral-600 mb-4 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      <div><strong>Phone:</strong> {r.phone || 'N/A'}</div>
                      <div><strong>Email:</strong> {r.email || 'N/A'}</div>
                      {r.notes && <div><strong>Notes:</strong> {r.notes}</div>}
                    </div>

                    {/* Reseller Stats Quick Summary */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                      <div className="bg-neutral-100/70 p-2 rounded-lg">
                        <span className="text-[10px] text-neutral-500 block">Orders</span>
                        <span className="font-bold text-neutral-900">{perf?.totalOrders || 0}</span>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-lg">
                        <span className="text-[10px] text-emerald-600 block">Sales</span>
                        <span className="font-bold text-emerald-700 font-mono">৳{(perf?.totalSales || 0).toLocaleString()}</span>
                      </div>
                      <div className="bg-rose-50 p-2 rounded-lg">
                        <span className="text-[10px] text-rose-600 block">Ad Spend</span>
                        <span className="font-bold text-rose-700 font-mono">৳{(perf?.totalAdSpend || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => openEditReseller(r)}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteReseller(r.id, r.name)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2b. PRODUCT CATALOG TAB */}
      {/* ========================================== */}
      {activeSubTab === 'products' && (
        <div className="animate-in fade-in duration-200">
          <ProductManagement />
        </div>
      )}

      {/* ========================================== */}
      {/* 2c. AD SPEND TRACKER TAB */}
      {/* ========================================== */}
      {activeSubTab === 'ad-spend' && (
        <div className="animate-in fade-in duration-200">
          <AdSpendManagement />
        </div>
      )}

      {/* ========================================== */}
      {/* 3. ORDER MANAGEMENT TAB */}
      {/* ========================================== */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone number, product, or order ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-800"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={handleExportOrdersCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3.5 px-4">Order ID & Date</th>
                    <th className="py-3.5 px-4">Reseller</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Delivery Address</th>
                    <th className="py-3.5 px-4">Product / Items</th>
                    <th className="py-3.5 px-4 text-right">Amount (৳)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400 text-xs">
                        No orders match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-neutral-800 text-xs">#{o.id}</div>
                          <div className="text-[11px] text-neutral-500">
                            {new Date(o.orderDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-900">
                          {o.resellerName}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-neutral-900">{o.customerName}</div>
                          <div className="font-mono text-xs text-neutral-600">{o.customerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-neutral-700 max-w-xs">
                          <div>{o.customerAddress}</div>
                          <div className="font-semibold text-neutral-800">
                            {o.district} {o.thana ? `• ${o.thana}` : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-neutral-800 max-w-xs">
                          <div className="font-medium">{o.productDetails}</div>
                          <div className="text-neutral-500">Qty: {o.quantity} pc(s)</div>
                          {o.notes && <div className="text-[11px] text-amber-700 italic">Note: {o.notes}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                          ৳{o.orderAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              o.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : o.status === 'Shipped'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : o.status === 'Confirmed'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : o.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingOrder(o)}
                              title="Edit Order"
                              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              title="Delete Order"
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. DAILY WORK MANAGEMENT TAB */}
      {/* ========================================== */}
      {activeSubTab === 'daily-work' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Daily Work & Shift Logs ({dailyWorks.length})</h2>
              <p className="text-xs text-neutral-500">Track reseller duty hours, orders achieved, and advertising spend per shift.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Reseller</th>
                    <th className="py-3.5 px-4 text-center">Work Shift Timing</th>
                    <th className="py-3.5 px-4 text-center">Total Hours</th>
                    <th className="py-3.5 px-4 text-center">Orders Generated</th>
                    <th className="py-3.5 px-4 text-right">Ad Spend (৳)</th>
                    <th className="py-3.5 px-4">Shift Notes</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {dailyWorks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400 text-xs">
                        No daily work logs recorded for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    dailyWorks.map((w) => (
                      <tr key={w.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          {w.workDate}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-900">
                          {w.resellerName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-neutral-700 text-xs">
                          {w.startTime} – {w.endTime}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700 font-mono">
                          {w.totalHours} hrs
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-neutral-900">
                          {w.ordersGenerated}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                          ৳{w.adSpend.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-neutral-600 max-w-xs">
                          {w.notes || <span className="text-neutral-300">None</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingDailyWork(w)}
                              title="Edit Entry"
                              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDailyWork(w.id)}
                              title="Delete Entry"
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 5. REPORTS & ANALYTICS TAB */}
      {/* ========================================== */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
            <h2 className="text-xl font-black text-neutral-900 tracking-tight mb-1">Financial & ROAS Performance Report</h2>
            <p className="text-xs text-neutral-500 mb-6">
              Full breakdown of sales, advertising expenditure, profitability ratio, and workload.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-xs text-neutral-500 block">Total Orders Generated</span>
                <span className="text-2xl font-black text-neutral-900">{stats?.totalOrders || 0}</span>
                <span className="text-[10px] text-neutral-500 block mt-1">
                  Direct: {stats?.directOrdersCount || 0} | Follow-up: {stats?.followUpOrdersCount || 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-700 block">Gross Sales Value</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">৳{(stats?.totalSales || 0).toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600 block mt-1">Total revenue collected</span>
              </div>
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-xs text-teal-700 block">Profit Before Ad</span>
                <span className="text-2xl font-black text-teal-700 font-mono">৳{(stats?.totalProfitBeforeAdCost || Math.round((stats?.totalSales || 0) * 0.35)).toLocaleString()}</span>
                <span className="text-[10px] text-teal-600 block mt-1">Revenue minus unit costs</span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-xs text-rose-700 block">Total Ad Spend</span>
                <span className="text-2xl font-black text-rose-700 font-mono">৳{(stats?.totalAdSpend || 0).toLocaleString()}</span>
                <span className="text-[10px] text-rose-600 block mt-1">ROAS: {stats?.overallROAS || 0}x</span>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-xs text-purple-700 block">Estimated Net Profit</span>
                <span className="text-2xl font-black text-purple-700 font-mono">
                  ৳{(stats?.estimatedProfit !== undefined
                    ? stats.estimatedProfit
                    : (stats?.totalProfitBeforeAdCost || Math.round((stats?.totalSales || 0) * 0.35)) - (stats?.totalAdSpend || 0)
                  ).toLocaleString()}
                </span>
                <span className="text-[10px] text-purple-600 block mt-1">Profit Before Ad - Ad Spend</span>
              </div>
            </div>

            {/* Reseller Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Reseller Name</th>
                    <th className="py-3 px-4 text-center">Orders Breakdown</th>
                    <th className="py-3 px-4 text-center">Products Sold</th>
                    <th className="py-3 px-4 text-right">Gross Sales</th>
                    <th className="py-3 px-4 text-right">Profit Before Ad</th>
                    <th className="py-3 px-4 text-right">Ad Spend</th>
                    <th className="py-3 px-4 text-right">Estimated Net Profit</th>
                    <th className="py-3 px-4 text-center">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {stats?.resellerPerformance.map((rp) => (
                    <tr key={rp.resellerId} className="hover:bg-neutral-50">
                      <td className="py-3.5 px-4 font-bold text-neutral-900">{rp.resellerName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold">{rp.totalOrders} total</span>
                        <div className="text-[10px] text-neutral-500">⚡{rp.directOrders || 0} D / 🔄{rp.followUpOrders || 0} F</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-800">{rp.totalProductsCount || rp.totalOrders} pcs</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">৳{rp.totalSales.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-teal-700">৳{(rp.profitBeforeAdCost || Math.round(rp.totalSales * 0.35)).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-600">৳{rp.totalAdSpend.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700">
                        ৳{(rp.estimatedProfit !== undefined
                          ? rp.estimatedProfit
                          : (rp.profitBeforeAdCost || Math.round(rp.totalSales * 0.35)) - rp.totalAdSpend
                        ).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                          {rp.roas}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. CLOUD DATABASE & FIREBASE STATUS TAB */}
      {/* ========================================== */}
      {activeSubTab === 'mysql-guide' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Cloud Firestore Live Status Banner */}
          <div className="p-6 rounded-2xl border bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300 text-emerald-950 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-white shadow-xs text-emerald-600 shrink-0 border border-emerald-100">
                  <Database className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-lg text-emerald-900">
                      Google Cloud Firestore Database Active
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-emerald-600 text-white shadow-2xs">
                      Live Cloud Sync
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/90 mt-1">
                    All resellers, customer orders, catalog products, shift logs, and Gmail accounts are securely saved and synced across all devices in real-time.
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs font-mono font-medium text-emerald-900 bg-white/70 px-3 py-1.5 rounded-xl border border-emerald-200/80 w-fit">
                    <span>Project: <strong>gen-lang-client-0474328991</strong></span>
                    <span>•</span>
                    <span>Auth: <strong>Firebase + Google Sign-In</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={loadAllData}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Sync Cloud Data</span>
                </button>
              </div>
            </div>

            {/* Metrics Counters in Firestore */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/85 p-3 rounded-xl border border-emerald-200/70 text-center">
                <div className="text-[11px] font-bold uppercase text-emerald-800">Cloud Resellers</div>
                <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{dbInfo?.counts.resellers ?? resellers.length}</div>
              </div>
              <div className="bg-white/85 p-3 rounded-xl border border-emerald-200/70 text-center">
                <div className="text-[11px] font-bold uppercase text-emerald-800">Cloud Orders</div>
                <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{dbInfo?.counts.orders ?? orders.length}</div>
              </div>
              <div className="bg-white/85 p-3 rounded-xl border border-emerald-200/70 text-center">
                <div className="text-[11px] font-bold uppercase text-emerald-800">Catalog Products</div>
                <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{dbInfo?.counts.products ?? 5}</div>
              </div>
              <div className="bg-white/85 p-3 rounded-xl border border-emerald-200/70 text-center">
                <div className="text-[11px] font-bold uppercase text-emerald-800">Daily Shift Logs</div>
                <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{dbInfo?.counts.dailyWorks ?? dailyWorks.length}</div>
              </div>
            </div>
          </div>

          {/* MySQL Integration & Secondary Export Details */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Optional: External MySQL Database Sync</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Your application is already connected to Google Cloud Firestore. If you also wish to connect an external MySQL instance (e.g. phpMyAdmin, RDS, or local server), you can use the schema and config below:
              </p>
            </div>

            {/* Step 1 */}
            <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                <span>MySQL Schema SQL</span>
              </div>
              <p className="text-xs text-neutral-600 mb-3">
                Execute this SQL in phpMyAdmin or MySQL Workbench if using MySQL:
              </p>

              <div className="relative">
                <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                  {mysqlSql}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mysqlSql);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Environment Variables (.env)</span>
              </div>
              <p className="text-xs text-neutral-600 mb-3">
                Add your credentials to your <code>.env</code> file:
              </p>

              <div className="relative">
                <pre className="bg-neutral-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto">
{`# Optional MySQL Settings
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=reseller_db`}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`MYSQL_HOST=localhost\nMYSQL_PORT=3306\nMYSQL_USER=root\nMYSQL_PASSWORD=your_password\nMYSQL_DATABASE=reseller_db`);
                    setCopiedEnv(true);
                    setTimeout(() => setCopiedEnv(false), 2000);
                  }}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedEnv ? 'Copied!' : 'Copy .env snippet'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. FRAUD CHECKER & COURIER APIS */}
      {/* ========================================== */}
      {activeSubTab === 'fraud-checker' && (
        <div className="animate-in fade-in duration-200">
          <FraudCheckerTool />
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: ADD / EDIT RESELLER */}
      {/* ========================================== */}
      {isAddResellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              {editingReseller ? 'Edit Reseller Details' : 'Add New Reseller'}
            </h3>
            <form onSubmit={handleSaveReseller} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reseller Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newResellerName}
                  onChange={(e) => setNewResellerName(e.target.value)}
                  placeholder="e.g. Mahbub Alam"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newResellerPhone}
                  onChange={(e) => setNewResellerPhone(e.target.value)}
                  placeholder="e.g. 01711000000"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newResellerEmail}
                  onChange={(e) => setNewResellerEmail(e.target.value)}
                  placeholder="e.g. mahbub@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={newResellerStatus}
                  onChange={(e) => setNewResellerStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="active">Active (Can submit orders & shifts)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Notes / Region
                </label>
                <textarea
                  rows={2}
                  value={newResellerNotes}
                  onChange={(e) => setNewResellerNotes(e.target.value)}
                  placeholder="e.g. Dhaka Dhanmondi zone, handles footwear category."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddResellerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  {editingReseller ? 'Save Changes' : 'Create Reseller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: EDIT ORDER */}
      {/* ========================================== */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Edit Order #{editingOrder.id}
            </h3>
            <form onSubmit={handleSaveOrderEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={editingOrder.customerName}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={editingOrder.customerPhone}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    District
                  </label>
                  <select
                    value={editingOrder.district}
                    onChange={(e) => setEditingOrder({ ...editingOrder, district: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Thana / Upazila
                </label>
                <input
                  type="text"
                  value={editingOrder.thana}
                  onChange={(e) => setEditingOrder({ ...editingOrder, thana: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingOrder.customerAddress}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customerAddress: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Product Details
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingOrder.productDetails}
                  onChange={(e) => setEditingOrder({ ...editingOrder, productDetails: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingOrder.quantity}
                    onChange={(e) => setEditingOrder({ ...editingOrder, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Amount (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={editingOrder.orderAmount}
                    onChange={(e) => setEditingOrder({ ...editingOrder, orderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: EDIT DAILY WORK */}
      {/* ========================================== */}
      {editingDailyWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Edit Work Shift Log
            </h3>
            <form onSubmit={handleSaveDailyWorkEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Work Date</label>
                <input
                  type="date"
                  required
                  value={editingDailyWork.workDate}
                  onChange={(e) => setEditingDailyWork({ ...editingDailyWork, workDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={editingDailyWork.startTime}
                    onChange={(e) => setEditingDailyWork({ ...editingDailyWork, startTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={editingDailyWork.endTime}
                    onChange={(e) => setEditingDailyWork({ ...editingDailyWork, endTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Orders Count</label>
                  <input
                    type="number"
                    min={0}
                    value={editingDailyWork.ordersGenerated}
                    onChange={(e) => setEditingDailyWork({ ...editingDailyWork, ordersGenerated: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Ad Spend (৳)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={editingDailyWork.adSpend}
                    onChange={(e) => setEditingDailyWork({ ...editingDailyWork, adSpend: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Shift Notes</label>
                <textarea
                  rows={2}
                  value={editingDailyWork.notes || ''}
                  onChange={(e) => setEditingDailyWork({ ...editingDailyWork, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingDailyWork(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
