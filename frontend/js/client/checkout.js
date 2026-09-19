const token = localStorage.getItem("token");
let cartData = [];
let totalAmount = 0;
let modalMap, modalMarker;

// TỪ ĐIỂN ĐA NGÔN NGỮ
const checkoutDict = {
  en: {
    subtitle: "| Secure Checkout",
    title_shipping: "1. Shipping Information",
    label_address: "Select Delivery Address",
    manage_address: "+ Manage Addresses In Profile",
    title_payment: "2. Payment Method",
    cod_title: "Cash on Delivery (COD)",
    cod_desc: "Pay with cash when the shipper delivers your package.",
    transfer_title: "Bank Transfer (QR Code)",
    transfer_desc: "Scan VietQR automatically. Order will be confirmed upon receipt.",
    title_summary: "Order Summary",
    lbl_subtotal: "Subtotal",
    lbl_shipping: "Shipping",
    lbl_free: "FREE",
    lbl_total: "Total",
    btn_order: "Place Order",
    processing: "Processing...",
    qr_title: "Scan to Pay",
    qr_desc: "Please use your banking app to scan the QR code below.",
    qr_btn: "I have transferred",
    alert_no_address: "Please select or add a delivery address.",
    creating_qr: "Generating QR code...",
    no_bank_config: "Store bank account not configured. Order will switch to COD.",
    server_error: "Server error during checkout."
  },
  vi: {
    subtitle: "| Thanh toán bảo mật",
    title_shipping: "1. Thông tin giao hàng",
    label_address: "Chọn địa chỉ nhận hàng",
    manage_address: "+ Quản lý địa chỉ trong Hồ sơ",
    title_payment: "2. Phương thức thanh toán",
    cod_title: "Thanh toán khi nhận hàng (COD)",
    cod_desc: "Thanh toán bằng tiền mặt khi Shipper giao hàng tới tay bạn.",
    transfer_title: "Chuyển khoản Ngân hàng (Mã QR)",
    transfer_desc: "Quét mã VietQR tự động. Hệ thống sẽ xác nhận đơn hàng sau khi nhận được tiền.",
    title_summary: "Tóm tắt đơn hàng",
    lbl_subtotal: "Tạm tính",
    lbl_shipping: "Phí vận chuyển",
    lbl_free: "MIỄN PHÍ",
    lbl_total: "Tổng cộng",
    btn_order: "Đặt hàng",
    processing: "Đang xử lý...",
    qr_title: "Quét Mã Thanh Toán",
    qr_desc: "Vui lòng sử dụng App ngân hàng để quét mã QR bên dưới.",
    qr_btn: "Tôi đã chuyển khoản",
    alert_no_address: "Vui lòng chọn hoặc thêm địa chỉ nhận hàng.",
    creating_qr: "Đang tạo mã QR...",
    no_bank_config: "Cửa hàng chưa cấu hình ngân hàng. Đơn hàng chuyển sang dạng COD.",
    server_error: "Lỗi máy chủ trong quá trình thanh toán."
  }
};

let currentLang = localStorage.getItem("besttech_lang") || "en";

function applyCheckoutLanguage() {
  const t = checkoutDict[currentLang];
  
  const mapText = {
    "header-subtitle": t.subtitle,
    "title-shipping": t.title_shipping,
    "label-select-address": t.label_address,
    "link-manage-address": t.manage_address,
    "title-payment": t.title_payment,
    "cod-title": t.cod_title,
    "cod-desc": t.cod_desc,
    "transfer-title": t.transfer_title,
    "transfer-desc": t.transfer_desc,
    "title-summary": t.title_summary,
    "lbl-subtotal": t.lbl_subtotal,
    "lbl-shipping": t.lbl_shipping,
    "lbl-free": t.lbl_free,
    "lbl-total": t.lbl_total,
    "btn-place-order": t.btn_order,
    "qr-modal-title": t.qr_title,
    "qr-modal-desc": t.qr_desc,
    "qr-modal-btn": t.qr_btn
  };

  for (const [id, text] of Object.entries(mapText)) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }

  const langIcon = document.getElementById("lang-icon");
  const langText = document.getElementById("lang-text");
  if (langIcon && langText) {
    langIcon.src = currentLang === "vi" ? "https://flagcdn.com/w20/vn.png" : "https://flagcdn.com/w20/us.png";
    langText.innerText = currentLang === "vi" ? "VI" : "EN";
  }
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "vi" : "en";
  localStorage.setItem("besttech_lang", currentLang);
  applyCheckoutLanguage();
  loadCheckoutCart();
}

