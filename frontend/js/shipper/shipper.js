console.log("Shipper.js is loading...");

const mapInstances = {};
async function toggleMap(orderId, address) {
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
    setTimeout(() => mapInstances[orderId].invalidateSize(), 1000);
    btn.innerHTML = t.btn_close_map;
    return;
  }

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`,
    );
    if (!res.ok) throw new Error("API bị chặn");
    const data = await res.json();

    if (data && data.features && data.features.length > 0) {
      const lat = data.features[0].geometry.coordinates[1];
      const lon = data.features[0].geometry.coordinates[0];

      const map = L.map(`map-container-${orderId}`).setView([lat, lon], 16);
      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: "© Google Maps",
        maxZoom: 20,
      }).addTo(map);

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(
          `<strong style="color:#0046be;">Giao đến:</strong><br>${address}`,
        )
        .openPopup();

      mapInstances[orderId] = map;
      btn.innerHTML = t.btn_close_map;

      setTimeout(() => {
        map.invalidateSize();
      }, 1000);
    } else {
      mapContainer.style.height = "auto";
      mapContainer.style.padding = "15px";
      mapContainer.innerHTML = `<p style='color: #ef4444; font-size: 0.9rem; margin:0; font-weight: bold;'>${t.err_map_not_found}</p>`;
      btn.innerHTML = t.btn_close_map;
    }
  } catch (err) {
    console.error("Lỗi bản đồ Shipper:", err);
    mapContainer.style.height = "0px";
    alert(t.err_server);
    btn.innerHTML = t.btn_view_map;
  }
}

let routingControl = null;

function drawRoute(shipperLat, shipperLon, targetLat, targetLon) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(shipperLat, shipperLon), 
            L.latLng(targetLat, targetLon)   
        ],
        routeWhileDragging: false,
        addWaypoints: false, 
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
            styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }]
        },
        show: false 
    }).addTo(map);
}

function startDeliveryTracking(targetLat, targetLon) {
    if (!navigator.geolocation) {
        alert("Trình duyệt của bạn không hỗ trợ định vị GPS.");
        return;
    }

    navigator.geolocation.watchPosition(
        (position) => {
            const currentLat = position.coords.latitude;
            const currentLon = position.coords.longitude;
            drawRoute(currentLat, currentLon, targetLat, targetLon);
        },
        (error) => {
            console.error("Lỗi truy xuất GPS:", error.message);
            alert("Vui lòng cấp quyền truy cập vị trí để hệ thống có thể dẫn đường!");
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000, 
            timeout: 5000
        }
    );
}

document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById('shipper-map')) {
        const map = L.map('shipper-map').setView([21.0285, 105.8542], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        window.map = map; 
    }
});