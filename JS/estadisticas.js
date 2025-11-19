/**
 * SISTEMA DE GENERACIÓN DE REPORTES - INVENTARIO FORESTAL NACIONAL
 * Archivo: estadisticas.js
 * Propósito: Lógica para la generación de reportes estadísticos del IFN
 * Dependencias: Chart.js para visualizaciones gráficas
 * Autor: Equipo IFN Colombia
 * Versión: 1.0
 * Fecha: 2024
 */

// ===== CÓDIGO DE AUTENTICACIÓN =====
/**
 * MANEJADOR DE AUTENTICACIÓN Y AUTORIZACIÓN
 * Propósito: Verificar sesión de usuario y configurar interfaz según rol
 * Se ejecuta inmediatamente al cargar la página
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

  // Inicializar la aplicación de estadísticas después de la autenticación
  inicializarAplicacionEstadisticas();
});

/**
 * CONFIGURA EL DASHBOARD SEGÚN EL ROL DEL USUARIO
 * @param {string} rol - Rol del usuario (brigadista, encargado, etc.)
 * @param {HTMLElement} dashboardElement - Elemento del DOM que contiene el dashboard
 * Propósito: Mostrar solo las opciones de navegación permitidas para cada rol
 */
function mostrarDashboardSegunRol(rol, dashboardElement) {
  if (rol === 'brigadista') {
    dashboardElement.innerHTML = `
      <a href="subirArbol.html" class="dashboard-btn">Subir Árbol</a> 
      <a href="subirSuelo.html" class="dashboard-btn">Subir Suelo</a> 
      <a href="registro.html" class="dashboard-btn">Registro</a>
    `;
  } else if (rol === 'encargado') {
    dashboardElement.innerHTML = `
      <a href="inicio-Pantalla.html" class="dashboard-btn">Inicio</a>
      <a href="gestionBrigadas.html" class="dashboard-btn">Gestión Brigadas</a>
      <a href="supervision.html" class="dashboard-btn">Supervisión</a>
    `;
  }
}

// ===== DECLARACIÓN DE VARIABLES GLOBALES =====
/**
 * VARIABLES GLOBALES DE LA APLICACIÓN
 * Propósito: Almacenar estado de la aplicación y referencias a gráficos
 */
let datosGlobales = null;              // Almacena todos los datos del reporte
let graficoEspeciesInstancia = null;   // Instancia del gráfico de especies
let graficoRegistrosInstancia = null;  // Instancia del gráfico de registros
let graficoSaludInstancia = null;      // Instancia del gráfico de salud forestal

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
/**
 * INICIALIZA EL MÓDULO DE ESTADÍSTICAS
 * Propósito: Configurar toda la funcionalidad del módulo de reportes
 * Orden de ejecución:
 *   1. Configurar event listeners
 *   2. Cargar datos iniciales
 *   3. Configurar fechas por defecto
 */
function inicializarAplicacionEstadisticas() {
    console.log('Inicializando módulo de reportes IFN...');
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    
    // Configurar fechas por defecto
    configurarFechasPorDefecto();
}

/**
 * FUNCIÓN PRINCIPAL DE INICIALIZACIÓN DE LA APLICACIÓN
 * Propósito: Punto de entrada principal para la configuración del módulo
 * Nota: Mantenida por compatibilidad con código existente
 */
function inicializarAplicacion() {
    console.log('Inicializando módulo de reportes IFN...');
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    
    // Configurar fechas por defecto
    configurarFechasPorDefecto();
}

/**
 * CONFIGURA TODOS LOS EVENT LISTENERS DE LA APLICACIÓN
 * Propósito: Establecer manejadores para interacciones del usuario
 * Eventos configurados:
 *   - Cambios en filtros
 *   - Clicks en botones de acción
 *   - Validaciones en tiempo real
 */
function configurarEventListeners() {
    // Referencias a elementos del DOM
    const periodoSelect = document.getElementById('periodo');
    const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
    const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
    const btnExportar = document.getElementById('btnExportar');
    const btnCompartir = document.getElementById('btnCompartir');
    const btnVerTodos = document.getElementById('btnVerTodos');
    
    // Configurar evento para cambio de período
    if (periodoSelect) {
        periodoSelect.addEventListener('change', manejarCambioPeriodo);
    }
    
    // Configurar eventos para botones de acción
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    }
    
    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    }
    
    if (btnExportar) {
        btnExportar.addEventListener('click', manejarExportacion);
    }
    
    if (btnCompartir) {
        btnCompartir.addEventListener('click', manejarCompartir);
    }
    
    if (btnVerTodos) {
        btnVerTodos.addEventListener('click', mostrarTodosLosRegistros);
    }
    
    // Event listeners para cambios en tiempo real (actualización automática)
    document.getElementById('tipo-reporte')?.addEventListener('change', actualizarVistaPrevia);
    document.getElementById('ubicacion')?.addEventListener('change', actualizarVistaPrevia);
    document.getElementById('brigada')?.addEventListener('change', actualizarVistaPrevia);
    
    // Validación de fechas personalizadas
    document.getElementById('fecha-inicio')?.addEventListener('change', validarFechas);
    document.getElementById('fecha-fin')?.addEventListener('change', validarFechas);
}

