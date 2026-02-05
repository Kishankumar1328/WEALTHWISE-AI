-- ======================================================
-- WealthWise AI - Sample Seed Data
-- ======================================================

-- 1. Insert Sample User (Password: password123)
INSERT INTO users (email, username, password, full_name, role, preferred_language, created_at, updated_at)
VALUES ('john@example.com', 'john_sharma', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uqqQ3a', 'John Sharma', 'USER', 'en', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Insert Sample Expenses
INSERT INTO expenses (user_id, amount, category, description, transaction_date, payment_method, merchant, created_at)
VALUES 
(1, 1500.00, 'FOOD_DINING', 'Dinner at Mainland China', CURRENT_DATE - INTERVAL '1 day', 'UPI', 'Mainland China', CURRENT_TIMESTAMP),
(1, 500.00, 'TRANSPORTATION', 'Uber to Office', CURRENT_DATE - INTERVAL '2 days', 'WALLET', 'Uber', CURRENT_TIMESTAMP),
(1, 12000.00, 'RENT', 'Monthly Rent', CURRENT_DATE - INTERVAL '5 days', 'NET_BANKING', 'Property Manager', CURRENT_TIMESTAMP),
(1, 2500.00, 'SHOPPING', 'Amaanon Order', CURRENT_DATE - INTERVAL '3 days', 'CREDIT_CARD', 'Amazon', CURRENT_TIMESTAMP),
(1, 800.00, 'UTILITIES', 'Electricity Bill', CURRENT_DATE - INTERVAL '4 days', 'UPI', 'BESCOM', CURRENT_TIMESTAMP);

-- 3. Insert Sample Budgets
INSERT INTO budgets (user_id, category, budget_amount, spent_amount, period, start_date, end_date, created_at)
VALUES 
(1, 'FOOD_DINING', 10000.00, 4500.00, 'MONTHLY', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'), CURRENT_TIMESTAMP),
(1, 'TRANSPORTATION', 5000.00, 2200.00, 'MONTHLY', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'), CURRENT_TIMESTAMP);

-- 4. Insert Sample Goals
INSERT INTO financial_goals (user_id, title, goal_type, target_amount, current_amount, target_date, priority, created_at)
VALUES 
(1, 'Buy a House', 'HOME_PURCHASE', 5000000.00, 1500000.00, '2028-12-31', 'HIGH', CURRENT_TIMESTAMP),
(1, 'Emergency Fund', 'EMERGENCY_FUND', 500000.00, 200000.00, '2026-06-30', 'CRITICAL', CURRENT_TIMESTAMP);
