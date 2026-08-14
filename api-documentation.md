# Clarity Financial Intelligence API Specification

## Base URL
```
/api
```

## Authentication
All endpoints (except `/api/auth/*`) require an active NextAuth session cookie (`next-auth.session-token`). Requests without a valid session return HTTP `401 Unauthorized`.

---

## 1. Authentication Endpoints

### Register User
`POST /api/auth/register`
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response** (`201 Created`):
```json
{
  "user": {
    "id": "cuid_xyz",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "message": "User registered successfully."
}
```

### Initialize Demo Session
`POST /api/auth/bootstrap-demo`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Demo user initialized successfully.",
  "user": {
    "id": "demo-user-1043",
    "email": "demo@smartfinance.app",
    "name": "Alex Rivera"
  }
}
```

---

## 2. Transactions & Importers

### List & Filter Transactions
`GET /api/transactions`
- **Query Parameters**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 50)
  - `type` (`EXPENSE` | `INCOME` | `SAVINGS`)
  - `categoryId` (string, optional)
  - `search` (string, optional narration filter)
  - `startDate` (ISO YYYY-MM-DD, optional)
  - `endDate` (ISO YYYY-MM-DD, optional)
- **Response** (`200 OK`):
```json
{
  "transactions": [
    {
      "id": "tx_01",
      "date": "2026-08-14T00:00:00.000Z",
      "description": "INFOSYS TECH CORP DIRECT SALARY CREDIT",
      "merchant": "Infosys",
      "amount": 125000.00,
      "type": "INCOME",
      "category": { "id": "cat_01", "name": "Income & Salary", "color": "#059669" },
      "financialAccount": { "id": "acc_01", "name": "HDFC Salary Account" },
      "reasoning": "Rule matched keyword: salary"
    }
  ],
  "total": 38,
  "page": 1,
  "totalPages": 1
}
```

### Create Transaction
`POST /api/transactions`
- **Request Body**:
```json
{
  "description": "Swiggy Food Delivery",
  "amount": 720.00,
  "type": "EXPENSE",
  "date": "2026-08-14",
  "categoryId": "cat_food_id",
  "accountId": "acc_hdfc_id"
}
```

### Direct Claude AI Statement Import
`POST /api/transactions/import-claude`
- **Request Body**:
```json
{
  "rawContent": "01/08/2026,UPI/DR/622450640912/MUKESH S/YESB/paytm.s22m/UPI,,450.00,,124550.00\n...",
  "filename": "statement.csv"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Claude processed statement: 10 transactions categorized & imported, 0 duplicates skipped.",
  "insertedCount": 10,
  "duplicateCount": 0,
  "batchId": "claude_batch_1786719999"
}
```

### PDF Statement Decrypt & Parse
`POST /api/transactions/parse-pdf`
- **Multipart Form Data**:
  - `file`: PDF file blob
  - `password`: string (optional decryption key)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "validRows": [
    {
      "date": "2026-08-01T00:00:00.000Z",
      "dateStr": "2026-08-01",
      "description": "Mukesh S",
      "amount": 450.00,
      "type": "EXPENSE"
    }
  ],
  "totalRowsProcessed": 10,
  "detectedFormat": "PDF_STATEMENT_CLAUDE_AI",
  "pageCount": 2
}
```

---

## 3. Financial Analytics & Health Score

### Compute Health Score Snapshot
`GET /api/health-score`
- **Response** (`200 OK`):
```json
{
  "score": 78,
  "rating": "Good",
  "savingsRate": 0.28,
  "essentialRatio": 0.44,
  "discretionaryRatio": 0.28,
  "bufferMonths": 4.5,
  "monthlyIncome": 149000.00,
  "monthlyExpense": 107280.00,
  "netSavings": 41720.00,
  "breakdown": {
    "savingsRateScore": 82,
    "essentialRatioScore": 92,
    "discretionaryRatioScore": 75,
    "bufferMonthsScore": 70,
    "stabilityScore": 71
  },
  "insights": [
    {
      "type": "POSITIVE",
      "title": "Healthy Savings Rate (28%)",
      "message": "You are directing 28% of your net income to investments and emergency savings."
    }
  ]
}
```

---

## 4. Budgets & Goals

### Get & Set Monthly Budgets
`GET /api/budgets` | `POST /api/budgets`
- **Payload**:
```json
{
  "categoryId": "cat_01",
  "amount": 18000.00,
  "month": 8,
  "year": 2026
}
```

### Manage Savings Goals
`GET /api/goals` | `POST /api/goals`
- **Payload**:
```json
{
  "name": "6-Month Emergency Fund",
  "targetAmount": 300000.00,
  "currentAmount": 195000.00,
  "categoryType": "EMERGENCY_FUND",
  "targetDate": "2027-02-14"
}
```
