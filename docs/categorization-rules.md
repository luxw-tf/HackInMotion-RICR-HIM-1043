# Transaction Categorization & Rule Engine Specification

## 1. Taxonomy Definition

Clarity implements a standardized 10-category taxonomy structured for personal financial analytics, 50/30/20 budget tracking, and tax categorization.

| Category Name | Default Type | Essential? | Color | Primary Keywords |
| :--- | :--- | :--- | :--- | :--- |
| **Income & Salary** | `INCOME` | Yes | `#059669` | `salary`, `payroll`, `direct dep`, `wages`, `dividend`, `bonus`, `freelance`, `infosys`, `tcs`, `wipro` |
| **Rent & Housing** | `EXPENSE` | Yes | `#0284c7` | `rent`, `mortgage`, `hoa`, `apartment`, `landlord`, `realty`, `leasing`, `maintenance fee`, `prestige` |
| **Food & Dining** | `EXPENSE` | Mixed | `#f59e0b` | `grocery`, `blinkit`, `zepto`, `swiggy`, `zomato`, `reliance fresh`, `dmart`, `supermarket`, `cafe`, `starbucks` |
| **Travel & Transport** | `EXPENSE` | Yes | `#6366f1` | `fuel`, `petrol`, `diesel`, `indian oil`, `shell`, `uber`, `ola`, `rapido`, `metro`, `fastag`, `toll`, `auto insurance` |
| **Utilities & Bills** | `EXPENSE` | Yes | `#0d9488` | `electricity`, `bescom`, `power`, `water utility`, `internet`, `airtel`, `jio`, `wifi`, `broadband`, `mobile bill` |
| **Healthcare & Medical** | `EXPENSE` | Yes | `#e11d48` | `pharmacy`, `apollo`, `medplus`, `1mg`, `practo`, `doctor`, `hospital`, `clinic`, `medical`, `health insurance` |
| **Entertainment & Leisure**| `EXPENSE` | No | `#8b5cf6` | `netflix`, `spotify`, `hotstar`, `bookmyshow`, `pvr`, `inox`, `cinema`, `steam`, `cult fit`, `gym`, `fitness` |
| **Shopping & Personal** | `EXPENSE` | No | `#64748b` | `amazon`, `flipkart`, `myntra`, `ajio`, `zara`, `nike`, `salon`, `urban company`, `electronics`, `croma` |
| **Subscriptions & Recurring** | `EXPENSE` | Mixed | `#0284c7` | `subscription`, `monthly fee`, `icloud`, `google storage`, `youtube premium`, `chatgpt`, `github`, `adobe` |
| **Savings & Investments**| `SAVINGS` | Yes | `#10b981` | `zerodha`, `groww`, `kuvera`, `mutual fund`, `sip`, `ppf`, `nps`, `fixed deposit`, `emergency fund` |

---

## 2. Rule Matching Hierarchy

When classifying raw bank narrations, the engine applies the following decision priority:

1. **Exact Merchant Mapping**: Exact substring matching against registered vendor dictionary.
2. **Normalized Counterparty Key Match**: Stripping UPI transaction IDs, VPA suffixes (`@okaxis`, `@paytm`), POS terminal codes, and reference numbers.
3. **Keyword Pattern Evaluation**: Priority-ranked keyword regex execution.
4. **Claude AI Semantic Inference**: Contextual analysis of transaction frequency, amounts, and vendor semantics.
5. **Deterministic Fallback**: Assignment to `Uncategorized` with flagging for manual review.

---

## 3. Auditable Reasoning Trail

Every transaction stores a plain-language explanation of why it was categorized:
- Example: `"Rule matched keyword: rent [PRESTIGE APARTMENTS -> Housing]"`
- Example: `"Claude AI: Monthly high-speed fiber broadband bill [Essential Utility]"`
