require("dotenv").config(); // Active read file .env
const express = require("express");
const mysql = require("mysql2");

const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const rateLimit = require("express-rate-limit"); // Add Rate Limit
const { body, validationResult } = require("express-validator");

const multer = require("multer");
const path = require("path");

const { OpenAI } = require("openai");
const groq = new OpenAI({ 
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1" 
});

const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "MÃ_CLIENT_ID_CỦA_BẠN.apps.googleusercontent.com";
const googleClient = new OAuth2Client(CLIENT_ID);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const crypto = require("crypto");
const qs = require("qs");

const vnp_TmnCode = "MÃ_TMNCODE_MỚI"; 
const vnp_HashSecret = "CHUỖI_BÍ_MẬT_MỚI"; 
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://localhost:3000/api/vnpay_return";

const upload = multer({ storage: storage });

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    const lang = req.query.lang || 'en';
    
    const sqlCount = "SELECT COUNT(id) as total FROM Products";
    
    const sqlData = `
        SELECT p.*, 
               (SELECT GROUP_CONCAT(pi.image_url SEPARATOR ',') FROM Product_Images pi WHERE pi.product_id = p.id) AS gallery,
               (SELECT GROUP_CONCAT(r.comment SEPARATOR ' ') FROM Reviews r WHERE r.product_id = p.id) AS all_reviews
        FROM Products p
        ORDER BY p.id DESC
        LIMIT ${limit} OFFSET ${offset}
    `;

    db.query(sqlCount, (err, countResult) => {
        if (err) return res.status(500).json({ error: 'Server error counting products.' });
        
        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        db.query(sqlData, (err, results) => {
            if (err) return res.status(500).json({ error: 'Server error fetching products.' });
            
            const finalResults = results.map(row => {
                let images = [];
                if (row.image_url) images.push(row.image_url);
                if (row.gallery) images = images.concat(row.gallery.split(','));
                
                // --- LOGIC XỬ LÝ NGÔN NGỮ ĐỘNG ---
                if (lang === 'vi') {
                    row.name = row.name_vi || row.name;
                    row.description = row.description_vi || row.description;
                }

                row.all_images = images;
                return row;
            });
            
            res.json({
                data: finalResults,
                pagination: {
                    total_records: totalProducts,
                    current_page: page,
                    total_pages: totalPages,
                    limit: limit
                }
            });
        });
    });
});

// 4. APT for registering a new account
app.post("/api/register", 
  [
    body('email').isEmail().withMessage('Email invalid'),
    body('password').isLength({ min: 6 }).withMessage('The password must be at least 6 characters long'),
    body('full_name').notEmpty().withMessage('Full name cannot be left blank'),
    body('phone').isMobilePhone('vi-VN').withMessage('The phone number is not in the correct Vietnamese format')
  ], 
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password, full_name, phone } = req.body;

  try {
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
    
    res.json({ message: "Login successful!", token: token, role: user.role }); 
  });
});

// 6. Middleware protection (Check JWT tag)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "You need to log in to use this funtion." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: "Invalid or expired token!" });

    req.user = user; 
    next(); 
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

