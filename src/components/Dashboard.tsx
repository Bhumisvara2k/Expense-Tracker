import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Edit3 } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useExpenses } from '../hooks/useExpenses';
import { useYearlyExpenses } from '../hooks/useYearlyExpenses';
import { useBudgets } from '../hooks/useBudgets';
import { formatCurrency, getCurrentMonth, getMonthName, generateMonthOptions } from '../lib/utils';
import { Modal } from './Modal';
import { ExpenseForm } from './ExpenseForm';
import { CategoryForm } from './CategoryForm';
import { IconComponent } from './IconComponent';
import { Button } from './Button';

export const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [globalBudget, setGlobalBudget] = useState<number>(() => {
    const saved = localStorage.getItem('globalBudget');
    return saved ? parseFloat(saved) : 0;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const { categories, loading: categoriesLoading, error: categoriesError, addCategory } = useCategories();
  const { expenses, refetch: refetchExpenses } = useExpenses(selectedMonth, 'all');
  const { budgets, refetch: refetchBudgets, saveBudget } = useBudgets(selectedMonth);
  const { expenses: yearlyExpenses, refetch: refetchYearly } = useYearlyExpenses(selectedYear);

  const monthOptions = generateMonthOptions();

  const categoryExpenses = categories.map((category) => {
    const categoryTotal = expenses
      .filter((exp) => exp.category_id === category.id)
      .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

    const budget = budgets.find((b) => b.category_id === category.id);
    const budgetAmount = budget ? parseFloat(budget.amount.toString()) : 0; // Default to 0 if not set
    const percentage = budgetAmount > 0 ? (categoryTotal / budgetAmount) * 100 : 0;

    return {
      ...category,
      total: categoryTotal,
      budget: budgetAmount,
      percentage,
    };
  });

  const totalExpenses = categoryExpenses.reduce((sum, cat) => sum + cat.total, 0);
  const budgetPercentage = globalBudget > 0 ? (totalExpenses / globalBudget) * 100 : 0;

  useEffect(() => {
    localStorage.setItem('globalBudget', globalBudget.toString());
  }, [globalBudget]);

  const handleSaveGlobalBudget = () => {
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount >= 0) {
      setGlobalBudget(amount);
    }
    setIsEditingBudget(false);
    setBudgetInput('');
  };

  const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i; // 0 = Jan, 1 = Feb...
    const monthExpenses = yearlyExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === monthIndex && expDate.getFullYear() === selectedYear;
    });

    const total = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
    return {
      month: new Date(selectedYear, i).toLocaleString('default', { month: 'short' }),
      total,
      fullMonth: new Date(selectedYear, i).toLocaleString('default', { month: 'long' })
    };
  });

  const maxMonthlyExpense = Math.max(...monthlyTotals.map(m => m.total), 1);
  const activeMonthsCount = monthlyTotals.filter(m => m.total > 0).length;

  const handleExpenseAdded = () => {
    setIsModalOpen(false);
    refetchExpenses();
    refetchBudgets();
    refetchYearly();
  };

  const handleCategoryAdded = async (newCategory: any, initialBudget?: number) => {
    const { data, error } = await addCategory(newCategory);
    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    if (data && initialBudget && initialBudget > 0) {
      await saveBudget(data.id, initialBudget);
      refetchBudgets();
    }

    setIsCategoryModalOpen(false);
  };

  if (categoriesError) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center animate-pulse">
          <h2 className="text-xl font-bold text-red-500 mb-2">Database Connection Error</h2>
          <p className="text-gray-300 mb-4">"{categoriesError}"</p>
          <div className="bg-black/20 p-4 rounded-lg inline-block text-left">
            <p className="text-sm text-gray-400 mb-2 font-semibold">How to fix:</p>
            <ol className="list-decimal pl-5 text-sm text-gray-400 space-y-1">
              <li>Go to Supabase Dashboard &rarr; SQL Editor</li>
              <li>Run the contents of <code>supabase_complete_setup.sql</code></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your spending and budgets</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
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
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-xl cursor-pointer hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Add Expense</p>
              <p className="text-white/70 text-xs">Track spending</p>
            </div>
          </div>

        </div>
      </div>

      {/* Top Cards - Total Expenses with Budget */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/10 blur-[50px] rounded-full group-hover:bg-cyber-cyan/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyber-cyan/10 rounded-xl flex items-center justify-center border border-cyber-cyan/20">
                  <TrendingUp size={24} className="text-cyber-cyan" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Expenses</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>

              {/* Global Budget Setting */}
              <div className="text-right">
                {isEditingBudget ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      placeholder="Enter budget"
                      className="w-28 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyber-cyan"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveGlobalBudget}
                      className="px-3 py-1.5 bg-cyber-cyan text-black rounded-lg text-sm font-medium hover:bg-cyber-cyan/80 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setIsEditingBudget(false); setBudgetInput(''); }}
                      className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-gray-400 text-xs">Monthly Budget</p>
                      <p className="text-xl font-bold text-cyber-purple">
                        {globalBudget > 0 ? formatCurrency(globalBudget) : 'Not Set'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setIsEditingBudget(true); setBudgetInput(globalBudget.toString()); }}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Edit Budget"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Progress Bar */}
            {globalBudget > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className={budgetPercentage > 100 ? 'text-red-400' : 'text-cyber-cyan'}>
                    {budgetPercentage.toFixed(0)}% of budget used
                  </span>
                  <span className="text-gray-400">
                    {formatCurrency(globalBudget - totalExpenses)} remaining
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${budgetPercentage > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-cyber-cyan to-cyber-purple'}`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <p className="text-cyber-cyan/80 text-sm font-medium px-2 py-1 rounded-lg bg-cyber-cyan/10 inline-block">
              {getMonthName(selectedMonth)} Summary
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">

        {/* Category Breakdown */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-cyber-cyan rounded-full"></span>
              Category Breakdown
            </h2>
            <Button variant="ghost" onClick={() => setIsCategoryModalOpen(true)} className="text-xs">
              Manage Categories
            </Button>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryExpenses.map((category) => (
                <div
                  key={category.id}
                  className="bg-white/5 p-5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-cyber-cyan/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[30px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-cyber-cyan/10 transition-colors"></div>

                  <div className="relative z-10">
                    <div className="flex items-start mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 border border-white/5"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <IconComponent
                          name={category.icon}
                          className="text-current"
                          size={24}
                          style={{ color: category.color }}
                        />
                      </div>
                    </div>

                    <h3 className="text-gray-200 font-semibold mb-1 truncate" title={category.name}>{category.name}</h3>
                    <p className="text-xl font-bold text-white">{formatCurrency(category.total)}</p>
                  </div>
                </div>
              ))}

              {categoryExpenses.every((cat) => cat.total === 0) && (
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white/5 p-5 rounded-xl border border-dashed border-gray-700 hover:border-cyber-cyan hover:bg-cyber-cyan/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center h-[180px] group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus size={24} className="text-gray-400 group-hover:text-cyber-cyan transition-colors" />
                  </div>
                  <p className="text-gray-400 font-medium group-hover:text-white transition-colors">Add Expense</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Yearly Overview */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-cyber-purple rounded-full"></span>
              Yearly Overview
            </h2>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1 border border-white/5">
              <Calendar size={16} className="text-cyber-purple" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent text-white border-none focus:ring-0 text-sm font-medium cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year} className="bg-cyber-dark text-white">
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {monthlyTotals.map((data, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-cyber-purple/50 transition-all duration-300 group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 font-medium">{data.fullMonth}</span>
                  <span className="text-cyber-purple font-bold">{formatCurrency(data.total)}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyber-purple to-cyber-magenta rounded-full shadow-[0_0_10px_rgba(112,0,255,0.3)] transition-all duration-1000"
                    style={{ width: `${(data.total / maxMonthlyExpense) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center gap-4">
            <div className='flex items-center gap-2'>
              <p className='text-gray-400 text-sm'>Active Months: <span className='text-cyber-purple font-bold'>{activeMonthsCount}</span></p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Total {selectedYear}</span>
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-magenta">
                {formatCurrency(monthlyTotals.reduce((sum, m) => sum + m.total, 0))}
              </span>
            </div>
          </div>
        </div>

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          categories={categories}
          onSuccess={handleExpenseAdded}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

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
