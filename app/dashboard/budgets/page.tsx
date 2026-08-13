"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { 
  Target, 
  Plus, 
  PiggyBank, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

export default function BudgetsGoalsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New budget form state
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [budgetCatId, setBudgetCatId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  // New goal form state
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalCategory, setGoalCategory] = useState("EMERGENCY_FUND");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [budgetsRes, goalsRes, catRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/goals"),
        fetch("/api/categories"),
      ]);

      const bJson = await budgetsRes.json();
      const gJson = await goalsRes.json();
      const cJson = await catRes.json();

      setBudgets(bJson.data || []);
      setGoals(gJson.data || []);
      setCategories(cJson.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(budgetAmount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: budgetCatId || undefined,
          amount: numAmt,
        }),
      });

      if (res.ok) {
        setIsAddingBudget(false);
        setBudgetAmount("");
        setBudgetCatId("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(goalTarget);
    const numCurrent = parseFloat(goalCurrent) || 0;
    if (!goalName.trim() || isNaN(numTarget) || numTarget <= 0) return;

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: goalName.trim(),
          targetAmount: numTarget,
          currentAmount: numCurrent,
          categoryType: goalCategory,
        }),
      });

      if (res.ok) {
        setIsAddingGoal(false);
        setGoalName("");
        setGoalTarget("");
        setGoalCurrent("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header onRefreshData={fetchData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Budgets & Financial Targets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calm, intentional tracking of monthly spending caps and emergency reserve milestones
          </p>
        </div>

        {/* Section 1: Monthly Category Budgets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Monthly Spending Budgets
              </h2>
              <p className="text-xs text-slate-500">
                Track actual real-time spending against your monthly thresholds
              </p>
            </div>
            <button
              onClick={() => setIsAddingBudget(!isAddingBudget)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{isAddingBudget ? "Close" : "Set Category Budget"}</span>
            </button>
          </div>

          {/* New Budget Inline Form */}
          {isAddingBudget && (
            <form
              onSubmit={handleSaveBudget}
              className="glass-card p-4 rounded-2xl border border-slate-300 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  required
                  value={budgetCatId}
                  onChange={(e) => setBudgetCatId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition"
                >
                  Save Budget
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingBudget(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Budgets Grid */}
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-emerald-700 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading budget records...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="glass-card p-6 rounded-2xl border border-slate-200/80 text-center py-8">
              <DollarSign className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Monthly Budgets Set</p>
              <p className="text-xs text-slate-500 mt-1">
                Define spending caps for categories like Food, Dining, or Entertainment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((b) => (
                <div
                  key={b.id}
                  className="glass-card p-4 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">
                        {b.category?.name || "Total Spending"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          b.isOverBudget
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {b.isOverBudget ? "Over Budget" : "On Track"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xl font-bold font-display text-slate-900">
                        ₹{b.spent.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Cap: ₹{b.amount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.isOverBudget ? "bg-rose-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                    <span>{b.percentUsed}% consumed</span>
                    <span className={b.remaining < 0 ? "text-rose-600 font-semibold" : "text-emerald-700 font-medium"}>
                      {b.remaining < 0
                        ? `₹${Math.abs(b.remaining).toLocaleString("en-IN")} over limit`
                        : `₹${b.remaining.toLocaleString("en-IN")} remaining`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Long-term Goals & Emergency Fund Cushion */}
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Financial Milestones & Reserves
              </h2>
              <p className="text-xs text-slate-500">
                Track progress towards emergency runway cushions, retirement, and major milestones
              </p>
            </div>
            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{isAddingGoal ? "Close" : "New Financial Goal"}</span>
            </button>
          </div>

          {/* New Goal Inline Form */}
          {isAddingGoal && (
            <form
              onSubmit={handleSaveGoal}
              className="glass-card p-4 rounded-2xl border border-slate-300 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. 6-Month Emergency Fund"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="300000"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Current Saved (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={goalCurrent}
                  onChange={(e) => setGoalCurrent(e.target.value)}
                  placeholder="150000"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="glass-card p-6 rounded-2xl border border-slate-200/80 text-center py-8">
              <PiggyBank className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Financial Goals Created Yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Establish an emergency cushion or savings milestone to track runway health.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((g) => (
                <div
                  key={g.id}
                  className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <PiggyBank className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-slate-900 font-display">
                          {g.name}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {g.progressPercent}% achieved
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-bold font-display text-slate-900">
                          ₹{g.currentAmount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 font-medium ml-1.5">
                          of ₹{g.targetAmount.toLocaleString("en-IN")} target
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        ₹{g.remaining.toLocaleString("en-IN")} to go
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                        style={{ width: `${g.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      Status: {g.status}
                    </span>
                    <button
                      onClick={async () => {
                        const newAmt = prompt("Enter updated current amount saved (₹):", String(g.currentAmount));
                        if (newAmt !== null) {
                          const parsed = parseFloat(newAmt);
                          if (!isNaN(parsed) && parsed >= 0) {
                            await fetch("/api/goals", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: g.id, currentAmount: parsed }),
                            });
                            fetchData();
                          }
                        }
                      }}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Update Balance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
