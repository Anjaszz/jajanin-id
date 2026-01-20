-- Add snap_token column to orders table if not exists
-- Run this in Supabase SQL Editor

DO $$ 
BEGIN
    -- Add snap_token column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'snap_token'
    ) THEN
        ALTER TABLE orders ADD COLUMN snap_token TEXT;
        RAISE NOTICE 'Column snap_token added to orders table';
    ELSE
        RAISE NOTICE 'Column snap_token already exists in orders table';
    END IF;
END $$;
