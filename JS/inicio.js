// inicio.js — Verifica sesión y maneja roles para tu estructura HTML
document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = sessionStorage.getItem("loggedIn");
  const username = sessionStorage.getItem("username");
  const userRole = sessionStorage.getItem("userRole");
  const userLabel = document.querySelector(".texto-arriba");
  const logoutBtn = document.querySelector(".texto-abajo");
  const dashboard = document.querySelector(".dashboard");

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

  // Mostrar dashboard según el rol
  if (dashboard) {
    mostrarDashboardSegunRol(userRole, dashboard);
  }

  // Actualizar accesos directos según el rol
  actualizarAccesosDirectos(userRole);

  // Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }
});

function mostrarDashboardSegunRol(rol, dashboardElement) {
  if (rol === 'brigadista') {
    dashboardElement.innerHTML = `
      <a href="subirArbol.html" class="dashboard-btn">Subir Árbol</a> 
      <a href="subirSuelo.html" class="dashboard-btn">Subir Suelo</a> 
      <a href="registro.html" class="dashboard-btn">Registro</a>
    `;
  } else if (rol === 'encargado') {
    dashboardElement.innerHTML = `
      <a href="estadisticas.html" class="dashboard-btn">Estadísticas</a>
      <a href="gestionBrigadas.html" class="dashboard-btn">Gestión Brigadas</a>
      <a href="supervision.html" class="dashboard-btn">Supervisión</a>
    `;
  }
}

function actualizarAccesosDirectos(rol) {
  const accesosDirectos = document.querySelector('.accesos-directos');
  
  if (accesosDirectos) {
    if (rol === 'brigadista') {
      accesosDirectos.innerHTML = `
        <a href="subirArbol.html" class="acceso-btn">Subir Árbol</a>
        <a href="subirSuelo.html" class="acceso-btn">Subir Suelo</a>
        <a href="registro.html" class="acceso-btn">Consultar Registro</a>
      `;
    } else if (rol === 'encargado') {
      accesosDirectos.innerHTML = `
        <a href="estadisticas.html" class="acceso-btn">Generar Reporte</a>
        <a href="gestionBrigadas.html" class="acceso-btn">Gestión Brigadas</a>
        <a href="supervision.html" class="acceso-btn">Supervisión</a>
      `;
    }
  }
}