/**
 * CONFIGURA LAS FECHAS POR DEFECTO PARA LOS FILTROS
 * Propósito: Establecer valores iniciales razonables para los filtros de fecha
 * Configuración: Último mes como rango por defecto
 */
function configurarFechasPorDefecto() {
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 1); // Último mes por defecto
    
    // Establecer valores en los inputs de fecha
    document.getElementById('fecha-fin').value = formatearFecha(fechaFin);
    document.getElementById('fecha-inicio').value = formatearFecha(fechaInicio);
}

/**
 * FORMATEA UNA FECHA A YYYY-MM-DD PARA INPUTS DE TIPO DATE
 * @param {Date} fecha - Objeto Date a formatear
 * @returns {string} Fecha formateada en formato YYYY-MM-DD
 * Propósito: Convertir objetos Date al formato requerido por inputs HTML5
 */
function formatearFecha(fecha) {
    return fecha.toISOString().split('T')[0];
}

// ===== MANEJO DE FILTROS =====
/**
 * MANEJA EL CAMBIO EN EL SELECTOR DE PERÍODO
 * Propósito: Mostrar/ocultar filtros de fecha personalizada según selección
 * Comportamiento: Muestra campos de fecha solo para opción "personalizado"
 */
function manejarCambioPeriodo() {
    const periodo = this.value;
    const filtrosFecha = document.getElementById('filtros-fecha');
    
    if (periodo === 'personalizado') {
        filtrosFecha.style.display = 'flex';
    } else {
        filtrosFecha.style.display = 'none';
        // Aplicar filtros automáticamente cuando se cambia el período
        setTimeout(aplicarFiltros, 100);
    }
}

/**
 * APLICA LOS FILTROS SELECCIONADOS Y GENERA EL REPORTE
 * Propósito: Procesar filtros y actualizar la vista con datos filtrados
 * Flujo:
 *   1. Validar filtros obligatorios
 *   2. Obtener parámetros de filtrado
 *   3. Cargar datos filtrados
 *   4. Actualizar interfaz
 */
function aplicarFiltros() {
    mostrarEstadoCarga('Aplicando filtros...');
    
    // Validar filtros obligatorios antes de proceder
    if (!validarFiltrosObligatorios()) {
        ocultarEstadoCarga();
        return;
    }
    
    // Obtener parámetros de filtrado actuales
    const filtros = obtenerParametrosFiltros();
    
    // Simular carga de datos (en producción sería una llamada AJAX)
    setTimeout(() => {
        cargarDatosFiltrados(filtros);
        ocultarEstadoCarga();
    }, 1000);
}

/**
 * VALIDA QUE LOS FILTROS OBLIGATORIOS ESTÉN COMPLETOS
 * @returns {boolean} True si los filtros obligatorios son válidos
 * Propósito: Garantizar que se hayan seleccionado los parámetros mínimos requeridos
 * Filtros obligatorios: Tipo de reporte y período
 */
function validarFiltrosObligatorios() {
    const tipoReporte = document.getElementById('tipo-reporte').value;
    const periodo = document.getElementById('periodo').value;
    
    // Validar tipo de reporte
    if (!tipoReporte) {
        mostrarError('Por favor seleccione un tipo de reporte');
        return false;
    }
    
    // Validar período
    if (!periodo) {
        mostrarError('Por favor seleccione un período');
        return false;
    }
    
    // Validaciones adicionales para período personalizado
    if (periodo === 'personalizado') {
        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;
        
        if (!fechaInicio || !fechaFin) {
            mostrarError('Por favor seleccione ambas fechas para el período personalizado');
            return false;
        }
        
        if (new Date(fechaInicio) > new Date(fechaFin)) {
            mostrarError('La fecha de inicio no puede ser mayor a la fecha fin');
            return false;
        }
    }
    
    return true;
}

/**
 * OBTIENE TODOS LOS PARÁMETROS DE FILTRO ACTUALES
 * @returns {Object} Objeto con todos los parámetros de filtrado
 * Propósito: Recopilar todos los valores de filtro para procesamiento
 */
