document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // VARIABLES GLOBALES Y CONFIGURACIÓN
    // =============================================
    
    // Referencias a elementos principales del DOM
    const searchBox = document.querySelector('.search-box input');
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroFecha = document.getElementById('filtro-fecha');
    const btnFiltrar = document.querySelector('.btn-filtrar');
    const tablaRegistros = document.querySelector('.tabla-registros tbody');
    const estadisticasNumeros = document.querySelectorAll('.estadistica-numero');
    const controlesPaginacion = document.querySelector('.controles-paginacion');
    const infoPaginacion = document.querySelector('.info-paginacion');
    const numerosPaginacion = document.querySelector('.numeros-paginacion');
    
    // Configuración de paginación
    const configPaginacion = {
        registrosPorPagina: 5,
        paginaActual: 1,
        totalRegistros: 0,
        totalPaginas: 0
    };
    
    // Datos de ejemplo (en una aplicación real, estos vendrían de una API)
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
     * Inicializa todos los componentes de la página
     * Se ejecuta cuando el DOM está completamente cargado
     */
    function inicializarPagina() {
        configurarFechaFiltro();
        cargarRegistros();
        configurarEventListeners();
        actualizarEstadisticas();
        console.log('Página de registros inicializada correctamente');
    }
    
    /**
     * Configura la fecha actual como valor por defecto en el filtro de fecha
     * Permite al usuario filtrar rápidamente por la fecha actual
     */
    function configurarFechaFiltro() {
        const hoy = new Date();
        const fechaFormateada = hoy.toISOString().split('T')[0];
        filtroFecha.value = fechaFormateada;
    }
    
    // =============================================
    // FUNCIONES DE MANEJO DE DATOS
    // =============================================
    
    /**
     * Filtra los registros según los criterios seleccionados
     * @param {Array} registros - Array de registros a filtrar
     * @returns {Array} Registros filtrados
     */
    function filtrarRegistros(registros) {
        let registrosFiltrados = [...registros];
        const textoBusqueda = searchBox.value.toLowerCase().trim();
        const tipoSeleccionado = filtroTipo.value;
        const fechaSeleccionada = filtroFecha.value;
        
        // Filtro por texto de búsqueda
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
     * Ordena los registros por fecha (más recientes primero)
     * @param {Array} registros - Array de registros a ordenar
     * @returns {Array} Registros ordenados
     */
    function ordenarRegistros(registros) {
        return registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    
    /**
     * Obtiene los registros para la página actual
     * @param {Array} registros - Array completo de registros
     * @param {number} pagina - Número de página
     * @param {number} registrosPorPagina - Cantidad de registros por página
     * @returns {Array} Registros de la página solicitada
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
     * Renderiza los registros en la tabla
     * @param {Array} registros - Array de registros a mostrar
     */
    function renderizarRegistros(registros) {
        // Limpiar tabla actual
        tablaRegistros.innerHTML = '';
        
        if (registros.length === 0) {
            // Mostrar mensaje cuando no hay registros
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
        
        // Renderizar cada registro
        registros.forEach(registro => {
            const fila = document.createElement('tr');
            fila.className = `registro-${registro.tipo}`;
            
            // Determinar clase CSS para el estado
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
            
            // Crear HTML de la fila
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
        
        // Configurar event listeners para los botones de acción
        configurarBotonesAccion();
    }
    
    /**
     * Formatea una fecha de YYYY-MM-DD a DD/MM/YYYY
     * @param {string} fechaISO - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    function formatearFecha(fechaISO) {
        const [anio, mes, dia] = fechaISO.split('-');
        return `${dia}/${mes}/${anio}`;
    }
    
    /**
     * Renderiza los controles de paginación
     * @param {number} paginaActual - Página actual
     * @param {number} totalPaginas - Total de páginas
     * @param {number} totalRegistros - Total de registros
     */
    function renderizarPaginacion(paginaActual, totalPaginas, totalRegistros) {
        if (totalRegistros === 0) {
            infoPaginacion.innerHTML = '<span>No hay registros para mostrar</span>';
            controlesPaginacion.style.display = 'none';
            return;
        }
        
        // Calcular rango de registros mostrados
        const inicio = (paginaActual - 1) * configPaginacion.registrosPorPagina + 1;
        const fin = Math.min(paginaActual * configPaginacion.registrosPorPagina, totalRegistros);
        
        // Actualizar información de paginación
        infoPaginacion.innerHTML = `<span>Mostrando ${inicio}-${fin} de ${totalRegistros} registros</span>`;
        
        // Actualizar números de página
        numerosPaginacion.innerHTML = '';
        
        // Mostrar máximo 5 números de página
        const inicioPaginas = Math.max(1, paginaActual - 2);
        const finPaginas = Math.min(totalPaginas, paginaActual + 2);
        
        for (let i = inicioPaginas; i <= finPaginas; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            if (i === paginaActual) {
                span.className = 'pagina-activa';
            }
            span.addEventListener('click', () => cambiarPagina(i));
            numerosPaginacion.appendChild(span);
        }
        
        controlesPaginacion.style.display = 'flex';
    }
    
    // =============================================
    // FUNCIONES DE ACTUALIZACIÓN DE ESTADO
    // =============================================
    
    /**
     * Actualiza las estadísticas mostradas en la página
     */
    function actualizarEstadisticas() {
        const registrosFiltrados = filtrarRegistros(registros);
        
        const arbolesCount = registrosFiltrados.filter(r => r.tipo === 'arbol').length;
        const suelosCount = registrosFiltrados.filter(r => r.tipo === 'suelo').length;
        const completosCount = registrosFiltrados.filter(r => r.estado === 'completo').length;
        const procesoCount = registrosFiltrados.filter(r => r.estado === 'proceso' || r.estado === 'pendiente').length;
        
        // Actualizar números en las tarjetas de estadísticas
        if (estadisticasNumeros.length >= 4) {
            estadisticasNumeros[0].textContent = arbolesCount;
            estadisticasNumeros[1].textContent = suelosCount;
            estadisticasNumeros[2].textContent = completosCount;
            estadisticasNumeros[3].textContent = procesoCount;
        }
    }
    
    /**
     * Carga y muestra los registros aplicando filtros y paginación
     */
    function cargarRegistros() {
        // Aplicar filtros
        const registrosFiltrados = filtrarRegistros(registros);
        const registrosOrdenados = ordenarRegistros(registrosFiltrados);
        
        // Actualizar configuración de paginación
        configPaginacion.totalRegistros = registrosOrdenados.length;
        configPaginacion.totalPaginas = Math.ceil(registrosOrdenados.length / configPaginacion.registrosPorPagina);
        
        // Obtener registros para la página actual
        const registrosPagina = obtenerRegistrosPagina(
            registrosOrdenados, 
            configPaginacion.paginaActual, 
            configPaginacion.registrosPorPagina
        );
        
        // Renderizar componentes
        renderizarRegistros(registrosPagina);
        renderizarPaginacion(
            configPaginacion.paginaActual, 
            configPaginacion.totalPaginas, 
            configPaginacion.totalRegistros
        );
        actualizarEstadisticas();
    }
    
    /**
     * Cambia a una página específica
     * @param {number} pagina - Número de página a la que cambiar
     */
    function cambiarPagina(pagina) {
        if (pagina < 1 || pagina > configPaginacion.totalPaginas) return;
        
        configPaginacion.paginaActual = pagina;
        cargarRegistros();
        
        // Scroll suave hacia la parte superior de la tabla
        tablaRegistros.closest('.tabla-contenedor').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    // =============================================
    // FUNCIONES DE MANEJO DE EVENTOS
    // =============================================
    
    /**
     * Configura los event listeners para los botones de acción (Editar/Ver)
     */
    function configurarBotonesAccion() {
        const botonesEditar = document.querySelectorAll('.btn-editar');
        const botonesVer = document.querySelectorAll('.btn-ver');
        
        botonesEditar.forEach(boton => {
            boton.addEventListener('click', function() {
                const registroId = this.getAttribute('data-id');
                manejarEditarRegistro(registroId);
            });
        });
        
        botonesVer.forEach(boton => {
            boton.addEventListener('click', function() {
                const registroId = this.getAttribute('data-id');
                manejarVerRegistro(registroId);
            });
        });
    }
    
    /**
     * Maneja la acción de editar un registro
     * @param {string} registroId - ID del registro a editar
     */
    function manejarEditarRegistro(registroId) {
        const registro = registros.find(r => r.id === registroId);
        
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        
        // Determinar a qué página redirigir según el tipo de registro
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
     * Maneja la acción de ver un registro en detalle
     * @param {string} registroId - ID del registro a visualizar
     */
    function manejarVerRegistro(registroId) {
        const registro = registros.find(r => r.id === registroId);
        
        if (!registro) {
            alert('Registro no encontrado');
            return;
        }
        
        // Crear y mostrar modal de detalles
        mostrarModalDetalles(registro);
        
        console.log(`Viendo detalles del registro: ${registroId}`, registro);
    }
    
    /**
     * Muestra un modal con los detalles completos del registro
     * @param {Object} registro - Objeto registro con todos los datos
     */
    function mostrarModalDetalles(registro) {
        // Crear elemento modal
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
        
        // Determinar color según tipo
        const colorTipo = registro.tipo === 'arbol' ? '#2E7D32' : '#1565C0';
        const textoEstado = registro.estado === 'completo' ? 'Completo' : 
                           registro.estado === 'pendiente' ? 'Pendiente' : 'En proceso';
        
        // Contenido del modal
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
        
        // Configurar event listeners del modal
        const btnCerrar = modal.querySelector('.btn-cerrar');
        const btnCerrarModal = modal.querySelector('.btn-cerrar-modal');
        const btnEditarModal = modal.querySelector('.btn-editar-modal');
        
        const cerrarModal = () => {
            document.body.removeChild(modal);
        };
        
        btnCerrar.addEventListener('click', cerrarModal);
        btnCerrarModal.addEventListener('click', cerrarModal);
        btnEditarModal.addEventListener('click', () => {
            cerrarModal();
            manejarEditarRegistro(registro.id);
        });
        
        // Cerrar modal al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }
    
    /**
     * Configura todos los event listeners de la página
     */
    function configurarEventListeners() {
        // Búsqueda en tiempo real
        searchBox.addEventListener('input', debounce(() => {
            configPaginacion.paginaActual = 1;
            cargarRegistros();
        }, 300));
        
        // Filtros
        filtroTipo.addEventListener('change', () => {
            configPaginacion.paginaActual = 1;
            cargarRegistros();
        });
        
        filtroFecha.addEventListener('change', () => {
            configPaginacion.paginaActual = 1;
            cargarRegistros();
        });
        
        btnFiltrar.addEventListener('click', () => {
            configPaginacion.paginaActual = 1;
            cargarRegistros();
        });
        
        // Botones de paginación
        const btnAnterior = controlesPaginacion.querySelector('.btn-paginacion:first-child');
        const btnSiguiente = controlesPaginacion.querySelector('.btn-paginacion:last-child');
        
        btnAnterior.addEventListener('click', () => {
            cambiarPagina(configPaginacion.paginaActual - 1);
        });
        
        btnSiguiente.addEventListener('click', () => {
            cambiarPagina(configPaginacion.paginaActual + 1);
        });
        
        // Limpiar filtros con doble clic en el título
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
     * Función debounce para optimizar búsquedas
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en milisegundos
     * @returns {Function} Función debounceada
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
});