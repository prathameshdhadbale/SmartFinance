import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

export const createAccount = async (req, res) => {
  try {
    const { name, type, balance } = req.body;
    const userId = req.userId;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const balanceNum = Number(balance);
    const account = new Account({
      userId,
      name: String(name).trim(),
      type,
      balance: Number.isFinite(balanceNum) ? balanceNum : 0,
    });

    await account.save();

    res.status(201).json({
      message: 'Account created successfully',
      account,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const userId = req.userId;
    const accounts = await Account.find({ userId }).sort({ createdAt: -1 });

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, type } = req.body;

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (name) account.name = name;
    if (type) account.type = type;

    await account.save();

    res.json({
      message: 'Account updated successfully',
      account,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check if account has transactions
    const transactionCount = await Transaction.countDocuments({ accountId: id });
    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete account with existing transactions',
      });
    }

    await Account.findByIdAndDelete(id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
