-- ============================================================
-- CAWANG Database Schema
-- Berdasarkan domain model di CONTEXT.md
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (Workspaces)
-- ============================================================
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);



-- ============================================================
-- FINANCIAL CYCLE CONFIG
-- ============================================================
create table if not exists financial_cycle_config (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  start_day smallint not null default 1 check (start_day between 1 and 28),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id)
);

-- ============================================================
-- ACCOUNTS
-- Wadah uang nyata milik user (BCA, OVO, Cash, dll)
-- ============================================================
do $$ begin
  create type account_type as enum ('bank', 'e_wallet', 'cash');
exception when duplicate_object then null;
end $$;

create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  type account_type not null default 'bank',
  opening_balance bigint not null default 0, -- stored in IDR (sen = satuan terkecil)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- Label wajib per Transaction
-- ============================================================
do $$ begin
  create type transaction_type as enum ('inflow', 'outflow');
exception when duplicate_object then null;
end $$;

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  type transaction_type not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TAGS
-- Label opsional bebas per Transaction (many-to-many)
-- ============================================================
create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(profile_id, name)
);

-- ============================================================
-- TRANSACTIONS
-- Satu kejadian finansial nyata (inflow/outflow)
-- Transfer Pair: 2 Transaction ter-link via transfer_pair_id
-- ============================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid not null references categories(id),
  amount bigint not null check (amount > 0), -- selalu positif; type menentukan arah
  type transaction_type not null,
  date date not null,
  notes text,
  -- Transfer Pair: jika ini bagian dari transfer, simpan ID transaksi pasangannya
  transfer_pair_id uuid references transactions(id) on delete set null,
  -- Adjustment Transaction dari Reconciliation
  is_adjustment boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Junction table: Transaction ↔ Tag (many-to-many)
create table if not exists transaction_tags (
  transaction_id uuid not null references transactions(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (transaction_id, tag_id)
);

-- ============================================================
-- RECURRING RULES
-- Template jadwal → menghasilkan Transaction secara berkala
-- BUKAN Transaction itu sendiri
-- ============================================================
do $$ begin
  create type recurring_frequency as enum ('daily', 'weekly', 'monthly', 'yearly');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type recurring_posting_mode as enum ('auto_post', 'requires_confirmation');
exception when duplicate_object then null;
end $$;

create table if not exists recurring_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid not null references categories(id),
  amount bigint not null check (amount > 0),
  type transaction_type not null,
  frequency recurring_frequency not null,
  posting_mode recurring_posting_mode not null default 'requires_confirmation',
  next_due_date date not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BUDGETS
-- Alokasi per Category per Financial Cycle
-- ============================================================
create table if not exists budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  account_id uuid references accounts(id) on delete cascade,
  cycle_year smallint not null,
  cycle_month smallint not null check (cycle_month between 1 and 12),
  amount bigint not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Semua data terikat eksklusif ke satu user
-- ============================================================
alter table financial_cycle_config enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table transactions enable row level security;
alter table transaction_tags enable row level security;
alter table recurring_rules enable row level security;
alter table budgets enable row level security;

alter table profiles enable row level security;

-- Policies:
create policy "user_own_profiles" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- user hanya bisa akses data miliknya sendiri
create policy "user_own_financial_cycle_config" on financial_cycle_config
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_own_accounts" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_own_categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_own_tags" on tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_own_transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_own_transaction_tags" on transaction_tags
  for all using (
    exists (
      select 1 from transactions t
      where t.id = transaction_id and t.user_id = auth.uid()
    )
  );

create policy "user_own_recurring_rules" on recurring_rules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_own_budgets" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- INDEXES untuk performa query umum
-- ============================================================
create index if not exists idx_transactions_user_date on transactions(user_id, date desc);
create index if not exists idx_transactions_account on transactions(account_id);
create index if not exists idx_transactions_category on transactions(category_id);
create index if not exists idx_recurring_rules_user_due on recurring_rules(user_id, next_due_date) where is_active = true;
create index if not exists idx_budgets_user_cycle on budgets(user_id, cycle_year, cycle_month);
create unique index if not exists budgets_profile_id_category_id_account_id_cycle_year_cycle_month_idx on budgets(profile_id, category_id, cycle_year, cycle_month, coalesce(account_id, '00000000-0000-0000-0000-000000000000'));
