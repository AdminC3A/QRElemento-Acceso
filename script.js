// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
    // Mostrar el texto escaneado
    document.getElementById('result').innerText = `Código escaneado: ${decodedText}`;
}
  
  // Aquí llamaremos a la función de validación en el siguiente paso
  validateAccess(decodedText);
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


startScanning();
