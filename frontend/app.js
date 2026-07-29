const API_URL = 'http://localhost:3000/api/products';
const ORDER_API = 'http://localhost:3000/api/orders';

const productList = document.getElementById('product-list');
const cartItemList = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const orderForm = document.getElementById('order-form');

// VIEWS
const shopLayout = document.querySelector('.shop-layout');
const detailsView = document.getElementById('product-detail-view');
const backToShopBtn = document.getElementById('back-to-shop');

// Cart Drawer Elements
const cartDrawer = document.getElementById('cart-drawer');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];

// Button Back to Shop
if (backToShopBtn) {
    backToShopBtn.addEventListener('click', () => {
        detailsView.style.display = 'none';
        shopLayout.style.display = 'flex';
    });
}

// UI Interaction
if(openCartBtn) openCartBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
if(closeCartBtn) closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('open'));

async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        if (products.length === 0) {
            productList.innerHTML = '<p>No products available in the store yet.</p>';
            return;
        }

        productList.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="img-wrapper">
                    <img src="${product.image_url || 'https://via.placeholder.com/300'}" alt="${product.name}">
                    <div class="quick-add" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                        Quick Add to Cart
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price}</p>
                </div>
            `;
            productList.appendChild(card);
        });
    } catch (error) {
        productList.innerHTML = '<p>Connection error. Please check if your Backend server is running at :3000</p>';
    }
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.product_id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product_id: id, name: name, price: price, quantity: 1});
    }
    updateCart();
    
    // Visual feedback: open cart when adding
    cartDrawer.classList.add('open');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.product_id !== id);
    updateCart();
}

function updateCart(){
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartUI();
}

function renderCartUI() {
    cartItemList.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const li = document.createElement('li');
        li.className = 'cart-item';
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

orderForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const address = document.getElementById('shipping-address').value;

    const orderData = {
        shipping_address: address,
        total_amount: parseFloat(cartTotal.innerText),
        cartItems: cart
    };

    try {
        const response = await fetch(ORDER_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert("Order placed successfully!");
            cart = [];
            updateCart();
            orderForm.reset();
            cartDrawer.classList.remove('open');
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

fetchProducts();
renderCartUI();
