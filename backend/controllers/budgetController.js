import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    const userId = req.userId;

    if (!category || amount == null || !month || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const amountNum = Number(amount);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (!Number.isFinite(amountNum) || amountNum < 0 || !Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12 || !Number.isFinite(yearNum)) {
      return res.status(400).json({ message: 'Invalid amount, month, or year' });
    }

    const existingBudget = await Budget.findOne({
      userId,
      category: String(category).trim(),
      month: monthNum,
      year: yearNum,
    });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget already exists for this category and period' });
    }

    const budget = new Budget({
      userId,
      category: String(category).trim(),
      amount: amountNum,
      month: monthNum,
      year: yearNum,
    });

    await budget.save();

    res.status(201).json({
      message: 'Budget created successfully',
      budget,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    const query = { userId };
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query).sort({ createdAt: -1 });

    // Calculate spent amounts
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

        const expenses = await Transaction.find({
          userId,
          category: budget.category,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        });

        const spent = expenses.reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.amount - spent;
        const exceeded = spent > budget.amount;

        return {
          ...budget.toObject(),
          spent,
          remaining,
          exceeded,
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { amount } = req.body;

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (amount !== undefined) budget.amount = amount;

    await budget.save();

    res.json({
      message: 'Budget updated successfully',
      budget,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await Budget.findByIdAndDelete(id);

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
