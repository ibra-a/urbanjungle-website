-- Setup cron jobs for Urban Jungle inventory sync
-- This mirrors the TH & CK setup but for Urban Jungle (UJ - GFH warehouse)

-- Function to call the auto-sync-uj-inventory Edge Function
CREATE OR REPLACE FUNCTION trigger_auto_sync_uj_inventory()
RETURNS VOID AS $$
DECLARE
    project_url TEXT := 'https://tcpsgddtixfqnenlsqyt.supabase.co';
    anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHNnZGR0aXhmcW5lbmxzcXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5ODE0NjIsImV4cCI6MjA3MDU1NzQ2Mn0.fdsFzm1fCRbUx_5S5lH8OJahAKTXCRphYOGD857ZyCw';
    service_role_key TEXT;
    request_id BIGINT;
BEGIN
    -- Retrieve service_role_key from Vault
    SELECT decrypted_secret INTO service_role_key FROM vault.decrypted_secrets WHERE name = 'service_role_key';

    IF service_role_key IS NULL THEN
        RAISE WARNING 'Service role key not found in Vault. Auto-sync UJ will not be authorized.';
        RETURN;
    END IF;

    -- Use pg_net to make async HTTP request
    SELECT net.http_post(
        url := project_url || '/functions/v1/auto-sync-uj-inventory',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || anon_key, -- Use anon key for Supabase's JWT validation
            'X-Internal-Key', service_role_key -- Use service_role_key for our internal validation
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 60000 -- 60 seconds timeout
    ) INTO request_id;
    
    RAISE NOTICE 'Triggered auto-sync-uj-inventory, request ID: %', request_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to trigger auto-sync UJ: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule auto-sync for Urban Jungle every 10 minutes (same as TH & CK)
SELECT cron.schedule(
    'auto-sync-uj-inventory',
    '*/10 * * * *',
    'SELECT trigger_auto_sync_uj_inventory()'
);

-- Note: cleanup-reservations already handles both tommy_products and urban_products
-- No additional cleanup cron job needed

