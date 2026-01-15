-- FIX SCRIPT: RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure Enum Exists and has values (Safe operation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'seller', 'buyer');
    ELSE
        -- Attempt to add values if they don't exist (Postgres 12+)
        -- Note: If this fails, it likely means the value exists. We catch errors just in case.
        BEGIN
            ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'seller';
        EXCEPTION WHEN OTHERS THEN NULL; END;
        BEGIN
            ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'buyer';
        EXCEPTION WHEN OTHERS THEN NULL; END;
        BEGIN
            ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
        EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;
END$$;

-- 2. Drop existing Trigger & Function to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create the Function with Robust Logic (SECURITY DEFINER is key)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  -- Default to buyer if anything goes wrong with metadata
  target_role public.user_role := 'buyer';
  raw_role text;
BEGIN
  -- Extract raw role from metadata safely
  raw_role := new.raw_user_meta_data->>'role';

  -- Normalize and Assert Role
  IF raw_role = 'seller' THEN
    target_role := 'seller';
  ELSIF raw_role = 'admin' THEN
    target_role := 'admin';
  ELSIF raw_role = 'buyer' THEN
    target_role := 'buyer';
  ELSE
    -- Fallback or Force Default (Safety net)
    target_role := 'buyer';
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    target_role
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Raise exception to rollback the transaction in auth.users
    -- This ensures we don't have a user without a profile.
    RAISE EXCEPTION 'Trigger Error: Failed to create profile for user. Detail: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach the Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Permission Check (Just to be safe)
GRANT ALL ON public.profiles TO postgres, service_role, dashboard_user;
-- Ensure the function runs as owner (usually postgres) which has rights
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
