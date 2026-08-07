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

USE internship_project;

UPDATE Users SET role = 'admin' WHERE email = 'admin@besttech.com';

CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES Categories(id) ON DELETE CASCADE
);

-- =======================================================
-- 3. CHÈN 21 DANH MỤC GỐC (CHA) - parent_id = NULL
-- =======================================================
INSERT INTO Categories (id, name, parent_id) VALUES
(1, 'Shop by Brand', NULL),
(2, 'TV & Home Theater', NULL),
(3, 'Computers & Tablets', NULL),
(4, 'Appliances', NULL),
(5, 'Small Kitchen Appliances', NULL),
(6, 'Video Games', NULL),
(7, 'Cell Phones', NULL),
(8, 'Headphones', NULL),
(9, 'Home Audio & Speakers', NULL),
(10, 'Music, Movies & TV Shows', NULL),
(11, 'Cameras, Camcorders & Drones', NULL),
(12, 'Wearable Technology', NULL),
(13, 'Fitness, Sports & Outdoors', NULL),
(14, 'Sports Fan Shop', NULL),
(15, 'Health, Wellness & Personal Care', NULL),
(16, 'Home, Furniture & Office', NULL),
(17, 'Smart Home, Security & Wifi', NULL),
(18, 'Outdoor Living', NULL),
(19, 'Electric Transportation', NULL),
(20, 'Car Electronics & GPS', NULL),
(21, 'Collectibles & Memorabilia', NULL);

-- =======================================================
-- 4. CHÈN CÁC DANH MỤC CON (Trỏ parent_id về danh mục Cha tương ứng)
-- =======================================================

-- Con của 1: Shop by Brand
INSERT INTO Categories (name, parent_id) VALUES 
('Apple', 1), ('ASUS', 1), ('Beats', 1), ('Dell', 1), ('GE', 1), ('HP', 1), ('Lenovo', 1), ('LG', 1), ('Meta', 1), ('Nintendo', 1), ('Samsung', 1), ('Sony', 1), ('All Brands', 1);

-- Con của 2: TV & Home Theater
INSERT INTO Categories (name, parent_id) VALUES 
('Explore TV & Home Theater', 2), ('Learn About RGB LED TVs', 2), ('TVs by Size', 2), ('TVs by Brand', 2), ('TVs by Type', 2), ('All Sound Bars & Home Audio', 2), ('Projectors & Screens', 2), ('Blu-ray & DVD Players', 2), ('Streaming Devices', 2), ('Home Theater Accessories', 2), ('Premium TV & Home Theater', 2);

-- Con của 3: Computers & Tablets
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Computers & Tablets', 3), ('Laptops & Desktops', 3), ('Tablets', 3), ('Monitors', 3), ('PC Gaming & Virtual Reality', 3), ('Computer Components', 3), ('Hard Drives, SSD & Storage', 3), ('Computer Accessories', 3), ('Software', 3), ('Printers, Ink & Toner', 3), ('Wifi & Networking', 3);

-- Con của 4: Appliances
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Appliances', 4), ('Major Kitchen Appliances', 4), ('Small Kitchen Appliances', 4), ('Luxury Kitchen Appliances', 4), ('Washers & Dryers', 4), ('Vacuums & Floor Care', 4), ('Heating, Cooling & Air Quality', 4), ('Appliance Packages', 4), ('Shop by Brand', 4), ('Small Space Appliances', 4), ('Appliance Parts & Accessories', 4);

-- Con của 5: Small Kitchen Appliances
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Small Kitchen Appliances', 5), ('Small Kitchen Appliance Deals', 5), ('Air Fryers & Deep Fryers', 5), ('Bar & Wine', 5), ('Blenders & Juicers', 5), ('Coffee, Tea & Espresso', 5), ('Microwaves', 5), ('Mini Fridges', 5), ('Mixers', 5), ('Pressure Cookers', 5), ('Toasters & Toaster Ovens', 5);

-- Con của 6: Video Games
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Video Games', 6), ('Nintendo', 6), ('Xbox', 6), ('PlayStation', 6), ('PC Gaming', 6), ('Virtual Reality', 6), ('Gaming Accessories', 6), ('Digital Gaming', 6), ('Handheld Gaming', 6), ('Retro Gaming & Arcade', 6), ('Simulation Racing', 6);

-- Con của 7: Cell Phones
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Cell Phones', 7), ('Cell Phone Accessories', 7), ('Unlocked Phones', 7), ('iPhone', 7), ('Samsung Galaxy', 7), ('Google Pixel', 7), ('Motorola', 7), ('Verizon', 7), ('AT&T', 7), ('Prepaid Phones & Carriers', 7), ('SIM Cards', 7);

-- Con của 8: Headphones
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Headphones', 8), ('AirPods', 8), ('Wireless Headphones', 8), ('True Wireless Earbuds', 8), ('Open-Ear Headphones', 8), ('Over-Ear & On-Ear Headphones', 8), ('Earbud & In-Ear Headphones', 8), ('Noise-Cancelling Headphones', 8), ('Wired Headphones', 8), ('Sports Headphones', 8), ('Headphone Accessories', 8);

