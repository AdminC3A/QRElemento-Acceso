// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// Base de datos simulada de códigos permitidos
const validCodes = ["A7DhWBBm", "67890", "abcde"]; // Ejemplo de códigos válidos

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

    const validationImage = document.getElementById("validation-image");

    if (validCodes.includes(decodedText)) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
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
            { fps: 10, qrbox: { width: 125, height: 125 } },
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

// Inicializar el escáner QR con la cámara trasera automáticamente
getBackCameraId()
    .then((cameraId) => {
        startScanner(cameraId);
    })
    .catch((error) => {
        console.error("Error al obtener la cámara trasera:", error);
        document.getElementById("result").innerText =
            "Error al acceder a la cámara. Verifica los permisos.";
    });