function obtenerParametrosFiltros() {
    const periodo = document.getElementById('periodo').value;
    let fechaInicio, fechaFin;
    
    // Calcular fechas según el período seleccionado
    if (periodo === 'personalizado') {
        fechaInicio = document.getElementById('fecha-inicio').value;
        fechaFin = document.getElementById('fecha-fin').value;
    } else {
        const rangoFechas = calcularRangoFechas(periodo);
        fechaInicio = rangoFechas.inicio;
        fechaFin = rangoFechas.fin;
    }
    
    return {
        tipoReporte: document.getElementById('tipo-reporte').value,
        periodo: periodo,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        ubicacion: document.getElementById('ubicacion').value,
        brigada: document.getElementById('brigada').value
    };
}

/**
 * CALCULA EL RANGO DE FECHAS SEGÚN EL PERÍODO SELECCIONADO
 * @param {string} periodo - Período seleccionado (hoy, semana, mes, etc.)
 * @returns {Object} Objeto con fechas de inicio y fin calculadas
 * Propósito: Convertir períodos nominales a rangos de fecha concretos
 */
function calcularRangoFechas(periodo) {
    const hoy = new Date();
    let inicio = new Date();
    let fin = new Date();
    
    // Calcular fecha de inicio según el período
    switch (periodo) {
        case 'hoy':
            // Mismo día - no se modifica la fecha de inicio
            break;
        case 'semana':
            inicio.setDate(hoy.getDate() - 7);
            break;
        case 'mes':
            inicio.setMonth(hoy.getMonth() - 1);
            break;
        case 'trimestre':
            inicio.setMonth(hoy.getMonth() - 3);
            break;
        case 'anio':
            inicio.setFullYear(hoy.getFullYear() - 1);
            break;
        default:
            inicio.setMonth(hoy.getMonth() - 1); // Último mes por defecto
    }
    
    return {
        inicio: formatearFecha(inicio),
        fin: formatearFecha(fin)
    };
}

/**
 * LIMPIA TODOS LOS FILTROS Y RESTABLECE LA VISTA
 * Propósito: Permitir al usuario restablecer todos los filtros a valores por defecto
 * Acciones:
 *   - Resetear selects
 *   - Ocultar filtros de fecha personalizada
 *   - Restablecer fechas por defecto
 *   - Limpiar vista previa
 */
function limpiarFiltros() {
    // Resetear todos los selects de filtros
    document.querySelectorAll('.filtros-grid select').forEach(select => {
        select.value = '';
    });
    
    // Ocultar filtros de fecha personalizada
    document.getElementById('filtros-fecha').style.display = 'none';
    
    // Restablecer fechas por defecto
    configurarFechasPorDefecto();
    
    // Limpiar vista previa
    limpiarVistaPrevia();
    
    mostrarMensaje('Filtros limpiados correctamente', 'success');
}

/**
 * VALIDA QUE LAS FECHAS SELECCIONADAS SEAN COHERENTES
 * Propósito: Prevenir que la fecha de inicio sea mayor que la fecha fin
 * Comportamiento: Si las fechas son inválidas, limpia el campo de fecha inicio
 */
function validarFechas() {
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
        mostrarError('La fecha de inicio no puede ser mayor a la fecha fin');
        document.getElementById('fecha-inicio').value = '';
    }
}

// ===== CARGA Y MANEJO DE DATOS =====
/**
 * CARGA LOS DATOS INICIALES DE LA APLICACIÓN
 * Propósito: Obtener datos base para mostrar en la interfaz
 * En producción: Realizaría una llamada AJAX al servidor
 * En desarrollo: Usa datos de ejemplo simulados
 */
function cargarDatosIniciales() {
    mostrarEstadoCarga('Cargando datos iniciales...');
    
    // Simular carga de datos iniciales
    setTimeout(() => {
        // Datos de ejemplo para demostración
        datosGlobales = generarDatosEjemplo();
        actualizarVistaPrevia();
        ocultarEstadoCarga();
    }, 1500);
}

/**
 * CARGA DATOS FILTRADOS SEGÚN LOS PARÁMETROS
 * @param {Object} filtros - Objeto con parámetros de filtrado
 * Propósito: Aplicar filtros a los datos y actualizar la vista
 */
function cargarDatosFiltrados(filtros) {
    console.log('Aplicando filtros:', filtros);
    
    // Filtrar datos globales según los parámetros
    const datosFiltrados = filtrarDatos(datosGlobales, filtros);
    
    if (datosFiltrados.totalRegistros > 0) {
        actualizarVistaConDatos(datosFiltrados);
        mostrarMensaje(`Reporte generado con ${datosFiltrados.totalRegistros} registros`, 'success');
    } else {
        mostrarSinDatos();
        mostrarMensaje('No se encontraron registros con los filtros aplicados', 'warning');
    }
}

