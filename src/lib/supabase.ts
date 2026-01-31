import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}
