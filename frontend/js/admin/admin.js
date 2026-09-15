const token = localStorage.getItem("token");

if (!token) {
  alert("Access Denied! Please log in first.");
  window.location.href = "/index.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/index.html";
}

let categoryMap = {};

async function fetchCategoriesForAdmin() {
  try {
    const res = await fetch("http://localhost:3000/api/categories");
    const categories = await res.json();

    categories.forEach((cat) => {
      if (cat.parent_id !== null) {
        const parentId = cat.parent_id.toString();
        if (!categoryMap[parentId]) {
          categoryMap[parentId] = [];
        }
        categoryMap[parentId].push({ id: cat.id, name: cat.name });
      }
    });
  } catch (error) {
    console.error("Error loading category:", error);
  }
}
fetchCategoriesForAdmin();

const mainCategorySelect = document.getElementById("main_category");
const subCategorySelect = document.getElementById("category_id");

if (mainCategorySelect && subCategorySelect) {
  mainCategorySelect.addEventListener("change", function () {
    const selectedParent = this.value;
    subCategorySelect.innerHTML =
      '<option value="">-- Chọn danh mục con --</option>';

    if (selectedParent && categoryMap[selectedParent]) {
      subCategorySelect.disabled = false;
      categoryMap[selectedParent].forEach((subCat) => {
        const option = document.createElement("option");
        option.value = subCat.id;
        option.textContent = subCat.name;
        subCategorySelect.appendChild(option);
      });
    } else {
      subCategorySelect.disabled = true;
    }
  });
}

// NEW FEATURE: MEDIA LIBRARY MANAGER (WITH FOLDERS)
let currentMediaTarget = null;
let libraryMediaCache = [];
let temporarySelection = [];

let currentFolderId = null; // null = All, 'unassigned' = No Folder, number = Folder ID
let libraryFolders = [];

let formState = {
  add: [],
  edit: [],
};

const mediaModal = document.getElementById("media-library-modal"); // Sửa lại ID theo HTML mới
const mediaGrid = document.getElementById("media-grid");
const mediaCountText = document.getElementById("selected-count"); // Sửa lại ID theo HTML mới
const folderList = document.getElementById("media-folder-list"); // Sửa lại ID theo HTML mới
const currentFolderLabel = document.getElementById("current-folder-title"); // Sửa lại ID theo HTML mới

function openMediaManager(target) {
  currentMediaTarget = target;
  temporarySelection = [...formState[target]];
  if (mediaModal) mediaModal.style.display = "flex";

  currentFolderId = null;
  if (currentFolderLabel) currentFolderLabel.innerText = "All Media";

  // Clear search box
  const searchInput = document.getElementById("media-search-input");
  if (searchInput) searchInput.value = "";

  fetchFolders();
  fetchMediaLibrary();
}

const closeMediaBtn = document.getElementById("close-media-modal");
if (closeMediaBtn) {
  closeMediaBtn.addEventListener("click", () => {
    if (mediaModal) mediaModal.style.display = "none";
  });
}

// -- FOLDER LOGIC --
async function fetchFolders() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/media/folders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      libraryFolders = await res.json();
      renderFolders();
    }
  } catch (err) {
    console.error("Error fetching folders");
  }
}

const btnCreateFolder = document.getElementById("btn-create-folder");
if (btnCreateFolder) {
  btnCreateFolder.addEventListener("click", async () => {
    const nameInput = document.getElementById("new-folder-name");
    const name = nameInput.value.trim();
    if (!name) return alert("Vui lòng nhập tên thư mục!");

    let parent_id = null;
    if (typeof currentFolderId === "number") {
      parent_id = currentFolderId;
    }

    try {
      const res = await fetch("http://localhost:3000/api/admin/media/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, parent_id }),
      });
      if (res.ok) {
        nameInput.value = "";
        fetchFolders();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert("Error creating folder");
    }
  });
}

async function deleteFolder(event, folderId, folderName) {
  event.stopPropagation();
  if (
    !confirm(
      `Bạn có chắc muốn xóa thư mục "${folderName}"?\nToàn bộ ảnh bên trong sẽ bị đẩy ra 'Unassigned'.`,
    )
  )
    return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/admin/media/folders/${folderId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      if (currentFolderId === folderId) selectFolder(null, "All Media");
      fetchFolders();
      fetchMediaLibrary();
    } else {
      alert("Error deleting folder.");
    }
  } catch (err) {
    alert("Server error.");
  }
}

function selectFolder(id, name) {
  currentFolderId = id;
  if (currentFolderLabel) currentFolderLabel.innerText = name;
  renderFolders();
  fetchMediaLibrary();
}

