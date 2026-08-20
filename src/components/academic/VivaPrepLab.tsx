import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';

interface VivaQuestion {
  id: number;
  category: 'DB Theory' | 'DB Lab' | 'Software Engineering';
  question: string;
  answer: string;
  projectContext: string;
}

const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: 'DB Theory',
    question: 'How is this system normalized to Third Normal Form (3NF)?',
    answer: '1NF is satisfied because all columns hold atomic single values. 2NF is met because every table has a single-attribute primary key (id), eliminating partial dependencies. 3NF is achieved because there are no transitive dependencies; reseller contact details reside strictly in `resellers`, while `orders` and `daily_works` reference only the `reseller_id` foreign key.',
    projectContext: 'Tables: resellers, orders, daily_works, admins.',
  },
  {
    id: 2,
    category: 'DB Theory',
    question: 'Explain how the ACID properties are preserved when a reseller submits an order.',
    answer: 'Atomicity ensures that either the entire order record is inserted or nothing persists if an error occurs. Consistency enforces that foreign keys (reseller_id) and data constraints (positive order amounts) must be valid. Isolation (READ COMMITTED) prevents dirty reads across concurrent reseller submissions. Durability commits changes to persistent storage (MySQL InnoDB redo logs or disk JSON).',
    projectContext: 'Order submission and daily work shift logging.',
  },
  {
    id: 3,
    category: 'DB Lab',
    question: 'Why are B-Tree indexes placed on `reseller_id` and `order_date`?',
    answer: 'Without indexes, filtering orders by reseller or calculating date-range revenue requires a full table scan O(N). B-Tree indexes reduce lookup complexity to O(log N), speeding up dashboard aggregations, WHERE clauses, and JOIN operations significantly on large datasets.',
    projectContext: 'INDEX idx_reseller (reseller_id), INDEX idx_order_date (order_date).',
  },
  {
    id: 4,
    category: 'DB Lab',
    question: 'How do you prevent SQL Injection in this project?',
    answer: 'The system uses parameterized prepared statements in `mysql2/promise` (e.g., `db.query("SELECT * FROM orders WHERE reseller_id = ?", [id])`). User inputs are treated as literal values rather than executable SQL syntax, completely immunizing the database against SQL injection payloads.',
    projectContext: 'Database abstraction layer in server/db.ts.',
  },
  {
    id: 5,
    category: 'Software Engineering',
    question: 'How is separation of concerns and modularity applied in the architecture?',
    answer: 'The architecture is divided into clear layers: the Presentation Layer (React components + Tailwind), the Client API Gateway (`src/services/api.ts`), the REST Controller & Authentication Middleware (`server.ts`), and the Data Persistence Layer (`server/db.ts`). This allows seamless switching between MySQL and local persistence without rewriting UI code.',
    projectContext: 'Full-stack Express + React + TypeScript structure.',
  },
  {
    id: 6,
    category: 'Software Engineering',
    question: 'How is the Admin password protected against brute-force or database leaks?',
    answer: 'Passwords are never stored in plaintext. We utilize bcrypt with a salt work factor of 10. The salt randomizes the hash to prevent rainbow table attacks, and the one-way cryptographic hashing algorithm ensures the plaintext password cannot be derived even if the database is dumped.',
    projectContext: 'Bcrypt hashing in server/db.ts and login route.',
  },
];

export const VivaPrepLab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const filtered = selectedCategory === 'All'
    ? VIVA_QUESTIONS
    : VIVA_QUESTIONS.filter((q) => q.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Phase 5 Deliverable • Checkpoint 5 Final Viva Evaluation
            </span>
            <h2 className="text-xl font-bold text-neutral-900 mt-2">
              Academic Viva & Project Defense Guide
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Curated examination questions and answers covering Database Theory, DB Lab, and Software Engineering.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4">
          {['All', 'DB Theory', 'DB Lab', 'Software Engineering'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Q&A Accordion */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-neutral-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.category === 'DB Theory'
                          ? 'bg-blue-100 text-blue-800'
                          : item.category === 'DB Lab'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-neutral-900">{item.question}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-neutral-50/50 border-t border-neutral-100 text-xs space-y-2">
                    <div className="p-3 bg-white rounded-lg border border-neutral-200 text-neutral-800 leading-relaxed">
                      <strong className="text-emerald-700 block mb-1">Defense Answer:</strong>
                      {item.answer}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      <strong>Project Implementation: </strong> {item.projectContext}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
