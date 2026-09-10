// ĐÃ ĐỔI TÊN THÀNH profileToken ĐỂ KHÔNG ĐỤNG ĐỘ VỚI app.js
const profileToken = localStorage.getItem("token");
if (!profileToken) {
    alert("Vui lòng đăng nhập trước!");
    window.location.href = "/pages/user/login.html";
}

// ==========================================
// 1. LOGIC CHUYỂN TAB & LAZY LOAD MAP
// ==========================================
const tabInfo = document.getElementById("tab-info-btn");
const tabAddr = document.getElementById("tab-address-btn");
const secInfo = document.getElementById("section-info");
const secAddr = document.getElementById("section-address");

if (tabInfo && tabAddr) {
    tabInfo.addEventListener("click", () => {
        tabInfo.classList.add("active");
        tabAddr.classList.remove("active");
        secInfo.style.display = "block";
        secAddr.style.display = "none";
    });

    tabAddr.addEventListener("click", () => {
        tabAddr.classList.add("active");
        tabInfo.classList.remove("active");
        secInfo.style.display = "none";
        secAddr.style.display = "block";
        fetchAddresses(); 
        
        // LAZY LOAD BẢN ĐỒ: Chờ tab mở ra hoàn toàn (100ms) rồi mới vẽ
        setTimeout(() => {
            if (!map) {
                initMap(); 
            } else {
                map.invalidateSize(); 
            }
        }, 100);
    });
}

// ==========================================
// 2. THÔNG TIN CÁ NHÂN (INFO)
// ==========================================
async function loadProfile() {
    try {
        const res = await fetch("http://localhost:3000/api/profile", {
            headers: { "Authorization": `Bearer ${profileToken}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            document.getElementById("prof-email").value = data.email;
            document.getElementById("prof-name").value = data.full_name;
            document.getElementById("prof-phone").value = data.phone || '';
            document.getElementById("prof-name-display").innerText = data.full_name;
            document.getElementById("prof-avatar").innerText = data.full_name.charAt(0).toUpperCase();
        } else if (res.status === 401 || res.status === 403) {
            const profileLang = localStorage.getItem('besttech_lang') || 'en';
            alert(profileLang === 'vi' ? "Phiên đăng nhập đã hết hạn!" : "Session expired!");
            localStorage.removeItem("token");
            window.location.href = "/pages/user/login.html";
        }
    } catch (error) { 
        document.getElementById("prof-name-display").innerText = "Lỗi kết nối";
    }
}
loadProfile();

const profileUpdateForm = document.getElementById("profile-update-form");
if (profileUpdateForm) {
    profileUpdateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const full_name = document.getElementById("prof-name").value.trim();
        const phone = document.getElementById("prof-phone").value.trim();
        const submitBtn = document.getElementById("btn-save");
        
        const profileLang = localStorage.getItem('besttech_lang') || 'en';
        submitBtn.disabled = true;
        submitBtn.innerText = profileLang === 'vi' ? "Đang lưu..." : "Saving...";

        try {
            const res = await fetch("http://localhost:3000/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${profileToken}` },
                body: JSON.stringify({ full_name, phone })
            });
            const result = await res.json();
            if (res.ok) {
                alert(result.message || (profileLang === 'vi' ? "Cập nhật thành công!" : "Updated successfully!"));
                document.getElementById("prof-name-display").innerText = full_name;
                document.getElementById("prof-avatar").innerText = full_name.charAt(0).toUpperCase();
            } else {
                alert("Lỗi: " + result.error);
            }
        } catch (err) { 
            alert(profileLang === 'vi' ? "Lỗi kết nối máy chủ" : "Server connection error"); 
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = profileLang === 'vi' ? "Lưu thay đổi" : "Save Changes";
        }
    });
}

