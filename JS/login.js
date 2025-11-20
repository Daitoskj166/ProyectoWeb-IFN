/**
 * SISTEMA DE AUTENTICACIÓN - INVENTARIO FORESTAL NACIONAL
 * Archivo: login.js
 * Propósito: Gestión completa del proceso de autenticación de usuarios
 * Funcionalidades principales:
 *   - Validación de credenciales contra base de datos local
 *   - Control de intentos fallidos con bloqueo temporal
 *   - Gestión segura de sesiones con sessionStorage
 *   - Redirección automática según rol de usuario
 *   - Toggle de visibilidad de contraseña
 * Características de seguridad:
 *   - Límite de intentos fallidos (5)
 *   - Bloqueo temporal automático (30 segundos)
 *   - Almacenamiento seguro en sessionStorage
 * Autor: Equipo IFN Colombia
 * Versión: 1.0
 * Fecha: 2025
 */

// ===== PATRÓN IIFE (IMMEDIATELY INVOKED FUNCTION EXPRESSION) =====
/**
 * ESTRUCTURA IIFE
 * Propósito: Crear un scope privado para evitar contaminación del global scope
 * Beneficios: 
 *   - Variables y funciones no son accesibles desde fuera
 *   - Previene conflictos con otros scripts
 *   - Mejor organización y encapsulación del código
 */
