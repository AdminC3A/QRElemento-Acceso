// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null; // Almacena el ID de la última cámara seleccionada

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  // Mostrar el código escaneado en el elemento 'result'
  document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

  // Detener el escaneo y liberar la cámara
  html5QrcodeScanner.clear().then(() => {
    console.log("Escaneo detenido.");
    // Habilitar el botón de reinicio
    document.getElementById("retry").style.display = "block";
  }).catch((error) => {
    console.error("Error al detener el escaneo:", error);
  });
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
        qrbox: { width: 250, height: 250 },
      },
      onScanSuccess,
      onScanError
    )
    .then(() => {
      lastCameraId = cameraId; // Guardar el ID de la cámara seleccionada
    })
    .catch((error) => {
      console.error("Error al iniciar el escaneo: ", error);
    });
}

// Función para reiniciar el escáner QR
function restartScanner() {
  document.getElementById("result").innerText = "Por favor, escanea un código QR...";
  document.getElementById("retry").style.display = "none"; // Ocultar el botón de reinicio

  // Si ya se seleccionó una cámara previamente, usarla
  if (lastCameraId) {
    startScanner(lastCameraId);
  } else {
    // Si no hay una cámara seleccionada, renderizar el escáner desde el inicio
    html5QrcodeScanner.render(onScanSuccess, onScanError);
  }
}

// Inicializar el escáner QR
const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader", // ID del contenedor del lector QR
  { fps: 10, qrbox: 250 } // Configuración del lector QR
);

// Renderizar el escáner
html5QrcodeScanner.render(onScanSuccess, onScanError);
