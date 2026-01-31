/*
  # Expense Tracker Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name (e.g., Food, Transport, Entertainment)
      - `color` (text) - Color code for visualization
      - `icon` (text) - Icon identifier
      - `created_at` (timestamp)
    
    - `budgets`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to categories)
      - `amount` (numeric) - Budget limit in INR
      - `month` (text) - Format: YYYY-MM
      - `created_at` (timestamp)
      - Unique constraint on (category_id, month)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to categories)
      - `amount` (numeric) - Expense amount in INR
      - `description` (text) - Expense description
      - `date` (date) - Expense date
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public access policies for demo purposes (no auth required)
    - In production, these should be restricted to authenticated users

  3. Important Notes
    - All amounts stored in INR (Indian Rupees)
    - Month format is YYYY-MM for easy filtering
    - Categories have predefined colors for consistent visualization
    - Budgets are set per category per month
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, month)
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Public can insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update categories"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete categories"
  ON categories FOR DELETE
  USING (true);

CREATE POLICY "Public can read budgets"
  ON budgets FOR SELECT
  USING (true);

CREATE POLICY "Public can insert budgets"
  ON budgets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update budgets"
  ON budgets FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete budgets"
  ON budgets FOR DELETE
  USING (true);

CREATE POLICY "Public can read expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Public can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update expenses"
  ON expenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete expenses"
  ON expenses FOR DELETE
  USING (true);

INSERT INTO categories (name, color, icon) VALUES
  ('Food & Dining', '#10b981', 'utensils'),
  ('Transport', '#3b82f6', 'car'),
  ('Shopping', '#f59e0b', 'shopping-bag'),
  ('Entertainment', '#ec4899', 'film'),
  ('Bills & Utilities', '#ef4444', 'receipt'),
  ('Healthcare', '#8b5cf6', 'heart-pulse'),
  ('Education', '#06b6d4', 'book'),
  ('Others', '#6b7280', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;