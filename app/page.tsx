import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Activity, PieChart, Sparkles, CheckCircle, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {

  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Clarity</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition shadow-sm"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Calm, deterministic financial intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 font-display max-w-4xl leading-[1.15]">
          A clear, honest picture of your{" "}
          <span className="text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded-lg">financial health</span>.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Not another color-splashed spreadsheet. Automatic rule-based categorization, computed health scores, and plain-language insights tailored strictly to your data.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Launch Live Demo</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/auth/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-sm transition"
          >
            Create Private Account
          </Link>
        </div>

        {/* 3 Pillar Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 font-display text-base">Computed Health Score</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              An unvarnished 0–100 score analyzing your savings rate, essential living overhead, discretionary buffer, and cashflow resilience.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 font-display text-base">Deterministic Categorization</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Transparent, rule-driven categorization with complete reasoning logs. No opaque black-box AI or expensive third-party dependencies.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-subtle hover:border-slate-300 transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 font-display text-base">Plain-Language Insights</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Actionable advice calculated directly from your actual patterns — identifying subscriptions, spending spikes, and emergency cushion gaps.
            </p>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="mt-14 inline-flex items-center space-x-2 text-xs text-slate-500">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Strict multi-tenant security • Zero cross-tenant data leakage • Built for sensitive financial records</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        Clarity Financial Health Dashboard • Built with Next.js 14, Prisma, PostgreSQL/SQLite, Recharts
      </footer>
    </div>
  );
}
