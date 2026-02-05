-- ======================================================
-- SECURITY HARDENING: IMMUTABLE AUDIT LOGS
-- ======================================================

-- 1. Create function to prevent modifications
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'SECURITY ALERT: Modification of audit_logs is strictly prohibited. Audit trails are immutable.';
END;
$$ LANGUAGE plpgsql;

-- 2. Apply trigger to audit_logs table (Update and Delete)
DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;

CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

-- 3. Optimization: Add BRIN index for Time-Series Analysis on Transactions
-- (Handling millions of rows efficiently)
CREATE INDEX IF NOT EXISTS idx_transactions_date_brin 
ON transactions USING BRIN(transaction_date);

-- 4. Scale: Optimization for Aggregation Queries
-- Ensure covering index for Category + Amount aggregation
CREATE INDEX IF NOT EXISTS idx_transactions_category_amount 
ON transactions(category) INCLUDE (amount_encrypted);
