// login.js - CÓDIGO CORRECTO PARA LOGIN
(function () {
  // Base de datos de usuarios
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

  const MAX_ATTEMPTS = 5;
  const LOCK_SECONDS = 30;

  const form = document.getElementById("loginForm");
  const userInput = document.getElementById("username");
  const passInput = document.getElementById("password");
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("msg");
  const togglePwd = document.getElementById("togglePwd");

  let attempts = 0;
  let locked = false;
  let lockTimeoutId = null;

  function showMessage(text, color = "#f1c40f") {
    msg.textContent = text;
    msg.style.color = color;
  }

  function setLocked(seconds) {
    locked = true;
    userInput.disabled = true;
    passInput.disabled = true;
    submitBtn.disabled = true;

    let remaining = seconds;
    showMessage(`Bloqueado por ${remaining}s`, "#e74c3c");

    lockTimeoutId = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        showMessage(`Bloqueado por ${remaining}s`, "#e74c3c");
      } else {
        clearInterval(lockTimeoutId);
        locked = false;
        attempts = 0;
        userInput.disabled = false;
        passInput.disabled = false;
        submitBtn.disabled = false;
        showMessage("Puedes intentar de nuevo.", "#f1c40f");
      }
    }, 1000);
  }

  // Botón para mostrar/ocultar contraseña
  togglePwd.addEventListener("click", () => {
    if (passInput.type === "password") {
      passInput.type = "text";
      togglePwd.textContent = "👁️";
    } else {
      passInput.type = "password";
      togglePwd.textContent = "🔒";
    }
  });

  // Manejar envío del formulario
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    
    if (locked) {
      showMessage("Bloqueado temporalmente. Espera unos segundos.", "#e74c3c");
      return;
    }

    const usuario = userInput.value.trim().toLowerCase();
    const clave = passInput.value;

    if (!usuario || !clave) {
      showMessage("Por favor completa usuario y contraseña.", "#e67e22");
      return;
    }

    // Verificar credenciales
    if (USERS[usuario] && USERS[usuario].password === clave) {
      const userData = USERS[usuario];
      
      // Guardar datos en sessionStorage
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("username", userData.name);
      sessionStorage.setItem("userRole", userData.role);
      sessionStorage.setItem("userLogin", usuario);
      
      showMessage(`Ingreso correcto como ${userData.name}. Redirigiendo...`, "#2ecc71");
      
      setTimeout(() => {
        window.location.href = userData.redirect;
      }, 1000);
    } else {
      attempts++;
      const remaining = MAX_ATTEMPTS - attempts;
      if (remaining > 0) {
        showMessage(`Usuario o contraseña incorrectos. Te quedan ${remaining} intentos.`, "#e74c3c");
      } else {
        showMessage("Has agotado los intentos. Bloqueo activado.", "#e74c3c");
        setLocked(LOCK_SECONDS);
      }
    }
  });

  // Enfocar el campo de usuario al cargar
  userInput.focus();
})();