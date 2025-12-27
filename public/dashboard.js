// 🔹 Fetch and display current user only
let currentUser = null;

function loadUsers() {
  const userId = localStorage.getItem("userId");
  
  console.log("Checking userId in localStorage:", userId);
  
  if (!userId) {
    console.log("No userId found - redirecting to registration");
    alert("Please register or login first.");
    window.location.href = "index.html";
    return;
  }
  
  console.log(`Fetching user data for ID: ${userId}`);
  
  fetch(`/api/users/${userId}`)
    .then((res) => {
      console.log("Response status:", res.status);
      if (!res.ok) {
        throw new Error(`Failed to fetch user data - Status: ${res.status}`);
      }
      return res.json();
    })
    .then((user) => {
      console.log("User data loaded:", user);
      currentUser = user;
      displayUsers([user]); // Pass as array to reuse existing function
    })
    .catch((error) => {
      console.error("Error loading profile:", error);
      alert("Unable to load your profile. Please register first.");
      localStorage.removeItem("userId");
      window.location.href = "index.html";
    });
}

function displayUsers(users) {
  const tbody = document.getElementById("userTableBody");
  
  if (!tbody) {
    console.error("Table body element not found");
    return;
  }
  
  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: #718096;">
          No profile found.
        </td>
      </tr>
    `;
    return;
  }
  
  const user = users[0]; // Only one user (current user)
  const imageUrl = user.photo
    ? `/uploads/${user.photo}`
    : "https://via.placeholder.com/50";
  
  tbody.innerHTML = `
    <tr>
      <td>
        <img 
          src="${imageUrl}"
          alt="${user.name}"
          class="user-photo"
          onerror="this.src='https://via.placeholder.com/50'"
        />
      </td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.mobile}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="openEditModal('${user._id}')">
            <i class="fas fa-edit"></i>
            Edit Profile
          </button>
          <button class="btn-delete" onclick="deleteUser('${user._id}')">
            <i class="fas fa-trash"></i>
            Delete Account
          </button>
        </div>
      </td>
    </tr>
  `;
}

// 🔹 Open Edit Modal
function openEditModal(userId) {
  const user = currentUser;
  if (!user) return;
  
  document.getElementById("editUserId").value = user._id;
  document.getElementById("editName").value = user.name;
  document.getElementById("editDob").value = user.dob.split('T')[0];
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editMobile").value = user.mobile;
  
  const currentPhoto = document.getElementById("currentPhoto");
  const photoUrl = user.photo
    ? `/uploads/${user.photo}`
    : "https://via.placeholder.com/100";
  currentPhoto.src = photoUrl;
  currentPhoto.onerror = () => { currentPhoto.src = "https://via.placeholder.com/100"; };
  currentPhoto.style.display = "block";
  
  document.getElementById("editModal").classList.add("show");
}

// 🔹 Close Edit Modal
function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
  document.getElementById("editForm").reset();
  document.getElementById("editMessage").classList.remove("show");
}

// 🔹 Handle Edit Form Submit
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const userId = document.getElementById("editUserId").value;
  const name = document.getElementById("editName").value.trim();
  const dob = document.getElementById("editDob").value;
  const email = document.getElementById("editEmail").value.trim();
  const mobile = document.getElementById("editMobile").value.trim();
  const photo = document.getElementById("editPhoto").files[0];
  
  const formData = new FormData();
  formData.append("name", name);
  formData.append("dob", dob);
  formData.append("email", email);
  formData.append("mobile", mobile);
  if (photo) {
    formData.append("photo", photo);
  }
  
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      body: formData,
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showEditMessage("User updated successfully! ✅", "success");
      setTimeout(() => {
        closeEditModal();
        loadUsers();
      }, 1500);
    } else {
      showEditMessage(data.message || "Update failed", "error");
    }
  } catch (err) {
    console.error("Update error:", err);
    showEditMessage("Server error. Please try again.", "error");
  }
});

function showEditMessage(text, type) {
  const message = document.getElementById("editMessage");
  message.textContent = text;
  message.className = `message show ${type}`;
}

// 🔴 DELETE: Delete user account
function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

  fetch(`/api/users/${userId}`, {
    method: "DELETE",
  })
    .then(() => {
      alert("Account deleted successfully");
      localStorage.removeItem("userId");
      window.location.href = "index.html";
    })
    .catch(() => {
      alert("Error deleting account");
    });
}

// 🔹 Logout functionality
function addUser() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("userId");
    window.location.href = "index.html";
  }
}

// 🔹 File input handler for edit form
document.getElementById("editPhoto").addEventListener("change", function() {
  const fileText = document.querySelector(".edit-file-text");
  if (this.files.length > 0) {
    fileText.textContent = this.files[0].name;
  } else {
    fileText.textContent = "Choose new photo";
  }
});

// Load users on page load
loadUsers();
