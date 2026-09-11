// ==========================================
// BEST TECH - CATEGORY.JS
// ==========================================
console.log("Category.js is loading...");

// Tự động chạy ngay lập tức
(function initCategory() {
  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get("id");
  const catKey = urlParams.get("key");
  const catName = urlParams.get("name");

  if (catId) {
    loadCategoryProducts(catId, catKey, catName);
  } else {
    const list = document.getElementById("product-list");
    if (list)
      list.innerHTML =
        "<p style='grid-column: 1/-1; text-align: center;'>Danh mục không tồn tại.</p>";
  }
})();

async function loadCategoryProducts(catId, catKey, catName) {
  const titleEl = document.getElementById("page-title");

  if (titleEl) {
    if (catKey) {
      titleEl.setAttribute("data-i18n", catKey);
      if (
        typeof translations !== "undefined" &&
        translations[currentLang] &&
        translations[currentLang][catKey]
      ) {
        titleEl.innerText = translations[currentLang][catKey];
        document.title = `${translations[currentLang][catKey]} | Best Tech`;
      }
    } else if (catName) {
      titleEl.innerText = decodeURIComponent(catName);
    }
  }

  const productListEl = document.getElementById("product-list");
  if (productListEl) {
    productListEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><div style="font-size: 2.5rem; animation: spin 1s linear infinite;">⚙️</div><p style="color: #64748b; margin-top: 15px;">Đang tải sản phẩm...</p></div>`;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/products?limit=100&lang=${currentLang}`,
    );
    const result = await response.json();

    if (result.data) {
      allProducts = result.data;
      currentPageProducts = allProducts.filter(
        (product) => product.category_id === parseInt(catId),
      );

      if (typeof renderDynamicBrands === "function")
        renderDynamicBrands(currentPageProducts);
      if (typeof handleFilters === "function") handleFilters();
    }
  } catch (error) {
    if (productListEl)
      productListEl.innerHTML =
        "<p style='grid-column: 1/-1; text-align: center; color: red;'>Lỗi kết nối máy chủ.</p>";
  }
}
