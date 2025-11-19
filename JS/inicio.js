/**
 * SISTEMA DE INICIO - INVENTARIO FORESTAL NACIONAL
 * Archivo: inicio.js
 * Propósito: Gestión de autenticación, roles y personalización de la página de inicio
 * Funcionalidades principales:
 *   - Verificación de sesión de usuario
 *   - Personalización de interfaz según rol
 *   - Actualización dinámica de elementos de navegación
 *   - Manejo seguro de cierre de sesión
 * Dependencias: sessionStorage para gestión de estado de sesión
 * Autor: Equipo IFN Colombia
 * Versión: 1.0
 * Fecha: 2024
 */

/**
 * MANEJADOR DE CARGA DEL DOCUMENTO
 * Propósito: Ejecutar código cuando el DOM está completamente cargado
 * Garantiza que todos los elementos HTML estén disponibles para manipulación
 * Flujo: Verificación de sesión → Personalización → Configuración de eventos
 */
document.addEventListener("DOMContentLoaded", () => {
  // ===== OBTENCIÓN DE DATOS DE SESIÓN =====
  /**
   * DATOS DE SESIÓN DEL USUARIO
   * Propósito: Recuperar información de sesión del sessionStorage
   * Origen: Datos guardados durante el proceso de login
   * Estructura:
   *   - loggedIn: Estado de autenticación (string "true")
   *   - username: Nombre del usuario logueado
   *   - userRole: Rol del usuario (brigadista, encargado, etc.)
   */
  const loggedIn = sessionStorage.getItem("loggedIn");
  const username = sessionStorage.getItem("username");
  const userRole = sessionStorage.getItem("userRole");
  
  // ===== REFERENCIAS A ELEMENTOS DEL DOM =====
  /**
   * ELEMENTOS DE INTERFAZ A MANIPULAR
   * Propósito: Obtener referencias a elementos HTML para actualización dinámica
   * Elementos:
   *   - userLabel: Etiqueta que muestra el nombre del usuario
   *   - logoutBtn: Botón para cerrar sesión
   *   - dashboard: Contenedor del menú de navegación principal
   */
  const userLabel = document.querySelector(".texto-arriba");
  const logoutBtn = document.querySelector(".texto-abajo");
  const dashboard = document.querySelector(".dashboard");

  // ===== VERIFICACIÓN DE SESIÓN ACTIVA =====
  /**
   * VALIDACIÓN DE AUTENTICACIÓN
   * Propósito: Garantizar que solo usuarios autenticados accedan al sistema
   * Lógica: Si no hay sesión activa, redirige inmediatamente al login
   * Seguridad: Previene acceso no autorizado a la aplicación
   */
  if (!loggedIn || loggedIn !== "true") {
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
    return;
  }

  // ===== ACTUALIZACIÓN DE INTERFAZ DE USUARIO =====
  /**
   * ACTUALIZACIÓN DE NOMBRE DE USUARIO
   * Propósito: Mostrar el nombre del usuario logueado en la interfaz
   * Condición: Solo actualiza si el elemento existe y hay nombre de usuario
   * Mejora de UX: Personalización y confirmación visual de sesión activa
   */
  if (userLabel && username) {
    userLabel.textContent = username;
  }

  // ===== CONFIGURACIÓN DE NAVEGACIÓN SEGÚN ROL =====
  /**
   * PERSONALIZACIÓN DEL DASHBOARD PRINCIPAL
   * Propósito: Mostrar solo las opciones de navegación permitidas para cada rol
   * Seguridad: Implementación de control de acceso basado en roles (RBAC)
   * Experiencia: Interface adaptada a las responsabilidades de cada usuario
   */
  if (dashboard) {
    mostrarDashboardSegunRol(userRole, dashboard);
  }

  // ===== ACTUALIZACIÓN DE ACCESOS DIRECTOS =====
  /**
   * PERSONALIZACIÓN DE ACCESOS RÁPIDOS
   * Propósito: Adaptar los botones de acceso directo según el rol del usuario
   * Beneficio: Interface más eficiente y relevante para cada tipo de usuario
   */
  actualizarAccesosDirectos(userRole);

  // ===== CONFIGURACIÓN DE CIERRE DE SESIÓN =====
  /**
   * MANEJO DEL BOTÓN DE CERRAR SESIÓN
   * Propósito: Configurar el evento para finalizar la sesión de forma segura
   * Seguridad: Limpia todos los datos de sesión antes de redirigir
   * UX: Proporciona una forma clara y accesible de salir del sistema
   */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Limpieza completa de datos de sesión
      sessionStorage.clear();
      // Redirección a página de login
      window.location.href = "login.html";
    });
  }
});

