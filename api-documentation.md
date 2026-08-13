# API Documentation

This document maintains the API endpoints, request/response structures, and authentication requirements for the **Smart Expense Analyzer & Financial Health Dashboard**.

---

## Overview & Authentication
- **Base Path**: `/api`
- **Security**: All API routes require authenticated sessions via NextAuth. Requests without a valid session return `401 Unauthorized`.
- **Tenant Scoping**: All database operations filter strictly by `userId` extracted from the verified session token.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account with secure hashed password storage.
- **Request Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex@example.com",
    "password": "secretpassword"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "Account created successfully.",
    "user": {
      "id": "cuid...",
      "name": "Alex Rivera",
      "email": "alex@example.com",
      "createdAt": "2026-08-14T..."
    }
  }
  ```

---

## 2. Financial Health Score Endpoints

### `GET /api/health-score`
Computes the live Financial Health Score (0-100), 50/30/20 breakdown, cashflow consistency, runway buffer, plain-language advisory insights, and recurring subscription detections directly from the authenticated user's transactions.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "transactionCount": 42,
    "data": {
      "overallScore": 86,
      "tier": "PRISTINE",
      "headline": "Excellent Financial Health",
      "summary": "Your cash flow is strong, essential expenses are disciplined...",
      "monthlyIncome": 7450,
      "monthlyExpenses": 3820,
      "monthlySavings": 3630,
      "savingsRate": 48.7,
      "essentialRatio": 38.5,
      "discretionaryRatio": 12.8,
      "bufferMonths": 2.5,
      "breakdown": {
        "savingsRate": { "score": 100, "value": 48.7, "target": "≥ 20%", "status": "EXCELLENT" },
        "essentialRatio": { "score": 100, "value": 38.5, "target": "≤ 50%", "status": "EXCELLENT" },
        "discretionaryRatio": { "score": 100, "value": 12.8, "target": "≤ 30%", "status": "EXCELLENT" },
        "cashflowConsistency": { "score": 100, "value": 3630, "status": "EXCELLENT" }
      },
      "insights": [...],
      "recurringSubscriptions": [...],
      "categoryTotals": [...]
    }
  }
  ```

---

## 3. Transaction Endpoints

### `GET /api/transactions`
Retrieves transactions scoped strictly to the current user.
- **Query Parameters**:
  - `categoryId` (optional): Filter by category ID.
  - `type` (optional): `EXPENSE`, `INCOME`, or `SAVINGS`.
  - `search` (optional): Substring search across description, merchant, notes.
  - `limit` (optional): Max records to return (default: 100).
- **Response `200 OK`**: List of transaction objects with category relations and reasoning audit trails.

### `POST /api/transactions`
Records a new transaction. If no category ID is provided, automatically executes the deterministic rule categorization engine and logs the rule reasoning.
- **Request Body**:
  ```json
  {
    "description": "Trader Joe's Supermarket",
    "amount": 84.50,
    "date": "2026-08-14",
    "customCategoryId": "optional-id",
    "notes": "Weekly groceries",
    "isRecurring": false
  }
  ```

### `DELETE /api/transactions?id={id}`
Deletes a single transaction scoped strictly to the authenticated user.

### `POST /api/transactions/import-csv`
Bulk imports parsed CSV rows with automatic batch rule categorization and error tolerance.
- **Request Body**:
  ```json
  {
    "rows": [
      { "date": "2026-08-10", "description": "Chevron Gas", "amount": 45.00, "type": "EXPENSE" }
    ],
    "filename": "bank_statement.csv"
  }
  ```

### `POST /api/transactions/seed-demo`
Seeds or resets the user's account with 3 months of realistic categorized sample transactions, goals, and budgets for evaluation.

---

## 4. Category & Rule Endpoints

### `GET /api/categories`
Fetches all available categories (both default system taxonomy and user-defined custom rules).

### `POST /api/categories`
Creates a custom user category with keyword match rules and essential/discretionary classification.

---

## 5. Budget & Goal Endpoints

### `GET /api/budgets?month={m}&year={y}`
Returns monthly category budgets with actual spending aggregated in real-time.

### `POST /api/budgets`
Sets or updates a monthly category budget limit.

### `GET /api/goals`
Returns all active financial goals with calculated progress percentages.

### `POST /api/goals`
Creates a new financial milestone or emergency cushion goal.

### `PUT /api/goals`
Updates financial goal current amount or status.
