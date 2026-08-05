const API_URL = "http://localhost:3000/api/products";
const ORDER_API = "http://localhost:3000/api/orders";

const productList = document.getElementById("product-list");
const cartItemList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const orderForm = document.getElementById("order-form");

// VIEWS
const shopLayout = document.querySelector(".shop-layout");
const detailView = document.getElementById("product-detail-view");
const backToShopBtn = document.getElementById("back-to-shop");

// Cart Drawer Elements
const cartDrawer = document.getElementById("cart-drawer");
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");

// SEARCH
const searchInput = document.getElementById("search-input");
const searchBtn = document.querySelector(".search-btn");

// BRAND FILTER
const brandCheckboxes = document.querySelectorAll('#brand-filters input[type="checkbox"]');
const priceRadios = document.querySelectorAll('input[name="price"]');

// AUTH MODAL & LOGIN
const authModal = document.getElementById("auth-modal");
const loginTrigger = document.getElementById("login-trigger");
const closeModal = document.getElementById("close-modal");
const loginForm = document.getElementById("login-form");

// login/Register Tab Switching Logic
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const registerForm = document.getElementById("register-form");

// Logic Order History
const historyTrigger = document.getElementById("order-history-trigger");
const historyModal = document.getElementById("order-history-modal");
const closeHistoryModal = document.getElementById("close-history-modal");
const historyList = document.getElementById("order-history-list");

if (tabLogin && tabRegister) {
  // CLick tab Sign In
  tabLogin.addEventListener("click", () => {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    
    tabLogin.style.color = "#0046be";
    tabLogin.style.borderBottom = "3px solid #0046be";
    tabRegister.style.color = "#999";
    tabRegister.style.borderBottom = "none";
  });

  // Click tab Register
  tabRegister.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    
    tabRegister.style.color = "#0046be";
    tabRegister.style.borderBottom = "3px solid #0046be";
    tabLogin.style.color = "#999";
    tabLogin.style.borderBottom = "none";
  });
}

// Processing Account Registration Form Submission
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const full_name = document.getElementById("reg-name").value;
    const phone = document.getElementById("reg-phone").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! You can now sign in.");
        registerForm.reset();
        tabLogin.click(); // Đăng ký xong tự động gạt sang tab Đăng nhập
      } else {
        alert(data.error || "Registration failed. Email might already exist.");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection error. Is your Backend running?");
    }
  });
}

// function to open the modal
if (loginTrigger) {
  loginTrigger.addEventListener("click", () => {
      authModal.style.display = "flex";
  });
}

// function to close the modal
if (closeModal) {
  closeModal.addEventListener("click", () => {
    authModal.style.display = "none";
  });
}

// Check if the customer is already logged in
if (localStorage.getItem("token") && loginTrigger) {
  loginTrigger.querySelector("span").innerText = "My Account";
}

// Login Form
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Block reset Website

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        
        alert("Login successful!");
        authModal.style.display = "none";
        loginTrigger.querySelector("span").innerText = "My Account";
        loginForm.reset();
      } else {
        alert(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection error. Is your Node.js running?");
    }
  });
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let allProducts = [];

// Button Back to Shop
if (backToShopBtn) {
  backToShopBtn.addEventListener("click", () => {
    detailView.style.display = "none";
    shopLayout.style.display = "flex";
  });
}

// UI Interaction
if (openCartBtn)
  openCartBtn.addEventListener("click", () => cartDrawer.classList.add("open"));
if (closeCartBtn)
  closeCartBtn.addEventListener("click", () =>
    cartDrawer.classList.remove("open"),
  );

