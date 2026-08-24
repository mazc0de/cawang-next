import re

with open("supabase/seed.sql", "r") as f:
    content = f.read()

# Replace the create_default_categories_for_user and handle_new_user with a version that uses profile_id
new_functions = """-- Helper function: auto-create default categories untuk user baru
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

-- Trigger: otomatis buat default categories saat user baru daftar
create or replace function handle_new_user()
returns trigger as $$
declare
  v_profile_id uuid;
begin
  -- Buat profile default dulu
  insert into profiles (user_id, name, is_default)
  values (new.id, 'Personal', true)
  returning id into v_profile_id;

  -- Buat financial cycle config default (mulai tanggal 1)
  insert into financial_cycle_config (user_id, profile_id, start_day)
  values (new.id, v_profile_id, 1)
  on conflict (profile_id) do nothing;

  -- Buat default categories
  perform create_default_categories_for_user(new.id, v_profile_id);

  return new;
end;
$$ language plpgsql security definer;
"""

content = re.sub(
    r'-- Helper function: auto-create default categories untuk user baru.*?language plpgsql security definer;\n',
    new_functions,
    content,
    flags=re.DOTALL
)

with open("supabase/seed.sql", "w") as f:
    f.write(content)