-- Con của 9: Home Audio & Speakers
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Home Audio & Speakers', 9), ('Home Audio', 9), ('Portable Audio', 9), ('Premium Home Audio & Speakers', 9), ('Home Audio Accessories', 9), ('Audio Packages', 9);

-- Con của 10: Music, Movies & TV Shows
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Music, Movies & TV Shows', 10), ('Music', 10), ('Movies', 10), ('TV Shows', 10);

-- Con của 11: Cameras, Camcorders & Drones
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Cameras, Camcorders & Drones', 11), ('Cameras & Lenses', 11), ('Action Cameras & Camcorders', 11), ('Content Creator Gear', 11), ('Camera Accessories', 11), ('Drones', 11), ('Binoculars, Telescopes & Optics', 11), ('Shop by Brand', 11);

-- Con của 12: Wearable Technology
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Wearable Technology', 12), ('Apple Watch', 12), ('Samsung Galaxy Smartwatches', 12), ('Smartwatches', 12), ('Fitness Trackers & Accessories', 12), ('Smart Rings', 12), ('Smart & AI Glasses', 12), ('Virtual Reality', 12), ('Shop by Brand', 12), ('Wearable Technology Accessories', 12);

-- Con của 13: Fitness, Sports & Outdoors
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Fitness, Sports & Outdoors', 13), ('Exercise & Fitness Equipment', 13), ('Water Sports Equipment', 13), ('Sports Gear & Equipment', 13), ('Kid\'s Sports & Outdoor Play', 13), ('Camping Gear', 13), ('Electric Transportation', 13), ('Biking', 13), ('Game Room', 13), ('Yard Games', 13);

-- Con của 14: Sports Fan Shop
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Sports Fan Shop', 14), ('College', 14), ('NFL', 14), ('NBA', 14), ('MLB', 14), ('NHL', 14), ('Soccer', 14), ('Golf', 14), ('WNBA', 14);

-- Con của 15: Health, Wellness & Personal Care
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Health, Wellness & Personal Care', 15), ('Home Health Care', 15), ('Personal Care & Beauty', 15), ('Workout Recovery', 15), ('Eyewear', 15), ('Baby', 15), ('Contrast Therapy: Hot & Cold Therapy', 15), ('Muscle Pain Relief', 15), ('Ear Care', 15);

-- Con của 16: Home, Furniture & Office
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Home, Furniture & Office', 16), ('Home, Furniture & Decor', 16), ('Kitchen & Dining', 16), ('Office', 16), ('Bathroom', 16), ('Household Essentials', 16), ('Luggage & Travel', 16), ('Tools & Garage', 16), ('Storage & Organization', 16), ('Holiday Decorations', 16);

-- Con của 17: Smart Home, Security & Wifi
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Smart Home, Security & Wifi', 17), ('Wifi & Networking', 17), ('Security Cameras & Surveillance', 17), ('Smart Doorbells', 17), ('Smart Door Locks', 17), ('Home Security Systems', 17), ('Smart Speakers & Displays', 17), ('Smart Lighting', 17), ('Smart Thermostats', 17), ('Smart Plugs & Outlets', 17), ('Smart Devices', 17);

-- Con của 18: Outdoor Living
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Outdoor Living', 18), ('Grills & Outdoor Cooking', 18), ('Outdoor Kitchens', 18), ('Outdoor Heating', 18), ('Outdoor Power Equipment', 18), ('Outdoor Home Theater', 18), ('Outdoor Lighting', 18), ('Patio Furniture', 18), ('Lawn & Garden', 18), ('Generators & Backup Power', 18), ('Sheds & Outdoor Storage', 18);

-- Con của 19: Electric Transportation
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Electric Transportation', 19), ('Electric Bikes', 19), ('Electric Scooters', 19), ('Hoverboards', 19), ('Electric Car Chargers', 19), ('Kid\'s Scooters & Ride-ons', 19), ('Safety Gear & Accessories', 19);

-- Con của 20: Car Electronics & GPS
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Car Electronics & GPS', 20), ('Car Audio', 20), ('Auto Care & Cleaning', 20), ('Auto Tools & Equipment', 20), ('Car Security & Convenience', 20), ('Back-up & Dash Cameras', 20), ('GPS Navigation', 20), ('Marine & Powersports', 20), ('Installation Parts & Accessories', 20);

-- Con của 21: Toys, Games & Crafts
INSERT INTO Categories (name, parent_id) VALUES 
('Explore Toys, Games & Crafts', 21), ('Toys by Type', 21), ('Toys by Age', 21), ('Games, Puzzles & Cards', 21), ('Arts & Crafts', 21), ('Crafting Technology', 21), ('Collectibles', 21), ('Shop by Character', 21);

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;