// Only Shipper (or Admin) can pass
const isShipper = (req, res, next) => {
  if (req.user && (req.user.role === 'shipper' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ error: "Access Denied. You are not a shipper."});
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
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { category_id, name, sku, brand, price, stock, description, main_image, extra_images } = req.body;
    const finalStock = stock || 0; 

    const sql = `INSERT INTO Products (category_id, name, sku, brand, price, stock, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [category_id, name, sku, brand, price, finalStock, main_image || null, description], (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "This SKU already exists in the system!" });
          return res.status(500).json({ error: "Server error when saving the product." });
        }

        const productId = result.insertId;

        if (extra_images && Array.isArray(extra_images) && extra_images.length > 0) {
            const extraValues = extra_images.map(url => [productId, url]);
            db.query("INSERT INTO Product_Images (product_id, image_url) VALUES ?", [extraValues], () => {
                res.status(201).json({ message: "Product and gallery linked successfully!", product_id: productId });
            });
        } else {
            res.status(201).json({ message: "Product added successfully!", product_id: productId });
        }
    });
});

// 7. Ordering API
app.post("/api/orders", authenticateToken, (req, res) => {
  const user_id = req.user.id; 
  const { shipping_address, total_amount, cartItems } = req.body;

  const inserOrderSql = "INSERT INTO Orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)";

  db.query(inserOrderSql, [user_id, total_amount, shipping_address], (err, result) => {
      if (err) return res.status(500).json({ error: "Order creation error!" });

      const order_id = result.insertId; 

      cartItems.forEach((item) => {
        const insertDetailSql = "INSERT INTO Order_Details (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)";
        db.query(insertDetailSql, [order_id, item.product_id, item.quantity, item.price], (err) => {
            if (!err) {
              const updateStockSql = "UPDATE Products SET stock = stock - ? WHERE id = ?";
              db.query(updateStockSql, [item.quantity, item.product_id]);
            }
          }
        );
      });

      res.json({
        message: "Order placed successfully!",
        order_id: order_id,
        status: "pending",
      });
    }
  );
});

// API: Get orders history
app.get("/api/orders/history", authenticateToken, (req, res) => {
  const user_id = req.user.id; 

  const sql = `
    SELECT o.id as order_id, o.total_amount, o.status, o.create_at,
           od.quantity, od.price_at_purchase,
           p.name as product_name, p.image_url
    FROM Orders o
    JOIN Order_Details od ON o.id = od.order_id
    JOIN Products p ON od.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.create_at DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error retrieving order history:", err);
      return res.status(500).json({ error: "Server error!" });
    }

    const ordersMap = {};
    results.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          total_amount: row.total_amount,
          status: row.status,
          create_at: row.create_at,
          items: []
        };
      }
      ordersMap[row.order_id].items.push({
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price_at_purchase,
        image_url: row.image_url
      });
    });

    res.json(Object.values(ordersMap));
  });
});

// API: USER PROFILE
app.get("/api/profile", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT email, full_name, phone FROM Users WHERE id = ?";
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error retrieving profile:", err);
      return res.status(500).json({ error: "Server error while retrieving data." });
    }
    if (results.length === 0) return res.status(404).json({ error: "Account not found." });
    
    res.json(results[0]);
  });
});

app.put("/api/profile", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { full_name, phone } = req.body;

  const sql = "UPDATE Users SET full_name = ?, phone = ? WHERE id = ?";
  db.query(sql, [full_name, phone, userId], (err, result) => {
    if (err) {
      console.error("Profile update error:", err);
      return res.status(500).json({ error: "Server error while saving information." });
    }
    res.json({ message: "Your profile has been successfully updated!" });
  });
});

// --- USER ADDRESSES APIs ---
// Get all addresses for a user
app.get("/api/profile/addresses", authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.query("SELECT * FROM User_Addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC", [userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Server error" });
        res.json(results);
    });
});

// Add a new address
app.post("/api/profile/addresses", authenticateToken, (req, res) => {
    const userId = req.user.id;
    let { address, is_default } = req.body;
    
    if (!address) return res.status(400).json({ error: "Address cannot be empty" });

    const insertAddress = (defaultFlag) => {
        db.query("INSERT INTO User_Addresses (user_id, address, is_default) VALUES (?, ?, ?)", [userId, address, defaultFlag], (err) => {
            if (err) return res.status(500).json({ error: "Failed to add address" });
            res.status(201).json({ message: "Address added successfully" });
        });
    };

    if (is_default) {
        db.query("UPDATE User_Addresses SET is_default = FALSE WHERE user_id = ?", [userId], (err) => {
            insertAddress(true);
        });
    } else {
        db.query("SELECT COUNT(*) as count FROM User_Addresses WHERE user_id = ?", [userId], (err, results) => {
            const isFirst = (!err && results[0].count === 0);
            insertAddress(isFirst);
        });
    }
});

