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
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Categories;

INSERT INTO Categories (id, name) VALUES 
(1, 'Computers & Tablets'), 
(2, 'Cell Phones'), 
(3, 'Audio');

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

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Categories;

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


INSERT INTO Categories (name, parent_id) VALUES 
('Apple', 1), ('ASUS', 1), ('Beats', 1), ('Dell', 1), ('GE', 1), ('HP', 1), ('Lenovo', 1), ('LG', 1), ('Meta', 1), ('Nintendo', 1), ('Samsung', 1), ('Sony', 1), ('All Brands', 1);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore TV & Home Theater', 2), ('Learn About RGB LED TVs', 2), ('TVs by Size', 2), ('TVs by Brand', 2), ('TVs by Type', 2), ('All Sound Bars & Home Audio', 2), ('Projectors & Screens', 2), ('Blu-ray & DVD Players', 2), ('Streaming Devices', 2), ('Home Theater Accessories', 2), ('Premium TV & Home Theater', 2);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Computers & Tablets', 3), ('Laptops & Desktops', 3), ('Tablets', 3), ('Monitors', 3), ('PC Gaming & Virtual Reality', 3), ('Computer Components', 3), ('Hard Drives, SSD & Storage', 3), ('Computer Accessories', 3), ('Software', 3), ('Printers, Ink & Toner', 3), ('Wifi & Networking', 3);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Appliances', 4), ('Major Kitchen Appliances', 4), ('Small Kitchen Appliances', 4), ('Luxury Kitchen Appliances', 4), ('Washers & Dryers', 4), ('Vacuums & Floor Care', 4), ('Heating, Cooling & Air Quality', 4), ('Appliance Packages', 4), ('Shop by Brand', 4), ('Small Space Appliances', 4), ('Appliance Parts & Accessories', 4);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Small Kitchen Appliances', 5), ('Small Kitchen Appliance Deals', 5), ('Air Fryers & Deep Fryers', 5), ('Bar & Wine', 5), ('Blenders & Juicers', 5), ('Coffee, Tea & Espresso', 5), ('Microwaves', 5), ('Mini Fridges', 5), ('Mixers', 5), ('Pressure Cookers', 5), ('Toasters & Toaster Ovens', 5);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Video Games', 6), ('Nintendo', 6), ('Xbox', 6), ('PlayStation', 6), ('PC Gaming', 6), ('Virtual Reality', 6), ('Gaming Accessories', 6), ('Digital Gaming', 6), ('Handheld Gaming', 6), ('Retro Gaming & Arcade', 6), ('Simulation Racing', 6);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Cell Phones', 7), ('Cell Phone Accessories', 7), ('Unlocked Phones', 7), ('iPhone', 7), ('Samsung Galaxy', 7), ('Google Pixel', 7), ('Motorola', 7), ('Verizon', 7), ('AT&T', 7), ('Prepaid Phones & Carriers', 7), ('SIM Cards', 7);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Headphones', 8), ('AirPods', 8), ('Wireless Headphones', 8), ('True Wireless Earbuds', 8), ('Open-Ear Headphones', 8), ('Over-Ear & On-Ear Headphones', 8), ('Earbud & In-Ear Headphones', 8), ('Noise-Cancelling Headphones', 8), ('Wired Headphones', 8), ('Sports Headphones', 8), ('Headphone Accessories', 8);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Home Audio & Speakers', 9), ('Home Audio', 9), ('Portable Audio', 9), ('Premium Home Audio & Speakers', 9), ('Home Audio Accessories', 9), ('Audio Packages', 9);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Music, Movies & TV Shows', 10), ('Music', 10), ('Movies', 10), ('TV Shows', 10);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Cameras, Camcorders & Drones', 11), ('Cameras & Lenses', 11), ('Action Cameras & Camcorders', 11), ('Content Creator Gear', 11), ('Camera Accessories', 11), ('Drones', 11), ('Binoculars, Telescopes & Optics', 11), ('Shop by Brand', 11);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Wearable Technology', 12), ('Apple Watch', 12), ('Samsung Galaxy Smartwatches', 12), ('Smartwatches', 12), ('Fitness Trackers & Accessories', 12), ('Smart Rings', 12), ('Smart & AI Glasses', 12), ('Virtual Reality', 12), ('Shop by Brand', 12), ('Wearable Technology Accessories', 12);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Fitness, Sports & Outdoors', 13), ('Exercise & Fitness Equipment', 13), ('Water Sports Equipment', 13), ('Sports Gear & Equipment', 13), ('Kid\'s Sports & Outdoor Play', 13), ('Camping Gear', 13), ('Electric Transportation', 13), ('Biking', 13), ('Game Room', 13), ('Yard Games', 13);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Sports Fan Shop', 14), ('College', 14), ('NFL', 14), ('NBA', 14), ('MLB', 14), ('NHL', 14), ('Soccer', 14), ('Golf', 14), ('WNBA', 14);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Health, Wellness & Personal Care', 15), ('Home Health Care', 15), ('Personal Care & Beauty', 15), ('Workout Recovery', 15), ('Eyewear', 15), ('Baby', 15), ('Contrast Therapy: Hot & Cold Therapy', 15), ('Muscle Pain Relief', 15), ('Ear Care', 15);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Home, Furniture & Office', 16), ('Home, Furniture & Decor', 16), ('Kitchen & Dining', 16), ('Office', 16), ('Bathroom', 16), ('Household Essentials', 16), ('Luggage & Travel', 16), ('Tools & Garage', 16), ('Storage & Organization', 16), ('Holiday Decorations', 16);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Smart Home, Security & Wifi', 17), ('Wifi & Networking', 17), ('Security Cameras & Surveillance', 17), ('Smart Doorbells', 17), ('Smart Door Locks', 17), ('Home Security Systems', 17), ('Smart Speakers & Displays', 17), ('Smart Lighting', 17), ('Smart Thermostats', 17), ('Smart Plugs & Outlets', 17), ('Smart Devices', 17);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Outdoor Living', 18), ('Grills & Outdoor Cooking', 18), ('Outdoor Kitchens', 18), ('Outdoor Heating', 18), ('Outdoor Power Equipment', 18), ('Outdoor Home Theater', 18), ('Outdoor Lighting', 18), ('Patio Furniture', 18), ('Lawn & Garden', 18), ('Generators & Backup Power', 18), ('Sheds & Outdoor Storage', 18);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Electric Transportation', 19), ('Electric Bikes', 19), ('Electric Scooters', 19), ('Hoverboards', 19), ('Electric Car Chargers', 19), ('Kid\'s Scooters & Ride-ons', 19), ('Safety Gear & Accessories', 19);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Car Electronics & GPS', 20), ('Car Audio', 20), ('Auto Care & Cleaning', 20), ('Auto Tools & Equipment', 20), ('Car Security & Convenience', 20), ('Back-up & Dash Cameras', 20), ('GPS Navigation', 20), ('Marine & Powersports', 20), ('Installation Parts & Accessories', 20);

