/**
 * SISTEMA DE BÚSQUEDA UNIVERSAL - IFN COLOMBIA
 * 
 * Este módulo implementa un sistema de búsqueda unificado que funciona en todos los paneles
 * del sistema. Permite buscar a través de múltiples categorías de datos (brigadas, miembros,
 * especies, ubicaciones, tareas, registros) con una interfaz consistente y responsive.
 * 
 * @file buscador-universal.js
 * @version 1.0
 * @author Inventario Forestal Nacional - Colombia
 * 
 * @class BuscadorUniversal
 * @description Clase principal que gestiona todo el sistema de búsqueda universal
 */

class BuscadorUniversal {
    /**
     * Constructor de la clase BuscadorUniversal
     * Inicializa las propiedades y configuración del buscador
     */
    constructor() {
        /**
         * Almacén de datos para la búsqueda organizado por categorías
         * @type {Object}
         * @property {Array} brigadas - Datos de las brigadas del sistema
         * @property {Array} miembros - Datos de los miembros de brigadas
         * @property {Array} especies - Datos de especies forestales
         * @property {Array} ubicaciones - Datos de ubicaciones geográficas
         * @property {Array} tareas - Datos de tareas y actividades
         * @property {Array} registros - Datos de registros del sistema
         */
        this.datos = {
            brigadas: [],
            miembros: [],
            especies: [],
            ubicaciones: [],
            tareas: [],
            registros: []
        };
        
        /**
         * Estado de inicialización del buscador
         * @type {boolean}
         */
        this.inicializado = false;
        
        /**
         * Configuración del comportamiento del buscador
         * @type {Object}
         * @property {number} tiempoDebounce - Tiempo en ms para debounce de búsqueda
         * @property {number} minCaracteres - Mínimo de caracteres para activar búsqueda
         */
        this.configuracion = {
            tiempoDebounce: 300,
            minCaracteres: 2
        };
        
        // Inicializar el buscador automáticamente al crear la instancia
        this.init();
    }

    /**
     * INICIALIZACIÓN PRINCIPAL DEL BUSCADOR
     * Carga datos y configura los eventos de búsqueda en la página
     * @async
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Cargar datos iniciales para la búsqueda
            await this.cargarDatos();
            
            // Configurar eventos y elementos de búsqueda en el DOM
            this.configurarBusqueda();
            
            // Marcar como inicializado
            this.inicializado = true;
            console.log('Buscador universal inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando el buscador:', error);
        }
    }

    /**
     * CARGA DE DATOS PARA BÚSQUEDA
     * Simula la carga de datos desde una API o base de datos
     * En producción, estos datos vendrían de endpoints reales
     * @async
     * @returns {Promise<void>}
     */
    async cargarDatos() {
        // DATOS DE EJEMPLO - En implementación real vendrían de APIs
        this.datos = {
            brigadas: [
                { 
                    id: 1, 
                    nombre: "Brigada Norte", 
                    lider: "Carlos Rodríguez", 
                    miembros: 5, 
                    zona: "Sector Norte del Bosque",
                    tipo: "brigada",
                    estado: "activa"
                },
                { 
                    id: 2, 
                    nombre: "Brigada Sur", 
                    lider: "Ana Martínez", 
                    miembros: 4, 
                    zona: "Sector Sur del Bosque",
                    tipo: "brigada",
                    estado: "activa"
                }
            ],
            miembros: [
                { 
                    id: 1, 
                    nombre: "Carlos Rodríguez", 
                    brigada: "Brigada Norte", 
                    rol: "Líder",
                    tipo: "miembro",
                    estado: "activo"
                },
                { 
                    id: 2, 
                    nombre: "Ana Martínez", 
                    brigada: "Brigada Sur", 
                    rol: "Líder",
                    tipo: "miembro",
                    estado: "activo"
                }
            ],
            especies: [
                {
                    id: 1,
                    nombre: "Pino",
                    nombreCientifico: "Pinus",
                    tipo: "especie",
                    ubicacion: "Sector Norte"
                }
            ],
            tareas: [
                {
                    id: 1,
                    descripcion: "Inventario de árboles",
                    brigada: "Brigada Norte",
                    tipo: "tarea",
                    estado: "pendiente"
                }
            ]
        };
    }

