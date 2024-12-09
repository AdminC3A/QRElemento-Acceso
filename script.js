// Elementos del DOM
const readerContainer = document.getElementById('reader-container');
const resultContainer = document.getElementById('result');
const statusImage = document.getElementById('status-image');
const statusMessage = document.getElementById('status-message');
const retryButton = document.getElementById('retry-button');

// URL de tu Google Apps Script (API para Google Sheets)
const googleScriptURL = "TU_URL_DEL_SCRIPT"; // Reemplaza con tu URL del Apps Script

// Lógica para reiniciar el escaneo
const restartScanning = () => {
    resultContainer.classList.add('hidden'); // Oculta el resultado
    readerContainer.style.display = 'block'; // Muestra el lector QR
    startScanning(); // Reinicia el proceso de escaneo
};

// Configura el botón de reintento
retryButton.addEventListener('click', restartScanning);

// Callback cuando se escanea correctamente
const onScanSuccess = (decodedText) => {
    console.log(`Código escaneado: ${decodedText}`); // Log para depuración

    // Envía el código QR a Google Apps Script
    fetch(googleScriptURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: decodedText }) // Envía el código QR
    })
        .then(response => response.json())
        .then(data => {
            // Mostrar resultados según la validación
            readerContainer.style.display = 'none'; // Oculta el lector QR
            resultContainer.classList.remove('hidden'); // Muestra el contenedor de resultado

            if (data.status === "success") {
                // Acceso permitido
                statusImage.src = 'https://via.placeholder.com/100/00FF00/FFFFFF?text=✔';
                statusMessage.innerText = "Acceso permitido";
            } else {
                // Acceso denegado
                statusImage.src = 'https://via.placeholder.com/100/FF0000/FFFFFF?text=✘';
                statusMessage.innerText = "Acceso denegado";
            }
        })
        .catch(error => {
            // Error al contactar la API
            console.error("Error al contactar la API:", error);
            statusImage.src = 'https://via.placeholder.com/100/FF0000/FFFFFF?text=✘';
            statusMessage.innerText = "Error en el sistema";
        });
};

// Callback para errores
const onScanError = (errorMessage) => {
    console.error(`Error al escanear: ${errorMessage}`);
};

// Inicializa el lector de QR
const html5QrCode = new Html5Qrcode("reader");

// Lógica para iniciar el lector QR
const startScanning = () => {
    html5QrCode.start(
        { facingMode: "environment" }, // Usa la cámara trasera
        {
            fps: 10,
            qrbox: { width: 250, height: 250 } // Tamaño del cuadro de escaneo
        },
        onScanSuccess, // Callback para éxito
        onScanError // Callback para errores
    ).catch(err => {
        console.error("No se pudo iniciar el lector:", err);
    });
};

// Inicia el proceso al cargar la página
startScanning();