function renderFolders() {
  if (!folderList) return;

  let html = `
        <li class="folder-item" onclick="selectFolder(null, 'All Media')" style="padding: 14px 18px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: ${currentFolderId === null ? "800" : "600"}; background: ${currentFolderId === null ? "#e0e7ff" : "transparent"}; color: ${currentFolderId === null ? "#0046be" : "#475569"}; transition: all 0.2s;">
            <svg width="22" height="22" fill="#f59e0b" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            All Media
        </li>
        <li class="folder-item" onclick="selectFolder('unassigned', 'Unassigned')" style="padding: 14px 18px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: ${currentFolderId === "unassigned" ? "800" : "600"}; background: ${currentFolderId === "unassigned" ? "#e0e7ff" : "transparent"}; color: ${currentFolderId === "unassigned" ? "#0046be" : "#475569"}; transition: all 0.2s;">
            <svg width="22" height="22" fill="#f59e0b" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            Unassigned
        </li>
        <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 10px 0;">
    `;

  const buildTree = (parentId, level) => {
    const children = libraryFolders.filter((f) => f.parent_id === parentId);
    children.forEach((f) => {
      const isActive = currentFolderId === f.id;
      const paddingLeft = 18 + level * 25;

      html += `
            <li class="folder-item" onclick="selectFolder(${f.id}, '${f.name.replace(/'/g, "\\'")}')" style="padding: 10px 18px 10px ${paddingLeft}px; border-radius: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: ${isActive ? "800" : "600"}; background: ${isActive ? "#e0e7ff" : "transparent"}; color: ${isActive ? "#0046be" : "#475569"}; transition: all 0.2s;">
                <div style="display: flex; align-items: center; gap: 12px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    <svg width="20" height="20" fill="${level > 0 ? "#fbbf24" : "#f59e0b"}" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                    ${f.name}
                </div>
                <button onclick="deleteFolder(event, ${f.id}, '${f.name}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem; display: ${isActive ? "block" : "none"};" title="Delete folder">&times;</button>
            </li>`;

      buildTree(f.id, level + 1);
    });
  };

  buildTree(null, 0);

  folderList.innerHTML = html;
}

