import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Layers,
  Terminal,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Database,
  Code,
  Activity,
  ArrowRight
} from 'lucide-react';
import { ERDiagramViewer } from './ERDiagramViewer';
import { SQLQueryLab } from './SQLQueryLab';
import { TransactionsLab } from './TransactionsLab';
import { TestRunnerLab } from './TestRunnerLab';
import { VivaPrepLab } from './VivaPrepLab';

export const ProjectRoadmapHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'roadmap' | 'er-schema' | 'sql-lab' | 'transactions' | 'test-runner' | 'viva'>('roadmap');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Academic Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-neutral-900 leading-tight">
              Academic Project Hub & 12-Week Roadmap
            </h1>
            <p className="text-[11px] text-neutral-500">
              Database Theory • Database Lab • Software Engineering Deliverables
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'roadmap'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            12-Week Roadmap
          </button>
          <button
            onClick={() => setActiveSubTab('er-schema')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'er-schema'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            ER Diagram & 3NF
          </button>
          <button
            onClick={() => setActiveSubTab('sql-lab')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'sql-lab'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            10 SQL Queries Lab
          </button>
          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'transactions'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            ACID Transactions
          </button>
          <button
            onClick={() => setActiveSubTab('test-runner')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'test-runner'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            System Tests (100%)
          </button>
          <button
            onClick={() => setActiveSubTab('viva')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'viva'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Viva Q&A Defense
          </button>
        </div>
      </div>

      {/* SUB-TABS RENDER */}
      {activeSubTab === 'er-schema' && <ERDiagramViewer />}
      {activeSubTab === 'sql-lab' && <SQLQueryLab />}
      {activeSubTab === 'transactions' && <TransactionsLab />}
      {activeSubTab === 'test-runner' && <TestRunnerLab />}
      {activeSubTab === 'viva' && <VivaPrepLab />}

      {/* ROADMAP OVERVIEW */}
      {activeSubTab === 'roadmap' && (
        <div className="space-y-4">
          {/* Project Banner */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl p-6 border border-neutral-700 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Coursework Capstone
                  </span>
                  <span className="text-neutral-400 text-xs">• 12 Weeks • 5 Checkpoints</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  🛒 E-Commerce Reseller Management System
                </h2>
                <p className="text-xs text-neutral-300 max-w-3xl mt-1 leading-relaxed">
                  A full-stack web application built from scratch covering every major concept across 
                  <strong className="text-white"> Database Theory</strong>, 
                  <strong className="text-white"> Database Lab</strong>, and 
                  <strong className="text-white"> Software Engineering</strong> simultaneously.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">MySQL / PostgreSQL</span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">Node.js / Express</span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">React 19 + TypeScript</span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">REST API</span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">ACID Transactions</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-neutral-600 bg-white p-3 rounded-xl border border-neutral-200">
            <span className="font-semibold text-neutral-800">Domain Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
              <span>Database Theory</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
              <span>Database Lab</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">SE</span>
              <span>Software Engineering</span>
            </span>
          </div>

          {/* PHASE 1 */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div
              onClick={() => togglePhase('p1')}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-neutral-50/70 border-b border-neutral-100 select-none"
            >
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                Phase 1
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Foundation & Design — Weeks 1–3
                </h3>
                <p className="text-xs text-neutral-500">
                  Requirements (SRS), ER modeling, 3NF normalization, MySQL schema DDL
                </p>
              </div>
              <div className="ml-auto text-neutral-400">
                {collapsedPhases['p1'] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>

            {!collapsedPhases['p1'] && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 1 — Requirements & SRS</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Gather system requirements for reseller order workflows and daily shifts. Prepare SRS, use cases, and DFD.
                    </p>
                    <div className="mt-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">SE</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 2 — ER Modeling</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Design the full ER model: Resellers, Orders, DailyWorks, Admins. Define cardinalities (1:N) and constraints.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 3 — Normalization & Schema</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Normalize to 3NF. Translate ER to relational MySQL DDL schema with primary keys, foreign keys, and indexes.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 uppercase text-[11px]">
                      ⚑ Checkpoint 1 — End of Week 3 (Weight: 20%)
                    </span>
                    <button
                      onClick={() => setActiveSubTab('er-schema')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>View ER & Schema Diagram</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-neutral-700 text-[11px]">
                    <strong>Submitted Deliverables:</strong> Software Requirements Specification (SRS) · Full Entity-Relationship diagram · 3NF normalized schema documentation · MySQL DDL initialization scripts.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PHASE 2 */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div
              onClick={() => togglePhase('p2')}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-neutral-50/70 border-b border-neutral-100 select-none"
            >
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
                Phase 2
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  SQL & Backend Core — Weeks 4–6
                </h3>
                <p className="text-xs text-neutral-500">
                  10 complex queries, ACID transactions with rollback, Express REST API, SE design patterns
                </p>
              </div>
              <div className="ml-auto text-neutral-400">
                {collapsedPhases['p2'] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>

            {!collapsedPhases['p2'] && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 4 — Advanced SQL Queries</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Implement 10 complex queries using multi-table JOINs, subqueries, HAVING filters, conditional aggregates, and window ranking.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 5 — Transactions & Integrity</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Implement transactional consistency (BEGIN / COMMIT / ROLLBACK) for atomic order ledger updates and stock integrity.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 6 — REST API & SE Design</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Build Express REST API with clear separation of concerns, JWT authorization middleware, and bcrypt password hashing.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">SE</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50/70 border-l-4 border-rose-500 rounded-r-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 uppercase text-[11px]">
                      ✦ Checkpoint 2 (Graded Midterm Live Demo) — End of Week 6 (Weight: 25%)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveSubTab('sql-lab')}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Run 10 Queries</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setActiveSubTab('transactions')}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Test Rollbacks</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-neutral-700 text-[11px]">
                    <strong>Live Demonstration Scope:</strong> Live execution of 10 complex benchmark SQL queries · Interactive REST API live tests · Demonstration of atomic transaction rollback on constraint failure.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PHASE 3 */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div
              onClick={() => togglePhase('p3')}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-neutral-50/70 border-b border-neutral-100 select-none"
            >
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                Phase 3
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Optimization & Advanced DB — Weeks 7–9
                </h3>
                <p className="text-xs text-neutral-500">
                  B-tree indexing, query optimization, analytics views, CSV export, relational algebra
                </p>
              </div>
              <div className="ml-auto text-neutral-400">
                {collapsedPhases['p3'] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>

            {!collapsedPhases['p3'] && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 7 — Indexing & Performance</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Add B-tree indexes on `reseller_id` and `order_date`. Reduce query execution cost from O(N) full scan to O(log N).
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 8 — Views & Aggregations</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Create materialized/virtual analytical views for dashboard KPIs, ROAS calculation, and reseller monthly summaries.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 9 — Data Export & Persistence</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Implement CSV export and JSON persistence fallback layer. Compare relational MySQL vs document/file stores.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl text-xs space-y-1">
                  <span className="font-bold text-amber-900 uppercase text-[11px]">
                    ⚑ Checkpoint 3 — End of Week 9 (Weight: 15%)
                  </span>
                  <p className="text-neutral-700 text-[11px]">
                    <strong>Submitted Deliverables:</strong> Indexing benchmarks report · SQL Analytical Views documentation · Working CSV data exporter.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PHASE 4 */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div
              onClick={() => togglePhase('p4')}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-neutral-50/70 border-b border-neutral-100 select-none"
            >
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800">
                Phase 4
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Frontend, Testing & SE Process — Weeks 10–11
                </h3>
                <p className="text-xs text-neutral-500">
                  React 19 responsive UI, automated unit & integration testing, SQL injection defense, security audit
                </p>
              </div>
              <div className="ml-auto text-neutral-400">
                {collapsedPhases['p4'] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>

            {!collapsedPhases['p4'] && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 10 — Frontend UI & SDLC</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Responsive public order entry form, daily shift logger, and full-featured Admin dashboard with Recharts visualizations.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">SE</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 11 — Testing & Security</h4>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Automated unit & integration test runner, prepared statement SQLi defense, bcrypt salt hashing, input sanitation.
                    </p>
                    <div className="mt-2.5 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">SE</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50/70 border-l-4 border-rose-500 rounded-r-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 uppercase text-[11px]">
                      ✦ Checkpoint 4 (Graded Evaluation) — End of Week 11 (Weight: 15%)
                    </span>
                    <button
                      onClick={() => setActiveSubTab('test-runner')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Run System Tests (100% Pass)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-neutral-700 text-[11px]">
                    <strong>Submitted Deliverables:</strong> Full working app (Frontend + Backend + DB) · Automated test report with 100% pass rate · Security and SQL injection audit report.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PHASE 5 */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div
              onClick={() => togglePhase('p5')}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-neutral-50/70 border-b border-neutral-100 select-none"
            >
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-300">
                Phase 5
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Final Polish & Presentation — Week 12
                </h3>
                <p className="text-xs text-neutral-500">
                  Final live demo, executive analytics dashboard, complete technical documentation & viva defense
                </p>
              </div>
              <div className="ml-auto text-neutral-400">
                {collapsedPhases['p5'] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </div>

            {!collapsedPhases['p5'] && (
              <div className="p-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                  <h4 className="text-xs font-bold text-neutral-900 mb-1">Week 12 — Final Wrap-Up, Demo & Viva</h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Finalize live demo showing end-to-end reseller order submissions, shift hours, ad spend analytics, MySQL database backend, and complete documentation.
                  </p>
                  <div className="mt-2.5 flex gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">DB</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">SE</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">LAB</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/80 border-l-4 border-emerald-600 rounded-r-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 uppercase text-[11px]">
                      ★ Final Checkpoint — End of Week 12 (Weight: 25%)
                    </span>
                    <button
                      onClick={() => setActiveSubTab('viva')}
                      className="text-emerald-800 hover:text-emerald-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Viva Defense Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-neutral-700 text-[11px]">
                    <strong>Final Evaluation:</strong> 15-minute live demo of complete system · Viva Q&A covering all 3 courses · Submission of full source code repository, documentation report, and database artifacts.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Grading Breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Academic Course Grading Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-neutral-900">20%</div>
                <div className="text-[11px] text-neutral-500 mt-0.5 leading-tight">Checkpoint 1<br />Schema + SRS</div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-neutral-900">25%</div>
                <div className="text-[11px] text-neutral-500 mt-0.5 leading-tight">Checkpoint 2<br />Midterm Demo</div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-neutral-900">15%</div>
                <div className="text-[11px] text-neutral-500 mt-0.5 leading-tight">Checkpoint 3<br />Optimization</div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-neutral-900">15%</div>
                <div className="text-[11px] text-neutral-500 mt-0.5 leading-tight">Checkpoint 4<br />Testing + UI</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-emerald-900">25%</div>
                <div className="text-[11px] text-emerald-700 mt-0.5 leading-tight">Final Checkpoint<br />Demo + Viva</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
