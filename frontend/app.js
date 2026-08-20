// ==========================================
// BEST TECH - MAIN APP.JS
// ==========================================
console.log("App.js is loading...");

const API_URL = "http://localhost:3000/api/products";
const ORDER_API = "http://localhost:3000/api/orders";

let currentDetailProductId = null; 

// Global Variables
let allProducts = [];
let currentPageProducts = [];
let cart = [];

// SMART SEARCH ALGORITHM
function isProductMatch(product, searchKeyword) {
    const term = searchKeyword.toLowerCase().trim();
    
    const name = (product.name || "").toLowerCase();
    const brand = (product.brand || "").toLowerCase();
    
    const reviews = (product.all_reviews || "").toLowerCase();
    
    let specsText = "";
    let specsObj = product.specifications;
    if (typeof specsObj === 'string') {
        try { specsObj = JSON.parse(specsObj); } catch(e) { specsObj = null; }
    }
    if (specsObj && Array.isArray(specsObj)) {
        specsText = specsObj.map(s => `${s.name} ${s.value}`).join(" ").toLowerCase();
    }

    return name.includes(term) || 
           brand.includes(term) || 
           reviews.includes(term) || 
           specsText.includes(term);
}

try {
    const savedCart = localStorage.getItem("cart");
    if (savedCart && savedCart !== "undefined") {
        cart = JSON.parse(savedCart);
    }
} catch (e) {
    console.error("Cart data corrupted, resetting.");
    localStorage.removeItem("cart");
}

// DOM Elements
const productList = document.getElementById("product-list");
const cartItemList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const orderForm = document.getElementById("order-form");

const shopLayout = document.querySelector(".shop-layout");
const detailView = document.getElementById("product-detail-view");
const backToShopBtn = document.getElementById("back-to-shop");

const cartDrawer = document.getElementById("cart-drawer");
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");

const searchInput = document.getElementById("search-input");
const searchBtn = document.querySelector(".search-btn");
const searchSuggestions = document.getElementById("search-suggestions");

// Auth & Account
const loginTrigger = document.getElementById("login-trigger");
const userDropdown = document.getElementById("user-dropdown");
const accountText = document.getElementById("account-text");
const accountWrapper = document.getElementById("account-wrapper");
const btnLogout = document.getElementById("menu-logout");
const btnMyOrders = document.getElementById("menu-orders");
const btnProfile = document.getElementById("menu-profile");

// Dedicated Login Page Elements
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");
const goToRegisterBtn = document.getElementById("go-to-register");
const goToLoginBtn = document.getElementById("go-to-login");

// Modals
const historyTrigger = document.getElementById("order-history-trigger");
const historyModal = document.getElementById("order-history-modal");
const closeHistoryModal = document.getElementById("close-history-modal");
const historyList = document.getElementById("order-history-list");

const profileModal = document.getElementById("profile-modal");
const closeProfileModal = document.getElementById("close-profile-modal");
const profileForm = document.getElementById("profile-form");

// --- ACCOUNT DROPDOWN LOGIC ---
if (loginTrigger) {
  loginTrigger.addEventListener("click", (e) => {
    e.stopPropagation(); 
    const token = localStorage.getItem("token");
    if (token) {
      if (userDropdown) userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    } else {
      window.location.href = "login.html"; 
    }
  });
}

document.addEventListener("click", (e) => {
  if (userDropdown && accountWrapper && !accountWrapper.contains(e.target)) {
     userDropdown.style.display = "none";
  }
});

// --- DEDICATED LOGIN PAGE LOGIC ---
if (goToRegisterBtn && goToLoginBtn) {
    goToRegisterBtn.addEventListener("click", () => {
        loginView.style.display = "none";
        registerView.style.display = "block";
    });

    goToLoginBtn.addEventListener("click", () => {
        registerView.style.display = "none";
        loginView.style.display = "block";
    });
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault(); 
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Authenticating...";
    submitBtn.disabled = true;

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
        if (data.role === 'admin') {
            alert("Login successful! Welcome to Admin Dashboard.");
            window.location.href = "admin.html";
        } else {
            alert("Login successful! Welcome back.");
            window.location.href = "index.html"; 
        }
      } else {
        alert(data.error || "Login failed.");
      }
    } catch (error) {
      alert("Server connection error.");
    } finally {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  });
}

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
        alert("Account created! Please sign in.");
        registerForm.reset();
        goToLoginBtn.click(); 
      } else {
        alert(data.error || "Registration failed.");
      }
    } catch (error) {
      alert("Server connection error.");
    }
  });
}

