import { useEffect, useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';

const BUDGET_CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities',
  'Entertainment', 'Healthcare', 'Education', 'Travel', 'Other',
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Budget = () => {
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

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('budgets', { params: { month, year } });
        if (!cancelled) setBudgets(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) toast.error('Failed to load budgets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category: formData.category,
        amount: Number(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year),
      };
      if (editingBudget) {
        await api.put(`budgets/${editingBudget._id}`, { amount: payload.amount });
        toast.success('Budget updated');
      } else {
        await api.post('budgets', payload);
        toast.success('Budget created');
      }
      setShowModal(false);
      setEditingBudget(null);
      resetForm();
      const res = await api.get('budgets', { params: { month, year } });
      setBudgets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`budgets/${id}`);
      toast.success('Budget deleted');
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category ?? '',
      amount: budget.amount ?? '',
      month: budget.month ?? new Date().getMonth() + 1,
      year: budget.year ?? new Date().getFullYear(),
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

  const getProgress = (spent, budget) => (budget > 0 ? Math.min((spent / budget) * 100, 100) : 0);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Tracking</h1>
          <p className="text-gray-600 mt-1">Set and monitor your monthly budgets</p>
        </div>
        <button type="button" onClick={() => { resetForm(); setEditingBudget(null); setShowModal(true); }} className="btn-primary mt-4 md:mt-0">+ Add Budget</button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input-field">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field" min={2020} max={2100} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" aria-hidden />
        </div>
      ) : !budgets.length ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No budgets set for this period</p>
          <button type="button" onClick={() => setShowModal(true)} className="btn-primary">Create Your First Budget</button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => {
            const spent = Number(b.spent) || 0;
            const amount = Number(b.amount) || 0;
            const remaining = Number(b.remaining) ?? (amount - spent);
            const exceeded = Boolean(b.exceeded) || spent > amount;
            const progress = getProgress(spent, amount);
            return (
              <div key={b._id} className={`card ${exceeded ? 'border-l-4 border-l-red-500 bg-red-50' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{b.category}</h3>
                    <p className="text-sm text-gray-500 mt-1">{MONTHS[(b.month || 1) - 1]} {b.year}</p>
                  </div>
                  {exceeded && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Exceeded!</span>}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2 text-sm text-gray-600">
                    <span>Spent: ${spent.toFixed(2)}</span>
                    <span>Budget: ${amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${exceeded ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className={exceeded ? 'text-red-600 font-medium' : 'text-gray-600'}>Remaining: ${remaining.toFixed(2)}</span>
                    <span className="text-gray-500">{progress.toFixed(1)}% used</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEdit(b)} className="btn-secondary flex-1 text-sm">Edit</button>
                  <button type="button" onClick={() => handleDelete(b._id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{editingBudget ? 'Edit Budget' : 'Add Budget'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={formData.category} onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))} className="input-field" required disabled={!!editingBudget}>
                  <option value="">Select Category</option>
                  {BUDGET_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount *</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))} className="input-field" required min="0" placeholder="0.00" />
              </div>
              {!editingBudget && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                    <select value={formData.month} onChange={(e) => setFormData((f) => ({ ...f, month: Number(e.target.value) }))} className="input-field" required>
                      {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <input type="number" value={formData.year} onChange={(e) => setFormData((f) => ({ ...f, year: Number(e.target.value) }))} className="input-field" required min={2020} max={2100} />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">{editingBudget ? 'Update' : 'Create'} Budget</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingBudget(null); resetForm(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
