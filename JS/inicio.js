// inicio.js — Verifica si hay sesión activa
document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = sessionStorage.getItem("loggedIn");
  const username = sessionStorage.getItem("username");
  const userLabel = document.querySelector(".texto-arriba");
  const logoutBtn = document.querySelector(".texto-abajo");

  // Si no hay sesión activa, redirige al login
  if (!loggedIn || loggedIn !== "true") {
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
    return;
  }

  // Muestra el nombre del usuario
  if (userLabel && username) {
    userLabel.textContent = username;
  }

  // Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }
});
