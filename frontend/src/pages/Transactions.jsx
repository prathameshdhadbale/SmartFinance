import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Transactions = () => {
  const API = import.meta.env.VITE_API_URL; // ⭐ Backend base URL

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [filters, setFilters] = useState({
    accountId: '',
    type: '',
    search: '',
  });

  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    type: 'expense',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  });

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [filters]);

  // ================= FETCH ACCOUNTS =================
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API}/accounts`);
      setAccounts(res.data);
      if (res.data.length > 0 && !formData.accountId) {
        setFormData((prev) => ({ ...prev, accountId: res.data[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to load accounts');
    }
  };

  // ================= FETCH TRANSACTIONS =================
  const fetchTransactions = async () => {
    try {
      const params = {};
      if (filters.accountId) params.accountId = filters.accountId;
      if (filters.type) params.type = filters.type;

      const res = await axios.get(`${API}/transactions`, { params });

      let filtered = res.data;

      if (filters.search) {
        filtered = filtered.filter(
          (t) =>
            t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
            t.note.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setTransactions(filtered);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await axios.put(`${API}/transactions/${editingTransaction._id}`, formData);
        toast.success('Transaction updated');
      } else {
        await axios.post(`${API}/transactions`, formData);
        toast.success('Transaction added');
      }
      setShowModal(false);
      setEditingTransaction(null);
      fetchTransactions();
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transaction');
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await axios.delete(`${API}/transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* UI unchanged */}
    </div>
  );
};

export default Transactions;
