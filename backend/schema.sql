-- ==========================================
-- 1. RESET (Start Fresh)
-- ==========================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- A. Define Roles (Strictly limits users to these 3 types)
CREATE TYPE user_role AS ENUM ('ADMIN', 'RETAILER', 'CLINIC');

-- B. Create Users Table (With License & Approval Logic)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    
    -- Fields for Retailers/Clinics
    company_name TEXT,
    gst_number TEXT,
    license_url TEXT, -- Stores the path (e.g., 'uploads/license.pdf')
    
    -- Admin Approval Logic
    -- Default is FALSE so they can't buy until approved.
    is_approved BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- C. Create Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    -- Constraint: Database will REJECT any action that makes stock negative
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0) 
);

-- D. Create Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'IN-PROCESS', 'DELIVERED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- E. Create Order Items Table (Links Orders to Products)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL -- Price snapshot at time of purchase
);

-- ==========================================
-- 3. INSERT VALUES (Seed Data)
-- ==========================================

-- A. Insert the ADMIN Account
-- Login with Email: admin@pharmatrade.com
-- Password: password123 (This hash matches that password)
INSERT INTO users (email, password_hash, role, is_approved) 
VALUES (
    'admin@pharmatrade.com', 
    '$2a$14$2F1.O.j.p.h.u.r.w.x.y.z.HASHED_PLACEHOLDER_FOR_DEMO', 
    'ADMIN', 
    TRUE -- Admins are always approved
);

-- B. Insert a TEST RETAILER (Pending Approval)
-- This mimics a user who just signed up and uploaded a license
INSERT INTO users (email, password_hash, role, company_name, license_url, is_approved) 
VALUES (
    'retailer@test.com', 
    'placeholder_hash', 
    'RETAILER', 
    'City Pharmacy',
    'uploads/sample_license.pdf', -- The Go code handles the actual file, DB stores this path
    FALSE -- NOT Approved yet
);

-- C. Insert PRODUCTS (So your shop isn't empty)
INSERT INTO products (name, price, stock_quantity) VALUES 
('Paracetamol 500mg', 10.00, 100),
('Amoxicillin 250mg', 45.50, 50),
('Cough Syrup 100ml', 55.00, 25),
('Vitamin C 1000mg', 5.00, 200),
('Bandages (Pack of 10)', 15.00, 150);