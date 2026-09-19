// ==========================================
// BEST TECH - CATEGORY.JS (SYNCED UI & FIXED COMPARE)
// ==========================================
console.log("Category.js is loading correctly...");

// Hàm khởi tạo bắt tham số từ URL
function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const brandQuery = urlParams.get('brand');
    const catQuery = urlParams.get('cat');
    
    const pageTitle = document.getElementById("page-title");
    if (!pageTitle) return;

    if (brandQuery) {
        if (brandQuery.toLowerCase() === 'all') {
            pageTitle.innerText = "All Brands";
            document.title = "All Brands | Best Tech";
        } else {
            pageTitle.innerText = `Shop by Brand: ${brandQuery}`;
            document.title = `${brandQuery} Products | Best Tech`;
        }
        fetchAndFilterProducts(brandQuery, null);
        
    } else if (catQuery) {
        const formattedCat = catQuery.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        pageTitle.innerText = formattedCat;
        document.title = `${formattedCat} | Best Tech`;
        
        fetchAndFilterProducts(null, catQuery);
        
    } else {
        pageTitle.innerText = "All Products";
        fetchAndFilterProducts(null, null);
    }
}

// HÀM FETCH VÀ RENDER SẢN PHẨM
async function fetchAndFilterProducts(brandFilter, catFilter) {
    const productGrid = document.getElementById("category-product-container");
    if (!productGrid) return;
    
    try {
        const currentLang = localStorage.getItem("besttech_lang") || "en";
        
        const res = await fetch(`http://localhost:3000/api/products?limit=100&lang=${currentLang}`);
        const result = await res.json();
        
        let products = result.data || [];

        // Lọc theo Brand
        if (brandFilter && brandFilter.toLowerCase() !== 'all') {
            products = products.filter(p => p.brand && p.brand.toLowerCase() === brandFilter.toLowerCase());
        }

        // Lọc theo Category
        if (catFilter) {
            const searchKeyword = catFilter.replace(/-/g, ' ').toLowerCase();
            const cleanKeyword = searchKeyword.replace(/explore/g, '').trim();

            products = products.filter(p =>
                (p.name && p.name.toLowerCase().includes(cleanKeyword)) ||
                (p.brand && p.brand.toLowerCase().includes(cleanKeyword)) ||
                (p.description && p.description.toLowerCase().includes(cleanKeyword))
            );
        }

        // ĐỒNG BỘ GIAO DIỆN PRODUCT CARD (GIỐNG HỆT INDEX.HTML) & TRUYỀN ĐỦ PARAM CHO COMPARE
        if (products.length > 0) {
            productGrid.innerHTML = products.map(product => {
                const safeName = product.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                
                // Kiểm tra xem sản phẩm đã có trong list so sánh chưa để tick checkbox sẵn
                let isChecked = false;
                try {
                    const compareList = JSON.parse(localStorage.getItem('compareList')) || [];
                    isChecked = compareList.some(item => item.id === product.id) ? 'checked' : '';
                } catch(e) {}
                
                return `
                <div class="product-card" style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; position: relative; transition: all 0.3s ease; display: flex; flex-direction: column; justify-content: space-between;">
                    
                    <!-- Nút Wishlist -->
                    <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id}, '${safeName}', ${product.price}, '${product.image_url}')" style="position: absolute; top: 15px; right: 15px; background: #fff; border: 1px solid #e5e7eb; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; z-index: 2; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                        <svg width="18" height="18" fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>

                    <!-- Click Mở chi tiết -->
                    <div style="cursor: pointer;" onclick="openProductDetail(${product.id})">
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: center; align-items: center;">
                            <img src="${product.image_url}" alt="${safeName}" style="max-width: 100%; height: 150px; object-fit: contain;">
                        </div>
                        <h3 class="product-title" style="font-size: 1rem; color: #0f172a; margin: 0 0 10px 0; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.8em;">
                            ${product.name}
                        </h3>
                        <div class="product-price" style="font-size: 1.4rem; font-weight: 900; color: #0046be; margin-bottom: 15px;">
                            $${product.price}
                        </div>
                    </div>

                    <!-- Nút Thêm giỏ & Compare -->
                    <div style="margin-top: auto;">
                        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id}, '${safeName}', ${product.price}, '${product.image_url}')" style="width: 100%; padding: 12px; background: #ffe000; color: #000; border: none; border-radius: 50px; font-weight: 800; cursor: pointer; transition: all 0.2s; margin-bottom: 10px;">
                            <span data-i18n="btn_add_cart">Add to Cart</span>
                        </button>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <!-- Đã FIX: Truyền thêm product.category_id vào hàm toggleCompare -->
                            <input type="checkbox" id="compare-${product.id}" ${isChecked} onchange="toggleCompare(${product.id}, '${safeName}', ${product.price}, '${product.image_url}', ${product.category_id})" style="cursor: pointer;">
                            <label for="compare-${product.id}" style="color: #64748b; font-size: 0.85rem; cursor: pointer;" data-i18n="lbl_compare">Compare</label>
                        </div>
                    </div>
                </div>
            `;
            }).join('');
        } else {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; background: #fff; border-radius: 16px; border: 1px dashed #cbd5e1;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
                    <h3 style="color: #0f172a; font-weight: 800; font-size: 1.2rem; margin-bottom: 10px;">Oops! No products found.</h3>
                    <p style="color: #64748b;">We couldn't find any products matching this category or brand right now.</p>
                    <button onclick="window.location.href='/pages/category.html?brand=all'" style="margin-top: 20px; background: #0046be; color: #fff; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 800; cursor: pointer;">View All Products</button>
                </div>`;
        }
    } catch (err) {
        console.error("Lỗi tải sản phẩm Category:", err);
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444; font-weight: bold; padding: 50px;">Connection error. Please check your server.</p>`;
    }
}

// Chạy trang ngay lập tức
initCategoryPage();