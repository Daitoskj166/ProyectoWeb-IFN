/**
 * SISTEMA DE GESTIÓN DE BRIGADAS - INVENTARIO FORESTAL NACIONAL
 * Archivo: gestionBrigadas.js
 * Propósito: Lógica completa para la gestión de brigadas, miembros, zonas y tareas del IFN
 * Funcionalidades principales:
 *   - CRUD de brigadas (Crear, Leer, Actualizar, Eliminar)
 *   - Gestión de miembros y asignación a brigadas
 *   - Administración de zonas de trabajo
 *   - Asignación y seguimiento de tareas
 *   - Búsqueda en tiempo real
 * Autor: Equipo IFN Colombia
 * Versión: 1.0
 * Fecha: 2024
 */

// ===== CÓDIGO DE AUTENTICACIÓN =====
/**
 * MANEJADOR DE AUTENTICACIÓN Y AUTORIZACIÓN
 * Propósito: Verificar sesión de usuario y configurar interfaz según rol
 * Se ejecuta inmediatamente al cargar la página
 * Dependencias: sessionStorage para gestión de estado de sesión
 */
document.addEventListener("DOMContentLoaded", () => {
  // Obtener información de sesión del sessionStorage
  const loggedIn = sessionStorage.getItem("loggedIn");
  const username = sessionStorage.getItem("username");
  const userRole = sessionStorage.getItem("userRole");
  const userLabel = document.querySelector(".texto-arriba");
  const logoutBtn = document.querySelector(".texto-abajo");
  const dashboard = document.querySelector(".dashboard");

  // Validar existencia de sesión activa
  if (!loggedIn || loggedIn !== "true") {
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
    return;
  }

  // Actualizar interfaz con información del usuario
  if (userLabel && username) {
    userLabel.textContent = username;
  }

  // Configurar dashboard según permisos de rol
  if (dashboard) {
    mostrarDashboardSegunRol(userRole, dashboard);
  }

  // Configurar evento de cierre de sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }

  // Inicializar la aplicación de gestión de brigadas después de la autenticación
  inicializarAplicacionGestionBrigadas();
});

/**
 * CONFIGURA EL DASHBOARD SEGÚN EL ROL DEL USUARIO
 * @param {string} rol - Rol del usuario (brigadista, encargado, etc.)
 * @param {HTMLElement} dashboardElement - Elemento del DOM que contiene el dashboard
 * Propósito: Mostrar solo las opciones de navegación permitidas para cada rol
 * Seguridad: Limita el acceso a funcionalidades según privilegios
 */
function mostrarDashboardSegunRol(rol, dashboardElement) {
  if (rol === 'brigadista') {
    // Dashboard para brigadistas - solo funcionalidades básicas
    dashboardElement.innerHTML = `
      <a href="subirArbol.html" class="dashboard-btn">Subir Árbol</a> 
      <a href="subirSuelo.html" class="dashboard-btn">Subir Suelo</a> 
      <a href="registro.html" class="dashboard-btn">Registro</a>
    `;
  } else if (rol === 'encargado') {
    // Dashboard para encargados - funcionalidades de gestión
    dashboardElement.innerHTML = `
      <a href="inicio-Pantalla.html" class="dashboard-btn">Inicio</a>
      <a href="estadisticas.html" class="dashboard-btn">Estadísticas</a>
      <a href="supervision.html" class="dashboard-btn">Supervisión</a>
    `;
  }
}

// ===== VARIABLES GLOBALES Y ESTADO =====
/**
 * VARIABLES GLOBALES DE LA APLICACIÓN
 * Propósito: Almacenar el estado completo de la aplicación
 * Estructura:
 *   - brigadas: Array de objetos con información de brigadas
 *   - miembros: Array de objetos con información de miembros
 *   - tareas: Array de objetos con información de tareas
 *   - zonas: Array de objetos con información de zonas (futura implementación)
 */
let brigadas = [];
let miembros = [];
let tareas = [];
let zonas = [];

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
/**
 * INICIALIZA EL MÓDULO DE GESTIÓN DE BRIGADAS
 * Propósito: Configurar toda la funcionalidad del módulo
 * Orden de ejecución:
 *   1. Cargar datos iniciales
 *   2. Configurar event listeners
 *   3. Configurar sistema de búsqueda
 *   4. Actualizar interfaz inicial
 */