app.put("/api/profile/addresses/:id/default", authenticateToken, (req, res) => {
    const addressId = req.params.id;
    const userId = req.user.id;

    db.query("UPDATE User_Addresses SET is_default = FALSE WHERE user_id = ?", [userId], (err) => {
        if (err) return res.status(500).json({ error: "Server error" });
        db.query("UPDATE User_Addresses SET is_default = TRUE WHERE id = ? AND user_id = ?", [addressId, userId], (err) => {
            res.json({ message: "Default address updated!" });
        });
    });
});

app.delete("/api/profile/addresses/:id", authenticateToken, (req, res) => {
    const addressId = req.params.id;
    const userId = req.user.id;
    db.query("DELETE FROM User_Addresses WHERE id = ? AND user_id = ?", [addressId, userId], (err) => {
        if (err) return res.status(500).json({ error: "Server error" });
        res.json({ message: "Address deleted successfully!" });
    });
});

// API for Admin: Get Orders
app.get("/api/admin/orders", authenticateToken, isAdmin, (req, res) => {
  const sql = `
    SELECT o.id, o.total_amount, o.status, o.shipping_address, o.create_at, o.shipper_id,
           u.full_name, u.email, u.phone
    FROM Orders o
    JOIN Users u ON o.user_id = u.id
    ORDER BY o.create_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving admin order:", err);
      return res.status(500).json({ error: "Server error when retrieving order data." });
    }
    res.json(results);
  });
});

// API for Admin: Get Customers
app.get("/api/admin/customers", authenticateToken, isAdmin, (req, res) => {
  const sql = `SELECT id, full_name, email, phone, role FROM Users ORDER BY id DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving customer list:", err);
      return res.status(500).json({ error: "Server error when retrieving the customer list." });
    }
    res.json(results);
  });
});

// API to retrieve the complete category list automatically (No login required, allowing frontend usage).
app.get("/api/categories", (req, res) => {
  db.query("SELECT * FROM Categories", (err, results) => {
    if (err) {
      console.error("Error loading category:", err);
      return res.status(500).json({ error: "Server error when loading the category." });
    }
    res.json(results);
  });
});

// Order Status Update API
app.put("/api/admin/orders/:id/status", authenticateToken, isAdmin, (req, res) => {
  const { status, shipper_id } = req.body;
  const orderId = req.params.id;

  let sql = "UPDATE Orders SET status = ?";
  let params = [status];

  if (shipper_id !== undefined) {
      sql += ", shipper_id = ?";
      params.push(shipper_id === "" ? null : shipper_id);
  }

  sql += " WHERE id = ?";
  params.push(orderId);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating order status:", err);
      return res.status(500).json({ error: "Server error during update." });
    }
    res.json({ message: "Order updated successfully!" });
  });
});

// Delete Product API
app.delete("/api/admin/products/:id", authenticateToken, isAdmin, (req, res) => {
  const productId = req.params.id;
  
  db.query("DELETE FROM Products WHERE id = ?", [productId], (err, result) => {
    if (err) {
      console.error("Error deleting product:", err);
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ error: "Cannot be deleted because this product has already been ordered by a customer." });
      }
      return res.status(500).json({ error: "Server error when deleting the product." });
    }
    res.json({ message: "Product deleted successfully!" });
  });
});

// Update Product API
app.put("/api/admin/products/:id", 
  authenticateToken, 
  isAdmin, 
  [
    body('name').notEmpty().withMessage('The product name cannot be empty.'),
    body('category_id').isInt({ min: 1 }).withMessage('The Category ID must be a positive integer.'),
    body('sku').notEmpty().withMessage('The SKU code cannot be empty.'),
    body('price').isFloat({ gt: 0 }).withMessage('The product price must be greater than 0.'),
    body('stock').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Inventory cannot be negative.')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const productId = req.params.id;
    const { category_id, name, sku, brand, price, stock, description, main_image, extra_images, specifications } = req.body;
    const finalStock = stock || 0; 
    const specsJson = specifications ? JSON.stringify(specifications) : null;
    const sql = `UPDATE Products SET category_id=?, name=?, sku=?, brand=?, price=?, stock=?, image_url=?, description=?, specifications=? WHERE id=?`;
    const values = [category_id, name, sku, brand, price, finalStock, main_image || null, description, specsJson, productId];
      
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: "Server error." });
          
        db.query("DELETE FROM Product_Images WHERE product_id = ?", [productId], () => {
            if (extra_images && Array.isArray(extra_images) && extra_images.length > 0) {
                const extraValues = extra_images.map(url => [productId, url]);
                db.query("INSERT INTO Product_Images (product_id, image_url) VALUES ?", [extraValues], () => {
                    res.json({ message: "Product updated with specifications and new gallery!" });
                });
            } else {
                res.json({ message: "Product updated successfully!" });
            }
        });
    });
});

