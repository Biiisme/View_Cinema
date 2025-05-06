document.addEventListener("DOMContentLoaded", function () {
    const movieList = document.querySelector(".movie-carousel");
    const indicatorContainer = document.querySelector(".carousel-indicator");
    const pageSize = 4; // Số phim mỗi trang
    let currentPage = 1;
    let totalPages = 2;

    function fetchMovies(page) {
        fetch(`http://localhost:3000/api/films?page=${page}&length=${pageSize}`)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                const movies = data.Data.data;
                totalPages = data.Data.pagination.total_pages;
                currentPage = data.Data.pagination.current_page;

                renderMovies(movies);
                renderIndicators();
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }

    function renderMovies(movies) {
        movieList.innerHTML = ""; // Xóa cũ

        movies.forEach(movie => {
            const releaseDate = new Date(movie.release_date).toLocaleDateString('vi-VN');
            const rated = movie.rated || "T13";
            // const rawPoster = movie.poster_url?.split('?')[0]; 
            // const poster = `${rawPoster}?w=1920&q=75`;

            const col = document.createElement("div");
            col.className = "col-md-3";

            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";

            movieCard.innerHTML = `
                <div class="movie-poster">
                    <div class="rating-badge">
                        <span class="rating-icon">2D</span>
                        <span class="rating-text">${rated}</span>
                    </div>
                    <img src="${movie.poster_url}" alt="${movie.title}" class="img-fluid">
                    <div class="movie-date">Khởi chiếu từ ngày: ${releaseDate}</div>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title} (${rated})</h3>
                    <div class="movie-actions">
                        ${
                            movie.trailer_url 
                            ? `<a href="${movie.trailer_url}" class="btn btn-trailer" target="_blank">
                                <i class="fas fa-play-circle"></i> Xem Trailer
                               </a>` 
                            : ""
                        }
                        <a href="movie_detail.html?id=${movie.id}" class="btn btn-booking">ĐẶT VÉ</a>
                    </div>
                </div>
            `;

            col.appendChild(movieCard);
            movieList.appendChild(col);
        });
    }

    function renderIndicators() {
        indicatorContainer.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const span = document.createElement("span");
            span.className = "indicator" + (i === currentPage ? " active" : "");
            span.dataset.page = i;

            span.addEventListener("click", function () {
                fetchMovies(parseInt(this.dataset.page));
            });

            indicatorContainer.appendChild(span);
        }
    }

    // Load trang đầu tiên
    fetchMovies(currentPage);
});