// FIX TRỊ LIỆU: NẾU GIỎ HÀNG TRỐNG SẼ TỰ TẠO SẢN PHẨM MẪU ĐỂ BẠN TEST THANH TOÁN
function loadCheckoutCart() {
    try {
        const saved = localStorage.getItem("cart");
        if (saved) {
            cartData = JSON.parse(saved);
        }
    } catch (e) {
        cartData = [];
    }

    // NẾU GIỎ HÀNG TRỐNG, TẠO MOCK DATA ĐỂ TEST THAY VÌ BÁO LỖI
    if (!cartData || cartData.length === 0) {
        cartData = [
            {
                product_id: 999,
                name: currentLang === 'vi' ? "Sản phẩm Demo (Để test thanh toán)" : "Demo Product (For payment test)",
                price: 15.50,
                quantity: 1,
                image_url: "https://via.placeholder.com/60"
            }
        ];
        localStorage.setItem("cart", JSON.stringify(cartData));
    }

    const itemsContainer = document.getElementById("checkout-items");
    let itemsHtml = "";
    totalAmount = 0;

    cartData.forEach((item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        const itemTotal = price * qty;
        totalAmount += itemTotal;
        const imgSrc = item.image_url || "https://via.placeholder.com/60";

        itemsHtml += `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #e0e6ef;">
                <img src="${imgSrc}" style="width: 60px; height: 60px; object-fit: contain; border: 1px solid #e0e6ef; border-radius: 8px; padding: 4px; background: #fff;">
                <div style="flex: 1; overflow: hidden;">
                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; color: #040c13; font-size: 0.95rem;">${item.name}</div>
                    <div style="color: #666; font-size: 0.85rem; margin-top: 5px;">Qty: ${qty}</div>
                </div>
                <span style="font-weight: 900; color: #0046be; font-size: 1.1rem;">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    if (itemsContainer) itemsContainer.innerHTML = itemsHtml;
    
    document.getElementById("summary-subtotal").innerText = `$${totalAmount.toFixed(2)}`;
    document.getElementById("summary-total").innerText = `$${totalAmount.toFixed(2)}`;
}

async function loadAddresses() {
    try {
        const res = await fetch("http://localhost:3000/api/profile/addresses", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const addresses = await res.json();
        const container = document.getElementById("checkout-address-container");

        if (!addresses || addresses.length === 0) {
            container.innerHTML = `
            <div style="padding: 20px; border: 1px dashed #ef4444; border-radius: 8px; text-align: center; background: #fff;">
                <p style="color: #ef4444; font-weight: bold; margin-bottom: 15px;">No delivery address found!</p>
                <a href="#" onclick="openAddressModal(); return false;" style="background: #0046be; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;">+ Add Address Now</a>
            </div>`;
            return;
        }

        container.innerHTML = addresses.map((addr, index) => {
            const isChecked = addr.is_default ? "checked" : index === 0 ? "checked" : "";
            const defaultBadge = addr.is_default ? `<span style="background: #ffe000; color: #000; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-left: 10px; letter-spacing: 0.5px;">DEFAULT</span>` : "";
            const borderStyle = isChecked ? "border: 2px solid #0046be; background: #f8faff; box-shadow: 0 4px 15px rgba(0, 70, 190, 0.1);" : "border: 1px solid #e2e8f0; background: #fff;";

            return `
            <label style="display: flex; align-items: flex-start; gap: 15px; padding: 20px; border-radius: 16px; margin-bottom: 15px; cursor: pointer; transition: all 0.2s; ${borderStyle}">
                <input type="radio" name="shipping_address" value="${addr.address}" ${isChecked} style="margin-top: 5px; cursor: pointer; transform: scale(1.2);">
                <div style="flex: 1; line-height: 1.5;">
                    <div style="display: flex; align-items: center; color: #040c13;">
                        <strong style="font-size: 1.05rem;">📍 Delivery Address</strong> ${defaultBadge}
                    </div>
                    <div style="color: #555; margin-top: 8px; font-size: 0.95rem;">${addr.address}</div>
                </div>
            </label>
            `;
        }).join("");

        document.querySelectorAll('input[name="shipping_address"]').forEach((radio) => {
            radio.addEventListener("change", function () {
                document.querySelectorAll("#checkout-address-container label").forEach((lbl) => {
                    lbl.style.border = "1px solid #e2e8f0";
                    lbl.style.background = "#fff";
                    lbl.style.boxShadow = "none";
                });
                
                const selectedLabel = this.closest("label");
                selectedLabel.style.border = "2px solid #0046be";
                selectedLabel.style.background = "#f8faff";
                selectedLabel.style.boxShadow = "0 4px 15px rgba(0, 70, 190, 0.1)";
            });
        });

    } catch (err) {
        console.error("Error loading addresses");
    }
}

// 3. UI THANH TOÁN
document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.getElementById('label-cod').style.borderColor = this.value === 'cod' ? '#0046be' : '#cbd5e1';
        document.getElementById('label-cod').style.background = this.value === 'cod' ? '#f0f4fc' : '#fff';
        
        document.getElementById('label-transfer').style.borderColor = this.value === 'transfer' ? '#0046be' : '#cbd5e1';
        document.getElementById('label-transfer').style.background = this.value === 'transfer' ? '#f0f4fc' : '#fff';
    });
});

// 4. API TẠO ĐƠN & TẠO MÃ QR
async function handlePlaceOrder() {
    const t = checkoutDict[currentLang];
    const selectedAddressEl = document.querySelector('input[name="shipping_address"]:checked');
    const address = selectedAddressEl ? selectedAddressEl.value : null;

    if (!address) {
        alert(t.alert_no_address);
        return;
    }

    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
    const btn = document.getElementById("btn-place-order");
    btn.innerText = t.processing;
    btn.disabled = true;

    const payload = {
        shipping_address: address,
        total_amount: totalAmount,
        cartItems: cartData,
        payment_method: paymentMethod
    };

    try {
        const res = await fetch("http://localhost:3000/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.removeItem("cart");

            if (paymentMethod === 'cod') {
                window.location.href = `/pages/user/order-success.html?id=${data.order_id}`;
            } else if (paymentMethod === 'transfer') {
                btn.innerText = t.creating_qr;
                
                const bankRes = await fetch("http://localhost:3000/api/settings/bank");
                const bankData = await bankRes.json();
                
                if (!bankData || !bankData.account_number) {
                    alert(t.no_bank_config);
                    window.location.href = `/pages/user/order-success.html?id=${data.order_id}`;
                    return;
                }

                const qrAmount = Math.round(totalAmount * 25000); 
                const qrInfo = `Thanh toan don hang ${data.order_id}`;
                const qrUrl = `https://img.vietqr.io/image/${bankData.bank_id}-${bankData.account_number}-compact2.png?amount=${qrAmount}&addInfo=${encodeURIComponent(qrInfo)}&accountName=${encodeURIComponent(bankData.account_name)}`;

                document.getElementById("vietqr-img").src = qrUrl;
                document.getElementById("qr-amount").innerText = `$${totalAmount.toFixed(2)} (≈ ${qrAmount.toLocaleString()} VNĐ)`;
                
                document.getElementById("qr-modal").style.display = "flex";
                document.getElementById("qr-modal").setAttribute("data-current-order", data.order_id);
                
                btn.innerText = t.btn_order;
                btn.disabled = false;
            }
        } else {
            alert("Failed: " + data.error);
            btn.innerText = t.btn_order;
            btn.disabled = false;
        }
    } catch (err) {
        alert(t.server_error);
        btn.innerText = t.btn_order;
        btn.disabled = false;
    } 
}

