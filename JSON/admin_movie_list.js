const API_BASE_URL = "http://localhost:3000/api/films";
let currentPage = 1;
const pageSize = 5;
let totalPages = 1;
let movies = [];

document.addEventListener("DOMContentLoaded", () => {
  const btnAddMovie = document.getElementById("btnAddMovie");
  btnAddMovie.addEventListener("click", () => {
    window.location.href = "admin_movie_create.html";
  });

  fetchMovies();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

async function fetchMovies(page = 1) {
  try {
    const res = await fetch(`${API_BASE_URL}?page=${page}&length=${pageSize}`);
    if (!res.ok) throw new Error("Lỗi khi gọi API");

    const data = await res.json();
    movies = data.Data?.data || [];

    // Lấy từ pagination
    currentPage = data.Data?.pagination?.current_page || 1;
    totalPages = data.Data?.pagination?.total_pages || 1;

    renderMovies();
    renderPagination();
  } catch (err) {
    console.error("Lỗi fetch phim:", err);
    alert("Không thể tải danh sách phim từ server.");
  }
}

function renderMovies() {
  const tbody = document.getElementById("movie-list");
  tbody.innerHTML = "";

  movies.forEach((movie, index) => {
    const releaseDate = new Date(movie.release_date).toLocaleDateString("vi-VN");
    const endDate = new Date(movie.end_date).toLocaleDateString("vi-VN");
    const status = movie.is_now_showing
      ? "Đang chiếu"
      : movie.is_coming_soon
      ? "Sắp chiếu"
      : "Ngừng chiếu";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${(currentPage - 1) * pageSize + index + 1}</td>
      <td><img src="${movie.poster_url}" alt="Poster" style="width: 60px; height: auto;"/></td>
      <td>${movie.title || "-"}</td>
      <td>${Array.isArray(movie.genre) ? movie.genre.join(", ") : "-"}</td>
      <td>${movie.director || "-"}</td>
      <td>${movie.duration} phút</td>
      <td>${releaseDate}</td>
      <td>${endDate}</td>
      <td>${status}</td>
      <td>${movie.rating_avg?.toFixed(1) || "0.0"}</td>
      <td>${movie.rating_count || 0}</td>
      <td>
        <button class="btn btn-primary btn-sm me-2" onclick="editMovie(${movie.id})">Sửa</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMovie(${movie.id})">Xóa</button>
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
        fetchMovies(i);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    pagination.appendChild(li);
  }
}

function editMovie(id) {
  window.location.href = `admin_movie_edit.html?id=${id}`;
}

async function deleteMovie(id) {
  if (!confirm("Bạn có chắc muốn xóa phim này?")) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:3000/api/admin/delete-film/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Xóa phim thất bại");
    }

    alert("Đã xóa phim thành công!");
    fetchMovies(currentPage); // Reload lại trang hiện tại
  } catch (error) {
    console.error("Lỗi khi xóa phim:", error);
    alert("Xóa phim thất bại: " + error.message);
  }
}
