-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS & TYPES
-- Role Pengguna
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'seller', 'buyer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status Pesanan (Sesuai Spesifikasi 6.1)
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
      'pending_payment',
      'paid',
      'pending_confirmation',
      'accepted',
      'processing',
      'ready',
      'completed',
      'rejected',
      'cancelled_by_seller',
      'cancelled_by_buyer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Metode Pembayaran
DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cash', 'gateway', 'balance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Jenis Transaksi Saldo
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'payment', 'refund', 'platform_fee', 'sales_revenue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status Penarikan
DO $$ BEGIN
    CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES

-- PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'buyer',
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SHOPS (Toko)
CREATE TABLE IF NOT EXISTS shops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- Untuk URL toko (contoh: marketplace.com/kopi-kenangan)
  description TEXT,
  address TEXT,
  google_maps_link TEXT,
  whatsapp TEXT,
  logo_url TEXT,
  cover_url TEXT,
  social_links JSONB DEFAULT '{}'::JSONB, -- { "instagram": "...", "tiktok": "..." }
  bank_name TEXT,
  bank_account TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WALLETS (Sistem Saldo)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES (Global Categories used by all shops)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Default Categories
INSERT INTO categories (name) 
VALUES ('Makanan'), ('Minuman'), ('Camilan'), ('Favorit'), ('Lainnya')
ON CONFLICT (name) DO NOTHING;

-- PRODUCTS (Produk)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDERS (Pesanan)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE RESTRICT,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Null jika Guest
  guest_info JSONB, -- { "name": "...", "email": "...", "phone": "..." } jika Guest
  
  status order_status DEFAULT 'pending_payment',
  payment_method payment_method_enum NOT NULL,
  
  total_amount DECIMAL(12, 2) NOT NULL,
  platform_fee DECIMAL(12, 2) DEFAULT 0,
  gateway_fee DECIMAL(12, 2) DEFAULT 0,
  
  payment_details JSONB,
  snap_token TEXT, -- Token Midtrans
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDER ITEMS (Detail Barang dalam Pesanan)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(12, 2) NOT NULL, -- Harga saat beli (takutnya harga produk berubah)
  subtotal DECIMAL(12, 2) NOT NULL
);

-- WALLET_TRANSACTIONS (Riwayat Saldo)
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  type transaction_type NOT NULL,
  description TEXT,
  reference_id UUID, -- Bisa ID Order atau ID Withdrawal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WITHDRAWALS (Penarikan Saldo)
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Aktifkan RLS di semua tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policy Shops
DROP POLICY IF EXISTS "Shops are viewable by everyone" ON shops;
CREATE POLICY "Shops are viewable by everyone" 
ON shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can create shops" ON shops;
CREATE POLICY "Sellers can create shops" 
ON shops FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their shops" ON shops;
CREATE POLICY "Owners can update their shops" 
ON shops FOR UPDATE USING (auth.uid() = owner_id);

-- Policy Products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Shop owners can manage products" ON products;
CREATE POLICY "Shop owners can manage products" 
ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid())
);

-- Policy Wallets & Transactions (Simple for now: owners can see their own)
DROP POLICY IF EXISTS "Shop owners can view their wallet" ON wallets;
CREATE POLICY "Shop owners can view their wallet" 
ON wallets FOR SELECT USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = wallets.shop_id AND shops.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Shop owners can initialize their wallet" ON wallets;
CREATE POLICY "Shop owners can initialize their wallet" 
ON wallets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = wallets.shop_id AND shops.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Shop owners can view their transactions" ON wallet_transactions;
CREATE POLICY "Shop owners can view their transactions" 
ON wallet_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM wallets JOIN shops ON wallets.shop_id = shops.id WHERE wallets.id = wallet_transactions.wallet_id AND shops.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Shop owners can create withdrawal transactions" ON wallet_transactions;
CREATE POLICY "Shop owners can create withdrawal transactions" 
ON wallet_transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM wallets JOIN shops ON wallets.shop_id = shops.id WHERE wallets.id = wallet_transactions.wallet_id AND shops.owner_id = auth.uid())
);

-- Policy Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT USING (true);

-- Policy Orders
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own orders as buyer" ON orders;
CREATE POLICY "Users can view their own orders as buyer" ON orders FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Shop owners can manage their shop orders" ON orders;
CREATE POLICY "Shop owners can manage their shop orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Buyers can complete their own orders" ON orders;
CREATE POLICY "Buyers can complete their own orders" ON orders FOR UPDATE 
USING (auth.uid() = buyer_id AND status = 'ready')
WITH CHECK (status = 'completed');

-- Policy Order Items
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "View order items" ON order_items;
CREATE POLICY "View order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (
    orders.buyer_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid())
  ))
);

-- Policy Withdrawals
DROP POLICY IF EXISTS "Shop owners manage their withdrawals" ON withdrawals;
CREATE POLICY "Shop owners manage their withdrawals" ON withdrawals FOR ALL USING (
  EXISTS (SELECT 1 FROM wallets JOIN shops ON wallets.shop_id = shops.id WHERE wallets.id = withdrawals.wallet_id AND shops.owner_id = auth.uid())
);

-- 4. TRIGGERS & FUNCTIONS

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
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
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper Function: update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_shops_modtime ON shops;
CREATE TRIGGER update_shops_modtime BEFORE UPDATE ON shops FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_modtime ON orders;
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. STORAGE BUCKETS
-- Create bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Allow public access to product images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