function inicializarAplicacionGestionBrigadas() {
    console.log('Inicializando módulo de gestión de brigadas...');
    inicializarAplicacion();
}

/**
 * FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
 * Propósito: Coordinar todas las tareas de inicialización
 * Flujo secuencial para garantizar dependencias correctas
 */
function inicializarAplicacion() {
    cargarDatosIniciales();
    configurarEventListeners();
    configurarBusqueda();
    actualizarInterfaz();
}

/**
 * CARGA LOS DATOS INICIALES DE LA APLICACIÓN
 * Propósito: Poblar la aplicación con datos de ejemplo para demostración
 * En producción: Realizaría una llamada AJAX al servidor
 * Estructura de datos: Objetos con propiedades consistentes para cada entidad
 */
function cargarDatosIniciales() {
    // Datos de ejemplo para demostración - Brigadas
    brigadas = [
        {
            id: 1,
            nombre: 'Brigada Norte',
            lider: 'Carlos Rodríguez',
            miembros: 5,
            zona: 'Sector Norte del Bosque',
            descripcionZona: 'Sector Norte del Bosque, incluye áreas de reforestación A y B',
            estado: 'activa'
        },
        {
            id: 2,
            nombre: 'Brigada Sur',
            lider: 'Ana Martínez',
            miembros: 4,
            zona: 'Sector Sur del Bosque',
            descripcionZona: 'Sector Sur del Bosque, zona de conservación de especies nativas',
            estado: 'activa'
        },
        {
            id: 3,
            nombre: 'Brigada Este',
            lider: 'Luis González',
            miembros: 6,
            zona: 'Sector Este del Bosque',
            descripcionZona: 'Sector Este del Bosque, área de monitoreo y control',
            estado: 'activa'
        }
    ];

    // Datos de ejemplo - Miembros
    miembros = [
        { id: 1, nombre: 'Carlos Rodríguez', brigadaId: 1, rol: 'Líder' },
        { id: 2, nombre: 'Ana Martínez', brigadaId: 2, rol: 'Líder' },
        { id: 3, nombre: 'Luis González', brigadaId: 3, rol: 'Líder' },
        { id: 4, nombre: 'María López', brigadaId: 1, rol: 'Miembro' },
        { id: 5, nombre: 'Pedro Sánchez', brigadaId: 1, rol: 'Miembro' },
        { id: 6, nombre: 'Laura Díaz', brigadaId: 2, rol: 'Miembro' },
        { id: 7, nombre: 'Jorge Ramírez', brigadaId: 3, rol: 'Miembro' },
        { id: 8, nombre: 'Sofia Castro', brigadaId: null, rol: 'Sin asignar' }
    ];

    // Datos de ejemplo - Tareas
    tareas = [
        {
            id: 1,
            brigadaId: 1,
            descripcion: 'Inventario de árboles en zona A',
            fechaInicio: '2024-01-15',
            fechaFin: '2024-01-20',
            objetivos: 'Identificar y catalogar especies en área designada',
            estado: 'completada'
        }
    ];

    console.log('Datos iniciales cargados:', { brigadas, miembros, tareas });
}

/**
 * CONFIGURA TODOS LOS EVENT LISTENERS DE LA APLICACIÓN
 * Propósito: Establecer manejadores para todas las interacciones del usuario
 * Estrategia: Combinación de event listeners directos y delegación de eventos
 */
function configurarEventListeners() {
    // Formulario de asignación de tareas
    const tareaForm = document.querySelector('.tarea-form');
    if (tareaForm) {
        tareaForm.addEventListener('submit', manejarAsignacionTarea);
    }

    // Botones de acción principales
    document.querySelector('.btn-nueva-brigada')?.addEventListener('click', mostrarFormularioNuevaBrigada);
    document.querySelector('.btn-agregar-miembro')?.addEventListener('click', mostrarFormularioNuevoMiembro);
    document.querySelector('.btn-guardar-zonas')?.addEventListener('click', guardarZonas);

    // Configurar fechas mínimas en el formulario de tareas
    configurarFechasFormulario();

    // 
    // DELEGACIÓN DE EVENTOS PARA BOTONES DINÁMICOS
    // Propósito: Manejar eventos en elementos creados dinámicamente
    // Ventaja: Funciona incluso para elementos añadidos después de la carga inicial
    //
    document.addEventListener('click', function(e) {
        // Botones de editar brigada
        if (e.target.classList.contains('btn-editar')) {
            const brigadaCard = e.target.closest('.brigada-card');
            const nombreBrigada = brigadaCard.querySelector('h3').textContent;
            editarBrigada(nombreBrigada);
        }

        // Botones de asignar tarea desde tarjetas
        if (e.target.classList.contains('btn-asignar')) {
            const brigadaCard = e.target.closest('.brigada-card');
            const nombreBrigada = brigadaCard.querySelector('h3').textContent;
            asignarTareaRapida(nombreBrigada);
        }
    });

    // Event listeners para cambios en selects de miembros
    document.addEventListener('change', function(e) {
        if (e.target.tagName === 'SELECT' && e.target.closest('.miembro-item')) {
            const miembroItem = e.target.closest('.miembro-item');
            const nombreMiembro = miembroItem.querySelector('span').textContent;
            const nuevaBrigada = e.target.value;
            actualizarBrigadaMiembro(nombreMiembro, nuevaBrigada);
        }
    });
}

