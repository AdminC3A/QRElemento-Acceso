const csvUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv"; // URL actualizada
let database = [];

// Cargar la base de datos CSV
async function loadDatabase() {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const csvData = await response.text();

        // Procesar el CSV
        const rows = csvData.split("\n").slice(1); // Saltar la fila de encabezados
        database = rows.map(row => {
            const [CodigoQR, Nombre, Compañia, Puesto] = row.split(",");
            return { CodigoQR: CodigoQR.trim(), Nombre, Compañia, Puesto };
        });

        console.log("Base de datos cargada:", database);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
    const validationImage = document.getElementById("validation-image");

    // Buscar el código en la base de datos
    const entry = database.find(item => item.CodigoQR === decodedText);

    if (entry) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = `Acceso Permitido\nNombre: ${entry.Nombre}\nCompañía: ${entry.Compañia}\nPuesto: ${entry.Puesto}`;
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = "Acceso Denegado. Código no válido.";
    }

    setTimeout(() => {
        validationImage.style.display = "none";
    }, 5000);
}


// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo: ", errorMessage);
}

// Inicializar el escáner QR
function initScanner() {
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 }
    );
    html5QrcodeScanner.render(onScanSuccess, onScanError);
}

// Función para reiniciar el escáner
function restartScanner() {
    document.getElementById("result").innerText = "Por favor, escanea un código QR...";
    document.getElementById("status-image").style.display = "none";
    initScanner();
}

// Cargar la base de datos y inicializar el escáner
loadDatabase()
    .then(initScanner)
    .catch(error => {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    });
loadDatabase();
