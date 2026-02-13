import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    accountCount: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [accountsRes, transactionsRes, analyticsRes] = await Promise.all([
        axios.get('/api/accounts'),
        axios.get('/api/transactions?limit=5'),
        axios.get('/api/analytics?period=monthly'),
      ]);

      const accounts = accountsRes.data;
      const transactions = transactionsRes.data;
      const analytics = analyticsRes.data;

      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

      setSummary({
        totalIncome: analytics.totals.totalIncome,
        totalExpense: analytics.totals.totalExpense,
        netSavings: analytics.totals.netSavings,
        accountCount: accounts.length,
        totalBalance,
        recentTransactions: transactions,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                ${summary.totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Total Expense</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                ${summary.totalExpense.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💸</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Net Savings</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ${summary.netSavings.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💵</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Accounts</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {summary.accountCount}
              </p>
            </div>
            <div className="text-4xl">🏦</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/transactions"
          className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-500"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">➕</div>
            <p className="font-medium text-gray-900">Add Transaction</p>
          </div>
        </Link>

        <Link
          to="/accounts"
          className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-500"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🏦</div>
            <p className="font-medium text-gray-900">Manage Accounts</p>
          </div>
        </Link>

        <Link
          to="/analytics"
          className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-500"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="font-medium text-gray-900">View Analytics</p>
          </div>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </Link>
        </div>

        {summary.recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet</p>
            <Link to="/transactions" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Add your first transaction
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.recentTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.type === 'income' ? '💰' : '💸'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.category}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.accountId?.name || 'Unknown'} •{' '}
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
