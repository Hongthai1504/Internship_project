# thuc-tap

Quá trình của dự án thực tập tại trường với Đề tài: Hệ thống website bán hàng Online.

## I. Khởi tạo Cơ sở dữ liệu (Database)

_Nền tảng lưu trữ._

- Cài đặt MySQL, tạo 5 bẳng cốt lõi:
  - Users
  - Categories
  - Products
  - Orders
  - Order_Details
    => Trong file **init_database.sql**
    => Database là nơi lưu giữ thông tin thực tế và chỉ có Server mới được quyền truy cập trực tiếp
    <img width="1365" height="686" alt="init_database sql" src="https://github.com/user-attachments/assets/825d68f8-7a08-405b-8d1e-c00ee01f30c0" />

## II. Xây dựng Backend (Server)

_Node.js & Express._

- Viết các API chính để Server nhận các yêu cầu từ Client, xử lý các logic và trả về kết quả:
  - Hiển thị: GET /api/products để trả về danh sách sản phẩm bằng JSON, cần tối ưu để thời gian phản hồi dưới 500ms. - Bước đầu khởi dộng server và tạo API Hiển thị thông qua fil **server.js**
    <img width="1366" height="689" alt="server js" src="https://github.com/user-attachments/assets/0e85d7b4-7971-42ee-83d9-548135d9cddd" />

  - Thanh toán: POST /api/orders để nhận thông tin về User và Cart, tính tổng tiền, lưu vào bảng Orders/Order_Details, và trừ đi số lượng tồn kho (Stock) trong Products. <br>
    **_Tạo API Xử lý đơn hàng_**

  ```
  app.post("/api/orders", authenticateToken, (req, res) => {
  const user_id = req.user.id; // Get the secure ID from the token, not from the client's submission
  const { shipping_address, total_amount, cartItems } = req.body;

  // A. Save the overview information to the Orders table
  const inserOrderSql =
    "INSERT INTO Orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)";

  db.query(
    inserOrderSql,
    [user_id, total_amount, shipping_address],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Order creation error!" });

      const order_id = result.insertId; // Get the ID of the order just created

      // B & C. Save details for each item and deduct from inventory
      cartItems.forEach((item) => {
        const insertDetailSql =
          "INSERT INTO Order_Details (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)";
        db.query(
          insertDetailSql,
          [order_id, item.product_id, item.quantity, item.price],
          (err) => {
            if (!err) {
              // Excluding stock in the Products table
              const updateStockSql =
                "UPDATE Products SET stock = stock - ? WHERE id = ?";
              db.query(updateStockSql, [item.quantity, item.product_id]);
            }
          },
        );
      });

      res.json({
        message: "Order placed successfully!",
        order_id: order_id,
        status: "pending",
      });
    },
  );
  });
  ```

  - Bảo mật: Validate dữ liệu đẻ chống SQL Injection/XSS. Áp dụng thư viện bcrypt để băm mật khẩu (không lưu plaintext) và sử dụng JWT (JSON Web Token) để duy trì đăng nhập. <br>
    **_Tạo API đăng ký tài khoản_**

```
  app.post("/api/register", async (req, res) => {
  const { email, password, full_name, phone } = req.body;

  try {
    // Hash the password into a long string of characters for security
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO Users (email, password, full_name, phone) VALUE (?, ?, ?, ?)";

    db.query(sql, [email, hashedPassword, full_name, phone], (err, result) => {
      if (err)
        return res.status(400).json({
          error: "The email address already exists or there is a data error!",
        });
      res.json({ message: "Register successful!" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error!" });
  }
});
```

**_Tạo API đăng nhập_**

```
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM Users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: "Incorrect email or password!" });
    }

    const user = results[0];

    // Compare the password entered by the user with the hashed password in the database.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Incorrect email or password!" });

    // JWT cards are valid for one day
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ message: "Login successful!", token: token });
  });
});
```

## \*Test thử API bằng Postman

#### 1. API Đăng ký tài khoản

<img width="1365" height="723" alt="API_Resgister" src="https://github.com/user-attachments/assets/b74dbfd8-9cdb-4119-b044-38c4d7a2b15b" />

