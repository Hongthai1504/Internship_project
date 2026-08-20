const token = localStorage.getItem("token");
if (!token) {
    alert("Please sign in first.");
    window.location.href = "login.html";
}

// Tabs Logic
const tabInfo = document.getElementById("tab-info");
const tabAddress = document.getElementById("tab-address");
const secInfo = document.getElementById("section-info");
const secAddress = document.getElementById("section-address");

tabInfo.addEventListener("click", () => {
    tabInfo.style.background = "#eef2f7"; tabInfo.style.color = "#0046be";
    tabAddress.style.background = "transparent"; tabAddress.style.color = "#555";
    secInfo.style.display = "block";
    secAddress.style.display = "none";
});

tabAddress.addEventListener("click", () => {
    tabAddress.style.background = "#eef2f7"; tabAddress.style.color = "#0046be";
    tabInfo.style.background = "transparent"; tabInfo.style.color = "#555";
    secInfo.style.display = "none";
    secAddress.style.display = "block";
    loadAddresses();
});

// Load Profile Info
async function loadProfile() {
    try {
        const res = await fetch("http://localhost:3000/api/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById("profile-email").value = data.email;
            document.getElementById("profile-name").value = data.full_name;
            document.getElementById("profile-phone").value = data.phone || "";
            document.getElementById("sidebar-name").innerText = data.full_name;
            document.getElementById("avatar-icon").innerText = data.full_name.charAt(0).toUpperCase();
        }
    } catch (err) { console.error("Error loading profile"); }
}
loadProfile();

// Update Profile Info
document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.innerText = "Saving...";
    
    const full_name = document.getElementById("profile-name").value.trim();
    const phone = document.getElementById("profile-phone").value.trim();
    
    try {
        const res = await fetch("http://localhost:3000/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ full_name, phone })
        });
        const data = await res.json();
        alert(res.ok ? data.message : data.error);
        if(res.ok) loadProfile();
    } catch(err) { alert("Server error."); }
    btn.innerText = "Save Changes";
});

// --- ADDRESS BOOK LOGIC ---
const addAddressContainer = document.getElementById("add-address-container");
document.getElementById("btn-show-add-address").addEventListener("click", () => {
    addAddressContainer.style.display = "block";
});
document.getElementById("btn-cancel-address").addEventListener("click", () => {
    addAddressContainer.style.display = "none";
    document.getElementById("add-address-form").reset();
});

async function loadAddresses() {
    const listEl = document.getElementById("address-list");
    try {
        const res = await fetch("http://localhost:3000/api/profile/addresses", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const addresses = await res.json();
        
        if (addresses.length === 0) {
            listEl.innerHTML = `<p style="color: #666; font-style: italic;">You haven't saved any addresses yet.</p>`;
            return;
        }

        listEl.innerHTML = addresses.map(addr => `
            <div style="border: 1px solid ${addr.is_default ? '#0046be' : '#e0e6ef'}; padding: 20px; border-radius: 8px; background: ${addr.is_default ? '#f8faff' : '#fff'}; position: relative;">
                ${addr.is_default ? '<span style="position: absolute; top: 20px; right: 20px; background: #ffe000; color: #000; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">DEFAULT</span>' : ''}
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <svg width="24" height="24" fill="${addr.is_default ? '#0046be' : '#888'}" viewBox="0 0 24 24" style="flex-shrink: 0; margin-top: 2px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <div style="flex: 1;">
                        <p style="margin: 0 0 15px 0; color: #333; line-height: 1.5; font-size: 1.05rem;">${addr.address}</p>
                        <div style="display: flex; gap: 15px;">
                            ${!addr.is_default ? `<button onclick="setDefaultAddress(${addr.id})" style="background: none; border: none; color: #0046be; font-weight: bold; cursor: pointer; padding: 0;">Set as Default</button>` : ''}
                            <button onclick="deleteAddress(${addr.id})" style="background: none; border: none; color: #ef4444; font-weight: bold; cursor: pointer; padding: 0;">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch(err) { listEl.innerHTML = `<p style="color: red;">Error loading addresses.</p>`; }
}

document.getElementById("add-address-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const address = document.getElementById("new-address-text").value.trim();
    const is_default = document.getElementById("new-address-default").checked;
    
    try {
        const res = await fetch("http://localhost:3000/api/profile/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ address, is_default })
        });
        if (res.ok) {
            document.getElementById("btn-cancel-address").click();
            loadAddresses();
        } else {
            const data = await res.json(); alert(data.error);
        }
    } catch(err) { alert("Server error."); }
});

async function setDefaultAddress(id) {
    try {
        const res = await fetch(`http://localhost:3000/api/profile/addresses/${id}/default`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if(res.ok) loadAddresses();
    } catch(err) { alert("Error setting default address."); }
}

async function deleteAddress(id) {
    if(!confirm("Are you sure you want to delete this address?")) return;
    try {
        const res = await fetch(`http://localhost:3000/api/profile/addresses/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if(res.ok) loadAddresses();
    } catch(err) { alert("Error deleting address."); }
}