// --- AUTH STATE CHECKS ---
if (localStorage.getItem("token")) {
  if (accountText) accountText.innerText = "My Account";
  if (loginTrigger && loginTrigger.querySelector("span")) {
      loginTrigger.querySelector("span").innerText = "My Account";
  }
  if (historyTrigger) historyTrigger.style.display = "flex";
}

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Logged out successfully.");
    window.location.reload(); 
  });
}

// --- MENU DROPDOWNS ---
const menuBtns = document.querySelectorAll('.menu-pill-btn');
const dropdownBoxes = document.querySelectorAll('.dropdown-menu-box');
const menuOverlay = document.getElementById('menu-overlay');
const closeDropdownBtns = document.querySelectorAll('.close-dropdown');

function closeAllMenus() {
  dropdownBoxes.forEach(box => box.style.display = 'none');
  menuBtns.forEach(btn => btn.classList.remove('active'));
  if (menuOverlay) menuOverlay.style.display = 'none';
}

menuBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const targetId = btn.getAttribute('data-target');
    const targetBox = document.getElementById(targetId);
    if (!targetBox) return;

    if (targetBox.style.display === 'flex') {
      closeAllMenus();
      return;
    }
    closeAllMenus();

    const btnRect = btn.getBoundingClientRect(); 
    targetBox.style.top = (btnRect.bottom + window.scrollY + 10) + "px";
    targetBox.style.left = btnRect.left + "px";

    targetBox.style.display = 'flex';
    btn.classList.add('active');
    if (menuOverlay) menuOverlay.style.display = 'block';
  });
});

closeDropdownBtns.forEach(btn => btn.addEventListener('click', closeAllMenus));
if (menuOverlay) menuOverlay.addEventListener('click', closeAllMenus);

window.addEventListener('resize', closeAllMenus);

// --- PRODUCTS & FILTERS ---
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    if (!response.ok || data.error) throw new Error(data.error || "API Error");

    allProducts = Array.isArray(data) ? data : []; 

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    if (searchQuery) {
        const titleEl = document.getElementById("page-title");
        if (titleEl) titleEl.innerText = `Search results for: "${searchQuery}"`;
        document.title = `Search: ${searchQuery} | Best Tech`;

        currentPageProducts = allProducts.filter(product => isProductMatch(product, searchQuery));
    } else if (typeof PAGE_KEYWORD !== 'undefined') {
        const titleEl = document.getElementById("page-title");
        if (titleEl) titleEl.innerText = PAGE_TITLE;
        document.title = PAGE_TITLE + " | Best Tech";

        currentPageProducts = allProducts.filter(product => {
            const name = product.name.toLowerCase();
            const brand = (product.brand || "").toLowerCase();
            const keyword = PAGE_KEYWORD.toLowerCase();
            return name.includes(keyword) || brand.includes(keyword);
        });
    } else {
        currentPageProducts = [...allProducts]; 
    }

    renderDynamicBrands(currentPageProducts);
    handleFilters(); 

  } catch (error) {
    const listEl = document.getElementById("product-list");
    if (listEl) {
      listEl.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: red;'>Connection error. Please check your Backend server.</p>";
    }
  }
}

function renderDynamicBrands(products) {
    const brandFiltersEl = document.getElementById("brand-filters");
    if (!brandFiltersEl) return;

    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(b => b && b.trim() !== ""))].sort();

    if (uniqueBrands.length === 0) {
        brandFiltersEl.innerHTML = "<li style='color: #666; font-size: 0.9rem;'>No brands available</li>";
        return;
    }

    brandFiltersEl.innerHTML = uniqueBrands.map(brand => `
        <li>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" value="${brand}" class="dynamic-brand-checkbox"> 
                ${brand}
            </label>
        </li>
    `).join('');

    const newCheckboxes = document.querySelectorAll('.dynamic-brand-checkbox');
    newCheckboxes.forEach(cb => cb.addEventListener('change', handleFilters));
}