/**
 * FILTRA LOS DATOS SEGÚN LOS PARÁMETROS ESPECIFICADOS
 * @param {Object} datos - Datos completos a filtrar
 * @param {Object} filtros - Parámetros de filtrado
 * @returns {Object} Datos filtrados
 * Propósito: Aplicar lógica de filtrado a los datos globales
 * Nota: En implementación real, este filtrado se haría en el servidor
 */
function filtrarDatos(datos, filtros) {
    // En una implementación real, esto se haría en el servidor
    // Aquí simulamos el filtrado
    
    let datosFiltrados = JSON.parse(JSON.stringify(datos)); // Copia profunda
    
    // Aplicar filtro por ubicación si está especificado
    if (filtros.ubicacion) {
        datosFiltrados.especies = datosFiltrados.especies.filter(especie => 
            especie.ubicacion === filtros.ubicacion
        );
    }
    
    // Aplicar filtro por brigada si está especificado
    if (filtros.brigada) {
        datosFiltrados.especies = datosFiltrados.especies.filter(especie => 
            especie.brigada === filtros.brigada
        );
    }
    
    // Recalcular totales después del filtrado
    datosFiltrados.totalArboles = datosFiltrados.especies.reduce((sum, esp) => sum + esp.cantidad, 0);
    datosFiltrados.totalEspecies = new Set(datosFiltrados.especies.map(esp => esp.nombre)).size;
    
    return datosFiltrados;
}

/**
 * GENERA DATOS DE EJEMPLO PARA DEMOSTRACIÓN
 * @returns {Object} Objeto con datos de ejemplo estructurados
 * Propósito: Proporcionar datos de prueba para desarrollo y demostración
 * Estructura: Incluye totales, listado de especies, registros mensuales y distribución
 */
function generarDatosEjemplo() {
    return {
        totalArboles: 1247,
        totalSuelos: 89,
        totalEspecies: 24,
        avance: '72%',
        especies: [
            { nombre: 'Quercus humboldtii', cantidad: 215, altura: 18.5, diametro: 45.2, condicion: 'Excelente', ubicacion: 'andes', brigada: 'brigada5' },
            { nombre: 'Ceroxylon quindiuense', cantidad: 187, altura: 22.3, diametro: 38.7, condicion: 'Buena', ubicacion: 'andes', brigada: 'brigada5' },
            { nombre: 'Anacardium excelsum', cantidad: 156, altura: 15.8, diametro: 52.1, condicion: 'Regular', ubicacion: 'amazonia', brigada: 'brigada2' },
            { nombre: 'Cedrela odorata', cantidad: 134, altura: 20.1, diametro: 41.5, condicion: 'Buena', ubicacion: 'caribe', brigada: 'brigada1' },
            { nombre: 'Swietenia macrophylla', cantidad: 98, altura: 17.6, diametro: 48.9, condicion: 'Excelente', ubicacion: 'pacifico', brigada: 'brigada4' },
            { nombre: 'Pinus tropicalis', cantidad: 87, altura: 19.2, diametro: 36.8, condicion: 'Buena', ubicacion: 'norte', brigada: 'brigada1' },
            { nombre: 'Miconia albicans', cantidad: 76, altura: 8.5, diametro: 12.3, condicion: 'Regular', ubicacion: 'sur', brigada: 'brigada2' },
            { nombre: 'Ocotea caparrapi', cantidad: 65, altura: 21.7, diametro: 43.2, condicion: 'Excelente', ubicacion: 'andes', brigada: 'brigada5' },
            { nombre: 'Ficus andicola', cantidad: 54, altura: 14.3, diametro: 67.8, condicion: 'Buena', ubicacion: 'amazonia', brigada: 'brigada3' },
            { nombre: 'Brownea ariza', cantidad: 43, altura: 11.2, diametro: 28.9, condicion: 'Regular', ubicacion: 'caribe', brigada: 'brigada1' },
            { nombre: 'Otras especies', cantidad: 132, altura: 12.8, diametro: 22.4, condicion: 'Variable', ubicacion: 'varias', brigada: 'varias' }
        ],
        registrosMensuales: {
            arboles: [45, 52, 68, 71, 89, 102, 115, 98, 87, 76, 65, 58],
            suelos: [12, 15, 18, 22, 25, 28, 31, 27, 24, 21, 19, 16]
        },
        distribucionCondicion: {
            'Excelente': 35,
            'Buena': 45,
            'Regular': 15,
            'Mala': 5
        }
    };
}

// ===== ACTUALIZACIÓN DE LA VISTA =====
/**
 * ACTUALIZA LA VISTA PREVIA CON LOS DATOS ACTUALES
 * Propósito: Sincronizar la interfaz con el estado actual de los datos
 * Se ejecuta automáticamente cuando cambian los filtros
 */