/**
 * CONFIGURA EL SISTEMA DE BÚSQUEDA
 * Propósito: Implementar búsqueda en tiempo real en brigadas y miembros
 * Características:
 *   - Búsqueda con debounce nativo (setTimeout)
 *   - Activación por input y Enter
 *   - Búsqueda por icono de lupa
 */
function configurarBusqueda() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        // Búsqueda en tiempo real durante la escritura
        searchInput.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase();
            buscarBrigadasYMiembros(termino);
        });

        // Búsqueda al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const termino = e.target.value.toLowerCase();
                buscarBrigadasYMiembros(termino);
            }
        });

        // Búsqueda al hacer clic en el icono de búsqueda
        document.querySelector('.search-icon')?.addEventListener('click', function() {
            const termino = searchInput.value.toLowerCase();
            buscarBrigadasYMiembros(termino);
        });
    }
}

/**
 * CONFIGURA LAS FECHAS EN EL FORMULARIO DE TAREAS
 * Propósito: Establecer restricciones y valores por defecto para fechas
 * Validaciones:
 *   - Fecha mínima: hoy (no se pueden asignar tareas en el pasado)
 *   - Fecha fin no puede ser anterior a fecha inicio
 */
function configurarFechasFormulario() {
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');
    
    if (fechaInicio) {
        // Establecer fecha mínima como hoy
        const hoy = new Date().toISOString().split('T')[0];
        fechaInicio.min = hoy;
        fechaInicio.value = hoy;

        // Actualizar fecha mínima de fin cuando cambia la fecha de inicio
        fechaInicio.addEventListener('change', function() {
            if (fechaFin) {
                fechaFin.min = this.value;
                if (fechaFin.value && fechaFin.value < this.value) {
                    fechaFin.value = this.value;
                }
            }
        });
    }

    if (fechaFin) {
        // Establecer fecha mínima como hoy por defecto
        const hoy = new Date().toISOString().split('T')[0];
        fechaFin.min = hoy;
        fechaFin.value = hoy;
    }
}

// ===== GESTIÓN DE BRIGADAS =====

/**
 * MUESTRA EL FORMULARIO PARA CREAR UNA NUEVA BRIGADA
 * Propósito: Capturar información básica para crear una nueva brigada
 * Interfaz: Usa prompts nativos (en producción sería un formulario modal)
 * Flujo: Nombre → Líder → Zona → Creación
 */
function mostrarFormularioNuevaBrigada() {
    const nombre = prompt('Nombre de la nueva brigada:');
    if (!nombre) return;

    const lider = prompt('Nombre del líder de la brigada:');
    if (!lider) return;

    const zona = prompt('Zona de trabajo asignada:');
    if (!zona) return;

    // Crear objeto de nueva brigada
    const nuevaBrigada = {
        id: generarIdUnico(),
        nombre: nombre,
        lider: lider,
        miembros: 1, // Incluye al líder
        zona: zona,
        descripcionZona: '',
        estado: 'activa'
    };

    // Agregar el líder como miembro de la brigada
    const nuevoMiembro = {
        id: generarIdUnico(),
        nombre: lider,
        brigadaId: nuevaBrigada.id,
        rol: 'Líder'
    };

    // Actualizar estado de la aplicación
    brigadas.push(nuevaBrigada);
    miembros.push(nuevoMiembro);

    // Actualizar la interfaz
    actualizarInterfaz();
    mostrarMensaje(`Brigada "${nombre}" creada exitosamente`, 'success');
}

