const API_URL = 'http://localhost:3000/api/products';
const ORDER_API = 'http:localhost:3000/api/orders';

const productList = document.getElementById('product-List');
const cartItemList = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const orderForm = document.getElementById('order-form');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        if (products.length === 0) {
            productList.innerHTML = '<p>No products available in the store yet.</p>';
            return;
        }

        productList.innerHTML = '';
        products.forEeach(product => {
            const card = document.createElement('div');
            card.classname = 'product-card';
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p class="price">$${product.price}</p>
                <p>In stock: ${product.stock}</p>
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})" style="margin-top: 10px; padding:8px; cursor:pointer;">Add to Cart</button>
                `;
            productList.appendChild(card);
        });
    } catch (error) {
        productList.innerHTML = '<p>Connection error. Please make sure the Node.js Server is running!</p>';
    }
}

// Logic: Add to Cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.product_id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product_id: id, name: name, price: price, quantity: 1});
    }
    updateCart();
}

// Logic Remove from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.product_id !== id);
    updateCart();
}

// Update Cart presentation & save on LocalStorage
function updateCart(){
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartUI();
}

function renderCartUI() {
    cartItemList.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEeach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.nam} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}
                <button class="btn-sm" onclick="removeFromCart(${item.product_id})">X</button>
            </span>
        `;
        cartItemList.appendChild(li);
    });
    cartCount.innerText = count;
    cartTotal.innerText = total.toFixed(2);
}

// Purchase flow: Send checkout information to the server
orderForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from reloading the page

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

    console.log("Data ready to be sent to the Server: ", orderData);
    alert("Order data ready! Open F12 (Console) to view the JSON package being sent to Backend!");

    cart = [];
    updateCart();
    orderForm.reset();
});

fetchProducts();
renderCartUI();
