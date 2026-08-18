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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
    const { brand } = req.query; 

    let sql = `
        SELECT p.*, 
               (SELECT GROUP_CONCAT(pi.image_url SEPARATOR ',') FROM Product_Images pi WHERE pi.product_id = p.id) AS gallery
        FROM Products p
    `;
    let queryParams = [];

    if (brand) {
        sql += ' WHERE p.brand = ?';
        queryParams.push(brand);
    }

    db.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error("Fetch products error:", err);
            return res.status(500).json({ error: 'Server error while fetching products.' });
        }
        
        const finalResults = results.map(row => {
            let images = [];
            if (row.image_url) images.push(row.image_url);
            if (row.gallery) {
                images = images.concat(row.gallery.split(','));
            }
            row.all_images = images;
            return row;
        });
        
        res.json(finalResults);
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
    res.json({ message: "Login successful!", token: token });
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

// ==========================================
// API: USER PROFILE
// ==========================================
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

// API for Admin: Get Orders
app.get("/api/admin/orders", authenticateToken, isAdmin, (req, res) => {
  const sql = `
    SELECT o.id, o.total_amount, o.status, o.shipping_address, o.create_at,
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
  const { status } = req.body;
  const orderId = req.params.id;

  db.query("UPDATE Orders SET status = ? WHERE id = ?", [status, orderId], (err, result) => {
    if (err) {
      console.error("Error updating order status:", err);
      return res.status(500).json({ error: "Server error during update." });
    }
    res.json({ message: "Status updated successfully!" });
  });
});

// Delete Product API
app.delete("/api/admin/products/:id", authenticateToken, isAdmin, (req, res) => {
  const productId = req.params.id;
  
  db.query("DELETE FROM Products WHERE id = ?", [productId], (err, result) => {
    if (err) {
      console.error("Lỗi xóa sản phẩm:", err);
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
    const { category_id, name, sku, brand, price, stock, description, main_image, extra_images } = req.body;
    const finalStock = stock || 0; 

    const sql = `UPDATE Products SET category_id=?, name=?, sku=?, brand=?, price=?, stock=?, image_url=?, description=? WHERE id=?`;
    const values = [category_id, name, sku, brand, price, finalStock, main_image || null, description, productId];
      
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: "Server error." });
          
        db.query("DELETE FROM Product_Images WHERE product_id = ?", [productId], () => {
            if (extra_images && Array.isArray(extra_images) && extra_images.length > 0) {
                const extraValues = extra_images.map(url => [productId, url]);
                db.query("INSERT INTO Product_Images (product_id, image_url) VALUES ?", [extraValues], () => {
                    res.json({ message: "Product updated with new gallery links!" });
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
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Folder name is required." });
    
    db.query("INSERT INTO Media_Folders (name) VALUES (?)", [name], (err, result) => {
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

app.delete("/api/admin/media/:id", authenticateToken, isAdmin, (req, res) => {
    const mediaId = req.params.id;
    db.query("DELETE FROM Media_Library WHERE id = ?", [mediaId], (err, result) => {
        if (err) {
            console.error("Delete Media Error:", err);
            return res.status(500).json({ error: "Failed to delete media." });
        }
        res.json({ message: "Media deleted successfully!" });
    });
});

// API: PRODUCT REVIEWS
app.get("/api/products/:id/reviews", (req, res) => {
    const productId = req.params.id;
    const sql = `
        SELECT r.id, r.rating, r.comment, r.created_at, u.full_name 
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

app.post("/api/products/:id/reviews", authenticateToken, (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Please provide a valid rating (1-5 stars)." });
    }

    const sql = "INSERT INTO Reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
    db.query(sql, [productId, userId, rating, comment], (err, result) => {
        if (err) {
            console.error("Submit Review Error:", err);
            return res.status(500).json({ error: "Failed to submit your review." });
        }
        res.status(201).json({ message: "Thank you for your review!" });
    });
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    `The server backend is currently running at http://localhost:${PORT}`,
  );
});