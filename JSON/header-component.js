class HeaderComponent extends HTMLElement {
    connectedCallback() {
      fetch('/Layout/header.html')
        .then(res => res.text())
        .then(html => {
          this.innerHTML = html;
          this.checkLoginStatus(); // Gọi từ bên trong
        });
    }
  
    checkLoginStatus() {
      const token = localStorage.getItem("token");
      const userName = localStorage.getItem("username");
      const loginBtn = this.querySelector("#login-button"); // tìm trong chính header thôi
  
      if (token && userName && loginBtn) {
        loginBtn.textContent = `Xin chào, ${userName}`;
        loginBtn.href = "account_profile.html";
      }
    }
  }
  
  customElements.define('header-component', HeaderComponent);

 class SidebarComponent extends HTMLElement {
  connectedCallback() {
    fetch('/Layout/sidebar.html')
      .then(res => res.text())
      .then(html => {
        this.innerHTML = html;

        // Gắn sự kiện sau khi innerHTML xong
        const submenuLinks = this.querySelectorAll(".sidebar-item.has-submenu > .sidebar-link");
        submenuLinks.forEach(link => {
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const parentItem = link.parentElement;
            parentItem.classList.toggle("open");
          });
        });
      });
  }
}

customElements.define('sidebar-component', SidebarComponent);

class NavbarComponent extends HTMLElement {
  connectedCallback() {
    fetch('/Layout/navbar.html')
      .then(res => res.text())
      .then(html => {
        this.innerHTML = html;

        // Sau khi innerHTML xong, mới tìm được logoutBtn
        const logoutBtn = this.querySelector("#logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();

            // Hiển thị hộp thoại xác nhận
            const confirmLogout = confirm("Bạn có chắc chắn muốn đăng xuất?");
            if (confirmLogout) {
              localStorage.clear();
              window.location.href = "movie_home.html";
            }
          });
        }
      });
  }
}
customElements.define('navbar-component', NavbarComponent);

class FooterComponent extends HTMLElement {
  connectedCallback() {
    fetch('/Layout/footer.html')
      .then(res => res.text())
      .then(html => {
        this.innerHTML = html;

      });
  }
}
customElements.define('footer-component', FooterComponent);