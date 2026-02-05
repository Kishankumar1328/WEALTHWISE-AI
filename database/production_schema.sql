-- ======================================================
-- PROD-READY DATABASE SCHEMA: AI-powered Personal Finance (WealthWise AI V2)
-- Architecture: Multi-tenant, Secure, AI-Native (RAG)
-- Region: India (Tax & Cultural Awareness)
-- ======================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================
-- 1. ENUMS & TYPES
-- ======================================================

DO $$ BEGIN
    CREATE TYPE kyc_status_type AS ENUM ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED');
    CREATE TYPE tax_regime_type AS ENUM ('OLD', 'NEW');
    CREATE TYPE ai_persona_type AS ENUM ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'ZEN');
    CREATE TYPE account_type AS ENUM ('SAVINGS', 'CURRENT', 'CREDIT', 'INVESTMENT', 'LOAN', 'WALLET');
    CREATE TYPE sync_status_type AS ENUM ('SUCCESS', 'FAILED', 'PARTIAL', 'IN_PROGRESS');
    CREATE TYPE transaction_status_type AS ENUM ('PENDING', 'COMPLETED', 'REVERSED', 'FLAGGED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ======================================================
-- 2. CORE IDENTITY & AUTHENTICATION
-- ======================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    -- 🔐 PII Encryption Level: Application handles AES-256-GCM, DB stores as TEXT
    phone_encrypted TEXT, 
    full_name_encrypted TEXT,
    kyc_status kyc_status_type DEFAULT 'PENDING',
    is_mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret_encrypted TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 3. USER PREFERENCES (India Specific)
-- ======================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en-IN',
    tax_regime tax_regime_type DEFAULT 'NEW',
    ai_persona ai_persona_type DEFAULT 'MODERATE',
    currency CHAR(3) DEFAULT 'INR',
    is_realtime_sync_enabled BOOLEAN DEFAULT TRUE,
    notification_settings JSONB DEFAULT '{"push": true, "email": true, "whatsapp": false}',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 4. BANKING & ACCOUNT AGGREGATOR (AA)
-- ======================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id VARCHAR(100) NOT NULL, -- e.g., 'Finvu', 'Anumati'
    bank_name VARCHAR(100) NOT NULL,
    account_type account_type NOT NULL,
    -- 🔐 Account details are sensitive
    account_number_masked VARCHAR(20) NOT NULL, 
    account_id_encrypted TEXT NOT NULL, -- External ID from AA
    aa_consent_id VARCHAR(255) NOT NULL,
    consent_expiry TIMESTAMPTZ NOT NULL,
    -- Balance stored encrypted to prevent leaks
    balance_encrypted TEXT, 
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    status sync_status_type NOT NULL,
    records_fetched INTEGER DEFAULT 0,
    fetch_duration_ms INTEGER,
    error_message TEXT,
    request_id UUID, -- For tracing with AA provider
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 5. TRANSACTIONS (Financial Ledger)
-- ======================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    -- 🔐 Financial values are encrypted
    amount_encrypted TEXT NOT NULL, 
    currency CHAR(3) DEFAULT 'INR',
    -- Contextual data
    description_cleaned TEXT, -- AI-cleaned description
    merchant_name_encrypted TEXT,
    category VARCHAR(100), -- Standardized category
    subcategory VARCHAR(100),
    transaction_date DATE NOT NULL,
    status transaction_status_type DEFAULT 'COMPLETED',
    -- Metadata for India specifics (GST, UTR, etc)
    metadata JSONB DEFAULT '{}', 
    external_ref_id VARCHAR(255) UNIQUE, -- Unique ID from Bank/AA
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Partitioning Strategy (Conceptual for scale)
-- In real prod, we would partition transactions by transaction_date RANGE.

-- ======================================================
-- 6. AI & RAG LAYER (The Intelligence Engine)
-- ======================================================

-- 🤖 This table bridges structured SQL with Unstructured Vector DB (e.g., Pinecone/Chroma)
CREATE TABLE IF NOT EXISTS transaction_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    vector_db_id VARCHAR(255) NOT NULL, -- Point to ChromaDB/Pinecone ID
    embedding_model VARCHAR(100) NOT NULL,
    context_text TEXT, -- The "chunk" sent to LLM for embedding
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 7. AUDIT & COMPLIANCE (Immutable Logs)
-- ======================================================

-- 📜 Audit trails must never be deleted
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'LOGIN', 'VIEW_PII', 'EXPORT_DATA'
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    -- 🔐 HMAC digital signature of the log entry to detect tampering
    integrity_hash TEXT, 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) WITH (fillfactor = 100);

-- ======================================================
-- 8. PERFORMANCE & SECURITY POLICIES
-- ======================================================

-- Indices for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action_type);

-- Row Level Security (RLS) - Ensuring User Isolation at DB level
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Users can only see their own data
-- Note: 'current_user_id' would be set by the app session at runtime
CREATE POLICY user_isolation_policy ON transactions 
    USING (user_id = (current_setting('app.current_user_id'))::UUID);

-- ======================================================
-- 9. MAINTENANCE TRIGGERS
-- ======================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bank_accounts_modtime BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
