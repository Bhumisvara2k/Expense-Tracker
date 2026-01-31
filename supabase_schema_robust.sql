-- Check if user_id exists in expenses, if not add it
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'user_id') THEN
    ALTER TABLE expenses ADD COLUMN user_id uuid references auth.users;
  END IF;
END $$;

-- Check if user_id exists in budgets, if not add it
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budgets' AND column_name = 'user_id') THEN
    ALTER TABLE budgets ADD COLUMN user_id uuid references auth.users;
  END IF;
END $$;

-- Check if user_id exists in categories, if not add it
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'user_id') THEN
    ALTER TABLE categories ADD COLUMN user_id uuid references auth.users;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Individuals can create expenses." ON expenses;
DROP POLICY IF EXISTS "Individuals can view their own expenses." ON expenses;
DROP POLICY IF EXISTS "Individuals can update their own expenses." ON expenses;
DROP POLICY IF EXISTS "Individuals can delete their own expenses." ON expenses;

DROP POLICY IF EXISTS "Individuals can create budgets." ON budgets;
DROP POLICY IF EXISTS "Individuals can view their own budgets." ON budgets;
DROP POLICY IF EXISTS "Individuals can update their own budgets." ON budgets;
DROP POLICY IF EXISTS "Individuals can delete their own budgets." ON budgets;

DROP POLICY IF EXISTS "Users can view their own and default categories" ON categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

-- Re-create policies
-- Expenses
CREATE POLICY "Individuals can create expenses." 
ON expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Individuals can view their own expenses." 
ON expenses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Individuals can update their own expenses." 
ON expenses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Individuals can delete their own expenses." 
ON expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Individuals can create budgets." 
ON budgets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Individuals can view their own budgets." 
ON budgets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Individuals can update their own budgets." 
ON budgets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Individuals can delete their own budgets." 
ON budgets FOR DELETE 
USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users can view their own and default categories" 
ON categories FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own categories" 
ON categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON categories FOR DELETE 
USING (auth.uid() = user_id);

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
