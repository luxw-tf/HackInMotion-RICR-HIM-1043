"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/Header";
import { AddTransactionModal } from "@/components/dashboard/AddTransactionModal";
import { UploadStatementModal } from "@/components/dashboard/UploadStatementModal";
import { 
  Receipt, 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  Upload, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";
import { format } from "date-fns";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCategoryId !== "ALL") params.append("categoryId", selectedCategoryId);
      if (selectedType !== "ALL") params.append("type", selectedType);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const [txRes, catRes] = await Promise.all([
        fetch(`/api/transactions?${params.toString()}`),
        fetch("/api/categories"),
      ]);

      if (!txRes.ok || !catRes.ok) throw new Error("Failed to load transaction data.");

      const txJson = await txRes.json();
      const catJson = await catRes.json();

      setTransactions(txJson.data || []);
      setCategories(catJson.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId, selectedType, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onRefreshData={fetchTransactions}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Transactions & Categorization
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic rule categorization with transparent reasoning trails
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span>Import Bank CSV</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 shadow-subtle grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, description, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            >
              <option value="ALL">All Types</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="INCOME">Income Only</option>
              <option value="SAVINGS">Savings Transfers</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-card rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 text-emerald-700 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto px-4">
              <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No transactions match your query</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your filters or add a new transaction using the button above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description / Merchant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Rule Reasoning</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === "INCOME";
                    const isSavings = tx.type === "SAVINGS";

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                          {format(new Date(tx.date), "MMM d, yyyy")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{tx.description}</div>
                          {tx.merchant && tx.merchant !== tx.description && (
                            <div className="text-[11px] text-slate-500">Merchant: {tx.merchant}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.category ? (
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-slate-200/80 bg-slate-50">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tx.category.color }}
                              />
                              <span className="text-slate-800">{tx.category.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Uncategorized</span>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-[11px] text-slate-600 flex items-start space-x-1">
                            <Sparkles className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="truncate" title={tx.reasoning || "Rule-based pattern"}>
                              {tx.reasoning || "Deterministic keyword match"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-bold font-display text-sm ${
                              isIncome
                                ? "text-emerald-700"
                                : isSavings
                                ? "text-brand-700"
                                : "text-slate-900"
                            }`}
                          >
                            {isIncome ? "+" : "-"}${tx.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={deletingId === tx.id}
                            title="Delete transaction"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          >
                            {deletingId === tx.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTransactions}
        categories={categories}
      />

      <UploadStatementModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
