-- ======================================================
-- WealthWise AI - Database Schema (PostgreSQL)
-- ======================================================

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone_number VARCHAR(15),
    profile_picture TEXT,
    role VARCHAR(20) DEFAULT 'USER' NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'en',
    preferred_currency VARCHAR(3) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Expenses Table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(200),
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(30),
    merchant VARCHAR(100),
    notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    receipt_url TEXT,
    tags VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Budgets Table
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL,
    budget_amount DECIMAL(12, 2) NOT NULL,
    spent_amount DECIMAL(12, 2) DEFAULT 0,
    period VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_ai_suggested BOOLEAN DEFAULT false,
    alert_threshold DECIMAL(3, 2) DEFAULT 0.80,
    alert_sent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Financial Goals Table
CREATE TABLE financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL,
    target_amount DECIMAL(14, 2) NOT NULL,
    current_amount DECIMAL(14, 2) DEFAULT 0,
    target_date DATE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL,
    monthly_contribution DECIMAL(12, 2),
    is_automated BOOLEAN DEFAULT false,
    icon_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Indices for Performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_expense_user_date ON expenses(user_id, transaction_date);
CREATE INDEX idx_budget_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_goals_user_status ON financial_goals(user_id, status);
