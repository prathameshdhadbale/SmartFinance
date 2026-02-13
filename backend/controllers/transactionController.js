import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

export const createTransaction = async (req, res) => {
  try {
    const { accountId, amount, type, category, date, note } = req.body;
    const userId = req.userId;

    // Validation
    if (!accountId || !amount || !type || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify account belongs to user
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      accountId,
      amount,
      type,
      category,
      date: date || new Date(),
      note: note || '',
    });

    await transaction.save();

    // Update account balance
    if (type === 'income') {
      account.balance += amount;
    } else {
      account.balance -= amount;
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

    const transactions = await Transaction.find(query)
      .populate('accountId', 'name type')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({ _id: id, userId })
      .populate('accountId', 'name type');

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
    const { amount, type, category, date, note, accountId } = req.body;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const oldAccount = await Account.findById(transaction.accountId);
    const newAccountId = accountId || transaction.accountId;
    const newAccount = await Account.findOne({ _id: newAccountId, userId });

    if (!newAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Revert old transaction effect
    if (oldAccount) {
      if (transaction.type === 'income') {
        oldAccount.balance -= transaction.amount;
      } else {
        oldAccount.balance += transaction.amount;
      }
      await oldAccount.save();
    }

    // Update transaction
    const oldAmount = transaction.amount;
    const oldType = transaction.type;

    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date ? new Date(date) : transaction.date;
    transaction.note = note !== undefined ? note : transaction.note;
    transaction.accountId = newAccountId;

    await transaction.save();

    // Apply new transaction effect
    if (transaction.type === 'income') {
      newAccount.balance += transaction.amount;
    } else {
      newAccount.balance -= transaction.amount;
    }
    await newAccount.save();

    res.json({
      message: 'Transaction updated successfully',
      transaction,
      account: { balance: newAccount.balance },
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

    // Update account balance
    const account = await Account.findById(transaction.accountId);
    if (account) {
      if (transaction.type === 'income') {
        account.balance -= transaction.amount;
      } else {
        account.balance += transaction.amount;
      }
      await account.save();
    }

    await Transaction.findByIdAndDelete(id);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
