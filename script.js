import { Html5QrcodeScanner } from "https://unpkg.com/html5-qrcode?module";

const setupScanner = () => {
  const readerDiv = document.getElementById("reader");
  const messageElement = document.getElementById("message");
  const retryButton = document.getElementById("retry");

  const onScanSuccess = (decodedText) => {
    console.log(`Código escaneado: ${decodedText}`);
    validateAccess(decodedText);
  };

  const onScanFailure = (error) => {
    console.warn(`Error de escaneo: ${error}`);
  };

  const validateAccess = (qrCode) => {
    const apiUrl = "https://script.google.com/macros/s/YOUR_API_URL/exec"; // Cambiar por tu API
    fetch(`${apiUrl}?qrCode=${encodeURIComponent(qrCode)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.isValid) {
          messageElement.textContent = "Acceso permitido ✅";
          messageElement.style.color = "green";
        } else {
          messageElement.textContent = "Acceso denegado ❌";
          messageElement.style.color = "red";
        }
        retryButton.style.display = "block";
      })
      .catch((error) => {
        messageElement.textContent = "Error de conexión.";
        messageElement.style.color = "red";
        console.error("Error:", error);
      });
  };

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
  };

  const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    config,
    false
  );

  html5QrcodeScanner.render(onScanSuccess, onScanFailure);

  retryButton.addEventListener("click", () => {
    messageElement.textContent = "";
    retryButton.style.display = "none";
    html5QrcodeScanner.clear().then(() => {
      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    });
  });
};

document.addEventListener("DOMContentLoaded", setupScanner);

startScanning();