// renderProducts
function renderProducts(productsToDisplay) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  // If no products are found
  if (productsToDisplay.length === 0) {
    productList.innerHTML =
      "<p style='grid-column: 1/-1; text-align: center; font-size: 1.2rem;'>We couldn't find any matches. Try checking your spelling or using less specific terms.</p>";
    return;
  }

  productsToDisplay.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
            <div class="img-wrapper">
                <img src="${product.image_url || "https://via.placeholder.com/300"}" 
                     alt="${product.name}" 
                     onclick="showProductDetail(${product.id})" 
                     style="cursor: pointer;">
                <div class="quick-add" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                    Add to Cart
                </div>
            </div>
            <div class="product-info" onclick="showProductDetail(${product.id})" style="cursor: pointer;">
                <h3 class="product-name">${product.brand ? product.brand + " " : ""}${product.name}</h3>
                <p class="product-price">$${product.price}</p>
            </div>
        `;
    productList.appendChild(card);
  });
}

// The Fetch Function
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const products = await response.json();

    allProducts = products; // Lưu vào biến toàn cục
    renderProducts(allProducts); // Gọi hàm vẽ toàn bộ sản phẩm
  } catch (error) {
    document.getElementById("product-list").innerHTML =
      "<p>Connection error. Please check if your Backend server is running at :3000</p>";
  }
}

function addToCart(id, name, price) {
  const existingItem = cart.find((item) => item.product_id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ product_id: id, name: name, price: price, quantity: 1 });
  }
  updateCart();

  // Visual feedback: open cart when adding
  cartDrawer.classList.add("open");
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.product_id !== id);
  updateCart();
}

function updateCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartUI();
}

function renderCartUI() {
  cartItemList.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    count += item.quantity;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price} x ${item.quantity}</p>
                <button class="remove-item" onclick="removeFromCart(${item.product_id})">Remove</button>
            </div>
        `;
    cartItemList.appendChild(li);
  });
  cartCount.innerText = count;
  cartTotal.innerText = total.toFixed(2);
}

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filteredProducts = allProducts.filter((product) => {
    const productName = product.name.toLowerCase();
    const productBrand = (product.brand || "").toLowerCase();

    return (
      productName.includes(searchTerm) || productBrand.includes(searchTerm)
    );
  });

  if (detailView.style.display === "block") {
    detailView.style.display = "none";
    shopLayout.style.display = "flex";
  }

  renderProducts(filteredProducts);
}

if (searchBtn) {
  searchBtn.addEventListener("click", handleSearch);
}

if (searchInput) {
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  });
}

// security update: checkout button
orderForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Security Alert: Please sign in to complete your purchase.");
    authModal.style.display = "flex";
    return;
  }

  const address = document.getElementById("shipping-address").value;
  const orderData = {
    shipping_address: address,
    total_amount: parseFloat(cartTotal.innerText),
    cartItems: cart,
  };

  try {
    const response = await fetch(ORDER_API, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Order placed successfully! Order ID: " + data.order_id);
      cart = [];
      updateCart();
      orderForm.reset();
      cartDrawer.classList.remove("open");
    } else {
      if (response.status === 401 || response.status === 403) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        loginTrigger.querySelector("span").innerText = "Account";
        authModal.style.display = "flex";
      } else {
        alert("Failed to place order: " + data.error);
      }
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Please try again later.");
  }
});

