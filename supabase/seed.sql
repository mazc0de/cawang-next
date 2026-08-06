-- ============================================================
-- CAWANG Seed Data — Default Categories
-- Jalankan setelah schema.sql berhasil dieksekusi
-- Catatan: categories ini bersifat "system default" — setiap user
-- bisa menambah categories sendiri, tapi ini adalah set awal
-- yang dibuat saat user pertama kali mendaftar via trigger atau
-- dijalankan manual di SQL Editor
-- ============================================================

-- Helper function: auto-create default categories untuk user baru
create or replace function create_default_categories_for_user(p_user_id uuid)
returns void as $$
begin
  insert into categories (user_id, name, icon, color, type) values
    -- EXPENSE categories
    (p_user_id, 'Makan & Minum',    '🍜', '#f97316', 'outflow'),
    (p_user_id, 'Transport',         '🚗', '#3b82f6', 'outflow'),
    (p_user_id, 'Belanja',           '🛒', '#a855f7', 'outflow'),
    (p_user_id, 'Tagihan & Utilitas','💡', '#eab308', 'outflow'),
    (p_user_id, 'Kesehatan',         '💊', '#ef4444', 'outflow'),
    (p_user_id, 'Hiburan',           '🎬', '#ec4899', 'outflow'),
    (p_user_id, 'Pendidikan',        '📚', '#06b6d4', 'outflow'),
    (p_user_id, 'Pakaian',           '👕', '#8b5cf6', 'outflow'),
    (p_user_id, 'Perawatan Diri',    '✨', '#f43f5e', 'outflow'),
    (p_user_id, 'Langganan',         '📱', '#64748b', 'outflow'),
    (p_user_id, 'Lain-lain',         '📦', '#94a3b8', 'outflow'),
    -- INCOME categories
    (p_user_id, 'Gaji',              '💰', '#22c55e', 'inflow'),
    (p_user_id, 'Freelance',         '💻', '#10b981', 'inflow'),
    (p_user_id, 'Investasi',         '📈', '#16a34a', 'inflow'),
    (p_user_id, 'Bonus',             '🎁', '#4ade80', 'inflow'),
    (p_user_id, 'Hadiah',            '🎀', '#86efac', 'inflow'),
    (p_user_id, 'Pendapatan Lain',   '💵', '#6ee7b7', 'inflow');
end;
$$ language plpgsql security definer;

-- Trigger: otomatis buat default categories saat user baru daftar
create or replace function handle_new_user()
returns trigger as $$
begin
  -- Buat financial cycle config default (mulai tanggal 1)
  insert into financial_cycle_config (user_id, start_day)
  values (new.id, 1)
  on conflict (user_id) do nothing;

  -- Buat default categories
  perform create_default_categories_for_user(new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger lama jika ada, lalu buat baru
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- Jika ingin test manual (untuk user yang sudah ada):
-- Ganti YOUR_USER_ID dengan user ID dari Supabase Auth dashboard
-- ============================================================
-- select create_default_categories_for_user('YOUR_USER_ID');
-- insert into financial_cycle_config (user_id, start_day) values ('YOUR_USER_ID', 1) on conflict do nothing;
