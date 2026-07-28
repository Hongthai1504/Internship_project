-- create database
CREATE DATABASE IF NOT EXISTS internship_project;
USE internship_project;

-- 1. Users table
CREATE TABLE USERS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role ENUM('customer', 'admin') DEFAULT 'customer'
);

-- 2. Categories table
CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 3. Products table
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(255),
    Foreign Key (category_id) REFERENCES Categories(id)
);

-- 4. Orders table
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    status ENUM('pending', 'shipping', 'completed') DEFAULT 'pending',
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Foreign Key (user_id) REFERENCES Users(id)
);

-- 5. Order_Details table
CREATE TABLE Order_Details (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    Foreign Key (order_id) REFERENCES Orders(id),
    Foreign Key (product_id) REFERENCES Products(id)
);;

USE internship_project;

-- add 3 column into Products table
ALTER TABLE Products 
ADD COLUMN sku VARCHAR(50) UNIQUE AFTER name,
ADD COLUMN brand VARCHAR(100) AFTER sku,
ADD COLUMN description TEXT AFTER image_url;

-- update Information (Brand, SKU)
UPDATE Products SET brand = 'Apple', sku = 'MAC-14-M3', description = 'Ultra-powerful M3 chip, Liquid Retina XDR display.' WHERE name LIKE '%MacBook%';
UPDATE Products SET brand = 'Dell', sku = 'DELL-XPS-15', description = '3.5k OLDED display, premium unibody aluminum design.' WHERE name LIKE '%XPS%';
UPDATE Products SET brand = 'Samsung', sku = 'SAM-S24-ULTRA', description = '200MP camera with integrated, intelligent Galaxy AI.' WHERE name LIKE '%S24%';
UPDATE Products SET brand = 'Apple', sku = 'IPHONE-15-PM', description = 'Ultralight titanium frame, A17 Pro chip.' WHERE name LIKE '%iPhone 15%';
UPDATE Products SET brand = 'Sony', sku = 'SONY-WH1000XM5', description = 'The best active noise cancellation, 30-hour battery life.' WHERE name LIKE '%Sony WH%';
UPDATE Products SET brand = 'Bose', sku = 'BOSE-QC-EAR2', description = 'Spatial audio, personalized noise cancellation.' WHERE name LIKE '%Bose%';
