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

USE internship_project;

-- 1. Tạm tắt trạm kiểm soát khóa ngoại để không bị lỗi khi dọn dẹp
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Xóa sạch dữ liệu cũ trong bảng Categories và reset lại ID
TRUNCATE TABLE Categories;

-- 3. Bơm dữ liệu danh mục, ÉP CỨNG ID là 1, 2, 3
INSERT INTO Categories (id, name) VALUES 
(1, 'Computers & Tablets'), 
(2, 'Cell Phones'), 
(3, 'Audio');

-- 4. Bật lại trạm kiểm soát bảo mật
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO Products (category_id, name, sku, brand, price, stock, image_url, description) VALUES
(1, 'Apple iPad Pro 13-inch M4', 'IPAD-PRO-M4-13', 'Apple', 1299.00, 20, 'http://localhost:3000/images/apple-ipad-pro-3-inch-m4.png', 'Experience the ultimate iPad with the lightning-fast M4 chip and a stunning OLED display.');

USE internship_project;

INSERT INTO Products (category_id, name, sku, brand, price, stock, image_url, description) VALUES
(1, 'Dell Alienware m16 R2 Gaming', 'AW-M16-R2', 'Dell', 1899.99, 15, 'http://localhost:3000/images/dell-alienwarem16-r2-gaming.png', 'High-performance gaming laptop with Intel Core Ultra chip and NVIDIA RTX 4070 graphics card.'),
(2, 'Samsung Galaxy Z Fold 6 512GB', 'SAM-ZFOLD6-512', 'Samsung', 1899.00, 12, 'http://localhost:3000/images/samsung-galaxy-z-fold-6-512gb.png', 'Unlock an expansive screen for work and features powered by Galaxy AI.'),
(3, 'Sony WF-1000XM5 Earbuds', 'SONY-WF1000XM5', 'Sony', 298.00, 35, 'http://localhost:3000/images/sony-wf-1000xm5-earbuds.png', 'Sony is ultimate noise-canceling True Wireless earbuds, featuring a compact design that fits snugly in the ear.'),
(3, 'Apple AirPods Pro (2nd Gen)', 'AIRPODS-PRO-2', 'Apple', 249.00, 50, 'http://localhost:3000/images/apple-airpods-pro-(2nd-gen).png', 'Rich, high-quality spatial audio and next-generation active noise cancellation.');
