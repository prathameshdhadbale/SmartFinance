import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Debts = () => {
  const API = import.meta.env.VITE_API_URL; // ⭐ Backend base URL

  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    type: 'give',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchDebts();
  }, [filter]);

  // ================= FETCH =================
  const fetchDebts = async () => {
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const res = await axios.get(`${API}/debts`, { params });
      setDebts(res.data);
    } catch (error) {
      toast.error('Failed to load debts');
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDebt) {
        await axios.put(`${API}/debts/${editingDebt._id}`, formData);
        toast.success('Debt updated');
      } else {
        await axios.post(`${API}/debts`, formData);
        toast.success('Debt added');
      }
      setShowModal(false);
      setEditingDebt(null);
      resetForm();
      fetchDebts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save debt');
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this debt?')) return;

    try {
      await axios.delete(`${API}/debts/${id}`);
      toast.success('Debt deleted');
      fetchDebts();
    } catch (error) {
      toast.error('Failed to delete debt');
    }
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setFormData({
      personName: debt.personName,
      amount: debt.amount,
      type: debt.type,
      dueDate: debt.dueDate ? format(new Date(debt.dueDate), 'yyyy-MM-dd') : '',
      notes: debt.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      personName: '',
      amount: '',
      type: 'give',
      dueDate: '',
      notes: '',
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* UI remains unchanged */}
    </div>
  );
};

export default Debts;