function handleFilters() {
  const activeBrandCheckboxes = document.querySelectorAll('.dynamic-brand-checkbox:checked');
  const selectedBrands = Array.from(activeBrandCheckboxes).map(cb => cb.value.toLowerCase());
  const selectedPrice = document.querySelector('input[name="price"]:checked')?.value || 'all';
  const sortOption = document.getElementById("sort-options")?.value || "default";

  let filteredProducts = currentPageProducts.filter((product) => {
    const productBrand = (product.brand || "").toLowerCase();
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);

    let matchesPrice = true;
    if (selectedPrice === 'under500') matchesPrice = product.price < 500;
    else if (selectedPrice === '500to999') matchesPrice = product.price >= 500 && product.price <= 999;
    else if (selectedPrice === 'over1000') matchesPrice = product.price > 999;

    return matchesBrand && matchesPrice;
  });

  if (sortOption === "price-asc") {
      filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortOption === "price-desc") {
      filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }

  if (detailView && detailView.style.display === "block") {
    detailView.style.display = "none";
    if (shopLayout) shopLayout.style.display = "flex";
  }

  renderProducts(filteredProducts);
}

const staticPriceRadios = document.querySelectorAll('input[name="price"]');
staticPriceRadios.forEach((radio) => radio.addEventListener("change", handleFilters));

const sortDropdown = document.getElementById("sort-options");
if (sortDropdown) sortDropdown.addEventListener("change", handleFilters);

