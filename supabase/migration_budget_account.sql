-- Add account_id to budgets
alter table budgets add column if not exists account_id uuid references accounts(id) on delete cascade;

-- Update unique constraint to include account_id (treat nulls properly if needed, but in PG unique handles nulls loosely, meaning multiple nulls are allowed. We'll use a coalesce hack or just let PG 15 NULLS NOT DISTINCT work.
-- Actually, older PG: create unique index budgets_unique_idx on budgets(profile_id, category_id, cycle_year, cycle_month, coalesce(account_id, '00000000-0000-0000-0000-000000000000'));
-- But let's just drop the constraint and create a new one.

alter table budgets drop constraint if exists budgets_profile_id_category_id_cycle_year_cycle_month_key;

create unique index if not exists budgets_profile_id_category_id_account_id_cycle_year_cycle_month_idx 
on budgets (profile_id, category_id, cycle_year, cycle_month, coalesce(account_id, '00000000-0000-0000-0000-000000000000'));
