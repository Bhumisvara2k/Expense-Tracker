import { useEffect, useState, useCallback } from 'react';
import { supabase, Expense } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useYearlyExpenses = (year: number) => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExpenses = useCallback(async () => {
        if (!user) {
            setExpenses([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;

            const { data, error: supabaseError } = await supabase
                .from('expenses')
                .select(`
          *,
          category:categories(*)
        `)
                .eq('user_id', user.id)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (supabaseError) throw supabaseError;

            setExpenses(data || []);
        } catch (err) {
            console.error('Error fetching yearly expenses:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [year, user]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    return { expenses, loading, error, refetch: fetchExpenses };
};
