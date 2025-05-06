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