import { Html5QrcodeScanner } from "https://unpkg.com/html5-qrcode?module";

let html5QrcodeScanner; // Declaramos esta variable global para reutilizar la configuración

// Función que maneja la validación del código QR
function validateAccess(qrCode) {
 const apiUrl = "https://script.google.com/a/macros/casatresaguas.com/s/AKfycbxdV2r8L5t5-_yA4LesgdrMJH5LSjXmmWy339B6Miz3Mk2n80-zFL107tP3geB1G7p8/exec";

function validateAccess(qrCode) {
  fetch(`${apiUrl}?qrCode=${encodeURIComponent(qrCode)}`)
    .then((response) => response.json())
    .then((data) => {
      const resultElement = document.getElementById("result");
      const statusImage = document.getElementById("status-image");

      if (data.isValid) {
        resultElement.innerText = "Acceso permitido ✅";
        resultElement.style.color = "green";
        statusImage.src = "./images/permitido.png"; // Ruta de la imagen verde
      } else {
        resultElement.innerText = "Acceso denegado ❌";
        resultElement.style.color = "red";
        statusImage.src = "./images/denegado.png"; // Ruta de la imagen roja
      }

      statusImage.style.display = "block"; // Mostrar la imagen
      document.getElementById("retry").style.display = "block"; // Mostrar el botón de reinicio
    })
    .catch((error) => {
      console.error("Error al validar el QR:", error);
      document.getElementById("result").innerText = "Error de conexión.";
      document.getElementById("result").style.color = "orange";
    });
}


// Función para reiniciar el escaneo sin volver a solicitar permisos
function restartScanner() {
  document.getElementById("result").innerText = "Por favor, escanea un código QR...";
  document.getElementById("retry").style.display = "none";
  document.getElementById("status-image").style.display = "none";

  // Reiniciar el escaneo sin destruir el lector
  html5QrcodeScanner.resume();
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  console.log(`Código escaneado: ${decodedText}`);
  document.getElementById("result").innerText = `Código escaneado: ${decodedText}`;

  // Detener el escaneo
  html5QrcodeScanner.pause(); // Detenemos el escaneo para procesar
  validateAccess(decodedText); // Validar el QR escaneado
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
  console.error("Error durante el escaneo: ", errorMessage);
}

// Inicializar el lector QR
function initializeScanner() {
  html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true, // Recordar la cámara utilizada
      facingMode: { exact: "environment" }, // Configurar cámara trasera
    }
  );

  html5QrcodeScanner.render(onScanSuccess, onScanError);
}

// Iniciar el lector QR al cargar la página
initializeScanner();