#### 2. API Đăng nhập và lấy JWT

<img width="1365" height="723" alt="API_Login" src="https://github.com/user-attachments/assets/9215c2e1-9155-45d3-a7ea-d69981600d80" />

## III. Xây dựng Frontend

#### 1. Xây dựng giap diện hệ thống cơ bản đầu tiên cho Hệ thống Website bán hàng Online

<img width="1365" height="602" alt="Style css" src="https://github.com/user-attachments/assets/6f5723f5-f73c-4c4d-a36c-89cfee543250" />

- Nâng cấp lên dạng chi tiết hơn, hiện đại hơn 1 chút
  <img width="1365" height="616" alt="Style css-2" src="https://github.com/user-attachments/assets/7459e11f-d26f-42db-8ed4-67d40cd15f6b" />

## Cập nhật chuyển hướng dự án

- Thay đổi về kiến trúc, chức năng và giao diện của dự án khi thu hẹp phạm vi từ một Hệ thống website bán hàng online với sản phẩm chung, chuyển về thành một Hệ thống website chuyên về bán hàng công nghệ.

#### 1. Thay đổi về phân tích yêu cầu

- Thay đổi về đối tượng dữ liệu từ chỉ là sản phẩm với kích thước, size, màu sắc
  => Thành sản phẩm yêu cầu các thông số kĩ thuật, thông số phức tạp và chi tiết hơn để phù hợp với các sản phẩm công nghệ.
- Thêm các yêu cầu chức năng mới
  - Tính năng so sánh sản phẩm để người mua có thể có cẩn nhắc tốt nhất
  - Bộ lọc nâng cao nhằm tìm kiếm sản phẩm dễ đàng hơn.

#### 2. Cập nhật đặc tả và thiết kế hệ thống.

- Cập nhật thêm những chi tiết thông số trong bảng Products:
  - sku: mã lưu kho của các đồ công nghệ.
  - brand: thương hiệu.
  - description: mô tả chi tiết sản phẩm.
- Thiết kế luồng nghiệp vụ của hệ thống một cách chi tiết trong từng phần. Đảm bảo hệ thống có nghiệp vụ chuyên nghiệp, rõ ràng.

#### 3. Backend

- Cập nhật cấu trúc của bảng Products
- Bổ sung api truy cứu dữ liệu tốt hơn nhằm cơ chế so sánh sản phẩm.

#### 4. Frontend

- Cập nhật giao diện hệ thống mới, phù hợp với mặt hàng công nghệ.
- Thay đổi lại cấu trúc của index.html và style.css
  <img width="1360" height="626" alt="Screenshot 2026-08-01 082720" src="https://github.com/user-attachments/assets/f3d3d294-85ea-48aa-8b27-bc48855477f6" />

- Giữ nguyên các chức năng trong app.js,
  - Cập nhật thêm các tính năng tìm kiếm sản phẩm trong app.js

##

/\*

