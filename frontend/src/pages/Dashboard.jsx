import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { MdAttachMoney, MdMoneyOff, MdSavings, MdAccountBalance, MdAdd, MdBarChart } from 'react-icons/md';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    accountCount: 0,
    totalBalance: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError(null);
      try {
        const [accountsRes, transactionsRes, analyticsRes] = await Promise.all([
          api.get('accounts'),
          api.get('transactions', { params: { limit: 5 } }),
          api.get('analytics', { params: { period: 'monthly' } }),
        ]);

        if (cancelled) return;

        const accounts = accountsRes.data ?? [];
        const transactions = transactionsRes.data ?? [];
        const analytics = analyticsRes.data ?? {};
        const totals = analytics.totals ?? {};

        setSummary({
          totalIncome: totals.totalIncome ?? 0,
          totalExpense: totals.totalExpense ?? 0,
          netSavings: totals.netSavings ?? 0,
          accountCount: Array.isArray(accounts) ? accounts.length : 0,
          totalBalance: Array.isArray(accounts)
            ? accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0)
            : 0,
          recentTransactions: Array.isArray(transactions) ? transactions : [],
        });
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load dashboard');
          toast.error('Failed to load dashboard data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="card border-red-200 bg-red-50 text-center py-8">
          <p className="text-red-700 mb-4">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your financial overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                ${Number(summary.totalIncome).toFixed(2)}
              </p>
            </div>
            <MdAttachMoney className="text-4xl text-green-700" aria-hidden />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Total Expense</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                ${Number(summary.totalExpense).toFixed(2)}
              </p>
            </div>
            <MdMoneyOff className="text-4xl text-red-600" aria-hidden />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Net Savings</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ${Number(summary.netSavings).toFixed(2)}
              </p>
            </div>
            <MdSavings className="text-4xl text-blue-700" aria-hidden />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Accounts</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{summary.accountCount}</p>
            </div>
            <MdAccountBalance className="text-4xl text-purple-700" aria-hidden />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/transactions"
          className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-500"
        >
          <div className="text-center">
            <MdAdd className="text-4xl mb-2 mx-auto" aria-hidden />
            <p className="font-medium text-gray-900">Add Transaction</p>
          </div>
        </Link>
        <Link
          to="/accounts"
          className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-500"
        >
          <div className="text-center">
            <MdAccountBalance className="text-4xl mb-2 mx-auto text-primary-700" aria-hidden />
            <p className="font-medium text-gray-900">Manage Accounts</p>
          </div>
        </Link>
        <Link
          to="/analytics"
          className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-500"
        >
          <div className="text-center">
            <MdBarChart className="text-4xl mb-2 mx-auto text-primary-700" aria-hidden />
            <p className="font-medium text-gray-900">View Analytics</p>
          </div>
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        {!summary.recentTransactions.length ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet</p>
            <Link to="/transactions" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Add your first transaction
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.recentTransactions.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {t.type === 'income' ? <MdAttachMoney /> : <MdMoneyOff />}
                        </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.category ?? '—'}</p>
                    <p className="text-sm text-gray-500">
                      {t.accountId?.name ?? 'Unknown'} • {format(new Date(t.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
