// auth.js - Para incluir en páginas específicas (subirArbol.html, estadisticas.html, etc.)
document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = sessionStorage.getItem("loggedIn");
  const userRole = sessionStorage.getItem("userRole");
  const currentPage = window.location.pathname.split('/').pop();

  // Verificar autenticación
  if (!loggedIn || loggedIn !== "true") {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "login.html";
    return;
  }

  // Definir permisos por rol
  const permisos = {
    'brigadista': ['subirArbol.html', 'subirSuelo.html', 'registro.html', 'inicio-Pantalla.html'],
    'encargado': ['estadisticas.html', 'gestionBrigadas.html', 'supervision.html', 'inicio-Pantalla.html']
  };

  // Verificar si el usuario tiene acceso a la página actual
  if (permisos[userRole] && !permisos[userRole].includes(currentPage)) {
    alert("No tienes permisos para acceder a esta página.");
    window.location.href = "inicio-Pantalla.html";
    return;
  }

  // Opcional: Mostrar información del usuario en páginas protegidas
  const userInfoElement = document.getElementById('userInfo');
  const username = sessionStorage.getItem('username');
  
  if (userInfoElement && username) {
    userInfoElement.textContent = `${username} (${userRole})`;
  }
});