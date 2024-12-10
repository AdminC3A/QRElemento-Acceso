// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  // Mostrar el texto escaneado
  document.getElementById("result").innerText = `Código escaneado: ${decodedText}`;

  // Detener el escaneo
  html5QrcodeScanner.clear().then(() => {
    console.log("Escaneo detenido.");
    document.getElementById("retry").style.display = "block"; // Mostrar botón de reinicio
  }).catch((error) => {
    console.error("Error al detener el escaneo:", error);
  });

  // Validar el código QR (puedes implementar esta función)
  validateAccess(decodedText);
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
  console.error("Error durante el escaneo: ", errorMessage);
}

// Función para reiniciar el escaneo
function restartScanner() {
  document.getElementById("result").innerText = "Por favor, escanea un código QR...";
  document.getElementById("retry").style.display = "none"; // Ocultar botón de reinicio

  // Reiniciar el escáner
  html5QrcodeScanner.render(onScanSuccess, onScanError);
}

// Inicializar el escáner QR
const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: 250 } // Configuración del área de escaneo
);

// Renderizar el escáner
html5QrcodeScanner.render(onScanSuccess, onScanError);