// ==========================================
// 3. ĐỊA CHỈ (ADDRESS BOOK)
// ==========================================
async function fetchAddresses() {
    const listEl = document.getElementById("address-list");
    if (!listEl) return;
    
    const profileLang = localStorage.getItem('besttech_lang') || 'en';
    const loadingText = profileLang === 'vi' ? 'Đang tải danh sách địa chỉ...' : 'Loading addresses...';
    
    listEl.innerHTML = `<p style="color: #64748b; font-style: italic; text-align: center;">${loadingText}</p>`;
    
    try {
        const res = await fetch("http://localhost:3000/api/profile/addresses", {
            headers: { "Authorization": `Bearer ${profileToken}` }
        });
        if (res.ok) {
            const addresses = await res.json();
            if (addresses.length === 0) {
                const emptyText = profileLang === 'vi' ? 'Bạn chưa có địa chỉ nào. Hãy thêm ở bên dưới!' : 'No addresses found. Add one below!';
                listEl.innerHTML = `<p style="color: #64748b; font-style: italic; background: #fff; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">${emptyText}</p>`;
                return;
            }
            
            const defaultBadge = profileLang === 'vi' ? 'Mặc định' : 'Default';
            const btnSetDefault = profileLang === 'vi' ? 'Đặt Mặc định' : 'Set Default';
            const btnDelete = profileLang === 'vi' ? 'Xóa' : 'Delete';

            listEl.innerHTML = addresses.map(addr => `
                <div style="border: ${addr.is_default ? '2px solid #0046be' : '1px solid #e2e8f0'}; background: ${addr.is_default ? 'linear-gradient(to right, #f0f4fc, #ffffff)' : '#fff'}; padding: 25px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
                    <div style="flex: 1; padding-right: 20px;">
                        <p style="margin: 0 0 10px 0; color: #0f172a; font-size: 1.1rem; font-weight: 600;">${addr.address}</p>
                        ${addr.is_default ? `<span style="background: #0046be; color: white; font-size: 0.75rem; padding: 5px 10px; border-radius: 6px; font-weight: 800;">${defaultBadge}</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 10px;">
                        ${!addr.is_default ? `<button onclick="setDefaultAddress(${addr.id})" style="background: #eef2f7; color: #0046be; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.85rem;">${btnSetDefault}</button>` : ''}
                        <button onclick="deleteAddress(${addr.id})" style="background: #fee2e2; color: #ef4444; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.85rem;">${btnDelete}</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) { 
        const errText = profileLang === 'vi' ? 'Không thể tải danh sách địa chỉ.' : 'Failed to load addresses.';
        listEl.innerHTML = `<p style="color: red; text-align: center;">${errText}</p>`;
    }
}

async function setDefaultAddress(id) {
    try {
        await fetch(`http://localhost:3000/api/profile/addresses/${id}/default`, {
            method: "PUT", headers: { "Authorization": `Bearer ${profileToken}` }
        });
        fetchAddresses();
    } catch (err) { console.error("Error setting default"); }
}

async function deleteAddress(id) {
    const profileLang = localStorage.getItem('besttech_lang') || 'en';
    const confirmMsg = profileLang === 'vi' ? "Bạn có chắc chắn muốn xóa địa chỉ này?" : "Are you sure you want to delete this address?";
    
    if(!confirm(confirmMsg)) return;
    try {
        await fetch(`http://localhost:3000/api/profile/addresses/${id}`, {
            method: "DELETE", headers: { "Authorization": `Bearer ${profileToken}` }
        });
        fetchAddresses();
    } catch (err) { console.error("Error deleting address"); }
}

// ==========================================
// 4. BẢN ĐỒ (MAP)
// ==========================================
let map, marker;

function initMap() {
    const mapEl = document.getElementById('address-map');
    if (!mapEl) return; 

    const defaultLocation = [21.0382, 105.7827]; 
    map = L.map('address-map').setView(defaultLocation, 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    marker = L.marker(defaultLocation, {draggable: true}).addTo(map);

    marker.on('dragend', async function() {
        const pos = marker.getLatLng();
        await reverseGeocode(pos.lat, pos.lng);
    });
}

async function reverseGeocode(lat, lng) {
    const profileLang = localStorage.getItem('besttech_lang') || 'en';
    const finalInput = document.getElementById('final-validated-address');
    if (!finalInput) return;
    
    finalInput.value = profileLang === 'vi' ? "Đang xác thực..." : "Validating...";
    
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        
        if (data && data.display_name) {
            finalInput.value = data.display_name; 
        } else {
            finalInput.value = "";
            alert(profileLang === 'vi' ? "Không thể xác định địa chỉ tại vị trí này." : "Cannot determine address at this location.");
        }
    } catch(err) {
        finalInput.value = "";
        alert(profileLang === 'vi' ? "Lỗi kết nối bản đồ." : "Map connection error.");
    }
}

const btnFindMap = document.getElementById('btn-find-map');
if (btnFindMap) {
    btnFindMap.addEventListener('click', async () => {
        const profileLang = localStorage.getItem('besttech_lang') || 'en';
        const query = document.getElementById('map-search-input').value.trim();
        
        if (!query) {
            return alert(profileLang === 'vi' ? "Vui lòng nhập địa chỉ cần tìm!" : "Please enter an address to search!");
        }

        btnFindMap.innerHTML = "⏳...";

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await res.json();

            if (data && data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                
                map.flyTo([lat, lon], 16);
                marker.setLatLng([lat, lon]);
                
                document.getElementById('final-validated-address').value = data[0].display_name;
            } else {
                alert(profileLang === 'vi' ? "Bản đồ không tìm thấy địa chỉ này! Vui lòng nhập rõ Phường, Quận, Thành phố." : "Address not found! Please be more specific (Ward, District, City).");
                document.getElementById('final-validated-address').value = "";
            }
        } catch (err) {
            alert(profileLang === 'vi' ? "Lỗi tìm kiếm." : "Search error.");
        } finally {
            btnFindMap.innerHTML = profileLang === 'vi' ? "🔍 Tìm Bản Đồ" : "🔍 Find on Map";
        }
    });
}

const btnSaveAddress = document.getElementById('btn-save-address');
if (btnSaveAddress) {
    btnSaveAddress.addEventListener('click', async () => {
        const profileLang = localStorage.getItem('besttech_lang') || 'en';
        const finalAddress = document.getElementById('final-validated-address').value;
        
        if (!finalAddress || finalAddress === "Đang xác thực..." || finalAddress === "Validating...") {
            return alert(profileLang === 'vi' ? "Vui lòng sử dụng bản đồ để ghim một địa chỉ hợp lệ!" : "Please use the map to pin a valid address!");
        }

        try {
            const res = await fetch("http://localhost:3000/api/profile/addresses", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${profileToken}` // Đã sửa triệt để
                },
                body: JSON.stringify({ address: finalAddress, is_default: false })
            });
            
            if (res.ok) {
                alert(profileLang === 'vi' ? "Lưu địa chỉ thành công!" : "Address saved successfully!");
                document.getElementById('map-search-input').value = "";
                document.getElementById('final-validated-address').value = "";
                fetchAddresses();
            } else {
                const data = await res.json();
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert(profileLang === 'vi' ? "Lỗi kết nối máy chủ." : "Server connection error.");
        }
    });
}