/**
 * EDITA UNA BRIGADA EXISTENTE
 * @param {string} nombreBrigada - Nombre de la brigada a editar
 * Propósito: Permitir la modificación de los datos de una brigada existente
 * Campos editables: Nombre, líder y zona de trabajo
 */
function editarBrigada(nombreBrigada) {
    const brigada = brigadas.find(b => b.nombre === nombreBrigada);
    if (!brigada) return;

    // Solicitar nuevos valores mediante prompts
    const nuevoNombre = prompt('Nuevo nombre de la brigada:', brigada.nombre);
    if (!nuevoNombre) return;

    const nuevoLider = prompt('Nuevo líder de la brigada:', brigada.lider);
    if (!nuevoLider) return;

    const nuevaZona = prompt('Nueva zona de trabajo:', brigada.zona);
    if (!nuevaZona) return;

    // Actualizar datos de la brigada
    brigada.nombre = nuevoNombre;
    brigada.lider = nuevoLider;
    brigada.zona = nuevaZona;

    // Actualizar el rol del líder en los miembros
    const miembroLider = miembros.find(m => m.nombre === brigada.lider && m.brigadaId === brigada.id);
    if (miembroLider) {
        miembroLider.rol = 'Líder';
    }

    actualizarInterfaz();
    mostrarMensaje(`Brigada "${nuevoNombre}" actualizada exitosamente`, 'success');
}

/**
 * ELIMINA UNA BRIGADA
 * @param {number} idBrigada - ID de la brigada a eliminar
 * Propósito: Eliminar una brigada y liberar sus miembros
 * Seguridad: Solicita confirmación antes de proceder
 */
function eliminarBrigada(idBrigada) {
    const brigada = brigadas.find(b => b.id === idBrigada);
    if (!brigada) return;

    if (confirm(`¿Está seguro de que desea eliminar la brigada "${brigada.nombre}"?`)) {
        // Liberar miembros de la brigada (reasignar a "Sin asignar")
        miembros.forEach(miembro => {
            if (miembro.brigadaId === idBrigada) {
                miembro.brigadaId = null;
                miembro.rol = 'Sin asignar';
            }
        });

        // Eliminar brigada del array
        brigadas = brigadas.filter(b => b.id !== idBrigada);

        actualizarInterfaz();
        mostrarMensaje(`Brigada "${brigada.nombre}" eliminada exitosamente`, 'success');
    }
}

// ===== GESTIÓN DE MIEMBROS =====

/**
 * MUESTRA EL FORMULARIO PARA AGREGAR UN NUEVO MIEMBRO
 * Propósito: Añadir un nuevo miembro al sistema
 * Validación: Verifica que el miembro no exista previamente
 * Estado inicial: Miembro creado como "Sin asignar"
 */
function mostrarFormularioNuevoMiembro() {
    const nombre = prompt('Nombre del nuevo miembro:');
    if (!nombre) return;

    // Verificar si el miembro ya existe (evitar duplicados)
    const miembroExistente = miembros.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
    if (miembroExistente) {
        mostrarMensaje('Este miembro ya existe en el sistema', 'error');
        return;
    }

    // Crear nuevo miembro
    const nuevoMiembro = {
        id: generarIdUnico(),
        nombre: nombre,
        brigadaId: null,
        rol: 'Sin asignar'
    };

    miembros.push(nuevoMiembro);
    actualizarInterfaz();
    mostrarMensaje(`Miembro "${nombre}" agregado exitosamente`, 'success');
}

/**
 * ACTUALIZA LA BRIGADA DE UN MIEMBRO
 * @param {string} nombreMiembro - Nombre del miembro a actualizar
 * @param {string} nombreBrigada - Nombre de la nueva brigada (o "Sin asignar")
 * Propósito: Reasignar un miembro a una brigada diferente
 * Lógica: Actualiza brigadaId y rol del miembro
 */