// View Products Detail
function showProductDetail(product_id) {
  // Find the product in the allProducts data array
  const product = allProducts.find((p) => p.id === product_id);
  if (!product) return;

  // Inject data into the HTML tags of the detail page
  const imgElement = document.getElementById("detail-img");
  if (imgElement) {
    imgElement.src = product.image_url || "https://via.placeholder.com/500";
  }

  // Combine Brand and Model name
  document.getElementById("detail-name").innerText = product.brand
    ? `${product.brand} ${product.name}`
    : product.name;
  document.getElementById("detail-price").innerText = `$${product.price}`;

  // Display technical specifications
  document.getElementById("detail-sku").innerText = product.sku || "N/A";
  document.getElementById("detail-desc").innerText =
    product.description || "No description available for this product.";

  // Warehouse status logic
  const stockElement = document.getElementById("detail-stock");
  if (product.stock > 0) {
    stockElement.innerText = `In Stock (${product.stock} units)`;
    stockElement.style.color = "#059669";
  } else {
    stockElement.innerText = "Out of Stock";
    stockElement.style.color = "#ef4444";
  }

  // Button Add to Cart
  const detailAddBtn = document.getElementById("detail-add-btn");
  const qtyInput = document.getElementById("qty-input");

  if (detailAddBtn) {
    detailAddBtn.onclick = () => {
      const quantity = parseInt(qtyInput ? quantity.value : 1) || 1;

      for (let i = 0; i < quantity; i++) {
        addToCart(product_id, product.name, product.price);
      }
    };
  }

  // logic btn plus/minus quantity
  const btnPlus = document.getElementById("qty-plus");
  const btnMinus = document.getElementById("qty-minus");

  if (btnPlus && btnMinus && qtyInput) {
    qtyInput.value = 1;

    btnPlus.onclick = () => {
      qtyInput.value = parseInt(qtyInput.value) + 1;
    };
    btnMinus.onclick = () => {
      if (parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
      }
    };
  }

  // Switch screen
  shopLayout.style.display = "none";
  detailView.style.display = "block";

  // Smoothle auto-scroll to the top of the page
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// BRAND FILTER
const brandCheckboxes = document.querySelectorAll('#brand-filters input[type="checkbox"]');
const priceRadios = document.querySelectorAll('input[name="price"]');

function handleFilters() {
  const selectedBrands = Array.from(brandCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value.toLowerCase());

  const selectedPrice = document.querySelector('input[name="price"]:checked')?.value || 'all';

  let filteredProducts = allProducts.filter((product) => {
    const productBrand = (product.brand || "").toLowerCase();
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);

    let matchesPrice = true;
    if (selectedPrice === 'under500') {
      matchesPrice = product.price < 500;
    } else if (selectedPrice === '500to999') {
      matchesPrice = product.price >= 500 && product.price <= 999;
    } else if (selectedPrice === 'over1000') {
      matchesPrice = product.price > 999;
    }

    return matchesBrand && matchesPrice;
  });

  if (detailView && detailView.style.display === "block") {
    detailView.style.display = "none";
    shopLayout.style.display = "flex";
  }

  renderProducts(filteredProducts);
}

brandCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", handleFilters);
});

priceRadios.forEach((radio) => {
  radio.addEventListener("change", handleFilters);
});

if (localStorage.getItem("token") && historyTrigger) {
    historyTrigger.style.display = "flex";
}

// Display the "Orders" button if a token is already present when the page loads
if (historyTrigger) {
    historyTrigger.addEventListener("click", async () => {
        historyModal.style.display = "flex";
        historyList.innerHTML = "<p style='text-align:center; font-size: 1.1rem;'>Loading your orders...</p>";

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3000/api/orders/history", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Fetch failed");
            const orders = await response.json();

            if (orders.length === 0) {
                historyList.innerHTML = "<p style='text-align:center;'>You haven't placed any orders yet.</p>";
                return;
            }

            historyList.innerHTML = orders.map(order => `
                <div style="border: 1px solid #c8c8c8; border-radius: 8px; margin-bottom: 25px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                        <strong style="font-size: 1.2rem;">Order #${order.order_id}</strong>
                        <span style="color: ${order.status === 'completed' ? '#059669' : '#d97706'}; font-weight: 900; text-transform: uppercase;">
                            ${order.status}
                        </span>
                        <span style="color: #666; font-weight: 500;">
                            ${new Date(order.create_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    
                    ${order.items.map(item => `
                        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
                            <img src="${item.image_url || 'https://via.placeholder.com/60'}" style="width: 70px; height: 70px; object-fit: contain; border: 1px solid #eee; border-radius: 4px; padding: 5px;">
                            <div style="flex: 1; font-weight: 500; font-size: 1.1rem;">${item.product_name} <span style="color: #666;">(x${item.quantity})</span></div>
                            <div style="font-weight: 900; color: #040c13; font-size: 1.1rem;">$${item.price}</div>
                        </div>
                    `).join('')}
                    
                    <div style="text-align: right; font-size: 1.3rem; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
                        Total Amount: <strong style="color: #0046be;">$${order.total_amount}</strong>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error(error);
            historyList.innerHTML = "<p style='color: red; text-align: center;'>Connection error while fetching orders.</p>";
        }
    });
}

if (closeHistoryModal) {
    closeHistoryModal.addEventListener("click", () => {
        historyModal.style.display = "none";
    });
}

fetchProducts();
renderCartUI();
