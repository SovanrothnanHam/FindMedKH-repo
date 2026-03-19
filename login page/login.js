document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  if (!loginForm) {
    console.error("loginForm not found!");
    return;
  }

  const accounts = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "user", password: "user123", role: "user" }
  ];

  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const foundUser = accounts.find(
      acc => acc.username === username && acc.password === password
    );

    if (!foundUser) {
      loginMessage.textContent = "Invalid username or password.";
      loginMessage.style.color = "#d62828";
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(foundUser));

    if (foundUser.role === "admin") {
      window.location.href = "../admin page/admin.html";
    } else {
      window.location.href = "../home page/home.html";
    }
  });

});