function renderProducts(productsToDisplay) {
  const productListEl = document.getElementById("product-list");
  if (!productListEl) return;
  productListEl.innerHTML = "";

  if (productsToDisplay.length === 0) {
    productListEl.innerHTML = "<p style='grid-column: 1/-1; text-align: center; font-size: 1.2rem;'>We couldn't find any matches.</p>";
    return;
  }

  productsToDisplay.forEach((product) => {
    const safeName = product.name.replace(/'/g, "\\'");
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
            <div class="img-wrapper">
                <img src="${product.image_url || "https://via.placeholder.com/300"}" 
                     alt="${product.name}" 
                     onclick="showProductDetail(${product.id})" 
                     style="cursor: pointer;">
                <div class="quick-add" onclick="addToCart(${product.id}, '${safeName}', ${product.price})">
                    Add to Cart
                </div>
            </div>
            <div class="product-info" onclick="showProductDetail(${product.id})" style="cursor: pointer;">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price}</p>
            </div>
        `;
    productListEl.appendChild(card);
  });
}

function showProductDetail(product_id) {
  const product = allProducts.find((p) => p.id === product_id);
  if (!product) return;
  
  const imgElement = document.getElementById("detail-img");
  if (imgElement) {
      imgElement.src = product.image_url || "https://via.placeholder.com/500";
      imgElement.style.opacity = 1; 
  }

  const thumbContainer = document.getElementById("detail-thumbnails");
  if (thumbContainer) {
      let images = [];
      if (product.all_images && product.all_images.length > 0) {
          images = product.all_images;
      } else if (product.image_url) {
          images = [product.image_url];
      } else {
          images = ["https://via.placeholder.com/500"];
      }

      thumbContainer.innerHTML = images.map((img, index) => `
          <img src="${img}" class="thumbnail-img ${index === 0 ? 'active' : ''}" onclick="changeMainImage(this, '${img}')">
      `).join('');

      thumbContainer.style.display = images.length <= 1 ? "none" : "flex";
  }

  if(document.getElementById("detail-name")) document.getElementById("detail-name").innerText = product.name;
  if(document.getElementById("detail-price")) document.getElementById("detail-price").innerText = `$${product.price}`;
  if(document.getElementById("detail-sku")) document.getElementById("detail-sku").innerText = product.sku || "N/A";
  if(document.getElementById("detail-desc")) document.getElementById("detail-desc").innerText = product.description || "No description available for this product.";

  const stockElement = document.getElementById("detail-stock");
  if(stockElement) {
      if (product.stock > 0) {
        stockElement.innerText = `In Stock (${product.stock} units)`;
        stockElement.style.color = "#059669";
      } else {
        stockElement.innerText = "Out of Stock";
        stockElement.style.color = "#ef4444";
      }
  }

  const detailAddBtn = document.getElementById("detail-add-btn");
  const qtyInput = document.getElementById("qty-input");
  
  if (detailAddBtn) {
    detailAddBtn.onclick = () => {
      const quantityToAdd = parseInt(qtyInput ? qtyInput.value : 1) || 1;
      const existingItem = cart.find((item) => item.product_id === product_id);
      if (existingItem) existingItem.quantity += quantityToAdd;
      else cart.push({ product_id: product_id, name: product.name, price: product.price, quantity: quantityToAdd });
      
      updateCart();
      if (cartDrawer) cartDrawer.classList.add("open");
      if (qtyInput) qtyInput.value = 1;
    };
  }

  if (shopLayout && detailView) {
      shopLayout.style.display = "none";
      detailView.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const specsContainer = document.getElementById("detail-specs-container");
  const specsContent = document.getElementById("detail-specs-content");
  
  if (specsContainer && specsContent) {
      let specs = product.specifications;
      
      if (typeof specs === 'string') {
          try { specs = JSON.parse(specs); } catch(e) { specs = null; }
      }

      if (specs && Array.isArray(specs) && specs.length > 0) {
          const groupedSpecs = {};
          specs.forEach(spec => {
              const groupName = spec.group || "General";
              if (!groupedSpecs[groupName]) groupedSpecs[groupName] = [];
              groupedSpecs[groupName].push(spec);
          });

          let html = "";
          for (const group in groupedSpecs) {
              html += `<div class="specs-group-title">${group}</div>`;
              html += `<table class="specs-table">`;
              groupedSpecs[group].forEach(s => {
                  html += `<tr><td class="spec-name">${s.name}</td><td class="spec-value">${s.value}</td></tr>`;
              });
              html += `</table>`;
          }
          specsContent.innerHTML = html;
          specsContainer.style.display = "block";
      } else {
          specsContainer.style.display = "none";
          specsContent.innerHTML = "";
      }
  }

  currentDetailProductId = product_id;
  fetchProductReviews(product_id);
}

function changeMainImage(element, newSrc) {
    const imgElement = document.getElementById("detail-img");
    if (imgElement) {
        imgElement.style.opacity = 0.5;
        setTimeout(() => {
            imgElement.src = newSrc;
            imgElement.style.opacity = 1;
        }, 150);
    }
    const allThumbs = document.querySelectorAll(".thumbnail-img");
    allThumbs.forEach(th => th.classList.remove("active"));
    element.classList.add("active");
}

// --- CART & ORDER LOGIC ---
if (openCartBtn) openCartBtn.addEventListener("click", () => { if(cartDrawer) cartDrawer.classList.add("open"); });
if (closeCartBtn) closeCartBtn.addEventListener("click", () => { if(cartDrawer) cartDrawer.classList.remove("open"); });

function addToCart(id, name, price) {
  const existingItem = cart.find((item) => item.product_id === id);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ product_id: id, name: name, price: price, quantity: 1 });
  updateCart();
  if (cartDrawer) cartDrawer.classList.add("open");
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
  if (!cartItemList || !cartCount || !cartTotal) return;
  cartItemList.innerHTML = "";
  let total = 0; let count = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity; count += item.quantity;
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

if (orderForm) {
  orderForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to complete your purchase.");
      window.location.href = "login.html";
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
        cart = []; updateCart(); orderForm.reset();
        if(cartDrawer) cartDrawer.classList.remove("open");
      } else {
        alert("Failed to place order: " + data.error);
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    }
  });
}

// --- HISTORY & PROFILE ---
let userOrderHistoryCache = []; 

if (historyTrigger) {
    historyTrigger.addEventListener("click", async () => {
        if(historyModal) historyModal.style.display = "flex";
        if(historyList) historyList.innerHTML = "<p style='text-align:center;'>Loading your orders...</p>";

        const token = localStorage.getItem("token");
        try {
            // 1. Fetch User Profile for Sidebar
            const profileRes = await fetch("http://localhost:3000/api/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const profile = await profileRes.json();
                const nameEl = document.getElementById("order-user-name");
                const avatarEl = document.getElementById("order-user-avatar");
                if (nameEl) nameEl.innerText = profile.full_name;
                if (avatarEl) avatarEl.innerText = profile.full_name.charAt(0).toUpperCase();
            }

            // 2. Fetch Orders
            const response = await fetch("http://localhost:3000/api/orders/history", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            userOrderHistoryCache = await response.json();

            // Render default Tab (All)
            renderOrdersByStatus('all');

        } catch (error) {
            if(historyList) historyList.innerHTML = "<p style='color: red; text-align: center;'>Connection error.</p>";
        }
    });
}

if (closeHistoryModal) {
    closeHistoryModal.addEventListener("click", () => { 
        if(historyModal) historyModal.style.display = "none"; 
    });
}

// Tab Click Logic
const orderTabs = document.querySelectorAll('.order-tab');
orderTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        orderTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const status = e.target.getAttribute('data-status');
        renderOrdersByStatus(status);
    });
});

function renderOrdersByStatus(statusFilter) {
    if(!historyList) return;
    let filteredOrders = userOrderHistoryCache;

    // Filter logic
    if (statusFilter !== 'all') {
        filteredOrders = userOrderHistoryCache.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Empty State
    if (filteredOrders.length === 0) {
        historyList.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <svg width="60" height="60" fill="#c8c8c8" viewBox="0 0 24 24" style="margin-bottom: 15px;"><path d="M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM19 5v4H5V5h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 8.5c-.82 0-1.5-.67-1.5-1.5S6.18 5.5 7 5.5s1.5.68 1.5 1.5S7.83 8.5 7 8.5z"/></svg>
            <p style="color: #666; font-size: 1.1rem;">No orders found in this category.</p>
        </div>`;
        return;
    }

    // Status Color Helper
    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'completed': return '#10b981'; // Green
            case 'pending': return '#f59e0b'; // Yellow
            case 'shipping': return '#3b82f6'; // Blue
            case 'cancelled': return '#ef4444'; // Red
            default: return '#6b7280'; // Gray
        }
    };

    // Render Orders
    historyList.innerHTML = filteredOrders.map(order => `
        <div style="background: #fff; border: 1px solid #e0e6ef; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); overflow: hidden;">
            
            <!-- Order Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fafafa; border-bottom: 1px solid #e0e6ef; padding: 15px 20px;">
                <div>
                    <strong style="font-size: 1.1rem; color: #040c13;">Order #${order.order_id}</strong>
                    <span style="color: #666; margin-left: 10px; font-size: 0.9rem;">
                        ${new Date(order.create_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <span style="color: ${getStatusColor(order.status)}; font-weight: bold; text-transform: uppercase; display: flex; align-items: center; gap: 6px; font-size: 0.95rem;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${getStatusColor(order.status)};"></span>
                    ${order.status}
                </span>
            </div>

            <!-- Order Items -->
            <div style="padding: 20px;">
                ${order.items.map(item => `
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #eee;">
                        <img src="${item.image_url || 'https://via.placeholder.com/60'}" style="width: 70px; height: 70px; object-fit: contain; border: 1px solid #eee; border-radius: 8px; padding: 5px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; font-size: 1.1rem; color: #040c13; margin-bottom: 5px;">${item.product_name}</div>
                            <div style="color: #666;">Quantity: <strong>${item.quantity}</strong></div>
                        </div>
                        <div style="font-weight: 900; color: #0046be; font-size: 1.1rem;">$${item.price}</div>
                    </div>
                `).join('')}
                
                <!-- Order Footer -->
                <div style="text-align: right; margin-top: 15px;">
                    <span style="color: #666; font-size: 1.1rem; margin-right: 15px;">Total Amount:</span>
                    <strong style="color: #ef4444; font-size: 1.6rem;">$${order.total_amount}</strong>
                </div>
            </div>
        </div>
    `).join('');
}