// -- MEDIA LOGIC --
async function fetchMediaLibrary() {
  try {
    let url = "http://localhost:3000/api/admin/media";
    if (currentFolderId !== null) {
      url += `?folder_id=${currentFolderId}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      libraryMediaCache = await res.json();
      renderMediaGrid();
    }
  } catch (err) {
    mediaGrid.innerHTML = `<p style="color: red;">Failed to load library.</p>`;
  }
}

const searchInputEl = document.getElementById("media-search-input");
if (searchInputEl) {
  searchInputEl.addEventListener("input", () => {
    renderMediaGrid(searchInputEl.value.toLowerCase());
  });
}

function renderMediaGrid(searchQuery = "") {
  if (libraryMediaCache.length === 0) {
    mediaGrid.innerHTML = `
            <div style="text-align: center; color: #94a3b8; width: 100%;">
                <svg width="100" height="100" fill="#cbd5e1" viewBox="0 0 24 24" style="margin-bottom: 20px;"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                <h3 style="margin: 0 0 8px 0; color: #475569; font-size: 1.4rem; font-weight: 800;">This folder is empty.</h3>
                <p style="margin: 0; font-size: 1.05rem;">Select files and click upload to get started.</p>
            </div>`;
    if (mediaCountText) mediaCountText.innerText = temporarySelection.length;
    return;
  }

  const filteredMedia = libraryMediaCache.filter((m) =>
    m.file_name.toLowerCase().includes(searchQuery),
  );

  if (filteredMedia.length === 0) {
    mediaGrid.innerHTML = `<p style="color: #64748b; font-style: italic; width: 100%; text-align: center;">No images match your search.</p>`;
    return;
  }

  // Grid CSS for Modern UI
  mediaGrid.style.display = "grid";
  mediaGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 1fr))";
  mediaGrid.style.gap = "20px";
  mediaGrid.style.alignItems = "start";

  mediaGrid.innerHTML = filteredMedia
    .map((media) => {
      const isSelected = temporarySelection.includes(media.file_url);
      return `
        <div style="position: relative; border-radius: 12px; overflow: hidden; cursor: pointer; border: 3px solid ${isSelected ? "#0046be" : "transparent"}; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: transform 0.2s;" onclick="toggleMediaSelection('${media.file_url}')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
            <button onclick="deleteMediaItem(event, ${media.id})" style="position: absolute; top: 8px; right: 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer; z-index: 10; opacity: ${isSelected ? "1" : "0"}; transition: opacity 0.2s;" class="del-btn">&times;</button>
            <div style="height: 120px; background: #fff; display: flex; justify-content: center; align-items: center; padding: 10px;">
                <img src="${media.file_url}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <div style="background: #f1f5f9; padding: 10px; font-size: 0.8rem; color: #475569; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;">
                ${media.file_name}
            </div>
            ${isSelected ? '<div style="position: absolute; top: 8px; left: 8px; background: #0046be; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">✓</div>' : ""}
        </div>`;
    })
    .join("");

  // Hiển thị nút xóa khi hover vào ảnh
  document.querySelectorAll("#media-grid > div").forEach((div) => {
    div.addEventListener(
      "mouseenter",
      () => (div.querySelector(".del-btn").style.opacity = "1"),
    );
    div.addEventListener("mouseleave", () => {
      if (div.style.borderColor === "transparent")
        div.querySelector(".del-btn").style.opacity = "0";
    });
  });

  if (mediaCountText) mediaCountText.innerText = temporarySelection.length;
}

function toggleMediaSelection(url) {
  const index = temporarySelection.indexOf(url);
  if (index === -1) {
    temporarySelection.push(url);
  } else {
    temporarySelection.splice(index, 1);
  }
  renderMediaGrid(
    document.getElementById("media-search-input").value.toLowerCase(),
  );
}

async function deleteMediaItem(event, mediaId) {
  event.stopPropagation();
  if (
    !confirm(
      "Are you sure you want to permanently delete this image from the Library?",
    )
  )
    return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/admin/media/${mediaId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      fetchMediaLibrary();
    } else {
      const data = await res.json();
      alert("Error: " + data.error);
    }
  } catch (err) {
    alert("Failed to delete image.");
  }
}

const btnConfirmMedia = document.getElementById("btn-confirm-media");
if (btnConfirmMedia) {
  btnConfirmMedia.addEventListener("click", () => {
    formState[currentMediaTarget] = [...temporarySelection];

    const container = document.getElementById(
      `${currentMediaTarget}-selected-images`,
    );
    if (formState[currentMediaTarget].length === 0) {
      container.innerHTML = `<p style="color: #888; font-size: 0.9rem; margin: 0; font-style: italic;">No images selected.</p>`;
    } else {
      container.innerHTML = formState[currentMediaTarget]
        .map(
          (url, i) => `
                <div style="position: relative; display: inline-block; margin-right: 10px;">
                    <img src="${url}" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #c8c8c8; border-radius: 8px; padding: 5px; background: #fff;">
                    ${i === 0 ? '<span style="position:absolute; bottom: 5px; left: 5px; background: #ef4444; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 4px;">MAIN</span>' : ""}
                </div>
            `,
        )
        .join("");
    }
    if (mediaModal) mediaModal.style.display = "none";
  });
}

// Fix logic Upload file để nhận đúng ID HTML
const btnUploadMedia = document.getElementById("btn-upload-media");
const mediaFileInput = document.getElementById("media-file-input");

if (mediaFileInput) {
  mediaFileInput.addEventListener("change", function () {
    const textElement = document.getElementById("file-chosen-text");
    if (textElement) {
      textElement.innerText =
        this.files.length > 0
          ? `${this.files.length} file(s) selected`
          : "No files";
      textElement.style.color = this.files.length > 0 ? "#0046be" : "#64748b";
    }
  });
}

if (btnUploadMedia) {
  btnUploadMedia.addEventListener("click", async () => {
    if (!mediaFileInput || mediaFileInput.files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < mediaFileInput.files.length; i++) {
      formData.append("images", mediaFileInput.files[i]);
    }

    if (currentFolderId && currentFolderId !== "unassigned") {
      formData.append("folder_id", currentFolderId);
    }

    btnUploadMedia.innerText = "Uploading...";
    btnUploadMedia.disabled = true;

    try {
      const res = await fetch("http://localhost:3000/api/admin/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        mediaFileInput.value = "";
        if (document.getElementById("file-chosen-text"))
          document.getElementById("file-chosen-text").innerText = "No files";
        fetchMediaLibrary();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      btnUploadMedia.innerText = "Upload";
      btnUploadMedia.disabled = false;
    }
  });
}

// ==========================================
// FORM SUBMISSIONS (JSON Payload)
// ==========================================
const addProductionForm = document.getElementById("add-product-form");

if (addProductionForm) {
  addProductionForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const payload = {
      category_id: document.getElementById("category_id").value,
      name: document.getElementById("name").value.trim(),
      brand: document.getElementById("brand").value.trim(),
      sku: document.getElementById("sku").value.trim(),
      price: parseFloat(document.getElementById("price").value),
      stock: parseInt(document.getElementById("stock").value) || 0,
      description: document.getElementById("description").value.trim(),
      specifications: gatherSpecs("add"),
      main_image: formState.add.length > 0 ? formState.add[0] : null,
      extra_images: formState.add.length > 1 ? formState.add.slice(1) : [],
    };

    try {
      const response = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Product added successfully!");
        addProductionForm.reset();
        formState.add = [];
        document.getElementById("add-selected-images").innerHTML = "";
        fetchAdminProducts();
      } else {
        alert("Failed to add product: " + data.error);
      }
    } catch (error) {
      alert("Server error: " + error.message);
    }
  });
}

// ADMIN DASHBOARD PANELS
const adminOrdersContainer = document.getElementById("admin-orders-container");
const adminCustomerList = document.getElementById("admin-customer-list");

if (adminCustomerList) {
  async function fetchAdminCustomers() {
    const t = adminDict[currentAdminLang];
    try {
      const res = await fetch("http://localhost:3000/api/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customers = await res.json();

      let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
            <tr style="background: #f0f2f4; border-bottom: 2px solid #c8c8c8;">
                <th style="padding: 15px;">${t.th_id}</th><th style="padding: 15px;">${t.th_fullname}</th>
                <th style="padding: 15px;">${t.th_email}</th><th style="padding: 15px;">${t.th_phone}</th>
                <th style="padding: 15px;">${t.th_role}</th><th style="padding: 15px; text-align: center;">${t.th_action}</th>
            </tr>`;

      customers.forEach((c) => {
        const getRoleBgColor = (role) =>
          role === "admin"
            ? "#bfdbfe"
            : role === "shipper"
              ? "#fef08a"
              : "#f1f5f9";
        let roleDropdown = `<select id="role-${c.id}" style="padding: 8px 12px; border-radius: 6px; font-weight: bold; border: 1px solid #cbd5e1; outline: none; background-color: ${getRoleBgColor(c.role)}; cursor: pointer;">`;
        ["user", "shipper", "admin"].forEach((r) => {
          roleDropdown += `<option value="${r}" ${c.role.toLowerCase() === r ? "selected" : ""} style="background: #fff; color: #0f172a;">${r.toUpperCase()}</option>`;
        });
        roleDropdown += `</select>`;

        html += `<tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${c.id}</td>
            <td style="padding: 15px; font-weight: 800; color: #0f172a;">${c.full_name}</td>
            <td style="padding: 15px; color: #475569;">${c.email}</td><td style="padding: 15px; color: #475569; font-weight: 600;">${c.phone || "-"}</td>
            <td style="padding: 15px;">${roleDropdown}</td>
            <td style="padding: 15px; text-align: center; display: flex; gap: 8px; justify-content: center;">
                <button onclick="updateUserRole(${c.id})" style="background: #0046be; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">${t.btn_save_role}</button>
                <button onclick="deleteUserAccount(${c.id})" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">${t.btn_delete_user}</button>
            </td></tr>`;
      });
      html += `</table>`;
      adminCustomerList.innerHTML = html;
    } catch (error) {
      adminCustomerList.innerHTML = `<p style="color: red;">Lỗi tải dữ liệu!</p>`;
    }
  }

  fetchAdminCustomers();
}

