const token = localStorage.getItem("token");

if (!token) {
  alert("Access Denied! Please log in first.");
  window.location.href = "index.html"; 
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
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
    subCategorySelect.innerHTML = '<option value="">-- Chọn danh mục con --</option>';

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

// ==========================================
// NEW FEATURE: MEDIA LIBRARY MANAGER (WITH FOLDERS)
// ==========================================
 let currentMediaTarget = null; 
let libraryMediaCache = [];    
let temporarySelection = [];   

let currentFolderId = null; // null = All, 'unassigned' = No Folder, number = Folder ID
let libraryFolders = [];

let formState = {
    add: [],
    edit: []
};

const mediaModal = document.getElementById("media-manager-modal");
const mediaGrid = document.getElementById("media-grid");
const mediaCountText = document.getElementById("media-selection-count");
const folderList = document.getElementById("folder-list");
const currentFolderLabel = document.getElementById("current-folder-label");

function openMediaManager(target) {
    currentMediaTarget = target;
    temporarySelection = [...formState[target]]; 
    if(mediaModal) mediaModal.style.display = "flex";
    
    currentFolderId = null; 
    
    // Clear search box
    const searchInput = document.getElementById("media-search-input");
    if(searchInput) searchInput.value = "";

    fetchFolders();
    fetchMediaLibrary();
}

function closeMediaManager() {
    if(mediaModal) mediaModal.style.display = "none";
}

// -- FOLDER LOGIC --
async function fetchFolders() {
    try {
        const res = await fetch("http://localhost:3000/api/admin/media/folders", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
            libraryFolders = await res.json();
            renderFolders();
        }
    } catch (err) { console.error("Error fetching folders"); }
}

async function createFolder() {
    const nameInput = document.getElementById("new-folder-name");
    const name = nameInput.value.trim();
    if(!name) return;

    let parent_id = null;
    if (currentFolderId && currentFolderId !== 'unassigned') {
        parent_id = currentFolderId;
    }

    try {
        const res = await fetch("http://localhost:3000/api/admin/media/folders", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, parent_id }) // Gửi kèm parent_id
        });
        if(res.ok) {
            nameInput.value = "";
            fetchFolders();
        } else {
            const data = await res.json(); alert(data.error);
        }
    } catch (err) { alert("Error creating folder"); }
}

