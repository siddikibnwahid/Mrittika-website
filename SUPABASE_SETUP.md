# Supabase Database Setup Guide

Follow these instructions to set up your Supabase database for the **Mrittika** premium organic mango store.

---

## 1. Database Schema

Run the following SQL script in the **Supabase SQL Editor** (available in your Supabase dashboard at **SQL Editor > New Query**):

```sql
-- 1. Create Products Table (Admin-managed)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  base_price INTEGER NOT NULL CHECK (base_price > 0),
  in_stock BOOLEAN DEFAULT true,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'delivery_manager', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Orders Table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('inside_dhaka', 'outside_dhaka')),
  shipping_cost INTEGER NOT NULL CHECK (shipping_cost >= 0),
  items JSONB NOT NULL, -- Format: [{productId, name, slug, quantityKg, pricePerKg, discountedPricePerKg, lineTotal, freeShipping}]
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  discount_amount INTEGER DEFAULT 0 CHECK (discount_amount >= 0),
  promo_code TEXT,
  total INTEGER NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'mobile_banking')),
  sender_account TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 2. Automated Profile Trigger

To automatically create a profile in the `public.profiles` table whenever a user registers through Supabase Auth, run the following trigger SQL:

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'staff' -- Default role. You can update this to 'admin' or 'delivery_manager' manually.
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 3. Seed Initial Products

Populate the database with the initial premium varieties of Chapai Nawabganj mangoes:

```sql
INSERT INTO public.products (name, slug, base_price, in_stock, description, image_url)
VALUES
  (
    'Gopalbhog',
    'gopalbhog',
    130,
    true,
    'The sweetest small mango of Chapai. Rich aroma, intense sweetness, golden skin.',
    '/gopalbhog.png'
  ),
  (
    'Himsagar',
    'himsagar',
    150,
    true,
    'The king of mangoes. Fiberless, creamy pulp with an incomparable golden flavour.',
    '/himsagar.png'
  ),
  (
    'Langra',
    'langra',
    140,
    true,
    'A classic favourite. Tangy-sweet balance with green skin and saffron-hued flesh.',
    '/langra.png'
  ),
  (
    'Fajli',
    'fajli',
    120,
    true,
    'The giant of mangoes. Mild, juicy, perfect for slicing. Ideal for families.',
    '/fajli.png'
  );
```

---

## 4. Row Level Security (RLS) Policies

Enable Row Level Security and configure access controls:

```sql
-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ------------------------------
-- A. Products Policies
-- ------------------------------
CREATE POLICY "Allow public read access to products" 
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow admins to modify products" 
  ON public.products FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------
-- B. Profiles Policies
-- ------------------------------
CREATE POLICY "Allow users to read own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow admins to read all profiles" 
  ON public.profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------
-- C. Orders Policies
-- ------------------------------
CREATE POLICY "Allow anyone to place orders" 
  ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow staff to read/update assigned orders" 
  ON public.orders FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'delivery_manager', 'staff')
    )
  );
```

---

## 5. Setting Up Roles

Once your first staff member registers, their default role is `staff` (which has pending access). To grant them **Admin** or **Delivery Manager** role, run this SQL in your Supabase dashboard:

```sql
-- To make a user an Admin:
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'USER_UUID_HERE';

-- To make a user a Delivery Manager:
UPDATE public.profiles 
SET role = 'delivery_manager' 
WHERE id = 'USER_UUID_HERE';
```
*(Replace `'USER_UUID_HERE'` with the UUID from the `profiles` or auth list.)*