    /**
     * CONFIGURACIÓN DEL SISTEMA DE BÚSQUEDA
     * Busca y configura todos los elementos de búsqueda en la página
     * @returns {void}
     */
    configurarBusqueda() {
        // BUSCAR CAMPOS DE BÚSQUEDA POR PLACEHOLDER
        const searchInputs = document.querySelectorAll(
            'input[type="text"][placeholder*="buscar"], input[type="text"][placeholder*="Buscar"]'
        );
        
        // Configurar cada input encontrado
        searchInputs.forEach(input => {
            this.configurarInputBusqueda(input);
        });

        // BUSCAR CAMPOS DE BÚSQUEDA POR CLASE ESPECÍFICA
        const searchBoxes = document.querySelectorAll('.search-box input');
        searchBoxes.forEach(input => {
            this.configurarInputBusqueda(input);
        });

        // CONFIGURAR ICONOS DE BÚSQUEDA
        const searchIcons = document.querySelectorAll('.search-icon, .lupa');
        searchIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                const searchBox = e.target.closest('.search-box');
                if (searchBox) {
                    const input = searchBox.querySelector('input');
                    if (input && input.value.trim()) {
                        this.realizarBusqueda(input.value.trim());
                    }
                }
            });
        });
    }

    /**
     * CONFIGURA UN INPUT INDIVIDUAL DE BÚSQUEDA
     * Aplica eventos y comportamientos específicos a un campo de búsqueda
     * @param {HTMLInputElement} input - Elemento input a configurar
     * @returns {void}
     */
    configurarInputBusqueda(input) {
        // EVITAR CONFIGURACIÓN MÚLTIPLE DEL MISMO INPUT
        if (input.hasAttribute('data-buscador-configurado')) {
            return;
        }

        // MARCAR COMO CONFIGURADO
        input.setAttribute('data-buscador-configurado', 'true');

        // EVENTO DE INPUT CON TÉCNICA DEBOUNCE
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const termino = e.target.value.trim();
            
            if (termino.length >= this.configuracion.minCaracteres) {
                timeout = setTimeout(() => {
                    this.realizarBusqueda(termino);
                }, this.configuracion.tiempoDebounce);
            } else if (termino.length === 0) {
                this.limpiarResultados();
            }
        });

        // EVENTO DE TECLA ENTER PARA BÚSQUEDA INMEDIATA
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const termino = e.target.value.trim();
                if (termino.length >= this.configuracion.minCaracteres) {
                    this.realizarBusqueda(termino);
                }
            }
        });
    }

    /**
     * REALIZA LA BÚSQUEDA EN TODOS LOS DATOS DISPONIBLES
     * Ejecuta la búsqueda across todas las categorías de datos
     * @param {string} termino - Término de búsqueda ingresado por el usuario
     * @returns {void}
     */
    realizarBusqueda(termino) {
        // VERIFICAR INICIALIZACIÓN
        if (!this.inicializado) {
            console.warn('Buscador no inicializado');
            return;
        }

        const terminoLower = termino.toLowerCase();
        
        /**
         * Objeto para almacenar resultados organizados por categoría
         * @type {Object}
         */
        const resultados = {
            brigadas: [],
            miembros: [],
            especies: [],
            ubicaciones: [],
            tareas: [],
            registros: []
        };

        // BÚSQUEDA EN BRIGADAS
        resultados.brigadas = this.datos.brigadas.filter(brigada =>
            brigada.nombre.toLowerCase().includes(terminoLower) ||
            brigada.lider.toLowerCase().includes(terminoLower) ||
            brigada.zona.toLowerCase().includes(terminoLower)
        );

        // BÚSQUEDA EN MIEMBROS
        resultados.miembros = this.datos.miembros.filter(miembro =>
            miembro.nombre.toLowerCase().includes(terminoLower) ||
            miembro.brigada.toLowerCase().includes(terminoLower) ||
            miembro.rol.toLowerCase().includes(terminoLower)
        );

        // BÚSQUEDA EN ESPECIES
        resultados.especies = this.datos.especies.filter(especie =>
            especie.nombre.toLowerCase().includes(terminoLower) ||
            (especie.nombreCientifico && especie.nombreCientifico.toLowerCase().includes(terminoLower)) ||
            especie.ubicacion.toLowerCase().includes(terminoLower)
        );

        // BÚSQUEDA EN TAREAS
        resultados.tareas = this.datos.tareas.filter(tarea =>
            tarea.descripcion.toLowerCase().includes(terminoLower) ||
            tarea.brigada.toLowerCase().includes(terminoLower)
        );

        // MOSTRAR RESULTADOS AL USUARIO
        this.mostrarResultados(resultados, termino);
    }

    /**
     * MUESTRA LOS RESULTADOS DE BÚSQUEDA EN LA INTERFAZ
     * @param {Object} resultados - Resultados organizados por categoría
     * @param {string} termino - Término original de búsqueda
     * @returns {void}
     */
    mostrarResultados(resultados, termino) {
        // LIMPIAR RESULTADOS ANTERIORES
        this.limpiarResultados();

        // CALCULAR TOTAL DE RESULTADOS
        const totalResultados = Object.values(resultados).reduce((total, categoria) => total + categoria.length, 0);
        
        // MANEJAR CASO SIN RESULTADOS
        if (totalResultados === 0) {
            this.mostrarSinResultados(termino);
            return;
        }

        // CREAR INTERFAZ DE RESULTADOS
        const resultadosContainer = this.crearContenedorResultados();
        
        // AGREGAR RESULTADOS POR CATEGORÍA
        Object.keys(resultados).forEach(categoria => {
            if (resultados[categoria].length > 0) {
                this.agregarCategoriaResultados(resultadosContainer, categoria, resultados[categoria]);
            }
        });

        // MOSTRAR RESUMEN DE BÚSQUEDA
        this.mostrarMensaje(`Se encontraron ${totalResultados} resultados para "${termino}"`, 'info');
    }

    /**
     * CREA EL CONTENEDOR PARA MOSTRAR RESULTADOS
     * @returns {HTMLDivElement} Contenedor de resultados creado
     */
    crearContenedorResultados() {
        // ELIMINAR CONTENEDOR ANTERIOR SI EXISTE
        const contenedorAnterior = document.getElementById('resultados-busqueda-universal');
        if (contenedorAnterior) {
            contenedorAnterior.remove();
        }

        // CREAR NUEVO CONTENEDOR
        const contenedor = document.createElement('div');
        contenedor.id = 'resultados-busqueda-universal';
        
        // ESTILOS DEL CONTENEDOR
        contenedor.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-height: 400px;
            overflow-y: auto;
            z-index: 1000;
            margin-top: 5px;
        `;

        // INSERTAR EN EL DOM
        const primerSearchBox = document.querySelector('.search-box');
        if (primerSearchBox) {
            primerSearchBox.style.position = 'relative';
            primerSearchBox.appendChild(contenedor);
        } else {
            document.body.appendChild(contenedor);
        }

        return contenedor;
    }

    /**
     * AGREGA UNA CATEGORÍA DE RESULTADOS AL CONTENEDOR
     * @param {HTMLDivElement} contenedor - Contenedor principal de resultados
     * @param {string} categoria - Nombre de la categoría (brigadas, miembros, etc.)
     * @param {Array} items - Array de items de la categoría
     * @returns {void}
     */
    agregarCategoriaResultados(contenedor, categoria, items) {
        // CREAR TÍTULO DE CATEGORÍA
        const tituloCategoria = document.createElement('div');
        tituloCategoria.style.cssText = `
            padding: 10px 15px;
            background: #f5f5f5;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            color: #2E7D32;
        `;
        tituloCategoria.textContent = this.formatearTituloCategoria(categoria) + ` (${items.length})`;
        contenedor.appendChild(tituloCategoria);

        // AGREGAR ITEMS DE LA CATEGORÍA
        items.forEach(item => {
            const elementoResultado = this.crearElementoResultado(item);
            contenedor.appendChild(elementoResultado);
        });
    }

    /**
     * FORMATEA EL TÍTULO DE CATEGORÍA PARA MOSTRAR
     * @param {string} categoria - Nombre técnico de la categoría
     * @returns {string} Título formateado para mostrar
     */
    formatearTituloCategoria(categoria) {
        /**
         * Mapeo de nombres técnicos a nombres amigables
         * @type {Object}
         */
        const titulos = {
            brigadas: 'Brigadas',
            miembros: 'Miembros',
            especies: 'Especies',
            ubicaciones: 'Ubicaciones',
            tareas: 'Tareas',
            registros: 'Registros'
        };
        return titulos[categoria] || categoria;
    }

    /**
     * CREA UN ELEMENTO INDIVIDUAL DE RESULTADO
     * @param {Object} item - Item de resultado a mostrar
     * @returns {HTMLDivElement} Elemento de resultado creado
     */
    crearElementoResultado(item) {
        const elemento = document.createElement('div');
        
        // ESTILOS BASE DEL ELEMENTO
        elemento.style.cssText = `
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background-color 0.2s;
        `;

        // GENERAR CONTENIDO HTML SEGÚN EL TIPO DE ITEM
        elemento.innerHTML = this.generarHTMLResultado(item);
        
        // EVENTO CLICK PARA SELECCIÓN
        elemento.addEventListener('click', () => {
            this.seleccionarResultado(item);
        });

        // EFECTOS HOVER PARA MEJOR UX
        elemento.addEventListener('mouseenter', () => {
            elemento.style.backgroundColor = '#f8f9fa';
        });

        elemento.addEventListener('mouseleave', () => {
            elemento.style.backgroundColor = 'white';
        });

        return elemento;
    }

    /**
     * GENERA EL HTML PARA UN RESULTADO INDIVIDUAL
     * @param {Object} item - Item del que generar el HTML
     * @returns {string} HTML generado para el resultado
     */
    generarHTMLResultado(item) {
        // GENERAR HTML ESPECÍFICO SEGÚN EL TIPO DE ITEM
        switch (item.tipo) {
            case 'brigada':
                return `
                    <div style="font-weight: bold; color: #2E7D32;">${item.nombre}</div>
                    <div style="font-size: 0.9em; color: #666;">
                        Líder: ${item.lider} | Miembros: ${item.miembros} | Zona: ${item.zona}
                    </div>
                `;
            
            case 'miembro':
                return `
                    <div style="font-weight: bold; color: #1E88E5;">${item.nombre}</div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${item.rol} | Brigada: ${item.brigada}
                    </div>
                `;
            
            case 'especie':
                return `
                    <div style="font-weight: bold; color: #FF9800;">${item.nombre}</div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${item.nombreCientifico ? `Científico: ${item.nombreCientifico} | ` : ''}Ubicación: ${item.ubicacion}
                    </div>
                `;
            
            case 'tarea':
                return `
                    <div style="font-weight: bold; color: #9C27B0;">${item.descripcion}</div>
                    <div style="font-size: 0.9em; color: #666;">
                        Brigada: ${item.brigada} | Estado: ${item.estado}
                    </div>
                `;
            
            default:
                // FALLBACK PARA TIPOS NO ESPECIFICADOS
                return `
                    <div style="font-weight: bold;">${item.nombre || item.descripcion}</div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${JSON.stringify(item)}
                    </div>
                `;
        }
    }

    /**
     * MANEJA LA SELECCIÓN DE UN RESULTADO
     * @param {Object} item - Item seleccionado por el usuario
     * @returns {void}
     */
    seleccionarResultado(item) {
        console.log('Resultado seleccionado:', item);
        
        // REDIRIGIR O MOSTRAR DETALLES SEGÚN EL TIPO DE ITEM
        switch (item.tipo) {
            case 'brigada':
                this.mostrarDetallesBrigada(item);
                break;
            
            case 'miembro':
                this.mostrarDetallesMiembro(item);
                break;
            
            case 'especie':
                this.mostrarDetallesEspecie(item);
                break;
            
            case 'tarea':
                this.mostrarDetallesTarea(item);
                break;
        }

        // LIMPIAR INTERFAZ DESPUÉS DE LA SELECCIÓN
        this.limpiarResultados();
        
        // LIMPIAR CAMPOS DE BÚSQUEDA
        const searchInputs = document.querySelectorAll(
            'input[type="text"][placeholder*="buscar"], input[type="text"][placeholder*="Buscar"]'
        );
        searchInputs.forEach(input => {
            input.value = '';
        });
    }

    /**
     * MUESTRA MENSAJE CUANDO NO HAY RESULTADOS
     * @param {string} termino - Término de búsqueda que no produjo resultados
     * @returns {void}
     */
    mostrarSinResultados(termino) {
        this.mostrarMensaje(`No se encontraron resultados para "${termino}"`, 'warning');
        this.limpiarResultados();
    }

    /**
     * LIMPIA LOS RESULTADOS DE BÚSQUEDA DE LA INTERFAZ
     * @returns {void}
     */
    limpiarResultados() {
        const contenedor = document.getElementById('resultados-busqueda-universal');
        if (contenedor) {
            contenedor.remove();
        }
    }

    /**
     * MUESTRA UN MENSAJE AL USUARIO
     * @param {string} mensaje - Texto del mensaje a mostrar
     * @param {string} tipo - Tipo de mensaje (success, error, warning, info)
     * @returns {void}
     */
    mostrarMensaje(mensaje, tipo = 'info') {
        // ELIMINAR MENSAJES EXISTENTES
        const mensajesExistentes = document.querySelectorAll('.mensaje-busqueda-universal');
        mensajesExistentes.forEach(msg => msg.remove());

        // CREAR NUEVO ELEMENTO DE MENSAJE
        const mensajeElement = document.createElement('div');
        mensajeElement.className = `mensaje-busqueda-universal mensaje-${tipo}`;
        mensajeElement.textContent = mensaje;
        
        // ESTILOS DEL MENSAJE
        mensajeElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-size: 0.9em;
        `;

        // COLORES SEGÚN EL TIPO DE MENSAJE
        const colores = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        mensajeElement.style.backgroundColor = colores[tipo] || colores.info;

        // AGREGAR AL DOM
        document.body.appendChild(mensajeElement);

        // AUTO-ELIMINAR DESPUÉS DE 3 SEGUNDOS
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                mensajeElement.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => mensajeElement.remove(), 300);
            }
        }, 3000);
    }

    // =============================================
    // MÉTODOS PARA MANEJAR LA SELECCIÓN DE RESULTADOS
    // =============================================

    /**
     * MANEJA LA SELECCIÓN DE UNA BRIGADA
     * @param {Object} brigada - Brigada seleccionada
     * @returns {void}
     */
    mostrarDetallesBrigada(brigada) {
        // IMPLEMENTAR SEGÚN LA LÓGICA DE LA APLICACIÓN
        console.log('Mostrando detalles de brigada:', brigada);
        this.mostrarMensaje(`Redirigiendo a detalles de ${brigada.nombre}`, 'success');
    }

    /**
     * MANEJA LA SELECCIÓN DE UN MIEMBRO
     * @param {Object} miembro - Miembro seleccionado
     * @returns {void}
     */
    mostrarDetallesMiembro(miembro) {
        // IMPLEMENTAR SEGÚN LA LÓGICA DE LA APLICACIÓN
        console.log('Mostrando detalles de miembro:', miembro);
        this.mostrarMensaje(`Redirigiendo a perfil de ${miembro.nombre}`, 'success');
    }

    /**
     * MANEJA LA SELECCIÓN DE UNA ESPECIE
     * @param {Object} especie - Especie seleccionada
     * @returns {void}
     */
    mostrarDetallesEspecie(especie) {
        // IMPLEMENTAR SEGÚN LA LÓGICA DE LA APLICACIÓN
        console.log('Mostrando detalles de especie:', especie);
        this.mostrarMensaje(`Redirigiendo a información de ${especie.nombre}`, 'success');
    }

    /**
     * MANEJA LA SELECCIÓN DE UNA TAREA
     * @param {Object} tarea - Tarea seleccionada
     * @returns {void}
     */
    mostrarDetallesTarea(tarea) {
        // IMPLEMENTAR SEGÚN LA LÓGICA DE LA APLICACIÓN
        console.log('Mostrando detalles de tarea:', tarea);
        this.mostrarMensaje(`Redirigiendo a detalles de tarea`, 'success');
    }

    /**
     * AGREGA DATOS ADICIONALES PARA BÚSQUEDA
     * @param {string} categoria - Categoría a la que agregar datos
     * @param {Array} datos - Array de datos a agregar
     * @returns {void}
     */
    agregarDatos(categoria, datos) {
        if (this.datos[categoria]) {
            this.datos[categoria] = this.datos[categoria].concat(datos);
        } else {
            this.datos[categoria] = datos;
        }
    }

    /**
     * LIMPIA TODOS LOS DATOS DE BÚSQUEDA
     * @returns {void}
     */
    limpiarDatos() {
        this.datos = {
            brigadas: [],
            miembros: [],
            especies: [],
            ubicaciones: [],
            tareas: [],
            registros: []
        };
    }
}

// =============================================
// INICIALIZACIÓN GLOBAL DEL BUSCADOR
// =============================================

/**
 * Inicializa el buscador universal cuando se carga la página
 * Crea una instancia global accesible desde la consola del navegador
 */
document.addEventListener('DOMContentLoaded', function() {
    window.buscadorUniversal = new BuscadorUniversal();
});

// =============================================
// ESTILOS CSS DINÁMICOS PARA EL BUSCADOR
// =============================================

/**
 * Estilos CSS inyectados para el funcionamiento del buscador
 * @type {string}
 */
const estilosBuscador = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .search-box {
        position: relative;
    }
    
    #resultados-busqueda-universal::-webkit-scrollbar {
        width: 6px;
    }
    
    #resultados-busqueda-universal::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 0 8px 8px 0;
    }
    
    #resultados-busqueda-universal::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }
    
    #resultados-busqueda-universal::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
`;

// INYECTAR ESTILOS EN EL HEAD DEL DOCUMENTO
const styleSheet = document.createElement('style');
styleSheet.textContent = estilosBuscador;
document.head.appendChild(styleSheet);