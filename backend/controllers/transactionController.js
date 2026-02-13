import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

const toNum = (v) => (v === undefined || v === null ? NaN : Number(v));
const validNum = (v) => typeof v === 'number' && !Number.isNaN(v) && v >= 0;

export const createTransaction = async (req, res) => {
  try {
    const { accountId, amount, type, category, date, note } = req.body;
    const userId = req.userId;

    if (!accountId || amount == null || !type || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const amountNum = toNum(amount);
    if (!validNum(amountNum)) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const transaction = new Transaction({
      userId,
      accountId,
      amount: amountNum,
      type,
      category: String(category).trim(),
      date: date ? new Date(date) : new Date(),
      note: note != null ? String(note).trim() : '',
    });

    await transaction.save();

    if (type === 'income') {
      account.balance += amountNum;
    } else {
      account.balance -= amountNum;
    }
    await account.save();

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
      account: { balance: account.balance },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { accountId, type, startDate, endDate, limit = 50 } = req.query;

    const query = { userId };
    if (accountId) query.accountId = accountId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const transactions = await Transaction.find(query)
      .populate('accountId', 'name type')
      .sort({ date: -1 })
      .limit(limitNum);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({ _id: id, userId }).populate(
      'accountId',
      'name type'
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { amount, type, category, date, note, accountId: newAccountIdRaw } = req.body;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const newAccountId = newAccountIdRaw || transaction.accountId;
    const oldAccount = await Account.findOne({ _id: transaction.accountId, userId });
    const newAccount = await Account.findOne({ _id: newAccountId, userId });

    if (!oldAccount || !newAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const amountNum = amount !== undefined ? toNum(amount) : transaction.amount;
    const newType = type || transaction.type;
    if (!validNum(amountNum)) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const isSameAccount =
      String(oldAccount._id) === String(newAccountId);

    if (isSameAccount) {
      // Revert old effect and apply new effect on same account in one step
      if (transaction.type === 'income') {
        oldAccount.balance -= Number(transaction.amount);
      } else {
        oldAccount.balance += Number(transaction.amount);
      }
      if (newType === 'income') {
        oldAccount.balance += amountNum;
      } else {
        oldAccount.balance -= amountNum;
      }
      await oldAccount.save();
    } else {
      // Revert on old account
      if (transaction.type === 'income') {
        oldAccount.balance -= Number(transaction.amount);
      } else {
        oldAccount.balance += Number(transaction.amount);
      }
      await oldAccount.save();
      // Apply on new account
      if (newType === 'income') {
        newAccount.balance += amountNum;
      } else {
        newAccount.balance -= amountNum;
      }
      await newAccount.save();
    }

    transaction.amount = amountNum;
    transaction.type = newType;
    transaction.category = category != null ? String(category).trim() : transaction.category;
    transaction.date = date ? new Date(date) : transaction.date;
    transaction.note = note !== undefined ? String(note).trim() : transaction.note;
    transaction.accountId = newAccountId;

    await transaction.save();

    const balanceAccount = isSameAccount ? oldAccount : newAccount;
    res.json({
      message: 'Transaction updated successfully',
      transaction,
      account: { balance: balanceAccount.balance },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const account = await Account.findOne({
      _id: transaction.accountId,
      userId,
    });
    if (account) {
      if (transaction.type === 'income') {
        account.balance -= Number(transaction.amount);
      } else {
        account.balance += Number(transaction.amount);
      }
      await account.save();
    }

    await Transaction.findByIdAndDelete(id);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
