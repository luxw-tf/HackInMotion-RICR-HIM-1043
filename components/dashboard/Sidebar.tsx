"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  ShieldCheck, 
  Layers
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Health & Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "Transactions & Import",
      href: "/dashboard/transactions",
      icon: Receipt,
      active: pathname.startsWith("/dashboard/transactions"),
    },
    {
      name: "Budgets & Goals",
      href: "/dashboard/budgets",
      icon: Target,
      active: pathname.startsWith("/dashboard/budgets"),
    },
    {
      name: "Rule Engine & Taxonomy",
      href: "/dashboard/categories",
      icon: Layers,
      active: pathname.startsWith("/dashboard/categories"),
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex-shrink-0 flex flex-col justify-between p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Financial Advisory
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                item.active
                  ? "bg-slate-900 text-white shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${item.active ? "text-emerald-400" : "text-slate-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Advisory Trust note in sidebar footer */}
      <div className="mt-8 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs leading-relaxed">
        <div className="flex items-center space-x-2 font-semibold text-slate-800 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Deterministic Audit</span>
        </div>
        <p className="text-[11px] text-slate-500">
          All health scores & categorized items are computed on-demand directly from your database records.
        </p>
      </div>
    </aside>
  );
}
