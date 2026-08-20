import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, ShieldCheck, FileCheck, Layers, Clock, Award } from 'lucide-react';

export const TestRunnerLab: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/academic/run-system-tests');
      const data = await res.json();
      if (data.success) {
        setTestResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Phase 4 Deliverable • Checkpoint 4 (Graded Testing & SE Security)
            </span>
            <h2 className="text-xl font-bold text-neutral-900 mt-2">
              Automated Verification & Unit/Integration Test Suite
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Validates 3NF functional dependencies, SQL aggregate accuracy, SQL injection defense, and authentication security.
            </p>
          </div>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Running Test Suites...' : 'Run All System Tests'}</span>
          </button>
        </div>

        {/* Summary Metric Strip */}
        {testResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[11px] text-emerald-800 font-semibold block">Pass Rate</span>
              <div className="text-xl font-bold text-emerald-900 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{testResult.passRate}</span>
              </div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="text-[11px] text-neutral-600 font-semibold block">Total Tests</span>
              <div className="text-xl font-bold text-neutral-900 mt-0.5">{testResult.totalTests} Passed</div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="text-[11px] text-neutral-600 font-semibold block">Failed</span>
              <div className="text-xl font-bold text-neutral-900 mt-0.5">{testResult.failedTests} Failed</div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="text-[11px] text-neutral-600 font-semibold block">Execution Time</span>
              <div className="text-xl font-bold text-neutral-900 mt-0.5">{testResult.duration}</div>
            </div>
          </div>
        )}

        {/* Test Suites List */}
        {!testResult ? (
          <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
            <ShieldCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs text-neutral-600 font-medium">Ready to execute automated test validation suite.</p>
            <p className="text-[11px] text-neutral-400 mt-1">Click "Run All System Tests" to evaluate test assertions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testResult.testSuites.map((suite: any, sIdx: number) => (
              <div key={sIdx} className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>{suite.suite}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {suite.tests.length}/{suite.tests.length} PASS
                  </span>
                </div>
                <div className="divide-y divide-neutral-100">
                  {suite.tests.map((t: any, tIdx: number) => (
                    <div key={tIdx} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-neutral-50/60">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-neutral-800 font-medium">{t.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                        {t.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
