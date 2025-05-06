
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
    fetch("http://localhost:3000/api/film/" + encodeURIComponent(data.film_id))
        .then(res => res.json())
        .then(res => {
            const data = res.Data;

            document.querySelector(".movie-title").innerText = data.title;
        })
        .catch(err => {
            console.error("Lỗi khi load dữ liệu giữ ghế:", err);
            alert("Không thể load thông tin giữ ghế.");
        });
    const lenSeat = data.seats.length
    document.querySelector(".total-value").innerText = lenSeat*45 + ",000VND";

    fetch("http://localhost:3000/api/schedules/detail/" + encodeURIComponent(data.schedule_id))
        .then(res => res.json())
        .then(res => {
            const data = res.Data;

            document.querySelector(".movie-title").innerText = data.title;
            
        })
        .catch(err => {
            console.error("Lỗi khi load dữ liệu giữ ghế:", err);
            alert("Không thể load thông tin giữ ghế.");
        });
  }