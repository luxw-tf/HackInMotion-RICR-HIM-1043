"use client";

import React from "react";
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { HealthScoreResult } from "@/lib/analytics/healthScore";

interface ScoreGaugeProps {
  data: HealthScoreResult;
}

export function ScoreGauge({ data }: ScoreGaugeProps) {
  const score = data.overallScore;

  // Arc calculation for SVG gauge (180-degree semi-circle)
  const radius = 80;
  const strokeWidth = 14;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Color mapping based on score
  let scoreColor = "#059669"; // Emerald
  let tierBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (score < 40) {
    scoreColor = "#e11d48"; // Rose
    tierBg = "bg-rose-50 text-rose-800 border-rose-200";
  } else if (score < 60) {
    scoreColor = "#d97706"; // Amber
    tierBg = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (score < 80) {
    scoreColor = "#0284c7"; // Sky blue
    tierBg = "bg-sky-50 text-sky-800 border-sky-200";
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Financial Health Score
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tierBg}`}>
            {data.tier}
          </span>
        </div>

        {/* Gauge Semi-Circle */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <svg className="w-56 h-32 overflow-visible" viewBox="0 0 200 110">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Value Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Score Text */}
          <div className="absolute top-12 flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-bold font-display text-slate-900 tracking-tight">
              {score}
            </span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
              out of 100
            </span>
          </div>
        </div>

        <div className="text-center mt-1">
          <h3 className="text-base font-semibold text-slate-900 font-display">
            {data.headline}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-sm mx-auto">
            {data.summary}
          </p>
        </div>
      </div>

      {/* Quick summary strip */}
      <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Income/Mo</span>
          <span className="font-semibold text-slate-800 text-xs sm:text-sm">
            ₹{data.monthlyIncome.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Expenses/Mo</span>
          <span className="font-semibold text-slate-800 text-xs sm:text-sm">
            ₹{data.monthlyExpenses.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Reserve Runway</span>
          <span className="font-semibold text-emerald-700 text-xs sm:text-sm">
            {data.bufferMonths} mo
          </span>
        </div>
      </div>

    </div>
  );
}
