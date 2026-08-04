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
            console.error("Error: ", error);
            alert("Connection error. Is Backend running?");
        }
    });
}