async function updateUserRole(userId) {
  const selectElement = document.getElementById(`role-${userId}`);
  const newRole = selectElement.value;

  if (
    !confirm(
      `Bạn có chắc chắn muốn thay đổi quyền của tài khoản #${userId} thành ${newRole.toUpperCase()} không?`,
    )
  ) {
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/admin/customers/${userId}/role`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      },
    );

    const data = await res.json();

    if (res.ok) {
      alert("✅ Cập nhật quyền thành công!");
      if (newRole === "admin") selectElement.style.backgroundColor = "#bfdbfe";
      else if (newRole === "shipper")
        selectElement.style.backgroundColor = "#fef08a";
      else selectElement.style.backgroundColor = "#f1f5f9";
    } else {
      alert("❌ Lỗi: " + data.error);
    }
  } catch (error) {
    alert("❌ Lỗi kết nối đến máy chủ.");
  }
}

const adminProductList = document.getElementById("admin-product-list");
let globalAdminProducts = [];

async function fetchAdminProducts() {
  if (!adminProductList) return;
  try {
    const [resProducts, resCategories] = await Promise.all([
      fetch("http://localhost:3000/api/products?limit=1000"),
      fetch("http://localhost:3000/api/categories"),
    ]);

    const productsResponse = await resProducts.json();
    const categories = await resCategories.json();
    const products = productsResponse.data || productsResponse;
    globalAdminProducts = products;

    const categoryDict = {};
    categories.forEach((c) => (categoryDict[c.id] = c.name));

    const groupedProducts = {};
    products.forEach((p) => {
      const catName = categoryDict[p.category_id] || "Other";
      if (!groupedProducts[catName]) groupedProducts[catName] = [];
      groupedProducts[catName].push(p);
    });

    const sortedCategoryNames = Object.keys(groupedProducts).sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });

    let html = "";
    if (products.length === 0) {
      html =
        '<p style="color: #666;">No products available in the system yet.</p>';
    } else {
      sortedCategoryNames.forEach((catName) => {
        html += `
        <div style="margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
            <div onclick="toggleAccordion(this)" style="padding: 15px 20px; background: #f8fafc; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-radius: 10px; transition: background 0.3s ease;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
                <h3 style="margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #0046be;">📁</span> ${catName}
                    <span style="background: #e0e6ef; color: #555; padding: 3px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-left: 5px;">
                        ${groupedProducts[catName].length} items
                    </span>
                </h3>
                <span class="acc-icon" style="transition: transform 0.3s ease; color: #64748b; font-size: 0.9rem;">▼</span>
            </div>
            
            <div class="accordion-content" style="display: none; padding: 20px; border-top: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; margin-bottom: 10px;">
                    <tr style="background: #f0f2f4; border-bottom: 2px solid #c8c8c8;">
                        <th style="padding: 15px; width: 80px;">Image</th>
                        <th style="padding: 15px;">Product</th>
                        <th style="padding: 15px; width: 150px;">Price / Stock</th>
                        <th style="padding: 15px; width: 180px;">Action</th>
                    </tr>`;

        groupedProducts[catName].forEach((p) => {
          const imgSrc = p.image_url || "https://via.placeholder.com/50";
          html += `
                    <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 15px;">
                            <img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; border: 1px solid #eee; padding: 2px;">
                        </td>
                        <td style="padding: 15px; font-weight: 500; color: #040c13;">
                            ${p.brand ? '<strong style="color: #0046be;">' + p.brand + "</strong> " : ""}${p.name}
                            <br>
                            <small style="color: #666; font-weight: normal;">SKU: ${p.sku || "N/A"}</small>
                        </td>
                        <td style="padding: 15px; color: #0046be; font-weight: 900;">
                            $${p.price}
                            <br>
                            <small style="color: ${p.stock > 0 ? "#059669" : "#ef4444"}; font-weight: bold;">
                                Stock: ${p.stock}
                            </small>
                        </td>
                        <td style="padding: 15px;">
                            <button onclick="openEditModal(${p.id})" style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 5px;">Edit</button>
                            <button onclick="deleteProduct(${p.id})" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Delete</button>
                        </td>
                    </tr>`;
        });

        html += `
                </table>
            </div>
        </div>`;
      });
    }
    adminProductList.innerHTML = html;
  } catch (error) {
    adminProductList.innerHTML = `<p style="color: red;">Error loading products: ${error.message}</p>`;
  }
}

async function deleteProduct(productId) {
  if (
    !confirm(
      "This action cannot be undone! Are you sure you want to delete this product?",
    )
  )
    return;
  try {
    const res = await fetch(
      `http://localhost:3000/api/admin/products/${productId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (res.ok) fetchAdminProducts();
    else alert("Error: " + data.error);
  } catch (error) {
    alert("System error.");
  }
}

