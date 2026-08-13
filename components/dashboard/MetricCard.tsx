"use client";

import React from "react";
import { MetricBreakdown } from "@/lib/analytics/healthScore";
import { CheckCircle2, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";

interface MetricCardProps {
  breakdown: {
    savingsRate: MetricBreakdown;
    essentialRatio: MetricBreakdown;
    discretionaryRatio: MetricBreakdown;
    cashflowConsistency: MetricBreakdown;
  };
}

export function MetricCard({ breakdown }: MetricCardProps) {
  const metrics = [
    {
      key: "savingsRate",
      data: breakdown.savingsRate,
      color: "bg-emerald-600",
      lightBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      displayValue: `${breakdown.savingsRate.value}%`,
      max: 50,
      barWidth: Math.min(100, (breakdown.savingsRate.value / 25) * 100),
    },
    {
      key: "essentialRatio",
      data: breakdown.essentialRatio,
      color: breakdown.essentialRatio.value > 60 ? "bg-amber-500" : "bg-sky-600",
      lightBg: breakdown.essentialRatio.value > 60 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-sky-50 text-sky-800 border-sky-200",
      displayValue: `${breakdown.essentialRatio.value}%`,
      max: 100,
      barWidth: Math.min(100, breakdown.essentialRatio.value),
    },
    {
      key: "discretionaryRatio",
      data: breakdown.discretionaryRatio,
      color: breakdown.discretionaryRatio.value > 40 ? "bg-rose-500" : "bg-purple-600",
      lightBg: breakdown.discretionaryRatio.value > 40 ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-purple-50 text-purple-800 border-purple-200",
      displayValue: `${breakdown.discretionaryRatio.value}%`,
      max: 100,
      barWidth: Math.min(100, breakdown.discretionaryRatio.value),
    },
    {
      key: "cashflowConsistency",
      data: breakdown.cashflowConsistency,
      color: breakdown.cashflowConsistency.value >= 0 ? "bg-emerald-600" : "bg-rose-600",
      lightBg: breakdown.cashflowConsistency.value >= 0 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200",
      displayValue: `₹${breakdown.cashflowConsistency.value.toLocaleString("en-IN")}`,
      max: 100,
      barWidth: Math.min(100, breakdown.cashflowConsistency.score),
    },

  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const item = m.data;
        return (
          <div
            key={m.key}
            className="glass-card p-4 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {item.label}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.lightBg}`}>
                  {item.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-display text-slate-900">
                  {m.displayValue}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Goal: {item.target}
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${m.color}`}
                  style={{ width: `${Math.max(4, m.barWidth)}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-normal">
              {item.explanation}
            </p>
          </div>
        );
      })}
    </div>
  );
}
