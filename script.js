// Variables globales
let lastCameraId = null;
let database = [];
const csvUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/refs/heads/main/data/base_de_datos.csv";

// Función para cargar la base de datos desde GitHub
async function loadDatabase() {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();

        // Procesar el contenido del archivo CSV
        const rows = csvText.split("\n").slice(1); // Saltar encabezados
        database = rows.map(row => {
            const [CodigoQR, Nombre, Empresa, Puesto] = row.split(",");
            return {
                CodigoQR: CodigoQR?.trim(),
                Nombre: Nombre?.trim(),
                Empresa: Empresa?.trim(),
                Puesto: Puesto?.trim(),
            };
        });

        // Mostrar mensaje de éxito
        console.log("Base de datos cargada:", database);
        document.getElementById("result").innerText = "Base de datos cargada correctamente.";
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

// Función para obtener la última fecha de modificación del archivo CSV
async function getLastModified() {
    const repoUrl = "https://api.github.com/repos/AdminC3A/QRElemento/commits?path=data/base_de_datos.csv";

    try {
        const response = await fetch(repoUrl);
        const commits = await response.json();
        const lastCommit = commits[0];
        const lastModified = new Date(lastCommit.commit.committer.date);

        document.getElementById("last-modified").innerText = `Última modificación: ${lastModified.toLocaleString()}`;
    } catch (error) {
        console.error("Error al obtener la fecha de modificación:", error);
    }
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

    const validationImage = document.getElementById("validation-image");

    // Validar el código QR escaneado
    const match = database.find(entry => entry.CodigoQR === decodedText);

    if (match) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = `Acceso permitido: ${match.Nombre}, ${match.Empresa}, ${match.Puesto}`;
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = "Acceso denegado.";
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
(async function initApp() {
    await loadDatabase(); // Cargar la base de datos
    await getLastModified(); // Obtener la última fecha de modificación

    getBackCameraId()
        .then((cameraId) => {
            startScanner(cameraId);
        })
        .catch((error) => {
            console.error("Error al obtener la cámara trasera:", error);
            document.getElementById("result").innerText =
                "Error al acceder a la cámara. Verifica los permisos.";
        });
})();
