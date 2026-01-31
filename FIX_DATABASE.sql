-- ============================================
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR
-- This will create all tables and allow adding expenses
-- ============================================

-- Drop existing tables if they exist (fresh start)
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- 1. CREATE CATEGORIES TABLE
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Circle',
    color TEXT DEFAULT '#06b6d4',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. CREATE EXPENSES TABLE
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT DEFAULT 'Expense',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. CREATE BUDGETS TABLE
CREATE TABLE public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    month TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(user_id, category_id, month)
);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- 5. CREATE SIMPLE POLICIES (Allow users to do everything with their own data)

-- Categories: Full access for own data
CREATE POLICY "categories_all" ON public.categories
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Expenses: Full access for own data
CREATE POLICY "expenses_all" ON public.expenses
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Budgets: Full access for own data
CREATE POLICY "budgets_all" ON public.budgets
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DONE! Refresh your app and try adding expenses.
-- ============================================
