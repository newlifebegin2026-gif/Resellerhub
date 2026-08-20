import React, { useState } from 'react';
import { ShieldCheck, Play, RotateCcw, AlertTriangle, CheckCircle, Lock, Activity } from 'lucide-react';

export const TransactionsLab: React.FC = () => {
  const [scenario, setScenario] = useState<string>('success_order_creation');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [response, setResponse] = useState<any | null>(null);

  const handleExecuteTransaction = async (type: string) => {
    setScenario(type);
    setIsRunning(true);
    try {
      const res = await fetch('/api/academic/transaction-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: type }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Phase 2 Deliverable • Week 5 Transactions & Integrity
            </span>
            <h2 className="text-xl font-bold text-neutral-900 mt-2">
              ACID Transaction Isolation & Rollback Simulator
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Demonstrates Transaction Atomicity with BEGIN, COMMIT, and automatic ROLLBACK upon constraint failure or exceptions.
            </p>
          </div>
        </div>

        {/* Scenario Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => handleExecuteTransaction('success_order_creation')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              scenario === 'success_order_creation'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Scenario A: COMMIT</span>
            </div>
            <p className="text-[11px] text-neutral-600">
              Successful atomic multi-row order insertion and parent ledger update.
            </p>
          </button>

          <button
            onClick={() => handleExecuteTransaction('rollback_insufficient_stock')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              scenario === 'rollback_insufficient_stock'
                ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-rose-800 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Scenario B: ROLLBACK</span>
            </div>
            <p className="text-[11px] text-neutral-600">
              Constraint check fails (insufficient stock); transaction aborts and rolls back.
            </p>
          </button>

          <button
            onClick={() => handleExecuteTransaction('rollback_invalid_reseller')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              scenario === 'rollback_invalid_reseller'
                ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-amber-800 mb-1">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Scenario C: FK Violation</span>
            </div>
            <p className="text-[11px] text-neutral-600">
              Foreign key constraint check prevents orphaned rows; safe rollback triggered.
            </p>
          </button>
        </div>

        {/* Transaction Execution Terminal */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden text-neutral-200 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 text-[11px]">
            <div className="flex items-center gap-2 text-neutral-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transaction Engine Logs (Isolation: READ COMMITTED)</span>
            </div>
            {response && (
              <span
                className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  response.outcome === 'COMMITTED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {response.outcome} ({response.duration})
              </span>
            )}
          </div>

          <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
            {!response ? (
              <div className="text-neutral-500 italic">
                Click one of the scenario buttons above to run a live ACID transaction simulation.
              </div>
            ) : (
              response.logs.map((log: any) => (
                <div
                  key={log.step}
                  className={`flex items-start gap-2.5 py-1 px-2 rounded ${
                    log.status === 'ok'
                      ? 'text-emerald-300 bg-emerald-950/20'
                      : log.status === 'failed'
                      ? 'text-rose-300 bg-rose-950/40 font-semibold'
                      : 'text-amber-300 bg-amber-950/30'
                  }`}
                >
                  <span className="text-neutral-500 select-none">[{log.step}]</span>
                  <span className="flex-1">{log.action}</span>
                  <span className="text-[10px] uppercase tracking-wide opacity-80">
                    {log.status === 'ok' ? 'SUCCESS' : log.status === 'failed' ? 'FAIL' : 'ABORT'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACID Theory Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <strong className="text-neutral-900 block font-semibold">Atomicity</strong>
            <p className="text-neutral-500 text-[11px] mt-0.5">All-or-nothing execution. Partial writes never persist.</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <strong className="text-neutral-900 block font-semibold">Consistency</strong>
            <p className="text-neutral-500 text-[11px] mt-0.5">Foreign keys and schema constraints are strictly verified.</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <strong className="text-neutral-900 block font-semibold">Isolation</strong>
            <p className="text-neutral-500 text-[11px] mt-0.5">Concurrent reseller submissions operate without race conditions.</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <strong className="text-neutral-900 block font-semibold">Durability</strong>
            <p className="text-neutral-500 text-[11px] mt-0.5">Committed orders persist to disk/WAL logs permanently.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
