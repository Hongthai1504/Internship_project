const shipperDict = {
  en: {
    app_logo: "Shipper", logout: "Logout", page_title: "My Delivery Tasks",
    loading: "Loading tasks...", empty: "No tasks available.",
    lbl_customer: "Customer Name", lbl_phone: "Phone Number", lbl_address: "Delivery Address",
    lbl_cod: "Total COD Amount:",
    tab_all: "All", tab_shipping: "Delivering", tab_completed: "Completed", tab_cancelled: "Cancelled",
    
    btn_load_map: "🗺️ Load Map Now",
    btn_start_gps: "🚀 Start GPS Routing",
    gps_connecting: "⏳ Connecting to Satellite...",
    gps_routing: "📡 Routing in progress...",
    gps_error: "❌ GPS Error: Please enable Location!",
    gps_not_found: "❌ Error: Cannot geocode address!",
    err_server: "Server connection error.",

    step_1: "🏬 STEP 1: PICKUP AT STORE",
    step_2: "🏠 STEP 2: DELIVER TO CUSTOMER",
    status_waiting: "Status: WAITING PICKUP",
    target_point: "📍 Target",
    
    btn_pickup: "📦 CONFIRM PICKUP (PHOTO)",
    btn_deliver: "✓ DELIVERY SUCCESS (PHOTO)",
    btn_failed: "✕ Failed",
    msg_pickup_confirm: "Confirm you have picked up the package?",
    err_distance: "⛔ DENIED! Distance is ",
    
    pod_title_pickup: "📦 Photo Proof of Pickup",
    pod_title_deliver: "✅ Photo Proof of Delivery",
    pod_title_fail: "❌ Confirm Cancellation",
    pod_lbl_img: "📷 Photo Proof (*):",
    pod_lbl_note: "📝 Notes / Reason:",
    pod_btn_cancel: "Cancel",
    pod_btn_submit: "Confirm & Submit"
  },
  vi: {
    app_logo: "Giao Hàng", logout: "Đăng xuất", page_title: "Nhiệm Vụ Của Tôi",
    loading: "Đang tải dữ liệu...", empty: "Chưa có đơn hàng nào.",
    lbl_customer: "Tên khách hàng", lbl_phone: "Số điện thoại", lbl_address: "Địa chỉ giao hàng",
    lbl_cod: "Tổng tiền thu hộ (COD):",
    tab_all: "Tất cả", tab_shipping: "Chưa giao", tab_completed: "Đã giao", tab_cancelled: "Đã hủy",
    
    btn_load_map: "🗺️ Tải Bản Đồ Ngay",
    btn_start_gps: "🚀 Bật GPS Chỉ Đường",
    gps_connecting: "⏳ Đang kết nối vệ tinh...",
    gps_routing: "📡 Đang theo dõi lộ trình...",
    gps_error: "❌ Lỗi GPS: Vui lòng bật Vị trí (Location)!",
    gps_not_found: "❌ Lỗi định vị địa chỉ!",
    err_server: "Lỗi kết nối đến máy chủ.",

    step_1: "🏬 BƯỚC 1: LẤY HÀNG TẠI KHO",
    step_2: "🏠 BƯỚC 2: GIAO CHO KHÁCH",
    status_waiting: "Trạng thái: CHỜ LẤY HÀNG",
    target_point: "📍 Điểm đến",
    
    btn_pickup: "📦 ĐÃ LẤY HÀNG (CHỤP ẢNH)",
    btn_deliver: "✓ GIAO THÀNH CÔNG (CHỤP ẢNH)",
    btn_failed: "Thất bại",
    msg_pickup_confirm: "Bạn xác nhận đã nhận hàng từ kho thành công?",
    err_distance: "⛔ TỪ CHỐI! Khoảng cách hiện tại: ",
    
    pod_title_pickup: "📦 Chụp ảnh lấy hàng tại kho",
    pod_title_deliver: "✅ Chụp ảnh giao hàng thành công",
    pod_title_fail: "❌ Xác nhận Hủy giao hàng",
    pod_lbl_img: "📷 Ảnh minh chứng (*):",
    pod_lbl_note: "📝 Ghi chú / Lý do:",
    pod_btn_cancel: "Hủy",
    pod_btn_submit: "Xác nhận & Gửi"
  }
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

  // Reload giao diện nếu hàm renderTasks đã tồn tại
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