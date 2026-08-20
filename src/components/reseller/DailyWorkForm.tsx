import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Phone,
  UserCheck,
} from 'lucide-react';
import { Reseller, DailyWork, ResellerSession } from '../../types';
import { api } from '../../services/api';

interface DailyWorkFormProps {
  onWorkLogged?: (work: DailyWork) => void;
  currentResellerSession?: ResellerSession | null;
}

export const DailyWorkForm: React.FC<DailyWorkFormProps> = ({
  onWorkLogged,
  currentResellerSession,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedWork, setSubmittedWork] = useState<DailyWork | null>(null);

  // Form Fields
  const [phoneNumber, setPhoneNumber] = useState(currentResellerSession?.phone || '');
  const [resellerName, setResellerName] = useState(currentResellerSession?.name || '');
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('18:30');
  const [ordersGenerated, setOrdersGenerated] = useState<string>('0');
  const [adSpend, setAdSpend] = useState<string>('0');
  const [notes, setNotes] = useState('');

  // Auto-calculated working hours
  const [calculatedHours, setCalculatedHours] = useState<number>(0);

  useEffect(() => {
    if (currentResellerSession) {
      if (currentResellerSession.phone) setPhoneNumber(currentResellerSession.phone);
      if (currentResellerSession.name) setResellerName(currentResellerSession.name);
    }
  }, [currentResellerSession]);

  useEffect(() => {
    if (startTime && endTime) {
      const [sH, sM] = startTime.split(':').map(Number);
      const [eH, eM] = endTime.split(':').map(Number);
      if (!isNaN(sH) && !isNaN(sM) && !isNaN(eH) && !isNaN(eM)) {
        let startMin = sH * 60 + sM;
        let endMin = eH * 60 + eM;
        if (endMin < startMin) {
          endMin += 24 * 60; // overnight shift
        }
        const diff = (endMin - startMin) / 60;
        setCalculatedHours(Math.max(0, Math.round(diff * 100) / 100));
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone || trimmedPhone.length < 8) {
      setErrorMessage('Please enter a valid phone number for Your Number.');
      return;
    }
    if (!workDate) {
      setErrorMessage('Please select the work date.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('Please provide both shift start time and end time.');
      return;
    }

    const parsedOrders = parseInt(ordersGenerated) || 0;
    const parsedAdSpend = parseFloat(adSpend) || 0;

    const activeResellerId = currentResellerSession?.id || trimmedPhone;
    const activeResellerName = currentResellerSession?.name || (resellerName.trim() || `Reseller (${trimmedPhone})`);

    try {
      setSubmitting(true);
      const res = await api.submitDailyWork({
        resellerId: activeResellerId,
        resellerName: activeResellerName,
        workDate,
        startTime,
        endTime,
        ordersGenerated: parsedOrders,
        adSpend: parsedAdSpend,
        notes: notes.trim(),
      });

      setSubmittedWork(res.dailyWork);
      if (onWorkLogged) {
        onWorkLogged(res.dailyWork);
      }

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit daily work log.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedWork(null);
    setOrdersGenerated('0');
    setAdSpend('0');
    setNotes('');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Reseller Portal • Daily Shift & Performance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daily Work & Ad Spend Entry
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
          Log your daily duty hours, orders generated, and advertising budget by entering your registered number.
        </p>
      </div>

      {submittedWork ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl shadow-slate-100 p-6 sm:p-8 animate-fade-in">
          <div className="flex items-center gap-3 text-emerald-600 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Work Log Submitted!</h2>
              <p className="text-xs text-slate-500">
                Reseller: <strong className="text-indigo-600 font-semibold">{submittedWork.resellerName}</strong> • Record ID: <span className="font-mono">{submittedWork.id}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
              <span className="text-xs text-slate-500 block">Date</span>
              <span className="font-bold text-slate-900 text-sm">{submittedWork.workDate}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
              <span className="text-xs text-slate-500 block">Shift Hours</span>
              <span className="font-bold text-emerald-600 text-sm">{submittedWork.totalHours} hrs</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
              <span className="text-xs text-slate-500 block">Orders Generated</span>
              <span className="font-bold text-slate-900 text-sm">{submittedWork.ordersGenerated}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
              <span className="text-xs text-slate-500 block">Ad Spend</span>
              <span className="font-bold text-indigo-600 text-sm">৳{submittedWork.adSpend.toLocaleString()}</span>
            </div>
          </div>

          {submittedWork.notes && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 mb-6">
              <span className="font-semibold text-slate-900 block mb-1">Notes / Campaign Summary:</span>
              <p>{submittedWork.notes}</p>
            </div>
          )}

          <button
            id="btn-log-another-day"
            type="button"
            onClick={resetForm}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition cursor-pointer"
          >
            Submit Another Shift Entry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Check Input</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* 1. Reseller Identification */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reseller-phone-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Your Mobile Number <span className="text-red-500">*</span>
                </label>
                {currentResellerSession && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    Account: {currentResellerSession.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reseller-phone-input"
                    type="tel"
                    required
                    placeholder="Your Phone Number (e.g. 01711223344)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
                {!currentResellerSession && (
                  <input
                    id="reseller-name-input"
                    type="text"
                    placeholder="Your Reseller Name (optional)"
                    value={resellerName}
                    onChange={(e) => setResellerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                  />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your mobile number to bind this work log to your private reseller account.
              </p>
            </div>

            {/* 2. Date and Time Shift */}
            <div className="border-t border-slate-100 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label htmlFor="work-date" className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="work-date"
                    type="date"
                    required
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label htmlFor="start-time" className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label htmlFor="end-time" className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Shift Duration Badge */}
              <div className="mt-3 flex items-center justify-between px-3.5 py-2 bg-indigo-50/70 border border-indigo-200/70 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-800">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Calculated Shift Duration:</span>
                </div>
                <span className="text-xs font-bold text-indigo-700 font-mono">
                  {calculatedHours} Hours
                </span>
              </div>
            </div>

            {/* 3. Performance Metrics (Orders & Ad Spend) */}
            <div className="border-t border-slate-100 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orders-generated" className="block text-xs font-semibold text-slate-700 mb-1">
                    Orders Generated Today <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="orders-generated"
                      type="number"
                      min={0}
                      required
                      placeholder="0"
                      value={ordersGenerated}
                      onChange={(e) => setOrdersGenerated(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <Package className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Total customer orders generated during this shift</p>
                </div>

                <div>
                  <label htmlFor="ad-spend" className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Ad Spend Today (৳ BDT) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold">৳</span>
                    <input
                      id="ad-spend"
                      type="number"
                      min={0}
                      step="any"
                      required
                      placeholder="0"
                      value={adSpend}
                      onChange={(e) => setAdSpend(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Facebook/TikTok ads or campaign budget spent</p>
                </div>
              </div>
            </div>

            {/* 4. Notes & Summary */}
            <div className="border-t border-slate-100 pt-5">
              <label htmlFor="work-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Work Notes / Campaigns Run
              </label>
              <textarea
                id="work-notes"
                rows={2}
                placeholder="e.g. Ran video ad campaign on Messenger; tested 2 new creative angles."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                id="btn-submit-daily-work"
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition disabled:opacity-50 cursor-pointer"
              >
                <TrendingUp className="w-5 h-5" />
                <span>{submitting ? 'Saving Daily Log...' : 'Submit Daily Work Entry'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
