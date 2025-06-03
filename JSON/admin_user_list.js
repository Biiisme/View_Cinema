const API_BASE_URL = "http://localhost:3000/api/admin/users";
let currentPage = 1;
const pageSize = 5;
let totalPages = 1;
let users = [];

document.addEventListener("DOMContentLoaded", () => {
  const btnAddMovie = document.getElementById("btnAddMovie");
  btnAddMovie.addEventListener("click", () => {
    window.location.href = "admin_movie_create.html";
  });

  fetchUsers();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

async function fetchUsers(page = 1) {
  try {
   const token = localStorage.getItem("token"); // hoặc lấy từ nơi bạn lưu
        if (!token) {
            alert("Bạn chưa đăng nhập!");
            return;
        }  
    const res = await fetch(`${API_BASE_URL}?page=${page}&length=${pageSize}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Lỗi khi gọi API");

    const data = await res.json();
    users = data.Data?.data || [];

    // Lấy từ pagination
    currentPage = data.Data?.pagination?.current_page || 1;
    totalPages = data.Data?.pagination?.total_pages || 1;

    renderUsers();
    renderPagination();
  } catch (err) {
    console.error("Lỗi fetch user:", err);
    alert("Không thể tải danh sách user từ server.");
  }
}

function renderUsers() {
  const tbody = document.getElementById("user-list");
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const birthDate = new Date(user.birth_date).toLocaleDateString("vi-VN");
    const createdAt = new Date(user.createdAt).toLocaleDateString("vi-VN");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${(currentPage - 1) * pageSize + index + 1}</td>
      <td>${user.fullName || "-"}</td>
      <td>${user.phone_number || "-"}</td>
      <td>${user.email}</td>
      <td>${birthDate}</td>
      <td>${createdAt}</td>
      <td>
        <button class="btn btn-info btn-sm me-2" onclick="editUser(${user.id})">Sửa</button>
        <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      if (i !== currentPage) {
        fetchUsers(i);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    pagination.appendChild(li);
  }
}

// function editMovie(id) {
//   window.location.href = `admin_movie_edit.html?id=${id}`;
// }

// async function deleteMovie(id) {
//   if (!confirm("Bạn có chắc muốn xóa phim này?")) return;

//   const token = localStorage.getItem("token");

//   try {
//     const res = await fetch(`http://localhost:3000/api/admin/delete-film/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!res.ok) {
//       const errorData = await res.json();
//       throw new Error(errorData.message || "Xóa phim thất bại");
//     }

//     alert("Đã xóa phim thành công!");
//     fetchMovies(currentPage); // Reload lại trang hiện tại
//   } catch (error) {
//     console.error("Lỗi khi xóa phim:", error);
//     alert("Xóa phim thất bại: " + error.message);
//   }
// }
