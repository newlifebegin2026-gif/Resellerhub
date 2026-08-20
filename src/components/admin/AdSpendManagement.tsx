import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdSpendEntry, Reseller } from '../../types';
import {
  DollarSign,
  Plus,
  Calendar,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdSpendManagement: React.FC = () => {
  const [spends, setSpends] = useState<AdSpendEntry[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpend, setEditingSpend] = useState<AdSpendEntry | null>(null);

  // Filters
  const [filterResellerId, setFilterResellerId] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form State
  const [resellerId, setResellerId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [platform, setPlatform] = useState<'Facebook / Meta Ads' | 'Google Ads' | 'TikTok Ads' | 'YouTube Ads' | 'Other'>('Facebook / Meta Ads');
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resellersData, spendsData] = await Promise.all([
        api.getAdminResellers(),
        api.getAdminAdSpends({
          resellerId: filterResellerId !== 'all' ? filterResellerId : undefined,
          platform: filterPlatform !== 'all' ? filterPlatform : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      setResellers(resellersData);
      setSpends(spendsData);
      if (resellersData.length > 0 && !resellerId) {
        setResellerId(resellersData[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load ad spend data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterResellerId, filterPlatform, startDate, endDate]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingSpend(null);
    if (resellers.length > 0) setResellerId(resellers[0].id);
    setDate(new Date().toISOString().slice(0, 10));
    setPlatform('Facebook / Meta Ads');
    setAmount('');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: AdSpendEntry) => {
    setEditingSpend(s);
    setResellerId(s.resellerId);
    setDate(s.date);
    setPlatform(s.platform);
    setAmount(s.amount);
    setNotes(s.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellerId) {
      setFormError('Please select a reseller.');
      return;
    }
    if (amount === '' || Number(amount) < 0) {
      setFormError('Please enter a valid ad expenditure amount.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const selectedReseller = resellers.find((r) => r.id === resellerId);

    try {
      if (editingSpend) {
        await api.updateAdSpend(editingSpend.id, {
          resellerId,
          resellerName: selectedReseller?.name || 'Reseller',
          date,
          platform,
          amount: Number(amount),
          notes: notes.trim(),
        });
        showToast('Ad spend entry updated successfully!');
      } else {
        await api.createAdSpend({
          resellerId,
          resellerName: selectedReseller?.name || 'Reseller',
          date,
          platform,
          amount: Number(amount),
          notes: notes.trim(),
        });
        showToast('Ad spend entry recorded successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save ad spend entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ad spend entry? This will permanently delete it from Firebase.')) return;
    try {
      setSpends((prev) => prev.filter((s) => s.id !== id));
      await api.deleteAdSpend(id);
      showToast('Ad spend record deleted permanently.');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry from Firebase.');
      await fetchData();
    }
  };

  const totalAdSpendSum = spends.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Separate Daily Ad Spend Tracker</h2>
              <p className="text-xs text-slate-500">
                Log Facebook/Google/TikTok ad expenditures per reseller separately from fixed product costs.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Ad Spend</span>
        </button>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Total Filtered Ad Spend</span>
          <span className="text-2xl font-bold text-purple-700 font-mono mt-1 block">
            ৳{totalAdSpendSum.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Across {spends.length} ad campaign entries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Top Ad Platform</span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">Facebook / Meta Ads</span>
          <span className="text-xs text-slate-400 mt-1 block">Primary acquisition channel</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Profit Deduction Impact</span>
          <span className="text-xs text-slate-600 mt-1 block">
            Deducted cleanly from order profits to derive <strong>Estimated Profit</strong> without doubling product or delivery deductions.
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filters:</span>
        </div>

        <select
          value={filterResellerId}
          onChange={(e) => setFilterResellerId(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="all">All Resellers</option>
          {resellers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 py-1.5 px-3 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="all">All Platforms</option>
          <option value="Facebook / Meta Ads">Facebook / Meta Ads</option>
          <option value="Google Ads">Google Ads</option>
          <option value="TikTok Ads">TikTok Ads</option>
          <option value="YouTube Ads">YouTube Ads</option>
          <option value="Other">Other</option>
        </select>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
          <span>Date:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-1 px-2.5 bg-slate-50"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-1 px-2.5 bg-slate-50"
          />
        </div>
      </div>

      {/* Ad Spends Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <span className="inline-block animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mb-2" />
            <p className="text-sm">Loading ad spend records...</p>
          </div>
        ) : spends.length === 0 ? (
          <div className="py-16 text-center px-4">
            <DollarSign className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-semibold text-slate-800">No Ad Spend Records</h3>
            <p className="text-xs text-slate-500 mt-1">Record your first ad campaign expenditure to calculate net profits.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl shadow"
            >
              Record Ad Spend
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Reseller</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4 text-right">Ad Spend Amount</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {spends.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{s.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{s.resellerName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                        {s.platform}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ৳{s.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{s.notes || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1 text-slate-400 hover:text-purple-600 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSpend ? 'Edit Ad Spend Entry' : 'Record Ad Spend Entry'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reseller *</label>
                <select
                  value={resellerId}
                  onChange={(e) => setResellerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                >
                  {resellers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ad Platform *</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600"
                  >
                    <option value="Facebook / Meta Ads">Facebook / Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="YouTube Ads">YouTube Ads</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad Spend Amount (৳) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1500"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-purple-700 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Campaign Details</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Earbuds conversion ad set 2"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editingSpend ? 'Save Changes' : 'Record Ad Spend'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
