// ==========================================
// BEST TECH - SHIPPER LOGIC
// ==========================================
console.log("Shipper.js is loading...");

// 1. Khai báo TỪ ĐIỂN ĐẦY ĐỦ cho Shipper (Đã gộp cả UI và Map)
const shipperDict = {
  en: {
    app_logo: "Shipper",
    logout: "Logout",
    page_title: "My Delivery Tasks",
    loading: "Loading tasks...",
    empty_title: "No orders found",
    empty_desc: "There are no orders matching this filter.",
    lbl_customer: "Customer Name",
    lbl_phone: "Phone Number",
    lbl_address: "Delivery Address",
    lbl_cod: "Total COD Amount:",
    btn_delivered: "✓ Delivered",
    btn_failed: "✕ Failed",
    confirm_msg: "Confirm changing status of order",
    alert_login: "Please log in!",
    err_load: "Error loading tasks.",
    err_server: "Server connection error.",
    tab_all: "All",
    tab_shipping: "Delivering",
    tab_completed: "Completed",
    tab_cancelled: "Cancelled",
    btn_view_map: "🗺️ View Map",
    btn_close_map: "🗺️ Close Map",
    err_map_not_found: "❌ Coordinates not found on map.",
  },
  vi: {
    app_logo: "Giao Hàng",
    logout: "Đăng xuất",
    page_title: "Nhiệm Vụ Của Tôi",
    loading: "Đang tải dữ liệu...",
    empty_title: "Trống",
    empty_desc: "Không có đơn hàng nào trong mục này.",
    lbl_customer: "Tên khách hàng",
    lbl_phone: "Số điện thoại",
    lbl_address: "Địa chỉ giao hàng",
    lbl_cod: "Tổng tiền thu hộ (COD):",
    btn_delivered: "✓ Đã giao",
    btn_failed: "✕ Thất bại",
    confirm_msg: "Xác nhận chuyển trạng thái đơn",
    alert_login: "Vui lòng đăng nhập!",
    err_load: "Lỗi tải danh sách đơn hàng.",
    err_server: "Lỗi kết nối đến máy chủ.",
    tab_all: "Tất cả",
    tab_shipping: "Chưa giao",
    tab_completed: "Đã giao",
    tab_cancelled: "Đã hủy",
    btn_view_map: "🗺️ Xem bản đồ",
    btn_close_map: "🗺️ Đóng bản đồ",
    err_map_not_found: "❌ Không tìm thấy tọa độ trên bản đồ.",
  },
};

const mapInstances = {};

// 2. Logic xử lý bản đồ
async function toggleMap(orderId, address) {
  // Lấy ngôn ngữ hiện tại từ LocalStorage
  const currentLang = localStorage.getItem("besttech_lang") || "en";
  const t = shipperDict[currentLang];

  const mapContainer = document.getElementById(`map-container-${orderId}`);
  const btn =
    mapContainer.previousElementSibling.querySelector("button") ||
    mapContainer.previousElementSibling.lastElementChild;

  if (mapContainer.style.height === "220px") {
    mapContainer.style.height = "0px";
    mapContainer.style.border = "none";
    btn.innerHTML = t.btn_view_map;
    return;
  }

  mapContainer.style.height = "220px";
  mapContainer.style.border = "2px solid #cbd5e1";
  btn.innerHTML = "⏳...";

  if (mapInstances[orderId]) {
    setTimeout(() => mapInstances[orderId].invalidateSize(), 300); // Khắc phục lỗi bể layout Leaflet
    btn.innerHTML = t.btn_close_map;
    return;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
    );
    const data = await res.json();

    if (data && data.length > 0) {
      const lat = data[0].lat;
      const lon = data[0].lon;

      const map = L.map(`map-container-${orderId}`).setView([lat, lon], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(
          `<strong style="color:#0046be;">Giao đến:</strong><br>${address}`,
        )
        .openPopup();

      mapInstances[orderId] = map;
      btn.innerHTML = t.btn_close_map;
    } else {
      mapContainer.style.height = "auto";
      mapContainer.style.padding = "15px";
      mapContainer.innerHTML = `<p style='color: #ef4444; font-size: 0.9rem; margin:0; font-weight: bold;'>${t.err_map_not_found}</p>`;
      btn.innerHTML = t.btn_close_map;
    }
  } catch (err) {
    mapContainer.style.height = "0px";
    alert(t.err_server);
    btn.innerHTML = t.btn_view_map;
  }
}
