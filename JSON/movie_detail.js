// Load HTML component
function loadComponent(id, url) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}


let schedules = [];
let selectedDate = null;

// Khi DOM đã load
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const filmId = urlParams.get("id");
  if (!filmId) return alert("Không tìm thấy ID phim.");

  const filmApi = `http://localhost:3000/api/film/${filmId}`;

  try {
    const response = await fetch(filmApi);
    const result = await response.json();
    const data = result.Data;

    // Gắn dữ liệu phim vào DOM
    document.getElementById("moviePoster").src = data.poster_url;
    document.getElementById("releaseDate").textContent = new Date(data.release_date).toLocaleDateString();
    document.getElementById("movieTitle").textContent = data.title;
    document.getElementById("movieGenre").textContent = data.genre || "Chưa rõ";
    document.getElementById("movieDuration").textContent = data.duration + "'";
    document.getElementById("movieCountry").textContent = data.country || "Chưa rõ";
    document.getElementById("movieLanguage").textContent = data.language || "Chưa rõ";
    document.getElementById("movieAgeRating").textContent = data.rated;
    document.getElementById("ratingText").textContent = data.rated || "T18";
    document.getElementById("movieDirector").textContent = data.director;
    document.getElementById("movieCast").textContent = (data.cast || []).join(", ");
    document.getElementById("moviePremiere").textContent = new Date(data.release_date).toLocaleDateString();
    document.getElementById("moviePlot").textContent = data.description;
    document.getElementById("trailerLink").href = "https://www.youtube.com/watch?v=";

    // Lấy lịch chiếu phim
    const scheduleRes = await fetch(`http://localhost:3000/api/schedules/film/${filmId}`);
    const scheduleData = await scheduleRes.json();
    schedules = scheduleData.data;
    initDateCards(schedules);
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu:", err);
    alert("Không thể tải dữ liệu phim.");
  }
});

function initDateCards(schedules) {
  const dateList = document.getElementById("dateList");
  dateList.innerHTML = "";

  // Lấy danh sách ngày duy nhất (cắt phần giờ)
  const uniqueDates = [
    ...new Set(schedules.map(s => s.showDate.split("T")[0]))
  ];

  uniqueDates.forEach(dateStr => {
    const dateObj = new Date(dateStr);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const weekday = dateObj.toLocaleDateString("vi-VN", { weekday: "short" });

    const col = document.createElement("div");
    col.className = "col-3";

    const card = document.createElement("div");
    card.className = "date-card text-center p-2 border rounded";
    card.innerHTML = `
      <div class="date-weekday">${weekday}</div>
      <div class="date-number">${day}/${month}</div>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".date-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      selectedDate = dateStr; // YYYY-MM-DD
      renderSchedules();
    });

    col.appendChild(card);
    dateList.appendChild(col);
  });
}


  function renderSchedules() {
    if (!selectedDate) {
      console.warn("Chưa chọn ngày.");
      return;
    }

    const container = document.getElementById("scheduleContainer");
    container.innerHTML = "";

    // Lọc theo ngày
    const filtered = schedules.filter(s => s.showDate.split("T")[0] === selectedDate);

    if (filtered.length === 0) {
      container.innerHTML = "<p class='text-white'>Không có lịch chiếu.</p>";
      return;
    }

    // Nhóm theo cinemaId
    const groupedByCinema = {};
    filtered.forEach(s => {
      const cinemaId = s.cinemaId;
      if (!groupedByCinema[cinemaId]) {
        groupedByCinema[cinemaId] = {
          cinema: s.cinema,
          showtimes: []
        };
      }
      groupedByCinema[cinemaId].showtimes.push(s);
    });

    // Hiển thị
    for (const cinemaId in groupedByCinema) {
      const group = groupedByCinema[cinemaId];
      const cinemaDiv = document.createElement("div");
      cinemaDiv.className = "cardchedule";

      const showtimeHTML = group.showtimes.map(sch => {
        const time = new Date(sch.showTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        });

        return `<a class="showtime-btn" data-schedule-id="${sch.id}" data-room-id="${sch.roomId}">${time}</a>`;
      }).join("");

      cinemaDiv.innerHTML = ` 
        <div class="theater-header" data-bs-toggle="collapse" data-bs-target="#theaterInfo_${cinemaId}">
          <h3 class="theater-name">${group.cinema.cinema_name}</h3>
          <i class="fas fa-chevron-up"></i>
        </div>
        <div id="theaterInfo_${cinemaId}" class="collapse show">
          <div class="theater-address">
            ${group.cinema.cinema_address}
          </div>
          <div class="showtimes-section">
            <div class="showtimes-grid">${showtimeHTML}</div>
          </div>
        </div>
      `;

      container.appendChild(cinemaDiv);

      // Gắn event cho từng nút giờ chiếu
      cinemaDiv.querySelectorAll(".showtime-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".showtime-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");

          const scheduleId = btn.dataset.scheduleId;
          const roomId = btn.dataset.roomId;

          const scheduleSelect = document.getElementById("scheduleSelect");
          if (scheduleSelect) {
            scheduleSelect.value = scheduleId;
          } else {
            window.selectedScheduleId = scheduleId;
          }

          renderSeats(roomId);
          loadComponent("selection_seat", "seats.html");
        });
      });
    }
  }



// Render ghế ngồi
async function renderSeats(roomId) {
  const response = await fetch(`http://localhost:3000/api/seats/${roomId}`);
  const result = await response.json();
  const seats = result.Data;

  const grouped = {};
  seats.forEach(seat => {
    const row = seat.seatNumber.charAt(0);
    if (!grouped[row]) grouped[row] = [];
    grouped[row].push(seat);
  });

  const container = document.getElementById("seats-container");
  container.innerHTML = "";

  Object.keys(grouped).sort().forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "seat-row";

    const rowLabel = document.createElement("div");
    rowLabel.className = "row-label";
    rowLabel.textContent = row;

    const seatsDiv = document.createElement("div");
    seatsDiv.className = "seats";

    const spacer = document.createElement("div");
    spacer.className = "seat-spacer";
    seatsDiv.appendChild(spacer);

    grouped[row].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)).forEach(seat => {
      const seatDiv = document.createElement("div");
      seatDiv.className = "seat";
      seatDiv.setAttribute("data-seat", seat.id);
      seatDiv.setAttribute("data-seat-id", seat.id);
      seatDiv.textContent = seat.seatNumber;
      seatDiv.setAttribute("data-seat-name", seat.seatNumber);

      if (seat.type === "couple") seatDiv.classList.add("couple");
      if (seat.status === "booked") seatDiv.classList.add("reserved");

      seatDiv.addEventListener("click", () => {
        if (!seatDiv.classList.contains("reserved")) {
          seatDiv.classList.toggle("selected");
        }
      });

      seatsDiv.appendChild(seatDiv);
    });

    rowDiv.appendChild(rowLabel);
    rowDiv.appendChild(seatsDiv);
    container.appendChild(rowDiv);
  });
}

