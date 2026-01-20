-- FIX: Allow updating snap_token for pending_payment orders
-- Run this in Supabase SQL Editor

-- Add policy to allow system to update snap_token for new orders
DROP POLICY IF EXISTS "System can update snap_token for pending orders" ON orders;
CREATE POLICY "System can update snap_token for pending orders" 
ON orders 
FOR UPDATE 
USING (status = 'pending_payment')
WITH CHECK (status = 'pending_payment');

-- Verify policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;
