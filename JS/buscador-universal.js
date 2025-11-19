// buscador-universal.js - Sistema de búsqueda universal para todos los paneles

class BuscadorUniversal {
    constructor() {
        this.datos = {
            brigadas: [],
            miembros: [],
            especies: [],
            ubicaciones: [],
            tareas: [],
            registros: []
        };
        
        this.inicializado = false;
        this.configuracion = {
            tiempoDebounce: 300,
            minCaracteres: 2
        };
        
        this.init();
    }

    /**
     * Inicializa el buscador universal
     */
    async init() {
        try {
            await this.cargarDatos();
            this.configurarBusqueda();
            this.inicializado = true;
            console.log('Buscador universal inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando el buscador:', error);
        }
    }

    /**
     * Carga los datos necesarios para la búsqueda
     */
    async cargarDatos() {
        // En una implementación real, estos datos vendrían de una API
        // Por ahora usamos datos de ejemplo
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
     * Configura el sistema de búsqueda en todos los paneles
     */
    configurarBusqueda() {
        // Buscar todos los campos de búsqueda en la página
        const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="buscar"], input[type="text"][placeholder*="Buscar"]');
        
        searchInputs.forEach(input => {
            this.configurarInputBusqueda(input);
        });

        // También buscar por clase específica si existe
        const searchBoxes = document.querySelectorAll('.search-box input');
        searchBoxes.forEach(input => {
            this.configurarInputBusqueda(input);
        });

        // Configurar iconos de búsqueda
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
     * Configura un input individual de búsqueda
     */
    configurarInputBusqueda(input) {
        // Evitar configurar múltiples veces el mismo input
        if (input.hasAttribute('data-buscador-configurado')) {
            return;
        }

        input.setAttribute('data-buscador-configurado', 'true');

        // Evento de input con debounce
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

        // Evento de Enter
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
     * Realiza la búsqueda en todos los datos disponibles
     */
    realizarBusqueda(termino) {
        if (!this.inicializado) {
            console.warn('Buscador no inicializado');
            return;
        }

        const terminoLower = termino.toLowerCase();
        const resultados = {
            brigadas: [],
            miembros: [],
            especies: [],
            ubicaciones: [],
            tareas: [],
            registros: []
        };

        // Buscar en brigadas
        resultados.brigadas = this.datos.brigadas.filter(brigada =>
            brigada.nombre.toLowerCase().includes(terminoLower) ||
            brigada.lider.toLowerCase().includes(terminoLower) ||
            brigada.zona.toLowerCase().includes(terminoLower)
        );

        // Buscar en miembros
        resultados.miembros = this.datos.miembros.filter(miembro =>
            miembro.nombre.toLowerCase().includes(terminoLower) ||
            miembro.brigada.toLowerCase().includes(terminoLower) ||
            miembro.rol.toLowerCase().includes(terminoLower)
        );

        // Buscar en especies
        resultados.especies = this.datos.especies.filter(especie =>
            especie.nombre.toLowerCase().includes(terminoLower) ||
            (especie.nombreCientifico && especie.nombreCientifico.toLowerCase().includes(terminoLower)) ||
            especie.ubicacion.toLowerCase().includes(terminoLower)
        );

        // Buscar en tareas
        resultados.tareas = this.datos.tareas.filter(tarea =>
            tarea.descripcion.toLowerCase().includes(terminoLower) ||
            tarea.brigada.toLowerCase().includes(terminoLower)
        );

        this.mostrarResultados(resultados, termino);
    }

    /**
     * Muestra los resultados de la búsqueda
     */
    mostrarResultados(resultados, termino) {
        // Primero, limpiar resultados anteriores
        this.limpiarResultados();

        const totalResultados = Object.values(resultados).reduce((total, categoria) => total + categoria.length, 0);
        
        if (totalResultados === 0) {
            this.mostrarSinResultados(termino);
            return;
        }

        // Crear contenedor de resultados
        const resultadosContainer = this.crearContenedorResultados();
        
        // Agregar resultados por categoría
        Object.keys(resultados).forEach(categoria => {
            if (resultados[categoria].length > 0) {
                this.agregarCategoriaResultados(resultadosContainer, categoria, resultados[categoria]);
            }
        });

        this.mostrarMensaje(`Se encontraron ${totalResultados} resultados para "${termino}"`, 'info');
    }

    /**
     * Crea el contenedor para mostrar los resultados
     */
    crearContenedorResultados() {
        // Eliminar contenedor anterior si existe
        const contenedorAnterior = document.getElementById('resultados-busqueda-universal');
        if (contenedorAnterior) {
            contenedorAnterior.remove();
        }

        // Crear nuevo contenedor
        const contenedor = document.createElement('div');
        contenedor.id = 'resultados-busqueda-universal';
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

        // Insertar después del primer search-box encontrado
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
     * Agrega una categoría de resultados al contenedor
     */
    agregarCategoriaResultados(contenedor, categoria, items) {
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

        items.forEach(item => {
            const elementoResultado = this.crearElementoResultado(item);
            contenedor.appendChild(elementoResultado);
        });
    }

    /**
     * Formatea el título de la categoría para mostrar
     */
    formatearTituloCategoria(categoria) {
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
     * Crea un elemento individual de resultado
     */
    crearElementoResultado(item) {
        const elemento = document.createElement('div');
        elemento.style.cssText = `
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background-color 0.2s;
        `;

        elemento.innerHTML = this.generarHTMLResultado(item);
        
        elemento.addEventListener('click', () => {
            this.seleccionarResultado(item);
        });

        elemento.addEventListener('mouseenter', () => {
            elemento.style.backgroundColor = '#f8f9fa';
        });

        elemento.addEventListener('mouseleave', () => {
            elemento.style.backgroundColor = 'white';
        });

        return elemento;
    }

    /**
     * Genera el HTML para un resultado individual
     */
    generarHTMLResultado(item) {
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
                return `
                    <div style="font-weight: bold;">${item.nombre || item.descripcion}</div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${JSON.stringify(item)}
                    </div>
                `;
        }
    }

    /**
     * Maneja la selección de un resultado
     */
    seleccionarResultado(item) {
        console.log('Resultado seleccionado:', item);
        
        // Aquí defines qué hacer cuando se selecciona un resultado
        // Por ejemplo, redirigir a la página correspondiente o mostrar detalles
        
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

        this.limpiarResultados();
        
        // Limpiar el campo de búsqueda
        const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="buscar"], input[type="text"][placeholder*="Buscar"]');
        searchInputs.forEach(input => {
            input.value = '';
        });
    }

    /**
     * Muestra mensaje cuando no hay resultados
     */
    mostrarSinResultados(termino) {
        this.mostrarMensaje(`No se encontraron resultados para "${termino}"`, 'warning');
        this.limpiarResultados();
    }

    /**
     * Limpia los resultados de búsqueda
     */
    limpiarResultados() {
        const contenedor = document.getElementById('resultados-busqueda-universal');
        if (contenedor) {
            contenedor.remove();
        }
    }

    /**
     * Muestra un mensaje al usuario
     */
    mostrarMensaje(mensaje, tipo = 'info') {
        // Eliminar mensajes existentes
        const mensajesExistentes = document.querySelectorAll('.mensaje-busqueda-universal');
        mensajesExistentes.forEach(msg => msg.remove());

        // Crear nuevo mensaje
        const mensajeElement = document.createElement('div');
        mensajeElement.className = `mensaje-busqueda-universal mensaje-${tipo}`;
        mensajeElement.textContent = mensaje;
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

        // Colores según el tipo
        const colores = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        mensajeElement.style.backgroundColor = colores[tipo] || colores.info;

        document.body.appendChild(mensajeElement);

        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                mensajeElement.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => mensajeElement.remove(), 300);
            }
        }, 3000);
    }

    // Métodos para manejar la selección de resultados (personalizar según necesidades)
    mostrarDetallesBrigada(brigada) {
        // Implementar según la lógica de tu aplicación
        console.log('Mostrando detalles de brigada:', brigada);
        this.mostrarMensaje(`Redirigiendo a detalles de ${brigada.nombre}`, 'success');
    }

    mostrarDetallesMiembro(miembro) {
        // Implementar según la lógica de tu aplicación
        console.log('Mostrando detalles de miembro:', miembro);
        this.mostrarMensaje(`Redirigiendo a perfil de ${miembro.nombre}`, 'success');
    }

    mostrarDetallesEspecie(especie) {
        // Implementar según la lógica de tu aplicación
        console.log('Mostrando detalles de especie:', especie);
        this.mostrarMensaje(`Redirigiendo a información de ${especie.nombre}`, 'success');
    }

    mostrarDetallesTarea(tarea) {
        // Implementar según la lógica de tu aplicación
        console.log('Mostrando detalles de tarea:', tarea);
        this.mostrarMensaje(`Redirigiendo a detalles de tarea`, 'success');
    }

    /**
     * Agrega datos adicionales para búsqueda
     */
    agregarDatos(categoria, datos) {
        if (this.datos[categoria]) {
            this.datos[categoria] = this.datos[categoria].concat(datos);
        } else {
            this.datos[categoria] = datos;
        }
    }

    /**
     * Limpia todos los datos de búsqueda
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

// Inicializar el buscador cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.buscadorUniversal = new BuscadorUniversal();
});

// Agregar estilos CSS dinámicos para el buscador
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

// Injectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = estilosBuscador;
document.head.appendChild(styleSheet);