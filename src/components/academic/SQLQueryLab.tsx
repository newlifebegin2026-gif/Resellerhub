import React, { useState, useEffect } from 'react';
import { Play, Database, Terminal, CheckCircle2, Clock, Copy, Check } from 'lucide-react';

interface SQLBenchmarkQuery {
  id: number;
  title: string;
  category: string;
  description: string;
  sql: string;
  explanation: string;
}

export const SQLQueryLab: React.FC = () => {
  const [queries, setQueries] = useState<SQLBenchmarkQuery[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<{
    executionTimeMs: string;
    rowCount: number;
    rows: any[];
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/academic/sql-queries')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQueries(data.queries);
        }
      })
      .catch(() => {});
  }, []);

  const handleRunQuery = async (id: number) => {
    setIsRunning(true);
    try {
      const res = await fetch(`/api/academic/run-query/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResult({
          executionTimeMs: data.executionTimeMs,
          rowCount: data.rowCount,
          rows: data.rows,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const selectedQuery = queries.find((q) => q.id === selectedQueryId) || queries[0];

  const handleCopySQL = () => {
    if (!selectedQuery) return;
    navigator.clipboard.writeText(selectedQuery.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Phase 2 Deliverable • Checkpoint 2 (Graded Midterm Live Demo)
            </span>
            <h2 className="text-xl font-bold text-neutral-900 mt-2">
              Advanced SQL Query Execution Lab (10 Live Benchmark Queries)
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Demonstrates complex multi-table JOINs, subqueries, HAVING filters, conditional aggregates, and window ranking functions.
            </p>
          </div>
          <button
            onClick={() => handleRunQuery(selectedQueryId)}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Executing SQL...' : 'Run Query Live'}</span>
          </button>
        </div>

        {/* Query Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-100 scrollbar-thin">
          {queries.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setSelectedQueryId(q.id);
                setResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedQueryId === q.id
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Q{q.id}: {q.category}
            </button>
          ))}
        </div>

        {selectedQuery && (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-bold text-neutral-900">
                  #{selectedQuery.id}. {selectedQuery.title}
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  {selectedQuery.category}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mb-2">{selectedQuery.description}</p>
              <div className="text-[11px] text-neutral-500 bg-white p-2.5 rounded-lg border border-neutral-200/70">
                <strong className="text-neutral-700">DB Theory Rationale: </strong>
                {selectedQuery.explanation}
              </div>
            </div>

            {/* SQL Code Block */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 text-neutral-100 font-mono text-xs">
              <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-950 border-b border-neutral-800 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  SQL Statement (MySQL 8.0+ / PostgreSQL Compatible)
                </span>
                <button
                  onClick={handleCopySQL}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-emerald-300 leading-relaxed selection:bg-neutral-700">
                {selectedQuery.sql}
              </pre>
            </div>

            {/* Live Result Table */}
            {result && (
              <div className="mt-4 border border-neutral-200 rounded-xl overflow-hidden bg-white">
                <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-neutral-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Query Output Result ({result.rowCount} rows returned)</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    <Clock className="w-3 h-3" />
                    Latency: {result.executionTimeMs}
                  </span>
                </div>

                {result.rows.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-400">
                    No rows matched the criteria for this dataset query.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-64 scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-700 font-semibold uppercase text-[10px]">
                          {Object.keys(result.rows[0]).map((key) => (
                            <th key={key} className="px-3.5 py-2.5 font-mono">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                        {result.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            {Object.values(row).map((val: any, vIdx) => (
                              <td key={vIdx} className="px-3.5 py-2 text-neutral-800 whitespace-nowrap">
                                {typeof val === 'number' ? val.toLocaleString() : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
