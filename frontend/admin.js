const token = localStorage.getItem("token");

if (!token) { 
    alert("Access Denied! Please log in firs.t");
    window.location.href = "index.html"; // redirect to the homepage if the JWT token is missing
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

const subCategoryList = {
    "1": ["Apple", "ASUS", "Beats", "Dell", "GE", "HP", "Lenovo", "LG", "Meta", "Nintendo", "Samsung", "Sony", "All Brands"],
    "2": ["Explore TV & Home Theater", "Learn About RGB LED TVs", "TVs by Size", "TVs by Brand", "TVs by Type", "All Sound Bars & Home Audio", "Projectors & Screens", "Blu-ray & DVD Players", "Streaming Devices", "Home Theater Accessories", "Premium TV & Home Theater"],
    "3": ["Explore Computers & Tablets", "Laptops & Desktops", "Tablets", "Monitors", "PC Gaming & Virtual Reality", "Computer Components", "Hard Drives, SSD & Storage", "Computer Accessories", "Software", "Printers, Ink & Toner", "Wifi & Networking"],
    "4": ["Explore Appliances", "Major Kitchen Appliances", "Small Kitchen Appliances", "Luxury Kitchen Appliances", "Washers & Dryers", "Vacuums & Floor Care", "Heating, Cooling & Air Quality", "Appliance Packages", "Shop by Brand", "Small Space Appliances", "Appliance Parts & Accessories"],
    "5": ["Explore Small Kitchen Appliances", "Small Kitchen Appliance Deals", "Air Fryers & Deep Fryers", "Bar & Wine", "Blenders & Juicers", "Coffee, Tea & Espresso", "Microwaves", "Mini Fridges", "Mixers", "Pressure Cookers", "Toasters & Toaster Ovens"],
    "6": ["Explore Video Games", "Nintendo", "Xbox", "PlayStation", "PC Gaming", "Virtual Reality", "Gaming Accessories", "Digital Gaming", "Handheld Gaming", "Retro Gaming & Arcade", "Simulation Racing"],
    "7": ["Explore Cell Phones", "Cell Phone Accessories", "Unlocked Phones", "iPhone", "Samsung Galaxy", "Google Pixel", "Motorola", "Verizon", "AT&T", "Prepaid Phones & Carriers", "SIM Cards"],
    "8": ["Explore Headphones", "AirPods", "Wireless Headphones", "True Wireless Earbuds", "Open-Ear Headphones", "Over-Ear & On-Ear Headphones", "Earbud & In-Ear Headphones", "Noise-Cancelling Headphones", "Wired Headphones", "Sports Headphones", "Headphone Accessories"],
    "9": ["Explore Home Audio & Speakers", "Home Audio", "Portable Audio", "Premium Home Audio & Speakers", "Home Audio Accessories", "Audio Packages"],
    "10": ["Explore Music, Movies & TV Shows", "Music", "Movies", "TV Shows"],
    "11": ["Explore Cameras, Camcorders & Drones", "Cameras & Lenses", "Action Cameras & Camcorders", "Content Creator Gear", "Camera Accessories", "Drones", "Binoculars, Telescopes & Optics", "Shop by Brand"],
    "12": ["Explore Wearable Technology", "Apple Watch", "Samsung Galaxy Smartwatches", "Smartwatches", "Fitness Trackers & Accessories", "Smart Rings", "Smart & AI Glasses", "Virtual Reality", "Shop by Brand", "Wearable Technology Accessories"],
    "13": ["Explore Fitness, Sports & Outdoors", "Exercise & Fitness Equipment", "Water Sports Equipment", "Sports Gear & Equipment", "Kid's Sports & Outdoor Play", "Camping Gear", "Electric Transportation", "Biking", "Game Room", "Yard Games"],
    "14": ["Explore Sports Fan Shop", "College", "NFL", "NBA", "MLB", "NHL", "Soccer", "Golf", "WNBA"],
    "15": ["Explore Health, Wellness & Personal Care", "Home Health Care", "Personal Care & Beauty", "Workout Recovery", "Eyewear", "Baby", "Contrast Therapy: Hot & Cold Therapy", "Muscle Pain Relief", "Ear Care"],
    "16": ["Explore Home, Furniture & Office", "Home, Furniture & Decor", "Kitchen & Dining", "Office", "Bathroom", "Household Essentials", "Luggage & Travel", "Tools & Garage", "Storage & Organization", "Holiday Decorations"],
    "17": ["Explore Smart Home, Security & Wifi", "Wifi & Networking", "Security Cameras & Surveillance", "Smart Doorbells", "Smart Door Locks", "Home Security Systems", "Smart Speakers & Displays", "Smart Lighting", "Smart Thermostats", "Smart Plugs & Outlets", "Smart Devices"],
    "18": ["Explore Outdoor Living", "Grills & Outdoor Cooking", "Outdoor Kitchens", "Outdoor Heating", "Outdoor Power Equipment", "Outdoor Home Theater", "Outdoor Lighting", "Patio Furniture", "Lawn & Garden", "Generators & Backup Power", "Sheds & Outdoor Storage"],
    "19": ["Explore Electric Transportation", "Electric Bikes", "Electric Scooters", "Hoverboards", "Electric Car Chargers", "Kid's Scooters & Ride-ons", "Safety Gear & Accessories"],
    "20": ["Explore Car Electronics & GPS", "Car Audio", "Auto Care & Cleaning", "Auto Tools & Equipment", "Car Security & Convenience", "Back-up & Dash Cameras", "GPS Navigation", "Marine & Powersports", "Installation Parts & Accessories"],
    "21": ["Explore Toys, Games & Crafts", "Toys by Type", "Toys by Age", "Games, Puzzles & Cards", "Arts & Crafts", "Crafting Technology", "Collectibles", "Shop by Character"]
};

let currentDbId = 22; 
const categoryMap = {};

for (let i = 1; i <= 21; i++) {
    const parentId = i.toString();
    categoryMap[parentId] = subCategoryList[parentId].map(name => {
        return { id: currentDbId++, name: name };
    });
}

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
