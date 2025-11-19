document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // VARIABLES GLOBALES Y REFERENCIAS A ELEMENTOS
    // =============================================
    
    // Referencia al formulario principal de suelo
    const formulario = document.getElementById('formularioSuelo');
    
    // Referencias a los botones de acción
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnSubir = document.getElementById('btnSubir');
    
    // Referencias a campos obligatorios para validaciones
    const campoConglomerado = document.getElementById('conglomerado');
    const campoDiligenciadoPor = document.getElementById('diligenciadoPor');
    const campoFechaMuestreo = document.getElementById('fechaMuestreo');
    
    // Referencia al input de archivos
    const campoArchivos = document.getElementById('archivos');
    
    // =============================================
    // CONFIGURACIÓN INICIAL DEL FORMULARIO
    // =============================================
    
    /**
     * Configura la fecha actual como valor por defecto en el campo fecha de muestreo
     * Facilita el registro al usuario mostrando la fecha actual automáticamente
     */
    function configurarFechaActual() {
        const hoy = new Date();
        const fechaFormateada = hoy.toISOString().split('T')[0];
        campoFechaMuestreo.value = fechaFormateada;
    }
    
    /**
     * Inicializa todas las configuraciones del formulario
     * Se ejecuta cuando el DOM está completamente cargado
     */
    function inicializarFormulario() {
        configurarFechaActual();
        console.log('Formulario de muestreo de suelo inicializado correctamente');
    }
    
    // =============================================
    // VALIDACIONES DEL FORMULARIO
    // =============================================
    
    /**
     * Valida los campos obligatorios del formulario
     * @returns {boolean} True si todos los campos obligatorios están completos, False si falta alguno
     */
    function validarCamposObligatorios() {
        const conglomeradoValor = campoConglomerado.value.trim();
        const diligenciadoPorValor = campoDiligenciadoPor.value.trim();
        const fechaMuestreoValor = campoFechaMuestreo.value;
        
        // Array para almacenar los nombres de los campos faltantes
        const camposFaltantes = [];
        
        if (!conglomeradoValor) camposFaltantes.push('ID Conglomerado');
        if (!diligenciadoPorValor) camposFaltantes.push('Diligenciado por');
        if (!fechaMuestreoValor) camposFaltantes.push('Fecha de Muestreo');
        
        // Si hay campos faltantes, mostrar alerta y retornar false
        if (camposFaltantes.length > 0) {
            const mensaje = `Por favor, complete los siguientes campos obligatorios:\n• ${camposFaltantes.join('\n• ')}`;
            alert(mensaje);
            return false;
        }
        
        return true;
    }
    
    /**
     * Valida que todos los valores de azimut estén dentro del rango permitido (0-360 grados)
     * @returns {boolean} True si todos los azimuts son válidos
     */
    function validarAzimuts() {
        const inputsAzimut = document.querySelectorAll('input[name^="azimut"]');
        let azimutValido = true;
        let primerAzimutInvalido = null;
        
        inputsAzimut.forEach(input => {
            if (input.value && (input.value < 0 || input.value > 360)) {
                azimutValido = false;
                aplicarEstiloError(input);
                if (!primerAzimutInvalido) {
                    primerAzimutInvalido = input;
                }
            } else {
                removerEstiloError(input);
            }
        });
        
        if (!azimutValido) {
            alert('Los valores de Azimut deben estar entre 0 y 360 grados');
            if (primerAzimutInvalido) {
                primerAzimutInvalido.focus();
            }
            return false;
        }
        
        return true;
    }
    
    /**
     * Valida que los valores de distancia no sean negativos
     * @returns {boolean} True si todas las distancias son válidas
     */
    function validarDistancias() {
        const inputsDistancia = document.querySelectorAll('input[name^="distancia"]');
        let distanciaValida = true;
        
        inputsDistancia.forEach(input => {
            if (input.value && parseFloat(input.value) < 0) {
                distanciaValida = false;
                aplicarEstiloError(input);
            } else {
                removerEstiloError(input);
            }
        });
        
        if (!distanciaValida) {
            alert('Los valores de Distancia no pueden ser negativos');
            return false;
        }
        
        return true;
    }
    
    /**
     * Valida que los valores de profundidad sean positivos
     * @returns {boolean} True si todas las profundidades son válidas
     */
    function validarProfundidades() {
        const inputsProfundidad = document.querySelectorAll('input[name^="profundidad"]');
        let profundidadValida = true;
        
        inputsProfundidad.forEach(input => {
            if (input.value && parseFloat(input.value) <= 0) {
                profundidadValida = false;
                aplicarEstiloError(input);
            } else {
                removerEstiloError(input);
            }
        });
        
        if (!profundidadValida) {
            alert('Los valores de Profundidad deben ser mayores a 0 cm');
            return false;
        }
        
        return true;
    }
    
    /**
     * Valida los archivos adjuntos (tamaño y tipo)
     * @returns {boolean} True si todos los archivos son válidos
     */
    function validarArchivos() {
        if (!campoArchivos.files.length) {
            return true; // No hay archivos, es válido
        }
        
        const archivos = campoArchivos.files;
        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                                'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const tamanoMaximo = 10 * 1024 * 1024; // 10MB en bytes
        
        for (let i = 0; i < archivos.length; i++) {
            const archivo = archivos[i];
            
            // Validar tipo de archivo
            if (!tiposPermitidos.includes(archivo.type)) {
                alert(`El archivo "${archivo.name}" no es de un tipo permitido.\nFormatos aceptados: PDF, JPG, PNG, DOC, DOCX`);
                return false;
            }
            
            // Validar tamaño del archivo
            if (archivo.size > tamanoMaximo) {
                alert(`El archivo "${archivo.name}" excede el tamaño máximo permitido de 10MB`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Valida que al menos un punto de muestreo tenga datos completos
     * @returns {boolean} True si al menos un punto tiene datos
     */
    function validarPuntosMuestreo() {
        const puntos = [1, 2, 3, 4];
        let puntosConDatos = 0;
        
        puntos.forEach(punto => {
            const azimut = document.querySelector(`input[name="azimut${punto}"]`).value;
            const distancia = document.querySelector(`input[name="distancia${punto}"]`).value;
            const profundidad = document.querySelector(`input[name="profundidad${punto}"]`).value;
            
            // Considerar un punto como válido si tiene al menos azimut y distancia
            if (azimut && distancia) {
                puntosConDatos++;
            }
        });
        
        if (puntosConDatos === 0) {
            alert('Debe completar al menos un punto de muestreo con Azimut y Distancia');
            return false;
        }
        
        console.log(`Puntos de muestreo con datos: ${puntosConDatos}`);
        return true;
    }
    
    /**
     * Validación completa del formulario antes del envío
     * @returns {boolean} True si el formulario es válido
     */
    function validarFormularioCompleto() {
        return validarCamposObligatorios() && 
               validarAzimuts() && 
               validarDistancias() && 
               validarProfundidades() && 
               validarArchivos() && 
               validarPuntosMuestreo();
    }
    
    // =============================================
    // MANEJO DEL ENVÍO DEL FORMULARIO
    // =============================================
    
    /**
     * Prepara los datos del formulario para el envío
     * Organiza la información de los puntos de muestreo en un formato estructurado
     * @returns {Object} Objeto con todos los datos del formulario estructurados
     */
    function prepararDatosFormulario() {
        const formData = new FormData();
        const datosEstructurados = {
            informacionGeneral: {
                conglomerado: campoConglomerado.value,
                diligenciadoPor: campoDiligenciadoPor.value,
                fechaMuestreo: campoFechaMuestreo.value,
                brigada: document.getElementById('brigada').value,
                observaciones: document.getElementById('observaciones').value
            },
            puntosMuestreo: {},
            archivos: campoArchivos.files,
            metadata: {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                totalPuntos: 4
            }
        };
        
        // Procesar datos de cada punto de muestreo
        for (let i = 1; i <= 4; i++) {
            datosEstructurados.puntosMuestreo[`punto${i}`] = {
                azimut: document.querySelector(`input[name="azimut${i}"]`).value,
                distancia: document.querySelector(`input[name="distancia${i}"]`).value,
                profundidad: document.querySelector(`input[name="profundidad${i}"]`).value,
                color: document.querySelector(`select[name="color${i}"]`).value,
                rocas: document.querySelector(`select[name="rocas${i}"]`).value,
                raices: document.querySelector(`select[name="raices${i}"]`).value,
                rangoFotos: document.querySelector(`input[name="rangoFotos${i}"]`).value,
                carbono: document.querySelector(`select[name="carbono${i}"]`).value,
                densidad: document.querySelector(`select[name="densidad${i}"]`).value,
                pesoFresco: document.querySelector(`input[name="pesoFresco${i}"]`).value,
                fertilidad: document.querySelector(`select[name="fertilidad${i}"]`).value
            };
        }
        
        // Agregar archivos al FormData
        for (let i = 0; i < campoArchivos.files.length; i++) {
            formData.append('archivos', campoArchivos.files[i]);
        }
        
        // Agregar datos estructurados como JSON
        formData.append('datosMuestreo', JSON.stringify(datosEstructurados));
        
        return { formData, datosEstructurados };
    }
    
    /**
     * Simula el envío de datos al servidor
     * En una implementación real, aquí iría una petición fetch o XMLHttpRequest
     * @param {Object} datos - Datos del formulario a enviar
     * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor
     */
    function enviarDatosAlServidor(datos) {
        return new Promise((resolve) => {
            // Simular tiempo de procesamiento (2 segundos)
            setTimeout(() => {
                // Generar un ID único simulado para el registro
                const idUnico = 'SUELO-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                
                // Contar puntos con datos completos
                const puntosCompletos = Object.values(datos.datosEstructurados.puntosMuestreo).filter(
                    punto => punto.azimut && punto.distancia && punto.profundidad
                ).length;
                
                // Respuesta simulada del servidor
                const respuesta = {
                    success: true,
                    idRegistro: idUnico,
                    mensaje: 'Muestras de suelo subidas exitosamente',
                    puntosProcesados: puntosCompletos,
                    archivosRecibidos: datos.datosEstructurados.archivos.length,
                    timestamp: new Date().toISOString()
                };
                
                resolve(respuesta);
            }, 2000);
        });
    }
    
    /**
     * Maneja el envío exitoso del formulario
     * @param {Object} respuesta - Respuesta del servidor
     */
    function manejarEnvioExitoso(respuesta) {
        // Mostrar mensaje de éxito detallado
        const mensajeExito = `
            ${respuesta.mensaje}
            
            Detalles del registro:
            • ID del registro: ${respuesta.idRegistro}
            • Puntos procesados: ${respuesta.puntosProcesados}
            • Archivos recibidos: ${respuesta.archivosRecibidos}
            • Fecha y hora: ${new Date(respuesta.timestamp).toLocaleString()}
        `;
        
        alert(mensajeExito.trim());
        
        // Restaurar el estado del botón
        btnSubir.innerHTML = 'Subir Muestras de Suelo';
        btnSubir.disabled = false;
        
        // Limpiar el formulario
        formulario.reset();
        
        // Restablecer la fecha actual
        configurarFechaActual();
        
        // Limpiar estilos de validación
        limpiarEstilosValidacion();
        
        // Registrar el éxito en la consola (para debugging)
        console.log('Registro de muestras de suelo exitoso:', respuesta);
    }
    
    /**
     * Maneja errores en el envío del formulario
     * @param {Error} error - Error ocurrido durante el envío
     */
    function manejarErrorEnvio(error) {
        // Mostrar mensaje de error al usuario
        alert('Error al subir las muestras de suelo. Por favor, intente nuevamente.\n\nSi el problema persiste, contacte al administrador del sistema.');
        
        // Restaurar el estado del botón
        btnSubir.innerHTML = 'Subir Muestras de Suelo';
        btnSubir.disabled = false;
        
        // Registrar el error en la consola (para debugging)
        console.error('Error en el registro de muestras de suelo:', error);
    }
    
    /**
     * Maneja el evento de envío del formulario
     * @param {Event} event - Evento de envío del formulario
     */
    async function manejarEnvioFormulario(event) {
        // Prevenir el envío tradicional del formulario
        event.preventDefault();
        
        console.log('Iniciando proceso de registro de muestras de suelo...');
        
        // Validar el formulario antes de proceder
        if (!validarFormularioCompleto()) {
            console.log('Validación del formulario fallida');
            return;
        }
        
        // Cambiar estado del botón para indicar procesamiento
        btnSubir.innerHTML = 'Subiendo... <i class="spinner"></i>';
        btnSubir.disabled = true;
        
        try {
            // Preparar datos del formulario
            const datosFormulario = prepararDatosFormulario();
            
            // Mostrar resumen de datos en consola (para debugging)
            console.log('Datos a enviar:', datosFormulario.datosEstructurados);
            
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
     * Limpia todos los estilos de validación aplicados a los campos
     */
    function limpiarEstilosValidacion() {
        formulario.querySelectorAll('input, select, textarea').forEach(elemento => {
            elemento.style.borderColor = '';
            elemento.style.backgroundColor = '';
        });
    }
    
    /**
     * Maneja la limpieza del formulario con confirmación del usuario
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
            'Se perderán todos los datos ingresados, incluyendo los puntos de muestreo y archivos seleccionados.'
        );
        
        if (confirmacion) {
            // Limpiar el formulario
            formulario.reset();
            
            // Restablecer la fecha actual
            configurarFechaActual();
            
            // Limpiar estilos de validación
            limpiarEstilosValidacion();
            
            console.log('Formulario de muestreo de suelo limpiado exitosamente');
        }
    }
    
    // =============================================
    // VALIDACIÓN EN TIEMPO REAL
    // =============================================
    
    /**
     * Aplica estilo de error a un campo específico
     * @param {HTMLElement} campo - Campo al que aplicar el estilo de error
     */
    function aplicarEstiloError(campo) {
        campo.style.borderColor = '#f44336';
        campo.style.backgroundColor = '#ffebee';
    }
    
    /**
     * Remueve el estilo de error de un campo específico
     * @param {HTMLElement} campo - Campo al que remover el estilo de error
     */
    function removerEstiloError(campo) {
        campo.style.borderColor = '';
        campo.style.backgroundColor = '';
    }
    
    /**
     * Valida un campo numérico en tiempo real y aplica estilos visuales
     * @param {Event} event - Evento blur del campo
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
        
        // Validaciones específicas por tipo de campo
        if (campo.name.includes('distancia') && valorNumerico < 0) {
            esValido = false;
        }
        
        if (campo.name.includes('profundidad') && valorNumerico <= 0) {
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
     */
    function configurarValidacionTiempoReal() {
        const camposNumericos = formulario.querySelectorAll('input[type="number"]');
        
        camposNumericos.forEach(campo => {
            // Validar cuando el campo pierde el foco
            campo.addEventListener('blur', validarCampoNumericoTiempoReal);
            
            // También validar mientras se escribe (para feedback inmediato)
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
    // FUNCIONALIDADES ADICIONALES
    // =============================================
    
    /**
     * Calcula y muestra estadísticas de los puntos de muestreo
     */
    function mostrarEstadisticasMuestreo() {
        const puntos = [1, 2, 3, 4];
        let puntosCompletos = 0;
        let puntosParciales = 0;
        let puntosVacios = 0;
        
        puntos.forEach(punto => {
            const azimut = document.querySelector(`input[name="azimut${punto}"]`).value;
            const distancia = document.querySelector(`input[name="distancia${punto}"]`).value;
            const profundidad = document.querySelector(`input[name="profundidad${punto}"]`).value;
            
            if (azimut && distancia && profundidad) {
                puntosCompletos++;
            } else if (azimut || distancia || profundidad) {
                puntosParciales++;
            } else {
                puntosVacios++;
            }
        });
        
        console.log(`Estadísticas de muestreo: Completos: ${puntosCompletos}, Parciales: ${puntosParciales}, Vacíos: ${puntosVacios}`);
        
        // Aquí podríamos mostrar estas estadísticas en la interfaz si fuera necesario
    }
    
    /**
     * Configura eventos para cálculos y estadísticas automáticas
     */
    function configurarCalculosAutomaticos() {
        // Agregar event listeners a campos clave para actualizar estadísticas
        const camposMuestreo = formulario.querySelectorAll('input[name^="azimut"], input[name^="distancia"], input[name^="profundidad"]');
        
        camposMuestreo.forEach(campo => {
            campo.addEventListener('blur', mostrarEstadisticasMuestreo);
        });
    }
    
    /**
     * Maneja la selección de archivos y muestra información al usuario
     */
    function configurarManejoArchivos() {
        campoArchivos.addEventListener('change', function() {
            const archivos = this.files;
            let tamanoTotal = 0;
            
            // Calcular tamaño total de los archivos
            for (let i = 0; i < archivos.length; i++) {
                tamanoTotal += archivos[i].size;
            }
            
            const tamanoTotalMB = (tamanoTotal / (1024 * 1024)).toFixed(2);
            
            console.log(`Archivos seleccionados: ${archivos.length}, Tamaño total: ${tamanoTotalMB} MB`);
            
            // Mostrar advertencia si el tamaño total es muy grande
            if (tamanoTotal > 20 * 1024 * 1024) { // 20MB
                alert(`Advertencia: El tamaño total de los archivos (${tamanoTotalMB} MB) es considerable.\nLa subida podría tomar más tiempo.`);
            }
        });
    }
    
    // =============================================
    // INICIALIZACIÓN DE EVENT LISTENERS
    // =============================================
    
    /**
     * Configura todos los event listeners del formulario
     */
    function configurarEventListeners() {
        // Evento de envío del formulario
        formulario.addEventListener('submit', manejarEnvioFormulario);
        
        // Evento de limpieza del formulario
        btnLimpiar.addEventListener('click', manejarLimpiezaFormulario);
        
        // Validación en tiempo real
        configurarValidacionTiempoReal();
        
        // Cálculos automáticos y estadísticas
        configurarCalculosAutomaticos();
        
        // Manejo de archivos
        configurarManejoArchivos();
        
        // Prevenir que el formulario se envíe con Enter en campos individuales
        formulario.querySelectorAll('input').forEach(campo => {
            campo.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                }
            });
        });
        
        console.log('Event listeners del formulario de suelo configurados correctamente');
    }
    
    // =============================================
    // INICIALIZACIÓN PRINCIPAL
    // =============================================
    
    /**
     * Función principal de inicialización
     * Orquesta todas las configuraciones necesarias
     */
    function inicializar() {
        try {
            inicializarFormulario();
            configurarEventListeners();
            console.log('Sistema de registro de muestras de suelo completamente inicializado');
        } catch (error) {
            console.error('Error durante la inicialización del formulario de suelo:', error);
            alert('Error al inicializar el formulario. Por favor, recargue la página.');
        }
    }
    
    // Ejecutar inicialización cuando el DOM esté listo
    inicializar();
});