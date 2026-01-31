import { useState, useEffect } from 'react';
import { supabase, Budget, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useBudgets = (selectedMonth: string) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<(Budget & { category: Category })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    if (!user) {
      setBudgets([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .eq('month', selectedMonth);

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async (categoryId: string, amount: number) => {
    if (!user) return { error: 'No user authenticated' };

    try {
      // Check if budget exists
      const { data: existing } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .eq('month', selectedMonth)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('budgets')
          .update({ amount })
          .eq('id', existing.id);
        return { error };
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([{
            user_id: user.id,
            category_id: categoryId,
            month: selectedMonth,
            amount
          }]);
        return { error };
      }
    } catch (e: any) {
      return { error: e.message };
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, user]);

  return { budgets, loading, refetch: fetchBudgets, saveBudget };
};
