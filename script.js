// ===================================================
// VARIABLES GLOBALES
// ===================================================
let lastCameraId = null; // Última cámara seleccionada
const postUrl = "https://script.google.com/macros/s/AKfycbwmkizxXdEmsR-J3sTx2kW64eDYArw_iG59lGpcr-7qpPXngsaXsaLBplSXx4_eYg7xTw/exec"; // URL del Google Apps Script

let loggedInUserCode = null; // 🆕 Código de la persona que inició sesión
let validCodes = []; // Códigos QR válidos (Elementos/Inventario)
let validUserRoles = []; // 🆕 Códigos de acceso de usuarios (Roles)

let lastScannedCode = null;
let lastScanTime = 0;
let isScanningPaused = false; // Bandera para pausar el escaneo

// ===================================================
// 1. CARGA DE BASES DE DATOS
// ===================================================

// Función para cargar los códigos de acceso de usuarios desde roles.json (USA LA ESTRUCTURA DE ARRAY)
async function loadUserRoles() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/roles.json");
        validUserRoles = await response.json();
        console.log("Roles de usuario cargados:", validUserRoles);
    } catch (error) {
        console.error("Error al cargar los roles de usuario:", error);
        document.getElementById("result").innerText = "Error al cargar roles de usuario.";
        throw error;
    }
}

// Función para cargar la base de datos de elementos desde el CSV (Original)
async function loadDatabase() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv");
        const csvText = await response.text();
        validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code);
        document.getElementById("result").innerText = "Base de datos cargada correctamente.";
        console.log("Base de datos de elementos cargada:", validCodes);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

// ===================================================
// 2. LÓGICA DE AUTENTICACIÓN (PRE-PANTALLA)
// ===================================================

// 🆕 Función para manejar el intento de inicio de sesión
function handleLogin() {
    const userInput = document.getElementById('userCodeInput').value.trim();
    const resultContainer = document.getElementById("result");
    
    // Buscar si el código de entrada coincide con la propiedad "code" en el array
    const userFound = validUserRoles.find(user => user.code.trim() === userInput);

    if (userFound) {
        loggedInUserCode = userFound.code; // Guarda el código de la llave/usuario
        
        // 1. Ocultar la interfaz de login y mostrar la de escáner
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('scanner-container').style.display = 'block';

        // 2. Iniciar el escáner
        getBackCameraId()
            .then((cameraId) => {
                startScanner(cameraId);
                resultContainer.innerText = `Acceso concedido para ${userFound.nombre} (${loggedInUserCode}). Escáner listo.`;
            })
            .catch((error) => {
                console.error("Error al obtener la cámara trasera:", error);
                resultContainer.innerText = "Error al acceder a la cámara. Verifica los permisos.";
            });

    } else {
        resultContainer.innerText = "Código de acceso incorrecto. Inténtalo de nuevo.";
        document.getElementById('userCodeInput').value = ''; 
    }
}

// ===================================================
// 3. LÓGICA DE ENVÍO Y ESCANEO
// ===================================================

// Función para enviar datos a Google Sheets (MODIFICADA)
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
            userCode: loggedInUserCode, // 🆕 NUEVO CAMPO: Código del usuario que escaneó
        }),
    })
    .then(() => {
        console.log(`Registro enviado a Google Sheets por usuario ${loggedInUserCode}.`);
    })
    .catch((error) => {
        console.error("Error al enviar la solicitud:", error);
    });
}

// Manejar el resultado exitoso del escaneo (onScanSuccess - Lógica original, llama a la versión modificada de sendToGoogleSheets)
function onScanSuccess(decodedText) {
    if (isScanningPaused) {
        console.log("Escaneo pausado. Esperando acción del usuario.");
        return;
    }

    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");
    const currentTime = new Date().getTime();
    const timestamp = new Date().toISOString(); 

    // Evitar duplicados
    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
        console.log("Código duplicado detectado. Ignorando.");
        return;
    }

    isScanningPaused = true;
    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    const normalizedText = decodedText.trim();
    const normalizedValidCodes = validCodes.map(code => code.trim());

    if (normalizedValidCodes.includes(normalizedText)) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Acceso Permitido<br>
            <button id="continueButton" style="font-size: 24px; padding: 20px 40px; margin-top: 10px;">Registrado > Seguir</button>
        `;

        sendToGoogleSheets(decodedText, "Permitido", timestamp);

        document.getElementById("continueButton").addEventListener("click", () => {
            lastScannedCode = null;
            lastScanTime = 0;
            validationImage.style.display = "none";
            resultContainer.innerHTML = "";
            isScanningPaused = false;
            restartScanner();
        });
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Acceso Denegado. Quitar de la fila...
        `;
        
        sendToGoogleSheets(decodedText, "Denegado", timestamp); 

        setTimeout(() => {
            lastScannedCode = null;
            lastScanTime = 0;
            validationImage.style.display = "none";
            resultContainer.innerHTML = "";
            isScanningPaused = false;
            restartScanner();
        }, 5000);
    }
}

// Manejar errores durante el escaneo (Original)
function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

// Función para iniciar el escaneo con una cámara específica (Original)
function startScanner(cameraId) {
    const html5Qrcode = new Html5Qrcode("reader");
    html5Qrcode
        .start(
            cameraId,
            { fps: 15, qrbox: { width: 125, height: 125 } },
            onScanSuccess,
            onScanError
        )
        .then(() => {
            lastCameraId = cameraId;
        })
        .catch((error) => {
            console.error("Error al iniciar el escaneo:", error);
        });
}

// Función para reiniciar el escáner QR (Original)
function restartScanner() {
    document.getElementById("result").innerText = "Por favor, escanea un código QR...";
    document.getElementById("validation-image").style.display = "none";

    if (lastCameraId) {
        startScanner(lastCameraId);
    } else {
        getBackCameraId().then(startScanner).catch((error) => {
            console.error("Error al obtener la cámara trasera:", error);
        });
    }
}

// Función para obtener la cámara trasera automáticamente (Original)
function getBackCameraId() {
    return Html5Qrcode.getCameras().then((cameras) => {
        if (cameras && cameras.length > 0) {
            const backCamera = cameras.find((camera) =>
                camera.label.toLowerCase().includes("back")
            );
            return backCamera ? backCamera.id : cameras[0].id;
        } else {
            throw new Error("No se encontraron cámaras disponibles.");
        }
    });
}

// ===================================================
// 4. INICIALIZACIÓN (MODIFICADA)
// ===================================================

// Inicializar la aplicación: cargar datos y mostrar la pantalla de login
Promise.all([loadDatabase(), loadUserRoles()])
    .then(() => {
        document.getElementById("result").innerText = "Bases de datos cargadas. Ingresa tu código de acceso para continuar.";
        
        // Configurar los listeners del formulario de login (DEBE EXISTIR EN EL HTML)
        document.getElementById('loginButton').addEventListener('click', handleLogin);
        
        // Permitir inicio de sesión con Enter (DEBE EXISTIR EN EL HTML)
        document.getElementById('userCodeInput').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                handleLogin();
            }
        });
    })
    .catch((error) => {
        console.error("Fallo la inicialización de la aplicación:", error);
        document.getElementById("result").innerText = "ERROR FATAL: No se pudieron cargar los datos esenciales. Verifique la conexión y roles.json";
    });
