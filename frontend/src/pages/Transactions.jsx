import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities',
  'Entertainment', 'Healthcare', 'Education', 'Travel', 'Salary',
  'Freelance', 'Investment', 'Other',
];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ accountId: '', type: '', search: '' });
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    type: 'expense',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get('accounts');
      const list = Array.isArray(res.data) ? res.data : [];
      setAccounts(list);
      if (list.length > 0 && !formData.accountId) {
        setFormData((prev) => (prev.accountId ? prev : { ...prev, accountId: list[0]._id }));
      }
    } catch {
      toast.error('Failed to load accounts');
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.accountId) params.accountId = filters.accountId;
      if (filters.type) params.type = filters.type;
      const res = await api.get('transactions', { params });
      let list = Array.isArray(res.data) ? res.data : [];
      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        list = list.filter(
          (t) =>
            (t.category && t.category.toLowerCase().includes(q)) ||
            (t.note && t.note.toLowerCase().includes(q))
        );
      }
      setTransactions(list);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters.accountId, filters.type, filters.search]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        accountId: formData.accountId,
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category.trim(),
        date: formData.date || new Date().toISOString().slice(0, 10),
        note: (formData.note || '').trim(),
      };
      if (editingTransaction) {
        await api.put(`transactions/${editingTransaction._id}`, payload);
        toast.success('Transaction updated');
      } else {
        await api.post('transactions', payload);
        toast.success('Transaction added');
      }
      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      fetchTransactions();
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
      fetchAccounts();
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  const handleEdit = (t) => {
    setEditingTransaction(t);
    setFormData({
      accountId: t.accountId?._id ?? t.accountId ?? '',
      amount: t.amount ?? '',
      type: t.type ?? 'expense',
      category: t.category ?? '',
      date: t.date ? format(new Date(t.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      note: t.note ?? '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      accountId: accounts[0]?._id ?? '',
      amount: '',
      type: 'expense',
      category: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      note: '',
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage your income and expenses</p>
        </div>
        <button type="button" onClick={() => { resetForm(); setEditingTransaction(null); setShowModal(true); }} className="btn-primary mt-4 md:mt-0">
          + Add Transaction
        </button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="input-field"
              placeholder="Category or note..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              value={filters.accountId}
              onChange={(e) => setFilters((f) => ({ ...f, accountId: e.target.value }))}
              className="input-field"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" aria-hidden />
        </div>
      ) : !transactions.length ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No transactions found</p>
          <button type="button" onClick={() => setShowModal(true)} className="btn-primary">Add Your First Transaction</button>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Account</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-4 font-medium">{t.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{t.accountId?.name ?? '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button type="button" onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-700 text-sm mr-2">Edit</button>
                    <button type="button" onClick={() => handleDelete(t._id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData((f) => ({ ...f, accountId: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>{acc.name} ({acc.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select value={formData.type} onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))} className="input-field" required>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))} className="input-field" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={formData.category} onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))} className="input-field" required>
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea value={formData.note} onChange={(e) => setFormData((f) => ({ ...f, note: e.target.value }))} className="input-field" rows={3} placeholder="Optional..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">{editingTransaction ? 'Update' : 'Add'} Transaction</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingTransaction(null); resetForm(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
