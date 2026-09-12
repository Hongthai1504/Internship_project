// BEST TECH - HEADER LOGIC MODULE
console.log("Header JS is initializing...");

const headerMenuData = [
  {
    id: 1,
    type: "brand",
    main: "Shop by Brand",
    subs: [
      "Apple",
      "ASUS",
      "Beats",
      "Dell",
      "GE",
      "HP",
      "Lenovo",
      "LG",
      "Meta",
      "Nintendo",
      "Samsung",
      "Sony",
      "All Brands",
    ],
  },
  {
    id: 2,
    type: "category",
    main: "TV & Home Theater",
    subs: [
      "Explore TV & Home Theater",
      "Learn About RGB LED TVs",
      "TVs by Size",
      "TVs by Brand",
      "TVs by Type",
      "All Sound Bars & Home Audio",
      "Projectors & Screens",
    ],
  },
  {
    id: 3,
    type: "category",
    main: "Computers & Tablets",
    subs: [
      "Explore Computers & Tablets",
      "Laptops & Desktops",
      "Tablets",
      "Monitors",
      "PC Gaming & Virtual Reality",
      "Computer Components",
    ],
  },
  {
    id: 4,
    type: "category",
    main: "Appliances",
    subs: [
      "Explore Appliances",
      "Major Kitchen Appliances",
      "Small Kitchen Appliances",
      "Luxury Kitchen Appliances",
      "Washers & Dryers",
    ],
  },
  {
    id: 5,
    type: "category",
    main: "Small Kitchen Appliances",
    subs: [
      "Explore Small Kitchen Appliances",
      "Air Fryers & Deep Fryers",
      "Bar & Wine",
      "Blenders & Juicers",
      "Microwaves",
    ],
  },
  {
    id: 6,
    type: "category",
    main: "Video Games",
    subs: [
      "Explore Video Games",
      "Nintendo",
      "Xbox",
      "PlayStation",
      "PC Gaming",
      "Virtual Reality",
    ],
  },
  {
    id: 7,
    type: "category",
    main: "Cell Phones",
    subs: [
      "Explore Cell Phones",
      "Cell Phone Accessories",
      "Unlocked Phones",
      "iPhone",
      "Samsung Galaxy",
    ],
  },
  {
    id: 8,
    type: "category",
    main: "Headphones",
    subs: [
      "Explore Headphones",
      "AirPods",
      "Wireless Headphones",
      "True Wireless Earbuds",
      "Noise-Cancelling Headphones",
    ],
  },
  {
    id: 9,
    type: "category",
    main: "Home Audio & Speakers",
    subs: [
      "Explore Home Audio & Speakers",
      "Home Audio",
      "Portable Audio",
      "Premium Home Audio",
    ],
  },
  {
    id: 10,
    type: "category",
    main: "Music, Movies & TV Shows",
    subs: ["Explore Music, Movies & TV Shows", "Music", "Movies", "TV Shows"],
  },
  {
    id: 11,
    type: "category",
    main: "Cameras, Camcorders & Drones",
    subs: [
      "Explore Cameras, Camcorders & Drones",
      "Cameras & Lenses",
      "Action Cameras",
      "Drones",
    ],
  },
  {
    id: 12,
    type: "category",
    main: "Wearable Technology",
    subs: [
      "Explore Wearable Technology",
      "Apple Watch",
      "Samsung Galaxy Smartwatches",
      "Smartwatches",
      "Fitness Trackers",
    ],
  },
  {
    id: 13,
    type: "category",
    main: "Fitness, Sports & Outdoors",
    subs: [
      "Explore Fitness, Sports & Outdoors",
      "Exercise Equipment",
      "Water Sports",
      "Camping Gear",
    ],
  },
  {
    id: 14,
    type: "category",
    main: "Sports Fan Shop",
    subs: ["Explore Sports Fan Shop", "College", "NFL", "NBA", "MLB", "Soccer"],
  },
  {
    id: 15,
    type: "category",
    main: "Health, Wellness & Personal Care",
    subs: [
      "Explore Health, Wellness & Personal Care",
      "Personal Care & Beauty",
      "Workout Recovery",
    ],
  },
  {
    id: 16,
    type: "category",
    main: "Home, Furniture & Office",
    subs: [
      "Explore Home, Furniture & Office",
      "Home Decor",
      "Kitchen",
      "Office",
      "Bathroom",
    ],
  },
  {
    id: 17,
    type: "category",
    main: "Smart Home, Security & Wifi",
    subs: [
      "Explore Smart Home, Security & Wifi",
      "Wifi & Networking",
      "Security Cameras",
      "Smart Lighting",
    ],
  },
  {
    id: 18,
    type: "category",
    main: "Outdoor Living",
    subs: [
      "Explore Outdoor Living",
      "Grills & Cooking",
      "Patio Furniture",
      "Generators",
    ],
  },
  {
    id: 19,
    type: "category",
    main: "Electric Transportation",
    subs: [
      "Explore Electric Transportation",
      "Electric Bikes",
      "Electric Scooters",
      "Hoverboards",
    ],
  },
  {
    id: 20,
    type: "category",
    main: "Car Electronics & GPS",
    subs: [
      "Explore Car Electronics & GPS",
      "Car Audio",
      "Dash Cameras",
      "GPS Navigation",
    ],
  },
  {
    id: 21,
    type: "category",
    main: "Toys, Games & Crafts",
    subs: [
      "Explore Toys, Games & Crafts",
      "Toys by Type",
      "Board Games",
      "Collectibles",
    ],
  },
];

