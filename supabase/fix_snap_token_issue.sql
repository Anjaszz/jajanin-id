-- DIAGNOSTIC & FIX: Check and add snap_token column
-- Run this in Supabase SQL Editor

-- 1. Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'snap_token';

-- 2. If no result above, add the column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS snap_token TEXT;

-- 3. Verify column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'snap_token';

-- 4. Check RLS policies on orders table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders';

-- 5. Update RLS policy to allow snap_token updates (if needed)
-- This ensures service_role can update snap_token
DROP POLICY IF EXISTS "Service role can manage all orders" ON orders;
CREATE POLICY "Service role can manage all orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Test update manually (replace with actual order ID)
-- UPDATE orders SET snap_token = 'test-token-123' WHERE id = 'YOUR_ORDER_ID_HERE';
