// URL de la base de datos CSV alojada en GitHub
const csvUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";
let database = []; // Variable global para almacenar los datos procesados

// Función para cargar la base de datos desde el archivo CSV
function loadDatabase() {
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar la base de datos.");
            }
            return response.text(); // Obtener el contenido del archivo CSV como texto
        })
        .then(csvData => {
            // Procesar el archivo CSV
            const rows = csvData.split("\n").slice(1); // Saltar la fila de encabezados
            database = rows.map(row => {
                const [CodigoQR, Nombre, Compañia, Puesto] = row.split(",");
                return {
                    CodigoQR: CodigoQR.trim(),
                    Nombre: Nombre.trim(),
                    Compañia: Compañia.trim(),
                    Puesto: Puesto.trim()
                };
            });

            console.log("Base de datos cargada:", database); // Verificar los datos cargados
        })
        .catch(error => {
            console.error("Error al cargar la base de datos:", error);
            document.getElementById("result").innerText = "Error al cargar la base de datos.";
        });
}

// Función para manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
    const validationImage = document.getElementById("validation-image");
    document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

    // Buscar el código QR en la base de datos
    const record = database.find(entry => entry.CodigoQR === decodedText.trim());

    if (record) {
        // Código encontrado: Mostrar información
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = `
            Acceso Permitido\n
            Nombre: ${record.Nombre}\n
            Compañía: ${record.Compañia}\n
            Puesto: ${record.Puesto}
        `;
    } else {
        // Código no encontrado
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = "Acceso Denegado. Código no válido.";
    }

    // Ocultar la imagen después de 5 segundos
    setTimeout(() => {
        validationImage.style.display = "none";
    }, 5000);
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo: ", errorMessage);
}

// Función para iniciar el escaneo con una cámara específica
function startScanner(cameraId) {
    const html5Qrcode = new Html5Qrcode("reader");

    html5Qrcode
        .start(
            cameraId,
            {
                fps: 10,
                qrbox: { width: 125, height: 125 },
            },
            onScanSuccess,
            onScanError
        )
        .then(() => {
            console.log("Escaneo iniciado con éxito.");
        })
        .catch((error) => {
            console.error("Error al iniciar el escaneo: ", error);
        });
}

// Inicializar el lector QR al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadDatabase(); // Cargar la base de datos

    // Obtener la cámara trasera automáticamente y comenzar a escanear
    Html5Qrcode.getCameras()
        .then(cameras => {
            if (cameras && cameras.length > 0) {
                const backCamera = cameras.find(camera =>
                    camera.label.toLowerCase().includes("back")
                );
                const cameraId = backCamera ? backCamera.id : cameras[0].id;
                startScanner(cameraId);
            } else {
                throw new Error("No se encontraron cámaras disponibles.");
            }
        })
        .catch(error => {
            console.error("Error al obtener la cámara:", error);
            document.getElementById("result").innerText =
                "Error al acceder a la cámara. Verifica los permisos.";
        });
});