// API: MEDIA LIBRARY MANAGER (WITH FOLDERS)
app.get("/api/admin/media/folders", authenticateToken, isAdmin, (req, res) => {
    db.query("SELECT * FROM Media_Folders ORDER BY name ASC", (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch folders." });
        res.json(results);
    });
});

app.post("/api/admin/media/folders", authenticateToken, isAdmin, (req, res) => {
    const { name, parent_id } = req.body; 
    if (!name) return res.status(400).json({ error: "Folder name is required." });
    
    db.query("INSERT INTO Media_Folders (name, parent_id) VALUES (?, ?)", [name, parent_id || null], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Folder already exists." });
            return res.status(500).json({ error: "Database error." });
        }
        res.status(201).json({ message: "Folder created!", id: result.insertId });
    });
});

app.post("/api/admin/media", authenticateToken, isAdmin, upload.array('images', 10), (req, res) => {
    const files = req.files;
    const folder_id = req.body.folder_id;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "Please select at least one image." });
    }

    const finalFolderId = (folder_id && folder_id !== 'null' && folder_id !== '') ? folder_id : null;
    const values = files.map(f => [f.originalname, `http://localhost:3000/images/${f.filename}`, finalFolderId]);
    
    db.query("INSERT INTO Media_Library (file_name, file_url, folder_id) VALUES ?", [values], (err, result) => {
        if (err) {
            console.error("Media Upload Error:", err);
            return res.status(500).json({ error: "Database error while saving media." });
        }
        res.status(201).json({ message: "Images successfully added to the Media Library!" });
    });
});

app.get("/api/admin/media", authenticateToken, isAdmin, (req, res) => {
    const { folder_id } = req.query;
    
    let sql = "SELECT * FROM Media_Library ";
    let params = [];

    if (folder_id) {
        if (folder_id === 'unassigned') {
            sql += "WHERE folder_id IS NULL ";
        } else {
            sql += "WHERE folder_id = ? ";
            params.push(folder_id);
        }
    }
    
    sql += "ORDER BY uploaded_at DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch media." });
        res.json(results);
    });
});

app.delete("/api/admin/media/folders/:id", authenticateToken, isAdmin, (req, res) => {
    const folderId = req.params.id;
    
    db.query("UPDATE Media_Library SET folder_id = NULL WHERE folder_id = ?", [folderId], (err) => {
        if (err) return res.status(500).json({ error: "Failed to move images." });
        
        db.query("UPDATE Media_Folders SET parent_id = NULL WHERE parent_id = ?", [folderId], (err) => {
            
            db.query("DELETE FROM Media_Folders WHERE id = ?", [folderId], (err) => {
                if (err) return res.status(500).json({ error: "Failed to delete folder." });
                res.json({ message: "Folder deleted successfully!" });
            });
        });
    });
});

// API: PRODUCT REVIEWS
app.get("/api/products/:id/reviews", (req, res) => {
    const productId = req.params.id;
    // Bổ sung lấy cột r.image_url từ Database
    const sql = `
        SELECT r.id, r.rating, r.comment, r.image_url, r.created_at, u.full_name 
        FROM Reviews r 
        JOIN Users u ON r.user_id = u.id 
        WHERE r.product_id = ? 
        ORDER BY r.created_at DESC
    `;
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error("Fetch Reviews Error:", err);
            return res.status(500).json({ error: "Failed to load reviews." });
        }
        res.json(results);
    });
});