function actualizarVistaPrevia() {
    if (!datosGlobales) return;
    
    const filtros = obtenerParametrosFiltros();
    const datosFiltrados = filtrarDatos(datosGlobales, filtros);
    actualizarVistaConDatos(datosFiltrados);
}

/**
 * ACTUALIZA TODOS LOS ELEMENTOS DE LA VISTA CON LOS DATOS PROPORCIONADOS
 * @param {Object} datos - Datos a mostrar en la interfaz
 * Propósito: Coordinar la actualización de todos los componentes visuales
 */
function actualizarVistaConDatos(datos) {
    // Actualizar estadísticas rápidas
    actualizarEstadisticasRapidas(datos);
    
    // Actualizar tabla de datos
    actualizarTablaDatos(datos.especies);
    
    // Generar/actualizar gráficos
    generarGraficos(datos);
    
    // Ocultar mensaje de sin datos
    document.getElementById('sinDatos').style.display = 'none';
}

/**
 * ACTUALIZA LAS TARJETAS DE ESTADÍSTICAS RÁPIDAS
 * @param {Object} datos - Datos con las estadísticas a mostrar
 * Propósito: Actualizar los valores numéricos en las tarjetas de resumen
 */
function actualizarEstadisticasRapidas(datos) {
    document.getElementById('total-arboles').textContent = datos.totalArboles.toLocaleString();
    document.getElementById('total-suelos').textContent = datos.totalSuelos.toLocaleString();
    document.getElementById('total-especies').textContent = datos.totalEspecies.toLocaleString();
    document.getElementById('avance').textContent = datos.avance;
}

/**
 * ACTUALIZA LA TABLA DE DATOS CON LA INFORMACIÓN DE ESPECIES
 * @param {Array} especies - Array de objetos con datos de especies
 * Propósito: Poblar la tabla con datos actualizados de especies forestales
 */
