"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ShieldCheck, LogOut, Sparkles, RefreshCw, Plus, Upload, User as UserIcon } from "lucide-react";

interface HeaderProps {
  onOpenAddModal?: () => void;
  onOpenUploadModal?: () => void;
  onRefreshData?: () => void;
}

export function Header({ onOpenAddModal, onOpenUploadModal, onRefreshData }: HeaderProps) {
  const { data: session } = useSession();
  const [isResetting, setIsResetting] = useState(false);

  const handleSeedDemo = async () => {
    if (!confirm("Load sample realistic transaction data for your account?")) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/transactions/seed-demo", { method: "POST" });
      if (res.ok) {
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-slate-900 font-display">Clarity</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60 hidden sm:inline-block">
              Private Scoped
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleSeedDemo}
            disabled={isResetting}
            title="Populate or reset realistic sample transactions"
            className="inline-flex items-center text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 mr-1.5 text-emerald-600 ${isResetting ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Load Sample Data</span>
            <span className="md:hidden">Demo</span>
          </button>

          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
          )}

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Transaction</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* User Profile & Sign out */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-slate-800 truncate max-w-[120px]">
                {session?.user?.name || session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
