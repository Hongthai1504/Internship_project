const token = localStorage.getItem("token");
if (!token) {
    alert(shipperDict[currentLang].alert_login);
    window.location.href = "/pages/user/login.html";
}

// ==========================================
// LÕI TOÁN HỌC & GPS 
// ==========================================
function getCurrentGPS() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) reject(new Error("No GPS"));
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

// CÁC BIẾN TOÀN CỤC & LOCAL STORAGE TRACKING
let allOrdersCache = [];
let currentFilter = "all";
let currentDetailOrder = null;
let shipperMapInstance = null; 
let routingControlInstance = null;
let pendingUpdate = { orderId: null, actionType: null }; 

let pickedUpOrders = JSON.parse(localStorage.getItem('pickedUpOrders') || '[]');

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/pages/user/login.html";
}

function setFilter(status) {
    currentFilter = status;
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        if (btn.getAttribute("data-status") === status) {
            btn.style.background = "#0046be"; btn.style.color = "#fff"; btn.style.border = "none";
            btn.style.boxShadow = "0 4px 10px rgba(0, 70, 190, 0.2)";
        } else {
            btn.style.background = "#fff"; btn.style.color = "#475569"; btn.style.border = "1px solid #cbd5e1";
            btn.style.boxShadow = "none";
        }
    });
    renderTasks();
}