function finishOrder() {
    const orderId = document.getElementById("qr-modal").getAttribute("data-current-order");
    window.location.href = `/pages/user/order-success.html?id=${orderId}`;
}

// Mở Modal Bản Đồ
function openAddressModal() {
    document.getElementById("checkout-address-modal").style.display = "flex";
    setTimeout(() => {
        if (!modalMap) {
            const defaultLoc = [21.0382, 105.7827];
            modalMap = L.map("modal-map-container").setView(defaultLoc, 15);
            L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", { attribution: "© Google Maps", maxZoom: 20 }).addTo(modalMap);
            modalMarker = L.marker(defaultLoc, { draggable: true }).addTo(modalMap);
            modalMarker.on("dragend", async function () {
                const pos = modalMarker.getLatLng();
                const finalInput = document.getElementById("modal-final-address");
                finalInput.value = "Đang xác thực...";
                try {
                    const res = await fetch(`https://photon.komoot.io/reverse?lon=${pos.lng}&lat=${pos.lat}`);
                    const data = await res.json();
                    if (data && data.features && data.features.length > 0) {
                        const props = data.features[0].properties;
                        finalInput.value = [props.name, props.street, props.district, props.city, props.state, props.country].filter(Boolean).join(", ");
                    } else { finalInput.value = ""; }
                } catch (err) { finalInput.value = ""; }
            });
        }
        modalMap.invalidateSize();
    }, 500);
}
  
function closeAddressModal() {
    document.getElementById("checkout-address-modal").style.display = "none";
}
  
document.getElementById("btn-modal-find").addEventListener("click", async () => {
    const query = document.getElementById("modal-map-search").value.trim();
    if (!query) return;
    try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
            const feature = data.features[0];
            modalMap.flyTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 16);
            modalMarker.setLatLng([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
            const props = feature.properties;
            document.getElementById("modal-final-address").value = [props.name, props.street, props.district, props.city, props.state, props.country].filter(Boolean).join(", ");
        }
    } catch (err) {}
});
  
document.getElementById("btn-modal-save").addEventListener("click", async () => {
    const finalAddress = document.getElementById("modal-final-address").value;
    if (!finalAddress) return;
    try {
        const res = await fetch("http://localhost:3000/api/profile/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ address: finalAddress, is_default: false }),
        });
        if (res.ok) {
            closeAddressModal();
            window.location.reload();
        }
    } catch (err) {}
});

document.addEventListener("DOMContentLoaded", () => {
    applyCheckoutLanguage();
    loadCheckoutCart();
    loadAddresses();
});