if (btnProfile) {
  btnProfile.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}

// --- LIVE SEARCH ---
if (searchInput && searchSuggestions) {
    searchInput.addEventListener("input", function() {
        const searchTerm = this.value.trim().toLowerCase();
        if (searchTerm.length < 2) { searchSuggestions.style.display = "none"; return; }

        const filtered = allProducts.filter(product => isProductMatch(product, searchTerm)).slice(0, 5); 

        if (filtered.length === 0) {
            searchSuggestions.innerHTML = `<div style="padding: 15px 20px; color: #666; font-style: italic;">No products found for "${searchTerm}"</div>`;
        } else {
            searchSuggestions.innerHTML = filtered.map(p => {
                const safeName = p.name.replace(/'/g, "\\'"); 
                return `
                <div class="suggestion-item" onclick="goToSearch('${safeName}')">
                    <img src="${p.image_url || 'https://via.placeholder.com/50'}" class="suggestion-img">
                    <div class="suggestion-info">
                        <div class="suggestion-name">${p.name}</div>
                        <div class="suggestion-price">$${p.price}</div>
                    </div>
                </div>`;
            }).join("");
        }
        searchSuggestions.style.display = "block";
    });

    document.addEventListener("click", function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = "none";
        }
    });
}

function handleSearch() {
  if(!searchInput) return;
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) return;
  const currentUrl = window.location.href;
  const frontendIndex = currentUrl.indexOf('/frontend/');
  if (frontendIndex !== -1) {
      const basePath = currentUrl.substring(0, frontendIndex + 10); 
      window.location.href = `${basePath}search.html?q=${encodeURIComponent(searchTerm)}`;
  } else {
      window.location.href = `/search.html?q=${encodeURIComponent(searchTerm)}`;
  }
}
if (searchBtn) searchBtn.addEventListener("click", handleSearch);
if (searchInput) {
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") handleSearch();
  });
}

