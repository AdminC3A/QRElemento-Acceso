import { Html5QrcodeScanner } from "https://unpkg.com/html5-qrcode?module";

let html5QrcodeScanner;

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  console.log(`Código escaneado: ${decodedText}`);
  document.getElementById("result").innerText = `Código escaneado: ${decodedText}`;

  // Detener el escaneo tras un éxito
  html5QrcodeScanner.clear().then(() => {
    console.log("Escaneo detenido.");
    validateAccess(decodedText);
  }).catch((error) => {
    console.error("Error al detener el escaneo:", error);
  });
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
  console.error("Error durante el escaneo: ", errorMessage);
}

// Validar el código QR contra la API
function validateAccess(qrCode) {
  const apiUrl = "https://script.google.com/a/macros/casatresaguas.com/s/AKfycbxdV2r8L5t5-_yA4LesgdrMJH5LSjXmmWy339B6Miz3Mk2n80-zFL107tP3geB1G7p8/exec";

  fetch(`${apiUrl}?qrCode=${encodeURIComponent(qrCode)}`)
    .then((response) => response.json())
    .then((data) => {
      const resultElement = document.getElementById("result");
      const statusImage = document.getElementById("status-image");

      if (data.isValid) {
        resultElement.innerText = "Acceso permitido ✅";
        resultElement.style.color = "green";
        statusImage.src = "./images/permitido.png"; //