function actualizarBrigadaMiembro(nombreMiembro, nombreBrigada) {
    const miembro = miembros.find(m => m.nombre === nombreMiembro);
    if (!miembro) return;

    let nuevaBrigadaId = null;
    let nuevoRol = 'Sin asignar';

    // Si se selecciona una brigada válida (no "Sin asignar")
    if (nombreBrigada !== 'Sin asignar') {
        const brigada = brigadas.find(b => b.nombre === nombreBrigada);
        if (brigada) {
            nuevaBrigadaId = brigada.id;
            nuevoRol = 'Miembro';
        }
    }

    // Actualizar miembro
    miembro.brigadaId = nuevaBrigadaId;
    miembro.rol = nuevoRol;

    // Recalcular número de miembros por brigada
    actualizarContadoresMiembros();

    actualizarInterfaz();
    mostrarMensaje(`Miembro "${nombreMiembro}" asignado a "${nombreBrigada}"`, 'success');
}

/**
 * RECALCULA LOS CONTADORES DE MIEMBROS POR BRIGADA
 * Propósito: Mantener sincronizado el contador de miembros en cada brigada
 * Lógica: Cuenta los miembros asignados a cada brigada y actualiza el contador
 */
function actualizarContadoresMiembros() {
    brigadas.forEach(brigada => {
        const count = miembros.filter(m => m.brigadaId === brigada.id).length;
        brigada.miembros = count;
    });
}

// ===== GESTIÓN DE ZONAS =====

/**
 * GUARDA LOS CAMBIOS EN LAS ZONAS
 * Propósito: Persistir las descripciones de zonas modificadas por el usuario
 * Detección de cambios: Solo guarda si realmente hubo modificaciones
 * Feedback: Mensaje informativo según si hubo cambios o no
 */
function guardarZonas() {
    const zonasItems = document.querySelectorAll('.zona-item');
    let cambiosRealizados = false;

    // Iterar sobre cada zona y verificar cambios
    zonasItems.forEach(item => {
        const nombreBrigada = item.querySelector('h3').textContent;
        const descripcion = item.querySelector('textarea').value;

        const brigada = brigadas.find(b => b.nombre === nombreBrigada);
        if (brigada && brigada.descripcionZona !== descripcion) {
            brigada.descripcionZona = descripcion;
            cambiosRealizados = true;
        }
    });

    // Mostrar mensaje apropiado según si hubo cambios
    if (cambiosRealizados) {
        mostrarMensaje('Cambios en las zonas guardados correctamente', 'success');
    } else {
        mostrarMensaje('No se realizaron cambios en las zonas', 'info');
    }
}

// ===== GESTIÓN DE TAREAS =====

/**
 * MANEJA EL ENVÍO DEL FORMULARIO DE ASIGNACIÓN DE TAREAS
 * @param {Event} e - Evento de envío del formulario
 * Propósito: Procesar y validar la creación de una nueva tarea
 * Flujo: Validación → Creación → Reset → Feedback
 */
function manejarAsignacionTarea(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const brigadaNombre = document.getElementById('brigada-tarea').value;
    const descripcion = document.getElementById('tarea-descripcion').value;
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    const objetivos = document.getElementById('objetivos').value;

    // Validar fechas antes de proceder
    if (!validarFechasTarea(fechaInicio, fechaFin)) {
        return;
    }

    // Verificar que la brigada existe
    const brigada = brigadas.find(b => b.nombre === brigadaNombre);
    if (!brigada) {
        mostrarMensaje('Brigada no encontrada', 'error');
        return;
    }

    // Crear nueva tarea
    const nuevaTarea = {
        id: generarIdUnico(),
        brigadaId: brigada.id,
        descripcion: descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        objetivos: objetivos,
        estado: 'pendiente',
        fechaAsignacion: new Date().toISOString().split('T')[0]
    };

    tareas.push(nuevaTarea);
    e.target.reset();
    configurarFechasFormulario(); // Resetear fechas a valores por defecto

    mostrarMensaje(`Tarea asignada a ${brigadaNombre} exitosamente`, 'success');
    console.log('Nueva tarea asignada:', nuevaTarea);
}

/**
 * ASIGNA UNA TAREA RÁPIDA DESDE LA TARJETA DE BRIGADA
 * @param {string} nombreBrigada - Nombre de la brigada a la que asignar la tarea
 * Propósito: Asignación rápida de tareas sin usar el formulario completo
 * Características: Fechas automáticas (hoy + 7 días), objetivos genéricos
 */
