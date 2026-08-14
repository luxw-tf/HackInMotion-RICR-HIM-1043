# Financial Health Score Mathematical Specification

## 1. Overview

The Clarity Financial Health Score is a deterministic, unvarnished 0–100 index evaluating an individual's financial resilience, balance, and emergency preparedness.

---

## 2. Mathematical Formulation

The composite score $S \in [0, 100]$ is computed as the weighted sum of five independent sub-scores:

$$S = 0.30 \cdot S_{\text{savings}} + 0.25 \cdot S_{\text{essential}} + 0.20 \cdot S_{\text{discretionary}} + 0.15 \cdot S_{\text{runway}} + 0.10 \cdot S_{\text{stability}}$$

---

### 2.1 Savings Rate Score ($S_{\text{savings}}$, 30%)
Evaluates the proportion of monthly net income directed toward savings and investments.

$$\text{Savings Rate } (R_s) = \frac{\text{Monthly Net Savings}}{\text{Monthly Inflow}}$$

$$S_{\text{savings}} = \begin{cases} 
100 & \text{if } R_s \ge 0.30 \\
85 + \frac{R_s - 0.20}{0.10} \cdot 15 & \text{if } 0.20 \le R_s < 0.30 \\
70 + \frac{R_s - 0.10}{0.10} \cdot 15 & \text{if } 0.10 \le R_s < 0.20 \\
50 + \frac{R_s}{0.10} \cdot 20 & \text{if } 0.00 \le R_s < 0.10 \\
\max(0, 50 - |R_s| \cdot 100) & \text{if } R_s < 0.00 \text{ (Deficit)}
\end{cases}$$

---

### 2.2 Essential Needs Ratio Score ($S_{\text{essential}}$, 25%)
Benchmarks essential living overhead (Housing, Utilities, Groceries, Medical, Transport) against the standard 50% target.

$$\text{Needs Ratio } (R_n) = \frac{\text{Essential Outflows}}{\text{Monthly Inflow}}$$

$$S_{\text{essential}} = \begin{cases} 
100 & \text{if } R_n \le 0.50 \\
100 - \frac{R_n - 0.50}{0.30} \cdot 60 & \text{if } 0.50 < R_n \le 0.80 \\
\max(0, 40 - \frac{R_n - 0.80}{0.20} \cdot 40) & \text{if } R_n > 0.80
\end{cases}$$

---

### 2.3 Discretionary Wants Score ($S_{\text{discretionary}}$, 20%)
Penalizes lifestyle creep and non-essential spending exceeding the 30% threshold.

$$\text{Wants Ratio } (R_w) = \frac{\text{Discretionary Outflows}}{\text{Monthly Inflow}}$$

$$S_{\text{discretionary}} = \begin{cases} 
100 & \text{if } R_w \le 0.30 \\
100 - \frac{R_w - 0.30}{0.20} \cdot 50 & \text{if } 0.30 < R_w \le 0.50 \\
\max(0, 50 - \frac{R_w - 0.50}{0.50} \cdot 50) & \text{if } R_w > 0.50
\end{cases}$$

---

### 2.4 Emergency Runway Buffer Score ($S_{\text{runway}}$, 15%)
Calculates the number of months the user could maintain essential obligations without income.

$$\text{Runway Months } (M_r) = \frac{\text{Liquid Account Balances}}{\text{Monthly Essential Outflows}}$$

$$S_{\text{runway}} = \begin{cases} 
100 & \text{if } M_r \ge 6.0 \\
80 + \frac{M_r - 3.0}{3.0} \cdot 20 & \text{if } 3.0 \le M_r < 6.0 \\
50 + \frac{M_r - 1.0}{2.0} \cdot 30 & \text{if } 1.0 \le M_r < 3.0 \\
\max(0, M_r \cdot 50) & \text{if } M_r < 1.0
\end{cases}$$

---

### 2.5 Cashflow Stability Score ($S_{\text{stability}}$, 10%)
Analyzes income predictability, subscription drag, and absence of spending volatility spikes.

---

## 3. Score Tiers & Interpretations

| Score Range | Status | Clinical Assessment |
| :--- | :--- | :--- |
| **80 – 100** | **Excellent** | Strong emergency cushion, optimal 50/30/20 balance, high compounding savings velocity. |
| **65 – 79** | **Good** | Stable cashflow, positive net savings, minor discretionary optimization opportunities. |
| **50 – 64** | **Fair** | Narrow buffer, essential obligations approaching 60–70% of income, vulnerable to shocks. |
| **0 – 49** | **Needs Attention** | Negative net cashflow or deficit spending, critical need to reduce non-essential overhead. |
