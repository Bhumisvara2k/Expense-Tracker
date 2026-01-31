import { useState } from 'react';
import { Edit2, Trash2, Calendar, Filter } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency, getCurrentMonth, getMonthName, generateMonthOptions } from '../lib/utils';
import { supabase, Expense, Category } from '../lib/supabase';
import { Modal } from './Modal';
import { ExpenseForm } from './ExpenseForm';
import { IconComponent } from './IconComponent';

export const ExpenseHistory = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingExpense, setEditingExpense] = useState<(Expense & { category: Category }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { categories } = useCategories();
  const { expenses, loading, refetch } = useExpenses(selectedMonth, selectedCategory);

  const monthOptions = generateMonthOptions();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleEdit = (expense: Expense & { category: Category }) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleExpenseUpdated = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Expense History</h1>
        <p className="text-gray-400 mt-1">View and manage all your expenses</p>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            <Calendar size={16} className="inline mr-2 text-cyber-cyan" />
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field bg-white/5 border-white/10 text-white"
          >
            {monthOptions.map((month) => (
              <option key={month} value={month} className="bg-cyber-dark text-white">
                {getMonthName(month)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            <Filter size={16} className="inline mr-2 text-cyber-magenta" />
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field bg-white/5 border-white/10 text-white"
          >
            <option value="all" className="bg-cyber-dark text-white">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} className="bg-cyber-dark text-white">
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No expenses found</p>
              <p className="text-sm mt-2">Add expenses from the Dashboard</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-5 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5"
                        style={{ backgroundColor: `${expense.category.color}15` }}
                      >
                        <IconComponent
                          name={expense.category.icon}
                          className="text-current"
                          size={20}
                          style={{ color: expense.category.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate text-lg">
                            {expense.description}
                          </h3>
                          <span
                            className="px-2 py-0.5 text-xs font-semibold rounded-lg border border-white/5"
                            style={{
                              backgroundColor: `${expense.category.color}15`,
                              color: expense.category.color,
                            }}
                          >
                            {expense.category.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {new Date(expense.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-white tracking-tight">
                          {formatCurrency(parseFloat(expense.amount.toString()))}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 hover:bg-cyber-cyan/10 rounded-lg transition-colors border border-transparent hover:border-cyber-cyan/20"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-cyber-cyan" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        <ExpenseForm
          categories={categories}
          onSuccess={handleExpenseUpdated}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
          }}
          editExpense={editingExpense || undefined}
        />
      </Modal>
    </div>
  );
};
