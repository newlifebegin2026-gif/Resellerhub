import React from 'react';
import { Database, Key, Link as LinkIcon, Shield, Layers, FileText } from 'lucide-react';

export const ERDiagramViewer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Phase 1 Deliverable • 3NF Normalization
            </span>
            <h2 className="text-xl font-bold text-neutral-900 mt-2">
              Entity-Relationship (ER) Diagram & Relational Schema
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Fully normalized relational design in Third Normal Form (3NF). Cardinalities: Resellers (1) to Orders (N), Resellers (1) to DailyWorks (N).
            </p>
          </div>
        </div>

        {/* Visual Entity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Entity: RESELLERS */}
          <div className="border border-purple-200 rounded-xl overflow-hidden shadow-xs bg-purple-50/30">
            <div className="bg-purple-700 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Database className="w-4 h-4" />
                <span>RESELLERS</span>
              </div>
              <span className="text-[10px] bg-purple-900/60 px-1.5 py-0.5 rounded">Primary Entity</span>
            </div>
            <div className="p-3 text-xs font-mono space-y-1.5 bg-white">
              <div className="flex items-center justify-between text-purple-900 font-bold border-b border-neutral-100 pb-1">
                <span className="flex items-center gap-1"><Key className="w-3 h-3 text-amber-500" /> id (PK)</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(50)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>name</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(150) NOT NULL</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>phone</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(50)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>email</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(150)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>status</span>
                <span className="text-[10px] text-neutral-400">ENUM('active', 'inactive')</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>joined_date</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(20)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>notes</span>
                <span className="text-[10px] text-neutral-400">TEXT</span>
              </div>
            </div>
          </div>

          {/* Entity: ORDERS */}
          <div className="border border-emerald-200 rounded-xl overflow-hidden shadow-xs bg-emerald-50/30">
            <div className="bg-emerald-700 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Database className="w-4 h-4" />
                <span>ORDERS</span>
              </div>
              <span className="text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded">Child Entity (1:N)</span>
            </div>
            <div className="p-3 text-xs font-mono space-y-1.5 bg-white">
              <div className="flex items-center justify-between text-emerald-900 font-bold border-b border-neutral-100 pb-1">
                <span className="flex items-center gap-1"><Key className="w-3 h-3 text-amber-500" /> id (PK)</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(50)</span>
              </div>
              <div className="flex items-center justify-between text-blue-700 font-semibold">
                <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3 text-blue-500" /> reseller_id (FK)</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(50)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>customer_name</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(150)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>customer_phone</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(50)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>customer_address</span>
                <span className="text-[10px] text-neutral-400">TEXT</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>district, thana</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(100)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>product_details</span>
                <span className="text-[10px] text-neutral-400">TEXT</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>quantity</span>
                <span className="text-[10px] text-neutral-400">INT DEFAULT 1</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>order_amount</span>
                <span className="text-[10px] text-neutral-400">DECIMAL(10,2)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>status</span>
                <span className="text-[10px] text-neutral-400">ENUM(...)</span>
              </div>
            </div>
          </div>

          {/* Entity: DAILY_WORKS */}
          <div className="border border-amber-200 rounded-xl overflow-hidden shadow-xs bg-amber-50/30">
            <div className="bg-amber-700 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Database className="w-4 h-4" />
                <span>DAILY_WORKS</span>
              </div>
              <span className="text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded">Performance (1:N)</span>
            </div>
            <div className="p-3 text-xs font-mono space-y-1.5 bg-white">
              <div className="flex items-center justify-between text-amber-900 font-bold border-b border-neutral-100 pb-1">
                <span className="flex items-center gap-1"><Key className="w-3 h-3 text-amber-500" /> id (PK)</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(50)</span>
              </div>
              <div className="flex items-center justify-between text-blue-700 font-semibold">
                <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3 text-blue-500" /> reseller_id (FK)</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(50)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>work_date</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(20)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>start_time, end_time</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(10)</span>
              </div>
              <div className="flex items-center justify-between text-amber-700 font-bold">
                <span>total_hours</span>
                <span className="text-[10px] text-neutral-400">DECIMAL(5,2)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>orders_generated</span>
                <span className="text-[10px] text-neutral-400">INT DEFAULT 0</span>
              </div>
              <div className="flex items-center justify-between text-rose-700 font-bold">
                <span>ad_spend</span>
                <span className="text-[10px] text-neutral-400">DECIMAL(10,2)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>notes</span>
                <span className="text-[10px] text-neutral-400">TEXT</span>
              </div>
            </div>
          </div>

          {/* Entity: ADMINS */}
          <div className="border border-neutral-300 rounded-xl overflow-hidden shadow-xs bg-neutral-50/50">
            <div className="bg-neutral-800 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>ADMINS</span>
              </div>
              <span className="text-[10px] bg-neutral-700 px-1.5 py-0.5 rounded">Security Role</span>
            </div>
            <div className="p-3 text-xs font-mono space-y-1.5 bg-white">
              <div className="flex items-center justify-between text-neutral-900 font-bold border-b border-neutral-100 pb-1">
                <span className="flex items-center gap-1"><Key className="w-3 h-3 text-amber-500" /> id (PK)</span>
                <span className="text-[10px] text-neutral-400">INT AUTO_INC</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>username (UNIQUE)</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(100)</span>
              </div>
              <div className="flex items-center justify-between text-rose-600 font-semibold">
                <span>password_hash</span>
                <span className="text-[10px] text-neutral-400">VARCHAR(255)</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>created_at</span>
                <span className="text-[10px] text-neutral-400">TIMESTAMP</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3NF Proof & Normalization Explanation */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-3">
          <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Third Normal Form (3NF) Normalization Verification</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg border border-neutral-200">
              <strong className="text-neutral-900 block mb-1">1NF Satisfied</strong>
              <p className="text-neutral-600">Every column holds strictly atomic values (no repeating groups, multi-valued attributes, or comma-separated lists).</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-neutral-200">
              <strong className="text-neutral-900 block mb-1">2NF Satisfied</strong>
              <p className="text-neutral-600">Tables are in 1NF and every non-key attribute is fully functionally dependent on the entire Primary Key.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-neutral-200">
              <strong className="text-neutral-900 block mb-1">3NF Satisfied</strong>
              <p className="text-neutral-600">Zero transitive functional dependencies. Reseller name/contact details are not duplicated into independent transaction logs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
