import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Accounts = () => {
  const API = import.meta.env.VITE_API_URL; // ⭐ ADD THIS

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

  // ================= FETCH =================
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API}/accounts`);
      setAccounts(res.data);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await axios.put(`${API}/accounts/${editingAccount._id}`, formData);
        toast.success('Account updated');
      } else {
        await axios.post(`${API}/accounts`, formData);
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

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      await axios.delete(`${API}/accounts/${id}`);
      toast.success('Account deleted');
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
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
      {/* UI unchanged */}
    </div>
  );
};

export default Accounts;
