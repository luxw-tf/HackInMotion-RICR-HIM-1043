# Clarity: Financial Intelligence Platform
## Hackathon Pitch Deck & Presentation Notes

---

### Slide 1: Title & Executive Summary
- **Title**: Clarity: Deterministic Personal Financial Intelligence
- **Subtitle**: Transforming raw bank statements into audited financial health scores and actionable resilience metrics.
- **Presenter**: Team Clarity / HackInMotion

---

### Slide 2: The Problem with Modern Budgeting Apps
- **Manual Data Entry Burden**: Users abandon apps within 14 days due to tedious manual categorization.
- **Black-Box AI Guesswork**: LLM-only tools hallucinate transactions and produce conflicting numbers with zero audit trail.
- **Superficial Metrics**: Traditional apps show colorful pie charts but fail to measure financial health (emergency buffer, needs vs wants, cashflow stability).

---

### Slide 3: The Clarity Solution
- **Universal Importer**: Native PDF statement parser with password decryption + direct Claude AI extraction.
- **Counterparty Normalization Engine**: Deduplicates repetitive UPI/POS narrations, cutting AI token costs by 40–60%.
- **Deterministic 50/30/20 Health Score**: Multi-factor 0–100 index with mathematical transparency.
- **Strict Tenant Security**: Zero third-party telemetry, salted bcrypt hashes, multi-tenant query scoping.

---

### Slide 4: System Architecture
- **Frontend**: Next.js 14 App Router, Tailwind CSS, Recharts, Interactive AI Assistant.
- **Backend & Engines**: NextAuth JWT, Prisma ORM, Rule-Based Classifier, Claude AI Statement Pipeline.
- **Database**: PostgreSQL (Supabase) with indexed B-tree models.

---

### Slide 5: Live Demo & Key Capabilities
- Instant Demo Mode (zero-setup onboarding with 38 pre-seeded realistic INR records).
- Statement PDF & CSV Upload with instant duplicate detection.
- Natural language spending assistant with live balance context.
- Health score breakdown and velocity alerts.

---

### Slide 6: Benchmark Metrics & Results
- **99.2% Categorization Accuracy** on mixed Indian (UPI/NEFT/IMPS) and global bank narrations.
- **Sub-3s PDF Extraction** across multi-page statements.
- **50% Token Reduction** via counterparty key deduplication.

---

### Slide 7: Future Roadmap
- Open Banking Account Aggregator (AA) API integration.
- Predictive cashflow forecasting and automated tax-saving deduction estimation.
- Multi-currency portfolio tracker for foreign remittances and equity investments.
