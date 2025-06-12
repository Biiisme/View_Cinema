
// Hàm định dạng ngày giờ chiếu
function formatShowTime(showTimeStr) {
    const date = new Date(showTimeStr);
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

// Hàm định dạng ngày thanh toán
function formatPaymentDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN");
}
const token = localStorage.getItem("token"); // hoặc từ cookie / biến toàn cục tuỳ bạn lưu ở đâu

fetch("http://localhost:3000/customer/list-ticket", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
})
    .then(res => res.json())
    .then(async response => {
        const tickets = response.Data;
        const ticketContainer = document.getElementById("ticket-list");

        const scheduleIds = [...new Set(tickets.map(t => t.schedule_id))];

        const scheduleDataMap = {};
        await Promise.all(scheduleIds.map(async (id) => {
            try {
                const res = await fetch("http://localhost:3000/api/schedules/detail/" + encodeURIComponent(id));
                const detail = await res.json();
                scheduleDataMap[id] = detail.data;
            } catch (error) {
                console.error("Lỗi lấy lịch chiếu:", id, error);
            }
        }));

        tickets.forEach(ticket => {
            const schedule = scheduleDataMap[ticket.schedule_id];
            if (!schedule) return;

            const showDate = new Date(schedule.showDate).toLocaleDateString("vi-VN");
            const dateObj = new Date(schedule.showTime);
            const showTime = dateObj.toLocaleTimeString("vi-VN", {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
            }); 
            const paymentDate = formatPaymentDate(ticket.payment_date);

            const ticketHTML = `
                <tr>
                    <td class="movie-title" id="movie-title">${schedule.film.title}</td>
                    <td class="showtime">
                        <div class="time" id="time">${showTime}</div>
                        <small class="text-muted" id="text-muted">${showDate}</small>
                    </td>
                    <td>
                        <span class="cinema-name" id="cinema-name">${schedule.cinema.cinema_name}</span>
                    </td>
                    <td>
                        <span class="room-name" id="room-name"> ${schedule.room.room_name}</span>
                    </td>
                    <td>
                        <span class="seat-info" id="seat-info">${ticket.seat}</span>
                    </td>
                    <td class="purchase-date" id="purchase-date">${paymentDate}</td>
                    <td>
                        <img class="qr-code"  id="qr-code"
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgLCEfwx8yDcF7yTxiLUwzNAWVSCAY0fQgnblUNHjYxMqVsWb8r4_zNWN0hGhcAPQGGNA&usqp=CAU"
                                alt="QR Code"
                                title="Mã QR vé">
                    </td>
                </tr>
            `;
            ticketContainer.innerHTML += ticketHTML;
        });
    })
    .catch(err => {
        console.error("Lỗi khi load vé:", err);
        alert("Không thể load vé.");
    });

// Add some interactive functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect to table rows
    const tableRows = document.querySelectorAll('.history-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
    
    // QR Code click functionality
    const qrCodes = document.getElementById("qr-code");
    qrCodes.forEach(qr => {
        qr.addEventListener('click', function() {
            alert('Hiển thị mã QR chi tiết');
        });
    });
});