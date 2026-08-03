const token = localStorage.getItem("token");

if (!token) { 
    alert("Access Denied! Please log in firs.t");
    window.location.href = "index.html"; // redirect to the homepage if the JWT token is missing
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

const addProductionForm = document.getElementById("add-product-form");

if (addProductionForm) {
    addProductionForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const productData = {
            category_id: parseInt(document.getElementById("category_id").value),
            name: document.getElementById("name").value.trim(),
            brand: document.getElementById("brand").value.trim(),
            sku: document.getElementById("sku").value.trim(),
            price: parseFloat(document.getElementById("price").value),
            stock: parseInt(document.getElementById("stock").value) || 0,
            image_url: document.getElementById("image_url").value.trim(),
            description: document.getElementById("description").value.trim()
        };

        try {
            const response = await fetch("http://localhost:3000/api/products", {
                method: "POST",
                hearder: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (respons.ok) {
                alert("Product added successfully! Check your main store.");
                addProductionForm.reset();
            } else {
                alert("Failed to add product: " + data.error);
                
                if (response.status === 403 || response.status === 401) {
                    logout();
                }
            }
        } catch (error) {
            console.error("Error: ", error);
            alert("Connection error. Is Backend running?");
        }
    });
}
