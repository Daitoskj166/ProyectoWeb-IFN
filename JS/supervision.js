/**
 * SISTEMA DE SUPERVISIÓN DE CALIDAD DE DATOS - IFN COLOMBIA
 * 
 * Este módulo maneja la supervisión, corrección y reporte de la calidad
 * de los datos del Inventario Forestal Nacional.
 * 
 * @file supervision.js
 * @version 1.0
 * @author Inventario Forestal Nacional - Colombia
 */

// ===== APLICACIÓN DE SUPERVISIÓN =====

/**
 * Inicializa la aplicación de supervisión después de la autenticación
 * @returns {void}
 */
function inicializarAplicacionSupervision() {
    // =============================================
    // VARIABLES GLOBALES Y CONFIGURACIÓN
    // =============================================
    
    /**
     * Campo de búsqueda global para filtrar registros
     * @type {HTMLInputElement}
     */
    const searchBox = document.querySelector('.search-box input');
    
    /**
     * Botones de filtro rápido para categorías de problemas
     * @type {NodeList}
     */
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    
    /**
     * Contenedor principal de registros problemáticos
     * @type {HTMLElement}
     */
    const registrosContainer = document.querySelector('.registros-container');
    
    /**
     * Botón para aplicar correcciones masivas
     * @type {HTMLButtonElement}
     */
    const btnAplicarCorreccion = document.querySelector('.btn-aplicar-correccion');
    
    /**
     * Botón para previsualizar cambios antes de aplicar correcciones
     * @type {HTMLButtonElement}
     */
    const btnPrevisualizar = document.querySelector('.btn-previsualizar');
    
    /**
     * Botón para generar reportes de incidencias
     * @type {HTMLButtonElement}
     */
    const btnGenerarReporte = document.querySelector('.btn-generar-reporte');
    
    /**
     * Botón para exportar reportes generados
     * @type {HTMLButtonElement}
     */
    const btnExportar = document.querySelector('.btn-exportar');
    
    /**
     * Botón para archivar registros corruptos
     * @type {HTMLButtonElement}
     */
    const btnArchivar = document.querySelector('.btn-archivar');
    
    /**
     * Botón para eliminar permanentemente registros corruptos
     * @type {HTMLButtonElement}
     */
    const btnEliminar = document.querySelector('.btn-eliminar');
    
    /**
     * Botón para generar reportes de auditoría
     * @type {HTMLButtonElement}
     */
    const btnReporteAuditoria = document.querySelector('.btn-reporte-auditoria');
    
    // Elementos del formulario de corrección masiva
    /**
     * Selector de patrones de error para corrección masiva
     * @type {HTMLSelectElement}
     */
    const patronErrorSelect = document.getElementById('patron-error');
    
    /**
     * Textarea para describir la corrección a aplicar
     * @type {HTMLTextAreaElement}
     */
    const correccionTextarea = document.getElementById('correccion-aplicar');
    
    /**
     * Input que muestra el número de registros afectados
     * @type {HTMLInputElement}
     */
    const registrosAfectadosInput = document.getElementById('registros-afectados');
    
    /**
     * Selector de fecha para la aplicación de correcciones
     * @type {HTMLInputElement}
     */
    const fechaAplicacionInput = document.getElementById('fecha-aplicacion');
    
    // Elementos del formulario de reportes
    /**
     * Selector de tipo de reporte
     * @type {HTMLSelectElement}
     */
    const tipoReporteSelect = document.getElementById('tipo-reporte');
    
    /**
     * Selector de fecha de inicio para reportes
     * @type {HTMLInputElement}
     */
    const fechaInicioInput = document.getElementById('fecha-inicio');
    
    /**
     * Selector de fecha fin para reportes
     * @type {HTMLInputElement}
     */
    const fechaFinInput = document.getElementById('fecha-fin');
    
    /**
     * Opciones de formato de exportación para reportes
     * @type {NodeList}
     */
    const formatosExportacion = document.querySelectorAll('input[name="formato"]');
    
    /**
     * Datos de ejemplo para simular registros problemáticos
     * En producción, estos datos vendrían de una API
     * @type {Array<Object>}
     */
    let registrosProblemas = [
        {
            id: 'REG-2024-001',
            tipo: 'geolocalizacion',
            problema: 'Coordenadas fuera de rango válido',
            fecha: '2024-03-15',
            brigada: 'Norte',
            severidad: 'critico',
            descripcion: 'Las coordenadas ingresadas exceden los límites geográficos válidos para Colombia.',
            datosAfectados: ['latitud', 'longitud']
        },
        {
            id: 'REG-2024-002',
            tipo: 'informacion_especie',
            problema: 'Datos de especie incompletos',
            fecha: '2024-03-14',
            brigada: 'Sur',
            severidad: 'medio',
            descripcion: 'Falta información sobre la familia y género de la especie identificada.',
            datosAfectados: ['familia', 'genero']
        },
        {
            id: 'REG-2024-003',
            tipo: 'formato',
            problema: 'Formato de fecha inconsistente',
            fecha: '2024-03-13',
            brigada: 'Este',
            severidad: 'bajo',
            descripcion: 'La fecha está en formato incorrecto, debe ser DD/MM/AAAA.',
            datosAfectados: ['fecha_muestreo']
        },
        {
            id: 'REG-2024-004',
            tipo: 'mediciones',
            problema: 'Mediciones atípicas en diámetro',
            fecha: '2024-03-12',
            brigada: 'Oeste',
            severidad: 'medio',
            descripcion: 'El diámetro registrado es significativamente mayor que el promedio de la especie.',
            datosAfectados: ['diametro1', 'diametro2']
        },
        {
            id: 'REG-2024-005',
            tipo: 'geolocalizacion',
            problema: 'Coordenadas duplicadas',
            fecha: '2024-03-11',
            brigada: 'Norte',
            severidad: 'critico',
            descripcion: 'Las coordenadas coinciden exactamente con otro registro existente.',
            datosAfectados: ['latitud', 'longitud']
        }
    ];
    
    /**
     * Configuración de métricas del dashboard de calidad
     * @type {Object}
     */
    const metricasDashboard = {
        completitud: 87,
        consistencia: 92,
        incidencias: 45,
        validados: 1248
    };
    
    /**
     * Filtro activo actual para los registros problemáticos
     * @type {string}
     */
    let filtroActivo = 'todos';
    
    // =============================================
    // FUNCIONES DE INICIALIZACIÓN
    // =============================================
    
    /**
     * Inicializa todos los componentes de la página de supervisión
     * Se ejecuta cuando el DOM está completamente cargado
     * @returns {void}
     */
    function inicializarPagina() {
        configurarFechas();
        cargarDashboard();
        cargarRegistrosProblemas();
        configurarEventListeners();
        actualizarEstadisticasCorreccion();
        console.log('Sistema de supervisión de datos inicializado correctamente');
    }
    
    /**
     * Configura las fechas en los formularios con valores por defecto
     * Establece fechas actuales y rangos predeterminados para reportes
     * @returns {void}
     */
    function configurarFechas() {
        const hoy = new Date();
        const fechaFormateada = hoy.toISOString().split('T')[0];
        
        // Fecha de aplicación por defecto (hoy)
        if (fechaAplicacionInput) {
            fechaAplicacionInput.value = fechaFormateada;
        }
        
        // Fechas para reportes (últimos 7 días por defecto)
        if (fechaInicioInput && fechaFinInput) {
            const hace7Dias = new Date();
            hace7Dias.setDate(hoy.getDate() - 7);
            fechaInicioInput.value = hace7Dias.toISOString().split('T')[0];
            fechaFinInput.value = fechaFormateada;
        }
    }
    
    // =============================================
    // FUNCIONES DEL DASHBOARD DE CALIDAD
    // =============================================
    
    /**
     * Carga y actualiza las métricas del dashboard de calidad
     * Actualiza los valores visuales de las tarjetas de métricas
     * @returns {void}
     */
    function cargarDashboard() {
        // Actualizar valores en las tarjetas de métricas
        document.querySelectorAll('.metrica-valor').forEach((elemento, index) => {
            const valores = Object.values(metricasDashboard);
            if (valores[index] !== undefined) {
                elemento.textContent = index === 3 ? 
                    valores[index].toLocaleString() : // Formato con separadores de miles para "validados"
                    `${valores[index]}%`; // Porcentaje para las primeras tres métricas
            }
        });
        
        console.log('Dashboard de calidad actualizado');
    }
    
    /**
     * Actualiza las métricas del dashboard en tiempo real
     * @param {Object} nuevasMetricas - Nuevos valores para las métricas
     * @returns {void}
     */
    function actualizarMetricasDashboard(nuevasMetricas) {
        Object.assign(metricasDashboard, nuevasMetricas);
        cargarDashboard();
    }
    
    // =============================================
    // FUNCIONES DE REGISTROS PROBLEMÁTICOS
    // =============================================
    
    /**
     * Carga y renderiza los registros problemáticos aplicando filtros
     * @param {string} filtro - Tipo de filtro a aplicar ('todos', 'formato', 'incompletos', etc.)
     * @returns {void}
     */
    function cargarRegistrosProblemas(filtro = 'todos') {
        let registrosFiltrados = [...registrosProblemas];
        
        // Aplicar filtro si no es "todos"
        if (filtro !== 'todos') {
            registrosFiltrados = registrosProblemas.filter(registro => {
                switch(filtro) {
                    case 'formato':
                        return registro.tipo === 'formato';
                    case 'incompletos':
                        return registro.problema.toLowerCase().includes('incompletos');
                    case 'inconsistencias':
                        return registro.tipo === 'informacion_especie' || 
                               registro.problema.toLowerCase().includes('inconsistencias');
                    case 'rango':
                        return registro.problema.toLowerCase().includes('rango') ||
                               registro.problema.toLowerCase().includes('fuera');
                    default:
                        return true;
                }
            });
        }
        
        renderizarRegistrosProblemas(registrosFiltrados);
    }
    
    /**
     * Renderiza los registros problemáticos en el contenedor
     * Crea elementos DOM dinámicamente para cada registro problemático
     * @param {Array} registros - Array de registros a renderizar
     * @returns {void}
     */
    function renderizarRegistrosProblemas(registros) {
        // Limpiar contenedor
        registrosContainer.innerHTML = '';
        
        if (registros.length === 0) {
            registrosContainer.innerHTML = `
                <div class="sin-registros" style="text-align: center; padding: 40px; color: #666;">
                    <p style="font-size: 1.1em; margin-bottom: 10px;">No se encontraron registros problemáticos</p>
                    <p style="font-size: 0.9em;">Los filtros aplicados no coinciden con ningún registro.</p>
                </div>
            `;
            return;
        }
        
        // Renderizar cada registro
        registros.forEach(registro => {
            const registroElement = document.createElement('div');
            registroElement.className = 'registro-item';
            registroElement.innerHTML = `
                <div class="registro-header">
                    <span class="registro-id">#${registro.id}</span>
                    <span class="registro-estado ${registro.severidad}">${
                        registro.severidad === 'critico' ? 'Crítico' : 
                        registro.severidad === 'medio' ? 'Medio' : 'Bajo'
                    }</span>
                </div>
                <div class="registro-desc">
                    <strong>Problema:</strong> ${registro.problema}
                </div>
                <div class="registro-detalle">
                    <span><strong>Fecha:</strong> ${formatearFecha(registro.fecha)}</span>
                    <span><strong>Brigada:</strong> ${registro.brigada}</span>
                    <span><strong>Tipo:</strong> ${
                        registro.tipo === 'geolocalizacion' ? 'Geolocalización' :
                        registro.tipo === 'informacion_especie' ? 'Información de especie' :
                        registro.tipo === 'formato' ? 'Formato' : 'Mediciones'
                    }</span>
                </div>
                <div class="registro-actions">
                    <button class="btn-corregir" data-id="${registro.id}">Corregir</button>
                    <button class="btn-ignorar" data-id="${registro.id}">Ignorar</button>
                    <button class="btn-detalles" data-id="${registro.id}">Ver detalles</button>
                </div>
            `;
            
            registrosContainer.appendChild(registroElement);
        });
        
        // Re-configurar event listeners para los botones de acción
        configurarBotonesRegistros();
    }
    
    /**
     * Formatea una fecha de YYYY-MM-DD a DD/MM/YYYY
     * @param {string} fechaISO - Fecha en formato ISO (YYYY-MM-DD)
     * @returns {string} Fecha formateada en formato DD/MM/YYYY
     */
    function formatearFecha(fechaISO) {
        const [anio, mes, dia] = fechaISO.split('-');
        return `${dia}/${mes}/${anio}`;
    }
    
    /**
     * Aplica un filtro a los registros problemáticos
     * @param {string} tipoFiltro - Tipo de filtro a aplicar
     * @returns {void}
     */
    function aplicarFiltro(tipoFiltro) {
        filtroActivo = tipoFiltro;
        cargarRegistrosProblemas(tipoFiltro);
    }
    
    // =============================================
    // FUNCIONES DE CORRECCIÓN MASIVA
    // =============================================
    
    /**
     * Actualiza las estadísticas de corrección masiva
     * Calcula y muestra el número de registros afectados por el patrón seleccionado
     * @returns {void}
     */
    function actualizarEstadisticasCorreccion() {
        // Simular cálculo de registros afectados basado en el patrón seleccionado
        const patron = patronErrorSelect.value;
        let registrosAfectados = 0;
        
        if (patron) {
            registrosAfectados = registrosProblemas.filter(registro => {
                switch(patron) {
                    case 'formato_fecha':
                        return registro.tipo === 'formato';
                    case 'coordenadas':
                        return registro.tipo === 'geolocalizacion';
                    case 'especies':
                        return registro.tipo === 'informacion_especie';
                    case 'mediciones':
                        return registro.tipo === 'mediciones';
                    default:
                        return false;
                }
            }).length;
        }
        
        registrosAfectadosInput.value = registrosAfectados;
    }
    
    /**
     * Previsualiza los cambios que se aplicarán en la corrección masiva
     * Muestra un modal con los detalles de la corrección antes de aplicarla
     * @returns {void}
     */
    function previsualizarCorreccion() {
        const patron = patronErrorSelect.value;
        const correccion = correccionTextarea.value.trim();
        
        if (!patron) {
            alert('Por favor, seleccione un patrón de error.');
            return;
        }
        
        if (!correccion) {
            alert('Por favor, describa la corrección a aplicar.');
            return;
        }
        
        const registrosAfectados = parseInt(registrosAfectadosInput.value);
        
        if (registrosAfectados === 0) {
            alert('No hay registros afectados por el patrón seleccionado.');
            return;
        }
        
        // Mostrar modal de previsualización
        mostrarModalPrevisualizacion({
            patron,
            correccion,
            registrosAfectados,
            fechaAplicacion: fechaAplicacionInput.value
        });
    }
    
    /**
     * Aplica la corrección masiva a los registros afectados
     * Realiza validaciones y confirma antes de aplicar cambios masivos
     * @returns {void}
     */
    function aplicarCorreccionMasiva() {
        const patron = patronErrorSelect.value;
        const correccion = correccionTextarea.value.trim();
        const fechaAplicacion = fechaAplicacionInput.value;
        
        if (!patron || !correccion) {
            alert('Por favor, complete todos los campos requeridos.');
            return;
        }
        
        const registrosAfectados = parseInt(registrosAfectadosInput.value);
        
        if (registrosAfectados === 0) {
            alert('No hay registros para corregir con el patrón seleccionado.');
            return;
        }
        
        // Confirmación antes de aplicar cambios
        const confirmacion = confirm(
            `¿Está seguro de aplicar esta corrección masiva?\n\n` +
            `• Patrón: ${patron}\n` +
            `• Registros afectados: ${registrosAfectados}\n` +
            `• Fecha de aplicación: ${formatearFecha(fechaAplicacion)}\n\n` +
            `Esta acción no se puede deshacer.`
        );
        
        if (!confirmacion) return;
        
        // Simular aplicación de corrección
        simularAplicacionCorreccion({
            patron,
            correccion,
            registrosAfectados,
            fechaAplicacion
        });
    }
    
    /**
     * Simula la aplicación de una corrección masiva
     * En producción, esta función enviaría una petición al servidor
     * @param {Object} datosCorreccion - Datos de la corrección a aplicar
     * @returns {void}
     */
    function simularAplicacionCorreccion(datosCorreccion) {
        // Mostrar estado de carga
        const btnOriginal = btnAplicarCorreccion.innerHTML;
        btnAplicarCorreccion.innerHTML = 'Aplicando...';
        btnAplicarCorreccion.disabled = true;
        
        // Simular procesamiento
        setTimeout(() => {
            // Actualizar métricas del dashboard
            const nuevasIncidencias = Math.max(0, metricasDashboard.incidencias - datosCorreccion.registrosAfectados);
            const nuevosValidados = metricasDashboard.validados + datosCorreccion.registrosAfectados;
            
            actualizarMetricasDashboard({
                incidencias: nuevasIncidencias,
                validados: nuevosValidados,
                completitud: metricasDashboard.completitud + 2, // Mejora simbólica
                consistencia: metricasDashboard.consistencia + 1
            });
            
            // Limpiar formulario
            patronErrorSelect.value = '';
            correccionTextarea.value = '';
            fechaAplicacionInput.value = new Date().toISOString().split('T')[0];
            actualizarEstadisticasCorreccion();
            
            // Recargar registros problemáticos
            cargarRegistrosProblemas(filtroActivo);
            
            // Restaurar botón
            btnAplicarCorreccion.innerHTML = btnOriginal;
            btnAplicarCorreccion.disabled = false;
            
            // Mostrar mensaje de éxito
            alert(`✅ Corrección masiva aplicada exitosamente\n\n` +
                  `• Registros corregidos: ${datosCorreccion.registrosAfectados}\n` +
                  `• Patrón: ${datosCorreccion.patron}\n` +
                  `• Fecha: ${formatearFecha(datosCorreccion.fechaAplicacion)}`);
            
            console.log('Corrección masiva aplicada:', datosCorreccion);
            
        }, 2000);
    }
    
    // =============================================
    // FUNCIONES DE REPORTES E INCIDENCIAS
    // =============================================
    
    /**
     * Genera un reporte de incidencias basado en los filtros seleccionados
     * @returns {void}
     */
    function generarReporte() {
        const tipoReporte = tipoReporteSelect.value;
        const fechaInicio = fechaInicioInput.value;
        const fechaFin = fechaFinInput.value;
        const formato = Array.from(formatosExportacion).find(radio => radio.checked)?.value;
        
        // Validaciones básicas
        if (!fechaInicio || !fechaFin) {
            alert('Por favor, seleccione el rango de fechas para el reporte.');
            return;
        }
        
        if (new Date(fechaInicio) > new Date(fechaFin)) {
            alert('La fecha de inicio no puede ser mayor que la fecha fin.');
            return;
        }
        
        // Simular generación de reporte
        simularGeneracionReporte({
            tipo: tipoReporte,
            fechaInicio,
            fechaFin,
            formato
        });
    }
    
    /**
     * Simula la generación de un reporte
     * @param {Object} configReporte - Configuración del reporte
     * @returns {void}
     */
    function simularGeneracionReporte(configReporte) {
        // Mostrar estado de carga
        const btnOriginal = btnGenerarReporte.innerHTML;
        btnGenerarReporte.innerHTML = 'Generando...';
        btnGenerarReporte.disabled = true;
        
        // Calcular estadísticas del reporte
        const registrosPeriodo = registrosProblemas.filter(registro => {
            const fechaRegistro = new Date(registro.fecha);
            const fechaInicio = new Date(configReporte.fechaInicio);
            const fechaFin = new Date(configReporte.fechaFin);
            return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
        });
        
        setTimeout(() => {
            // Restaurar botón
            btnGenerarReporte.innerHTML = btnOriginal;
            btnGenerarReporte.disabled = false;
            
            // Mostrar resumen del reporte
            const severidades = {
                critico: registrosPeriodo.filter(r => r.severidad === 'critico').length,
                medio: registrosPeriodo.filter(r => r.severidad === 'medio').length,
                bajo: registrosPeriodo.filter(r => r.severidad === 'bajo').length
            };
            
            alert(`📊 Reporte generado exitosamente\n\n` +
                  `• Período: ${formatearFecha(configReporte.fechaInicio)} - ${formatearFecha(configReporte.fechaFin)}\n` +
                  `• Tipo: ${configReporte.tipo}\n` +
                  `• Formato: ${configReporte.formato.toUpperCase()}\n` +
                  `• Total de incidencias: ${registrosPeriodo.length}\n` +
                  `• Críticas: ${severidades.critico} | Medias: ${severidades.medio} | Bajas: ${severidades.bajo}\n\n` +
                  `El reporte está listo para su descarga.`);
            
            console.log('Reporte generado:', configReporte, {
                totalIncidencias: registrosPeriodo.length,
                severidades,
                registros: registrosPeriodo
            });
            
        }, 1500);
    }
    
    /**
     * Exporta el reporte al formato seleccionado
     * @returns {void}
     */
    function exportarReporte() {
        const formato = Array.from(formatosExportacion).find(radio => radio.checked)?.value;
        
        // Simular exportación
        setTimeout(() => {
            alert(`📤 Reporte exportado exitosamente en formato ${formato.toUpperCase()}\n\n` +
                  `El archivo se ha descargado a su dispositivo.`);
            
            console.log('Reporte exportado en formato:', formato);
        }, 1000);
    }
    
    // =============================================
    // FUNCIONES DE DATOS CORRUPTOS
    // =============================================
    
    /**
     * Maneja el archivado de registros corruptos
     * @returns {void}
     */
    function archivarRegistrosCorruptos() {
        const confirmacion = confirm(
            '¿Está seguro de archivar los 12 registros corruptos?\n\n' +
            'Los registros archivados se moverán al historial de auditoría y ya no estarán disponibles para corrección.'
        );
        
        if (!confirmacion) return;
        
        // Simular archivado
        setTimeout(() => {
            alert('✅ 12 registros corruptos archivados exitosamente\n\n' +
                  'Los registros han sido movidos al archivo de auditoría.');
            
            // Actualizar métricas
            actualizarMetricasDashboard({
                incidencias: Math.max(0, metricasDashboard.incidencias - 12)
            });
            
            console.log('Registros corruptos archivados');
        }, 1000);
    }
    
    /**
     * Maneja la eliminación permanente de registros corruptos
     * @returns {void}
     */
    function eliminarRegistrosCorruptos() {
        const confirmacion = confirm(
            '⚠️ ELIMINACIÓN PERMANENTE ⚠️\n\n' +
            '¿Está seguro de eliminar permanentemente los 12 registros corruptos?\n\n' +
            'Esta acción NO se puede deshacer y los datos se perderán definitivamente.'
        );
        
        if (!confirmacion) return;
        
        const segundaConfirmacion = confirm(
            'CONFIRMACIÓN FINAL\n\n' +
            '¿Realmente desea eliminar permanentemente estos registros?\n' +
            'Esta operación es irreversible.'
        );
        
        if (!segundaConfirmacion) return;
        
        // Simular eliminación
        setTimeout(() => {
            alert('🗑️ 12 registros corruptos eliminados permanentemente\n\n' +
                  'Los datos han sido eliminados de la base de datos.');
            
            // Actualizar métricas
            actualizarMetricasDashboard({
                incidencias: Math.max(0, metricasDashboard.incidencias - 12)
            });
            
            console.log('Registros corruptos eliminados permanentemente');
        }, 1000);
    }
    
    /**
     * Genera un reporte de auditoría para registros corruptos
     * @returns {void}
     */
    function generarReporteAuditoria() {
        // Simular generación de reporte de auditoría
        setTimeout(() => {
            alert('📋 Reporte de auditoría generado exitosamente\n\n' +
                  'El reporte incluye:\n' +
                  '• Listado completo de registros corruptos\n' +
                  '• Causas identificadas de corrupción\n' +
                  '• Recomendaciones para prevención\n' +
                  '• Metadatos de auditoría\n\n' +
                  'El reporte se ha guardado en el sistema.');
            
            console.log('Reporte de auditoría generado para registros corruptos');
        }, 1500);
    }
    
    // =============================================
    // FUNCIONES DE MANEJO DE EVENTOS
    // =============================================
    
    /**
     * Configura los event listeners para los botones de registros
     * @returns {void}
     */
    function configurarBotonesRegistros() {
        const btnCorregirList = document.querySelectorAll('.btn-corregir');
        const btnIgnorarList = document.querySelectorAll('.btn-ignorar');
        const btnDetallesList = document.querySelectorAll('.btn-detalles');
        
        btnCorregirList.forEach(btn => {
            btn.addEventListener('click', function() {
                const registroId = this.getAttribute('data-id');
                manejarCorreccionIndividual(registroId);
            });
        });
        
        btnIgnorarList.forEach(btn => {
            btn.addEventListener('click', function() {
                const registroId = this.getAttribute('data-id');
                manejarIgnorarRegistro(registroId);
            });
        });
        
        btnDetallesList.forEach(btn => {
            btn.addEventListener('click', function() {
                const registroId = this.getAttribute('data-id');
                mostrarDetallesRegistro(registroId);
            });
        });
    }
    
    /**
     * Maneja la corrección individual de un registro
     * @param {string} registroId - ID del registro a corregir
     * @returns {void}
     */
    function manejarCorreccionIndividual(registroId) {
        const registro = registrosProblemas.find(r => r.id === registroId);
        
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        
        // Simular apertura de editor de corrección
        alert(`🔧 Abriendo editor de corrección para: ${registroId}\n\n` +
              `Problema: ${registro.problema}\n` +
              `Descripción: ${registro.descripcion}\n\n` +
              `En una implementación real, esto abriría un formulario de edición.`);
        
        console.log('Editando registro individual:', registro);
    }
    
    /**
     * Maneja el ignorado temporal de un registro
     * @param {string} registroId - ID del registro a ignorar
     * @returns {void}
     */
    function manejarIgnorarRegistro(registroId) {
        const registro = registrosProblemas.find(r => r.id === registroId);
        
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        
        const confirmacion = confirm(
            `¿Ignorar temporalmente este registro?\n\n` +
            `ID: ${registro.id}\n` +
            `Problema: ${registro.problema}\n\n` +
            `El registro se marcará como "ignorado" y no aparecerá en los reportes hasta su revisión manual.`
        );
        
        if (!confirmacion) return;
        
        // Simular ignorado
        setTimeout(() => {
            alert(`⏸️ Registro ${registroId} ignorado temporalmente\n\n` +
                  `Puede revisarlo más tarde desde la sección de "Registros ignorados".`);
            
            console.log('Registro ignorado:', registroId);
        }, 500);
    }
    
    /**
     * Muestra los detalles completos de un registro en un modal
     * @param {string} registroId - ID del registro a visualizar
     * @returns {void}
     */
    function mostrarDetallesRegistro(registroId) {
        const registro = registrosProblemas.find(r => r.id === registroId);
        
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        
        // Crear y mostrar modal de detalles
        const modal = document.createElement('div');
        modal.className = 'modal-detalles';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const colorSeveridad = registro.severidad === 'critico' ? '#F44336' : 
                              registro.severidad === 'medio' ? '#FF9800' : '#4CAF50';
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid ${colorSeveridad}; padding-bottom: 10px;">
                    <h3 style="margin: 0; color: ${colorSeveridad};">Detalles del Registro Problemático</h3>
                    <button class="btn-cerrar-modal" style="background: none; border: none; font-size: 1.5em; cursor: pointer; color: #666;">×</button>
                </div>
                
                <div style="display: grid; gap: 15px; margin-bottom: 25px;">
                    <div><strong>ID:</strong> ${registro.id}</div>
                    <div><strong>Problema:</strong> ${registro.problema}</div>
                    <div><strong>Severidad:</strong> <span style="color: ${colorSeveridad}; font-weight: bold;">${
                        registro.severidad === 'critico' ? 'Crítico' : 
                        registro.severidad === 'medio' ? 'Medio' : 'Bajo'
                    }</span></div>
                    <div><strong>Fecha:</strong> ${formatearFecha(registro.fecha)}</div>
                    <div><strong>Brigada:</strong> ${registro.brigada}</div>
                    <div><strong>Tipo:</strong> ${
                        registro.tipo === 'geolocalizacion' ? 'Geolocalización' :
                        registro.tipo === 'informacion_especie' ? 'Información de especie' :
                        registro.tipo === 'formato' ? 'Formato' : 'Mediciones'
                    }</div>
                    <div><strong>Descripción detallada:</strong><br>${registro.descripcion}</div>
                    <div><strong>Datos afectados:</strong> ${registro.datosAfectados.join(', ')}</div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn-cerrar" style="padding: 8px 16px; background: #757575; color: white; border: none; border-radius: 4px; cursor: pointer;">Cerrar</button>
                    <button class="btn-corregir-modal" style="padding: 8px 16px; background: #2E7D32; color: white; border: none; border-radius: 4px; cursor: pointer;">Corregir</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar event listeners del modal
        const btnCerrar = modal.querySelector('.btn-cerrar');
        const btnCerrarModal = modal.querySelector('.btn-cerrar-modal');
        const btnCorregirModal = modal.querySelector('.btn-corregir-modal');
        
        const cerrarModal = () => {
            document.body.removeChild(modal);
        };
        
        btnCerrar.addEventListener('click', cerrarModal);
        btnCerrarModal.addEventListener('click', cerrarModal);
        btnCorregirModal.addEventListener('click', () => {
            cerrarModal();
            manejarCorreccionIndividual(registro.id);
        });
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }
    
    /**
     * Muestra un modal de previsualización para corrección masiva
     * @param {Object} datosPrevisualizacion - Datos para la previsualización
     * @returns {void}
     */
    function mostrarModalPrevisualizacion(datosPrevisualizacion) {
        const modal = document.createElement('div');
        modal.className = 'modal-previsualizacion';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
                    <h3 style="margin: 0; color: #2196F3;">Previsualización de Corrección</h3>
                    <button class="btn-cerrar-modal" style="background: none; border: none; font-size: 1.5em; cursor: pointer; color: #666;">×</button>
                </div>
                
                <div style="display: grid; gap: 12px; margin-bottom: 25px;">
                    <div><strong>Patrón de error:</strong> ${datosPrevisualizacion.patron}</div>
                    <div><strong>Corrección a aplicar:</strong><br>${datosPrevisualizacion.correccion}</div>
                    <div><strong>Registros afectados:</strong> ${datosPrevisualizacion.registrosAfectados}</div>
                    <div><strong>Fecha de aplicación:</strong> ${formatearFecha(datosPrevisualizacion.fechaAplicacion)}</div>
                </div>
                
                <div style="background: #E3F2FD; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <strong>⚠️ Advertencia:</strong> Esta acción afectará ${datosPrevisualizacion.registrosAfectados} registros y no se puede deshacer fácilmente.
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn-cancelar" style="padding: 8px 16px; background: #757575; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                    <button class="btn-confirmar" style="padding: 8px 16px; background: #2E7D32; color: white; border: none; border-radius: 4px; cursor: pointer;">Confirmar y Aplicar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar event listeners
        const btnCerrar = modal.querySelector('.btn-cerrar-modal');
        const btnCancelar = modal.querySelector('.btn-cancelar');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        const cerrarModal = () => {
            document.body.removeChild(modal);
        };
        
        btnCerrar.addEventListener('click', cerrarModal);
        btnCancelar.addEventListener('click', cerrarModal);
        btnConfirmar.addEventListener('click', () => {
            cerrarModal();
            aplicarCorreccionMasiva();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }
    
    /**
     * Configura todos los event listeners de la página
     * @returns {void}
     */
    function configurarEventListeners() {
        // Filtros rápidos
        filtroBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filtroBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                aplicarFiltro(this.textContent.toLowerCase());
            });
        });
        
        // Búsqueda global
        if (searchBox) {
            searchBox.addEventListener('input', debounce(() => {
                console.log('Búsqueda:', searchBox.value);
                // En una implementación real, aquí se filtrarían los registros
            }, 300));
        }
        
        // Corrección masiva
        if (patronErrorSelect) {
            patronErrorSelect.addEventListener('change', actualizarEstadisticasCorreccion);
        }
        
        if (btnPrevisualizar) {
            btnPrevisualizar.addEventListener('click', previsualizarCorreccion);
        }
        
        if (btnAplicarCorreccion) {
            btnAplicarCorreccion.addEventListener('click', aplicarCorreccionMasiva);
        }
        
        // Reportes
        if (btnGenerarReporte) {
            btnGenerarReporte.addEventListener('click', generarReporte);
        }
        
        if (btnExportar) {
            btnExportar.addEventListener('click', exportarReporte);
        }
        
        // Datos corruptos
        if (btnArchivar) {
            btnArchivar.addEventListener('click', archivarRegistrosCorruptos);
        }
        
        if (btnEliminar) {
            btnEliminar.addEventListener('click', eliminarRegistrosCorruptos);
        }
        
        if (btnReporteAuditoria) {
            btnReporteAuditoria.addEventListener('click', generarReporteAuditoria);
        }
        
        // Configurar botones de registros
        configurarBotonesRegistros();
    }
    
    // =============================================
    // FUNCIONES UTILITARIAS
    // =============================================
    
    /**
     * Función debounce para optimizar búsquedas
     * Evita múltiples ejecuciones rápidas retrasando la ejecución hasta que pase un tiempo sin nuevas llamadas
     * @param {Function} func - Función a la que aplicar debounce
     * @param {number} wait - Tiempo de espera en milisegundos antes de ejecutar la función
     * @returns {Function} Nueva función con comportamiento debounce
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // =============================================
    // INICIALIZACIÓN
    // =============================================
    
    // Iniciar la aplicación
    inicializarPagina();
}