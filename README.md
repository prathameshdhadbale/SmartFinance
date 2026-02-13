# SmartFinance - Personal Finance Tracking Application

A complete full-stack web application for tracking personal finances, including income, expenses, multiple accounts, debts, budgets, and comprehensive analytics.

## 🚀 Features

### Core Features
- **Transaction Tracking**: Log income and expenses with automatic account balance updates
- **Multiple Accounts**: Manage bank accounts, credit cards, debit cards, and cash wallets
- **Debt Tracker**: Track money you owe and money owed to you
- **Analytics Dashboard**: Visualize income/expense trends with interactive charts
- **Date-Based Views**: Filter transactions by today, week, month, or year
- **Budget Tracking**: Set monthly budgets per category with progress tracking and alerts
- **Smart Features**: Category management, search, filters, and recent transactions

### UI/UX
- Clean, modern, mobile-first responsive design
- Tailwind CSS for styling
- Intuitive navigation
- Beautiful color palette
- Dashboard similar to modern fintech apps

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls
- **React Hot Toast** for notifications
- **date-fns** for date formatting

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📁 Project Structure

```
SmartFinance/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── accountController.js
│   │   ├── debtController.js
│   │   ├── budgetController.js
│   │   └── analyticsController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Account.js
│   │   ├── Transaction.js
│   │   ├── Debt.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── accounts.js
│   │   ├── debts.js
│   │   ├── budgets.js
│   │   └── analytics.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Transactions.jsx
    │   │   ├── Accounts.jsx
    │   │   ├── Debts.jsx
    │   │   ├── Analytics.jsx
    │   │   └── Budget.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file and set:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smartfinance
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

   For MongoDB Atlas, use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartfinance
   ```

5. **Start the backend server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Optional: Create `.env` for production API URL**
   - For **local development**: leave `.env` unset or omit `VITE_API_URL`; the app uses the Vite proxy (`/api` → `http://localhost:5000`).
   - For **production (e.g. Vercel)**: set `VITE_API_URL` to your backend URL (e.g. `https://your-app.onrender.com`) with no trailing slash.
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL=https://your-backend.onrender.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get account by ID
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Debts
- `GET /api/debts` - Get all debts (with filters)
- `POST /api/debts` - Create new debt
- `GET /api/debts/:id` - Get debt by ID
- `PUT /api/debts/:id` - Update debt
- `DELETE /api/debts/:id` - Delete debt

### Budgets
- `GET /api/budgets` - Get all budgets (with month/year filters)
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics
- `GET /api/analytics` - Get analytics data (with period filter)
- `GET /api/analytics/date-view` - Get date-based view

**Note:** All endpoints except `/api/auth/*` require authentication token in header:
```
Authorization: Bearer <token>
```

## 📱 Usage Guide

1. **Sign Up**: Create a new account with your name, email, and password
2. **Login**: Sign in with your credentials
3. **Create Accounts**: Add your bank accounts, credit cards, etc.
4. **Add Transactions**: Log your income and expenses
5. **Track Debts**: Record money you owe or are owed
6. **Set Budgets**: Create monthly budgets for different categories
7. **View Analytics**: Check your financial trends and insights

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation
- Secure token storage

## 🎨 Features Highlights

- **Automatic Balance Updates**: Account balances update automatically when transactions are added
- **Real-time Analytics**: View income/expense trends with interactive charts
- **Budget Alerts**: Visual indicators when budgets are exceeded
- **Search & Filters**: Easily find transactions by category, account, or date
- **Mobile Responsive**: Works seamlessly on all device sizes

## 🚀 Deployment (Vercel + Render + MongoDB Atlas)

### Backend (Render)

1. Create a **Web Service** on [Render](https://render.com). Connect your repo and set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Add variables:
     - `NODE_ENV` = `production`
     - `MONGODB_URI` = your MongoDB Atlas connection string
     - `JWT_SECRET` = a long random secret (generate one and keep it safe)
     - Optional: `FRONTEND_URL` = your Vercel app URL (e.g. `https://your-app.vercel.app`)

2. Deploy. Note your backend URL (e.g. `https://smartfinance-xxx.onrender.com`).

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com) and import your repo.
2. Set **Root Directory** to `frontend`.
3. **Environment Variables**: Add `VITE_API_URL` = your Render backend URL (e.g. `https://smartfinance-xxx.onrender.com`) with no trailing slash.
4. Deploy. The built app will call your Render API using `VITE_API_URL`.

### Database (MongoDB Atlas)

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/smartfinance`) and set it as `MONGODB_URI` on Render.
3. In Atlas, ensure Network Access allows connections from anywhere (or add Render IPs if you restrict).

### Summary

| Environment   | Backend (Render)     | Frontend (Vercel)     |
|---------------|----------------------|------------------------|
| Local        | `http://localhost:5000` | `http://localhost:3000` (proxy to backend) |
| Production   | Set `MONGODB_URI`, `JWT_SECRET`, optional `FRONTEND_URL` | Set `VITE_API_URL` to Render URL |

## 🐛 Troubleshooting

### Backend Issues
- Ensure MongoDB is running
- Check `.env` file configuration
- Verify port 5000 is available

### Frontend Issues
- Clear browser cache
- Check console for errors
- Verify backend is running on port 5000

### Database Connection
- For local MongoDB: Ensure MongoDB service is running
- For MongoDB Atlas: Check connection string and network access

## 📝 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests.

## 📧 Support

For issues or questions, please open an issue on the repository.

---

**Happy Tracking! 💰📊**
