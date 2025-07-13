-- Supabase Performance Optimization Script
-- Fixes unindexed foreign keys for better JOIN performance

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_bids_lead_id ON bids(lead_id);
CREATE INDEX IF NOT EXISTS idx_contractor_documents_contractor_id ON contractor_documents(contractor_id);
CREATE INDEX IF NOT EXISTS idx_leads_job_id ON leads(job_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_contractor_id ON payment_transactions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_contractor_id ON subscriptions(contractor_id);

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname IN (
        'idx_bids_lead_id',
        'idx_contractor_documents_contractor_id', 
        'idx_leads_job_id',
        'idx_payment_transactions_contractor_id',
        'idx_subscriptions_contractor_id'
    )
ORDER BY tablename, indexname;