app.post("/api/products/:id/reviews", authenticateToken, upload.single('image'), (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id; 
    const { rating, comment } = req.body;
    let imageUrl = null;

    if (req.file) {
        imageUrl = `http://localhost:3000/images/${req.file.filename}`;
    }

    if (!rating) return res.status(400).json({ error: "Please select a star rating." });

    const sql = `INSERT INTO Reviews (product_id, user_id, rating, comment, image_url) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(sql, [productId, userId, rating, comment, imageUrl], (err, result) => {
        if (err) {
            console.error("Submit Review Error:", err);
            return res.status(500).json({ error: "Failed to submit your review." });
        }
        res.status(201).json({ message: "Thank you for your review!" });
    });
});

app.post("/api/products/:id/reviews", authenticateToken, (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id; 
    const { rating, comment } = req.body;

    if (!rating) return res.status(400).json({ error: "Please select a star rating." });

    const sql = `INSERT INTO Reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [productId, userId, rating, comment], (err, result) => {
        if (err) {
            console.error("Submit Review Error:", err);
            return res.status(500).json({ error: "Failed to submit your review." });
        }
        res.status(201).json({ message: "Thank you for your review!" });
    });
});

// API: SHIPPING & LOGISTICS LOGIC
app.get("/api/admin/shippers", authenticateToken, isAdmin, (req, res) => {
    db.query("SELECT id, full_name, phone FROM Users WHERE role = 'shipper'", (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch shippers." });
        res.json(results);
    });
});

app.get("/api/shipper/orders", authenticateToken, isShipper, (req, res) => {
    const shipperId = req.user.id;
    const sql = `
        SELECT o.id, o.total_amount, o.status, o.shipping_address, o.create_at,
               u.full_name, u.phone
        FROM Orders o
        JOIN Users u ON o.user_id = u.id
        WHERE o.shipper_id = ?
        ORDER BY o.create_at DESC
    `;
    
    db.query(sql, [shipperId], (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch assigned orders." });
        res.json(results);
    });
});

app.put("/api/shipper/orders/:id/status", authenticateToken, isShipper, (req, res) => {
    const shipperId = req.user.id;
    const orderId = req.params.id;
    const { status } = req.body; 

    if (status !== 'completed' && status !== 'cancelled' && status !== 'pending') {
        return res.status(400).json({ error: "Invalid status update from shipper." });
    }

    db.query("UPDATE Orders SET status = ? WHERE id = ? AND shipper_id = ?", [status, orderId, shipperId], (err, result) => {
        if (err) return res.status(500).json({ error: "Server error." });
        if (result.affectedRows === 0) return res.status(403).json({ error: "Unauthorized or order not found." });
        
        res.json({ message: "Delivery status updated successfully!" });
    });
});

// API: TẠO URL THANH TOÁN VNPAY
app.post("/api/create_payment_url", authenticateToken, (req, res) => {
    const { order_id, amount, bankCode } = req.body;
    
    let date = new Date();
    let createDate = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2) + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2);
    
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = order_id;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + order_id;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 25000 * 100; 
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode) { vnp_Params['vnp_BankCode'] = bankCode; }

    vnp_Params = sortObject(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    
    let paymentUrl = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
    res.json({ paymentUrl: paymentUrl });
});

// API: XỬ LÝ KẾT QUẢ TỪ VNPAY TRẢ VỀ
app.get("/api/vnpay_return", (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");     

    if(secureHash === signed){
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            db.query("UPDATE Orders SET status = 'completed' WHERE id = ?", [vnp_Params['vnp_TxnRef']]);
            
            res.redirect("http://127.0.0.1:5500/index.html?payment=success");
        } else {
            res.redirect("http://127.0.0.1:5500/index.html?payment=failed");
        }
    } else{
        res.status(200).send('Chuỗi mã hóa không hợp lệ!');
    }
});

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) { str.push(encodeURIComponent(key)); }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// API: AI CHATBOT (GROQ - LLaMA 3)
app.post("/api/chat", async (req, res) => {
    const { message, lang } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    const language = lang === 'vi' ? 'Vietnamese' : 'English';

    db.query("SELECT name, brand, price, stock FROM Products LIMIT 20", async (err, products) => {
        if (err) return res.status(500).json({ error: "Database error." });

        const systemPrompt = `
        You are a helpful, concise, and professional customer support virtual assistant for "Best Tech", an electronics e-commerce store.
        Here is the list of our current available products (Name - Brand - Price - Stock):
        ${JSON.stringify(products)}
        If a customer asks about a product not on this list, politely inform them that you need to check the full catalog or suggest similar available items. 
        IMPORTANT: You MUST reply entirely in ${language}. Do not use any other language.
        `;

        try {
            const completion = await groq.chat.completions.create({
                model: "groq/compound-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.7
            });

            res.json({ reply: completion.choices[0].message.content });
        } catch (error) {
            console.error("Groq Error:", error);
            res.status(500).json({ error: "AI is sleeping. Please try again later." });
        }
    });
});

