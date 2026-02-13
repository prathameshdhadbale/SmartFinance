import Transaction from '../models/Transaction.js';

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { period = 'monthly', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    // Set default date range based on period
    if (!startDate || !endDate) {
      const end = endDate ? new Date(endDate) : now;
      let start;

      switch (period) {
        case 'daily':
          start = new Date(end);
          start.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          start = new Date(end);
          start.setDate(start.getDate() - 7);
          break;
        case 'monthly':
          start = new Date(end.getFullYear(), end.getMonth(), 1);
          break;
        case 'yearly':
          start = new Date(end.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(end.getFullYear(), end.getMonth(), 1);
      }

      dateFilter = {
        $gte: startDate ? new Date(startDate) : start,
        $lte: endDate ? new Date(endDate) : end,
      };
    } else {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get all transactions in the period
    const transactions = await Transaction.find({
      userId,
      date: dateFilter,
    }).sort({ date: 1 });

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;

    // Group by date for trends
    const incomeTrend = {};
    const expenseTrend = {};

    transactions.forEach((transaction) => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      if (transaction.type === 'income') {
        incomeTrend[dateKey] = (incomeTrend[dateKey] || 0) + transaction.amount;
      } else {
        expenseTrend[dateKey] = (expenseTrend[dateKey] || 0) + transaction.amount;
      }
    });

    // Convert to array format for charts
    const incomeData = Object.entries(incomeTrend).map(([date, amount]) => ({
      date,
      amount,
    }));

    const expenseData = Object.entries(expenseTrend).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Category breakdown
    const categoryBreakdown = {};
    transactions.forEach((transaction) => {
      if (transaction.type === 'expense') {
        categoryBreakdown[transaction.category] =
          (categoryBreakdown[transaction.category] || 0) + transaction.amount;
      }
    });

    const categoryData = Object.entries(categoryBreakdown).map(([category, amount]) => ({
      category,
      amount,
    }));

    res.json({
      totals: {
        totalIncome,
        totalExpense,
        netSavings,
      },
      trends: {
        income: incomeData,
        expense: expenseData,
      },
      categories: categoryData,
      period,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDateBasedView = async (req, res) => {
  try {
    const userId = req.userId;
    const { view, date } = req.query;

    if (!view || !date) {
      return res.status(400).json({ message: 'View type and date are required' });
    }

    const selectedDate = new Date(date);
    let startDate, endDate;

    switch (view) {
      case 'today':
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'year':
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
        endDate = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        return res.status(400).json({ message: 'Invalid view type' });
    }

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('accountId', 'name type')
      .sort({ date: -1 });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      view,
      dateRange: { startDate, endDate },
      transactions,
      totals: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
