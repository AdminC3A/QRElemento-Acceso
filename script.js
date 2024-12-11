// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// URL de la base de datos CSV alojada en GitHub
const csvUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";

// Variable para almacenar la base de datos cargada
let validCodes = [];

// Función para cargar la base de datos desde el CSV
async function loadDatabase() {
    try {
        const response = await fetch(csvUrl);
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

// Función para enviar datos a Google Sheets
function sendToGoogleSheets(qrCode, result) {
    fetch("https://script.google.com/macros/s/AKfycbxt4f9rXduGzVrxXbdGXTpOif-EOcAmyf21AD6h20FlDvh-foSxUEtXbzJTAITXtRL3/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            qrCode: qrCode,
            result: result,
            timestamp: new Date().toISOString(),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log("Registro guardado correctamente en Google Sheets.");
            } else {
                console.error("Error al guardar el registro en Google Sheets:", data.error);
            }
        })
        .catch((error) => {
            console.error("Error al conectar con Google Sheets:", error);
        });
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    const validationImage = document.getElementById("validation-image");

    if (validCodes.includes(decodedText)) {
        // Mostrar la imagen de "Permitido"
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = `Código detectado: ${decodedText} - Acceso Permitido`;

        // Después de un pequeño retraso, enviar los datos a Google Sheets
        setTimeout(() => {
            sendToGoogleSheets(decodedText, "Permitido");
        }, 500); // Retraso de 500ms para asegurar que la imagen se muestre primero
    } else {
        // Mostrar la imagen de "Denegado"
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = `Código detectado: ${decodedText} - Acceso Denegado`;
    }

    // Ocultar la imagen después de 5 segundos
    setTimeout(() => {
        validationImage.style.display = "none";
    }, 5000);
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
