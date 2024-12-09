const readerContainer = document.getElementById('reader-container');
const resultContainer = document.getElementById('result');
const statusImage = document.getElementById('status-image');
const statusMessage = document.getElementById('status-message');
const retryButton = document.getElementById('retry-button');

// URL de tu Google Apps Script (API para Google Sheets)
const googleScriptURL = "TU_URL_DEL_SCRIPT"; // Reemplaza con tu URL del Apps Script

// Lógica para reiniciar el escaneo
const restartScanning = () => {
    resultContainer.classList.add('hidden');
    readerContainer.style.display = 'block';
    startScanning();
};

// Configura el botón de reintento
retryButton.addEventListener('click', restartScanning);

// Callback cuando se escanea correctamente
const onScanSuccess = (decodedText) => {
    fetch(googleScriptURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: decodedText })
    })
    .then(response => response.json())
    .then(data => {
        // Mostrar resultados según la validación
        readerContainer.style.display = 'none';
        resultContainer.classList.remove('hidden');

        if (data.status === "success") {
            statusImage.src = 'https://via.placeholder.com/100/00FF00/FFFFFF?text=✔';
            statusMessage.innerText = "Acceso permitido";
        } else {
            statusImage.src = 'https://via.placeholder.com/100/FF0000/FFFFFF?text=✘';
            statusMessage.innerText = "Acceso denegado";
        }
    })
    .catch(error => {
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

const startScanning = () => {
    html5QrCode.start(
        { facingMode: "environment" }, // Usa la cámara trasera
        {
            fps: 10,
            qrbox: { width: 250, height: 250 } // Tamaño del cuadro de escaneo
        },
        onScanSuccess,
        onScanError
    ).catch(err => {
        console.error("No se pudo iniciar el lector:", err);
    });
};

// Inicia el proceso al cargar la página
startScanning();
