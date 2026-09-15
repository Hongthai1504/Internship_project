// ==========================================
// BỘ TỪ ĐIỂN ĐA NGÔN NGỮ (I18N) TRỌN BỘ ADMIN
// ==========================================
const adminDict = {
  en: {
    // 1. MENU & HEADER
    menu_add: "+ Add New Product",
    menu_orders: "Order Management",
    menu_customers: "Customer List",
    menu_settings: "System Settings",
    logout: "Log Out",

    // 2. TRANG ADD PRODUCT (admin.html)
    add_title: "Add New Product",
    lbl_prod_name: "Product Name (including product type) *",
    tip_prod_name:
      "Tip: Include the product type in the name (Ex: <b>iPhone</b>, <b>Laptop</b>, <b>TV</b>) to allow the system to automatically place the product on the correct category page.",
    ph_name: "Ex: Apple iPhone 15 Pro Max 256GB",
    lbl_main_cat: "Main Category *",
    opt_main_cat: "-- Select main category --",
    lbl_sub_cat: "Sub Category *",
    opt_sub_cat_first: "Please select the main category first",
    tip_sub_cat: "The product will be saved directly into this subcategory.",
    lbl_brand: "Brand *",
    tip_brand:
      "Enter the brand name accurately so the product appears in the 'Shop by Brand' menu.",
    ph_brand: "Ex: Apple, Samsung, Sony...",
    lbl_sku: "SKU (Unique) *",
    ph_sku: "Ex: APP-IPH15-256",
    lbl_price: "Selling Price ($) *",
    lbl_stock: "Stock Quantity",
    lbl_images: "Product Images (Select from Media Library)",
    btn_browse_media: "Browse Media Library",
    txt_no_images: "No images selected.",
    lbl_specs: "Technical Specifications (Optional)",
    btn_add_spec: "+ Add Specification Row",
    tip_specs:
      'Group (e.g., "Processor"), Name (e.g., "CPU Speed"), Value (e.g., "2.8GHz").',
    lbl_desc: "Detailed Description",
    btn_ai_gen: "✨ AI Generate",
    ph_desc: "Enter product specifications, key features...",
    btn_add_product: "+ Add Product to Store",
    mng_title: "Product Management",
    mng_subtitle: "List of products currently available on the system.",
    edit_title: "Edit Product",
    lbl_prod_name2: "Product Name *",
    lbl_brand2: "Brand *",
    lbl_sku2: "SKU (Unique) *",
    lbl_price2: "Price ($) *",
    lbl_stock2: "Stock",
    lbl_edit_sub_cat: "Sub Category ID (Read-only for quick edits)",
    lbl_edit_images: "Product Images (Main Image & Gallery)",
    lbl_desc2: "Description",
    btn_save_changes: "Save Changes",

    // 3. TRANG CUSTOMERS (admin-customers.html)
    cust_subtitle:
      "The list of customers who have registered an account will be displayed here...",
    th_id: "ID",
    th_fullname: "Full Name",
    th_email: "Email",
    th_phone: "Phone Number",
    th_role: "Role",
    th_action: "Action",
    btn_save_role: "Save",
    btn_delete_user: "Delete",
    confirm_role: "Are you sure you want to change the role of account",
    confirm_del_user:
      "WARNING: Are you sure you want to PERMANENTLY delete account",

    // 4. TRANG ORDERS (admin-orders.html)
    title_pending: "⏳ Pending Orders",
    title_shipping: "🚀 Shipping Orders",
    title_completed: "✅ Completed Orders",
    title_cancelled: "❌ Cancelled Orders",
    th_order_id: "Order ID",
    th_customer: "Customer",
    th_total: "Total Payment",
    th_assign: "Assign Shipper",
    th_status: "Status",
    btn_save: "Save & Assign",
    btn_cancel: "Cancel Order",
    empty_orders: "No orders found in this section.",
    confirm_order: "Confirm updating status for order",
    assign_warning:
      "Please assign a Shipper before changing status to SHIPPING!",

    // 5. THƯ VIỆN MEDIA
    media_title: "Media Library",
    media_docs: "Documents",
    ph_new_folder: "New folder...",
    media_all: "All Media",
    media_unassigned: "Unassigned",
    media_search_placeholder: "Search image by name...",
    media_choose_files: "Choose Files",
    media_no_files: "No files",
    media_upload: "Upload",
    media_empty_title: "This folder is empty.",
    media_empty_desc: "Select files and click upload to get started.",
    media_img_selected: "images selected",
    media_btn_confirm: "Confirm Selection",

    // 6. TRANG CÀI ĐẶT FLASH SALE
    set_flash_title: "Flash Sale Settings",
    set_flash_desc:
      "Set countdown timer for the flash sale banner on the homepage.",
    set_flash_endtime: "Select End Time:",
    set_flash_active: "Enable Flash Sale",
    set_flash_title: "Deal of the Day",
    set_ship_title: "Shipping & Delivery",
    set_ship_desc:
      "Configure the standard shipping fee and free shipping threshold.",
    set_ship_base: "Base Shipping Fee ($):",
    set_ship_free: "Free Shipping Threshold ($):",

    // 7. TRANG CÀI ĐẶT CỬA HÀNG (STORE LOCATIONS)
    set_store_title: "Store Locations",
    set_store_desc:
      "Add branch/warehouse locations. The system automatically geocodes addresses to GPS coordinates for Shippers.",
    ph_store_name: "Store Name (Ex: Main Warehouse Cầu Giấy)",
    ph_store_address: "Full Address (Ex: 144 Xuan Thuy, Hanoi)",
    btn_add_store: "+ Add New Store",
    th_store: "Pickup Store",
  },

  vi: {
    // 1. MENU & HEADER
    menu_add: "+ Thêm Sản Phẩm Mới",
    menu_orders: "Quản Lý Đơn Hàng",
    menu_customers: "Danh Sách Khách Hàng",
    menu_settings: "Cài Đặt Hệ Thống",
    logout: "Đăng Xuất",

    // 2. TRANG ADD PRODUCT (admin.html)
    add_title: "Thêm Sản Phẩm Mới",
    lbl_prod_name: "Tên Sản Phẩm (kèm loại sản phẩm) *",
    tip_prod_name:
      "Mẹo: Kèm loại sản phẩm trong tên (VD: <b>iPhone</b>, <b>Laptop</b>, <b>TV</b>) để hệ thống tự động đưa sản phẩm vào đúng danh mục.",
    ph_name: "VD: Apple iPhone 15 Pro Max 256GB",
    lbl_main_cat: "Danh Mục Chính *",
    opt_main_cat: "-- Chọn danh mục chính --",
    lbl_sub_cat: "Danh Mục Phụ *",
    opt_sub_cat_first: "Vui lòng chọn danh mục chính trước",
    tip_sub_cat: "Sản phẩm sẽ được lưu trực tiếp vào danh mục phụ này.",
    lbl_brand: "Thương Hiệu *",
    tip_brand:
      "Nhập chính xác tên thương hiệu để sản phẩm xuất hiện trong menu 'Shop by Brand'.",
    ph_brand: "VD: Apple, Samsung, Sony...",
    lbl_sku: "Mã SKU (Duy nhất) *",
    ph_sku: "VD: APP-IPH15-256",
    lbl_price: "Giá Bán ($) *",
    lbl_stock: "Số Lượng Kho",
    lbl_images: "Hình Ảnh Sản Phẩm (Chọn từ Thư viện Media)",
    btn_browse_media: "Mở Thư Viện Media",
    txt_no_images: "Chưa chọn hình ảnh nào.",
    lbl_specs: "Thông Số Kỹ Thuật (Không bắt buộc)",
    btn_add_spec: "+ Thêm Dòng Thông Số",
    tip_specs:
      'Nhóm (VD: "Màn hình"), Tên (VD: "Độ phân giải"), Giá trị (VD: "4K UHD").',
    lbl_desc: "Mô Tả Chi Tiết",
    btn_ai_gen: "✨ AI Tạo Tự Động",
    ph_desc: "Nhập thông số, tính năng nổi bật...",
    btn_add_product: "+ Thêm Sản Phẩm Vào Cửa Hàng",
    mng_title: "Quản Lý Sản Phẩm",
    mng_subtitle: "Danh sách các sản phẩm đang có sẵn trên hệ thống.",
    edit_title: "Chỉnh Sửa Sản Phẩm",
    lbl_prod_name2: "Tên Sản Phẩm *",
    lbl_brand2: "Thương Hiệu *",
    lbl_sku2: "Mã SKU (Duy nhất) *",
    lbl_price2: "Giá Bán ($) *",
    lbl_stock2: "Số Lượng",
    lbl_edit_sub_cat: "ID Danh Mục Phụ (Chỉ đọc)",
    lbl_edit_images: "Hình Ảnh (Ảnh chính & Bộ sưu tập)",
    lbl_desc2: "Mô Tả",
    btn_save_changes: "Lưu Thay Đổi",

    // 3. TRANG CUSTOMERS (admin-customers.html)
    cust_subtitle:
      "Danh sách khách hàng đã đăng ký tài khoản trên hệ thống sẽ được hiển thị tại đây...",
    th_id: "Mã KH",
    th_fullname: "Họ và Tên",
    th_email: "Địa Chỉ Email",
    th_phone: "Số Điện Thoại",
    th_role: "Phân Quyền",
    th_action: "Thao Tác",
    btn_save_role: "Lưu Quyền",
    btn_delete_user: "Xóa T.Khoản",
    confirm_role: "Bạn có chắc muốn đổi quyền của tài khoản",
    confirm_del_user: "CẢNH BÁO: Chắc chắn XÓA VĨNH VIỄN tài khoản",

    // 4. TRANG ORDERS (admin-orders.html)
    title_pending: "⏳ Chờ Duyệt Lệnh",
    title_shipping: "🚀 Đang Giao Hàng",
    title_completed: "✅ Đã Hoàn Thành",
    title_cancelled: "❌ Đơn Đã Hủy",
    th_order_id: "Mã Đơn",
    th_customer: "Khách Hàng",
    th_total: "Tổng Tiền",
    th_assign: "Gán Người Giao",
    th_status: "Trạng Thái",
    btn_save: "Lưu & Giao",
    btn_cancel: "Hủy Đơn",
    empty_orders: "Không có đơn hàng nào trong mục này.",
    confirm_order: "Xác nhận cập nhật trạng thái đơn",
    assign_warning: "Vui lòng gán (Assign) Shipper trước khi Giao đơn!",

    // 5. THƯ VIỆN MEDIA
    media_title: "Thư Viện Media",
    media_docs: "Tài Liệu",
    ph_new_folder: "Thư mục mới...",
    media_all: "Tất Cả Media",
    media_unassigned: "Chưa Phân Loại",
    media_search_placeholder: "Tìm ảnh theo tên...",
    media_choose_files: "Chọn File",
    media_no_files: "Chưa chọn file",
    media_upload: "Tải Lên",
    media_empty_title: "Thư mục này đang trống.",
    media_empty_desc: "Chọn file và bấm Tải lên để bắt đầu.",
    media_img_selected: "ảnh đã chọn",
    media_btn_confirm: "Xác Nhận Chọn",

    // 6. TRANG CÀI ĐẶT FLASH SALE
    set_flash_title: "Khuyến Mãi Trong Ngày",
    set_flash_desc:
      "Cài đặt thời gian đếm ngược cho banner khuyến mãi trên trang chủ.",
    set_flash_endtime: "Chọn Thời Gian Kết Thúc:",
    set_flash_active: "Bật Khuyến Mãi Trong Ngày",
    set_ship_title: "Phí Giao Hàng",
    set_ship_desc:
      "Cấu hình phí giao hàng tiêu chuẩn và định mức miễn phí vận chuyển.",
    set_ship_base: "Phí Giao Hàng Tiêu Chuẩn ($):",
    set_ship_free: "Định Mức Miễn Phí Ship ($):",

    // 7. TRANG CÀI ĐẶT CỬA HÀNG (STORE LOCATIONS)
    set_store_title: "Cửa Hàng / Kho",
    set_store_desc:
      "Thêm các chi nhánh / kho hàng. Hệ thống tự động định vị địa chỉ thành tọa độ GPS cho Shipper.",
    ph_store_name: "Tên Cửa Hàng (Ví dụ: Kho Chính Cầu Giấy)",
    ph_store_address: "Địa Chỉ Đầy Đủ (Ví dụ: 144 Xuan Thuy, Hà Nội)",
    btn_add_store: "+ Thêm Cửa Hàng Mới",
    th_store: "Cửa Hàng Xuất Kho",
  },
};

let currentAdminLang = localStorage.getItem("besttech_admin_lang") || "en";

function toggleAdminLang() {
  currentAdminLang = currentAdminLang === "en" ? "vi" : "en";
  localStorage.setItem("besttech_admin_lang", currentAdminLang);
  window.location.reload();
}

// BỘ MÁY QUÉT VÀ DỊCH TỰ ĐỘNG
document.addEventListener("DOMContentLoaded", () => {
  const t = adminDict[currentAdminLang];

  // Dịch thẻ HTML tĩnh
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.innerHTML = t[key];
  });

  // Dịch Placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key]) el.setAttribute("placeholder", t[key]);
  });

  // Cập nhật Cờ
  const langIcon = document.getElementById("admin-lang-icon");
  const langText = document.getElementById("admin-lang-text");
  if (langIcon && langText) {
    langIcon.src =
      currentAdminLang === "vi"
        ? "https://flagcdn.com/w20/vn.png"
        : "https://flagcdn.com/w20/us.png";
    langText.innerText = currentAdminLang === "vi" ? "VI" : "EN";
  }
});
