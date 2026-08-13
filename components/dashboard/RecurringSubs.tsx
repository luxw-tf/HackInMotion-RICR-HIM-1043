"use client";

import React from "react";
import { RefreshCw, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

interface SubItem {
  merchant: string;
  amount: number;
  frequency: string;
  category: string;
}

interface RecurringSubsProps {
  subscriptions: SubItem[];
}

export function RecurringSubs({ subscriptions }: RecurringSubsProps) {
  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }

  const totalMonthlyCommitment = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
            Detected Subscriptions & Fixed Costs
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Monthly Overhead</span>
          <span className="text-sm font-bold text-slate-900 font-display">
            ~₹{Math.round(totalMonthlyCommitment).toLocaleString("en-IN")}/mo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subscriptions.map((sub, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
                {sub.merchant}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-[10px] text-slate-500">{sub.category}</span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-purple-700 font-medium">{sub.frequency}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 font-display">
                ₹{sub.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
