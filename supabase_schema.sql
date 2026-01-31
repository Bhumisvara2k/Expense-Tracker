-- Enable RLS on tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create profiles table if not exists (links to auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Policies for Expenses
create policy "Individuals can create expenses."
  on expenses for insert
  with check ( auth.uid() = user_id );

create policy "Individuals can view their own expenses. "
  on expenses for select
  using ( auth.uid() = user_id );

create policy "Individuals can update their own expenses."
  on expenses for update
  using ( auth.uid() = user_id );

create policy "Individuals can delete their own expenses."
  on expenses for delete
  using ( auth.uid() = user_id );

-- Repeat similar policies for 'budgets'
-- Note: You might need to add a 'user_id' column to expenses/budgets if it doesn't exist.
-- ALTER TABLE expenses ADD COLUMN user_id uuid references auth.users;
-- ALTER TABLE budgets ADD COLUMN user_id uuid references auth.users;
