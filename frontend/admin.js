const token = localStorage.getItem("token");

if (!token) { 
    alert("Access Denied! Please log in firs.t");
    window.location.href = "index.html"; // redirect to the homepage if the JWT token is missing
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
        
        categories.forEach(cat => {
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
    mainCategorySelect.addEventListener("change", function() {
        const selectedParent = this.value;
        
        subCategorySelect.innerHTML = '<option value="">-- Chọn danh mục con --</option>';
        
        if (selectedParent && categoryMap[selectedParent]) {
            subCategorySelect.disabled = false;
            
            categoryMap[selectedParent].forEach(subCat => {
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

const addProductionForm = document.getElementById("add-product-form");

if (addProductionForm) {
    addProductionForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("category_id", document.getElementById("category_id").value);
        formData.append("name", document.getElementById("name").value.trim());
        formData.append("brand", document.getElementById("brand").value.trim());
        formData.append("sku", document.getElementById("sku").value.trim());
        formData.append("price", document.getElementById("price").value);
        formData.append("stock", document.getElementById("stock").value || 0);
        formData.append("description", document.getElementById("description").value.trim());

        const imageFile = document.getElementById("image_file").files[0];
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            const response = await fetch("http://localhost:3000/api/products", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData 
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
                throw new Error("The backend has crashed. Please check the backend terminal for detailed error information (often caused by a missing 'images' directory).");
            }

            const data = await response.json();

            if (response.ok) {
                alert("Product added successfully! Check your main store.");
                addProductionForm.reset();
            } else {
                alert("Failed to add product: " + data.error);
                
                if (response.status === 403 || response.status === 401) {
                    logout();
                }
            }
        } catch (error) {
            console.error("Error Detail: ", error);
            alert("Server error: " + error.message);
        }
    });
}

const adminOrderList = document.getElementById("admin-order-list");

if (adminOrderList) {
    async function fetchAdminOrders() {
        try {
            const res = await fetch("http://localhost:3000/api/admin/orders", {
                headers: { "Authorization": `Bearer ${token}` }
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
                                <th style="padding: 15px;">Contact</th>
                                <th style="padding: 15px;">Total payment</th>
                                <th style="padding: 15px;">Status</th>
                                <th style="padding: 15px;">Booking date</th>
                            </tr>`;
                            
            orders.forEach(o => {
                const date = new Date(o.create_at).toLocaleDateString('en-US');
                const statuses = ['pending', 'shipping', 'completed'];
                let statusSelect = `<select onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 5px; border-radius: 4px; font-weight: bold; cursor: pointer; background: #fef08a;">`;
                statuses.forEach(s => {
                    const isSelected = o.status === s ? 'selected' : '';
                    statusSelect += `<option value="${s}" ${isSelected}>${s.toUpperCase()}</option>`;
                });
                statusSelect += `</select>`;
                
                html += `<tr style="border-bottom: 1px solid #eee; transition: background 0.2s;">
                            <td style="padding: 15px; font-weight: bold;">#${o.id}</td>
                            <td style="padding: 15px;">${o.full_name}</td>
                            <td style="padding: 15px;">${o.phone}<br><small style="color: #666;">${o.email}</small></td>
                            <td style="padding: 15px; font-weight: 900; color: #0046be;">$${o.total_amount}</td>
                            <td style="padding: 15px;">${statusSelect}</td>
                            <td style="padding: 15px; color: #555;">${date}</td>
                         </tr>`;
            });
            html += `</table>`;
            adminOrderList.innerHTML = html;
            
        } catch (error) {
            adminOrderList.innerHTML = `<p style="color: red;">Data loading error: ${error.message}</p>`;
        }
    }
    fetchAdminOrders();
}

const adminCustomerList = document.getElementById("admin-customer-list");

if (adminCustomerList) {
    async function fetchAdminCustomers() {
        try {
            const res = await fetch("http://localhost:3000/api/admin/customers", {
                headers: { "Authorization": `Bearer ${token}` }
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
                            
            customers.forEach(c => {
                const roleColor = c.role === 'admin' ? '#bfdbfe' : '#e5e7eb';
                
                html += `<tr style="border-bottom: 1px solid #eee; transition: background 0.2s;">
                            <td style="padding: 15px; font-weight: bold;">${c.id}</td>
                            <td style="padding: 15px; font-weight: bold; color: #040c13;">${c.full_name}</td>
                            <td style="padding: 15px; color: #555;">${c.email}</td>
                            <td style="padding: 15px;">${c.phone || 'Not yet updated'}</td>
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

// Function to send API request to update order status
async function updateOrderStatus(orderId, newStatus) {
    if (!confirm(`Are you sure you want to change the status of order #${orderId} to ${newStatus.toUpperCase()}?`)) {
        fetchAdminOrders();
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            fetchAdminOrders();
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        alert("Server connection error.");
    }
}

// ==========================================
// FEATURE: MANAGE & DELETE PRODUCTS
// ==========================================
const adminProductList = document.getElementById("admin-product-list");

async function fetchAdminProducts() {
    if (!adminProductList) return;
    try {
        const res = await fetch("http://localhost:3000/api/products");
        const products = await res.json();
        
        let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <tr style="background: #f0f2f4; border-bottom: 2px solid #c8c8c8;">
                            <th style="padding: 15px;">Image</th>
                            <th style="padding: 15px;">Product</th>
                            <th style="padding: 15px;">Price / Stock</th>
                            <th style="padding: 15px;">Act</th>
                        </tr>`;
                        
        products.forEach(p => {
            html += `<tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 15px;"><img src="${p.image_url}" style="width: 50px; height: 50px; object-fit: contain;"></td>
                        <td style="padding: 15px; font-weight: bold;">${p.brand ? p.brand + ' ' : ''}${p.name}<br><small style="color: #888;">SKU: ${p.sku}</small></td>
                        <td style="padding: 15px; color: #0046be; font-weight: bold;">$${p.price}<br><small style="color: #059669;">Kho: ${p.stock}</small></td>
                        <td style="padding: 15px;">
                            <button onclick="deleteProduct(${p.id})" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Xóa</button>
                        </td>
                     </tr>`;
        });
        html += `</table>`;
        adminProductList.innerHTML = html;
        
    } catch (error) {
        adminProductList.innerHTML = `<p style="color: red;">Error loading products.</p>`;
    }
}

async function deleteProduct(productId) {
    if (!confirm("This action cannot be undone! Are you sure you want to delete this product?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
            alert(data.message);
            fetchAdminProducts(); 
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        alert("System error during deletion.");
    }
}

fetchAdminProducts();