// ==========================================
// EDIT MODAL LOGIC
// ==========================================
const editModal = document.getElementById("edit-product-modal");
const editForm = document.getElementById("edit-product-form");

function openEditModal(productId) {
  const product = globalAdminProducts.find((p) => p.id === productId);
  if (!product) return;

  document.getElementById("edit-product-id").value = product.id;
  document.getElementById("edit-name").value = product.name;
  document.getElementById("edit-brand").value = product.brand || "";
  document.getElementById("edit-sku").value = product.sku || "";
  document.getElementById("edit-price").value = product.price;
  document.getElementById("edit-stock").value = product.stock || 0;
  document.getElementById("edit-category-id").value = product.category_id;

  document.getElementById("edit-description").value = product.description || "";

  const editSpecsContainer = document.getElementById("edit-specs-container");
  if (editSpecsContainer) {
    editSpecsContainer.innerHTML = "";

    let specs = product.specifications;
    if (typeof specs === "string") {
      try {
        specs = JSON.parse(specs);
      } catch (e) {
        specs = null;
      }
    }

    if (specs && Array.isArray(specs)) {
      specs.forEach((s) => addSpecRow("edit", s.group, s.name, s.value));
    }
  }

  formState.edit =
    product.all_images && product.all_images.length > 0
      ? [...product.all_images]
      : product.image_url
        ? [product.image_url]
        : [];

  currentMediaTarget = "edit";

  temporarySelection = [...formState.edit];

  confirmMediaSelection();

  if (editModal) editModal.style.display = "flex";
}

function closeEditModal() {
  if (editModal) editModal.style.display = "none";
}

if (editForm) {
  editForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const productId = document.getElementById("edit-product-id").value;

    const payload = {
      category_id: document.getElementById("edit-category-id").value,
      name: document.getElementById("edit-name").value.trim(),
      brand: document.getElementById("edit-brand").value.trim(),
      sku: document.getElementById("edit-sku").value.trim(),
      price: parseFloat(document.getElementById("edit-price").value),
      stock: parseInt(document.getElementById("edit-stock").value) || 0,

      description: document.getElementById("edit-description").value.trim(),

      specifications: gatherSpecs("edit"),
      main_image: formState.edit.length > 0 ? formState.edit[0] : null,
      extra_images: formState.edit.length > 1 ? formState.edit.slice(1) : [],
    };

    const submitBtn = editForm.querySelector("button[type='submit']");
    submitBtn.innerText = "Saving...";
    submitBtn.disabled = true;

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        closeEditModal();
        fetchAdminProducts();
      } else {
        alert("Failed to update: " + data.error);
      }
    } catch (error) {
      alert("Server connection error.");
    } finally {
      submitBtn.innerText = "Save Changes";
      submitBtn.disabled = false;
    }
  });
}

// DYNAMIC SPECIFICATIONS LOGIC
function addSpecRow(target, group = "", name = "", value = "") {
  const container = document.getElementById(`${target}-specs-container`);
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "10px";
  row.className = "spec-row";

  row.innerHTML = `
        <input type="text" placeholder="Group (e.g. Display)" value="${group}" class="spec-group" style="flex: 1; padding: 8px; border: 1px solid #c8c8c8; border-radius: 4px;">
        <input type="text" placeholder="Spec Name (e.g. Resolution)" value="${name}" class="spec-name" style="flex: 1.5; padding: 8px; border: 1px solid #c8c8c8; border-radius: 4px;">
        <input type="text" placeholder="Value (e.g. 4K UHD)" value="${value}" class="spec-value" style="flex: 2; padding: 8px; border: 1px solid #c8c8c8; border-radius: 4px;">
        <button type="button" onclick="this.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 0 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">X</button>
    `;
  container.appendChild(row);
}

