require("dotenv").config(); // Active read file .env
const express = require("express");
const mysql = require("mysql2");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rateLimit = require("express-rate-limit"); // Add Rate Limit
const { body, validationResult } = require("express-validator");

const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

app.use(cors());
app.use(express.json()); // To read JSON data

app.use('/images', express.static('images'));

// 1. Connect to internship_project Database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error: ", err);
    return;
  }
  console.log("Database connection successful!");
});

// 2. Write an API to display a list of products (GET /api/products)
app.get('/api/products', (req, res) => {
    const { brand } = req.query; 
    
    let sql = 'SELECT * FROM Products';
    let queryParams = [];

    if (brand) {
        sql += ' WHERE brand = ?';
        queryParams.push(brand);
    }

    db.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Lỗi máy chủ' });
        }
        res.json(results);
    });
});

// 3. Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    "The server backend is currently running at http://localhost:${PORT}",
  );
});

// 4. APT for registering a new account
app.post("/api/register", 
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('full_name').notEmpty().withMessage('Họ tên không được để trống'),
    body('phone').isMobilePhone('vi-VN').withMessage('Số điện thoại không đúng định dạng VN')
  ], 
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  message: { error: ""}
});


// 5. Login API
app.post("/api/login", loginLimiter, (req, res) => {
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

// 6. Middleware protection (Check JWT tag)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Tokens are usually sent with the word "Bearer" attched, cut it onpen to get the actual code
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ error: "You need to log in to use this funtion." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: "Invalid or expired token!" });

    req.user = user; // Save the customer ID information in the request for continued use.
    next(); // Allow passage through the checkpoint.
  });
};

// Only Admin can pass
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: "Access Denied. You do not have administrator rights."});
  }
};

// API: Admin add new Products (have Validation)
app.post("/api/products", 
  authenticateToken, 
  isAdmin, 
  [
    body('name').notEmpty().withMessage('The product name cannot be left blank!'),
    body('category_id').isInt({ min: 1 }).withMessage('The Category ID must be a positive integer!'),
    body('sku').notEmpty().withMessage('The SKU code cannot be left blank!'),
    body('price').isFloat({ gt: 0 }).withMessage('The product price must be a number greater than 0!'),
    body('stock').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Inventory cannot be negative!')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { category_id, name, sku, brand, price, stock, image_url, description } = req.body;

    const finalStock = stock || 0; 

    const sql = `INSERT INTO Products 
      (category_id, name, sku, brand, price, stock, image_url, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [category_id, name, sku, brand, price, finalStock, image_url, description],
      (err, result) => {
        if (err) {
          console.error("Insert Product Error:", err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "This SKU already exists in the system!" });
          }
          return res.status(500).json({ error: "Server error when saving the product." });
        }

        res.status(201).json({ 
          message: "Product added successfully!", 
          product_id: result.insertId 
        });
      }
    );
});

// 7. Ordering API (Requires going through the authenticateToken station)
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
