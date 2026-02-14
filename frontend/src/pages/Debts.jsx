import { useEffect, useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { MdInbox, MdOutbox } from 'react-icons/md';

const Debts = () => {
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
    let cancelled = false;
    const load = async () => {
      try {
        const params = filter !== 'all' ? { type: filter } : {};
        const res = await api.get('debts', { params });
        if (!cancelled) setDebts(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) toast.error('Failed to load debts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        personName: formData.personName.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        dueDate: formData.dueDate || undefined,
        notes: (formData.notes || '').trim(),
      };
      if (editingDebt) {
        await api.put(`debts/${editingDebt._id}`, payload);
        toast.success('Debt updated');
      } else {
        await api.post('debts', payload);
        toast.success('Debt added');
      }
      setShowModal(false);
      setEditingDebt(null);
      resetForm();
      setLoading(true);
      const res = await api.get('debts', { params: filter !== 'all' ? { type: filter } : {} });
      setDebts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save debt');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this debt?')) return;
    try {
      await api.delete(`debts/${id}`);
      toast.success('Debt deleted');
      setDebts((prev) => prev.filter((d) => d._id !== id));
    } catch {
      toast.error('Failed to delete debt');
    }
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setFormData({
      personName: debt.personName ?? '',
      amount: debt.amount ?? '',
      type: debt.type ?? 'give',
      dueDate: debt.dueDate ? format(new Date(debt.dueDate), 'yyyy-MM-dd') : '',
      notes: debt.notes ?? '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ personName: '', amount: '', type: 'give', dueDate: '', notes: '' });
  };

  const filtered = debts;
  const totalToGive = debts.filter((d) => d.type === 'give').reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalToTake = debts.filter((d) => d.type === 'take').reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debt Tracker</h1>
          <p className="text-gray-600 mt-1">Track money you owe and money owed to you</p>
        </div>
        <button type="button" onClick={() => { resetForm(); setEditingDebt(null); setShowModal(true); }} className="btn-primary mt-4 md:mt-0">+ Add Debt</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Money to Receive</p>
              <p className="text-2xl font-bold text-green-900 mt-1">${totalToTake.toFixed(2)}</p>
            </div>
            <MdInbox className="text-4xl text-green-700" aria-hidden />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Money to Give</p>
              <p className="text-2xl font-bold text-red-900 mt-1">${totalToGive.toFixed(2)}</p>
            </div>
            <MdOutbox className="text-4xl text-red-600" aria-hidden />
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2">
          {['all', 'take', 'give'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {f === 'all' ? 'All' : f === 'take' ? 'To Receive' : 'To Give'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" aria-hidden />
        </div>
      ) : !filtered.length ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No debts found</p>
          <button type="button" onClick={() => setShowModal(true)} className="btn-primary">Add Your First Debt</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((debt) => (
            <div
              key={debt._id}
              className={`card ${debt.type === 'take' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{debt.personName}</h3>
                  <p className="text-sm text-gray-500">{debt.type === 'take' ? 'Money to receive' : 'Money to give'}</p>
                </div>
                <span className="text-3xl" aria-hidden>{debt.type === 'take' ? <MdInbox /> : <MdOutbox />}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-3">${Number(debt.amount).toFixed(2)}</p>
              {debt.dueDate && <p className="text-sm text-gray-600 mb-3">Due: {format(new Date(debt.dueDate), 'MMM dd, yyyy')}</p>}
              {debt.notes && <p className="text-sm text-gray-600 mb-3">{debt.notes}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(debt)} className="btn-secondary flex-1 text-sm">Edit</button>
                <button type="button" onClick={() => handleDelete(debt._id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingDebt ? 'Edit Debt' : 'Add Debt'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Person Name *</label>
                <input type="text" value={formData.personName} onChange={(e) => setFormData((f) => ({ ...f, personName: e.target.value }))} className="input-field" required placeholder="e.g., John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select value={formData.type} onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))} className="input-field" required>
                  <option value="take">Money to Receive (They owe me)</option>
                  <option value="give">Money to Give (I owe them)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))} className="input-field" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData((f) => ({ ...f, dueDate: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea value={formData.notes} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} className="input-field" rows={3} placeholder="Additional notes..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">{editingDebt ? 'Update' : 'Add'} Debt</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingDebt(null); resetForm(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debts;
