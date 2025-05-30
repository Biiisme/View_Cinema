document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("movieForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token"); // hoặc lấy từ nơi bạn lưu
        if (!token) {
            alert("Bạn chưa đăng nhập!");
            return;
        }

        const data = {
            title: form.title.value,
            description: form.description.value,
            genre: form.genre.value.split(",").map(s => s.trim()),
            director: form.director.value,
            actors: form.actors.value.split(",").map(s => s.trim()),
            rated: form.rated.value,
            duration: parseInt(form.duration.value),
            release_date: new Date(form.release_date.value).toISOString(),
            end_date: new Date(form.end_date.value).toISOString(),
            trailer_url: form.trailer_url.value,
            is_coming_soon: form.is_coming_soon.checked,
            is_now_showing: form.is_now_showing.checked,
            poster_url: "https://example.com/poster.jpg" // Hardcode trước
        };

        try {
            const response = await fetch("http://localhost:3000/api/admin/add-film", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi khi thêm phim");
            }

            const result = await response.json();
            alert("Phim đã được thêm thành công!");
            form.reset();

        } catch (error) {
            console.error("Lỗi khi gửi dữ liệu:", error);
            alert("Lỗi khi thêm phim: " + error.message);
        }
    });
});