(function () {
  // ===== BASE DE DATOS DE USUARIOS =====
  /**
   * DICCIONARIO DE USUARIOS VÁLIDOS
   * Propósito: Almacenar credenciales y datos de usuarios autorizados
   * Estructura: Objeto donde las claves son los nombres de usuario
   * Propiedades de cada usuario:
   *   - password: Contraseña en texto plano (solo para desarrollo)
   *   - role: Rol del usuario en el sistema (brigadista/encargado)
   *   - name: Nombre completo para mostrar en la interfaz
   *   - redirect: Página a la que redirigir después del login
   * NOTA: En producción, esto debería ser reemplazado por autenticación con servidor
   */
  const USERS = {
    "brigadista": {
      password: "brigadista2025",
      role: "brigadista",
      name: "Mayra Navakoba",
      redirect: "inicio-Pantalla.html"
    },
    "encargado": {
      password: "encargado2025", 
      role: "encargado",
      name: "Juanito Validerrama",
      redirect: "inicio-Pantalla.html"
    }
  };

  // ===== CONFIGURACIÓN DE SEGURIDAD =====
  /**
   * PARÁMETROS DE SEGURIDAD
   * Propósito: Definir límites para prevenir ataques de fuerza bruta
   * Configuración:
   *   - MAX_ATTEMPTS: Número máximo de intentos fallidos permitidos
   *   - LOCK_SECONDS: Tiempo de bloqueo en segundos después de exceder intentos
   */
  const MAX_ATTEMPTS = 5;
  const LOCK_SECONDS = 30;

  // ===== REFERENCIAS A ELEMENTOS DEL DOM =====
  /**
   * ELEMENTOS DE INTERFAZ A MANIPULAR
   * Propósito: Obtener referencias a todos los elementos HTML necesarios
   * Elementos capturados:
   *   - form: Formulario completo de login
   *   - userInput: Campo de entrada para nombre de usuario
   *   - passInput: Campo de entrada para contraseña
   *   - submitBtn: Botón de envío del formulario
   *   - msg: Elemento para mostrar mensajes al usuario
   *   - togglePwd: Botón para mostrar/ocultar contraseña
   */
  const form = document.getElementById("loginForm");
  const userInput = document.getElementById("username");
  const passInput = document.getElementById("password");
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("msg");
  const togglePwd = document.getElementById("togglePwd");

  // ===== VARIABLES DE ESTADO =====
  /**
   * ESTADO DE LA AUTENTICACIÓN
   * Propósito: Controlar el estado actual del proceso de login
   * Variables:
   *   - attempts: Contador de intentos fallidos consecutivos
   *   - locked: Bandera que indica si el sistema está bloqueado temporalmente
   *   - lockTimeoutId: Referencia al timeout de bloqueo para posible cancelación
   */
  let attempts = 0;
  let locked = false;
  let lockTimeoutId = null;

  // ===== FUNCIONES DE UTILIDAD =====
  /**
   * MUESTRA UN MENSAJE AL USUARIO
   * @param {string} text - Texto del mensaje a mostrar
   * @param {string} color - Color CSS para el mensaje (opcional, default: amarillo)
   * Propósito: Proporcionar feedback visual al usuario sobre el estado de la autenticación
   * Colores semánticos:
   *   - Amarillo (#f1c40f): Mensajes informativos/neutrales
   *   - Rojo (#e74c3c): Errores y advertencias de seguridad
   *   - Verde (#2ecc71): Éxito y confirmaciones
   *   - Naranja (#e67e22): Advertencias y validaciones
   */
  function showMessage(text, color = "#f1c40f") {
    msg.textContent = text;
    msg.style.color = color;
  }

  /**
   * ACTIVA EL BLOQUEO TEMPORAL DEL SISTEMA
   * @param {number} seconds - Número de segundos que durará el bloqueo
   * Propósito: Prevenir ataques de fuerza bruta bloqueando el login temporalmente
   * Acciones realizadas:
   *   - Deshabilita todos los campos del formulario
   *   - Muestra cuenta regresiva al usuario
   *   - Restaura el estado normal una vez terminado el tiempo
   */
  function setLocked(seconds) {
    // Activar estado de bloqueo
    locked = true;
    userInput.disabled = true;
    passInput.disabled = true;
    submitBtn.disabled = true;

    // Configurar cuenta regresiva
    let remaining = seconds;
    showMessage(`Bloqueado por ${remaining}s`, "#e74c3c");

    // Intervalo para actualizar la cuenta regresiva cada segundo
    lockTimeoutId = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        showMessage(`Bloqueado por ${remaining}s`, "#e74c3c");
      } else {
        // Restaurar estado normal cuando termina el bloqueo
        clearInterval(lockTimeoutId);
        locked = false;
        attempts = 0; // Reiniciar contador de intentos
        userInput.disabled = false;
        passInput.disabled = false;
        submitBtn.disabled = false;
        showMessage("Puedes intentar de nuevo.", "#f1c40f");
      }
    }, 1000);
  }

  // ===== CONFIGURACIÓN DE EVENT LISTENERS =====
  /**
   * BOTÓN PARA MOSTRAR/OCULTAR CONTRASEÑA
   * Propósito: Mejorar la UX permitiendo verificar la contraseña escrita
   * Funcionalidad: Alterna entre tipo "password" (oculto) y "text" (visible)
   * Iconos utilizados:
   *   - 🔒: Contraseña oculta (estado inicial)
   *   - 👁️: Contraseña visible
   */
  togglePwd.addEventListener("click", () => {
    if (passInput.type === "password") {
      passInput.type = "text";
      togglePwd.textContent = "👁️";
    } else {
      passInput.type = "password";
      togglePwd.textContent = "🔒";
    }
  });

  /**
   * MANEJADOR DEL ENVÍO DEL FORMULARIO
   * Propósito: Procesar y validar las credenciales del usuario
   * Flujo de ejecución:
   *   1. Prevenir envío tradicional del formulario
   *   2. Verificar si el sistema está bloqueado
   *   3. Validar que los campos no estén vacíos
   *   4. Verificar credenciales contra la base de datos
   *   5. Manejar éxito o fracaso de la autenticación
   */
  form.addEventListener("submit", function (e) {
    // Prevenir el comportamiento por defecto del formulario
    e.preventDefault();
    
    // Verificar si el sistema está temporalmente bloqueado
    if (locked) {
      showMessage("Bloqueado temporalmente. Espera unos segundos.", "#e74c3c");
      return;
    }

    // Obtener y normalizar los valores del formulario
    const usuario = userInput.value.trim().toLowerCase();
    const clave = passInput.value;

    // Validación básica de campos obligatorios
    if (!usuario || !clave) {
      showMessage("Por favor completa usuario y contraseña.", "#e67e22");
      return;
    }

    // ===== VERIFICACIÓN DE CREDENCIALES =====
    /**
     * PROCESO DE AUTENTICACIÓN
     * Condición: Verifica que el usuario exista Y que la contraseña coincida
     * Estructura: USERS[usuario] && USERS[usuario].password === clave
     */
    if (USERS[usuario] && USERS[usuario].password === clave) {
      // ===== AUTENTICACIÓN EXITOSA =====
      /**
       * DATOS DEL USUARIO AUTENTICADO
       * Propósito: Almacenar información de sesión para uso en toda la aplicación
       */
      const userData = USERS[usuario];
      
      // Almacenar datos de sesión en sessionStorage
      /**
       * sessionStorage vs localStorage:
       * - sessionStorage: Datos persisten solo durante la sesión del navegador
       * - Más seguro: Los datos se eliminan al cerrar el navegador
       * - Ideal para información sensible de sesión
       */
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("username", userData.name);
      sessionStorage.setItem("userRole", userData.role);
      sessionStorage.setItem("userLogin", usuario);
      
      // Mostrar mensaje de éxito
      showMessage(`Ingreso correcto como ${userData.name}. Redirigiendo...`, "#2ecc71");
      
      // Redirigir después de breve delay para que el usuario vea el mensaje
      setTimeout(() => {
        window.location.href = userData.redirect;
      }, 1000);
      
    } else {
      // ===== AUTENTICACIÓN FALLIDA =====
      /**
       * MANEJO DE INTENTOS FALLIDOS
       * Propósito: Implementar seguridad contra fuerza bruta
       * Flujo:
       *   1. Incrementar contador de intentos fallidos
       *   2. Calcular intentos restantes
       *   3. Mostrar mensaje apropiado según intentos restantes
       *   4. Activar bloqueo si se excede el límite
       */
      attempts++;
      const remaining = MAX_ATTEMPTS - attempts;
      
      if (remaining > 0) {
        // Intentos fallidos pero aún no se excede el límite
        showMessage(`Usuario o contraseña incorrectos. Te quedan ${remaining} intentos.`, "#e74c3c");
      } else {
        // Se excedió el límite de intentos - activar bloqueo
        showMessage("Has agotado los intentos. Bloqueo activado.", "#e74c3c");
        setLocked(LOCK_SECONDS);
      }
    }
  });

  // ===== INICIALIZACIÓN =====
  /**
   * ENFOCAR CAMPO DE USUARIO AL CARGAR
   * Propósito: Mejorar la UX colocando el cursor automáticamente en el primer campo
   * Beneficio: El usuario puede comenzar a escribir inmediatamente sin hacer click
   */
  userInput.focus();
})();