# Architecture & Design Decisions Log

This document records the architectural and design choices made during the development of the **Smart Expense Analyzer & Financial Health Dashboard**.

---

## 1. Project Initialization & Context
- **Date**: 2026-08-14
- **Context**: Setting up the project foundation according to architectural principles.
- **Tech Stack**: Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL / SQLite, NextAuth.js, Tailwind CSS, Recharts.
- **Core Principles**:
  1. Strict user-scoped isolation for all sensitive financial data (`userId` session validation).
  2. Purely computed insights and scores derived from actual user transactions (zero hardcoded filler).
  3. Deterministic, rule/keyword-based categorization engine with transparent reasoning logs.
  4. Robust handling of edge cases (empty states, malformed uploads, partial failures).

## 2. Authentication Strategy
- **Choice**: Credentials Authentication (Email/Password via bcrypt) + Instant "Demo Mode / Sample Data" Login.
- **Rationale**: Enables frictionless testing and evaluation with instant pre-loaded realistic financial data, while supporting persistent accounts with secure salted password hashes.

## 3. Categorization Taxonomy & Rule Engine
- **Choice**: Standard 8 Essential Categories (Housing, Food & Dining, Transportation, Utilities & Bills, Healthcare, Entertainment & Leisure, Shopping & Personal, Income / Savings & Investments) with keyword rules + merchant cleanup heuristics.
- **Rationale**: Provides clear balance between simplicity and meaningful insight computation (e.g. 50/30/20 rule, essential vs discretionary ratios) without expensive third-party ML dependencies.

## 4. Visual Identity & Design System
- **Choice**: Minimalist Clean Light Theme (Crisp paper-white, soft stone grays, forest emerald for health/growth, sapphire blue accents, calm typography and sleek data visualization).
- **Rationale**: Creates a serene, credible "financial advisor in your pocket" experience without feeling like a cluttered spreadsheet.

## 5. Health Score Computation Model
- **Choice**: Multi-factor weighted algorithm:
  - Savings Rate (35% weight, target ≥ 20%)
  - Essential Living Needs Ratio (30% weight, target ≤ 50%)
  - Discretionary Wants Ratio (20% weight, target ≤ 30%)
  - Cash Flow Stability & Emergency Buffer Runway (15% weight)
- **Rationale**: Based on classic personal finance principles (50/30/20 rule and emergency cushion), producing actionable diagnosis rather than an arbitrary gamified score.

## 6. Bank Statement Importer Architecture
- **Choice**: Client-side resilient CSV stream parsing with auto-detection of column variants across major banks (Chase, BoA, Citi, Wells Fargo) + live preview before batch commit.
- **Rationale**: Ensures malformed files never crash the app and users can review extracted transactions before saving.

## 7. Default Currency & Localization
- **Choice**: Indian Rupee (`₹` / INR) as the primary currency across all dashboard views, charts, budget caps, goals, seed data, and formatting utilities with `en-IN` numbering notation.
- **Rationale**: Native support for Indian banking statements, UPI, and financial planning benchmarks (e.g. PPF, mutual fund SIPs, rent transfers).

