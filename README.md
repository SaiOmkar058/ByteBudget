# ByteBudget

A full-stack personal finance and budget tracking application built with React and Node.js. ByteBudget helps users manage their income, expenses, and financial goals through an intuitive dashboard, transaction tracking, and insightful reports.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Dashboard**: Overview of financial status with stats cards and expense charts
- **Transaction Management**: Add, view, and categorize income and expenses
- **Reports**: Visualize spending patterns and financial insights
- **Settings**: User profile management
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live data synchronization between frontend and backend

## Tech Stack

### Frontend
- React 19
- Vite (build tool)
- React Router DOM (routing)
- Chart.js & Recharts (data visualization)
- Axios (HTTP client)
- React Toastify (notifications)
- CSS Modules (styling)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose (database)
- JWT (authentication)
- bcryptjs (password hashing)
- CORS (cross-origin resource sharing)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ByteBudget
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**
   Create a `.env` file in the `server` directory with:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. **Start the application**
   - Start the backend server:
     ```bash
     cd server
     npm run dev
     ```
   - Start the frontend client:
     ```bash
     cd client
     npm run dev
     ```

6. **Access the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. **Register**: Create a new account or login with existing credentials
2. **Dashboard**: View your financial overview, recent transactions, and expense charts
3. **Add Transactions**: Navigate to Income or Expenses pages to add new transactions
4. **View Transactions**: Check all transactions on the Transactions page
5. **Reports**: Analyze your spending patterns in the Reports section
6. **Settings**: Update your profile information

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Transactions
- `GET /api/transactions` - Get all user transactions
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

## Project Structure

```
ByteBudget/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── server/          # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── package.json
├── .gitignore
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
