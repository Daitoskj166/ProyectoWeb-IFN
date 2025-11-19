// estadisticas.js - Lógica para la generación de reportes del IFN

// ===== DECLARACIÓN DE VARIABLES GLOBALES =====
let datosGlobales = null;
let graficoEspeciesInstancia = null;
let graficoRegistrosInstancia = null;
let graficoSaludInstancia = null;

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    inicializarAplicacion();
});

/**
 * Función principal de inicialización de la aplicación
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
 * Configura todos los event listeners de la aplicación
 */
function configurarEventListeners() {
    // Event listeners para filtros
    const periodoSelect = document.getElementById('periodo');
    const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
    const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
    const btnExportar = document.getElementById('btnExportar');
    const btnCompartir = document.getElementById('btnCompartir');
    const btnVerTodos = document.getElementById('btnVerTodos');
    
    // Filtro de período
    if (periodoSelect) {
        periodoSelect.addEventListener('change', manejarCambioPeriodo);
    }
    
    // Botones de acción
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
    
    // Event listeners para cambios en tiempo real
    document.getElementById('tipo-reporte')?.addEventListener('change', actualizarVistaPrevia);
    document.getElementById('ubicacion')?.addEventListener('change', actualizarVistaPrevia);
    document.getElementById('brigada')?.addEventListener('change', actualizarVistaPrevia);
    
    // Filtros de fecha personalizada
    document.getElementById('fecha-inicio')?.addEventListener('change', validarFechas);
    document.getElementById('fecha-fin')?.addEventListener('change', validarFechas);
}

/**
 * Configura las fechas por defecto para los filtros
 */
function configurarFechasPorDefecto() {
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 1); // Último mes por defecto
    
    document.getElementById('fecha-fin').value = formatearFecha(fechaFin);
    document.getElementById('fecha-inicio').value = formatearFecha(fechaInicio);
}

/**
 * Formatea una fecha a YYYY-MM-DD para inputs de tipo date
 */
function formatearFecha(fecha) {
    return fecha.toISOString().split('T')[0];
}

// ===== MANEJO DE FILTROS =====

/**
 * Maneja el cambio en el selector de período
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
 * Aplica los filtros seleccionados y genera el reporte
 */
function aplicarFiltros() {
    mostrarEstadoCarga('Aplicando filtros...');
    
    // Validar filtros obligatorios
    if (!validarFiltrosObligatorios()) {
        ocultarEstadoCarga();
        return;
    }
    
    // Obtener parámetros de filtrado
    const filtros = obtenerParametrosFiltros();
    
    // Simular carga de datos (en producción sería una llamada AJAX)
    setTimeout(() => {
        cargarDatosFiltrados(filtros);
        ocultarEstadoCarga();
    }, 1000);
}

/**
 * Valida que los filtros obligatorios estén completos
 */
