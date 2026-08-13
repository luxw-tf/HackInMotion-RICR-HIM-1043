"use client";

import React from "react";
import { InsightCard } from "@/lib/analytics/healthScore";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  ArrowUpRight 
} from "lucide-react";

interface InsightFeedProps {
  insights: InsightCard[];
}

export function InsightFeed({ insights }: InsightFeedProps) {
  if (!insights || insights.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-slate-200/80 text-center py-8">
        <Sparkles className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No active advisory alerts</p>
        <p className="text-xs text-slate-500 mt-1">
          Your transactions are steady and within recommended health parameters.
        </p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />;
      case "TIP":
        return <Lightbulb className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />;
      default:
        return <Sparkles className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "border-emerald-100 bg-emerald-50/40";
      case "WARNING":
        return "border-amber-100 bg-amber-50/40";
      case "TIP":
        return "border-sky-100 bg-sky-50/40";
      default:
        return "border-slate-200 bg-slate-50/50";
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
            Advisory Insights & Patterns
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Computed live from transactions</span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border ${getBorderColor(insight.type)} transition-all hover:border-slate-300`}
          >
            <div className="flex items-start space-x-3">
              {getIcon(insight.type)}
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {insight.title}
                  </h4>
                  {insight.metric && (
                    <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded bg-white/80 border border-slate-200/60 ml-2">
                      {insight.metric}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {insight.message}
                </p>

                {insight.actionableStep && (
                  <div className="mt-2.5 flex items-center text-xs font-medium text-slate-800 bg-white/60 px-3 py-1.5 rounded-lg border border-slate-200/50">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>{insight.actionableStep}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
