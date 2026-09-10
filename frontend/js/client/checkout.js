let modalMap, modalMarker;

// Hàm mở Pop-up
function openAddressModal() {
    document.getElementById('checkout-address-modal').style.display = 'flex';
    
    // Khởi tạo bản đồ Lazy Load (Khắc phục lỗi màn hình trắng)
    setTimeout(() => {
        if (!modalMap) {
            const defaultLoc = [21.0382, 105.7827]; // Vị trí mặc định
            modalMap = L.map('modal-map-container').setView(defaultLoc, 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(modalMap);

            modalMarker = L.marker(defaultLoc, {draggable: true}).addTo(modalMap);

            modalMarker.on('dragend', async function() {
                const pos = modalMarker.getLatLng();
                const finalInput = document.getElementById('modal-final-address');
                finalInput.value = "Đang xác thực...";
                
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`);
                    const data = await res.json();
                    finalInput.value = (data && data.display_name) ? data.display_name : "";
                } catch(err) {
                    finalInput.value = ""; alert("Lỗi kết nối bản đồ!");
                }
            });
        } else {
            modalMap.invalidateSize();
        }
    }, 150);
}

function closeAddressModal() {
    document.getElementById('checkout-address-modal').style.display = 'none';
}

document.getElementById('btn-modal-find').addEventListener('click', async () => {
    const query = document.getElementById('modal-map-search').value.trim();
    if (!query) return alert("Vui lòng nhập địa chỉ!");

    const btn = document.getElementById('btn-modal-find');
    btn.innerText = "⏳";

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();

        if (data && data.length > 0) {
            modalMap.flyTo([data[0].lat, data[0].lon], 16);
            modalMarker.setLatLng([data[0].lat, data[0].lon]);
            document.getElementById('modal-final-address').value = data[0].display_name;
        } else {
            alert("Bản đồ không tìm thấy địa chỉ này!");
        }
    } catch (err) { alert("Lỗi tìm kiếm!"); } 
    finally { btn.innerText = "🔍 Tìm"; }
});

// Chức năng: Bấm nút LƯU
document.getElementById('btn-modal-save').addEventListener('click', async () => {
    const finalAddress = document.getElementById('modal-final-address').value;
    if (!finalAddress || finalAddress.includes("Đang xác thực")) {
        return alert("Vui lòng ghim vị trí chuẩn xác trên bản đồ!");
    }

    const token = localStorage.getItem("token");
    try {
        const res = await fetch("http://localhost:3000/api/profile/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ address: finalAddress, is_default: true }) // Đặt làm mặc định luôn để giao tới đây
        });
        
        if (res.ok) {
            alert("Thêm địa chỉ thành công!");
            closeAddressModal();
            
            window.location.reload(); 
        } else {
            alert("Lỗi khi thêm địa chỉ!");
        }
    } catch (err) { alert("Mất kết nối máy chủ!"); }
});