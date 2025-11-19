// auth.js - Protección de páginas individuales
document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = sessionStorage.getItem("loggedIn");
  const userRole = sessionStorage.getItem("userRole");
  const currentPage = window.location.pathname.split('/').pop();

  console.log("Verificando permisos para:", currentPage);
  console.log("Rol del usuario:", userRole);

  // Verificar autenticación
  if (!loggedIn || loggedIn !== "true") {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "login.html";
    return;
  }

  // Definir permisos por rol - según tu diagrama UML
  const permisos = {
    'brigadista': [
      'inicio-Pantalla.html',
      'subirArbol.html', 
      'subirSuelo.html', 
      'registro.html'
    ],
    'encargado': [
      'inicio-Pantalla.html',
      'estadisticas.html', 
      'gestionBrigadas.html', 
      'supervision.html'
    ]
  };

  // Verificar si el usuario tiene acceso a la página actual
  const paginasPermitidas = permisos[userRole];
  
  if (!paginasPermitidas || !paginasPermitidas.includes(currentPage)) {
    alert(`No tienes permisos para acceder a ${currentPage}.`);
    window.location.href = "inicio-Pantalla.html";
    return;
  }

  // Opcional: Ocultar elementos del menú que no correspondan al rol
  ocultarElementosNoPermitidos(userRole);
});

function ocultarElementosNoPermitidos(rol) {
  // Ocultar enlaces del dashboard si existen en esta página
  const elementosBrigadista = document.querySelectorAll('a[href*="subirArbol"], a[href*="subirSuelo"], a[href*="registro"]');
  const elementosEncargado = document.querySelectorAll('a[href*="estadisticas"], a[href*="gestionBrigadas"], a[href*="supervision"]');

  if (rol === 'brigadista') {
    elementosEncargado.forEach(elemento => {
      elemento.style.display = 'none';
    });
  } else if (rol === 'encargado') {
    elementosBrigadista.forEach(elemento => {
      elemento.style.display = 'none';
    });
  }
}