async function deleteFolder(event, folderId, folderName) {
    event.stopPropagation(); // Tránh kích hoạt sự kiện chọn thư mục
    if (!confirm(`Are you sure you want to delete folder "${folderName}"?\nAll images inside will be moved to 'Unassigned'.`)) return;

    try {
        const res = await fetch(`http://localhost:3000/api/admin/media/folders/${folderId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            if (currentFolderId === folderId) selectFolder(null, 'All Media');
            fetchFolders();
            fetchMediaLibrary(); 
        } else {
            alert("Error deleting folder.");
        }
    } catch (err) { alert("Server error."); }
}

function selectFolder(id, name) {
    currentFolderId = id;
    currentFolderLabel.innerText = name;
    renderFolders(); // Update active class
    fetchMediaLibrary(); // Refetch images for this folder
}

function renderFolders() {
    let html = `
        <li class="folder-item ${currentFolderId === null ? 'active' : ''}" onclick="selectFolder(null, 'All Media')" style="padding: 10px;">
            <span class="folder-icon">📁</span> All Media
        </li>
        <li class="folder-item ${currentFolderId === 'unassigned' ? 'active' : ''}" onclick="selectFolder('unassigned', 'Unassigned')" style="padding: 10px;">
            <span class="folder-icon">📂</span> Unassigned
        </li>
    `;

    const buildTree = (parentId, level) => {
        const children = libraryFolders.filter(f => f.parent_id === parentId);
        children.forEach(f => {
            const indent = level * 15;
            const icon = level > 0 ? '↳ 📁' : '📁'; 
            
            html += `
            <li class="folder-item ${currentFolderId === f.id ? 'active' : ''}" 
                style="padding: 10px; padding-left: ${indent + 10}px; display: flex; justify-content: space-between; align-items: center;" 
                onclick="selectFolder(${f.id}, '${f.name}')">
                
                <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span class="folder-icon">${icon}</span> ${f.name}
                </div>
                
                <button onclick="deleteFolder(event, ${f.id}, '${f.name}')" 
                        style="background: transparent; color: #ef4444; border: none; cursor: pointer; font-weight: bold; font-size: 1.1rem; padding: 0 5px;" 
                        title="Delete Folder">×</button>
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

        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if(res.ok) {
            libraryMediaCache = await res.json();
            renderMediaGrid();
        }
    } catch (err) {
        mediaGrid.innerHTML = `<p style="color: red;">Failed to load library.</p>`;
    }
}

function filterMediaByName() {
    const query = document.getElementById('media-search-input').value.toLowerCase();
    renderMediaGrid(query);
}

function renderMediaGrid(searchQuery = '') {
    if (libraryMediaCache.length === 0) {
        mediaGrid.innerHTML = `<p style="color: #666; width: 100%; text-align: center; margin-top: 50px;">This folder is empty.</p>`;
        mediaCountText.innerText = `${temporarySelection.length} images selected`;
        return;
    }

    const filteredMedia = libraryMediaCache.filter(m => m.file_name.toLowerCase().includes(searchQuery));

    if (filteredMedia.length === 0) {
        mediaGrid.innerHTML = `<p style="color: #666; width: 100%; text-align: center; margin-top: 50px;">No images match your search.</p>`;
        return;
    }

    mediaGrid.innerHTML = filteredMedia.map(media => {
        const isSelected = temporarySelection.includes(media.file_url);
        return `
        <div class="media-item ${isSelected ? 'selected' : ''}" onclick="toggleMediaSelection('${media.file_url}')">
            <button class="delete-media-btn" onclick="deleteMediaItem(event, ${media.id})" title="Delete image">✕</button>
            <img src="${media.file_url}" alt="${media.file_name}" title="${media.file_name}">
            <div class="media-item-name" title="${media.file_name}">${media.file_name}</div>
        </div>`;
    }).join('');

    mediaCountText.innerText = `${temporarySelection.length} images selected`;
}

function toggleMediaSelection(url) {
    const index = temporarySelection.indexOf(url);
    if (index === -1) {
        temporarySelection.push(url); 
    } else {
        temporarySelection.splice(index, 1); 
    }
    renderMediaGrid(); 
}

 async function deleteMediaItem(event, mediaId) {
    event.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this image from the Library?")) return;
    
    try {
        const res = await fetch(`http://localhost:3000/api/admin/media/${mediaId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchMediaLibrary();
        } else {
            const data = await res.json();
            alert("Error: " + data.error);
        }
    } catch(err) {
        alert("Failed to delete image.");
    }
}

function confirmMediaSelection() {
    formState[currentMediaTarget] = [...temporarySelection];
    
    const container = document.getElementById(`${currentMediaTarget}-selected-images`);
    if (formState[currentMediaTarget].length === 0) {
        container.innerHTML = `<p style="color: #888; font-size: 0.9rem; margin: 0; font-style: italic;">No images selected.</p>`;
    } else {
        container.innerHTML = formState[currentMediaTarget].map((url, i) => `
            <div style="position: relative;">
                <img src="${url}" class="selected-image-preview">
                ${i === 0 ? '<span style="position:absolute; bottom: 0; left: 0; background: #ffe000; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 2px;">MAIN</span>' : ''}
            </div>
        `).join('');
    }
    closeMediaManager();
}

async function uploadMediaToLibrary() {
    const fileInput = document.getElementById("media-upload-input");
    const files = fileInput.files;

    if (files.length === 0) {
        alert("Please select files to upload.");
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }
    
    // Append the current folder ID so the backend knows where to save it
    if (currentFolderId && currentFolderId !== 'unassigned') {
        formData.append("folder_id", currentFolderId);
    }

    try {
        const res = await fetch("http://localhost:3000/api/admin/media", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            fileInput.value = ""; 
            fetchMediaLibrary(); // Refresh images
        } else {
            alert(data.error);
        }
    } catch (err) { alert("Upload failed."); }
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
      specifications: gatherSpecs('add'),
      main_image: formState.add.length > 0 ? formState.add[0] : null,
      extra_images: formState.add.length > 1 ? formState.add.slice(1) : []
    };

    try {
      const response = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
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
const adminOrderList = document.getElementById("admin-order-list");

let globalShippers = [];

async function fetchAdminOrders() {
  try {
    const shipperRes = await fetch("http://localhost:3000/api/admin/shippers", {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (shipperRes.ok) {
        globalShippers = await shipperRes.json();
    }

    const res = await fetch("http://localhost:3000/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Unable to load order data.");
    const orders = await res.json();

    if (orders.length === 0) {
      adminOrderList.innerHTML = "<p>There are no orders in the system yet.</p>";
      return;
    }

    let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <tr style="background: #f0f2f4; border-bottom: 2px solid #c8c8c8;">
                        <th style="padding: 15px;">Order ID</th>
                        <th style="padding: 15px;">Customer</th>
                        <th style="padding: 15px;">Total payment</th>
                        <th style="padding: 15px;">Status</th>
                        <th style="padding: 15px;">Assign Shipper</th>
                        <th style="padding: 15px;">Action</th>
                    </tr>`;

    orders.forEach((o) => {
      const statuses = ["pending", "shipping", "completed", "cancelled"];
      
      const getStatusBgColor = (status) => {
          switch(status.toLowerCase()) {
              case 'completed': return '#d1fae5';
              case 'pending': return '#fef08a';
              case 'shipping': return '#dbeafe';
              case 'cancelled': return '#fee2e2';
              default: return '#f3f4f6'; 
          }
      };

      let statusSelect = `<select id="status-${o.id}" style="padding: 6px; border-radius: 4px; font-weight: bold; border: 1px solid #c8c8c8; outline: none; background-color: ${getStatusBgColor(o.status)};">`;
      statuses.forEach((s) => {
        const isSelected = o.status === s ? "selected" : "";
        statusSelect += `<option value="${s}" ${isSelected} style="background: #fff;">${s.toUpperCase()}</option>`;
      });
      statusSelect += `</select>`;
      let shipperSelect = `<select id="shipper-${o.id}" style="padding: 6px; border-radius: 4px; border: 1px solid #c8c8c8; outline: none; width: 100%;">
          <option value="">-- Unassigned --</option>`;
      globalShippers.forEach((s) => {
          const isSelected = o.shipper_id === s.id ? "selected" : "";
          shipperSelect += `<option value="${s.id}" ${isSelected}>${s.full_name}</option>`;
      });
      shipperSelect += `</select>`;

      html += `<tr style="border-bottom: 1px solid #eee; transition: background 0.2s;">
                  <td style="padding: 15px; font-weight: bold;">#${o.id}</td>
                  <td style="padding: 15px;">${o.full_name}<br><small style="color: #666;">${o.phone}</small></td>
                  <td style="padding: 15px; font-weight: 900; color: #0046be;">$${o.total_amount}</td>
                  <td style="padding: 15px;">${statusSelect}</td>
                  <td style="padding: 15px;">${shipperSelect}</td>
                  <td style="padding: 15px;">
                      <button onclick="saveOrderUpdates(${o.id})" style="background: #0046be; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">Save</button>
                  </td>
               </tr>`;
    });
    html += `</table>`;
    adminOrderList.innerHTML = html;
  } catch (error) {
    adminOrderList.innerHTML = `<p style="color: red;">Data loading error: ${error.message}</p>`;
  }
}

const adminCustomerList = document.getElementById("admin-customer-list");

if (adminCustomerList) {
  async function fetchAdminCustomers() {
    try {
      const res = await fetch("http://localhost:3000/api/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unable to load the customer list.");
      const customers = await res.json();

      let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <tr style="background: #f0f2f4; border-bottom: 2px solid #c8c8c8;">
                                <th style="padding: 15px;">ID</th>
                                <th style="padding: 15px;">Full Name</th>
                                <th style="padding: 15px;">Email</th>
                                <th style="padding: 15px;">Phone Number</th>
                                <th style="padding: 15px;">Role</th>
                            </tr>`;

      customers.forEach((c) => {
        const roleColor = c.role === "admin" ? "#bfdbfe" : "#e5e7eb";

        html += `<tr style="border-bottom: 1px solid #eee; transition: background 0.2s;">
                            <td style="padding: 15px; font-weight: bold;">${c.id}</td>
                            <td style="padding: 15px; font-weight: bold; color: #040c13;">${c.full_name}</td>
                            <td style="padding: 15px; color: #555;">${c.email}</td>
                            <td style="padding: 15px;">${c.phone || "Not yet updated"}</td>
                            <td style="padding: 15px;">
                                <span style="padding: 5px 10px; border-radius: 4px; background: ${roleColor}; color: #000; font-size: 0.85rem; font-weight: bold;">
                                    ${c.role.toUpperCase()}
                                </span>
                            </td>
                         </tr>`;
      });
      html += `</table>`;
      adminCustomerList.innerHTML = html;
    } catch (error) {
      adminCustomerList.innerHTML = `<p style="color: red;">Data loading error: ${error.message}</p>`;
    }
  }
  fetchAdminCustomers();
}


async function saveOrderUpdates(orderId) {
  const status = document.getElementById(`status-${orderId}`).value;
  const shipper_id = document.getElementById(`shipper-${orderId}`).value;

  if (status === 'shipping' && !shipper_id) {
      alert("Please assign a Shipper before changing status to SHIPPING!");
      return;
  }

  if (!confirm(`Update Order #${orderId}?`)) return;

  try {
    const res = await fetch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: status, shipper_id: shipper_id }),
      }
    );
    const data = await res.json();
    if (res.ok) {
        alert("Order updated successfully!");
        fetchAdminOrders();
    } else {
        alert("Error: " + data.error);
    }
  } catch (error) { 
      alert("Server error."); 
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
    categories.forEach((c) => categoryDict[c.id] = c.name);

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
      html = '<p style="color: #666;">No products available in the system yet.</p>';
    } else {
      sortedCategoryNames.forEach((catName) => {
        html += `
                <div style="margin-top: 35px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <h3 style="margin: 0; color: #0046be; font-size: 1.3rem;">${catName}</h3>
                    <span style="background: #e0e6ef; color: #555; padding: 3px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">
                        ${groupedProducts[catName].length} items
                    </span>
                </div>`;
        html += `
                <table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 10px;">
                    <tr style="background: #f0f2f4; border-bottom: 2px solid #c8c8c8;">
                        <th style="padding: 15px; width: 80px;">Image</th>
                        <th style="padding: 15px;">Product</th>
                        <th style="padding: 15px; width: 150px;">Price / Stock</th>
                        <th style="padding: 15px; width: 180px;">Action</th>
                    </tr>`;

        groupedProducts[catName].forEach((p) => {
          const imgSrc = p.image_url || "https://via.placeholder.com/50";
          html += `
                    <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;">
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
        html += `</table>`;
      });
    }
    adminProductList.innerHTML = html;
  } catch (error) {
    adminProductList.innerHTML = `<p style="color: red;">Error loading products: ${error.message}</p>`;
  }
}

async function deleteProduct(productId) {
  if (!confirm("This action cannot be undone! Are you sure you want to delete this product?")) return;
  try {
    const res = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) fetchAdminProducts();
    else alert("Error: " + data.error);
  } catch (error) { alert("System error."); }
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
      if (typeof specs === 'string') {
          try { specs = JSON.parse(specs); } catch(e) { specs = null; }
      }
      
      if (specs && Array.isArray(specs)) {
          specs.forEach(s => addSpecRow('edit', s.group, s.name, s.value));
      }
  }

  formState.edit = product.all_images && product.all_images.length > 0 
                    ? [...product.all_images] 
                    : (product.image_url ? [product.image_url] : []);
  
  currentMediaTarget = 'edit';
  
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
      
      specifications: gatherSpecs('edit'),
      main_image: formState.edit.length > 0 ? formState.edit[0] : null,
      extra_images: formState.edit.length > 1 ? formState.edit.slice(1) : []
    };

    const submitBtn = editForm.querySelector("button[type='submit']");
    submitBtn.innerText = "Saving...";
    submitBtn.disabled = true;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        }
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
    rows.forEach(row => {
        const group = row.querySelector(".spec-group").value.trim();
        const name = row.querySelector(".spec-name").value.trim();
        const value = row.querySelector(".spec-value").value.trim();
        if (name && value) {
            specs.push({ group: group || "General", name, value });
        }
    });
    return specs.length > 0 ? specs : null;
}

if (adminOrderList) {
    fetchAdminOrders();
}
fetchAdminProducts();