function gatherSpecs(target) {
  const container = document.getElementById(`${target}-specs-container`);
  const rows = container.querySelectorAll(".spec-row");
  const specs = [];
  rows.forEach((row) => {
    const group = row.querySelector(".spec-group").value.trim();
    const name = row.querySelector(".spec-name").value.trim();
    const value = row.querySelector(".spec-value").value.trim();
    if (name && value) {
      specs.push({ group: group || "General", name, value });
    }
  });
  return specs.length > 0 ? specs : null;
}

// Tải thời gian Sale hiện tại khi vừa vào trang Admin
async function loadFlashSaleSettings() {
  try {
    const res = await fetch("http://localhost:3000/api/settings/flash-sale");
    const data = await res.json();

    if (data.end_time) {
      const dateObj = new Date(data.end_time);
      const localISO = new Date(
        dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
      document.getElementById("admin-flash-sale-time").value = localISO;
    }

    const activeCheckbox = document.getElementById("admin-flash-sale-active");
    if (activeCheckbox) activeCheckbox.checked = data.is_active === "true";
  } catch (e) {
    console.error(e);
  }
}

async function updateFlashSaleTime() {
  const timeInput = document.getElementById("admin-flash-sale-time");
  const activeInput = document.getElementById("admin-flash-sale-active");

  if (!timeInput)
    return alert("Lỗi: Không tìm thấy ô nhập thời gian trong HTML!");

  const timeVal = timeInput.value;
  // Bắt trạng thái của nút Checkbox (đã tick hay chưa)
  const isActive = activeInput ? activeInput.checked : false;

  if (!timeVal) return alert("Vui lòng chọn ngày giờ kết thúc!");

  const token = localStorage.getItem("token");
  try {
    const btnSave = document.querySelector(
      "button[onclick='updateFlashSaleTime()']",
    );
    if (btnSave) btnSave.innerText = "Saving...";

    const res = await fetch(
      "http://localhost:3000/api/admin/settings/flash-sale",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          end_time: new Date(timeVal).toISOString(),
          is_active: isActive,
        }),
      },
    );

    const data = await res.json();
    if (res.ok) alert("✅ " + data.message);
    else alert("❌ Lỗi: " + data.error);

    if (btnSave) btnSave.innerText = "Save Changes";
  } catch (e) {
    alert("❌ Lỗi kết nối tới máy chủ Database!");
  }
}

// SHIPPING SETTINGS LOGIC
async function loadShippingSettings() {
  try {
    const res = await fetch("http://localhost:3000/api/settings/shipping");
    const data = await res.json();

    if (data) {
      const baseInput = document.getElementById("admin-ship-base");
      const freeInput = document.getElementById("admin-ship-free");
      if (baseInput) baseInput.value = data.base_fee || 0;
      if (freeInput) freeInput.value = data.free_threshold || 0;
    }
  } catch (e) {
    console.error("Lỗi tải thông số giao hàng:", e);
  }
}

async function updateShippingSettings() {
  const baseInput = document.getElementById("admin-ship-base");
  const freeInput = document.getElementById("admin-ship-free");

  if (!baseInput || !freeInput) return;

  const base_fee = parseFloat(baseInput.value) || 0;
  const free_threshold = parseFloat(freeInput.value) || 0;
  const token = localStorage.getItem("token");

  try {
    const btnSave = document.querySelector(
      "button[onclick='updateShippingSettings()']",
    );
    if (btnSave) btnSave.innerText = "Saving...";

    const res = await fetch(
      "http://localhost:3000/api/admin/settings/shipping",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ base_fee, free_threshold }),
      },
    );

    const data = await res.json();
    if (res.ok) alert("✅ Cấu hình phí giao hàng đã được cập nhật thành công!");
    else alert("❌ Lỗi: " + data.error);

    if (btnSave) {
      const currentLang = localStorage.getItem("besttech_admin_lang") || "en";
      btnSave.innerText =
        currentLang === "vi" ? "Lưu Thay Đổi" : "Save Changes";
    }
  } catch (e) {
    alert("❌ Lỗi kết nối tới máy chủ Database!");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("admin-flash-sale-time")) {
    loadFlashSaleSettings();
  }
  if (document.getElementById("admin-ship-base")) {
    loadShippingSettings();
  }
});

// AI GENERATE DESCRIPTION LOGIC
const btnAiGenerate = document.getElementById("btn-ai-generate");
const descTextarea = document.getElementById("description");

