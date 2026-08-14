# Clarity Backend Architecture & Core Engines

## Overview
The Clarity backend is a modular TypeScript service layer executed within Next.js Route Handlers, backed by Prisma ORM and PostgreSQL (Supabase).

## Directory Structure
```
backend/ (api & lib core)
├── app/api/
│   ├── auth/[...nextauth]/route.ts # NextAuth JWT authentication handler
│   ├── auth/register/route.ts      # User registration with salted bcrypt hashing
│   ├── auth/bootstrap-demo/route.ts# Zero-setup demo account bootstrap endpoint
│   ├── transactions/
│   │   ├── route.ts                # CRUD transactions with pagination & filters
│   │   ├── import-claude/route.ts  # Direct Claude AI statement parser & importer
│   │   ├── import-csv/route.ts     # Multi-bank CSV importer with duplicate filter
│   │   ├── parse-pdf/route.ts      # Native PDF decryption & text extractor
│   │   ├── classify-llm/route.ts   # Counterparty deduplication & Claude batcher
│   │   └── seed-demo/route.ts      # Demo transaction re-seeder
│   ├── health-score/route.ts       # 50/30/20 Financial Health Score computation
│   ├── budgets/route.ts            # Category monthly budgets management
│   ├── goals/route.ts              # Savings goals and milestone tracking
│   └── categories/route.ts         # User & system taxonomy dictionary
├── lib/
│   ├── auth.ts                     # NextAuth options & credential validator
│   ├── prisma.ts                   # Prisma client singleton instance
│   ├── currency.ts                 # INR currency formatting & parser utilities
│   ├── analytics/
│   │   └── healthScore.ts          # 0-100 mathematical health score algorithm
│   ├── categorization/
│   │   ├── rules.ts                # Deterministic keyword & regex matcher
│   │   ├── counterparty.ts         # UPI/POS counterparty deduplication engine
│   │   └── llmClassifier.ts        # Parallelized Claude Haiku batch classifier
│   ├── importer/
│   │   ├── statementParser.ts      # CSV column detection & duplicate signatures
│   │   └── directClaudeParser.ts   # Direct statement Claude AI extraction pipeline
│   └── qa/
│       └── spendingEngine.ts       # Natural language financial Q&A engine
└── prisma/
    ├── schema.prisma               # PostgreSQL relational models & indices
    └── seed.js                     # Seed script for initial categories & demo data
```

## Security & Reliability Highlights
- **Multi-Tenant Isolation**: Enforced `userId` scoping across every database query.
- **Deduplication Engine**: Key normalization preprocessor collapses repeated UPI/POS transactions before AI ingestion, achieving a 40–60% reduction in token consumption.
- **Fail-Safe Fallbacks**: Deterministic rule classifiers guarantee that statement ingestion completes even in offline or API-limited environments.