function validarFiltrosObligatorios() {
    const tipoReporte = document.getElementById('tipo-reporte').value;
    const periodo = document.getElementById('periodo').value;
    
    if (!tipoReporte) {
        mostrarError('Por favor seleccione un tipo de reporte');
        return false;
    }
    
    if (!periodo) {
        mostrarError('Por favor seleccione un período');
        return false;
    }
    
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
 * Obtiene todos los parámetros de filtro actuales
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
 * Calcula el rango de fechas según el período seleccionado
 */
function calcularRangoFechas(periodo) {
    const hoy = new Date();
    let inicio = new Date();
    let fin = new Date();
    
    switch (periodo) {
        case 'hoy':
            // Mismo día
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
 * Limpia todos los filtros y restablece la vista
 */
function limpiarFiltros() {
    // Resetear selects
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
 * Valida que las fechas seleccionadas sean coherentes
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
 * Carga los datos iniciales de la aplicación
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
 * Carga datos filtrados según los parámetros
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
 * Filtra los datos según los parámetros especificados
 */
function filtrarDatos(datos, filtros) {
    // En una implementación real, esto se haría en el servidor
    // Aquí simulamos el filtrado
    
    let datosFiltrados = JSON.parse(JSON.stringify(datos)); // Copia profunda
    
    // Aplicar filtros (simulación)
    if (filtros.ubicacion) {
        datosFiltrados.especies = datosFiltrados.especies.filter(especie => 
            especie.ubicacion === filtros.ubicacion
        );
    }
    
    if (filtros.brigada) {
        datosFiltrados.especies = datosFiltrados.especies.filter(especie => 
            especie.brigada === filtros.brigada
        );
    }
    
    // Recalcular totales
    datosFiltrados.totalArboles = datosFiltrados.especies.reduce((sum, esp) => sum + esp.cantidad, 0);
    datosFiltrados.totalEspecies = new Set(datosFiltrados.especies.map(esp => esp.nombre)).size;
    
    return datosFiltrados;
}

/**
 * Genera datos de ejemplo para demostración
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
 * Actualiza la vista previa con los datos actuales
 */
function actualizarVistaPrevia() {
    if (!datosGlobales) return;
    
    const filtros = obtenerParametrosFiltros();
    const datosFiltrados = filtrarDatos(datosGlobales, filtros);
    actualizarVistaConDatos(datosFiltrados);
}

/**
 * Actualiza todos los elementos de la vista con los datos proporcionados
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
 * Actualiza las tarjetas de estadísticas rápidas
 */
function actualizarEstadisticasRapidas(datos) {
    document.getElementById('total-arboles').textContent = datos.totalArboles.toLocaleString();
    document.getElementById('total-suelos').textContent = datos.totalSuelos.toLocaleString();
    document.getElementById('total-especies').textContent = datos.totalEspecies.toLocaleString();
    document.getElementById('avance').textContent = datos.avance;
}

/**
 * Actualiza la tabla de datos con la información de especies
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
 * Limpia toda la vista previa
 */
function limpiarVistaPrevia() {
    // Restablecer estadísticas
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
 * Muestra la vista cuando no hay datos
 */
function mostrarSinDatos() {
    limpiarVistaPrevia();
}

/**
 * Muestra todos los registros sin filtros
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
 * Genera todos los gráficos del reporte
 */
function generarGraficos(datos) {
    // Destruir gráficos existentes
    destruirGraficos();
    
    // Generar gráfico de distribución de especies
    generarGraficoEspecies(datos.especies);
    
    // Generar gráfico de registros mensuales
    generarGraficoRegistros(datos.registrosMensuales);
    
    // Generar gráfico de condición de árboles
    generarGraficoCondicion(datos.distribucionCondicion);
}

/**
 * Genera el gráfico circular de distribución de especies
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
 * Genera el gráfico de barras de registros mensuales
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
 * Genera el gráfico de condición de los árboles
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
 * Destruye todos los gráficos existentes
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
 * Genera un array de colores para los gráficos
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
    
    // Generar colores adicionales
    const coloresAdicionales = [];
    for (let i = coloresBase.length; i < cantidad; i++) {
        const hue = (i * 137.508) % 360; // Usar ángulo dorado para distribución
        coloresAdicionales.push(`hsl(${hue}, 70%, 65%)`);
    }
    
    return [...coloresBase, ...coloresAdicionales].slice(0, cantidad);
}

// ===== EXPORTACIÓN Y COMPARTIR =====

/**
 * Maneja la exportación del reporte
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
 * Valida que haya datos para exportar
 */
function validarDatosParaExportar() {
    const totalArboles = parseInt(document.getElementById('total-arboles').textContent.replace(/,/g, ''));
    return totalArboles > 0;
}

/**
 * Exporta el reporte en el formato especificado
 */
function exportarReporte(formato) {
    const filtros = obtenerParametrosFiltros();
    const nombreArchivo = `reporte_ifn_${new Date().toISOString().split('T')[0]}.${formato}`;
    
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
 * Simula la descarga de un archivo PDF
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
 * Genera y descarga un archivo CSV
 */
function generarCSV(nombreArchivo) {
    if (!datosGlobales) return;
    
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
 * Simula la descarga de un archivo Excel
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
 * Maneja el compartir por correo
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
 * Valida formato de email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Simula el envío de correo
 */
function simularEnvioCorreo(email) {
    console.log(`Enviando reporte a: ${email}`);
    mostrarMensaje(`Reporte enviado exitosamente a ${email}`, 'success');
    
    // Registrar en analytics (simulado)
    registrarEventoCompartir(email);
}

// ===== UTILIDADES Y MANEJO DE ESTADO =====

/**
 * Muestra un mensaje de estado al usuario
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
 * Oculta el mensaje de estado
 */
function ocultarEstadoCarga() {
    const toast = document.getElementById('loading-toast');
    if (toast) {
        toast.remove();
    }
}

/**
 * Muestra un mensaje de error
 */
function mostrarError(mensaje) {
    mostrarMensaje(mensaje, 'error');
}

/**
 * Muestra un mensaje al usuario
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
 * Registra evento de exportación (simulación de analytics)
 */
function registrarEventoExportacion(formato) {
    console.log(`📊 Evento de exportación: ${formato}`);
    // En producción, enviar a Google Analytics o similar
}

/**
 * Registra evento de compartir (simulación de analytics)
 */
function registrarEventoCompartir(email) {
    console.log(`📧 Evento de compartir: ${email.substring(0, 3)}...`);
    // En producción, enviar a Google Analytics o similar
}

// ===== ESTILOS DINÁMICOS =====

/**
 * Agrega estilos CSS dinámicos para la aplicación
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

// Exportar funciones principales para uso global (si es necesario)
window.ReportesIFN = {
    aplicarFiltros,
    limpiarFiltros,
    exportarReporte,
    generarGraficos
};

console.log('Módulo de reportes IFN cargado correctamente');