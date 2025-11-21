// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// URL del Google Apps Script
const postUrl = "https://script.google.com/macros/s/AKfycbwmkizxXdEmsR-J3sTx2kW64eDYArw_iG59lGpcr-7qpPXngsaXsaLBplSXx4_eYg7xTw/exec";

// 🆕 MODIFICACIÓN: Variable para almacenar el código del usuario que ha iniciado sesión
let loggedInUserCode = null;

// Variable para almacenar la base de datos cargada (Códigos de Elementos)
let validCodes = [];

// 🆕 MODIFICACIÓN: Variable para almacenar los códigos de usuario (Roles)
let validUserRoles = [];

// Variable para evitar duplicados
let lastScannedCode = null;
let lastScanTime = 0;

// Función para cargar la base de datos desde el CSV (Sin cambios)
async function loadDatabase() { /* ... */ }

// 🆕 MODIFICACIÓN: Función para cargar los códigos de acceso de usuarios desde roles.json
async function loadUserRoles() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/roles.json");
        validUserRoles = await response.json();
        console.log("Roles de usuario cargados:", validUserRoles);
    } catch (error) {
        console.error("Error al cargar los roles de usuario:", error);
        document.getElementById("result").innerText = "Error al cargar los roles de usuario.";
        throw error;
    }
}

// Función para enviar datos de entradas a Google Sheets (Modificada)
function sendToGoogleSheets(qrCode, result, timestamp) {
    fetch(postUrl, {
        method: "POST",
        mode: "no-cors", 
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            operation: "entrada",
            qrCode: qrCode,
            result: result,
            timestamp: timestamp,
            userCode: loggedInUserCode, // 🆕 MODIFICACIÓN: Nuevo campo enviado
        }),
    })
    .then(() => { /* ... */ })
    .catch((error) => { /* ... */ });
}

// Manejar el resultado exitoso del escaneo (onScanSuccess - Sin cambios funcionales, solo llama a la versión modificada de sendToGoogleSheets)
function onScanSuccess(decodedText) { /* ... */ }

// Manejar errores durante el escaneo (onScanError - Sin cambios)
function onScanError(errorMessage) { /* ... */ }

// Función para iniciar el escaneo con una cámara específica (startScanner - Sin cambios)
function startScanner(cameraId) { /* ... */ }

// Función para reiniciar el escáner QR (restartScanner - Sin cambios)
function restartScanner() { /* ... */ }

// Función para obtener la cámara trasera automáticamente (getBackCameraId - Sin cambios)
function getBackCameraId() { /* ... */ }


// 🆕 MODIFICACIÓN: Función de Autenticación
function handleLogin() {
    const userInput = document.getElementById('userCodeInput').value.trim();
    const resultContainer = document.getElementById("result");
    
    const roleCodes = validUserRoles.map(role => role.code.trim()); // Asume roles.json es [{code: "X"}, ...]

    if (roleCodes.includes(userInput)) {
        loggedInUserCode = userInput;
        
        // Ocultar login y mostrar escáner (REQUIERE MODIFICAR EL HTML)
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('scanner-container').style.display = 'block';

        getBackCameraId()
            .then(startScanner)
            .catch((error) => {
                 resultContainer.innerText = "Error al acceder a la cámara. Verifica los permisos.";
            });

    } else {
        resultContainer.innerText = "Código de acceso incorrecto. Inténtalo de nuevo.";
        document.getElementById('userCodeInput').value = ''; 
    }
}

// 🆕 MODIFICACIÓN: Inicializar la aplicación (Cargar ambas bases y configurar Login)
Promise.all([loadDatabase(), loadUserRoles()])
    .then(() => {
        document.getElementById("result").innerText = "Bases de datos cargadas. Ingresa tu código de acceso para continuar.";
        
        // Configurar los listeners del formulario de login (REQUIERE MODIFICAR EL HTML)
        document.getElementById('loginButton').addEventListener('click', handleLogin);
        document.getElementById('userCodeInput').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                handleLogin();
            }
        });
    })
    .catch((error) => {
        console.error("Fallo la inicialización de la aplicación:", error);
        document.getElementById("result").innerText = "ERROR FATAL: No se pudieron cargar los datos esenciales.";
    });
