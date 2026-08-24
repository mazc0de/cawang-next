-- 1. Create profiles table
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
do $$ begin
  create policy "user_own_profiles" on profiles
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- 2. Create default profiles for existing users
insert into profiles (user_id, name, is_default)
select id, 'Personal', true from auth.users
where not exists (select 1 from profiles where profiles.user_id = auth.users.id);

-- 3. Add profile_id to all tables
alter table financial_cycle_config add column if not exists profile_id uuid references profiles(id) on delete cascade;
update financial_cycle_config set profile_id = (select id from profiles where profiles.user_id = financial_cycle_config.user_id limit 1) where profile_id is null;
alter table financial_cycle_config alter column profile_id set not null;

alter table accounts add column if not exists profile_id uuid references profiles(id) on delete cascade;
update accounts set profile_id = (select id from profiles where profiles.user_id = accounts.user_id limit 1) where profile_id is null;
alter table accounts alter column profile_id set not null;

alter table categories add column if not exists profile_id uuid references profiles(id) on delete cascade;
update categories set profile_id = (select id from profiles where profiles.user_id = categories.user_id limit 1) where profile_id is null;
alter table categories alter column profile_id set not null;

alter table tags add column if not exists profile_id uuid references profiles(id) on delete cascade;
update tags set profile_id = (select id from profiles where profiles.user_id = tags.user_id limit 1) where profile_id is null;
alter table tags alter column profile_id set not null;

alter table transactions add column if not exists profile_id uuid references profiles(id) on delete cascade;
update transactions set profile_id = (select id from profiles where profiles.user_id = transactions.user_id limit 1) where profile_id is null;
alter table transactions alter column profile_id set not null;

alter table recurring_rules add column if not exists profile_id uuid references profiles(id) on delete cascade;
update recurring_rules set profile_id = (select id from profiles where profiles.user_id = recurring_rules.user_id limit 1) where profile_id is null;
alter table recurring_rules alter column profile_id set not null;

alter table budgets add column if not exists profile_id uuid references profiles(id) on delete cascade;
update budgets set profile_id = (select id from profiles where profiles.user_id = budgets.user_id limit 1) where profile_id is null;
alter table budgets alter column profile_id set not null;

-- 4. Update Unique Constraints
alter table financial_cycle_config drop constraint if exists financial_cycle_config_user_id_key;
alter table financial_cycle_config drop constraint if exists financial_cycle_config_profile_id_key;
alter table financial_cycle_config add constraint financial_cycle_config_profile_id_key unique(profile_id);

alter table tags drop constraint if exists tags_user_id_name_key;
alter table tags drop constraint if exists tags_profile_id_name_key;
alter table tags add constraint tags_profile_id_name_key unique(profile_id, name);

alter table budgets drop constraint if exists budgets_user_id_category_id_cycle_year_cycle_month_key;
alter table budgets drop constraint if exists budgets_profile_id_category_id_cycle_year_cycle_month_key;
alter table budgets add constraint budgets_profile_id_category_id_cycle_year_cycle_month_key unique(profile_id, category_id, cycle_year, cycle_month);

-- 5. Fix Trigger for New Users
create or replace function create_default_categories_for_user(p_user_id uuid, p_profile_id uuid)
returns void as $$
begin
  insert into categories (user_id, profile_id, name, icon, color, type) values
    (p_user_id, p_profile_id, 'Makan & Minum',    '🍜', '#f97316', 'outflow'),
    (p_user_id, p_profile_id, 'Transport',         '🚗', '#3b82f6', 'outflow'),
    (p_user_id, p_profile_id, 'Belanja',           '🛒', '#a855f7', 'outflow'),
    (p_user_id, p_profile_id, 'Tagihan & Utilitas','💡', '#eab308', 'outflow'),
    (p_user_id, p_profile_id, 'Kesehatan',         '💊', '#ef4444', 'outflow'),
    (p_user_id, p_profile_id, 'Hiburan',           '🎬', '#ec4899', 'outflow'),
    (p_user_id, p_profile_id, 'Pendidikan',        '📚', '#06b6d4', 'outflow'),
    (p_user_id, p_profile_id, 'Lain-lain',         '📦', '#94a3b8', 'outflow'),
    (p_user_id, p_profile_id, 'Gaji',              '💰', '#22c55e', 'inflow'),
    (p_user_id, p_profile_id, 'Pendapatan Lain',   '💵', '#6ee7b7', 'inflow');
end;
$$ language plpgsql security definer;

create or replace function handle_new_user()
returns trigger as $$
declare
  v_profile_id uuid;
begin
  insert into profiles (user_id, name, is_default)
  values (new.id, 'Personal', true)
  returning id into v_profile_id;

  insert into financial_cycle_config (user_id, profile_id, start_day)
  values (new.id, v_profile_id, 1)
  on conflict (profile_id) do nothing;

  perform create_default_categories_for_user(new.id, v_profile_id);
  return new;
end;
$$ language plpgsql security definer;
