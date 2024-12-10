// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// URL de la base de datos CSV alojada en GitHub
const csvUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";

// Variable para almacenar la base de datos cargada
let validCodes = [];

// Cargar la base de datos desde el CSV
function loadDatabase() {
    return fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar la base de datos.");
            }
            return response.text();
        })
        .then(csvText => {
            const rows = csvText.split("\n").slice(1); // Saltar encabezados
            validCodes = rows.map(row => {
                const [CodigoQR] = row.split(",");
                return CodigoQR.trim();
            }).filter(code => code); // Filtrar valores vacíos
            console.log("Base de datos cargada:", validCodes);
        })
        .catch(error => {
            console.error("Error al cargar la base de datos:", error);
            document.getElementById("result").innerText = "Error al cargar la base de datos.";
        });
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

    const validationImage = document.getElementById("validation-image");

    if (validCodes.includes(decodedText)) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText += " - Acceso Permitido";
    } else {
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
