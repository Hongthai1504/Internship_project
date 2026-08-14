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

const loginTrigger = document.getElementById("login-trigger");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");
const goToRegisterBtn = document.getElementById("go-to-register");
const goToLoginBtn = document.getElementById("go-to-login");

const userDropdown = document.getElementById("user-dropdown");
const accountText = document.getElementById("account-text");
const accountWrapper = document.getElementById("account-wrapper");

// Logic Order History
const historyTrigger = document.getElementById("order-history-trigger");
const historyModal = document.getElementById("order-history-modal");
const closeHistoryModal = document.getElementById("close-history-modal");
const historyList = document.getElementById("order-history-list");

// Profile Modal
const btnProfile = document.getElementById("menu-profile");
const profileModal = document.getElementById("profile-modal");
const closeProfileModal = document.getElementById("close-profile-modal");
const profileForm = document.getElementById("profile-form");

if (loginTrigger) {
  loginTrigger.addEventListener("click", (e) => {
    e.stopPropagation(); 
    const token = localStorage.getItem("token");
    if (token) {
      if(userDropdown) userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    } else {
      window.location.href = "/frontend/login.html";
    }
  });
}

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
            alert("Login successful! Welcome to the Admin Dashboard.");
            window.location.href = "/frontend/admin.html";
        } else {
            alert("Login successful! Welcome back to BestTech.");
            window.location.href = "/frontend/index.html"; 
        }
      } else {
        alert(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection error. Please try again later.");
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
        alert("Account created successfully! You can now sign in.");
        registerForm.reset();
        goToLoginBtn.click(); 
      } else {
        alert(data.error || "Registration failed. Email might already exist.");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection error. Is your Backend running?");
    }
  });
}

document.addEventListener("click", (e) => {
  if (userDropdown && accountWrapper && !accountWrapper.contains(e.target)) {
     userDropdown.style.display = "none";
  }
});

document.addEventListener("click", (e) => {
  if (userDropdown && accountWrapper && !accountWrapper.contains(e.target)) {
     userDropdown.style.display = "none";
  }
});

const btnLogout = document.getElementById("menu-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("You have been logged out successfully.");
    window.location.reload(); 
  });
}

const btnMyOrders = document.getElementById("menu-orders");
if (btnMyOrders) {
  btnMyOrders.addEventListener("click", () => {
    userDropdown.style.display = "none"; 
    if(historyTrigger) historyTrigger.click();
  });
}

if (btnProfile) {
  btnProfile.addEventListener("click", async () => {
    userDropdown.style.display = "none";
    if (profileModal) {
        profileModal.style.display = "flex"; 
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:3000/api/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                document.getElementById("profile-email").value = data.email;
                document.getElementById("profile-name").value = data.full_name;
                document.getElementById("profile-phone").value = data.phone || "";
            } else {
                alert("Your login session has expired.");
                btnLogout.click();
            }
        } catch(err) {
            console.error("Error loading profile information:", err);
            document.getElementById("profile-name").value = "Server Error!";
        }
    }
  });
}

if (closeProfileModal) {
    closeProfileModal.addEventListener("click", () => {
        profileModal.style.display = "none";
    });
}

if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const full_name = document.getElementById("profile-name").value.trim();
        const phone = document.getElementById("profile-phone").value.trim();
        const submitBtn = profileForm.querySelector("button[type='submit']");
        submitBtn.innerText = "Saving...";
        submitBtn.disabled = true;

        try {
            const res = await fetch("http://localhost:3000/api/profile", {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ full_name, phone })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                profileModal.style.display = "none";
            } else {
                alert("Lỗi: " + data.error);
            }
        } catch(err) {
            alert("System error while saving information.");
        } finally {
            submitBtn.innerText = "Save Changes";
            submitBtn.disabled = false;
        }
    });
}

