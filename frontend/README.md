# Clarity Frontend Architecture

## Overview
The Clarity frontend is built using Next.js 14 (App Router), React 18, Tailwind CSS, and Recharts, providing a responsive, desktop and mobile-optimized financial analytics dashboard.

## Directory Structure
```
frontend/ (components & app)
├── app/
│   ├── layout.tsx                # Root layout with AuthProvider & dynamic config
│   ├── page.tsx                  # Public marketing & demo launch landing page
│   ├── auth/
│   │   ├── login/page.tsx        # Sign-in and instant demo mode bootstrap
│   │   └── register/page.tsx     # Private user registration
│   └── dashboard/
│       ├── page.tsx              # Executive Financial Health & Cashflow Overview
│       ├── transactions/page.tsx # Transaction history, filtering & batch actions
│       ├── budgets/page.tsx      # Monthly category budgets & savings goals
│       └── categories/page.tsx   # Category management & rule keywords
└── components/
    ├── dashboard/
    │   ├── Header.tsx            # Navigation header with live status badges
    │   ├── Sidebar.tsx           # Collapsible navigation drawer
    │   ├── ScoreGauge.tsx        # 0-100 SVG financial health score dial
    │   ├── MetricCard.tsx        # Cashflow, savings rate, runway indicator cards
    │   ├── CategoryBreakdown.tsx # Recharts interactive pie and spend allocation
    │   ├── MonthlyTrend.tsx      # 6-month inflow vs outflow bar chart
    │   ├── InsightFeed.tsx       # Plain-language rule-computed insights feed
    │   ├── RecurringSubs.tsx     # Subscription detector and cost tracker
    │   ├── AddTransactionModal.tsx # Manual transaction entry modal
    │   └── UploadStatementModal.tsx # Multi-bank PDF & CSV statement importer
    └── providers/
        └── AuthProvider.tsx      # NextAuth SessionProvider wrapper
```

## Key Capabilities
- **Real-time Health Score Visualization**: Interactive SVG gauge animating across clinical score tiers (0–100).
- **Universal Statement Upload**: Drag-and-drop file ingestion supporting password-protected PDFs and CSV exports.
- **Natural Language Assistant**: Floating conversational AI assistant to query account balances and spending breakdowns.
- **Zero-Latency Interactions**: Optimistic updates and instant feedback toasts across all mutation flows.
