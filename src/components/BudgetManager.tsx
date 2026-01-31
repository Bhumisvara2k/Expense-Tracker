import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useBudgets } from '../hooks/useBudgets';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency, getCurrentMonth, getMonthName, generateMonthOptions } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { IconComponent } from './IconComponent';
import { Button } from './Button';
import { Modal } from './Modal';
import { CategoryForm } from './CategoryForm';

import { useAuth } from '../contexts/AuthContext';

export const BudgetManager = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [editingBudgets, setEditingBudgets] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const { categories, addCategory } = useCategories();
  const { budgets, refetch: refetchBudgets } = useBudgets(selectedMonth);
  const { expenses } = useExpenses(selectedMonth, 'all');

  const monthOptions = generateMonthOptions();

  const handleCategoryAdded = async (newCategory: any) => {
    const { error } = await addCategory(newCategory);
    if (!error) {
      setIsCategoryModalOpen(false);
    }
  };

  const categoryBudgets = categories.map((category) => {
    const budget = budgets.find((b) => b.category_id === category.id);
    const spent = expenses
      .filter((exp) => exp.category_id === category.id)
      .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

    const budgetAmount = budget ? parseFloat(budget.amount.toString()) : 1000;
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
    const remaining = budgetAmount - spent;

    return {
      ...category,
      budgetId: budget?.id,
      budgetAmount,
      spent,
      percentage,
      remaining,
    };
  });

  const handleBudgetChange = (categoryId: string, value: string) => {
    setEditingBudgets((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handleSaveBudget = async (categoryId: string) => {
    const amount = editingBudgets[categoryId];
    if (!amount || parseFloat(amount) < 0) return;

    if (!user) {
      alert('You must be logged in to save budgets.');
      return;
    }

    setSaving(true);
    try {
      const existingBudget = budgets.find((b) => b.category_id === categoryId);

      if (existingBudget) {
        const { error } = await supabase
          .from('budgets')
          .update({ amount: parseFloat(amount) })
          .eq('id', existingBudget.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([{
            category_id: categoryId,
            amount: parseFloat(amount),
            month: selectedMonth,
            user_id: user.id
          }]);

        if (error) throw error;
      }

      setEditingBudgets((prev) => {
        const updated = { ...prev };
        delete updated[categoryId];
        return updated;
      });

      refetchBudgets();
    } catch (error: any) {
      console.error('Error saving budget:', error);
      const message = error.message || 'Unknown error';
      alert(`Failed to save budget: ${message}. Please ensure the database schema is updated.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Budget Manager</h1>
          <p className="text-gray-400 mt-1">Set and track your monthly budget limits</p>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-field max-w-[200px] bg-cyber-gray border-white/10 text-white"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month} className="bg-cyber-dark text-white">
              {getMonthName(month)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categoryBudgets.map((category) => {
          const isEditing = editingBudgets[category.id] !== undefined;
          const currentValue = isEditing
            ? editingBudgets[category.id]
            : category.budgetAmount.toString();

          return (
            <div
              key={category.id}
              className="glass-card p-6 rounded-2xl relative group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <IconComponent
                    name={category.icon}
                    className="text-current"
                    size={24}
                    style={{ color: category.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white mb-1">
                    {category.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    Budget Amount (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="100"
                      value={currentValue}
                      onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                      className="flex-1 input-field bg-white/5 border-white/10 text-xl font-bold font-mono"
                      placeholder="0"
                    />
                    {(isEditing || currentValue !== category.budgetAmount.toString()) && (
                      <Button
                        onClick={() => handleSaveBudget(category.id)}
                        disabled={saving}
                        className="px-6"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    )}
                  </div>
                </div>

                {category.budgetAmount > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-sm text-gray-400">Spent</p>
                        <p className="text-lg font-bold text-white">
                          {formatCurrency(category.spent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Remaining</p>
                        <p
                          className={`text-lg font-bold ${category.remaining < 0 ? 'text-red-400' : 'text-cyber-cyan'
                            }`}
                        >
                          {formatCurrency(Math.abs(category.remaining))}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span
                          className={`font-bold ${category.percentage > 100 ? 'text-red-400' : 'text-white'
                            }`}
                        >
                          {category.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${category.percentage > 100
                            ? 'bg-red-500 text-red-500'
                            : category.percentage > 80
                              ? 'bg-yellow-500 text-yellow-500'
                              : 'bg-cyber-cyan text-cyber-cyan'
                            }`}
                          style={{ width: `${Math.min(category.percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {category.percentage > 100 && (
                      <div className="mt-4 flex items-start gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300 font-medium">
                          You've exceeded your budget by {formatCurrency(Math.abs(category.remaining))}
                        </p>
                      </div>
                    )}

                    {category.percentage > 80 && category.percentage <= 100 && (
                      <div className="mt-4 flex items-start gap-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-300 font-medium">
                          You're approaching your budget limit
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Create New Category"
      >
        <CategoryForm
          onSuccess={handleCategoryAdded}
          onCancel={() => setIsCategoryModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
