# System Architecture Specification

## 1. Overview

Clarity is an enterprise-grade personal financial intelligence platform designed to replace opaque budgeting tools with deterministic categorization, pattern intelligence, and computed financial resilience metrics.

```
+-------------------------------------------------------------------------+
|                    Next.js App Router Frontend (Client UI)              |
|  - Dashboard View (Overview, Metrics, Trends, Velocity)                 |
|  - Transactions Manager & Multi-Format Importer (PDF / CSV / Manual)    |
|  - Interactive Financial Assistant & Natural Language Q&A Engine        |
|  - Dynamic Recharts Visualizations & Health Score Gauge                 |
+------------------------------------+------------------------------------+
                                     | HTTPS / NextAuth JWT
                                     v
+------------------------------------+------------------------------------+
|                    NextAuth Session & Security Layer                    |
|  - Salted bcrypt Password Verification                                  |
|  - Scoped Multi-Tenant Isolation (userId validation on every query)     |
|  - Self-Bootstrapping Demo Environment                                  |
+------------------------------------+------------------------------------+
                                     | Internal Dispatch
                                     v
+-------------------------------------------------------------------------+
|                    Backend Engine & Analytics Core                      |
|  - Claude AI Direct Statement Parser (Multi-bank PDF & CSV)             |
|  - Counterparty Key Normalization & Deduplication Engine (40-60% tokens)|
|  - Deterministic 10-Category Rule & Keyword Classifier                  |
|  - 50/30/20 Financial Health Score Mathematical Engine (0-100)          |
|  - Anomaly & Velocity Detector (Spike, MoM, Recurring Subscriptions)    |
+------------------------------------+------------------------------------+
                                     | Prisma Client (v5)
                                     v
+------------------------------------+------------------------------------+
|                    Data Persistence Layer                               |
|  - PostgreSQL (Supabase / Production Pooler)                            |
|  - 8 Relational Models (User, Account, Transaction, Category, etc.)     |
|  - B-Tree Indexed Search Paths (userId, date, type, accountId)          |
+-------------------------------------------------------------------------+
```

---

## 2. Core Architectural Subsystems

### 2.1 Multi-Format Ingestion Layer
- **PDF Statement Decryption & Parsing**: Implements native `pdfjs-dist` text stream extraction with support for password-protected statements (e.g. DOB/PAN hashes).
- **Direct Claude AI Pipeline**: Converts unstructured bank narrations into structured ISO records in a single pass.
- **Deduplication Preprocessor**: Normalizes noisy UPI/POS strings into canonical counterparty keys, collapsing duplicate narrations before AI processing to achieve a 40–60% reduction in token consumption.

### 2.2 Deterministic Categorization Engine
- Categorizes all inflows, outflows, and transfers into 10 standard categories.
- Evaluates weighted regex patterns against merchant identifiers and raw narrations.
- Records an auditable 1-sentence reasoning trail for every classification decision.

### 2.3 Financial Health Score Algorithm (0–100)
A deterministic multi-factor model evaluating:
1. **Savings Rate (30% weight)**: Measures net monthly savings relative to total income.
2. **Needs Overhead (25% weight)**: Benchmarks essential expenditures against the 50% target.
3. **Discretionary Wants (20% weight)**: Penalizes lifestyle spending exceeding 30% of income.
4. **Emergency Runway (15% weight)**: Calculates cash reserve buffer against monthly living expenses.
5. **Cashflow Stability (10% weight)**: Evaluates month-over-month income consistency and recurring outflows.

---

## 3. Data Flow

1. **User Authentication**: Client submits credentials to `/api/auth/[...nextauth]`. Server validates bcrypt hash and issues an encrypted JWT cookie.
2. **Statement Upload**: PDF/CSV file is uploaded to `/api/transactions/parse-pdf` or `/api/transactions/import-claude`.
3. **Extraction & Classification**: Claude or the rule engine parses dates, signed amounts, merchant keys, categories, and essential flags.
4. **Duplicate Prevention**: Hash signatures (`date_description_amount`) filter out existing entries within the user's database.
5. **Analytics Execution**: Health score, recurring subscriptions, and category breakdowns are calculated dynamically on live database records.