window.initHeaderState = function () {
  const token = localStorage.getItem("token");
  const adminLink = document.getElementById("header-admin-link");
  const accountText = document.getElementById("header-account-text");
  const ordersTrigger = document.getElementById("header-order-trigger");

  const menuContainer = document.getElementById("header-dynamic-menu");
  if (menuContainer && menuContainer.innerHTML === "") {
    let html = "";
    headerMenuData.forEach((cat) => {
      let link =
        cat.type === "brand"
          ? "/pages/shop/search.html?q=brands"
          : `/pages/shop/category.html?id=${cat.id}`;
      html += `<li style="font-weight:bold; cursor:pointer;" onclick="window.location.href='${link}'">📁 ${cat.main}</li>`;
    });
    menuContainer.innerHTML = html;
  }

  if (token && token !== "undefined" && token !== "null") {
    if (accountText) accountText.innerText = "My Account";
    if (ordersTrigger) ordersTrigger.style.display = "flex";

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "admin" && adminLink)
        adminLink.style.display = "flex";
    } catch (e) {}
  }

  try {
    const wCount = JSON.parse(localStorage.getItem("wishlist") || "[]").length;
    const cCount = JSON.parse(localStorage.getItem("cart") || "[]").reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const wEl = document.getElementById("header-wishlist-count");
    const cEl = document.getElementById("header-cart-count");
    if (wEl) wEl.innerText = wCount;
    if (cEl) cEl.innerText = cCount;
  } catch (e) {}
};

document.addEventListener("click", function (e) {
  const closeAllDropdowns = () => {
    document
      .querySelectorAll(".dropdown-menu-box, #header-user-dropdown")
      .forEach((box) => (box.style.display = "none"));
    document
      .querySelectorAll(".menu-pill-btn")
      .forEach((b) => b.classList.remove("active"));
    const overlay = document.getElementById("header-overlay");
    if (overlay) overlay.style.display = "none";
  };

  const menuBtn = e.target.closest(".menu-pill-btn");
  if (menuBtn) {
    e.stopPropagation();
    const targetId = menuBtn.getAttribute("data-target");
    const targetBox = document.getElementById(targetId);

    closeAllDropdowns();

    if (targetBox) {
      const rect = menuBtn.getBoundingClientRect();
      targetBox.style.top = rect.bottom + window.scrollY + 10 + "px";
      targetBox.style.left = rect.left + "px";
      targetBox.style.display = "block";
      menuBtn.classList.add("active");
      document.getElementById("header-overlay").style.display = "block";
    }
    return;
  }

  const loginTrigger = e.target.closest("#header-login-trigger");
  if (loginTrigger) {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      const userDrop = document.getElementById("header-user-dropdown");
      closeAllDropdowns();
      if (userDrop) userDrop.style.display = "block";
    } else {
      window.location.href = "/pages/user/login.html";
    }
    return;
  }

  const logoutBtn = e.target.closest("#header-menu-logout");
  if (logoutBtn) {
    localStorage.removeItem("token");
    alert("Đăng xuất thành công.");
    window.location.reload();
    return;
  }

  if (e.target.closest("#header-menu-profile"))
    window.location.href = "/pages/user/profile.html";

  if (
    e.target.closest("#header-order-trigger") &&
    typeof openOrderHistoryModal === "function"
  ) {
    openOrderHistoryModal();
  }

  if (e.target.closest("#header-cart-trigger")) {
    const cartDrawer = document.getElementById("cart-drawer");
    if (cartDrawer) cartDrawer.classList.add("open");
  }

  const searchBtn = e.target.closest("#btn-header-search");
  if (
    searchBtn ||
    (e.target.id === "header-search-input" && e.key === "Enter")
  ) {
    const val = document.getElementById("header-search-input").value.trim();
    if (val)
      window.location.href = `/pages/shop/search.html?q=${encodeURIComponent(val)}`;
  }

  const isInsideMenu =
    e.target.closest(".dropdown-menu-box") ||
    e.target.closest(".user-dropdown-menu");
  if (e.target.closest(".header-close-dropdown") || !isInsideMenu) {
    closeAllDropdowns();
  }
});

document.addEventListener("keypress", function (e) {
  if (e.target.id === "header-search-input" && e.key === "Enter") {
    const val = e.target.value.trim();
    if (val)
      window.location.href = `/pages/shop/search.html?q=${encodeURIComponent(val)}`;
  }
});
