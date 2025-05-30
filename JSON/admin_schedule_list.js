const API_BASE_URL = "http://localhost:3000/api/admin/schedules";
let currentPage = 1;
const pageSize = 5;
let totalPages = 1;
let users = [];

document.addEventListener("DOMContentLoaded", () => {
  const btnAddMovie = document.getElementById("btnAddMovie");
  btnAddMovie.addEventListener("click", () => {
    window.location.href = "admin_movie_create.html";
  });

  fetchSchedules();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

async function fetchSchedules(page = 1) {
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
    console.error("Lỗi fetch schedule:", err);
    alert("Không thể tải danh sách user từ server.");
  }
}

function renderUsers() {
  const tbody = document.getElementById("schedule-list");
  tbody.innerHTML = "";

  users.forEach((schedule, index) => {
    const showDate = new Date(schedule.showDate).toLocaleDateString("vi-VN");
    const dateObj = new Date(schedule.showTime);
    const showTime = dateObj.toLocaleTimeString("vi-VN", {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }); 


    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${(currentPage - 1) * pageSize + index + 1}</td>
      <td>
        <div class="d-flex align-items-center">
            <img src="${schedule.film.poster_url}" alt="Movie Poster" class="movie-poster">
            <div>
                <div class="movie-title">${schedule.film.title}</div>
                <small class="text-muted">${schedule.film.duration} phút</small>
            </div>
        </div>
      </td>
      <td>${showDate || "-"}</td>
      <td>${showTime}</td>
      <td>${schedule.cinema.cinema_name} </td>
      <td>${schedule.room.room_name}</td> 
      <td><span class="badge-custom badge-active">Đang chiếu</span></td>
      <td>90.000 vnd</td>
      <td>
        <button class="btn btn-warning btn-sm me-2" onclick="editschedule(${schedule.id})">Sửa</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSchedule(${schedule.id})">Xóa</button>
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
        fetchSchedules(i);
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
