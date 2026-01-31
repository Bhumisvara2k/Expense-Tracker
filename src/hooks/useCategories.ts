import { useState, useEffect } from 'react';
import { supabase, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const DEFAULT_CATEGORIES = [
    { name: 'Housing', color: '#F5FF33', icon: 'Home' },
    { name: 'Utilities', color: '#FF3333', icon: 'Zap' },
    { name: 'Food', color: '#FF5733', icon: 'Utensils' },
    { name: 'Transportation', color: '#33FF57', icon: 'Car' },
    { name: 'Insurance', color: '#3380FF', icon: 'Shield' },
    { name: 'Healthcare', color: '#FF33A8', icon: 'Heart' },
    { name: 'Savings & Investing', color: '#33FF8C', icon: 'PiggyBank' },
    { name: 'Debt Repayment', color: '#8C33FF', icon: 'CreditCard' },
    { name: 'Personal Care', color: '#FFB833', icon: 'Smile' },
    { name: 'Entertainment', color: '#F333FF', icon: 'Gamepad2' }
  ];

  const PREFERRED_ORDER = DEFAULT_CATEGORIES.map(c => c.name);

  const sortCategories = (cats: Category[]) => {
    return cats.sort((a, b) => {
      const indexA = PREFERRED_ORDER.indexOf(a.name);
      const indexB = PREFERRED_ORDER.indexOf(b.name);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { data: existingCategories, error } = await supabase
        .from('categories')
        .select('*');

      if (error) throw error;

      // Auto-seed missing categories
      if (existingCategories) {
        const existingNames = new Set(existingCategories.map(c => c.name));
        const missingCategories = DEFAULT_CATEGORIES.filter(dc => !existingNames.has(dc.name));

        // Cleanup 'Shopping' if it exists (Reverting previous addition)
        if (existingNames.has('Shopping')) {
          await supabase.from('categories').delete().eq('name', 'Shopping');
          fetchCategories();
          return;
        }

        if (missingCategories.length > 0) {
          console.log('Seeding missing categories:', missingCategories);
          const categoriesToInsert = missingCategories.map(c => ({
            ...c,
            user_id: user.id
          }));

          const { data: newCategories, error: insertError } = await supabase
            .from('categories')
            .insert(categoriesToInsert)
            .select();

          if (!insertError && newCategories) {
            const allCategories = [...existingCategories, ...newCategories];
            setCategories(sortCategories(allCategories));
            return;
          }
        }
      }

      setCategories(sortCategories(existingCategories || []));
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    if (!user) return { data: null, error: 'User not logged in' };

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCategories(prev => sortCategories([...prev, data]));
      return { data, error: null };
    } catch (error) {
      console.error('Error adding category:', error);
      return { data: null, error };
    }
  };

  return { categories, loading, error, refetch: fetchCategories, addCategory };
};