if (closeModal) {
  closeModal.addEventListener("click", () => {
    authModal.style.display = "none";
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault(); 
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
        if (loginTrigger) loginTrigger.querySelector("span").innerText = "My Account";
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

if (localStorage.getItem("token")) {
  if (accountText) accountText.innerText = "My Account";
  if (loginTrigger) loginTrigger.querySelector("span").innerText = "My Account";
  if (historyTrigger) historyTrigger.style.display = "flex";
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let allProducts = [];

if (backToShopBtn) {
  backToShopBtn.addEventListener("click", () => {
    if (detailView) detailView.style.display = "none";
    if (shopLayout) shopLayout.style.display = "flex";
  });
}

if (openCartBtn) openCartBtn.addEventListener("click", () => { if(cartDrawer) cartDrawer.classList.add("open"); });
if (closeCartBtn) closeCartBtn.addEventListener("click", () => { if(cartDrawer) cartDrawer.classList.remove("open"); });

function renderProducts(productsToDisplay) {
  const productListEl = document.getElementById("product-list");
  if (!productListEl) return;
  productListEl.innerHTML = "";

  if (productsToDisplay.length === 0) {
    productListEl.innerHTML = "<p style='grid-column: 1/-1; text-align: center; font-size: 1.2rem;'>We couldn't find any matches. Try checking your spelling or using less specific terms.</p>";
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
    productListEl.appendChild(card);
  });
}

// ----------------------------------------------------
// DYNAMIC FILTERS, SORTING & RENDERING LOGIC
// ----------------------------------------------------
let currentPageProducts = [];

async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const products = await response.json();
    allProducts = products; 

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    if (searchQuery) {
        const titleEl = document.getElementById("page-title");
        if (titleEl) titleEl.innerText = `Search results for: "${searchQuery}"`;
        document.title = `Search: ${searchQuery} | Best Tech`;

        currentPageProducts = allProducts.filter(product => {
            const name = product.name.toLowerCase();
            const brand = (product.brand || "").toLowerCase();
            const keyword = searchQuery.toLowerCase();
            return name.includes(keyword) || brand.includes(keyword);
        });
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
      listEl.innerHTML = "Connection error. Please check if your Backend server is running at :3000";
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

function addToCart(id, name, price) {
  const existingItem = cart.find((item) => item.product_id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ product_id: id, name: name, price: price, quantity: 1 });
  }
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

if (orderForm) {
  orderForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Security Alert: Please sign in to complete your purchase.");
      if(authModal) authModal.style.display = "flex";
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
        if(cartDrawer) cartDrawer.classList.remove("open");
      } else {
        if (response.status === 401 || response.status === 403) {
          alert("Your session has expired. Please log in again.");
          localStorage.removeItem("token");
          if(loginTrigger) loginTrigger.querySelector("span").innerText = "Account";
          if(authModal) authModal.style.display = "flex";
        } else {
          alert("Failed to place order: " + data.error);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
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
      } 
      else if (product.image_url) {
          images = [product.image_url];
      } 
      else {
          images = ["https://via.placeholder.com/500"];
      }

      thumbContainer.innerHTML = images.map((img, index) => `
          <img src="${img}" class="thumbnail-img ${index === 0 ? 'active' : ''}" onclick="changeMainImage(this, '${img}')">
      `).join('');

      if (images.length <= 1) {
          thumbContainer.style.display = "none";
      } else {
          thumbContainer.style.display = "flex";
      }
  }

  if(document.getElementById("detail-name")) document.getElementById("detail-name").innerText = product.brand ? `${product.brand} ${product.name}` : product.name;
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
      if (existingItem) {
        existingItem.quantity += quantityToAdd;
      } else {
        cart.push({ product_id: product_id, name: product.name, price: product.price, quantity: quantityToAdd });
      }
      
      updateCart();
      
      const drawer = document.getElementById("cart-drawer");
      if (drawer) drawer.classList.add("open");
      if (qtyInput) qtyInput.value = 1;
    };
  }

  if (shopLayout && detailView) {
      shopLayout.style.display = "none";
      detailView.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// HELPER: CHANGE MAIN IMAGE WHEN CLICKING THUMBNAIL
function changeMainImage(element, newSrc) {
    const imgElement = document.getElementById("detail-img");
    if (imgElement) {
        // Quick fade effect for better UX
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

if (historyTrigger) {
    historyTrigger.addEventListener("click", async () => {
        if(historyModal) historyModal.style.display = "flex";
        if(historyList) historyList.innerHTML = "<p style='text-align:center; font-size: 1.1rem;'>Loading your orders...</p>";

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3000/api/orders/history", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Fetch failed");
            const orders = await response.json();

            if (orders.length === 0) {
                if(historyList) historyList.innerHTML = "<p style='text-align:center;'>You haven't placed any orders yet.</p>";
                return;
            }

            if(historyList) {
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
            }
        } catch (error) {
            console.error(error);
            if(historyList) historyList.innerHTML = "<p style='color: red; text-align: center;'>Connection error while fetching orders.</p>";
        }
    });
}

if (closeHistoryModal) {
    closeHistoryModal.addEventListener("click", () => {
        if(historyModal) historyModal.style.display = "none";
    });
}

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

    if (targetBox.style.display === 'flex') {
      closeAllMenus();
      return;
    }
    closeAllMenus();
    targetBox.style.display = 'flex';
    btn.classList.add('active');
    if (menuOverlay) menuOverlay.style.display = 'block';
  });
});

closeDropdownBtns.forEach(btn => btn.addEventListener('click', closeAllMenus));
if (menuOverlay) menuOverlay.addEventListener('click', closeAllMenus);

// Đồng hồ đếm ngược Flash Sale
const timerDisplay = document.getElementById("flash-timer");
if (timerDisplay) {
    let timeLeft = (12 * 3600) + (45 * 60) + 30; 
    const countdownInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            timerDisplay.innerText = "EXPIRED";
            return;
        }
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        const formatTime = String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
        timerDisplay.innerText = formatTime;
        timeLeft--;
    }, 1000); 
}

const searchSuggestions = document.getElementById("search-suggestions");

if (searchInput && searchSuggestions) {
    searchInput.addEventListener("input", function() {
        const searchTerm = this.value.trim().toLowerCase();
        
        if (searchTerm.length < 2) {
            searchSuggestions.style.display = "none";
            return;
        }

        const filtered = allProducts.filter(product => {
            const name = product.name.toLowerCase();
            const brand = (product.brand || "").toLowerCase();
            return name.includes(searchTerm) || brand.includes(searchTerm);
        }).slice(0, 5); 

        if (filtered.length === 0) {
            searchSuggestions.innerHTML = `<div style="padding: 15px 20px; color: #666; font-style: italic;">No products found for "${searchTerm}"</div>`;
            searchSuggestions.style.display = "block";
            return;
        }

        searchSuggestions.innerHTML = filtered.map(p => {
            const safeName = p.name.replace(/'/g, "\\'"); // Prevent errors with names containing single quotes
            return `
            <div class="suggestion-item" onclick="goToSearch('${safeName}')">
                <img src="${p.image_url || 'https://via.placeholder.com/50'}" class="suggestion-img">
                <div class="suggestion-info">
                    <div class="suggestion-name">${p.brand ? p.brand + ' ' : ''}${p.name}</div>
                    <div class="suggestion-price">$${p.price}</div>
                </div>
            </div>
            `;
        }).join("");
        
        searchSuggestions.style.display = "block";
    });

    document.addEventListener("click", function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = "none";
        }
    });
}

function goToSearch(keyword) {
    searchInput.value = keyword;
    handleSearch();
}

fetchProducts();
renderCartUI();
