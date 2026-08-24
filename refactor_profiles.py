import os
import re

print("Refactoring schema.sql...")
with open("supabase/schema.sql", "r") as f:
    schema = f.read()

profile_table = """
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

"""

# Insert profile_table right after extension
schema = schema.replace('create extension if not exists "uuid-ossp";', 'create extension if not exists "uuid-ossp";\n' + profile_table)

# Add profile_id to tables
tables = ["financial_cycle_config", "accounts", "categories", "tags", "transactions", "recurring_rules", "budgets"]
for t in tables:
    # replace `user_id uuid not null references auth.users(id) on delete cascade,`
    # with `user_id uuid not null references auth.users(id) on delete cascade,\n  profile_id uuid not null references profiles(id) on delete cascade,`
    schema = re.sub(
        rf'create table if not exists {t} \(\n  id uuid primary key default uuid_generate_v4\(\),\n  user_id uuid not null references auth.users\(id\) on delete cascade,',
        f'create table if not exists {t} (\n  id uuid primary key default uuid_generate_v4(),\n  user_id uuid not null references auth.users(id) on delete cascade,\n  profile_id uuid not null references profiles(id) on delete cascade,',
        schema
    )

# Fix unique constraints
schema = schema.replace('unique(user_id)', 'unique(profile_id)')
schema = schema.replace('unique(user_id, name)', 'unique(profile_id, name)')
schema = schema.replace('unique(user_id, category_id, cycle_year, cycle_month)', 'unique(profile_id, category_id, cycle_year, cycle_month)')

# Add RLS for profiles
schema = schema.replace('-- Policies:', 'alter table profiles enable row level security;\n\n-- Policies:\ncreate policy "user_own_profiles" on profiles\n  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);\n')

with open("supabase/schema.sql", "w") as f:
    f.write(schema)


print("Refactoring domain.ts...")
with open("src/types/domain.ts", "r") as f:
    domain = f.read()

profile_type = """
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

"""

domain = domain.replace('export type AccountType', profile_type + 'export type AccountType')

# Add profile_id to all interfaces that have user_id
domain = re.sub(r'  user_id: string;\n', r'  user_id: string;\n  profile_id: string;\n', domain)

with open("src/types/domain.ts", "w") as f:
    f.write(domain)


print("Refactoring hooks...")
import glob
hooks = glob.glob("src/hooks/*.ts")
for h in hooks:
    if "use-mobile.ts" in h:
        continue
    with open(h, "r") as f:
        content = f.read()

    # Add ProfileContext import
    if 'useAuth' in content:
        content = content.replace('import { useAuth } from "@/contexts/AuthContext";', 'import { useAuth } from "@/contexts/AuthContext";\nimport { useProfile } from "@/contexts/ProfileContext";')

    # Update useAuth() to include useProfile()
    content = content.replace('const { user } = useAuth();', 'const { user } = useAuth();\n  const { activeProfile } = useProfile();')

    # Update queryKeys
    content = re.sub(r'queryKey: \["(.*?)", user\?\.id\]', r'queryKey: ["\1", user?.id, activeProfile?.id]', content)
    content = re.sub(r'queryKey: \["(.*?)", user\?\.id, (.*?)\]', r'queryKey: ["\1", user?.id, activeProfile?.id, \2]', content)

    # Update enabled: !!user -> enabled: !!user && !!activeProfile
    content = content.replace('enabled: !!user', 'enabled: !!user && !!activeProfile')
    content = content.replace('if (!user) return [];', 'if (!user || !activeProfile) return [];')
    content = content.replace('if (!user) return null;', 'if (!user || !activeProfile) return null;')
    
    # Check mutations
    content = content.replace('if (!user) throw new Error("Not authenticated");', 'if (!user || !activeProfile) throw new Error("Not authenticated or no active profile");')
    
    # Update eq("user_id", user.id) -> eq("user_id", user.id).eq("profile_id", activeProfile.id)
    content = content.replace('.eq("user_id", user.id)', '.eq("user_id", user.id)\n        .eq("profile_id", activeProfile.id)')

    # Update inserts
    content = re.sub(r'insert\(\[\{ (.*?)user_id: user\.id(.*?)\} \]\)', r'insert([{ \1user_id: user.id, profile_id: activeProfile.id\2} ])', content)

    with open(h, "w") as f:
        f.write(content)