function actualizarTablaDatos(especies) {
    const tablaBody = document.getElementById('tabla-datos-body');
    tablaBody.innerHTML = '';
    
    especies.forEach(especie => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${especie.nombre}</td>
            <td>${especie.cantidad.toLocaleString()}</td>
            <td>${especie.altura}</td>
            <td>${especie.diametro}</td>
            <td><span class="badge-condicion ${especie.condicion.toLowerCase()}">${especie.condicion}</span></td>
        `;
        tablaBody.appendChild(fila);
    });
}

/**
 * LIMPIA TODA LA VISTA PREVIA
 * Propósito: Restablecer la interfaz a estado inicial sin datos
 * Acciones: Restablece estadísticas, limpia tabla y destruye gráficos
 */
function limpiarVistaPrevia() {
    // Restablecer estadísticas a cero
    document.getElementById('total-arboles').textContent = '0';
    document.getElementById('total-suelos').textContent = '0';
    document.getElementById('total-especies').textContent = '0';
    document.getElementById('avance').textContent = '0%';
    
    // Limpiar tabla
    document.getElementById('tabla-datos-body').innerHTML = '';
    
    // Destruir gráficos existentes
    destruirGraficos();
    
    // Mostrar mensaje de sin datos
    document.getElementById('sinDatos').style.display = 'block';
}

/**
 * MUESTRA LA VISTA CUANDO NO HAY DATOS
 * Propósito: Mostrar estado vacío con mensaje informativo
 */
function mostrarSinDatos() {
    limpiarVistaPrevia();
}

/**
 * MUESTRA TODOS LOS REGISTROS SIN FILTROS
 * Propósito: Restablecer la vista para mostrar todos los datos disponibles
 */
function mostrarTodosLosRegistros() {
    document.getElementById('periodo').value = '';
    document.getElementById('ubicacion').value = '';
    document.getElementById('brigada').value = '';
    document.getElementById('filtros-fecha').style.display = 'none';
    
    actualizarVistaPrevia();
    mostrarMensaje('Mostrando todos los registros disponibles', 'info');
}

// ===== GRÁFICOS =====
/**
 * GENERA TODOS LOS GRÁFICOS DEL REPORTE
 * @param {Object} datos - Datos para generar los gráficos
 * Propósito: Crear y renderizar todas las visualizaciones gráficas
 */
function generarGraficos(datos) {
    // Destruir gráficos existentes antes de crear nuevos
    destruirGraficos();
    
    // Generar gráfico de distribución de especies
    generarGraficoEspecies(datos.especies);
    
    // Generar gráfico de registros mensuales
    generarGraficoRegistros(datos.registrosMensuales);
    
    // Generar gráfico de condición de árboles
    generarGraficoCondicion(datos.distribucionCondicion);
}

/**
 * GENERA EL GRÁFICO CIRCULAR DE DISTRIBUCIÓN DE ESPECIES
 * @param {Array} especies - Array de datos de especies para el gráfico
 * Propósito: Visualizar la distribución proporcional de especies forestales
 * Tipo de gráfico: Doughnut (anillo) para mejor estética y espacio
 */
function generarGraficoEspecies(especies) {
    const ctx = document.getElementById('graficoEspecies').getContext('2d');
    
    // Preparar datos para el gráfico
    const labels = especies.map(esp => esp.nombre);
    const datos = especies.map(esp => esp.cantidad);
    const colores = generarColores(especies.length);
    
    graficoEspeciesInstancia = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: datos,
                backgroundColor: colores,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '50%'
        }
    });
}

/**
 * GENERA EL GRÁFICO DE BARRAS DE REGISTROS MENSUALES
 * @param {Object} registrosMensuales - Datos de registros por mes
 * Propósito: Mostrar tendencia temporal de registros de árboles y suelos
 * Tipo de gráfico: Barras agrupadas para comparación visual
 */
function generarGraficoRegistros(registrosMensuales) {
    const ctx = document.getElementById('graficoRegistros').getContext('2d');
    
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    graficoRegistrosInstancia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Árboles',
                    data: registrosMensuales.arboles,
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                },
                {
                    label: 'Suelos',
                    data: registrosMensuales.suelos,
                    backgroundColor: '#2196F3',
                    borderColor: '#1976D2',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de Registros'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Meses'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

/**
 * GENERA EL GRÁFICO DE CONDICIÓN DE LOS ÁRBOLES
 * @param {Object} distribucionCondicion - Datos de distribución por condición
 * Propósito: Visualizar el estado de salud general del bosque
 * Nota: Este gráfico se renderiza solo si existe el canvas correspondiente
 */
function generarGraficoCondicion(distribucionCondicion) {
    // Este gráfico se podría agregar en un tercer canvas si está disponible
    const canvasCondicion = document.getElementById('graficoCondicion');
    if (!canvasCondicion) return;
    
    const ctx = canvasCondicion.getContext('2d');
    
    const condiciones = Object.keys(distribucionCondicion);
    const valores = Object.values(distribucionCondicion);
    const colores = ['#4CAF50', '#8BC34A', '#FFC107', '#F44336'];
    
    graficoSaludInstancia = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: condiciones,
            datasets: [{
                data: valores,
                backgroundColor: colores
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * DESTRUYE TODOS LOS GRÁFICOS EXISTENTES
 * Propósito: Liberar recursos y preparar para nueva generación de gráficos
 * Importante: Previene memory leaks en Chart.js
 */
function destruirGraficos() {
    if (graficoEspeciesInstancia) {
        graficoEspeciesInstancia.destroy();
        graficoEspeciesInstancia = null;
    }
    
    if (graficoRegistrosInstancia) {
        graficoRegistrosInstancia.destroy();
        graficoRegistrosInstancia = null;
    }
    
    if (graficoSaludInstancia) {
        graficoSaludInstancia.destroy();
        graficoSaludInstancia = null;
    }
}

/**
 * GENERA UN ARRAY DE COLORES PARA LOS GRÁFICOS
 * @param {number} cantidad - Número de colores necesarios
 * @returns {Array} Array de colores en formato hexadecimal o HSL
 * Propósito: Proporcionar paleta de colores consistente para visualizaciones
 * Estrategia: Usa colores base y genera adicionales con ángulo dorado
 */
function generarColores(cantidad) {
    const coloresBase = [
        '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', 
        '#607D8B', '#795548', '#E91E63', '#00BCD4', '#8BC34A',
        '#FFC107', '#673AB7', '#3F51B5', '#009688', '#CDDC39'
    ];
    
    // Si necesitamos más colores, generamos variaciones
    if (cantidad <= coloresBase.length) {
        return coloresBase.slice(0, cantidad);
    }
    
    // Generar colores adicionales usando ángulo dorado para distribución uniforme
    const coloresAdicionales = [];
    for (let i = coloresBase.length; i < cantidad; i++) {
        const hue = (i * 137.508) % 360; // Usar ángulo dorado para distribución
        coloresAdicionales.push(`hsl(${hue}, 70%, 65%)`);
    }
    
    return [...coloresBase, ...coloresAdicionales].slice(0, cantidad);
}

// ===== EXPORTACIÓN Y COMPARTIR =====
/**
 * MANEJA LA EXPORTACIÓN DEL REPORTE
 * Propósito: Coordinar el proceso de exportación según formato seleccionado
 * Flujo: Validación → Generación → Descarga → Confirmación
 */
function manejarExportacion() {
    const formato = document.querySelector('input[name="formato"]:checked').value;
    
    if (!validarDatosParaExportar()) {
        mostrarError('No hay datos suficientes para generar el reporte');
        return;
    }
    
    mostrarEstadoCarga(`Generando reporte en formato ${formato.toUpperCase()}...`);
    
    // Simular generación de reporte
    setTimeout(() => {
        exportarReporte(formato);
        ocultarEstadoCarga();
    }, 2000);
}

/**
 * VALIDA QUE HAYA DATOS PARA EXPORTAR
 * @returns {boolean} True si hay datos suficientes para exportar
 * Propósito: Prevenir exportación de reportes vacíos
 */
function validarDatosParaExportar() {
    const totalArboles = parseInt(document.getElementById('total-arboles').textContent.replace(/,/g, ''));
    return totalArboles > 0;
}

/**
 * EXPORTA EL REPORTE EN EL FORMATO ESPECIFICADO
 * @param {string} formato - Formato de exportación (pdf, csv, excel)
 * Propósito: Generar y descargar el reporte en el formato solicitado
 */
function exportarReporte(formato) {
    const filtros = obtenerParametrosFiltros();
    const nombreArchivo = `reporte_ifn_${new Date().toISOString().split('T')[0]}.${formato}`;
    
    // Ejecutar exportación según formato
    switch (formato) {
        case 'pdf':
            simularDescargaPDF(nombreArchivo);
            break;
        case 'csv':
            generarCSV(nombreArchivo);
            break;
        case 'excel':
            simularDescargaExcel(nombreArchivo);
            break;
        default:
            mostrarError(`Formato ${formato} no soportado`);
            return;
    }
    
    mostrarMensaje(`Reporte exportado como ${nombreArchivo}`, 'success');
    
    // Registrar en analytics (simulado)
    registrarEventoExportacion(formato);
}

/**
 * SIMULA LA DESCARGA DE UN ARCHIVO PDF
 * @param {string} nombreArchivo - Nombre del archivo a descargar
 * Propósito: Simular el proceso de descarga de reporte PDF
 * Nota: En implementación real, generaría PDF con biblioteca como jsPDF
 */
function simularDescargaPDF(nombreArchivo) {
    // En una implementación real, aquí se generaría el PDF
    console.log(`Generando PDF: ${nombreArchivo}`);
    
    // Simular descarga
    const enlace = document.createElement('a');
    enlace.href = '#'; // En producción sería la URL del PDF generado
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

/**
 * GENERA Y DESCARGA UN ARCHIVO CSV
 * @param {string} nombreArchivo - Nombre del archivo CSV
 * Propósito: Exportar datos en formato CSV para análisis externo
 */
function generarCSV(nombreArchivo) {
    if (!datosGlobales) return;
    
    // Construir contenido CSV
    let contenidoCSV = 'Especie,Cantidad,Altura Promedio (m),Diámetro Promedio (cm),Condición\n';
    
    datosGlobales.especies.forEach(especie => {
        contenidoCSV += `"${especie.nombre}",${especie.cantidad},${especie.altura},${especie.diametro},"${especie.condicion}"\n`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
}

/**
 * SIMULA LA DESCARGA DE UN ARCHIVO EXCEL
 * @param {string} nombreArchivo - Nombre del archivo Excel
 * Propósito: Simular exportación a formato Excel
 * Nota: En implementación real, usaría biblioteca como SheetJS
 */
function simularDescargaExcel(nombreArchivo) {
    // En una implementación real, aquí se generaría el Excel
    console.log(`Generando Excel: ${nombreArchivo}`);
    
    // Simular descarga (similar a PDF)
    const enlace = document.createElement('a');
    enlace.href = '#';
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
}

/**
 * MANEJA EL COMPARTIR POR CORREO
 * Propósito: Permitir al usuario enviar el reporte por correo electrónico
 * Flujo: Validación → Solicitar email → Simular envío → Confirmación
 */
function manejarCompartir() {
    if (!validarDatosParaExportar()) {
        mostrarError('No hay datos para compartir');
        return;
    }
    
    const email = prompt('Ingrese el correo electrónico para compartir el reporte:');
    
    if (!email) return;
    
    if (!validarEmail(email)) {
        mostrarError('Por favor ingrese un correo electrónico válido');
        return;
    }
    
    mostrarEstadoCarga('Enviando reporte por correo...');
    
    // Simular envío
    setTimeout(() => {
        simularEnvioCorreo(email);
        ocultarEstadoCarga();
    }, 1500);
}

/**
 * VALIDA FORMATO DE EMAIL
 * @param {string} email - Dirección de correo a validar
 * @returns {boolean} True si el email tiene formato válido
 * Propósito: Validar sintácticamente direcciones de correo electrónico
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * SIMULA EL ENVÍO DE CORREO
 * @param {string} email - Dirección de correo destino
 * Propósito: Simular el proceso de envío de reporte por correo
 * Nota: En implementación real, conectaría con servicio de email
 */
function simularEnvioCorreo(email) {
    console.log(`Enviando reporte a: ${email}`);
    mostrarMensaje(`Reporte enviado exitosamente a ${email}`, 'success');
    
    // Registrar en analytics (simulado)
    registrarEventoCompartir(email);
}

// ===== UTILIDADES Y MANEJO DE ESTADO =====
/**
 * MUESTRA UN MENSAJE DE ESTADO AL USUARIO
 * @param {string} mensaje - Texto del mensaje a mostrar
 * Propósito: Proporcionar feedback visual durante operaciones largas
 * Implementación: Crea un toast notification temporal
 */
function mostrarEstadoCarga(mensaje) {
    // En una implementación real, mostraría un spinner o barra de progreso
    console.log(`⏳ ${mensaje}`);
    
    // Podría implementarse un toast de carga
    const existingToast = document.getElementById('loading-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.id = 'loading-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    toast.textContent = `⏳ ${mensaje}`;
    
    document.body.appendChild(toast);
}

/**
 * OCULTA EL MENSAJE DE ESTADO
 * Propósito: Remover el indicador de carga cuando finaliza la operación
 */
function ocultarEstadoCarga() {
    const toast = document.getElementById('loading-toast');
    if (toast) {
        toast.remove();
    }
}

/**
 * MUESTRA UN MENSAJE DE ERROR
 * @param {string} mensaje - Texto del mensaje de error
 * Propósito: Mostrar mensajes de error de forma estandarizada
 */
function mostrarError(mensaje) {
    mostrarMensaje(mensaje, 'error');
}

/**
 * MUESTRA UN MENSAJE AL USUARIO
 * @param {string} mensaje - Texto del mensaje
 * @param {string} tipo - Tipo de mensaje (success, error, warning, info)
 * Propósito: Sistema unificado de notificaciones al usuario
 * Características: Toast notification con colores semánticos
 */
function mostrarMensaje(mensaje, tipo = 'info') {
    // Colores según el tipo de mensaje
    const colores = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
    };
    
    const color = colores[tipo] || colores.info;
    const icono = tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    // Crear y mostrar toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = `${icono} ${mensaje}`;
    
    document.body.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

/**
 * REGISTRA EVENTO DE EXPORTACIÓN (SIMULACIÓN DE ANALYTICS)
 * @param {string} formato - Formato de exportación utilizado
 * Propósito: Registrar métricas de uso para análisis posterior
 * Nota: En producción, enviaría datos a Google Analytics o similar
 */
function registrarEventoExportacion(formato) {
    console.log(`📊 Evento de exportación: ${formato}`);
    // En producción, enviar a Google Analytics o similar
}

/**
 * REGISTRA EVENTO DE COMPARTIR (SIMULACIÓN DE ANALYTICS)
 * @param {string} email - Email al que se compartió (parcialmente ofuscado)
 * Propósito: Registrar métricas de compartir reportes
 */
function registrarEventoCompartir(email) {
    console.log(`📧 Evento de compartir: ${email.substring(0, 3)}...`);
    // En producción, enviar a Google Analytics o similar
}

// ===== ESTILOS DINÁMICOS =====
/**
 * AGREGA ESTILOS CSS DINÁMICOS PARA LA APLICACIÓN
 * Propósito: Inyectar estilos específicos necesarios para la funcionalidad
 * Ventaja: No requiere archivo CSS adicional para estilos específicos
 */
function agregarEstilosDinamicos() {
    const estilos = `
        .badge-condicion {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .badge-condicion.excelente {
            background-color: #4CAF50;
            color: white;
        }
        
        .badge-condicion.buena {
            background-color: #8BC34A;
            color: white;
        }
        
        .badge-condicion.regular {
            background-color: #FFC107;
            color: #212121;
        }
        
        .badge-condicion.mala {
            background-color: #F44336;
            color: white;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .filtro-grupo select:focus,
        .filtro-grupo input:focus {
            border-color: #2E7D32;
            box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
            outline: none;
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
 * INTERFAZ PÚBLICA DEL MÓDULO DE REPORTES
 * Propósito: Exponer funciones principales para uso externo si es necesario
 * Ventaja: Permite integración con otros módulos del sistema
 */
window.ReportesIFN = {
    aplicarFiltros,
    limpiarFiltros,
    exportarReporte,
    generarGraficos
};

// Mensaje de confirmación de carga
console.log('Módulo de reportes IFN cargado correctamente');