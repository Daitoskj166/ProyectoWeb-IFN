/**
 * SISTEMA DE GESTIÓN DE REGISTROS BIOLÓGICOS
 * 
 * Este módulo JavaScript implementa un sistema completo para la gestión, 
 * visualización y filtrado de registros de muestras biológicas (árboles y suelos).
 * Incluye funcionalidades de búsqueda, paginación, estadísticas y modales de detalle.
 * 
 * @version 1.0
 * @author Sistema de Gestión Ambiental
 */

// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // VARIABLES GLOBALES Y CONFIGURACIÓN
    // =============================================
    
    /**
     * Referencias a los elementos principales del DOM utilizados en la aplicación
     * @type {HTMLElement}
     */
    const searchBox = document.querySelector('.search-box input'); // Campo de búsqueda principal
    const filtroTipo = document.getElementById('filtro-tipo');     // Selector de filtro por tipo (árbol/suelo)
    const filtroFecha = document.getElementById('filtro-fecha');   // Selector de filtro por fecha
    const btnFiltrar = document.querySelector('.btn-filtrar');     // Botón para aplicar filtros
    const tablaRegistros = document.querySelector('.tabla-registros tbody'); // Cuerpo de la tabla de registros
    const estadisticasNumeros = document.querySelectorAll('.estadistica-numero'); // Elementos para mostrar estadísticas
    const controlesPaginacion = document.querySelector('.controles-paginacion');  // Contenedor de controles de paginación
    const infoPaginacion = document.querySelector('.info-paginacion');            // Información de paginación
    const numerosPaginacion = document.querySelector('.numeros-paginacion');      // Números de página
    
    /**
     * Configuración de paginación para controlar la visualización de registros
     * @type {Object}
     * @property {number} registrosPorPagina - Número de registros a mostrar por página (valor por defecto: 5)
     * @property {number} paginaActual - Página actualmente visible (valor por defecto: 1)
     * @property {number} totalRegistros - Número total de registros después de aplicar filtros
     * @property {number} totalPaginas - Número total de páginas calculado
     */
    const configPaginacion = {
        registrosPorPagina: 5,
        paginaActual: 1,
        totalRegistros: 0,
        totalPaginas: 0
    };
    
    /**
     * Array de registros de ejemplo que simula una base de datos
     * En una aplicación real, estos datos vendrían de una API o base de datos
     * @type {Array<Object>}
     * @property {string} id - Identificador único del registro (ej: 'ARB-2024-001')
     * @property {string} tipo - Tipo de registro ('arbol' o 'suelo')
     * @property {string} especie - Descripción de la especie o muestra
     * @property {string} ubicacion - Ubicación geográfica del registro
     * @property {string} fecha - Fecha del registro en formato YYYY-MM-DD
     * @property {string} estado - Estado del registro ('completo', 'pendiente', 'proceso')
     */
    let registros = [
        {
            id: 'ARB-2024-001',
            tipo: 'arbol',
            especie: 'Quercus humboldtii - Roble',
            ubicacion: 'Conglomerado N45, Parcela 12',
            fecha: '2024-03-15',
            estado: 'completo'
        },
        {
            id: 'ARB-2024-002',
            tipo: 'arbol',
            especie: 'Ceroxylon quindiuense - Palma de cera',
            ubicacion: 'Conglomerado S22, Parcela 08',
            fecha: '2024-03-18',
            estado: 'pendiente'
        },
        {
            id: 'SUE-2024-001',
            tipo: 'suelo',
            especie: 'Muestra compuesta - 4 puntos',
            ubicacion: 'Conglomerado N45, Puntos 1-4',
            fecha: '2024-03-16',
            estado: 'completo'
        },
        {
            id: 'SUE-2024-002',
            tipo: 'suelo',
            especie: 'Muestra superficial - Análisis pH',
            ubicacion: 'Conglomerado E33, Punto central',
            fecha: '2024-03-20',
            estado: 'proceso'
        },
        {
            id: 'ARB-2024-003',
            tipo: 'arbol',
            especie: 'Anacardium excelsum - Caracolí',
            ubicacion: 'Conglomerado W18, Parcela 15',
            fecha: '2024-03-22',
            estado: 'completo'
        },
        {
            id: 'ARB-2024-004',
            tipo: 'arbol',
            especie: 'Pinus patula - Pino',
            ubicacion: 'Conglomerado N47, Parcela 05',
            fecha: '2024-03-25',
            estado: 'pendiente'
        },
        {
            id: 'SUE-2024-003',
            tipo: 'suelo',
            especie: 'Muestra profunda - Análisis nutrientes',
            ubicacion: 'Conglomerado S25, Punto 2',
            fecha: '2024-03-24',
            estado: 'completo'
        }
    ];
    
    // =============================================
    // FUNCIONES DE INICIALIZACIÓN
    // =============================================
    
    /**
     * INICIALIZADOR PRINCIPAL - Coordina la inicialización de todos los componentes
     * Se ejecuta cuando el DOM está completamente cargado y prepara la aplicación para su uso
     * @returns {void}
     */
    function inicializarPagina() {
        configurarFechaFiltro();
        cargarRegistros();
        configurarEventListeners();
        actualizarEstadisticas();
        console.log('Página de registros inicializada correctamente');
    }
    
    /**
     * Configura el filtro de fecha con la fecha actual como valor predeterminado
     * Permite a los usuarios filtrar rápidamente por la fecha actual sin tener que seleccionarla manualmente
     * @returns {void}
     */
    function configurarFechaFiltro() {
        const hoy = new Date();
        const fechaFormateada = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        filtroFecha.value = fechaFormateada;
    }
    
    // =============================================
    // FUNCIONES DE MANEJO DE DATOS
    // =============================================
    
    /**
     * FILTRA registros según múltiples criterios (texto, tipo y fecha)
     * Aplica filtros en cascada: primero por texto, luego por tipo, finalmente por fecha
     * @param {Array} registros - Array completo de registros a filtrar
     * @returns {Array} Nuevo array con los registros que cumplen todos los criterios de filtrado
     */
    function filtrarRegistros(registros) {
        let registrosFiltrados = [...registros]; // Crear copia para no mutar el array original
        const textoBusqueda = searchBox.value.toLowerCase().trim();
        const tipoSeleccionado = filtroTipo.value;
        const fechaSeleccionada = filtroFecha.value;
        
        // Filtro por texto de búsqueda (busca en ID, especie y ubicación)
        if (textoBusqueda) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.id.toLowerCase().includes(textoBusqueda) ||
                registro.especie.toLowerCase().includes(textoBusqueda) ||
                registro.ubicacion.toLowerCase().includes(textoBusqueda)
            );
        }
        
        // Filtro por tipo (árbol/suelo)
        if (tipoSeleccionado !== 'todos') {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.tipo === tipoSeleccionado
            );
        }
        
        // Filtro por fecha
        if (fechaSeleccionada) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.fecha === fechaSeleccionada
            );
        }
        
        return registrosFiltrados;
    }
    
    /**
     * ORDENA registros por fecha de manera descendente (más recientes primero)
     * Utiliza el objeto Date de JavaScript para una comparación precisa de fechas
     * @param {Array} registros - Array de registros a ordenar
     * @returns {Array} Registros ordenados cronológicamente (más reciente primero)
     */
    function ordenarRegistros(registros) {
        return registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    
    /**
     * CALCULA y devuelve los registros correspondientes a una página específica
     * Utiliza algoritmos de paginación estándar para dividir el array en páginas
     * @param {Array} registros - Array completo de registros
     * @param {number} pagina - Número de página solicitada (comienza en 1)
     * @param {number} registrosPorPagina - Cantidad de registros a mostrar por página
     * @returns {Array} Subconjunto de registros correspondiente a la página solicitada
     */
    function obtenerRegistrosPagina(registros, pagina, registrosPorPagina) {
        const inicio = (pagina - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        return registros.slice(inicio, fin);
    }
    
    // =============================================
    // FUNCIONES DE RENDERIZADO
    // =============================================
    
    /**
     * RENDERIZA los registros en la tabla HTML
     * Genera dinámicamente las filas de la tabla basándose en los datos proporcionados
     * Maneja el estado vacío mostrando un mensaje amigable al usuario
     * @param {Array} registros - Array de registros a mostrar en la tabla
     * @returns {void}
     */
    function renderizarRegistros(registros) {
        // Limpiar tabla actual antes de renderizar nuevos datos
        tablaRegistros.innerHTML = '';
        
        // Manejar estado cuando no hay registros que mostrar
        if (registros.length === 0) {
            tablaRegistros.innerHTML = `
                <tr>
                    <td colspan="7" class="sin-registros">
                        <div style="text-align: center; padding: 40px; color: #666;">
                            <p style="font-size: 1.2em; margin-bottom: 10px;">No se encontraron registros</p>
                            <p style="font-size: 0.9em;">Intente ajustar los filtros de búsqueda</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Renderizar cada registro como una fila en la tabla
        registros.forEach(registro => {
            const fila = document.createElement('tr');
            fila.className = `registro-${registro.tipo}`; // Clase CSS para estilizado por tipo
            
            // Determinar clase CSS y texto para el estado del registro
            let claseEstado = '';
            let textoEstado = '';
            
            switch(registro.estado) {
                case 'completo':
                    claseEstado = 'estado-completo';
                    textoEstado = 'Completo';
                    break;
                case 'pendiente':
                    claseEstado = 'estado-pendiente';
                    textoEstado = 'Pendiente';
                    break;
                case 'proceso':
                    claseEstado = 'estado-proceso';
                    textoEstado = 'En proceso';
                    break;
            }
            
            // Construir el HTML de la fila con los datos del registro
            fila.innerHTML = `
                <td>${registro.id}</td>
                <td>
                    <span class="badge-tipo tipo-${registro.tipo}">
                        ${registro.tipo === 'arbol' ? 'Árbol' : 'Suelo'}
                    </span>
                </td>
                <td>${registro.especie}</td>
                <td>${registro.ubicacion}</td>
                <td>${formatearFecha(registro.fecha)}</td>
                <td><span class="estado ${claseEstado}">${textoEstado}</span></td>
                <td>
                    <button class="btn-editar" data-id="${registro.id}">Editar</button>
                    <button class="btn-ver" data-id="${registro.id}">Ver</button>
                </td>
            `;
            
            tablaRegistros.appendChild(fila);
        });
        
        // Configurar los event listeners para los botones recién creados
        configurarBotonesAccion();
    }
    
    /**
     * FORMATEA una fecha de formato ISO (YYYY-MM-DD) a formato legible (DD/MM/YYYY)
     * Mejora la experiencia de usuario mostrando fechas en formato local
     * @param {string} fechaISO - Fecha en formato ISO 8601 (YYYY-MM-DD)
     * @returns {string} Fecha formateada en formato DD/MM/YYYY
     */
    function formatearFecha(fechaISO) {
        const [anio, mes, dia] = fechaISO.split('-');
        return `${dia}/${mes}/${anio}`;
    }
    
    /**
     * RENDERIZA los controles de paginación en la interfaz
     * Muestra información contextual y controles de navegación entre páginas
     * @param {number} paginaActual - Número de la página actualmente visible
     * @param {number} totalPaginas - Número total de páginas disponibles
     * @param {number} totalRegistros - Número total de registros después de filtros
     * @returns {void}
     */
    function renderizarPaginacion(paginaActual, totalPaginas, totalRegistros) {
        // Manejar estado cuando no hay registros
        if (totalRegistros === 0) {
            infoPaginacion.innerHTML = '<span>No hay registros para mostrar</span>';
            controlesPaginacion.style.display = 'none';
            return;
        }
        
        // Calcular el rango de registros mostrados actualmente
        const inicio = (paginaActual - 1) * configPaginacion.registrosPorPagina + 1;
        const fin = Math.min(paginaActual * configPaginacion.registrosPorPagina, totalRegistros);
        
        // Actualizar información textual de paginación
        infoPaginacion.innerHTML = `<span>Mostrando ${inicio}-${fin} de ${totalRegistros} registros</span>`;
        
        // Limpiar números de página anteriores
        numerosPaginacion.innerHTML = '';
        
        // Calcular rango de páginas a mostrar (máximo 5 páginas alrededor de la actual)
        const inicioPaginas = Math.max(1, paginaActual - 2);
        const finPaginas = Math.min(totalPaginas, paginaActual + 2);
        
        // Generar números de página clickeables
        for (let i = inicioPaginas; i <= finPaginas; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            if (i === paginaActual) {
                span.className = 'pagina-activa'; // Resaltar página actual
            }
            span.addEventListener('click', () => cambiarPagina(i));
            numerosPaginacion.appendChild(span);
        }
        
        // Mostrar controles de paginación
        controlesPaginacion.style.display = 'flex';
    }
    
    // =============================================
    // FUNCIONES DE ACTUALIZACIÓN DE ESTADO
    // =============================================
    
    /**
     * ACTUALIZA las estadísticas mostradas en las tarjetas de la interfaz
     * Calcula métricas en tiempo real basadas en los registros filtrados actualmente
     * @returns {void}
     */
    function actualizarEstadisticas() {
        const registrosFiltrados = filtrarRegistros(registros);
        
        // Calcular métricas principales
        const arbolesCount = registrosFiltrados.filter(r => r.tipo === 'arbol').length;
        const suelosCount = registrosFiltrados.filter(r => r.tipo === 'suelo').length;
        const completosCount = registrosFiltrados.filter(r => r.estado === 'completo').length;
        const procesoCount = registrosFiltrados.filter(r => r.estado === 'proceso' || r.estado === 'pendiente').length;
        
        // Actualizar los números en las tarjetas de estadísticas
        if (estadisticasNumeros.length >= 4) {
            estadisticasNumeros[0].textContent = arbolesCount;
            estadisticasNumeros[1].textContent = suelosCount;
            estadisticasNumeros[2].textContent = completosCount;
            estadisticasNumeros[3].textContent = procesoCount;
        }
    }
    
    /**
     * CARGA y muestra los registros aplicando filtros y paginación actuales
     * Función central que coordina el filtrado, ordenamiento y renderizado
     * @returns {void}
     */
    function cargarRegistros() {
        // Aplicar filtros a los registros
        const registrosFiltrados = filtrarRegistros(registros);
        const registrosOrdenados = ordenarRegistros(registrosFiltrados);
        
        // Actualizar configuración de paginación con los nuevos cálculos
        configPaginacion.totalRegistros = registrosOrdenados.length;
        configPaginacion.totalPaginas = Math.ceil(registrosOrdenados.length / configPaginacion.registrosPorPagina);
        
        // Obtener registros específicos para la página actual
        const registrosPagina = obtenerRegistrosPagina(
            registrosOrdenados, 
            configPaginacion.paginaActual, 
            configPaginacion.registrosPorPagina
        );
        
        // Renderizar todos los componentes con los nuevos datos
        renderizarRegistros(registrosPagina);
        renderizarPaginacion(
            configPaginacion.paginaActual, 
            configPaginacion.totalPaginas, 
            configPaginacion.totalRegistros
        );
        actualizarEstadisticas();
    }
    
    /**
     * CAMBIA a una página específica y actualiza la interfaz
     * Incluye scroll suave hacia la parte superior de la tabla para mejor UX
     * @param {number} pagina - Número de página a la que cambiar
     * @returns {void}
     */
    function cambiarPagina(pagina) {
        // Validar que la página esté dentro del rango permitido
        if (pagina < 1 || pagina > configPaginacion.totalPaginas) return;
        
        // Actualizar página actual y recargar registros
        configPaginacion.paginaActual = pagina;
        cargarRegistros();
        
        // Scroll suave hacia la parte superior de la tabla para mejor experiencia de usuario
        tablaRegistros.closest('.tabla-contenedor').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    // =============================================
    // FUNCIONES DE MANEJO DE EVENTOS
    // =============================================
    
    /**
     * CONFIGURA los event listeners para los botones de acción (Editar/Ver) en cada fila
     * Se ejecuta después de renderizar las filas para conectar los botones con sus funciones
     * @returns {void}
     */
    function configurarBotonesAccion() {
        const botonesEditar = document.querySelectorAll('.btn-editar');
        const botonesVer = document.querySelectorAll('.btn-ver');
        
        // Configurar botones de edición
        botonesEditar.forEach(boton => {
            boton.addEventListener('click', function() {
                const registroId = this.getAttribute('data-id');
                manejarEditarRegistro(registroId);
            });
        });
        
        // Configurar botones de visualización
        botonesVer.forEach(boton => {
            boton.addEventListener('click', function() {
                const registroId = this.getAttribute('data-id');
                manejarVerRegistro(registroId);
            });
        });
    }
    
    /**
     * MANEJA la acción de editar un registro específico
     * En una implementación real, redirigiría al formulario de edición correspondiente
     * @param {string} registroId - ID único del registro a editar
     * @returns {void}
     */
    function manejarEditarRegistro(registroId) {
        // Buscar el registro en el array de datos
        const registro = registros.find(r => r.id === registroId);
        
        // Validar que el registro existe
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        
        // Simular redirección a formulario de edición (en producción esto sería real)
        if (registro.tipo === 'arbol') {
            alert(`Redirigiendo a edición del árbol: ${registroId}\n\nEn una implementación real, esto abriría el formulario de edición.`);
            // window.location.href = `subirArbol.html?editar=${registroId}`;
        } else {
            alert(`Redirigiendo a edición de la muestra de suelo: ${registroId}\n\nEn una implementación real, esto abriría el formulario de edición.`);
            // window.location.href = `subirSuelo.html?editar=${registroId}`;
        }
        
        console.log(`Editando registro: ${registroId}`, registro);
    }
    
    /**
     * MANEJA la acción de ver los detalles completos de un registro
     * Abre un modal con información detallada del registro seleccionado
     * @param {string} registroId - ID único del registro a visualizar
     * @returns {void}
     */
    function manejarVerRegistro(registroId) {
        // Buscar el registro en el array de datos
        const registro = registros.find(r => r.id === registroId);
        
        // Validar que el registro existe
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        
        // Mostrar modal con detalles completos
        mostrarModalDetalles(registro);
        
        console.log(`Viendo detalles del registro: ${registroId}`, registro);
    }
    
    /**
     * MUESTRA un modal con los detalles completos de un registro
     * Crea dinámicamente un modal overlay con información estructurada del registro
     * @param {Object} registro - Objeto completo del registro con todos sus datos
     * @returns {void}
     */
    function mostrarModalDetalles(registro) {
        // Crear elemento modal principal
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
        
        // Determinar color del tema según tipo de registro
        const colorTipo = registro.tipo === 'arbol' ? '#2E7D32' : '#1565C0';
        const textoEstado = registro.estado === 'completo' ? 'Completo' : 
                           registro.estado === 'pendiente' ? 'Pendiente' : 'En proceso';
        
        // Construir contenido HTML del modal
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid ${colorTipo}; padding-bottom: 10px;">
                    <h3 style="margin: 0; color: ${colorTipo};">Detalles del Registro</h3>
                    <button class="btn-cerrar-modal" style="background: none; border: none; font-size: 1.5em; cursor: pointer; color: #666;">×</button>
                </div>
                
                <div style="display: grid; gap: 15px;">
                    <div>
                        <strong>ID:</strong> ${registro.id}
                    </div>
                    <div>
                        <strong>Tipo:</strong> 
                        <span class="badge-tipo tipo-${registro.tipo}" style="margin-left: 10px;">
                            ${registro.tipo === 'arbol' ? 'Árbol' : 'Suelo'}
                        </span>
                    </div>
                    <div>
                        <strong>${registro.tipo === 'arbol' ? 'Especie' : 'Descripción'}:</strong> 
                        ${registro.especie}
                    </div>
                    <div>
                        <strong>Ubicación:</strong> ${registro.ubicacion}
                    </div>
                    <div>
                        <strong>Fecha de registro:</strong> ${formatearFecha(registro.fecha)}
                    </div>
                    <div>
                        <strong>Estado:</strong> 
                        <span class="estado estado-${registro.estado}" style="margin-left: 10px;">
                            ${textoEstado}
                        </span>
                    </div>
                </div>
                
                <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn-cerrar" style="padding: 8px 16px; background: #757575; color: white; border: none; border-radius: 4px; cursor: pointer;">Cerrar</button>
                    <button class="btn-editar-modal" style="padding: 8px 16px; background: #FFC107; color: #212121; border: none; border-radius: 4px; cursor: pointer;">Editar</button>
                </div>
            </div>
        `;
        
        // Agregar modal al documento
        document.body.appendChild(modal);
        
        // Configurar event listeners para los controles del modal
        const btnCerrar = modal.querySelector('.btn-cerrar');
        const btnCerrarModal = modal.querySelector('.btn-cerrar-modal');
        const btnEditarModal = modal.querySelector('.btn-editar-modal');
        
        /**
         * Función para cerrar y eliminar el modal del DOM
         * @returns {void}
         */
        const cerrarModal = () => {
            document.body.removeChild(modal);
        };
        
        // Conectar eventos de cierre
        btnCerrar.addEventListener('click', cerrarModal);
        btnCerrarModal.addEventListener('click', cerrarModal);
        btnEditarModal.addEventListener('click', () => {
            cerrarModal();
            manejarEditarRegistro(registro.id); // Redirigir a edición después de cerrar
        });
        
        // Cerrar modal al hacer clic fuera del contenido (en el overlay)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }
    
    /**
     * CONFIGURA todos los event listeners globales de la aplicación
     * Incluye búsqueda, filtros, paginación y funcionalidades especiales
     * @returns {void}
     */
    function configurarEventListeners() {
        // Búsqueda en tiempo real con debounce para mejor rendimiento
        searchBox.addEventListener('input', debounce(() => {
            configPaginacion.paginaActual = 1; // Resetear a primera página al buscar
            cargarRegistros();
        }, 300));
        
        // Filtro por tipo - recargar registros cuando cambia
        filtroTipo.addEventListener('change', () => {
            configPaginacion.paginaActual = 1;
            cargarRegistros();
        });
        
        // Filtro por fecha - recargar registros cuando cambia
        filtroFecha.addEventListener('change', () => {
            configPaginacion.paginaActual = 1;
            cargarRegistros();
        });
        
        // Botón de filtrar - acción explícita del usuario
        btnFiltrar.addEventListener('click', () => {
            configPaginacion.paginaActual = 1;
            cargarRegistros();
        });
        
        // Configurar botones de paginación (anterior/siguiente)
        const btnAnterior = controlesPaginacion.querySelector('.btn-paginacion:first-child');
        const btnSiguiente = controlesPaginacion.querySelector('.btn-paginacion:last-child');
        
        btnAnterior.addEventListener('click', () => {
            cambiarPagina(configPaginacion.paginaActual - 1);
        });
        
        btnSiguiente.addEventListener('click', () => {
            cambiarPagina(configPaginacion.paginaActual + 1);
        });
        
        // FUNCIÓN EASTER EGG: Limpiar todos los filtros con doble clic en el título
        const titulo = document.querySelector('main h2');
        titulo.addEventListener('dblclick', () => {
            searchBox.value = '';
            filtroTipo.value = 'todos';
            configurarFechaFiltro();
            configPaginacion.paginaActual = 1;
            cargarRegistros();
            alert('Filtros limpiados');
        });
    }
    
    // =============================================
    // FUNCIONES UTILITARIAS
    // =============================================
    
    /**
     * FUNCIÓN DEBOUNDE - Optimiza funciones que se ejecutan frecuentemente
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
    // INICIALIZACIÓN DE LA APLICACIÓN
    // =============================================
    
    // Punto de entrada principal - inicia la aplicación cuando el DOM está listo
    inicializarPagina();
});