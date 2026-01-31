import { useState, useEffect } from 'react';
import { supabase, Expense, Category } from '../lib/supabase';
import { Button } from './Button';
import { IconComponent } from './IconComponent';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ExpenseFormProps {
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
  editExpense?: Expense & { category: Category };
}

export const ExpenseForm = ({ categories, onSuccess, onCancel, editExpense }: ExpenseFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editExpense) {
      setFormData({
        category_id: editExpense.category_id,
        amount: editExpense.amount.toString(),
        description: editExpense.description || '',
        date: editExpense.date,
      });
    }
  }, [editExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to save expenses.');
      setLoading(false);
      return;
    }

    if (!formData.category_id) {
      setError('Please select a category.');
      setLoading(false);
      return;
    }

    try {
      const expenseData = {
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        description: formData.description || 'Expense',
        date: formData.date,
        updated_at: new Date().toISOString(),
        user_id: user.id
      };

      if (editExpense) {
        const { error: updateError } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editExpense.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving expense:', err);
      if (err.message?.includes('relation') || err.message?.includes('does not exist')) {
        setError('Database tables not found. Please run the SQL setup script in Supabase.');
      } else {
        setError(`Failed to save: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {categories.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl text-center">
          <p className="font-semibold mb-2">No categories found!</p>
          <p className="text-sm text-gray-400">Please create a category first before adding expenses.</p>
          <Button type="button" variant="secondary" onClick={onCancel} className="mt-3">
            Close & Create Category
          </Button>
        </div>
      )}

      {categories.length > 0 && (
        <>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2 animate-pulse">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category_id: category.id })}
                  className={`p-3 rounded-xl border transition-all duration-200 flex items-center gap-2 group ${formData.category_id === category.id
                    ? 'border-cyber-cyan bg-cyber-cyan/10 ring-1 ring-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 transition-transform duration-300 ${formData.category_id === category.id ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <IconComponent
                      name={category.icon}
                      className="text-current"
                      size={16}
                      style={{ color: category.color }}
                    />
                  </div>
                  <span className={`text-sm font-medium truncate transition-colors ${formData.category_id === category.id ? 'text-white' : 'text-gray-300 group-hover:text-gray-200'
                    }`}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Amount (₹)
            </label>
            <div className="relative group">
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field text-xl font-bold font-mono pl-4 focus:ring-cyber-cyan/50 focus:border-cyber-cyan transition-all duration-300"
                placeholder="0.00"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-cyan/20 to-cyber-magenta/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10 blur-md"></div>
            </div>
          </div>


          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field w-full text-white bg-transparent focus:ring-cyber-magenta/50 focus:border-cyber-magenta transition-all duration-300"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !formData.category_id}
              className="flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                editExpense ? 'Update Expense' : 'Add Expense'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

