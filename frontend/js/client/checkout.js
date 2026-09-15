let modalMap, modalMarker;

// Hàm mở Pop-up
function openAddressModal() {
  document.getElementById("checkout-address-modal").style.display = "flex";

  setTimeout(() => {
    if (!modalMap) {
      const defaultLoc = [21.0382, 105.7827];
      modalMap = L.map("modal-map-container").setView(defaultLoc, 15);

      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: "© Google Maps",
        maxZoom: 20,
      }).addTo(modalMap);

      modalMarker = L.marker(defaultLoc, { draggable: true }).addTo(modalMap);

      modalMarker.on("dragend", async function () {
        const pos = modalMarker.getLatLng();
        const finalInput = document.getElementById("modal-final-address");
        finalInput.value = "Đang xác thực...";

        try {
          const res = await fetch(
            `https://photon.komoot.io/reverse?lon=${pos.lng}&lat=${pos.lat}`,
          );

          if (!res.ok) throw new Error(`Lỗi ${res.status}`);
          const data = await res.json();

          if (data && data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            const displayName = [
              props.name,
              props.street,
              props.district,
              props.city,
              props.state,
              props.country,
            ]
              .filter(Boolean)
              .join(", ");
            finalInput.value = displayName;
          } else {
            finalInput.value = "";
            alert("Không nhận diện được địa chỉ tại vị trí này.");
          }
        } catch (err) {
          console.error("Chi tiết lỗi ghim bản đồ:", err);
          finalInput.value = "";
          alert(`Lỗi kết nối bản đồ: ${err.message}`);
        }
      });
    }

    modalMap.invalidateSize();
  }, 500);
}

function closeAddressModal() {
  document.getElementById("checkout-address-modal").style.display = "none";
}

// Chức năng: Tìm kiếm địa chỉ
document
  .getElementById("btn-modal-find")
  .addEventListener("click", async () => {
    const query = document.getElementById("modal-map-search").value.trim();
    if (!query) return alert("Vui lòng nhập địa chỉ!");

    const btn = document.getElementById("btn-modal-find");
    const originalText = btn.innerText;
    btn.innerText = "⏳...";

    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`,
      );

      if (!res.ok) throw new Error(`Máy chủ từ chối (Lỗi ${res.status})`);
      const data = await res.json();

      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];

        const lat = feature.geometry.coordinates[1];
        const lon = feature.geometry.coordinates[0];

        modalMap.flyTo([lat, lon], 16);
        modalMarker.setLatLng([lat, lon]);

        const props = feature.properties;
        const displayName = [
          props.name,
          props.street,
          props.district,
          props.city,
          props.state,
          props.country,
        ]
          .filter(Boolean)
          .join(", ");

        document.getElementById("modal-final-address").value = displayName;
      } else {
        alert(
          "Không tìm thấy địa chỉ này! Vui lòng nhập Quận/Huyện, Tỉnh/Thành phố.",
        );
      }
    } catch (err) {
      console.error("Chi tiết lỗi tìm kiếm:", err);
      alert(
        `Đường truyền bị lỗi: ${err.message}. (Bạn có thể nhấn F12 mở Console để xem chi tiết)`,
      );
    } finally {
      btn.innerText = originalText;
    }
  });

// Chức năng: Bấm nút LƯU
document
  .getElementById("btn-modal-save")
  .addEventListener("click", async () => {
    const finalAddress = document.getElementById("modal-final-address").value;
    if (!finalAddress || finalAddress.includes("Đang xác thực")) {
      return alert("Vui lòng ghim vị trí chuẩn xác trên bản đồ!");
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/profile/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address: finalAddress, is_default: false }),
      });

      if (res.ok) {
        alert("Thêm địa chỉ thành công!");
        closeAddressModal();
        window.location.reload();
      } else {
        alert("Lỗi khi thêm địa chỉ!");
      }
    } catch (err) {
      alert("Mất kết nối máy chủ!");
    }
  });
