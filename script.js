const readerContainer = document.getElementById('reader-container');
const resultContainer = document.getElementById('result');
const statusImage = document.getElementById('status-image');
const statusMessage = document.getElementById('status-message');
const retryButton = document.getElementById('retry-button');

// URL de tu Google Apps Script (API para Google Sheets)
const googleScriptURL = "TU_URL_DEL_SCRIPT"; // Reemplázala con la URL del despliegue

// Lógica para reiniciar el escaneo
const restartScanning = () => {
    resultContainer.classList.add('hidden');
    readerContainer.style.display = 'block';
    startScanning();
};

// Configura el botón de reintento
retryButton.addEventListener('click', restartScanning);

// Callback cuando se escanea correctamente
const onScanSuccess = (decodedText, decodedResult) => {
    readerContainer.style.display = 'none';
    resultContainer.classList.remove('hidden');

    if (decodedText) {
        statusImage.src = 'https://via.placeholder.com/100/00FF00/FFFFFF?text=✔'; // Palomita verde
        statusMessage.innerText = `Código leído: ${decodedText}`;
        sendToGoogleSheets(decodedText); // Enviar a Google Sheets
    } else {
        statusImage.src = 'https://via.placeholder.com/100/FF0000/FFFFFF?text=✘'; // X roja
        statusMessage.innerText = `Código no válido`;
    }
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

// Enviar datos a Google Sheets
const sendToGoogleSheets = (qrCode) => {
    const data = { qrCode }; // Datos que enviaremos
    fetch(googleScriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            console.log("Datos enviados a Google Sheets");
        } else {
            console.error("Error al enviar datos a Google Sheets");
        }
    })
    .catch(error => {
        console.error("Error en la solicitud: ", error);
    });
};

// Inicia el proceso al cargar la página
startScanning();
