-- ======================================================
-- PROD-READY SEED DATA: WealthWise AI V2
-- This demonstrates the population of encrypted and AI-native fields.
-- ======================================================

-- 1. Create a Primary User
INSERT INTO users (id, email, password_hash, phone_encrypted, full_name_encrypted, kyc_status)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'investor.demo@example.com',
    '$2b$12$LQvPHi7vNfN.Iu8r1e6.E.M.Y.H.A.S.H.S.A.M.P.L.E', -- Mock hash
    'enc_v1_009988776655', -- Mock AES-256 encrypted phone
    'enc_v1_SitaRam_Finvoy', -- Mock AES-256 encrypted name
    'VERIFIED'
);

-- 2. User Preferences
INSERT INTO user_preferences (user_id, language, tax_regime, ai_persona)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'en-IN',
    'NEW',
    'ZEN'
);

-- 3. Bank Account via AA
INSERT INTO bank_accounts (id, user_id, provider_id, bank_name, account_type, account_number_masked, account_id_encrypted, aa_consent_id, consent_expiry)
VALUES (
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'finvu-001',
    'HDFC Bank',
    'SAVINGS',
    'XXXXXX4321',
    'enc_bank_id_9988',
    'CONSENT-AA-HDFC-2024-001',
    '2025-05-10 23:59:59+05:30'
);

-- 4. Transactions with Metadata
INSERT INTO transactions (id, bank_account_id, user_id, amount_encrypted, description_cleaned, category, transaction_date, external_ref_id, metadata)
VALUES 
(
    uuid_generate_v4(),
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'enc_amt_1500.00', -- ₹1500
    'Zomato Limited - Food Delivery',
    'FOOD_DINING',
    CURRENT_DATE - INTERVAL '1 day',
    'UTR-20240510-ZOMATO-001',
    '{"gst_status": "tracked", "merchant_city": "Mumbai", "payment_mode": "UPI"}'
),
(
    uuid_generate_v4(),
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'enc_amt_45000.00', -- ₹45000
    'HDFC ELSS Tax Saver Fund',
    'INVESTMENT',
    CURRENT_DATE - INTERVAL '5 days',
    'UTR-20240505-ELSS-999',
    '{"tax_benefit_section": "80C", "is_deductible": true}'
);

-- 5. AI Vector Mapping (RAG Link)
INSERT INTO transaction_embeddings (transaction_id, user_id, vector_db_id, embedding_model, context_text)
SELECT 
    id, 
    user_id, 
    'pinecone_vec_' || id, 
    'text-embedding-3-small',
    'User spent ' || description_cleaned || ' for amount of INR 1500. Category: ' || category
FROM transactions 
WHERE external_ref_id = 'UTR-20240510-ZOMATO-001';

-- 6. Audit Log Entry
INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, integrity_hash)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'INITIAL_AA_SYNC',
    'BANK_ACCOUNT',
    'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
    'sha256_mock_hash_log_id_001'
);
