document.addEventListener('DOMContentLoaded', () => {
  // Gọi API lấy thông tin người dùng
  fetch('http://localhost:3000/customer/user/profile', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
  })
  .then(response => {
      if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu người dùng');
      return response.json();
  })
  .then(result => {
      const user = result.Data?.data;
      if (!user) return;

      // Gán dữ liệu vào các input trong form
      document.getElementById('fullName').value = user.fullName || '';
      document.getElementById('email').value = user.email || '';
      document.getElementById('phoneNumber').value = user.phone_number;
      document.getElementById('birthDate').value = user.birth_date.split('T')[0]; // chuẩn hóa định dạng
      
  })
  .catch(error => {
      console.error('Lỗi:', error);
      alert('Không thể tải thông tin khách hàng. Vui lòng thử lại sau.');
  });
});

  
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("personalInfoForm");
    const saveBtn = document.getElementById("saveBtn");
    const inputFields = form.querySelectorAll("input");

    // Lưu giá trị ban đầu của các trường nhập liệu
    const initialValues = Array.from(inputFields).map(input => input.value);

    // Kiểm tra sự thay đổi trong các trường nhập liệu
    inputFields.forEach(input => {
        input.addEventListener("input", () => {
            const isChanged = Array.from(inputFields).some((input, index) => input.value !== initialValues[index]);
            saveBtn.disabled = !isChanged;  // Disable nút lưu nếu không có thay đổi
        });
    });

    // Lắng nghe sự kiện submit của form
    form.addEventListener("submit", async function (e) {
        e.preventDefault(); // Chặn reload trang

        const fullName = document.getElementById("fullName").value.trim();
        const birthDate = document.getElementById("birthDate").value;
        const phoneNumber = document.getElementById("phoneNumber").value.trim();
        const email = document.getElementById("email").value.trim();
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");

        const apiUrl = `http://localhost:3000/customer/update-profile/${userId}`; // Thay {{host}} bằng URL thực tế
        const payload = {
            full_name: fullName,
            birth_date: birthDate, // ISO 8601 format: "2024-01-03"
            phone_number: phoneNumber,
            email: email
        };

        try {
            const res = await fetch(apiUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                alert("Cập nhật thành công!");
                console.log(data);
            } else {
                const error = await res.json();
                alert(`Lỗi cập nhật: ${error.message || "Không rõ nguyên nhân"}`);
                console.error(error);
            }
        } catch (err) {
            console.error("Lỗi kết nối:", err);
            alert("Không thể kết nối tới server.");
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {

            localStorage.clear();
            window.location.href = "movie_home.html"; 
        });
    }
});