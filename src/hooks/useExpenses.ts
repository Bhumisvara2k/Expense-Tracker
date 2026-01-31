import { useState, useEffect } from 'react';
import { supabase, Expense, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useExpenses = (selectedMonth: string, selectedCategory: string) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<(Expense & { category: Category })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    if (!user) {
      setExpenses([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [year, month] = selectedMonth.split('-');
      const startDate = `${selectedMonth}-01`;

      // Get the last day of the month safely avoiding timezone issues
      const lastDay = new Date(parseInt(year), parseInt(month), 0);
      const endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      let query = supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedCategory, user]);

  return { expenses, loading, error, refetch: fetchExpenses };
};

