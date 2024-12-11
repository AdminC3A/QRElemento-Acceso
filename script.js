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

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

    const validationImage = document.getElementById("validation-image");

    if (validCodes.includes(decodedText)) {
    validationImage.src = "images/Permitido.png";
    validationImage.style.display = "block";
    document.getElementById("result").innerText += " - Acceso Permitido";

    // Registrar el acceso en Google Sheets
    fetch("https://script.google.com/a/macros/casatresaguas.com/s/AKfycbwPXyC5Uzr7SSVHqY9mCo6a4oFkMSoMQSBc__SBzX2s4afGyHbLpE_2r7NUOow5kqAw/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            qrCode: decodedText,
            result: "Permitido",
            timestamp: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Registro guardado correctamente en Google Sheets.");
        } else {
            console.error("Error al guardar el registro en Google Sheets:", data.error);
        }
    })
    .catch(error => {
        console.error("Error al conectar con Google Sheets:", error);
    });
}
 else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText += " - Acceso Denegado";
    }

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