async function fetchTasks() {
    const t = shipperDict[currentLang];
    try {
        const res = await fetch("http://localhost:3000/api/shipper/orders", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load");
        allOrdersCache = await res.json();
        renderTasks();
    } catch (error) {
        document.getElementById("task-list").innerHTML = `<p style="color: red; text-align: center; font-weight: bold; grid-column: 1/-1;">${t.err_server}</p>`;
    }
}

// GIAO DIỆN MASTER VIEW
function renderTasks() {
    const listEl = document.getElementById("task-list");
    const t = shipperDict[currentLang];
    const displayOrders = currentFilter === "all" ? allOrdersCache : allOrdersCache.filter((order) => order.status === currentFilter);

    if (displayOrders.length === 0) {
        listEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8; background: #fff; border-radius: 20px; border: 1px dashed #cbd5e1; font-weight: 800; font-size: 1.2rem;">${t.empty}</div>`;
        return;
    }

    listEl.innerHTML = displayOrders.map((order) => {
        let badgeBg = "#f1f5f9", badgeColor = "#475569";
        if(order.status === 'shipping') { badgeBg = "#eff6ff"; badgeColor = "#2563eb"; }
        else if(order.status === 'completed') { badgeBg = "#ecfdf5"; badgeColor = "#059669"; }
        else if(order.status === 'cancelled') { badgeBg = "#fef2f2"; badgeColor = "#dc2626"; }

        let displayStatus = order.status;
        if(order.status === 'shipping' && !pickedUpOrders.includes(order.id)) {
            displayStatus = "PICKUP";
            badgeBg = "#fefce8"; badgeColor = "#ca8a04";
        }

        return `
        <div class="compact-card" onclick="openDetail(${order.id})">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <div>
                    <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 6px;">SKU: ORD-${order.id}</div>
                    <div style="font-size: 1.2rem; font-weight: 900; color: #0f172a; line-height: 1.3;">${order.full_name || t.lbl_customer}</div>
                </div>
                <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 6px 14px; border-radius: 50px; font-weight: 900; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px;">${displayStatus}</span>
            </div>
            <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600;">
                📍 ${order.shipping_address}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                <span style="font-size: 0.8rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">${t.lbl_cod}</span>
                <strong style="color: #0046be; font-size: 1.4rem; font-weight: 900; letter-spacing: -0.5px;">$${order.total_amount}</strong>
            </div>
        </div>
        `;
    }).join("");
}

// GIAO DIỆN DETAIL VIEW 
function openDetail(orderId) {
    currentDetailOrder = allOrdersCache.find(o => o.id === orderId);
    const t = shipperDict[currentLang];
    const order = currentDetailOrder;
    
    const isShipping = order.status === 'shipping';
    const hasPickedUp = pickedUpOrders.includes(order.id);

    let stepTitle = "";
    let targetAddress = "";
    let stepBadge = "";

    if (isShipping && !hasPickedUp) {
        stepTitle = t.step_1;
        targetAddress = order.store_address || order.shipping_address; 
        stepBadge = `<span style="background: #fefce8; color: #ca8a04; padding: 6px 14px; border-radius: 50px; font-weight: 900; font-size: 0.75rem; display: inline-block;">${t.status_waiting}</span>`;
    } else {
        stepTitle = t.step_2;
        targetAddress = order.shipping_address;
        stepBadge = `<span style="background: #eff6ff; color: #2563eb; padding: 6px 14px; border-radius: 50px; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; display: inline-block;">Status: ${order.status}</span>`;
    }
    
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('view-detail').style.display = 'block';
    document.getElementById('btn-back-text').innerText = (currentLang === 'vi') ? "Quay Lại" : "Back to Tasks";
    document.getElementById('lbl-route-map').innerText = (currentLang === 'vi') ? "Bản Đồ Tuyến Đường" : "Route Map";

    document.getElementById('map-wrapper').innerHTML = `
        <div style="height: 450px; display: flex; justify-content: center; align-items: center; background: #e2e8f0;">
            <button onclick="loadMapInDetail()" class="btn-pill" style="background: #fff; color: #0046be; border: 2px solid #cbd5e1; font-size: 1rem; padding: 14px 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                ${t.btn_load_map}
            </button>
        </div>
    `;

    if (shipperMapInstance !== null) {
        shipperMapInstance.remove();
        shipperMapInstance = null;
        routingControlInstance = null;
    }

    const infoContainer = document.getElementById('detail-info-container');
    infoContainer.innerHTML = `
        <h2 style="margin: 0 0 8px 0; font-size: 2rem; color: #0f172a; font-weight: 900; line-height: 1.2;">${order.full_name || t.lbl_customer}</h2>
        <div style="color: #94a3b8; font-size: 0.9rem; font-weight: 800; margin-bottom: 25px;">SKU: ORD-${order.id}</div>
        
        <div style="font-size: 3.5rem; font-weight: 900; color: #0046be; letter-spacing: -2px; margin-bottom: 30px;">$${order.total_amount}</div>

        <div style="background: #fff; border: 2px solid #f1f5f9; border-radius: 20px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="font-weight: 900; color: #0f172a; font-size: 1.1rem;">${stepTitle}</span>
            </div>
            <div style="margin-bottom: 20px;">${stepBadge}</div>
            
            <div style="background: #f8fafc; padding: 18px; border-radius: 12px; color: #475569; font-size: 0.95rem; font-weight: 600; line-height: 1.6; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                <span style="color: #94a3b8; font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">${t.target_point}</span><br>
                <span style="color:#0f172a; font-size: 1.05rem;">${targetAddress}</span>
            </div>

            ${isShipping ? `
            <button id="btn-start-gps" onclick="activateGPSInDetail()" class="btn-pill" style="width: 100%; background: #fde047; color: #0f172a; padding: 16px; font-size: 1.05rem; box-shadow: 0 4px 15px rgba(253, 224, 71, 0.4);">
                ${t.btn_start_gps}
            </button>
            ` : ''}
        </div>

        ${isShipping ? `
            ${!hasPickedUp ? `
                <button onclick="actionPickup(${order.id})" class="btn-pill" style="width: 100%; background: #0046be; color: #fff; padding: 18px; font-size: 1.1rem; box-shadow: 0 4px 20px rgba(0, 70, 190, 0.3); margin-top: auto;">
                    ${t.btn_pickup}
                </button>
            ` : `
                <div style="display: flex; gap: 15px; margin-top: auto;">
                    <button onclick="actionDelivery(${order.id}, 'cancelled')" class="btn-pill" style="flex: 1; background: #fff; color: #ef4444; border: 2px solid #ef4444; padding: 16px; font-size: 1rem;">
                        ${t.btn_failed}
                    </button>
                    <button onclick="actionDelivery(${order.id}, 'completed')" class="btn-pill" style="flex: 2; background: #10b981; color: #fff; padding: 16px; font-size: 1rem; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);">
                        ${t.btn_deliver}
                    </button>
                </div>
            `}
        ` : ''}
    `;

    setTimeout(() => { loadMapInDetail(); }, 200);
}

function backToList() {
    document.getElementById('view-detail').style.display = 'none';
    document.getElementById('view-list').style.display = 'block';
    currentDetailOrder = null;
    if (shipperMapInstance !== null) {
        shipperMapInstance.remove();
        shipperMapInstance = null;
    }
}

// ==========================================
// BỘ GEOFENCING VÀ XỬ LÝ ẢNH (POD) 
// ==========================================
async function verifyGeofence(orderId, type) {
    const t = shipperDict[currentLang];
    const order = allOrdersCache.find(o => o.id === orderId);
    const targetAddress = type === 'store' ? (order.store_address || order.shipping_address) : order.shipping_address;

    try {
        const geoRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(targetAddress)}&limit=1`);
        const geoData = await geoRes.json();
        if (!geoData || !geoData.features.length) {
            alert(t.gps_not_found);
            return false;
        }
        
        const targetLat = geoData.features[0].geometry.coordinates[1];
        const targetLon = geoData.features[0].geometry.coordinates[0];

        let currentGPS;
        try { currentGPS = await getCurrentGPS(); } 
        catch (e) { alert(t.gps_error); return false; }

        const distance = calculateDistance(currentGPS.lat, currentGPS.lon, targetLat, targetLon);
        if (distance > 0.5) { 
            alert(t.err_distance + `${(distance * 1000).toFixed(0)}m.\n< 500m required.`);
            return false;
        }
        return true; 
    } catch(e) {
        alert(t.err_server); return false;
    }
}

async function actionPickup(orderId) {
    const passed = await verifyGeofence(orderId, 'store');
    if (!passed) return;

    const t = shipperDict[currentLang];
    pendingUpdate = { orderId, actionType: 'pickup' };
    
    document.getElementById("pod-title").innerText = t.pod_title_pickup;
    document.getElementById("pod-img-label").innerText = t.pod_lbl_img;
    document.getElementById("pod-note-label").innerText = t.pod_lbl_note;
    document.getElementById("pod-btn-cancel").innerText = t.pod_btn_cancel;
    document.getElementById("pod-submit-btn").innerText = t.pod_btn_submit;
    
    document.getElementById("pod-image").value = "";
    document.getElementById("pod-note").value = "";
    document.getElementById("pod-modal").style.display = "flex";
}

async function actionDelivery(orderId, status) {
    const passed = await verifyGeofence(orderId, 'customer');
    if (!passed) return;

    const t = shipperDict[currentLang];
    pendingUpdate = { orderId, actionType: status }; 
    
    document.getElementById("pod-title").innerText = (status === 'completed') ? t.pod_title_deliver : t.pod_title_fail;
    document.getElementById("pod-img-label").innerText = t.pod_lbl_img;
    document.getElementById("pod-note-label").innerText = t.pod_lbl_note;
    document.getElementById("pod-btn-cancel").innerText = t.pod_btn_cancel;
    document.getElementById("pod-submit-btn").innerText = t.pod_btn_submit;
    
    document.getElementById("pod-image").value = "";
    document.getElementById("pod-note").value = "";
    document.getElementById("pod-modal").style.display = "flex";
}

function closePodModal() {
    document.getElementById("pod-modal").style.display = "none";
    pendingUpdate = { orderId: null, actionType: null };
}

// UPLOAD ẢNH MULTIPART
async function submitPodData() {
    const { orderId, actionType } = pendingUpdate;
    if (!orderId) return;

    const imageFile = document.getElementById("pod-image").files[0];
    const noteInfo = document.getElementById("pod-note").value.trim();

    if (!imageFile) return alert("Please capture an image!");
    if (actionType === 'cancelled' && !noteInfo) return alert("Please write a note!");

    const btnSubmit = document.getElementById("pod-submit-btn");
    const originalBtnText = btnSubmit.innerText;
    btnSubmit.innerText = "...";
    btnSubmit.disabled = true;

    const formData = new FormData();
    formData.append("action_type", actionType); 
    const apiStatus = (actionType === 'pickup') ? 'shipping' : actionType; 
    formData.append("status", apiStatus);
    formData.append("pod_image", imageFile);
    formData.append("note", noteInfo);

    try {
        const res = await fetch(`http://localhost:3000/api/shipper/orders/${orderId}/status`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }, 
            body: formData
        });
        
        if (res.ok) {
            if (actionType === 'pickup') {
                pickedUpOrders.push(orderId);
                localStorage.setItem('pickedUpOrders', JSON.stringify(pickedUpOrders));
            } else {
                pickedUpOrders = pickedUpOrders.filter(id => id !== orderId);
                localStorage.setItem('pickedUpOrders', JSON.stringify(pickedUpOrders));
                backToList(); 
            }
            
            closePodModal();
            if(actionType === 'pickup') openDetail(orderId); 
            fetchTasks(); 
        } else {
            const data = await res.json();
            alert("Server Error: " + data.error);
        }
    } catch(e) {
        alert("Server connection failed!");
    } finally {
        btnSubmit.innerText = originalBtnText;
        btnSubmit.disabled = false;
    }
}

