/*
  # Add Monthly Archive Tables

  1. New Tables
    - `archived_expenses`
      - `id` (uuid, primary key)
      - `original_id` (uuid) - Original expense ID
      - `category_id` (uuid) - Reference to category
      - `amount` (numeric) - Expense amount in INR
      - `description` (text)
      - `date` (date)
      - `archive_month` (text) - Format: YYYY-MM of when it was archived
      - `created_at` (timestamp)
      - `archived_at` (timestamp)
    
    - `archived_budgets`
      - `id` (uuid, primary key)
      - `original_id` (uuid) - Original budget ID
      - `category_id` (uuid)
      - `amount` (numeric) - Budget limit
      - `month` (text) - Original month YYYY-MM
      - `archive_month` (text) - Format: YYYY-MM when archived
      - `created_at` (timestamp)
      - `archived_at` (timestamp)
    
    - `monthly_summaries`
      - `id` (uuid, primary key)
      - `month` (text, unique) - Format: YYYY-MM
      - `total_expenses` (numeric)
      - `total_budget` (numeric)
      - `categories_count` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all archive tables
    - Public access policies for demo purposes

  3. Important Notes
    - Archived data preserves original timestamps
    - Monthly summaries allow quick overview of past months
    - Old expenses and budgets are moved to archives automatically
*/

CREATE TABLE IF NOT EXISTS archived_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id uuid,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  archive_month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  archived_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS archived_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id uuid,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  month text NOT NULL,
  archive_month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  archived_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monthly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text UNIQUE NOT NULL,
  total_expenses numeric DEFAULT 0,
  total_budget numeric DEFAULT 0,
  categories_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE archived_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read archived expenses"
  ON archived_expenses FOR SELECT
  USING (true);

CREATE POLICY "Public can insert archived expenses"
  ON archived_expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read archived budgets"
  ON archived_budgets FOR SELECT
  USING (true);

CREATE POLICY "Public can insert archived budgets"
  ON archived_budgets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read monthly summaries"
  ON monthly_summaries FOR SELECT
  USING (true);

CREATE POLICY "Public can insert monthly summaries"
  ON monthly_summaries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update monthly summaries"
  ON monthly_summaries FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_archived_expenses_month ON archived_expenses(archive_month);
CREATE INDEX IF NOT EXISTS idx_archived_budgets_month ON archived_budgets(archive_month);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_month ON monthly_summaries(month);