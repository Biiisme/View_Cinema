
  let totalSeconds = 5 * 60; // 5 phút = 300 giây

  function updateCountdown() {
    const countdownElement = document.getElementById("countdown");

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (totalSeconds > 0) {
      totalSeconds--;
    } else {
      clearInterval(timer);
      alert("Thời gian giữ vé đã hết!");
      film_id = getFilmIdFromUrl();
      window.location.href = `/movie_detail.html?id=${film_id}`;
    }
  }

  const timer = setInterval(updateCountdown, 1000);
  updateCountdown();

  // Khi DOM đã load
  document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingSessionId = urlParams.get("bookingSessionId");
  
    if (!bookingSessionId) return alert("Không tìm thấy bookingSessionId.");
  
    const token = localStorage.getItem("token"); // Hoặc cách bạn lưu token
  
    try {
      const response = await fetch(`http://localhost:3000/customer/get-hold-seat?bookingSessionId=${bookingSessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const err = await response.json();
        return alert(err.error || "Lỗi khi lấy thông tin giữ ghế");
      }
  
      const result = await response.json();
      const data = result.data;
      loadBookingInfo(data)
  
    } catch (error) {
      console.error("Lỗi kết nối API giữ ghế:", error);
      alert("Không thể kết nối tới server.");
    }
  });

  function loadBookingInfo(data) {
    document.getElementById("seat-name").innerText = data.seat_name.join(", ");
    
    const lenSeat = data.seats.length
    document.querySelector(".total-value").innerText = lenSeat*45 + ",000VND";

    fetch("http://localhost:3000/api/schedules/detail/" + encodeURIComponent(data.schedule_id))
        .then(res => res.json())
        .then(res => {
            const data = res.data;
            const formattedShowTime = formatShowTime(data.showTime);

            document.querySelector(".movie-title").innerText = data.film.title;
            document.getElementById("showtime").innerText = formattedShowTime;
            document.getElementById("room-name").innerText = data.room.room_name;
            document.getElementById("cinema-name").innerText = data.cinema.cinema_name
            document.getElementById("cinema-address").innerText = data.cinema.cinema_address
        })
        .catch(err => {
            console.error("Lỗi khi load dữ liệu giữ ghế:", err);
            alert("Không thể load thông tin giữ ghế.");
        });
  }

function formatShowTime(isoString) {
  const date = new Date(isoString);

  const time = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const weekday = date.toLocaleDateString('vi-VN', {
    weekday: 'long'
  });

  const dayMonthYear = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return `${time} ${capitalizeFirstLetter(weekday)} ${dayMonthYear}`;
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

document.addEventListener('DOMContentLoaded', function () {
    const visaMethod = document.getElementById('method-visa');
    const visaModal = new bootstrap.Modal(document.getElementById('visaPaymentModal'));

    visaMethod.addEventListener('click', function () {
        visaModal.show();
    });
});

document.addEventListener('DOMContentLoaded', () => {
  const bookingSessionId = new URLSearchParams(window.location.search).get("bookingSessionId");
  const token = localStorage.getItem("token");

  const confirmBtn = document.querySelector('#visaPaymentModal .btn-primary');

  confirmBtn.addEventListener('click', () => {
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardName = document.getElementById('cardName').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert('Vui lòng nhập đầy đủ thông tin thẻ.');
      return;
    }

    if (cardNumber !== "0388197765123456") {
      alert('Số thẻ sai');
      return;
    }

    // Gọi API thanh toán
    bookingticket(bookingSessionId, token).then(() => {
      alert('Thanh toán thành công!');

      const modal = bootstrap.Modal.getInstance(document.getElementById('visaPaymentModal'));
      modal.hide();

      document.querySelector('#visaPaymentModal form').reset();
      window.location.href = `/movie_home.html`;
    });
  });
});
async function bookingticket(bookingSessionId,token) {
    const response =await fetch("http://localhost:3000/customer/bookingticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingSessionId: bookingSessionId,
        }),
      });
    if (!response.ok) {
        const err = await response.json();
        return alert(err.Message);
      }
  }