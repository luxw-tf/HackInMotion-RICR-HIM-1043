"use client";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieIcon, Tag, ShieldAlert, Check } from "lucide-react";

interface CategoryTotal {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  isEssential: boolean;
}

interface CategoryBreakdownProps {
  categories: CategoryTotal[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (!categories || categories.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-slate-200/80 text-center py-12">
        <PieIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No Category Breakdown Yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Add or import transactions to view automated spending distributions.
        </p>
      </div>
    );
  }

  const chartData = categories.map((c) => ({
    name: c.name,
    value: c.amount,
    color: c.color,
  }));

  const totalExpense = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
            Categorized Spending
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Automated rule-based breakdown</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Total Outflow</span>
          <span className="text-base font-bold text-slate-900 font-display">
            ₹{Math.round(totalExpense).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="lg:col-span-5 h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, idx) => setHoveredCategory(chartData[idx]?.name || null)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">Top Category</span>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
              {hoveredCategory || categories[0]?.name}
            </span>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-7 space-y-2 max-h-60 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                hoveredCategory === cat.name
                  ? "bg-slate-50 border-slate-300 shadow-sm"
                  : "border-slate-100 hover:bg-slate-50/60"
              }`}
              onMouseEnter={() => setHoveredCategory(cat.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-slate-800">{cat.name}</span>
                    {cat.isEssential ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200/60">
                        Essential Need
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                        Discretionary
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 font-display">
                  ₹{Math.round(cat.amount).toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-slate-400 ml-1.5 font-medium">
                  ({cat.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
