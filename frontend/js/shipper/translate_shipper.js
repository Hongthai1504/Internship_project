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

let currentLang = localStorage.getItem("besttech_lang") || "en";

function applyLanguage() {
  const t = shipperDict[currentLang];
  
  const elements = {
    "app-logo-text": t.app_logo,
    "btn-logout-text": t.logout,
    "page-title-text": t.page_title,
    "tab-all": t.tab_all,
    "tab-shipping": t.tab_shipping,
    "tab-completed": t.tab_completed,
    "tab-cancelled": t.tab_cancelled,
    "loading-text": t.loading
  };

  for (const [id, text] of Object.entries(elements)) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }
  const langIcon = document.getElementById("lang-icon");
  const langText = document.getElementById("lang-text");
  if (langIcon && langText) {
    langIcon.src = currentLang === "vi" ? "https://flagcdn.com/w20/vn.png" : "https://flagcdn.com/w20/us.png";
    langText.innerText = currentLang === "vi" ? "VI" : "EN";
  }

  if (typeof renderTasks === "function") {
    renderTasks();
  }
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "vi" : "en";
  localStorage.setItem("besttech_lang", currentLang);
  applyLanguage();
}

document.addEventListener("DOMContentLoaded", applyLanguage);