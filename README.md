# ByteBudget

ByteBudget is a personal-finance web application with a React frontend and an Express/MongoDB API. Accounts are isolated by JWT-authenticated user ID.

## Verified functionality

- Register, sign in, restore an authenticated session, and sign out.
- Update the signed-in user's display name and change their password after supplying the current password.
- Create, list, edit, delete, search, filter, and sort income and expense transactions.
- Categorize transactions. Expense entries can also be assigned to a Need, Want, or Savings/Investment budget-rule category.
- View dashboard totals, recent transactions, category spending, a budget gauge, and time-period chart data calculated from the account's transactions.
- View reports with all-recorded income, expenses, balance, savings rate, recent monthly trends, and expense-category breakdowns.
- Track subscriptions, including active/inactive status, billing cycle, due date, and calculated monthly/yearly equivalents.
- Track debts and EMI progress. The **Trigger EMI** button is a manual simulation: it creates one expense transaction and increments every eligible automated debt each time it is pressed.
- Calculate an estimated Indian take-home salary for the Old and New regimes (FY 2025–26) and save the selected monthly result as an income transaction.

## Important limitations

- Budget and savings-goal settings are stored only in the browser's local storage; they are not shared across devices or accounts.
- EMI deductions are not scheduled automatically. Re-running the manual trigger can create another EMI transaction for an eligible debt.
- Reports and dashboard values are calculated client-side from the transactions returned by the API. There is no real-time push synchronization.
- Monetary display is currently formatted as INR throughout the UI.

## Technology

### Client

- React 19 and Vite
- React Router DOM
- Axios
- Chart.js / react-chartjs-2 and Recharts
- Plain CSS stylesheets

### Server

- Node.js and Express
- MongoDB with Mongoose
- JSON Web Tokens and bcryptjs

## Setup

Prerequisites: Node.js, npm, and a running MongoDB instance.

1. Install dependencies.

   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. Create `server/.env`:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/bytebudget
   JWT_SECRET=replace-with-a-long-random-secret
   ```

3. Start the API in one terminal.

   ```bash
   cd server
   npm run dev
   ```

4. Start the client in a second terminal.

   ```bash
   cd client
   npm run dev
   ```

Open the URL printed by Vite (normally `http://localhost:5173`). The client uses `http://localhost:5000/api` by default; set `VITE_API_URL` in the client environment to use another API base URL.

## API

All endpoints other than registration and login require `Authorization: Bearer <token>`.

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/password` |
| Transactions | `GET`, `POST /api/transactions`; `GET /api/transactions/stats`; `PUT`, `DELETE /api/transactions/:id`; `POST /api/transactions/automate-emi` |
| Subscriptions | `GET`, `POST /api/subscriptions`; `PUT`, `DELETE /api/subscriptions/:id` |
| Debts | `GET`, `POST /api/debts`; `PUT`, `DELETE /api/debts/:id` |

`POST /api/transactions/automate-emi` is the manual EMI simulation described above, not a background scheduler.

## Project layout

```text
ByteBudget/
├── client/                 # React/Vite frontend
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
└── server/                 # Express API
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    └── routes/
```

## Validation

The client has `npm run lint` and `npm run build` scripts. The server currently has start and development scripts but no automated test script.
