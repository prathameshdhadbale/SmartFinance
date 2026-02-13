import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Budget = () => {
  const API = import.meta.env.VITE_API_URL; // ⭐ Backend base URL

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
  ];

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  // ================= FETCH =================
  const fetchBudgets = async () => {
    try {
      const res = await axios.get(`${API}/budgets`, {
        params: { month, year },
      });
      setBudgets(res.data);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await axios.put(`${API}/budgets/${editingBudget._id}`, formData);
        toast.success('Budget updated');
      } else {
        await axios.post(`${API}/budgets`, formData);
        toast.success('Budget created');
      }
      setShowModal(false);
      setEditingBudget(null);
      resetForm();
      fetchBudgets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save budget');
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await axios.delete(`${API}/budgets/${id}`);
      toast.success('Budget deleted');
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  };

  const getProgressPercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* UI remains unchanged */}
    </div>
  );
};

export default Budget;
