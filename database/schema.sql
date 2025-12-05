-- ============================================================================
-- POSTGRESQL E-COMMERCE DATABASE SCHEMA (PRODUCTION)
-- Tables: Users, Products, Orders, OrderItems
-- No seed data - all data will be created via API calls
-- ============================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
\c ecommerce_db;

-- ============================================================================
-- CREATE ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'RETAILER', 'CLINIC');

-- ============================================================================
-- CREATE REUSABLE FUNCTION FOR UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    is_approved TEXT NOT NULL DEFAULT 'NO' CHECK (is_approved IN ('YES', 'NO')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_approved ON users(is_approved);

-- Create trigger for users updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Products table
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock_quantity);

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN-PROGRESS', 'DELIVERED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Orders table
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================

CREATE TABLE order_items (
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    PRIMARY KEY (order_id, product_id)
);

-- Create indexes for OrderItems table
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================

-- Password Hashing:
-- Use bcrypt in your Go application with cost factor 10-12
-- Example: bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

-- User Approval Workflow:
-- 1. New users register with is_approved = 'NO' (default)
-- 2. Admin reviews and approves users by updating is_approved = 'YES'
-- 3. Only approved users can access protected features (implement in Go middleware)

-- Stock Management:
-- When creating orders, decrease stock_quantity in a transaction
-- Check stock availability before allowing order creation
-- Handle stock_quantity < 0 constraint violation in Go code

-- Order Total Calculation:
-- Calculate total_amount by summing (quantity * unit_price) from order_items
-- Update orders.total_amount after inserting all order_items

-- Foreign Key Behaviors:
-- orders.user_id: ON DELETE CASCADE (if user deleted, their orders are deleted)
-- order_items.order_id: ON DELETE CASCADE (if order deleted, its items are deleted)
-- order_items.product_id: ON DELETE RESTRICT (cannot delete product if in any order)