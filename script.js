import { Html5Qrcode, Html5QrcodeScanner } from "https://unpkg.com/html5-qrcode?module";

let html5Qrcode;

function initializeCamera() {
  const readerElement = document.getElementById("reader");

  // Inicializa el lector QR
  html5Qrcode = new Html5Qrcode("reader");

  Html5Qrcode.getCameras()
    .then((cameras) => {
      if (cameras && cameras.length) {
        // Usa la cámara trasera si está disponible
        const backCamera = cameras.find((camera) => camera.label.toLowerCase().includes("back")) || cameras[0];
        
        html5Qrcode.start(
          backCamera.id, // ID de la cámara seleccionada
          {
            fps: 10, // Velocidad de fotogramas
            qrbox: { width: 250, height: 250 }, // Área de escaneo
          },
          onScanSuccess,
          onScanError
        );
      } else {
        alert("No se encontraron cámaras.");
      }
    })
    .catch((err) => {
      console.error("Error al obtener las cámaras:", err);
      alert("Error al acceder a la cámara. Verifica los permisos.");
    });
}

function onScanSuccess(decodedText, decodedResult) {
  console.log(`Código escaneado: ${decodedText}`);
  document.getElementById("result").innerText = `Código escaneado: ${decodedText}`;
  validateAccess(decodedText);
  html5Qrcode.stop(); // Detenemos el lector tras un escaneo exitoso
}

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
        statusImage.src = "./images/permitido.png";
      } else {
        resultElement.innerText = "Acceso denegado ❌";
        resultElement.style.color = "red";
        statusImage.src = "./images/denegado.png";
      }

      statusImage.style.display = "block";
      document.getElementById("retry").style.display = "block";
    })
    .catch((error) => {
      console.error("Error al validar el QR:", error);
      document.getElementById("result").innerText = "Error de conexión.";
      document.getElementById("result").style.color = "orange";
    });
}

// Reiniciar el lector QR
function restartScanner() {
  document.getElementById("result").innerText = "Por favor, escanea un código QR...";
  document.getElementById("retry").style.display = "none";
  document.getElementById("status-image").style.display = "none";
  initializeCamera(); // Reinicia la cámara
}

// Inicializa la cámara al cargar la página
window.onload = initializeCamera;
