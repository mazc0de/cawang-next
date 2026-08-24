import re

with open("supabase/schema.sql", "r") as f:
    content = f.read()

# Add account_id to budgets table
content = content.replace(
    '  category_id uuid not null references categories(id) on delete cascade,\n  cycle_year smallint not null,',
    '  category_id uuid not null references categories(id) on delete cascade,\n  account_id uuid references accounts(id) on delete cascade,\n  cycle_year smallint not null,'
)

# Remove the unique constraint from table definition
content = content.replace(
    '  updated_at timestamptz not null default now(),\n  unique(profile_id, category_id, cycle_year, cycle_month)\n);',
    '  updated_at timestamptz not null default now()\n);'
)

# Add the unique index to the indexes section
index_sql = "create unique index if not exists budgets_profile_id_category_id_account_id_cycle_year_cycle_month_idx on budgets(profile_id, category_id, cycle_year, cycle_month, coalesce(account_id, '00000000-0000-0000-0000-000000000000'));"
content = content.replace(
    'create index if not exists idx_budgets_user_cycle on budgets(user_id, cycle_year, cycle_month);',
    'create index if not exists idx_budgets_user_cycle on budgets(user_id, cycle_year, cycle_month);\n' + index_sql
)

with open("supabase/schema.sql", "w") as f:
    f.write(content)