INSERT INTO Categories (name, parent_id) VALUES 
('Explore Toys, Games & Crafts', 21), ('Toys by Type', 21), ('Toys by Age', 21), ('Games, Puzzles & Cards', 21), ('Arts & Crafts', 21), ('Crafting Technology', 21), ('Collectibles', 21), ('Shop by Character', 21);

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS Product_Images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    image_url VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Media_Library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Media_Folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE Media_Library ADD COLUMN folder_id INT DEFAULT NULL;
ALTER TABLE Media_Library ADD FOREIGN KEY (folder_id) REFERENCES Media_Folders(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

ALTER TABLE Orders 
MODIFY COLUMN status ENUM('pending', 'shipping', 'completed', 'cancelled') DEFAULT 'pending';

ALTER TABLE Products ADD COLUMN specifications JSON DEFAULT NULL;

CREATE TABLE IF NOT EXISTS User_Addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

ALTER TABLE Media_Folders ADD COLUMN parent_id INT DEFAULT NULL;

ALTER TABLE Users MODIFY password VARCHAR(255) NULL;
ALTER TABLE Users MODIFY phone VARCHAR(20) NULL;

ALTER TABLE Orders ADD COLUMN shipper_id INT DEFAULT NULL;

ALTER TABLE Users MODIFY role VARCHAR(20) DEFAULT 'user';

INSERT INTO Products (category_id, name, brand, sku, price, stock, image_url, description, specifications) VALUES
(7, 'Apple iPhone 15 Pro Max 256GB', 'Apple', 'APP-IPH15PM-256', 1199.00, 50, NULL, 'Titanium design with ultra thin borders, featuring the powerful A17 Pro chip.', '[{"group":"Display","name":"Screen Size","value":"6.7 inches"},{"group":"Performance","name":"Chip","value":"A17 Pro"},{"group":"Camera","name":"Main Camera","value":"48MP"}]'),
(7, 'Samsung Galaxy S24 Ultra 512GB', 'Samsung', 'SAM-S24U-512', 1299.99, 45, NULL, 'Integrated with smart Galaxy AI, Titanium frame, and S-Pen included.', '[{"group":"Display","name":"Screen Size","value":"6.8 inches"},{"group":"Performance","name":"Processor","value":"Snapdragon 8 Gen 3"},{"group":"Features","name":"Stylus","value":"S-Pen included"}]'),
(7, 'Google Pixel 8 Pro 128GB', 'Google', 'GOO-PXL8P-128', 999.00, 30, NULL, 'The best AI phone from Google with a surreal camera system.', '[{"group":"Display","name":"Screen Size","value":"6.7 inches OLED"},{"group":"Performance","name":"Chip","value":"Google Tensor G3"}]'),
(7, 'Asus ROG Phone 8 Pro', 'ASUS', 'ASU-ROG8P', 1199.99, 20, NULL, 'The most powerful gaming phone in the world with an active cooling system.', '[{"group":"Display","name":"Refresh Rate","value":"165Hz"},{"group":"Performance","name":"RAM","value":"16GB"},{"group":"Battery","name":"Capacity","value":"5500 mAh"}]'),
(7, 'Samsung Galaxy Z Fold 5', 'Samsung', 'SAM-ZF5-256', 1799.00, 15, NULL, 'Ultimate foldable screen experience with smooth multitasking.', '[{"group":"Display","name":"Main Screen","value":"7.6 inches Foldable"},{"group":"Performance","name":"RAM","value":"12GB"}]'),
(3, 'Apple MacBook Pro 16 M3 Max', 'Apple', 'APP-MBP16-M3M', 3499.00, 10, NULL, 'The most powerful laptop for graphics and programming with the 16-core M3 Max chip.', '[{"group":"Display","name":"Screen","value":"16.2 Liquid Retina XDR"},{"group":"Performance","name":"Processor","value":"Apple M3 Max"},{"group":"Memory","name":"RAM","value":"36GB Unified Memory"}]'),
(3, 'Dell XPS 15 9530', 'Dell', 'DEL-XPS15-9530', 1899.99, 25, NULL, 'Unibody aluminum design with an ultra thin bezel OLED display.', '[{"group":"Display","name":"Screen","value":"15.6 OLED Touch"},{"group":"Performance","name":"Processor","value":"Intel Core i7-13700H"},{"group":"Graphics","name":"GPU","value":"RTX 4060"}]'),
(3, 'Asus ROG Zephyrus G14', 'ASUS', 'ASU-G14-4070', 1599.00, 35, NULL, 'Thin and light gaming laptop with a unique LED matrix on the back.', '[{"group":"Display","name":"Refresh Rate","value":"165Hz Nebula Display"},{"group":"Performance","name":"Processor","value":"AMD Ryzen 9 7940HS"}]'),
(3, 'Lenovo ThinkPad X1 Carbon Gen 11', 'Lenovo', 'LEN-X1C-G11', 1499.00, 40, NULL, 'Ultra durable business laptop featuring the best typing keyboard in the world.', '[{"group":"Design","name":"Weight","value":"1.12 kg"},{"group":"Performance","name":"Processor","value":"Intel Core i7-1355U"}]'),
(3, 'Apple iPad Pro 12.9 M2', 'Apple', 'APP-IPADP12-M2', 1099.00, 60, NULL, 'Laptop level power paired with a super bright Mini-LED display.', '[{"group":"Display","name":"Screen","value":"12.9 Liquid Retina XDR"},{"group":"Performance","name":"Chip","value":"Apple M2"}]'),
(3, 'Samsung Galaxy Tab S9 Ultra', 'Samsung', 'SAM-TABS9U', 1199.99, 25, NULL, 'Giant screen tablet featuring IP68 water and dust resistance.', '[{"group":"Display","name":"Screen","value":"14.6 Dynamic AMOLED 2X"},{"group":"Features","name":"Durability","value":"IP68 Water/Dust resistant"}]'),
(8, 'Sony WH-1000XM5 Wireless', 'Sony', 'SON-WHXM5', 398.00, 80, NULL, 'The best active noise cancelling headphones available today with a brand new design.', '[{"group":"Audio","name":"Noise Cancelling","value":"Industry Leading ANC"},{"group":"Battery","name":"Playtime","value":"Up to 30 hours"}]'),
(8, 'Apple AirPods Pro (2nd Gen)', 'Apple', 'APP-AIRPODSP2', 249.00, 150, NULL, 'Personalized spatial audio and a charging case with a built in speaker for tracking.', '[{"group":"Audio","name":"Features","value":"Active Noise Cancellation & Transparency"},{"group":"Connectivity","name":"Bluetooth","value":"Bluetooth 5.3"}]'),
(8, 'Bose QuietComfort Ultra', 'Bose', 'BOS-QCU', 429.00, 45, NULL, 'The ultimate Spatial Audio experience provided by Bose.', '[{"group":"Audio","name":"Sound","value":"Immersive Audio"},{"group":"Design","name":"Fit","value":"Over-ear"}]'),
(8, 'Sennheiser Momentum 4', 'Sennheiser', 'SEN-M4', 349.95, 30, NULL, 'Audiophile headphones boasting a massive battery life of up to 60 hours.', '[{"group":"Battery","name":"Playtime","value":"Up to 60 hours"},{"group":"Audio","name":"Transducer","value":"42mm dynamic"}]'),
(12, 'Apple Watch Series 9 (45mm)', 'Apple', 'APP-AWS9-45', 429.00, 100, NULL, 'Awesome Double Tap gesture and screen brightness up to 2000 nits.', '[{"group":"Display","name":"Brightness","value":"Up to 2000 nits"},{"group":"Sensors","name":"Health","value":"ECG, Blood Oxygen, Temp"}]'),
(12, 'Samsung Galaxy Watch 6 Classic', 'Samsung', 'SAM-GW6C', 399.99, 65, NULL, 'Classic design featuring the iconic physical rotating bezel.', '[{"group":"Design","name":"Bezel","value":"Rotating Bezel"},{"group":"Sensors","name":"Health","value":"BioActive Sensor"}]'),
(12, 'Garmin Fenix 7 Sapphire Solar', 'Garmin', 'GAR-F7SS', 899.00, 15, NULL, 'Multisport GPS watch with a Sapphire solar charging lens.', '[{"group":"Battery","name":"Solar","value":"Solar Charging Lens"},{"group":"Durability","name":"Material","value":"Titanium & Sapphire"}]'),
(2, 'LG 65-inch C3 OLED Evo 4K', 'LG', 'LG-65C3-OLED', 1699.99, 20, NULL, 'Best selling OLED TV with perfect contrast and a 120Hz refresh rate.', '[{"group":"Display","name":"Panel","value":"OLED Evo"},{"group":"Display","name":"Refresh Rate","value":"120Hz Native"}]'),
(2, 'Samsung 75-inch Neo QLED 8K', 'Samsung', 'SAM-75QN900C', 4999.00, 5, NULL, 'Ultra crisp 8K resolution powered by Quantum Matrix Pro technology.', '[{"group":"Display","name":"Resolution","value":"8K UHD (7680 x 4320)"},{"group":"Display","name":"Technology","value":"Quantum Mini LEDs"}]');

ALTER TABLE Products 
ADD COLUMN name_vi VARCHAR(255) DEFAULT NULL,
ADD COLUMN description_vi TEXT DEFAULT NULL;

UPDATE Products SET description_vi = 'Thiết kế Titanium viền siêu mỏng, trang bị chip A17 Pro mạnh mẽ.' WHERE sku = 'APP-IPH15PM-256';
UPDATE Products SET description_vi = 'Tích hợp Galaxy AI thông minh, khung viền Titanium và bút S-Pen đi kèm.' WHERE sku = 'SAM-S24U-512';
UPDATE Products SET description_vi = 'Điện thoại AI tốt nhất từ Google với hệ thống camera siêu thực.' WHERE sku = 'GOO-PXL8P-128';
UPDATE Products SET description_vi = 'Điện thoại gaming mạnh nhất thế giới với hệ thống tản nhiệt chủ động.' WHERE sku = 'ASU-ROG8P';
UPDATE Products SET description_vi = 'Trải nghiệm màn hình gập đỉnh cao với khả năng đa nhiệm mượt mà.' WHERE sku = 'SAM-ZF5-256';
UPDATE Products SET description_vi = 'Laptop đồ họa và lập trình mạnh nhất với chip M3 Max 16 nhân.' WHERE sku = 'APP-MBP16-M3M';
UPDATE Products SET description_vi = 'Thiết kế nhôm nguyên khối với màn hình OLED viền siêu mỏng.' WHERE sku = 'DEL-XPS15-9530';
UPDATE Products SET description_vi = 'Laptop gaming mỏng nhẹ với màn hình LED ma trận độc đáo mặt lưng.' WHERE sku = 'ASU-G14-4070';
UPDATE Products SET description_vi = 'Laptop doanh nhân siêu bền bỉ trang bị bàn phím gõ tốt nhất thế giới.' WHERE sku = 'LEN-X1C-G11';
UPDATE Products SET description_vi = 'Sức mạnh ngang ngửa laptop kết hợp màn hình Mini-LED siêu sáng.' WHERE sku = 'APP-IPADP12-M2';
UPDATE Products SET description_vi = 'Máy tính bảng màn hình khổng lồ với khả năng chống nước, bụi IP68.' WHERE sku = 'SAM-TABS9U';
UPDATE Products SET description_vi = 'Tai nghe chống ồn chủ động hàng đầu hiện nay với thiết kế hoàn toàn mới.' WHERE sku = 'SON-WHXM5';
UPDATE Products SET description_vi = 'Âm thanh không gian cá nhân hóa, hộp sạc tích hợp loa tìm kiếm.' WHERE sku = 'APP-AIRPODSP2';
UPDATE Products SET description_vi = 'Trải nghiệm âm thanh không gian (Spatial Audio) đỉnh cao từ Bose.' WHERE sku = 'BOS-QCU';
UPDATE Products SET description_vi = 'Tai nghe Audiophile với thời lượng pin khủng lên đến 60 giờ.' WHERE sku = 'SEN-M4';
UPDATE Products SET description_vi = 'Thao tác chạm hai lần (Double Tap) ấn tượng, độ sáng màn hình lên đến 2000 nits.' WHERE sku = 'APP-AWS9-45';
UPDATE Products SET description_vi = 'Thiết kế cổ điển với vòng xoay bezel vật lý đặc trưng.' WHERE sku = 'SAM-GW6C';
UPDATE Products SET description_vi = 'Đồng hồ GPS đa thể thao, mặt kính Sapphire hỗ trợ sạc bằng năng lượng mặt trời.' WHERE sku = 'GAR-F7SS';
UPDATE Products SET description_vi = 'TV OLED bán chạy nhất với độ tương phản hoàn hảo và tần số quét 120Hz.' WHERE sku = 'LG-65C3-OLED';
UPDATE Products SET description_vi = 'Độ phân giải 8K cực nét được trang bị công nghệ Quantum Matrix Pro.' WHERE sku = 'SAM-75QN900C';

ALTER TABLE Reviews ADD COLUMN image_url VARCHAR(255) NULL;

CREATE TABLE IF NOT EXISTS Settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255)
);

