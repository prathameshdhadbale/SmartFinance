import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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

  const accountTypes = ['Bank Account', 'Credit Card', 'Debit Card', 'Cash Wallet'];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts');
      setAccounts(res.data);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await axios.put(`/api/accounts/${editingAccount._id}`, formData);
        toast.success('Account updated');
      } else {
        await axios.post('/api/accounts', formData);
        toast.success('Account created');
      }
      setShowModal(false);
      setEditingAccount(null);
      resetForm();
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save account');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      await axios.delete(`/api/accounts/${id}`);
      toast.success('Account deleted');
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Bank Account',
      balance: '',
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your financial accounts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingAccount(null);
            setShowModal(true);
          }}
          className="btn-primary mt-4 md:mt-0"
        >
          + Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-700 font-medium">Total Balance</p>
            <p className="text-3xl font-bold text-primary-900 mt-1">
              ${totalBalance.toFixed(2)}
            </p>
          </div>
          <div className="text-5xl">💳</div>
        </div>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No accounts yet</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{account.type}</p>
                </div>
                <div className="text-3xl">
                  {account.type === 'Bank Account' && '🏦'}
                  {account.type === 'Credit Card' && '💳'}
                  {account.type === 'Debit Card' && '💳'}
                  {account.type === 'Cash Wallet' && '💵'}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${account.balance.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(account)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(account._id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  {accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingAccount ? 'Update' : 'Create'} Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAccount(null);
                    resetForm();
                  }}
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
