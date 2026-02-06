-- ======================================================
-- WealthWise AI - Database Reset Script
-- Drops old tables and recreates with corrected schema
-- ======================================================

-- Drop old budget structures (if they exist)
DROP TABLE IF EXISTS budget_categories CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;

-- Recreate budgets table with correct structure
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_budget_amount DECIMAL(12, 2) NOT NULL,
    period VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year, is_active)
);

-- Create budget categories table
CREATE TABLE budget_categories (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL,
    budget_amount DECIMAL(12, 2) NOT NULL,
    spent_amount DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(budget_id, category)
);

-- Create necessary indices
CREATE INDEX idx_budget_user_period ON budgets(user_id, start_date, end_date);
CREATE INDEX idx_budget_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_budget_category_budget ON budget_categories(budget_id);

-- Verify tables were created
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('budgets', 'budget_categories');