if (btnAiGenerate && descTextarea) {
  btnAiGenerate.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();

    if (!name) {
      alert("Vui lòng nhập ít nhất 'Tên sản phẩm' trước khi sử dụng AI.");
      document.getElementById("name").focus();
      return;
    }

    const brand = document.getElementById("brand").value.trim();
    const price = document.getElementById("price").value;
    const categorySelect = document.getElementById("category_id");
    const category =
      categorySelect.options[categorySelect.selectedIndex]?.text || "";

    const specs = gatherSpecs("add");

    const originalText = btnAiGenerate.innerHTML;
    btnAiGenerate.innerHTML = "⏳ Generating...";
    btnAiGenerate.disabled = true;
    btnAiGenerate.style.opacity = "0.7";

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:3000/api/admin/ai/generate-description",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, brand, price, category, specs }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        descTextarea.value = data.description;
        descTextarea.style.border = "2px solid #ffe000";
        setTimeout(
          () => (descTextarea.style.border = "1px solid #c8c8c8"),
          2000,
        );
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (err) {
      alert("Lỗi kết nối đến máy chủ AI.");
    } finally {
      btnAiGenerate.innerHTML = originalText;
      btnAiGenerate.disabled = false;
      btnAiGenerate.style.opacity = "1";
    }
  });
}

// Hàm gửi API Xóa Tài khoản
async function deleteUserAccount(userId) {
  // Hỏi xác nhận kỹ càng vì đây là hành động nguy hiểm
  if (
    !confirm(
      `⚠️ CẢNH BÁO: Bạn có CHẮC CHẮN muốn XÓA VĨNH VIỄN tài khoản #${userId} không?\nHành động này không thể hoàn tác!`,
    )
  ) {
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/admin/customers/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      alert("✅ " + data.message);
      fetchAdminCustomers(); // Tải lại bảng ngay lập tức để dòng đó biến mất
    } else {
      alert("❌ Lỗi: " + data.error);
    }
  } catch (error) {
    alert("❌ Lỗi kết nối đến máy chủ.");
  }
}

function toggleAccordion(headerElement) {
  const content = headerElement.nextElementSibling;
  const icon = headerElement.querySelector(".acc-icon");

  if (content.style.display === "none") {
    content.style.display = "block";
    icon.style.transform = "rotate(180deg)";
    headerElement.style.borderBottomLeftRadius = "0";
    headerElement.style.borderBottomRightRadius = "0";
    headerElement.style.backgroundColor = "#e0e7ff";
  } else {
    content.style.display = "none";
    icon.style.transform = "rotate(0deg)";
    headerElement.style.borderRadius = "10px";
    headerElement.style.backgroundColor = "#f8fafc";
  }
}

// ADMIN DASHBOARD PANELS (ORDER MANAGEMENT)
let globalShippers = [];

async function fetchAdminOrders() {
  try {
    const shipperRes = await fetch("http://localhost:3000/api/admin/shippers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (shipperRes.ok) {
      globalShippers = await shipperRes.json();
    }

    const res = await fetch("http://localhost:3000/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Unable to load order data.");
    const orders = await res.json();

    renderAdminOrders(orders);
  } catch (error) {
    console.error(error);
    alert("Lỗi tải dữ liệu đơn hàng: " + error.message);
  }
}

function renderAdminOrders(allOrders) {
  const t = adminDict[currentAdminLang];
  const statuses = ["pending", "shipping", "completed", "cancelled"];

  statuses.forEach((status) => {
    const filteredOrders = allOrders.filter((order) => order.status === status);
    const count = filteredOrders.length;
    const tbodyEl = document.getElementById(`list-${status}`);
    if (!tbodyEl) return;

    const sectionEl = tbodyEl.closest(".order-section");
    if (sectionEl) {
      const h3 = sectionEl.querySelector(".section-title");
      const badgeHtml = `<span id="badge-${status}" class="count-badge ${count > 0 ? "badge-red" : "badge-green"}">${count}</span>`;
      if (status === "pending")
        h3.innerHTML = `${t.title_pending} ${badgeHtml}`;
      if (status === "shipping")
        h3.innerHTML = `${t.title_shipping} ${badgeHtml}`;
      if (status === "completed")
        h3.innerHTML = `${t.title_completed} ${badgeHtml}`;
      if (status === "cancelled")
        h3.innerHTML = `${t.title_cancelled} ${badgeHtml}`;
    }

    const theadEl = tbodyEl.parentElement.querySelector("thead");
    if (theadEl) {
      theadEl.innerHTML = `<tr>
            <th>${t.th_order_id}</th><th>${t.th_customer}</th><th>${t.th_total}</th>
            ${status === "pending" ? `<th>${t.th_store}</th>` : ""} <!-- THÊM CỘT STORE -->
            <th>${status === "pending" ? t.th_assign : t.th_status}</th>
            ${status === "pending" || status === "shipping" ? `<th>${t.th_action}</th>` : ""}
        </tr>`;
    }

    if (count === 0) {
      const colSpan = status === "pending" || status === "shipping" ? 5 : 4;
      tbodyEl.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; color:#94a3b8; padding: 30px;">${t.empty_orders}</td></tr>`;
    } else {
      tbodyEl.innerHTML = filteredOrders
        .map((order) => {
          let rowHtml = `<tr style="transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="font-weight: 800; color: #0046be;">#${order.id}</td>
            <td><div style="font-weight: bold; color: #0f172a;">${order.full_name || "Khách hàng"}</div><div style="font-size: 0.85rem; color: #64748b;">${order.phone}</div></td>
            <td style="font-weight: bold;">$${order.total_amount}</td>`;

          if (status === "pending") {
            let storeSelect = `<select id="store-${order.id}" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; width: 100%;"><option value="">-- Chọn Kho --</option>`;
            globalStores.forEach(
              (st) =>
                (storeSelect += `<option value="${st.id}">${st.name}</option>`),
            );
            storeSelect += `</select>`;

            let shipperSelect = `<select id="shipper-${order.id}" style="padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; width: 100%;"><option value="">-- Chọn Shipper --</option>`;
            globalShippers.forEach(
              (s) =>
                (shipperSelect += `<option value="${s.id}">${s.full_name}</option>`),
            );
            shipperSelect += `</select>`;

            rowHtml += `<td>${storeSelect}</td><td>${shipperSelect}</td><td><button onclick="saveOrderUpdates(${order.id}, 'shipping')" style="background: #0046be; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer;">${t.btn_save}</button></td>`;
          } else if (status === "shipping") {
            rowHtml += `<td><span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">SHIPPING</span></td>
            <td><button onclick="saveOrderUpdates(${order.id}, 'cancelled')" style="background: #fee2e2; color: #ef4444; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.85rem;">${t.btn_cancel}</button></td>`;
          } else {
            const statusBg = status === "completed" ? "#dcfce7" : "#fee2e2";
            const statusColor = status === "completed" ? "#166534" : "#991b1b";
            rowHtml += `<td><span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">${status}</span></td>`;
          }
          rowHtml += `</tr>`;
          return rowHtml;
        })
        .join("");
    }
  });
}