// API: GOOGLE OAUTH 
app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, 
        });
        
        const payload = ticket.getPayload();
        const email = payload.email;
        const full_name = payload.name;
        
        db.query("SELECT * FROM Users WHERE email = ?", [email], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error." });

            if (results.length > 0) {
                const user = results[0];
                const jwtToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
                res.json({ message: "Google Login successful!", token: jwtToken, role: user.role });
            } else {
                const sql = "INSERT INTO Users (email, full_name, role) VALUES (?, ?, 'user')";
                db.query(sql, [email, full_name], (err, result) => {
                    if (err) return res.status(500).json({ error: "Could not create account." });
                    
                    const newUserId = result.insertId;
                    const jwtToken = jwt.sign({ id: newUserId, role: "user" }, JWT_SECRET, { expiresIn: "1d" });
                    res.json({ message: "Account created via Google!", token: jwtToken, role: "user" });
                });
            }
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ error: "Invalid Google Token." });
    }
});

// API: AI PRODUCT COMPARISON
app.post("/api/compare-ai", async (req, res) => {
    const { products, lang } = req.body;
    if (!products || products.length < 2) return res.status(400).json({ error: "Need at least 2 products." });

    const language = lang === 'vi' ? 'Vietnamese' : 'English';
    const productInfo = products.map(p => `${p.name} (Price: $${p.price})`).join(" vs ");
    
    const systemPrompt = `
    You are a Senior Tech Reviewer for a premium e-commerce platform. The user is comparing: ${productInfo}.
    Detailed specifications: ${JSON.stringify(products)}.

    Provide a highly engaging, professional comparison STRICTLY in ${language}. 
    You MUST format your response using standard HTML tags (<p>, <ul>, <li>). Do NOT use Markdown like ** or *.

    Follow this exact HTML structure and do not deviate:
    <p><strong>${lang === 'vi' ? 'Tổng quan:' : 'Overview:'}</strong> [1 short sentence summarizing the matchup]</p>
    <ul>
      <li>[Highlight key difference 1]. Wrap crucial specs, features, or prices in <strong style="color: #ef4444;">[text]</strong>.</li>
      <li>[Highlight key difference 2]. Wrap crucial specs, features, or prices in <strong style="color: #ef4444;">[text]</strong>.</li>
    </ul>
    <p><strong>${lang === 'vi' ? 'Lời khuyên:' : 'Verdict:'}</strong> [1-2 sentences on who should buy which product. Wrap the target audience or winning feature in <strong style="color: #ef4444;">[text]</strong>]</p>

    Remember: Your entire response, including explanations and evaluations, must be completely written in ${language}.
    `;

    try {
        const completion = await groq.chat.completions.create({
            model: "groq/compound-mini", // Giữ nguyên model đang hoạt động tốt của bạn
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Please evaluate these products." } // Đã sửa: Thay thế biến 'message' bị lỗi bằng chuỗi text
            ],
            temperature: 0.7
        });
        res.json({ evaluation: completion.choices[0].message.content });
    } catch (error) {
        console.error("AI Compare Error:", error);
        res.status(500).json({ error: "AI comparison failed." });
    }
});
// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    `The server backend is currently running at http://localhost:${PORT}`);
});