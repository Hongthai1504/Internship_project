const { parse } = require("node:path");

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
        productList.innerHTML = "<p style='grid-column: 1/-1; text-align: center; font-size: 1.2rem;'>We couldn't find any matches. Try checking your spelling or using less specific terms.</p>";
        return;
    }

    productsToDisplay.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";
        
        card.innerHTML = `
            <div class="img-wrapper">
                <img src="${product.image_url || 'https://via.placeholder.com/300'}" 
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

  const filteredProducts = allProducts.filter(product => {
    const productName = product.name.toLowerCase();
    const productBrand = (product.brand || '').toLowerCase();

    return productName.includes(searchTerm) || productBrand.includes(searchTerm);
  });

  if (detailsView.style.display === "block") {
    detailView.style.display = "none";
    shopLayout.style.display = "flex";
  }

  renderProducts(filteredProducts);
}

if (searchBtn) {
  searchBtn.addEventListener("click", handleSearch);
}

if (searchInput) {
  searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  });
}

orderForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      alert("Order placed successfully!");
      cart = [];
      updateCart();
      orderForm.reset();
      cartDrawer.classList.remove("open");
    } else {
      alert("Failed to place order. Check backend.");
    }
  } catch (err) {
    console.error(err);
    alert("Success! (Simulated - Check console for JSON)");
    console.log("Payload:", orderData);
    // Clean up anyway for demo purposes
    cart = [];
    updateCart();
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

fetchProducts();
renderCartUI();