-- Thêm sẵn một mốc thời gian mặc định ban đầu
INSERT IGNORE INTO Settings (setting_key, setting_value) 
VALUES ('flash_sale_end', '2026-12-31T23:59:59.000Z');

CREATE TABLE IF NOT EXISTS Settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO Products (category_id, name, sku, brand, price, stock, description, specifications) VALUES
(2, 'LG 65-inch C3 OLED 4K Smart TV', 'LG-65C3-OLED', 'LG', 1699.99, 25, 'Stunning 4K OLED picture quality with infinite contrast.', '[{"group":"Display","name":"Size","value":"65 inches"},{"group":"Display","name":"Resolution","value":"4K UHD"}]'),
(2, 'Samsung 75-inch Neo QLED 8K', 'SAM-75QN900C', 'Samsung', 4999.00, 10, 'Experience ultra-premium 8K resolution and quantum HDR.', '[{"group":"Display","name":"Size","value":"75 inches"},{"group":"Display","name":"Resolution","value":"8K UHD"}]'),
(2, 'Sony HT-A5000 5.1.2ch Dolby Atmos Soundbar', 'SONY-HTA5000', 'Sony', 999.99, 30, 'Immersive surround sound with built-in subwoofers.', '[{"group":"Audio","name":"Channels","value":"5.1.2"},{"group":"Audio","name":"Features","value":"Dolby Atmos"}]'),
(3, 'Apple MacBook Pro 14" M3 Pro', 'APP-MBP14-M3', 'Apple', 1999.00, 45, 'Mind-blowing performance with the M3 Pro chip.', '[{"group":"Performance","name":"RAM","value":"18GB"},{"group":"Storage","name":"SSD","value":"512GB"}]'),
(3, 'Dell XPS 15 OLED Laptop', 'DELL-XPS15-OLED', 'Dell', 1899.99, 20, 'Stunning OLED display paired with Intel Core i9.', '[{"group":"Performance","name":"CPU","value":"Intel Core i9"},{"group":"Display","name":"Type","value":"OLED"}]'),
(3, 'ASUS ROG Strix 27" 1440p 240Hz Monitor', 'ASUS-ROG27-240', 'ASUS', 499.00, 50, 'Esports-ready gaming monitor with lightning fast refresh rate.', '[{"group":"Display","name":"Refresh Rate","value":"240Hz"},{"group":"Display","name":"Resolution","value":"1440p"}]'),
(4, 'Samsung Bespoke 4-Door French Door Refrigerator', 'SAM-FR-BESPOKE', 'Samsung', 2799.00, 15, 'Customizable design with a built-in Family Hub.', '[{"group":"General","name":"Capacity","value":"29 cu. ft."},{"group":"Features","name":"Smart","value":"Family Hub"}]'),
(4, 'LG Smart Front Load Washer with AI', 'LG-WASH-WM4000', 'LG', 949.99, 40, 'Built-in intelligence takes out the guesswork.', '[{"group":"General","name":"Type","value":"Front Load"},{"group":"Features","name":"Tech","value":"AI DD"}]'),
(4, 'Dyson V15 Detect Cordless Vacuum', 'DYS-V15-DET', 'Dyson', 749.99, 60, 'Laser reveals microscopic dust on hard floors.', '[{"group":"General","name":"Type","value":"Cordless Stick"},{"group":"Battery","name":"Runtime","value":"60 mins"}]'),
(5, 'Ninja Foodi 8-Qt DualZone Air Fryer', 'NIN-DZ201', 'Ninja', 199.99, 100, 'Cook two different foods, two different ways simultaneously.', '[{"group":"General","name":"Capacity","value":"8 Quarts"},{"group":"Features","name":"Baskets","value":"DualZone"}]'),
(5, 'KitchenAid Artisan Series 5 Quart Stand Mixer', 'KA-ART-5QT', 'KitchenAid', 449.99, 25, 'The iconic stand mixer for every kitchen.', '[{"group":"General","name":"Capacity","value":"5 Quarts"},{"group":"Power","name":"Wattage","value":"325W"}]'),
(5, 'Keurig K-Elite Single-Serve Coffee Maker', 'KEU-KELITE', 'Keurig', 149.00, 80, 'Strong brew setting and iced coffee capability.', '[{"group":"General","name":"Type","value":"Single Serve"},{"group":"Features","name":"Iced Setting","value":"Yes"}]'),
(6, 'PlayStation 5 Console (Disc Edition)', 'SONY-PS5-DISC', 'Sony', 499.99, 150, 'Lightning speed and breathtaking immersion.', '[{"group":"Hardware","name":"Storage","value":"825GB SSD"},{"group":"Video","name":"Output","value":"4K 120Hz"}]'),
(6, 'Xbox Series X 1TB Console', 'MSFT-XSX-1TB', 'Microsoft', 499.99, 120, 'The fastest, most powerful Xbox ever.', '[{"group":"Hardware","name":"Storage","value":"1TB NVMe SSD"},{"group":"Video","name":"Output","value":"8K Ready"}]'),
(6, 'Nintendo Switch OLED Model', 'NIN-SW-OLED', 'Nintendo', 349.99, 200, 'Vibrant 7-inch OLED screen and enhanced audio.', '[{"group":"Display","name":"Screen","value":"7-inch OLED"},{"group":"Storage","name":"Internal","value":"64GB"}]'),
(7, 'Apple iPhone 15 Pro Max 256GB - Titanium', 'APP-IP15PM-256', 'Apple', 1199.00, 85, 'Forged in titanium with the blazing A17 Pro chip.', '[{"group":"Performance","name":"Chip","value":"A17 Pro"},{"group":"Camera","name":"Main","value":"48MP"}]'),
(7, 'Samsung Galaxy S24 Ultra 512GB', 'SAM-S24U-512', 'Samsung', 1299.99, 60, 'Galaxy AI is here. Epic cameras and S-Pen included.', '[{"group":"Performance","name":"RAM","value":"12GB"},{"group":"Camera","name":"Zoom","value":"100x Space Zoom"}]'),
(7, 'Google Pixel 8 Pro 128GB', 'GOO-P8P-128', 'Google', 999.00, 75, 'The smartest Pixel yet with advanced AI photo editing.', '[{"group":"Performance","name":"Chip","value":"Tensor G3"},{"group":"Display","name":"Refresh Rate","value":"120Hz LTPO"}]'),
(8, 'Sony WH-1000XM5 Wireless ANC Headphones', 'SONY-WH1000XM5', 'Sony', 398.00, 150, 'Industry-leading noise cancellation.', '[{"group":"Audio","name":"Feature","value":"ANC"},{"group":"Battery","name":"Life","value":"30 Hours"}]'),
(8, 'Apple AirPods Pro (2nd Generation)', 'APP-AIRPODS-PRO2', 'Apple', 249.00, 300, 'Rich audio, smarter noise cancellation.', '[{"group":"Audio","name":"Feature","value":"Spatial Audio"},{"group":"Battery","name":"Case","value":"MagSafe USB-C"}]'),
(8, 'Beats Fit Pro True Wireless Earbuds', 'BEAT-FIT-PRO', 'Beats', 199.99, 120, 'Flexible, secure-fit wingtips for all-day comfort.', '[{"group":"Design","name":"Type","value":"In-Ear"},{"group":"Features","name":"Chip","value":"Apple H1"}]'),
(9, 'Sonos Arc Premium Smart Soundbar', 'SONOS-ARC', 'Sonos', 899.00, 30, 'Bring your entertainment to life with Dolby Atmos.', '[{"group":"Audio","name":"Features","value":"Dolby Atmos"},{"group":"Smart","name":"Assistant","value":"Alexa / Google"}]'),
(9, 'JBL Flip 6 Portable Bluetooth Speaker', 'JBL-FLIP6', 'JBL', 129.95, 200, 'Bold sound for every adventure. IP67 waterproof.', '[{"group":"General","name":"Durability","value":"IP67 Waterproof"},{"group":"Battery","name":"Life","value":"12 Hours"}]'),
(9, 'Bose Smart Speaker 500', 'BOSE-SPK500', 'Bose', 379.00, 45, 'Wall-to-wall stereo sound from a single speaker.', '[{"group":"Audio","name":"Display","value":"Color LCD"},{"group":"Smart","name":"Voice Control","value":"Built-in"}]'),
(11, 'Sony Alpha a7 IV Mirrorless Camera Body', 'SONY-A7IV', 'Sony', 2498.00, 15, '33MP full-frame sensor and brilliant 4K video.', '[{"group":"Sensor","name":"Resolution","value":"33.0 MP"},{"group":"Video","name":"Quality","value":"4K 60p"}]'),
(11, 'GoPro HERO12 Black Action Camera', 'GOPRO-H12', 'GoPro', 399.99, 120, 'Incredible image quality and HyperSmooth 6.0.', '[{"group":"Video","name":"Resolution","value":"5.3K HDR"},{"group":"General","name":"Waterproof","value":"33ft (10m)"}]'),
(11, 'DJI Mini 4 Pro Drone with RC-N2', 'DJI-MINI4-PRO', 'DJI', 759.00, 40, 'Under 249g, omnidirectional obstacle sensing.', '[{"group":"Flight","name":"Time","value":"34 mins"},{"group":"Camera","name":"Video","value":"4K/60fps HDR"}]'),
(12, 'Apple Watch Series 9 (GPS, 45mm)', 'APP-AW9-45', 'Apple', 429.00, 150, 'A brighter display and magical new Double Tap gesture.', '[{"group":"Display","name":"Brightness","value":"2000 Nits"},{"group":"Sensors","name":"Health","value":"ECG & Blood Oxygen"}]'),
(12, 'Samsung Galaxy Watch 6 Classic (47mm)', 'SAM-GW6C-47', 'Samsung', 399.99, 80, 'Iconic rotating bezel and advanced sleep tracking.', '[{"group":"Design","name":"Bezel","value":"Rotating"},{"group":"Compatibility","name":"OS","value":"Android Only"}]'),
(12, 'Oura Ring Gen3 Horizon - Stealth', 'OURA-GEN3-STH', 'Oura', 399.00, 50, '24/7 health tracking packed into a sleek titanium ring.', '[{"group":"Sensors","name":"Tracking","value":"Sleep, Heart Rate"},{"group":"Battery","name":"Life","value":"Up to 7 days"}]'),
(13, 'Bowflex SelectTech 552 Adjustable Dumbbells', 'BOW-552-DB', 'Bowflex', 429.00, 60, 'Replaces 15 sets of weights. Adjusts from 5 to 52.5 lbs.', '[{"group":"Weight","name":"Range","value":"5 - 52.5 lbs"},{"group":"General","name":"Includes","value":"2 Dumbbells"}]'),
(13, 'Garmin Edge 830 GPS Cycling Computer', 'GAR-EDGE-830', 'Garmin', 399.99, 45, 'Performance GPS cycling computer with mapping and touchscreen.', '[{"group":"Display","name":"Type","value":"Touchscreen"},{"group":"Battery","name":"Life","value":"Up to 20 hours"}]'),
(13, 'Segway Ninebot KickScooter Max G30P', 'SEG-MAX-G30P', 'Segway', 799.99, 30, 'Electric scooter with up to 40 miles range.', '[{"group":"Performance","name":"Range","value":"40 Miles"},{"group":"Performance","name":"Speed","value":"18.6 mph"}]'),
(17, 'Google Nest Learning Thermostat (3rd Gen)', 'GOO-NEST-T3', 'Google', 249.00, 100, 'Learns your schedule to save energy.', '[{"group":"Smart","name":"Ecosystem","value":"Google Home"},{"group":"General","name":"Color","value":"Stainless Steel"}]'),
(17, 'Ring Video Doorbell Pro 2', 'RING-VDB-PRO2', 'Ring', 249.99, 85, 'Premium wired video doorbell with 3D Motion Detection.', '[{"group":"Video","name":"Resolution","value":"1536p HD"},{"group":"Features","name":"Detection","value":"3D Motion & Bird’s Eye"}]'),
(17, 'August Wi-Fi Smart Lock (4th Generation)', 'AUG-WIFI-L4', 'August', 229.99, 60, 'Upgrade your deadbolt. Works with Alexa, Google, Apple.', '[{"group":"Smart","name":"Connection","value":"Wi-Fi Built-in"},{"group":"General","name":"Install","value":"Retrofit"}]'),
(19, 'Super73-RX Electric Motorbike', 'SUP73-RX', 'Super73', 3695.00, 5, 'Street-legal electric motorbike with extreme performance.', '[{"group":"Performance","name":"Range","value":"40-75+ miles"},{"group":"Motor","name":"Power","value":"2000W Peak"}]'),
(19, 'NIU KQi3 Pro Electric Kick Scooter', 'NIU-KQI3-PRO', 'NIU', 799.00, 25, 'Maximum comfort and stability for urban commuting.', '[{"group":"Performance","name":"Top Speed","value":"20 mph"},{"group":"Battery","name":"Range","value":"31 Miles"}]'),
(19, 'Razor Hovertrax Prizma Hoverboard', 'RAZ-HOV-PRI', 'Razor', 179.99, 50, 'LED light show and auto-balancing technology.', '[{"group":"Performance","name":"Max Speed","value":"9 mph"},{"group":"General","name":"Rider Weight","value":"Up to 176 lbs"}]')
;