-- 1. Hapus Trigger dan Function lama untuk memastikan bersih
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Pastikan ENUM user_role memiliki value yang lengkap
-- Kita gunakan blok DO untuk menangani jika type belum ada atau kurang value
DO $$ 
BEGIN
    -- Jika type belum ada, buat baru
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'seller', 'buyer');
    ELSE
        -- Jika type ada, coba tambahkan value satu per satu (ALTER TYPE ADD VALUE tidak bisa dalam transaction block di beberapa versi, tapi di DO block kadang bisa atau kita skip error)
        -- Cara aman: kita asumsikan type sudah ada. Jika error 'seller' not valid nanti, berarti enumnya rusak.
        -- Tapi biasanya ALTER TYPE ... ADD VALUE IF NOT EXISTS disupport di Postgres versi baru.
        -- Untuk aman di Supabase SQL Editor, kita skip ALTER jika ragu, namun create function di bawah akan gagal jika enum tidak match.
        NULL;
    END IF;
END $$;

-- Catatan: Jika perintah di atas gagal, jalankan baris ini secara terpisah:
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'seller';
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'buyer';


-- 3. Buat Ulang Function dengan Penanganan Error dan Casting yang Aman
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  extracted_role user_role;
BEGIN
  -- Tentukan role dengan logika aman
  IF (new.raw_user_meta_data->>'role') = 'seller' THEN
    extracted_role := 'seller'::user_role;
  ELSIF (new.raw_user_meta_data->>'role') = 'admin' THEN
    extracted_role := 'admin'::user_role;
  ELSE
    extracted_role := 'buyer'::user_role;
  END IF;

  -- Insert ke profiles
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'New User'), -- Default name jika null
    extracted_role
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Jika terjadi error, kita batalkan transaksi agar user tahu sign up gagal
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Pasang Kembali Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
