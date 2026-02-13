import { useEffect, useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [dateView, setDateView] = useState(null);
  const [viewType, setViewType] = useState('today');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('analytics', { params: { period } });
        if (!cancelled) setAnalytics(res.data ?? null);
      } catch {
        if (!cancelled) toast.error('Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [period]);

  useEffect(() => {
    if (!viewType || !selectedDate) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('analytics/date-view', {
          params: { view: viewType, date: selectedDate },
        });
        if (!cancelled) setDateView(res.data ?? null);
      } catch {
        if (!cancelled) toast.error('Failed to load date view');
      }
    };
    load();
    return () => { cancelled = true; };
  }, [viewType, selectedDate]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const incomeData = analytics?.trends?.income ?? [];
  const expenseData = analytics?.trends?.expense ?? [];
  const allDates = new Set([
    ...incomeData.map((d) => d.date),
    ...expenseData.map((d) => d.date),
  ]);
  const combinedData = [...allDates].map((dateStr) => {
    const income = incomeData.find((d) => d.date === dateStr)?.amount ?? 0;
    const expense = expenseData.find((d) => d.date === dateStr)?.amount ?? 0;
    return {
      dateRaw: dateStr,
      date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      income,
      expense,
    };
  });
  combinedData.sort((a, b) => (a.dateRaw > b.dateRaw ? 1 : a.dateRaw < b.dateRaw ? -1 : 0));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your financial trends and insights</p>
      </div>

      {/* Period Filter */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-700 font-medium">Total Income</p>
          <p className="text-3xl font-bold text-green-900 mt-1">
            ${analytics?.totals.totalIncome.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-sm text-red-700 font-medium">Total Expense</p>
          <p className="text-3xl font-bold text-red-900 mt-1">
            ${analytics?.totals.totalExpense.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Net Savings</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">
            ${analytics?.totals.netSavings.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Income vs Expense Trend */}
      {combinedData.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Income vs Expense Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Date-Based View */}
      {dateView && dateView.totals && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Date-Based View</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-900">
                ${Number(dateView.totals.totalIncome).toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Total Expense</p>
              <p className="text-2xl font-bold text-red-900">
                ${Number(dateView.totals.totalExpense).toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Net Savings</p>
              <p className="text-2xl font-bold text-blue-900">
                ${Number(dateView.totals.netSavings).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