function goToSearch(keyword) {
    searchInput.value = keyword;
    handleSearch();
}

// PRODUCT REVIEWS LOGIC
const reviewForm = document.getElementById("product-review-form");
const reviewPrompt = document.getElementById("review-login-prompt");

if (localStorage.getItem("token")) {
    if(reviewPrompt) reviewPrompt.style.display = "none";
    if(reviewForm) reviewForm.style.display = "block";
}

async function fetchProductReviews(productId) {
    const listEl = document.getElementById("reviews-list");
    if (!listEl) return;
    
    listEl.innerHTML = '<p style="color: #666; font-style: italic;">Loading reviews...</p>';
    
    try {
        const res = await fetch(`http://localhost:3000/api/products/${productId}/reviews`);
        const reviews = await res.json();
        
        if (reviews.length === 0) {
            listEl.innerHTML = '<p style="color: #666; font-style: italic;">No reviews yet. Be the first to review this product!</p>';
            return;
        }
        
        listEl.innerHTML = reviews.map(r => {
            // Render sao dựa trên điểm số
            const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            const date = new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            return `
            <div style="border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <div style="width: 35px; height: 35px; background: #e0e6ef; color: #0046be; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem;">
                        ${r.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: bold; color: #040c13;">${r.full_name}</div>
                        <div style="color: #888; font-size: 0.85rem;">Posted on ${date}</div>
                    </div>
                </div>
                <div style="color: #eab308; font-size: 1.2rem; margin-bottom: 10px; letter-spacing: 2px;">${stars}</div>
                <p style="color: #333; line-height: 1.5; margin: 0;">${r.comment || ''}</p>
            </div>`;
        }).join('');
        
    } catch (err) {
        listEl.innerHTML = '<p style="color: red;">Failed to load reviews.</p>';
    }
}

if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentDetailProductId) return;
        
        const rating = document.getElementById("review-rating").value;
        const comment = document.getElementById("review-comment").value.trim();
        const token = localStorage.getItem("token");
        
        const submitBtn = e.target.querySelector('button');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Submitting...";
        submitBtn.disabled = true;

        try {
            const res = await fetch(`http://localhost:3000/api/products/${currentDetailProductId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });
            
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                e.target.reset();
                fetchProductReviews(currentDetailProductId);
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("System error while submitting review.");
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

if (backToShopBtn) {
  backToShopBtn.addEventListener("click", () => {
    if (detailView) {
        detailView.style.display = "none";
    }
    if (shopLayout) {
        shopLayout.style.display = "flex";
    } 
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Initialize Application
fetchProducts();
renderCartUI();
console.log("App.js loaded successfully.");