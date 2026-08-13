"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { ScoreGauge } from "@/components/dashboard/ScoreGauge";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { InsightFeed } from "@/components/dashboard/InsightFeed";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecurringSubs } from "@/components/dashboard/RecurringSubs";
import { AddTransactionModal } from "@/components/dashboard/AddTransactionModal";
import { UploadStatementModal } from "@/components/dashboard/UploadStatementModal";
import { HealthScoreResult } from "@/lib/analytics/healthScore";
import { 
  Sparkles, 
  Upload, 
  Plus, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [healthData, setHealthData] = useState<HealthScoreResult | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [healthRes, catRes] = await Promise.all([
        fetch("/api/health-score"),
        fetch("/api/categories"),
      ]);

      if (!healthRes.ok || !catRes.ok) {
        throw new Error("Failed to load financial health analytics.");
      }

      const healthJson = await healthRes.json();
      const catJson = await catRes.json();

      setHealthData(healthJson.data);
      setTransactionCount(healthJson.transactionCount || 0);
      setCategories(catJson.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onRefreshData={fetchData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Loading State */}
        {isLoading && !healthData && (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Computing financial health model...</p>
            <p className="text-xs text-slate-400">Analyzing transactions and pattern baselines</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State (0 transactions) */}
        {!isLoading && healthData && transactionCount === 0 && (
          <div className="glass-card p-8 sm:p-12 rounded-3xl border border-slate-200 text-center max-w-2xl mx-auto my-8 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-subtle">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Ready to analyze your financial health
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              We need transaction data to compute your health score, savings rate, 50/30/20 balance, and subscription patterns.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={async () => {
                  await fetch("/api/transactions/seed-demo", { method: "POST" });
                  fetchData();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Load Sample Realistic Data</span>
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-sm transition"
              >
                <Upload className="w-4 h-4 mr-1.5 text-slate-500" />
                <span>Import Bank Statement (CSV)</span>
              </button>
            </div>
          </div>
        )}

        {/* Populated Dashboard Content */}
        {!isLoading && healthData && transactionCount > 0 && (
          <>
            {/* Top Grid: Health Score Gauge + Advisory Insights Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <ScoreGauge data={healthData} />
              </div>
              <div className="lg:col-span-7">
                <InsightFeed insights={healthData.insights} />
              </div>
            </div>

            {/* 50/30/20 & Cashflow Metric Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  50/30/20 Balance & Cash Flow Metrics
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {transactionCount} transactions analyzed
                </span>
              </div>
              <MetricCard breakdown={healthData.breakdown} />
            </div>

            {/* Categorized Spending Donut & Breakdown */}
            <CategoryBreakdown categories={healthData.categoryTotals} />

            {/* Recurring Subscriptions & Overhead */}
            <RecurringSubs subscriptions={healthData.recurringSubscriptions} />
          </>
        )}
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
        categories={categories}
      />

      {/* Upload Statement Modal */}
      <UploadStatementModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
