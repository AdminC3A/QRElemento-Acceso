// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  // Mostrar el código escaneado
  document.getElementById("result").innerText = `Código escaneado: ${decodedText}`;

  // Detener el lector QR
  html5QrcodeScanner.clear().then(() => {
    console.log("Escaneo detenido.");
  }).catch((error) => {
    console.error("Error al detener el escaneo:", error);
  });
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo: ", errorMessage);
}

// Inicializar el escáner QR
const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 }
);

// Renderizar el escáner
html5QrcodeScanner.render(onScanSuccess, onScanError);