async function saveOrderUpdates(orderId, newStatus) {
  let shipper_id = null;
  let pickup_store_id = null;

  if (newStatus === "shipping") {
    shipper_id = document.getElementById(`shipper-${orderId}`)?.value;
    pickup_store_id = document.getElementById(`store-${orderId}`)?.value;

    if (!pickup_store_id)
      return alert("Vui lòng gán (Assign) Cửa hàng xuất kho trước!");
    if (!shipper_id)
      return alert("Vui lòng gán (Assign) Shipper trước khi Giao đơn!");
  }

  if (
    !confirm(
      `Xác nhận cập nhật trạng thái đơn #${orderId} thành ${newStatus.toUpperCase()}?`,
    )
  )
    return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/admin/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          shipper_id: shipper_id,
          pickup_store_id: pickup_store_id,
        }),
      },
    );
    const data = await res.json();

    if (res.ok) {
      fetchAdminOrders(); // Reload lại 4 bảng
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    alert("Server error.");
  }
}

let globalStores = [];

async function loadStores() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/stores", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      globalStores = await res.json();
      renderStoresList();
    }
  } catch (e) {
    console.error("Lỗi tải danh sách cửa hàng", e);
  }
}

function renderStoresList() {
  const listEl = document.getElementById("admin-store-list");
  if (!listEl) return;

  if (globalStores.length === 0) {
    listEl.innerHTML = `<p style="text-align:center; color:#94a3b8; font-size:0.85rem; margin:10px 0;">Chưa có cửa hàng nào.</p>`;
    return;
  }

  listEl.innerHTML = globalStores
    .map(
      (st) => `
    <div style="background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 800; color: #0f172a; font-size: 0.9rem;">${st.name}</div>
        <div style="font-size: 0.8rem; color: #64748b;">${st.address}</div>
        <div style="font-size: 0.75rem; color: #10b981; font-weight: bold;">📍 Lat: ${st.lat} | Lon: ${st.lon}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

async function addNewStore() {
  const name = document.getElementById("admin-store-name").value.trim();
  const address = document.getElementById("admin-store-address").value.trim();

  if (!name || !address) return alert("Vui lòng nhập đủ Tên và Địa chỉ!");

  const btn = document.querySelector("button[onclick='addNewStore()']");
  const originalText = btn.innerText;
  btn.innerText = "⏳ Đang quét tọa độ...";
  btn.disabled = true;

  try {
    const geoRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`,
    );
    const geoData = await geoRes.json();

    if (!geoData || !geoData.features || geoData.features.length === 0) {
      throw new Error(
        "Không thể định vị được địa chỉ này trên bản đồ. Vui lòng ghi rõ Quận/Huyện, Thành Phố.",
      );
    }

    const lat = geoData.features[0].geometry.coordinates[1];
    const lon = geoData.features[0].geometry.coordinates[0];

    const res = await fetch("http://localhost:3000/api/admin/stores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, address, lat, lon }),
    });

    if (res.ok) {
      document.getElementById("admin-store-name").value = "";
      document.getElementById("admin-store-address").value = "";
      loadStores();
    } else {
      const err = await res.json();
      alert("Lỗi server: " + err.error);
    }
  } catch (error) {
    alert("❌ Lỗi: " + error.message);
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("admin-store-list")) loadStores();
});

if (adminOrdersContainer) {
  fetchAdminOrders();
}
fetchAdminProducts();