function asignarTareaRapida(nombreBrigada) {
    const descripcion = prompt(`Descripción de la tarea para ${nombreBrigada}:`);
    if (!descripcion) return;

    const brigada = brigadas.find(b => b.nombre === nombreBrigada);
    if (!brigada) return;

    // Crear tarea con valores por defecto
    const nuevaTarea = {
        id: generarIdUnico(),
        brigadaId: brigada.id,
        descripcion: descripcion,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 días
        objetivos: 'Tarea asignada desde gestión rápida',
        estado: 'pendiente',
        fechaAsignacion: new Date().toISOString().split('T')[0]
    };

    tareas.push(nuevaTarea);
    mostrarMensaje(`Tarea asignada a ${nombreBrigada} exitosamente`, 'success');
}

/**
 * VALIDA LAS FECHAS DE UNA TAREA
 * @param {string} fechaInicio - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} fechaFin - Fecha de fin en formato YYYY-MM-DD
 * @returns {boolean} True si las fechas son válidas
 * Propósito: Validar coherencia temporal en las fechas de tareas
 * Reglas:
 *   - Fecha inicio no puede ser mayor que fecha fin
 *   - Fecha inicio no puede ser en el pasado
 */
function validarFechasTarea(fechaInicio, fechaFin) {
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        mostrarMensaje('La fecha de inicio no puede ser mayor a la fecha de fin', 'error');
        return false;
    }

    if (new Date(fechaInicio) < new Date()) {
        mostrarMensaje('La fecha de inicio no puede ser en el pasado', 'error');
        return false;
    }

    return true;
}

// ===== BÚSQUEDA =====

/**
 * BUSCA BRIGADAS Y MIEMBROS SEGÚN EL TÉRMINO
 * @param {string} termino - Término de búsqueda en minúsculas
 * Propósito: Filtrar y mostrar brigadas y miembros que coincidan con la búsqueda
 * Campos buscados:
 *   - Brigadas: nombre, líder, zona
 *   - Miembros: nombre, rol
 */
function buscarBrigadasYMiembros(termino) {
    if (!termino) {
        actualizarInterfaz();
        return;
    }

    // Filtrar brigadas por múltiples campos
    const brigadasFiltradas = brigadas.filter(brigada => 
        brigada.nombre.toLowerCase().includes(termino) ||
        brigada.lider.toLowerCase().includes(termino) ||
        brigada.zona.toLowerCase().includes(termino)
    );

    // Filtrar miembros por múltiples campos
    const miembrosFiltrados = miembros.filter(miembro =>
        miembro.nombre.toLowerCase().includes(termino) ||
        miembro.rol.toLowerCase().includes(termino)
    );

    // Actualizar interfaz con resultados filtrados
    actualizarInterfazBrigadasFiltradas(brigadasFiltradas);
    actualizarInterfazMiembrosFiltrados(miembrosFiltrados);

    // Mostrar contador de resultados
    const totalResultados = brigadasFiltradas.length + miembrosFiltrados.length;
    if (totalResultados > 0) {
        mostrarMensaje(`Se encontraron ${totalResultados} resultados para "${termino}"`, 'info');
    } else {
        mostrarMensaje(`No se encontraron resultados para "${termino}"`, 'warning');
    }
}

// ===== ACTUALIZACIÓN DE INTERFAZ =====

/**
 * ACTUALIZA TODA LA INTERFAZ DE USUARIO
 * Propósito: Sincronizar la interfaz visual con el estado actual de los datos
 * Componentes actualizados: Lista de brigadas, miembros, zonas y select de tareas
 */
function actualizarInterfaz() {
    actualizarListaBrigadas();
    actualizarListaMiembros();
    actualizarZonas();
    actualizarSelectBrigadas();
}

/**
 * ACTUALIZA LA LISTA DE BRIGADAS
 * Propósito: Renderizar dinámicamente las tarjetas de brigadas
 * Características: Incluye botones de acción y estado visual
 */
