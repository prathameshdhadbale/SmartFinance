import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
  const API = import.meta.env.VITE_API_URL; // ⭐ Backend base URL

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
        axios.get(`${API}/accounts`),
        axios.get(`${API}/transactions`, { params: { limit: 5 } }),
        axios.get(`${API}/analytics`, { params: { period: 'monthly' } }),
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
      {/* UI unchanged */}
    </div>
  );
};

export default Dashboard;