/**
 * CONFIGURA EL DASHBOARD SEGÚN EL ROL DEL USUARIO
 * @param {string} rol - Rol del usuario (brigadista, encargado, etc.)
 * @param {HTMLElement} dashboardElement - Elemento del DOM que contiene el dashboard
 * Propósito: Mostrar solo las opciones de navegación permitidas para cada rol
 * Roles implementados:
 *   - brigadista: Funcionalidades de campo (registro de datos)
 *   - encargado: Funcionalidades de gestión y supervisión
 * Principio de seguridad: Mínimo privilegio - solo lo necesario para cada rol
 */
function mostrarDashboardSegunRol(rol, dashboardElement) {
  // ===== ROL: BRIGADISTA =====
  /**
   * CONFIGURACIÓN PARA BRIGADISTAS
   * Propósito: Usuarios que trabajan en campo recolectando datos
   * Funcionalidades permitidas:
   *   - Subir Árbol: Registro de especímenes arbóreos
   *   - Subir Suelo: Registro de muestras de suelo
   *   - Registro: Consulta y gestión de registros propios
   * Restricciones: No acceso a funciones administrativas
   */
  if (rol === 'brigadista') {
    dashboardElement.innerHTML = `
      <a href="subirArbol.html" class="dashboard-btn">Subir Árbol</a> 
      <a href="subirSuelo.html" class="dashboard-btn">Subir Suelo</a> 
      <a href="registro.html" class="dashboard-btn">Registro</a>
    `;
  }
  // ===== ROL: ENCARGADO =====
  /**
   * CONFIGURACIÓN PARA ENCARGADOS
   * Propósito: Usuarios con responsabilidades de supervisión y gestión
   * Funcionalidades permitidas:
   *   - Estadísticas: Generación de reportes y análisis
   *   - Gestión Brigadas: Administración de equipos de trabajo
   *   - Supervisión: Monitoreo y control de actividades
   * Privilegios: Acceso a funciones administrativas y de supervisión
   */
  else if (rol === 'encargado') {
    dashboardElement.innerHTML = `
      <a href="estadisticas.html" class="dashboard-btn">Estadísticas</a>
      <a href="gestionBrigadas.html" class="dashboard-btn">Gestión Brigadas</a>
      <a href="supervision.html" class="dashboard-btn">Supervisión</a>
    `;
  }
}

/**
 * ACTUALIZA LOS ACCESOS DIRECTOS SEGÚN EL ROL DEL USUARIO
 * @param {string} rol - Rol del usuario (brigadista, encargado, etc.)
 * Propósito: Personalizar los botones de acceso rápido en la página de inicio
 * Beneficios:
 *   - Mejora la eficiencia del usuario
 *   - Reduce la carga cognitiva
 *   - Presenta solo las opciones relevantes
 */
function actualizarAccesosDirectos(rol) {
  /**
   * REFERENCIA AL CONTENEDOR DE ACCESOS DIRECTOS
   * Propósito: Elemento DOM que contiene los botones de acceso rápido
   * Localización: Sección .accesos-directos en el main de la página
   */
  const accesosDirectos = document.querySelector('.accesos-directos');
  
  // Verificar que el elemento existe antes de manipularlo
  if (accesosDirectos) {
    // ===== ROL: BRIGADISTA =====
    /**
     * ACCESOS DIRECTOS PARA BRIGADISTAS
     * Propósito: Acceso rápido a las tareas principales de campo
     * Opciones:
     *   - Subir Árbol: Registro rápido de árboles
     *   - Subir Suelo: Registro rápido de muestras de suelo
     *   - Consultar Registro: Revisión de registros existentes
     */
    if (rol === 'brigadista') {
      accesosDirectos.innerHTML = `
        <a href="subirArbol.html" class="acceso-btn">Subir Árbol</a>
        <a href="subirSuelo.html" class="acceso-btn">Subir Suelo</a>
        <a href="registro.html" class="acceso-btn">Consultar Registro</a>
      `;
    }
    // ===== ROL: ENCARGADO =====
    /**
     * ACCESOS DIRECTOS PARA ENCARGADOS
     * Propósito: Acceso rápido a funciones de gestión y supervisión
     * Opciones:
     *   - Generar Reporte: Creación rápida de reportes estadísticos
     *   - Gestión Brigadas: Administración de equipos de trabajo
     *   - Supervisión: Monitoreo de actividades del sistema
     */
    else if (rol === 'encargado') {
      accesosDirectos.innerHTML = `
        <a href="estadisticas.html" class="acceso-btn">Generar Reporte</a>
        <a href="gestionBrigadas.html" class="acceso-btn">Gestión Brigadas</a>
        <a href="supervision.html" class="acceso-btn">Supervisión</a>
      `;
    }
  }
}