/**
 * SISTEMA DE REGISTRO DE ÁRBOLES - IFN COLOMBIA
 * 
 * Este módulo maneja la lógica completa del formulario de registro de árboles,
 * incluyendo validaciones, envío de datos y manejo de eventos.
 * 
 * @file subirArbol.js
 * @version 1.0
 * @author Inventario Forestal Nacional - Colombia
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // VARIABLES GLOBALES Y REFERENCIAS A ELEMENTOS
    // =============================================
    
    /**
     * Referencia al formulario principal de registro de árboles
     * @type {HTMLFormElement}
     */
    const formulario = document.getElementById('formularioArbol');
    
    /**
     * Referencias a los botones de acción principales
     * @type {HTMLButtonElement}
     */
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnGuardar = document.getElementById('btnGuardar');
    
    /**
     * Referencias a campos específicos para validaciones especializadas
     * @type {HTMLInputElement|HTMLSelectElement}
     */
    const campoColector = document.getElementById('colector');
    const campoFecha = document.getElementById('fecha');
    const campoCondicion = document.getElementById('condicion');
    const campoAzimut = document.getElementById('azimut');
    
    // =============================================
    // CONFIGURACIÓN INICIAL DEL FORMULARIO
    // =============================================
    
    /**
     * Configura la fecha actual como valor por defecto en el campo fecha
     * Esto facilita el registro al usuario mostrando la fecha actual automáticamente
     * y reduce errores de ingreso manual.
     * 
     * @returns {void}
     */
    function configurarFechaActual() {
        const hoy = new Date();
        const fechaFormateada = hoy.toISOString().split('T')[0];
        campoFecha.value = fechaFormateada;
    }
    
    /**
     * Inicializa todas las configuraciones del formulario
     * Se ejecuta cuando el DOM está completamente cargado y prepara
     * el formulario para su uso.
     * 
     * @returns {void}
     */
    function inicializarFormulario() {
        configurarFechaActual();
        console.log('Formulario de registro de árbol inicializado correctamente');
    }
    
    // =============================================
    // SISTEMA DE VALIDACIONES DEL FORMULARIO
    // =============================================
    
    /**
     * Valida los campos obligatorios del formulario
     * Verifica que los campos marcados como requeridos tengan valores válidos
     * antes de permitir el envío del formulario.
     * 
     * @returns {boolean} True si todos los campos obligatorios están completos, 
     *                    False si falta alguno
     */
    function validarCamposObligatorios() {
        const colectorValor = campoColector.value.trim();
        const fechaValor = campoFecha.value;
        const condicionValor = campoCondicion.value;
        
        // Array para almacenar los nombres de los campos faltantes
        const camposFaltantes = [];
        
        if (!colectorValor) camposFaltantes.push('Colector y número de colección');
        if (!fechaValor) camposFaltantes.push('Fecha');
        if (!condicionValor) camposFaltantes.push('Condición');
        
        // Si hay campos faltantes, mostrar alerta y retornar false
        if (camposFaltantes.length > 0) {
            const mensaje = `Por favor, complete los siguientes campos obligatorios:\n• ${camposFaltantes.join('\n• ')}`;
            alert(mensaje);
            return false;
        }
        
        return true;
    }
    
    /**
     * Valida que un valor numérico esté dentro de un rango específico
     * Utilizado para validar campos como azimut, ángulos y distancias
     * que tienen restricciones numéricas definidas.
     * 
     * @param {number} valor - Valor a validar
     * @param {number} min - Valor mínimo permitido
     * @param {number} max - Valor máximo permitido
     * @param {string} nombreCampo - Nombre del campo para mensajes de error
     * @returns {boolean} True si el valor está en el rango válido
     */
    function validarRango(valor, min, max, nombreCampo) {
        // Campos vacíos son válidos (no son obligatorios)
        if (valor === '' || isNaN(valor)) return true;
        
        const numValor = parseFloat(valor);
        if (numValor < min || numValor > max) {
            alert(`El valor de ${nombreCampo} debe estar entre ${min} y ${max}`);
            return false;
        }
        return true;
    }
    
    /**
     * Valida todos los campos numéricos con restricciones de rango
     * Aplica validaciones específicas para cada tipo de medición:
     * - Azimut: 0-360 grados
     * - Ángulos V: 0-90 grados
     * - Alturas y distancias: valores positivos
     * 
     * @returns {boolean} True si todos los campos numéricos son válidos
     */
    function validarCamposNumericos() {
        // Validar Azimut (0-360 grados)
        if (!validarRango(campoAzimut.value, 0, 360, 'Azimut')) {
            campoAzimut.focus();
            return false;
        }
        
        // Validar ángulos V (0-90 grados)
        const vAlturaTotal = document.getElementById('vAlturaTotal');
        const vAlturaFuste = document.getElementById('vAlturaFuste');
        const vAltura = document.getElementById('vAltura');
        
        if (!validarRango(vAlturaTotal.value, 0, 90, 'V + Altura Total')) {
            vAlturaTotal.focus();
            return false;
        }
        
        if (!validarRango(vAlturaFuste.value, 0, 90, 'V + Altura Fuste')) {
            vAlturaFuste.focus();
            return false;
        }
        
        if (!validarRango(vAltura.value, 0, 90, 'V - Altura')) {
            vAltura.focus();
            return false;
        }
        
        // Validar que las alturas y distancias no sean negativas
        const camposPositivos = [
            { campo: document.getElementById('alturaTotal'), nombre: 'Altura Total' },
            { campo: document.getElementById('alturaFuste'), nombre: 'Altura Fuste' },
            { campo: document.getElementById('distanciaAltura'), nombre: 'Distancia Altura' },
            { campo: document.getElementById('distancia'), nombre: 'Distancia' },
            { campo: document.getElementById('diametro1'), nombre: 'Diámetro 1' },
            { campo: document.getElementById('diametro2'), nombre: 'Diámetro 2' }
        ];
        
        for (const { campo, nombre } of camposPositivos) {
            if (campo.value && parseFloat(campo.value) < 0) {
                alert(`El valor de ${nombre} no puede ser negativo`);
                campo.focus();
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Validación completa del formulario antes del envío
     * Ejecuta todas las validaciones en el orden correcto y
     * proporciona retroalimentación al usuario.
     * 
     * @returns {boolean} True si el formulario es válido y puede enviarse
     */
    function validarFormularioCompleto() {
        return validarCamposObligatorios() && validarCamposNumericos();
    }
    
    // =============================================
    // MANEJO DEL ENVÍO DEL FORMULARIO
    // =============================================
    
    /**
     * Simula el envío de datos al servidor
     * En una implementación real, aquí iría una petición fetch o XMLHttpRequest
     * hacia el backend del IFN.
     * 
     * @param {FormData} datosFormulario - Datos del formulario a enviar
     * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor
     */
    function enviarDatosAlServidor(datosFormulario) {
        return new Promise((resolve) => {
            // Simular tiempo de respuesta del servidor (1.5 segundos)
            setTimeout(() => {
                // Generar un ID único simulado para el registro
                const idUnico = 'ARB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                
                // Respuesta simulada del servidor
                const respuesta = {
                    success: true,
                    idRegistro: idUnico,
                    mensaje: 'Árbol registrado exitosamente',
                    timestamp: new Date().toISOString()
                };
                
                resolve(respuesta);
            }, 1500);
        });
    }
    
    /**
     * Prepara los datos del formulario para el envío
     * Recopila todos los campos y agrega metadatos adicionales
     * para trazabilidad y auditoría.
     * 
     * @returns {FormData} Objeto FormData con todos los campos del formulario
     */
    function prepararDatosFormulario() {
        const formData = new FormData(formulario);
        
        // Agregar metadatos adicionales para auditoría
        formData.append('timestamp', new Date().toISOString());
        formData.append('userAgent', navigator.userAgent);
        formData.append('screenResolution', `${screen.width}x${screen.height}`);
        
        return formData;
    }
    
    /**
     * Maneja el envío exitoso del formulario
     * Realiza las acciones necesarias después de una respuesta exitosa
     * del servidor, incluyendo feedback al usuario y limpieza del formulario.
     * 
     * @param {Object} respuesta - Respuesta del servidor con los datos del registro
     * @returns {void}
     */
    function manejarEnvioExitoso(respuesta) {
        // Mostrar mensaje de éxito con el ID generado
        alert(`${respuesta.mensaje}\nID del registro: ${respuesta.idRegistro}`);
        
        // Restaurar el estado del botón
        btnGuardar.innerHTML = 'Registrar Árbol';
        btnGuardar.disabled = false;
        
        // Limpiar el formulario
        formulario.reset();
        
        // Restablecer la fecha actual
        configurarFechaActual();
        
        // Registrar el éxito en la consola (para debugging)
        console.log('Registro exitoso:', respuesta);
    }
    
    /**
     * Maneja errores en el envío del formulario
     * Proporciona manejo de errores robusto y feedback al usuario
     * cuando ocurren problemas en la comunicación con el servidor.
     * 
     * @param {Error} error - Error ocurrido durante el envío
     * @returns {void}
     */
    function manejarErrorEnvio(error) {
        // Mostrar mensaje de error al usuario
        alert('Error al registrar el árbol. Por favor, intente nuevamente.');
        
        // Restaurar el estado del botón
        btnGuardar.innerHTML = 'Registrar Árbol';
        btnGuardar.disabled = false;
        
        // Registrar el error en la consola (para debugging)
        console.error('Error en el registro:', error);
    }
    
    /**
     * Maneja el evento de envío del formulario
     * Coordina todo el proceso de envío: validación, preparación de datos,
     * comunicación con el servidor y manejo de respuestas.
     * 
     * @param {Event} event - Evento de envío del formulario
     * @returns {Promise<void>}
     */
    async function manejarEnvioFormulario(event) {
        // Prevenir el envío tradicional del formulario
        event.preventDefault();
        
        console.log('Iniciando proceso de registro de árbol...');
        
        // Validar el formulario antes de proceder
        if (!validarFormularioCompleto()) {
            console.log('Validación del formulario fallida');
            return;
        }
        
        // Cambiar estado del botón para indicar procesamiento
        btnGuardar.innerHTML = 'Registrando... <i class="spinner"></i>';
        btnGuardar.disabled = true;
        
        try {
            // Preparar datos del formulario
            const datosFormulario = prepararDatosFormulario();
            
            // Enviar datos al servidor (simulado)
            const respuesta = await enviarDatosAlServidor(datosFormulario);
            
            // Manejar respuesta exitosa
            manejarEnvioExitoso(respuesta);
            
        } catch (error) {
            // Manejar errores
            manejarErrorEnvio(error);
        }
    }
    
    // =============================================
    // FUNCIONALIDAD DE LIMPIEZA DEL FORMULARIO
    // =============================================
    
    /**
     * Maneja la limpieza del formulario con confirmación del usuario
     * Implementa medidas de seguridad para prevenir pérdida accidental
     * de datos mediante confirmación explícita del usuario.
     * 
     * @returns {void}
     */
    function manejarLimpiezaFormulario() {
        // Verificar si el formulario tiene datos para evitar confirmaciones innecesarias
        const tieneDatos = Array.from(formulario.elements).some(element => {
            return (element.type !== 'submit' && element.type !== 'button' && element.value);
        });
        
        if (!tieneDatos) {
            alert('El formulario ya está vacío');
            return;
        }
        
        // Solicitar confirmación al usuario
        const confirmacion = confirm(
            '¿Está seguro de que desea limpiar todos los campos del formulario?\n\n' +
            'Se perderán todos los datos ingresados.'
        );
        
        if (confirmacion) {
            // Limpiar el formulario
            formulario.reset();
            
            // Restablecer la fecha actual
            configurarFechaActual();
            
            // Remover estilos de validación
            limpiarEstilosValidacion();
            
            console.log('Formulario limpiado exitosamente');
        }
    }
    
    // =============================================
    // SISTEMA DE VALIDACIÓN EN TIEMPO REAL
    // =============================================
    
    /**
     * Limpia todos los estilos de validación aplicados a los campos
     * Restaura la apariencia original de todos los campos del formulario
     * después de una limpieza o corrección de errores.
     * 
     * @returns {void}
     */
    function limpiarEstilosValidacion() {
        formulario.querySelectorAll('input, select, textarea').forEach(elemento => {
            elemento.style.borderColor = '';
            elemento.style.backgroundColor = '';
        });
    }
    
    /**
     * Aplica estilo de error a un campo específico
     * Proporciona feedback visual inmediato al usuario cuando
     * se detecta un error en un campo específico.
     * 
     * @param {HTMLElement} campo - Campo al que aplicar el estilo de error
     * @returns {void}
     */
    function aplicarEstiloError(campo) {
        campo.style.borderColor = '#f44336';
        campo.style.backgroundColor = '#ffebee';
    }
    
    /**
     * Remueve el estilo de error de un campo específico
     * Restaura la apariencia normal del campo cuando el error
     * ha sido corregido por el usuario.
     * 
     * @param {HTMLElement} campo - Campo al que remover el estilo de error
     * @returns {void}
     */
    function removerEstiloError(campo) {
        campo.style.borderColor = '';
        campo.style.backgroundColor = '';
    }
    
    /**
     * Valida un campo numérico en tiempo real y aplica estilos visuales
     * Se ejecuta cuando el usuario abandona un campo (evento blur) y
     * proporciona validación inmediata sin esperar al envío del formulario.
     * 
     * @param {Event} event - Evento blur del campo
     * @returns {void}
     */
    function validarCampoNumericoTiempoReal(event) {
        const campo = event.target;
        const valor = campo.value;
        
        // Si el campo está vacío, no aplicar validación
        if (!valor) {
            removerEstiloError(campo);
            return;
        }
        
        const valorNumerico = parseFloat(valor);
        
        // Validar según las restricciones min y max del campo
        const min = parseFloat(campo.min);
        const max = parseFloat(campo.max);
        
        let esValido = true;
        
        if (!isNaN(min) && valorNumerico < min) {
            esValido = false;
        }
        
        if (!isNaN(max) && valorNumerico > max) {
            esValido = false;
        }
        
        // Aplicar o remover estilos según la validación
        if (!esValido) {
            aplicarEstiloError(campo);
        } else {
            removerEstiloError(campo);
        }
    }
    
    /**
     * Configura la validación en tiempo real para todos los campos numéricos
     * Establece los event listeners necesarios para proporcionar
     * validación inmediata durante la interacción del usuario.
     * 
     * @returns {void}
     */
    function configurarValidacionTiempoReal() {
        const camposNumericos = formulario.querySelectorAll('input[type="number"]');
        
        camposNumericos.forEach(campo => {
            // Validar cuando el campo pierde el foco
            campo.addEventListener('blur', validarCampoNumericoTiempoReal);
            
            // También validar mientras se escribe (opcional, puede ser muy intrusivo)
            campo.addEventListener('input', function() {
                // Solo validar si el campo tiene un valor
                if (this.value) {
                    validarCampoNumericoTiempoReal({ target: this });
                } else {
                    removerEstiloError(this);
                }
            });
        });
    }
    
    // =============================================
    // FUNCIONALIDADES ADICIONALES Y CÁLCULOS
    // =============================================
    
    /**
     * Calcula el diámetro promedio si ambos diámetros están completos
     * Proporciona un cálculo automático que puede ser útil para
     * verificaciones de calidad de datos durante el ingreso.
     * 
     * @returns {void}
     */
    function calcularDiametroPromedio() {
        const diametro1 = document.getElementById('diametro1');
        const diametro2 = document.getElementById('diametro2');
        
        // Solo calcular si ambos campos tienen valores
        if (diametro1.value && diametro2.value) {
            const promedio = (parseFloat(diametro1.value) + parseFloat(diametro2.value)) / 2;
            
            // Podríamos mostrar este valor en algún lugar, por ejemplo en un tooltip o campo adicional
            console.log(`Diámetro promedio calculado: ${promedio.toFixed(2)} cm`);
            
            // Aquí podríamos agregar lógica para mostrar el promedio al usuario
            // Por ejemplo, actualizando un elemento en el DOM
        }
    }
    
    /**
     * Configura eventos para cálculos automáticos
     * Establece los event listeners necesarios para ejecutar
     * cálculos automáticos cuando el usuario ingresa datos.
     * 
     * @returns {void}
     */
    function configurarCalculosAutomaticos() {
        const diametro1 = document.getElementById('diametro1');
        const diametro2 = document.getElementById('diametro2');
        
        // Calcular promedio cuando ambos diámetros estén completos
        [diametro1, diametro2].forEach(campo => {
            campo.addEventListener('blur', calcularDiametroPromedio);
        });
    }
    
    // =============================================
    // INICIALIZACIÓN DE EVENT LISTENERS
    // =============================================
    
    /**
     * Configura todos los event listeners del formulario
     * Establece las conexiones entre los elementos de la interfaz
     * y las funciones de manejo correspondientes.
     * 
     * @returns {void}
     */
    function configurarEventListeners() {
        // Evento de envío del formulario
        formulario.addEventListener('submit', manejarEnvioFormulario);
        
        // Evento de limpieza del formulario
        btnLimpiar.addEventListener('click', manejarLimpiezaFormulario);
        
        // Validación en tiempo real
        configurarValidacionTiempoReal();
        
        // Cálculos automáticos
        configurarCalculosAutomaticos();
        
        // Prevenir que el formulario se envíe con Enter en campos individuales
        formulario.querySelectorAll('input').forEach(campo => {
            campo.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                }
            });
        });
        
        console.log('Event listeners configurados correctamente');
    }
    
    // =============================================
    // INICIALIZACIÓN PRINCIPAL DEL SISTEMA
    // =============================================
    
    /**
     * Función principal de inicialización
     * Orquesta todas las configuraciones necesarias para que
     * el formulario esté completamente operativo.
     * 
     * @returns {void}
     */
    function inicializar() {
        try {
            inicializarFormulario();
            configurarEventListeners();
            console.log('Sistema de registro de árbol completamente inicializado');
        } catch (error) {
            console.error('Error durante la inicialización:', error);
            alert('Error al inicializar el formulario. Por favor, recargue la página.');
        }
    }
    
    // Ejecutar inicialización cuando el DOM esté listo
    inicializar();
});