function actualizarListaBrigadas() {
    const container = document.querySelector('.brigadas-container');
    if (!container) return;

    container.innerHTML = '';

    brigadas.forEach(brigada => {
        const card = document.createElement('div');
        card.className = 'brigada-card';
        card.innerHTML = `
            <h3>${brigada.nombre}</h3>
            <p><strong>Líder:</strong> ${brigada.lider}</p>
            <p><strong>Miembros:</strong> ${brigada.miembros}</p>
            <p><strong>Zona:</strong> ${brigada.zona}</p>
            <p><strong>Estado:</strong> <span class="estado-brigada ${brigada.estado}">${brigada.estado}</span></p>
            <div class="brigada-actions">
                <button class="btn-editar">Editar</button>
                <button class="btn-asignar">Asignar Tarea</button>
                <button class="btn-eliminar" data-brigada-id="${brigada.id}">Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Agregar event listeners para botones de eliminar (creados dinámicamente)
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
            const brigadaId = parseInt(this.getAttribute('data-brigada-id'));
            eliminarBrigada(brigadaId);
        });
    });
}

/**
 * ACTUALIZA LA LISTA DE MIEMBROS
 * Propósito: Renderizar dinámicamente la lista de miembros editables
 * Características: Selectores con estado actual preseleccionado
 */
function actualizarListaMiembros() {
    const container = document.querySelector('.miembros-container');
    if (!container) return;

    container.innerHTML = '';

    miembros.forEach(miembro => {
        // Generar opciones de brigadas para el selector
        const opcionesBrigadas = brigadas.map(b => 
            `<option value="${b.nombre}" ${miembro.brigadaId === b.id ? 'selected' : ''}>${b.nombre}</option>`
        ).join('');

        const item = document.createElement('div');
        item.className = 'miembro-item';
        item.innerHTML = `
            <span>${miembro.nombre} (${miembro.rol})</span>
            <select>
                <option value="Sin asignar" ${!miembro.brigadaId ? 'selected' : ''}>Sin asignar</option>
                ${opcionesBrigadas}
            </select>
        `;
        container.appendChild(item);
    });
}

/**
 * ACTUALIZA LAS ZONAS ASIGNADAS
 * Propósito: Sincronizar las áreas de texto con las descripciones actuales
 */
function actualizarZonas() {
    const container = document.querySelector('.zonas-container');
    if (!container) return;

    container.innerHTML = '';

    brigadas.forEach(brigada => {
        const item = document.createElement('div');
        item.className = 'zona-item';
        item.innerHTML = `
            <h3>${brigada.nombre}</h3>
            <textarea rows="3" placeholder="Descripción de la zona...">${brigada.descripcionZona || ''}</textarea>
        `;
        container.appendChild(item);
    });
}

/**
 * ACTUALIZA EL SELECT DE BRIGADAS EN EL FORMULARIO DE TAREAS
 * Propósito: Mantener actualizada la lista de brigadas en el formulario
 * Preservación: Intenta mantener la selección actual si sigue existiendo
 */
function actualizarSelectBrigadas() {
    const select = document.getElementById('brigada-tarea');
    if (!select) return;

    // Guardar valor seleccionado actual
    const valorActual = select.value;

    // Limpiar opciones (excepto la primera - placeholder)
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Agregar opciones actualizadas
    brigadas.forEach(brigada => {
        const option = document.createElement('option');
        option.value = brigada.nombre;
        option.textContent = brigada.nombre;
        select.appendChild(option);
    });

    // Restaurar valor seleccionado si aún existe
    if (brigadas.some(b => b.nombre === valorActual)) {
        select.value = valorActual;
    }
}

/**
 * ACTUALIZA LA INTERFAZ CON BRIGADAS FILTRADAS
 * @param {Array} brigadasFiltradas - Array de brigadas que coinciden con la búsqueda
 * Propósito: Mostrar solo las brigadas que coinciden con el criterio de búsqueda
 * Estado vacío: Muestra mensaje cuando no hay resultados
 */
function actualizarInterfazBrigadasFiltradas(brigadasFiltradas) {
    const container = document.querySelector('.brigadas-container');
    if (!container) return;

    container.innerHTML = '';

    if (brigadasFiltradas.length === 0) {
        container.innerHTML = '<p class="sin-resultados">No se encontraron brigadas que coincidan con la búsqueda</p>';
        return;
    }

    brigadasFiltradas.forEach(brigada => {
        const card = document.createElement('div');
        card.className = 'brigada-card';
        card.innerHTML = `
            <h3>${brigada.nombre}</h3>
            <p><strong>Líder:</strong> ${brigada.lider}</p>
            <p><strong>Miembros:</strong> ${brigada.miembros}</p>
            <p><strong>Zona:</strong> ${brigada.zona}</p>
            <div class="brigada-actions">
                <button class="btn-editar">Editar</button>
                <button class="btn-asignar">Asignar Tarea</button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * ACTUALIZA LA INTERFAZ CON MIEMBROS FILTRADOS
 * @param {Array} miembrosFiltrados - Array de miembros que coinciden con la búsqueda
 * Propósito: Mostrar solo los miembros que coinciden con el criterio de búsqueda
 * Estado vacío: Muestra mensaje cuando no hay resultados
 */
function actualizarInterfazMiembrosFiltrados(miembrosFiltrados) {
    const container = document.querySelector('.miembros-container');
    if (!container) return;

    container.innerHTML = '';

    if (miembrosFiltrados.length === 0) {
        container.innerHTML = '<p class="sin-resultados">No se encontraron miembros que coincidan con la búsqueda</p>';
        return;
    }

    miembrosFiltrados.forEach(miembro => {
        const opcionesBrigadas = brigadas.map(b => 
            `<option value="${b.nombre}" ${miembro.brigadaId === b.id ? 'selected' : ''}>${b.nombre}</option>`
        ).join('');

        const item = document.createElement('div');
        item.className = 'miembro-item';
        item.innerHTML = `
            <span>${miembro.nombre} (${miembro.rol})</span>
            <select>
                <option value="Sin asignar" ${!miembro.brigadaId ? 'selected' : ''}>Sin asignar</option>
                ${opcionesBrigadas}
            </select>
        `;
        container.appendChild(item);
    });
}

// ===== UTILIDADES =====

/**
 * GENERA UN ID ÚNICO
 * @returns {number} ID único basado en timestamp y número aleatorio
 * Propósito: Generar identificadores únicos para nuevas entidades
 * Estrategia: Combinación de timestamp actual y número aleatorio
 */
function generarIdUnico() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * MUESTRA UN MENSAJE AL USUARIO
 * @param {string} mensaje - Texto del mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (success, error, warning, info)
 * Propósito: Sistema unificado de notificaciones al usuario
 * Características:
 *   - Toast notifications temporales
 *   - Colores semánticos según el tipo
 *   - Animaciones de entrada y salida
 *   - Auto-eliminación después de 5 segundos
 */
function mostrarMensaje(mensaje, tipo = 'info') {
    // Eliminar mensajes existentes
    const mensajesExistentes = document.querySelectorAll('.mensaje-flotante');
    mensajesExistentes.forEach(msg => msg.remove());

    // Crear nuevo mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.className = `mensaje-flotante mensaje-${tipo}`;
    mensajeElement.textContent = mensaje;
    mensajeElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    // Colores según el tipo de mensaje
    const colores = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    mensajeElement.style.backgroundColor = colores[tipo] || colores.info;

    document.body.appendChild(mensajeElement);

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (mensajeElement.parentNode) {
            mensajeElement.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => mensajeElement.remove(), 300);
        }
    }, 5000);
}

