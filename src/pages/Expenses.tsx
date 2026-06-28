import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, ReceiptText, Coffee, Car, ShoppingBag, Clapperboard, HeartPulse, GraduationCap, Box } from 'lucide-react';
import { addExpenseInDb, deleteExpenseFromDb, updateExpenseInDb } from '../firebaseService';
import { auth } from '../firebase';

export default function Expenses() {
  const { expenses, userEmail, currencySymbol } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'food' | 'transport' | 'shopping' | 'entertainment' | 'health' | 'education' | 'other'>('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'food': return <Coffee className="w-5 h-5 text-orange-500" />;
      case 'transport': return <Car className="w-5 h-5 text-blue-500" />;
      case 'shopping': return <ShoppingBag className="w-5 h-5 text-pink-500" />;
      case 'entertainment': return <Clapperboard className="w-5 h-5 text-purple-500" />;
      case 'health': return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'education': return <GraduationCap className="w-5 h-5 text-indigo-500" />;
      default: return <Box className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !date) return;
    
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (editingId) {
      await updateExpenseInDb(editingId, {
        name,
        amount: parseFloat(amount),
        category,
        date,
        notes
      });
      setEditingId(null);
    } else {
      await addExpenseInDb(uid, {
        name,
        amount: parseFloat(amount),
        category,
        date,
        notes
      });
    }
    
    // Reset form
    setName('');
    setAmount('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsAdding(false);
  };

  const handleEdit = (exp: any) => {
    setEditingId(exp.id);
    setName(exp.name);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date);
    setNotes(exp.notes);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this expense?")) {
      await deleteExpenseFromDb(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-dashboard-title text-slate-800">Personal Expenses</h2>
          <p className="text-slate-500 text-sm mt-1">Track your day-to-day spending flexibly.</p>
        </div>
        
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
            setName('');
            setAmount('');
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#047857] hover:bg-[#005d42] text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 animate-fade-in-up">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Expense' : 'New Expense'}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. Morning Coffee" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-medium">{currencySymbol}</span>
                <input type="number" required min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select value={category} onChange={(e: any) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="food">Food & Dining</option>
                <option value="transport">Transportation</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="health">Health & Fitness</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Any extra details..." />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors">
                {editingId ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center">
            <ReceiptText className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-600">No expenses recorded yet.</p>
            <p className="text-sm">Start tracking your daily spending to get better insights.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map((exp) => (
              <div 
                key={exp.id} 
                onClick={() => handleEdit(exp)}
                className="flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4">
                  {getCategoryIcon(exp.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{exp.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{exp.category} • {exp.date}</p>
                </div>
                <div className="text-right ml-4 mr-4">
                  <p className="font-bold text-slate-800">{currencySymbol}{exp.amount.toLocaleString()}</p>
                </div>
                <button 
                  onClick={(e) => handleDelete(exp.id, e)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 md:block hidden"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
