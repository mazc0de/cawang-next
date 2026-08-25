-- Drop the old unique index that includes cycle_year and cycle_month
DROP INDEX IF EXISTS budgets_profile_id_category_id_account_id_cycle_year_cycle_month_idx;
DROP INDEX IF EXISTS idx_budgets_user_cycle;

-- Drop the columns cycle_year and cycle_month from the budgets table
ALTER TABLE budgets DROP COLUMN IF EXISTS cycle_year;
ALTER TABLE budgets DROP COLUMN IF EXISTS cycle_month;

-- Create the new unique index that only enforces uniqueness per profile, category, and account
CREATE UNIQUE INDEX IF NOT EXISTS budgets_profile_id_category_id_account_id_idx 
ON budgets(profile_id, category_id, coalesce(account_id, '00000000-0000-0000-0000-000000000000'));