1. Shop by Brand: Apple, ASUS, Beats, Dell, GE, HP, Lenovo, LG, Meta, Nintendo, Samsung, Sony, All Brands;
2. TV & Home Theater: Explore TV & Home Theater, Learn About RGB LED TVs, TVs by Size, TVs by Brand, TVs by Type, All Sound Bars & Home Audio, Projectors & Screens, Blu-ray & DVD Players, Streaming Devices, Home Theater Accessories, Premium TV & Home Theater.
3. Computers & Tablets: Explore Computers & Tablets, Laptops & Desktops, Tablets, Monitors, PC Gaming & Virtual Reality, Computer Components, Hard Drives, SSD & Storage, Computer Accessories, Software, Printers, Ink & Toner, Wifi & Networking.
4. Appliances: Explore Appliances, Major Kitchen Appliances, Small Kitchen Appliances, Luxury Kitchen Appliances, Washers & Dryers, Vacuums & Floor Care, Heating, Cooling & Air Quality, Appliance Packages, Shop by Brand, Small Space Appliances, Appliance Parts & Accessories.
5. Small Kitchen Appliances: Explore Small Kitchen Appliances, Small Kitchen Appliance Deals, Air Fryers & Deep Fryers, Bar & Wine, Blenders & Juicers, Coffee, Tea & Espresso, Microwaves, Mini Fridges, Mixers, Pressure Cookers, Toasters & Toaster Ovens.
6. Video Games: Explore Video Games, Nintendo, Xbox, PlayStation, PC Gaming, Virtual Reality, Gaming Accessories, Digital Gaming, Handheld Gaming, Retro Gaming & Arcade, Simulation Racing.
7. Cell Phones: Explore Cell Phones, Cell Phone Accessories, Unlocked Phones, iPhone, Samsung Galaxy, Google Pixel, Motorola, Verizon, AT&T, Prepaid Phones & Carriers, SIM Cards.
8. Headphones: Explore Headphones, AirPods, Wireless Headphones, True Wireless Earbuds, Open-Ear Headphones, Over-Ear & On-Ear Headphones, Earbud & In-Ear Headphones, Noise-Cancelling Headphones, Wired Headphones, Sports Headphones, Headphone Accessories.
9. Home Audio & Speakers: Explore Home Audio & Speakers, Home Audio, Portable Audio, Premium Home Audio & Speakers, Home Audio Accessories, Audio Packages.
10. Music, Movies & TV Shows: Explore Music, Movies & TV Shows, Music, Movies, TV Shows.
11. Cameras, Camcorders & Drones: Explore Cameras, Camcorders & Drones, Cameras & Lenses, Action Cameras & Camcorders, Content Creator Gear, Camera Accessories, Drones, Binoculars, Telescopes & Optics, Shop by Brand.
12. Wearable Technology: Explore Wearable Technology, Apple Watch, Samsung Galaxy Smartwatches, Smartwatches, Fitness Trackers & Accessories, Smart Rings, Smart & AI Glasses, Virtual Reality, Shop by Brand, Wearable Technology Accessories.
13. Fitness, Sports & Outdoors: Explore Fitness, Sports & Outdoors, Exercise & Fitness Equipment, Water Sports Equipment, Sports Gear & Equipment, Kid\'s Sports & Outdoor Play, Camping Gear, Electric Transportation, Biking, Game Room, Yard Games.
14. Sports Fan Shop: Explore Sports Fan Shop, College, NFL, NBA, MLB, NHL, Soccer, Golf, WNBA.
15. Health, Wellness & Personal Care: Explore Health, Wellness & Personal Care, Home Health Care, Personal Care & Beauty, Workout Recovery, Eyewear, Baby, Contrast Therapy: Hot & Cold Therapy, Muscle Pain Relief, Ear Care.
16. Home, Furniture & Office: Explore Home, Furniture & Office, Home, Furniture & Decor, Kitchen & Dining, Office, Bathroom, Household Essentials, Luggage & Travel, Tools & Garage, Storage & Organization, Holiday Decorations.
17. Smart Home, Security & Wifi: Explore Smart Home, Security & Wifi, Wifi & Networking, Security Cameras & Surveillance, Smart Doorbells, Smart Door Locks, Home Security Systems, Smart Speakers & Displays, Smart Lighting, Smart Thermostats, Smart Plugs & Outlets, Smart Devices.
18. Outdoor Living: Explore Outdoor Living, Grills & Outdoor Cooking, Outdoor Kitchens, Outdoor Heating, Outdoor Power Equipment, Outdoor Home Theater, Outdoor Lighting, Patio Furniture, Lawn & Garden, Generators & Backup Power, Sheds & Outdoor Storage.
19. Electric Transportation: Explore Electric Transportation, Electric Bikes, Electric Scooters, Hoverboards, Electric Car Chargers, Kid\'s Scooters & Ride-ons, Safety Gear & Accessories.
20. Car Electronics & GPS: Explore Car Electronics & GPS, Car Audio, Auto Care & Cleaning, Auto Tools & Equipment, Car Security & Convenience, Back-up & Dash Cameras, GPS Navigation, Marine & Powersports, Installation Parts & Accessories.
21. Toys, Games & Crafts: Explore Toys, Games & Crafts, Toys by Type, Toys by Age, Games, Puzzles & Cards, Arts & Crafts, Crafting Technology, Collectibles, Shop by Character.
    \*/