/**
 * AGREGA ESTILOS CSS DINÁMICOS
 * Propósito: Inyectar estilos específicos necesarios para la funcionalidad
 * Ventaja: No requiere archivo CSS adicional para estilos específicos de JavaScript
 * Contenido: Animaciones, estados de brigadas, botones dinámicos
 */
function agregarEstilosDinamicos() {
    const estilos = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .estado-brigada {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .estado-brigada.activa {
            background-color: #4CAF50;
            color: white;
        }
        
        .estado-brigada.inactiva {
            background-color: #f44336;
            color: white;
        }
        
        .estado-brigada.pendiente {
            background-color: #ff9800;
            color: white;
        }
        
        .sin-resultados {
            text-align: center;
            padding: 20px;
            color: #666;
            font-style: italic;
        }
        
        .btn-eliminar {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s;
        }
        
        .btn-eliminar:hover {
            background-color: #d32f2f;
        }
        
        .brigada-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = estilos;
    document.head.appendChild(styleSheet);
}

// Inicializar estilos dinámicos cuando se carga el script
agregarEstilosDinamicos();

// ===== INTERFAZ PÚBLICA =====
/**
 * INTERFAZ PÚBLICA DEL MÓDULO DE GESTIÓN DE BRIGADAS
 * Propósito: Exponer funciones y datos principales para uso externo
 * Ventaja: Permite integración con otros módulos y debugging
 */
window.GestionBrigadas = {
    brigadas,
    miembros,
    tareas,
    actualizarInterfaz,
    mostrarFormularioNuevaBrigada,
    mostrarFormularioNuevoMiembro
};

// Mensaje de confirmación de carga
console.log('Módulo de gestión de brigadas cargado correctamente');