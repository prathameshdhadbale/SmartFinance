import { useEffect, useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';

const accountTypes = ['Bank Account', 'Credit Card', 'Debit Card', 'Cash Wallet'];

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bank Account',
    balance: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('accounts');
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        balance: formData.balance === '' ? 0 : Number(formData.balance),
      };
      if (editingAccount) {
        await api.put(`accounts/${editingAccount._id}`, { name: payload.name, type: payload.type });
        toast.success('Account updated');
      } else {
        await api.post('accounts', payload);
        toast.success('Account created');
      }
      setShowModal(false);
      setEditingAccount(null);
      resetForm();
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`accounts/${id}`);
      toast.success('Account deleted');
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name ?? '',
      type: account.type ?? 'Bank Account',
      balance: account.balance ?? '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'Bank Account', balance: '' });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your financial accounts</p>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setEditingAccount(null); setShowModal(true); }}
          className="btn-primary mt-4 md:mt-0"
        >
          + Add Account
        </button>
      </div>

      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-700 font-medium">Total Balance</p>
            <p className="text-3xl font-bold text-primary-900 mt-1">${totalBalance.toFixed(2)}</p>
          </div>
          <span className="text-5xl" aria-hidden>💳</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" aria-hidden />
        </div>
      ) : !accounts.length ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No accounts yet</p>
          <button type="button" onClick={() => setShowModal(true)} className="btn-primary">
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{acc.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{acc.type}</p>
                </div>
                <span className="text-3xl" aria-hidden>
                  {acc.type === 'Cash Wallet' ? '💵' : '💳'}
                </span>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-2xl font-bold text-gray-900">${Number(acc.balance).toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(acc)} className="btn-secondary flex-1 text-sm">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(acc._id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{editingAccount ? 'Edit Account' : 'Add Account'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="e.g., Chase Checking"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  {accountTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {!editingAccount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">{editingAccount ? 'Update' : 'Create'} Account</button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingAccount(null); resetForm(); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
