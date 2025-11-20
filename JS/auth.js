/**
 * SISTEMA DE AUTENTICACIÓN Y CONTROL DE ACCESO - IFN COLOMBIA
 * 
 * Este módulo maneja la protección de páginas individuales basada en roles de usuario.
 * Implementa un sistema de permisos que restringe el acceso a funcionalidades
 * según el rol del usuario autenticado (brigadista o encargado).
 * 
 * @file auth.js
 * @version 1.1
 * @author Inventario Forestal Nacional - Colombia
 * 
 * @description
 * Este script se ejecuta en todas las páginas protegidas del sistema y verifica:
 * 1. Que el usuario esté autenticado
 * 2. Que el usuario tenga permisos para acceder a la página actual
 * 3. Oculta elementos del menú que no correspondan al rol del usuario
 */

/**
 * Verificación de autenticación y control de acceso por roles
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Estado de autenticación del usuario almacenado en sessionStorage
   * @type {string}
   */
  const loggedIn = sessionStorage.getItem("loggedIn");
  
  /**
   * Rol del usuario actual obtenido de sessionStorage
   * Valores posibles: 'brigadista', 'encargado'
   * @type {string}
   */
  const userRole = sessionStorage.getItem("userRole");
  
  /**
   * Nombre del archivo de la página actual
   * Se extrae de la ruta completa de la URL
   * @type {string}
   */
  const currentPage = window.location.pathname.split('/').pop();

  // Logs para debugging del sistema de permisos
  console.log("Verificando permisos para:", currentPage);
  console.log("Rol del usuario:", userRole);

  // =============================================
  // VERIFICACIÓN DE AUTENTICACIÓN
  // =============================================

  /**
   * Verifica si el usuario está autenticado
   * Si no hay sesión activa, redirige al login
   */
  if (!loggedIn || loggedIn !== "true") {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "login.html";
    return;
  }

  // =============================================
  // DEFINICIÓN DE PERMISOS POR ROL
  // =============================================

  /**
   * Objeto que define los permisos de acceso por rol de usuario
   * Basado en el diagrama UML del sistema
   * @type {Object}
   * @property {Array} brigadista - Páginas accesibles para brigadistas
   * @property {Array} encargado - Páginas accesibles para encargados
   */
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

  // =============================================
  // VERIFICACIÓN DE PERMISOS PARA PÁGINA ACTUAL
  // =============================================

  /**
   * Obtiene la lista de páginas permitidas para el rol del usuario actual
   * @type {Array}
   */
  const paginasPermitidas = permisos[userRole];
  
  /**
   * Verifica si el usuario tiene acceso a la página actual
   * Si no tiene permisos, redirige a la página de inicio
   */
  if (!paginasPermitidas || !paginasPermitidas.includes(currentPage)) {
    alert(`No tienes permisos para acceder a ${currentPage}.`);
    window.location.href = "inicio-Pantalla.html";
    return;
  }

  // =============================================
  // AJUSTE DE INTERFAZ SEGÚN ROL
  // =============================================

  /**
   * Oculta elementos del menú que no correspondan al rol del usuario
   * Mejora la experiencia de usuario mostrando solo las opciones relevantes
   */
  ocultarElementosNoPermitidos(userRole);
});

/**
 * Oculta elementos del menú de navegación que no son accesibles para el rol del usuario
 * @param {string} rol - Rol del usuario actual ('brigadista' o 'encargado')
 * @returns {void}
 */
function ocultarElementosNoPermitidos(rol) {
  /**
   * Elementos del menú destinados a brigadistas
   * @type {NodeList}
   */
  const elementosBrigadista = document.querySelectorAll(
    'a[href*="subirArbol"], a[href*="subirSuelo"], a[href*="registro"]'
  );
  
  /**
   * Elementos del menú destinados a encargados
   * @type {NodeList}
   */
  const elementosEncargado = document.querySelectorAll(
    'a[href*="estadisticas"], a[href*="gestionBrigadas"], a[href*="supervision"]'
  );

  /**
   * Lógica para ocultar elementos según el rol:
   * - Brigadistas: ocultan elementos de encargado
   * - Encargados: ocultan elementos de brigadista
   */
  if (rol === 'brigadista') {
    elementosEncargado.forEach(elemento => {
      elemento.style.display = 'none';
    });
    console.log("Ocultados elementos de encargado para brigadista");
  } else if (rol === 'encargado') {
    elementosBrigadista.forEach(elemento => {
      elemento.style.display = 'none';
    });
    console.log("Ocultados elementos de brigadista para encargado");
  }
}