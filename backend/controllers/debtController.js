import Debt from '../models/Debt.js';

export const createDebt = async (req, res) => {
  try {
    const { personName, amount, type, dueDate, notes } = req.body;
    const userId = req.userId;

    if (!personName || amount == null || !type) {
      return res.status(400).json({ message: 'Person name, amount, and type are required' });
    }
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const debt = new Debt({
      userId,
      personName: String(personName).trim(),
      amount: amountNum,
      type,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes: notes || '',
    });

    await debt.save();

    res.status(201).json({
      message: 'Debt created successfully',
      debt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDebts = async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.query;

    const query = { userId };
    if (type) query.type = type;

    const debts = await Debt.find(query).sort({ createdAt: -1 });

    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDebtById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const debt = await Debt.findOne({ _id: id, userId });
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }

    res.json(debt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { personName, amount, type, dueDate, notes } = req.body;

    const debt = await Debt.findOne({ _id: id, userId });
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }

    if (personName) debt.personName = personName;
    if (amount !== undefined) debt.amount = amount;
    if (type) debt.type = type;
    if (dueDate !== undefined) debt.dueDate = dueDate ? new Date(dueDate) : null;
    if (notes !== undefined) debt.notes = notes;

    await debt.save();

    res.json({
      message: 'Debt updated successfully',
      debt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const debt = await Debt.findOne({ _id: id, userId });
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }

    await Debt.findByIdAndDelete(id);

    res.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
