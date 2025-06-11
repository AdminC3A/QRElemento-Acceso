// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// URL del Google Apps Script
const postUrl = "https://script.google.com/macros/s/AKfycbyhUmq46i4iMUzT_HeC2oQhogBBHkC-XxZRzz974dq4ywOEGdKB39tmSDqouv1Z0JB9/exec";

// Variable para almacenar la base de datos cargada
let validCodes = [];

// Variable para evitar duplicados
let lastScannedCode = null;
let lastScanTime = 0;

// Función para cargar la base de datos desde el CSV
async function loadDatabase() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv");
        const csvText = await response.text();

        // Procesar el contenido del archivo CSV
        validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code); // Filtrar valores vacíos
        document.getElementById("result").innerText = "Base de datos cargada correctamente.";
        console.log("Base de datos cargada:", validCodes);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

// Función para enviar datos de entradas a Google Sheets
function sendToGoogleSheets(qrCode, result, timestamp) {
    const payload = {
        operation: "entrada", // o "salida" si es el caso
        qrCode: qrCode,
        result: result,
        timestamp: timestamp,
    };

    console.log("Enviando datos a Google Sheets:", payload); // 👈🏻 Este log es clave
    fetch(postUrl, {
        method: "POST",
        mode: "no-cors", // Permitir envío sin verificar la respuesta
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            operation: "entrada", // Operación específica para entradas
            qrCode: qrCode,
            result: result,
            timestamp: timestamp,
        }),
    })
    .then(() => {
        console.log("Registro enviado a Google Sheets.");
    })
    .catch((error) => {
        console.error("Error al enviar la solicitud:", error);
    });
}

// Manejar el resultado exitoso del escaneo
let isScanningPaused = false; // Bandera para pausar el escaneo

function onScanSuccess(decodedText) {
    if (isScanningPaused) {
        console.log("Escaneo pausado. Esperando acción del usuario.");
        return;
    }

    const validationImage = document.getElementById("validation-image");
    const resultContainer = document.getElementById("result");
    const currentTime = new Date().getTime();
    const timestamp = new Date().toISOString(); // Obtener el timestamp actual

    // Evitar duplicados: Verificar si el código ya fue escaneado recientemente
    if (decodedText === lastScannedCode && currentTime - lastScanTime < 5000) {
        console.log("Código duplicado detectado. Ignorando.");
        return;
    }

    // Pausar el escaneo
    isScanningPaused = true;

    // Actualizar el último código y la hora del escaneo
    lastScannedCode = decodedText;
    lastScanTime = currentTime;

    // Normalizar valores para evitar problemas de formato
    const normalizedText = decodedText.trim();
    const normalizedValidCodes = validCodes.map(code => code.trim());

    if (normalizedValidCodes.includes(normalizedText)) {
        // Mostrar imagen de acceso permitido
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Acceso Permitido<br>
            <button id="continueButton" style="font-size: 24px; padding: 20px 40px; margin-top: 10px;">Registrado > Seguir</button>
        `;

        // Enviar datos a Google Sheets
        sendToGoogleSheets(decodedText, "Permitido", timestamp);

        // Agregar evento para reanudar el escaneo
        document.getElementById("continueButton").addEventListener("click", () => {
            // Limpiar variables del último escaneo
            lastScannedCode = null;
            lastScanTime = 0;

            validationImage.style.display = "none"; // Ocultar la imagen
            resultContainer.innerHTML = ""; // Limpiar el resultado
            isScanningPaused = false; // Reanudar el escaneo
            restartScanner(); // Reiniciar el escáner
        });
    } else {
        // Mostrar imagen de acceso denegado
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";

        resultContainer.innerHTML = `
            Código detectado: ${decodedText} - Acceso Denegado. Quitar de la fila...
        `;

        // Esperar 11 segundos antes de reanudar el escaneo
        setTimeout(() => {
            // Limpiar variables del último escaneo
            lastScannedCode = null;
            lastScanTime = 0;

            validationImage.style.display = "none"; // Ocultar la imagen
            resultContainer.innerHTML = ""; // Limpiar el resultado
            isScanningPaused = false; // Reanudar el escaneo
            restartScanner(); // Reiniciar el escáner
        }, 5000);
    }
}


// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

// Función para iniciar el escaneo con una cámara específica
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

// Función para reiniciar el escáner QR
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

// Función para obtener la cámara trasera automáticamente
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

// Inicializar la aplicación
loadDatabase().then(() => {
    getBackCameraId()
        .then((cameraId) => {
            startScanner(cameraId);
        })
        .catch((error) => {
            console.error("Error al obtener la cámara trasera:", error);
            document.getElementById("result").innerText =
                "Error al acceder a la cámara. Verifica los permisos.";
        });
});
