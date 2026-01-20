-- FIX SCRIPT V3: RUN THIS IN SUPABASE SQL EDITOR
-- Includes the 'phone' field and improved metadata extraction

-- 1. Ensure Enum Exists (Safe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'seller', 'buyer');
    END IF;
END$$;

-- 2. Drop existing Trigger & Function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create the Function with 'phone' support
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  target_role public.user_role := 'buyer';
  raw_role text;
BEGIN
  -- Extract raw role from metadata safely
  raw_role := new.raw_user_meta_data->>'role';

  -- Normalize Role
  IF raw_role = 'seller' THEN
    target_role := 'seller';
  ELSIF raw_role = 'admin' THEN
    target_role := 'admin';
  ELSE
    target_role := 'buyer';
  END IF;

  -- Insert into profiles including 'phone'
  INSERT INTO public.profiles (id, email, name, role, phone)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    target_role,
    new.raw_user_meta_data->>'phone'
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback everything if profile creation fails
    RAISE EXCEPTION 'Trigger Error: Failed to create profile. Error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach the Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Permissions
GRANT ALL ON public.profiles TO postgres, service_role, authenticated;
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
