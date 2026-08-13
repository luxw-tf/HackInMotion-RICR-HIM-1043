# Clarity — Smart Expense Analyzer & Financial Health Dashboard

> **An honest, clear picture of your personal financial health.**
> Automated rule-based categorization, pattern intelligence, computed 0–100 health scoring, and calm budgeting — designed to feel like a trustworthy financial advisor in your pocket.

---

## 🌟 Solution Overview

Most personal finance apps resemble either an intimidating raw spreadsheet with colors slapped on, or a black-box AI tool with opaque reasoning. **Clarity** is architected on four principles:

1. **Strict Multi-Tenant Scoping**: Every financial data query, mutation, and aggregation is verified against authenticated session tokens (`userId`). Zero cross-tenant data leakage.
2. **Computed, Not Hardcoded Insights**: Health scores (0–100), 50/30/20 metrics, emergency buffer runways, and pattern cards are computed on-demand from real transaction records.
3. **Deterministic Categorization Engine**: Rule- and keyword-driven classification with normalized merchant names and transparent reasoning trails — runs fast, deterministically, and with zero paid ML costs.
4. **Resilient Failure Handling**: Real handled states for empty datasets, missing fields, and multi-format bank statement CSVs (Chase, Bank of America, Citi, Wells Fargo, Generic).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL (Supabase) / SQLite local fallback
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider + Salted `bcryptjs` hashing + Instant Demo Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Minimalist Clean Light Theme: stone grays, forest emerald, sapphire accents)
- **Data Visualization**: [Recharts](https://recharts.org/) (Interactive Donut charts, score gauges, progress metrics)
- **Statement Ingestion**: [PapaParse](https://www.papaparse.com/) (Client-side streaming CSV parsing & schema detection)
- **Deploy Target**: Vercel + Supabase

---

## 🚀 Key Features

### 1. Computed Financial Health Score (0–100)
- Multi-factor weighted algorithm:
  - **Savings Rate (35% weight)**: Benchmark ≥ 20% of net earnings.
  - **Essentials / Needs (30% weight)**: 50/30/20 rule benchmark ≤ 50% of income.
  - **Discretionary / Wants (20% weight)**: Benchmark ≤ 30% of income.
  - **Cash Flow Stability & Reserve Runway (15% weight)**: Living expense runway buffer.
- Visualized via an interactive SVG health gauge and status diagnostic tiers (*Pristine, Strong, Stable, Building, Critical*).

### 2. Deterministic Rule Categorization & Audit Trails
- 8 standard life-stage categories: *Housing, Food & Dining, Transportation, Utilities & Bills, Healthcare, Entertainment & Leisure, Shopping & Personal, Income / Savings & Investments*.
- Includes a live **Categorization Sandbox** where users can test raw bank descriptions and inspect keyword matches and reasoning logs in real time.
- Supports custom user-defined categories and keyword match rules.

### 3. Plain-Language Advisory Insights
- On-demand pattern detection identifying:
  - High fixed overhead ratios vs. benchmark.
  - Savings surplus optimization opportunities.
  - Active recurring subscriptions and committed monthly overheads.
  - Actionable next steps tailored to real cashflow margins.

### 4. Multi-Bank Statement Importer (CSV)
- Automatically detects column variations (Date / Posting Date, Description / Memo / Payee, Amount / Debit / Credit).
- Live preview table before batch import.
- Graceful error resilience for malformed rows or empty datasets.

### 5. Budgets & Financial Milestones
- Category-level monthly spending limits with real-time progress indicators.
- Milestone tracking for emergency reserves (e.g. 6-Month Emergency Cushion) and retirement contributions.

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- `npm` or `pnpm`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/luxw-tf/HackInMotion-RICR-HIM-1043.git
cd HackInMotion-RICR-HIM-1043
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` contents:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="financial-advisor-secret-key-32-chars-long-min"
```

### 3. Initialize Database & Seed Demo Data
```bash
# Push Prisma schema to SQLite / PostgreSQL
npx prisma db push

# Seed default category taxonomy, keywords, demo user, and 3 months of sample transactions
node prisma/seed.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Access

To explore immediately with preloaded realistic financial transactions:
- **Email**: `demo@smartfinance.app`
- **Password**: `password123`
- *Or click **"Enter Instant Demo Mode"** directly on the login page.*

---

## 📁 Repository Structure

```
├── app/
│   ├── api/
│   │   ├── auth/                # NextAuth handler & registration endpoint
│   │   ├── budgets/             # Monthly budget limits & actuals aggregation
│   │   ├── categories/          # Category taxonomy & custom keyword rules
│   │   ├── goals/               # Financial goals & emergency reserve tracking
│   │   ├── health-score/        # Live computed health score algorithm endpoint
│   │   └── transactions/        # User-scoped transaction CRUD & CSV import
│   ├── auth/
│   │   ├── login/               # Credentials login & instant demo trigger
│   │   └── register/            # User account registration
│   ├── dashboard/
│   │   ├── budgets/             # Budgets & Goals management view
│   │   ├── categories/          # Rule Engine, taxonomy & sandbox tester
│   │   ├── transactions/        # Full transactions list & CSV importer
│   │   ├── layout.tsx           # Dashboard layout with sidebar navigation
│   │   └── page.tsx             # Main Financial Health Dashboard overview
│   ├── globals.css              # Design tokens & minimalist theme styles
│   ├── layout.tsx               # Root layout with SessionProvider
│   └── page.tsx                 # Landing page
├── components/
│   ├── dashboard/               # UI widgets (ScoreGauge, MetricCard, InsightFeed, Modals, etc.)
│   └── providers/               # NextAuth SessionProvider wrapper
├── lib/
│   ├── analytics/healthScore.ts # 50/30/20 & Health Score calculation engine
│   ├── auth.ts                  # NextAuth options & session callbacks
│   ├── categorization/rules.ts  # Deterministic keyword rule engine & merchant parser
│   ├── prisma.ts                # PrismaClient singleton instance
│   └── sampleData.ts            # Realistic seed transaction data
├── prisma/
│   ├── schema.prisma            # Relational database schema with indexes
│   └── seed.js                  # Database seeder
├── docs/
│   └── decisions.md             # Architecture & design decisions record
├── api-documentation.md         # Full API endpoint specification
└── package.json
```

---

## 📚 Documentation
- [API Documentation](file:///c:/Users/apocxlwpse/Downloads/HackInMotion-RICR-HIM-1043/api-documentation.md) — Comprehensive route, parameter, and payload specs.
- [Design Decisions Log](file:///c:/Users/apocxlwpse/Downloads/HackInMotion-RICR-HIM-1043/docs/decisions.md) — Architecture choices, taxonomy rationale, and scoring models.

---

## 🛡️ License
MIT License. Built for the HackInMotion Hackathon.