// ==========================================
// TÍNH TOÁN BẢN ĐỒ & ROUTING 
// ==========================================
function loadMapInDetail() {
    const wrapper = document.getElementById('map-wrapper');
    wrapper.style.display = 'block';
    wrapper.innerHTML = '<div id="actual-map" style="width: 100%; height: 450px; position: relative; z-index: 1;"></div>';

    shipperMapInstance = L.map('actual-map').setView([21.0285, 105.8542], 13);
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(shipperMapInstance);

    setTimeout(() => {
        shipperMapInstance.invalidateSize();
        window.dispatchEvent(new Event('resize'));
    }, 200);

    const hasPickedUp = pickedUpOrders.includes(currentDetailOrder.id);
    const targetAddress = (!hasPickedUp && currentDetailOrder.store_address) ? currentDetailOrder.store_address : currentDetailOrder.shipping_address;
    
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(targetAddress)}&limit=1`)
        .then(res => res.json())
        .then(geoData => {
            if (geoData && geoData.features.length) {
                const tLat = geoData.features[0].geometry.coordinates[1];
                const tLon = geoData.features[0].geometry.coordinates[0];
                shipperMapInstance.setView([tLat, tLon], 15);
                L.marker([tLat, tLon]).addTo(shipperMapInstance).bindPopup("<b style='color:#0f172a; font-family: Nunito;'>📍 " + shipperDict[currentLang].target_point + "</b>").openPopup();
            }
        })
        .finally(() => {
            setTimeout(() => { shipperMapInstance.invalidateSize(); window.dispatchEvent(new Event('resize')); }, 400);
        });
}

async function activateGPSInDetail() {
    const btn = document.getElementById('btn-start-gps');
    const t = shipperDict[currentLang];
    const originalText = btn.innerHTML;
    btn.innerText = t.gps_connecting;
    btn.disabled = true;

    try {
        if (!shipperMapInstance) {
            loadMapInDetail();
            await new Promise(r => setTimeout(r, 600)); 
        }

        const hasPickedUp = pickedUpOrders.includes(currentDetailOrder.id);
        const address = (!hasPickedUp && currentDetailOrder.store_address) ? currentDetailOrder.store_address : currentDetailOrder.shipping_address;

        const geoRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
        const geoData = await geoRes.json();
        
        if (!geoData || !geoData.features.length) {
            btn.innerHTML = originalText; btn.disabled = false;
            return alert(t.gps_not_found);
        }
        const targetLat = geoData.features[0].geometry.coordinates[1];
        const targetLon = geoData.features[0].geometry.coordinates[0];
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const curLat = pos.coords.latitude;
                const curLon = pos.coords.longitude;
                
                shipperMapInstance.eachLayer((layer) => { if (layer instanceof L.Marker) { shipperMapInstance.removeLayer(layer); } });
                if (routingControlInstance) { shipperMapInstance.removeControl(routingControlInstance); }

                routingControlInstance = L.Routing.control({
                    waypoints: [L.latLng(curLat, curLon), L.latLng(targetLat, targetLon)],
                    routeWhileDragging: false, addWaypoints: false, showAlternatives: false,
                    fitSelectedRoutes: true, show: false,
                    lineOptions: { styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }] }
                }).addTo(shipperMapInstance);

                setTimeout(() => { shipperMapInstance.invalidateSize(); window.dispatchEvent(new Event('resize')); }, 300);

                btn.innerText = t.gps_routing;
                btn.style.background = "#10b981";
                btn.style.color = "#fff";
            },
            (err) => {
                btn.innerHTML = originalText; btn.disabled = false;
                alert(t.gps_error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } 
        );
    } catch (error) {
        btn.innerHTML = originalText; btn.disabled = false;
        alert(t.err_server);
    }
}

// Khởi chạy App
fetchTasks();