// Lấy ID phim từ URL
function getFilmIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("film_id") || urlParams.get("id");
}

// Lấy ID lịch chiếu đã chọn
function getSelectedScheduleId() {
  const scheduleSelect = document.getElementById("scheduleSelect");
  return scheduleSelect?.value || window.selectedScheduleId;
}

// Lấy danh sách ghế đã chọn
function getSelectedSeats() {
  return Array.from(document.querySelectorAll(".seat.selected"))
    .map(seat => seat.dataset.seat);
}

function getSelectedNameSeats() {
  const selectedSeats = document.querySelectorAll(".seat.selected");
  return Array.from(selectedSeats).map(seat => seat.getAttribute("data-seat-name"));
}

// Giữ ghế
async function holdSeats(film_id, schedule_id, seats ,seats_Number) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:3000/customer/hold-seat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
      body: JSON.stringify({
        film_id: parseInt(film_id),
        schedule_id: parseInt(schedule_id),
        seats: seats.map(id => parseInt(id)),
        seat_name : seats_Number.map(id=>id)
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert("Ghế đã được giữ thành công!");
      window.location.href = `/ticket_booking.html?bookingSessionId=${data.bookingSessionId}`;
    } else {
      alert("Ghế này đang được giữ bởi người khác");
    }
  } catch (error) {
    console.error("Lỗi khi giữ ghế:", error);
    alert("Đã xảy ra lỗi khi giữ ghế.");
  }
}

// Khi nhấn nút giữ ghế
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("holdSeatBtn")?.addEventListener("click", () => {
    const film_id = getFilmIdFromUrl();
    const schedule_id = getSelectedScheduleId();
    const seats = getSelectedSeats();
    const seats_number = getSelectedNameSeats();

    if (!film_id || !schedule_id || seats.length === 0) {
      alert("Vui lòng chọn lịch chiếu và ít nhất 1 ghế!");
      return;
    }
    console.log(film_id);
    console.log(schedule_id);
    console.log(seats);
    
    holdSeats(film_id, schedule_id, seats,seats_number);
  });
});
