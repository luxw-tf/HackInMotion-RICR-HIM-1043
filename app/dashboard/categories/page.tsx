"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { 
  Layers, 
  Sparkles, 
  Plus, 
  Tag, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Loader2,
  Code2
} from "lucide-react";
import { categorizeTransaction } from "@/lib/categorization/rules";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live Test Sandbox
  const [testDesc, setTestDesc] = useState("Starbucks Coffee #1049");
  const [testAmt, setTestAmt] = useState("6.50");
  const [testResult, setTestResult] = useState<any>(null);

  // New Category Form
  const [isAdding, setIsAdding] = useState(false);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState("EXPENSE");
  const [isEssential, setIsEssential] = useState(false);
  const [keywordsStr, setKeywordsStr] = useState("");
  const [catColor, setCatColor] = useState("#0284c7");

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      setCategories(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Live tester reaction
  useEffect(() => {
    if (testDesc.trim()) {
      const amt = parseFloat(testAmt) || 0;
      const res = categorizeTransaction(testDesc, amt);
      setTestResult(res);
    } else {
      setTestResult(null);
    }
  }, [testDesc, testAmt]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const keywords = keywordsStr
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName.trim(),
          type: catType,
          isEssential,
          color: catColor,
          keywords,
        }),
      });

      if (res.ok) {
        setIsAdding(false);
        setCatName("");
        setKeywordsStr("");
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header onRefreshData={fetchCategories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Rule Engine & Taxonomy
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic keyword matching architecture with zero opaque external dependencies
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>{isAdding ? "Close" : "New Custom Category"}</span>
          </button>
        </div>

        {/* Live Rule Sandbox */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="flex items-center space-x-2 mb-3">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
              Deterministic Categorization Sandbox
            </h2>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Type any raw merchant string to inspect real-time pattern parsing, keyword detection, and reasoning trails.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-8">
              <input
                type="text"
                value={testDesc}
                onChange={(e) => setTestDesc(e.target.value)}
                placeholder="e.g. POS DEBIT WHOLE FOODS #1042 US"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="number"
                value={testAmt}
                onChange={(e) => setTestAmt(e.target.value)}
                placeholder="Amount (₹)"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

          </div>

          {testResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Matched Category</span>
                <span className="font-bold text-slate-900 text-sm font-display">{testResult.categoryName}</span>
                <span className="text-[10px] text-slate-500 block">({testResult.type})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Normalized Merchant</span>
                <span className="font-semibold text-slate-800 text-xs">{testResult.cleanedMerchant}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reasoning Trail</span>
                <span className="text-xs text-emerald-800 font-medium">{testResult.reasoning}</span>
              </div>
            </div>
          )}
        </div>

        {/* Custom Category Creation Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateCategory}
            className="glass-card p-6 rounded-2xl border border-slate-300 shadow-card space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 font-display">Create Custom Category</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Pet Care, Education"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                  <option value="SAVINGS">Savings</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Color Tag
                </label>
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="w-full h-9 p-1 bg-white border border-slate-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={keywordsStr}
                onChange={(e) => setKeywordsStr(e.target.value)}
                placeholder="petco, chewy, vet, dog food, rover"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Transactions containing these keywords will automatically map to this category.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="catEssential"
                type="checkbox"
                checked={isEssential}
                onChange={(e) => setIsEssential(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="catEssential" className="text-xs text-slate-700 font-medium">
                Mark as Essential Living Need (for 50/30/20 baseline score)
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg"
              >
                Save Category
              </button>
            </div>
          </form>
        )}

        {/* Categories Grid */}
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-emerald-700 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading taxonomy...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h3 className="text-sm font-bold text-slate-900 font-display">
                        {cat.name}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.type === "INCOME" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                      {cat.type}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center space-x-2 text-xs">
                    {cat.isEssential ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200/60">
                        Essential Living Need
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        Discretionary / Flexible
                      </span>
                    )}
                    {cat.userId && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                        Custom User Rule
                      </span>
                    )}
                  </div>

                  {/* Keywords list */}
                  <div className="mt-3">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      Target Keywords ({cat.keywords?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {cat.keywords?.map((k: any) => (
                        <span
                          key={k.id}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                        >
                          {k.keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
