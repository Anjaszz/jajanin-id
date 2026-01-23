-- Create shadow wallet table for guests
CREATE TABLE IF NOT EXISTS guest_balances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update handle_new_user to migrate shadow balance
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  guest_bal DECIMAL(12, 2);
  new_wallet_id UUID;
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (id, email, name, role, phone)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'seller' THEN 'seller'::user_role
      WHEN (new.raw_user_meta_data->>'role') = 'admin' THEN 'admin'::user_role
      ELSE 'buyer'::user_role
    END,
    new.raw_user_meta_data->>'phone'
  );
  
  -- 2. Check for Guest Balance (Shadow Wallet)
  SELECT balance INTO guest_bal FROM public.guest_balances WHERE email = new.email;
  
  -- 3. Create Wallet for Buyer (with migrated balance if exists)
  -- Periksa apakah role adalah buyer atau role tidak didefinisikan (default buyer)
  IF (COALESCE(new.raw_user_meta_data->>'role', 'buyer') = 'buyer') THEN
    INSERT INTO public.wallets (user_id, balance)
    VALUES (new.id, COALESCE(guest_bal, 0))
    RETURNING id INTO new_wallet_id;
    
    -- 4. If balance migrated, record transaction and delete from guest_balances
    IF guest_bal > 0 THEN
      INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
      VALUES (new_wallet_id, guest_bal, 'deposit', 'Migrasi saldo dari Guest Email');
      
      DELETE FROM public.guest_balances WHERE email = new.email;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
