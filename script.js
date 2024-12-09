// Elementos del DOM
const readerContainer = document.getElementById('reader-container');
const resultContainer = document.getElementById('result');
const statusImage = document.getElementById('status-image');
const statusMessage = document.getElementById('status-message');
const retryButton = document.getElementById('retry-button');

// URL de tu Google Apps Script (API para Google Sheets)
const googleScriptURL = "https://script.google.com/macros/s/AKfycbya3JTzPfw2ZP7ocOeDSlcHMGldMvr2JG-rOCah7ck-bixZieqBcUwmDojimv30pXYn/exec";

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
                statusImage.src = './images/permitido.png'; // Ruta local para la imagen de éxito
                statusMessage.innerText = "Acceso permitido";
            } else {
                statusImage.src = './images/denegado.png'; // Ruta local para la imagen de error
                statusMessage.innerText = "Acceso denegado";
            }
        })
        .catch(error => {
            // Error al contactar la API
            console.error("Error al contactar la API:", error);
            statusImage.src = './images/denegado.png'; // Imagen de error general
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
