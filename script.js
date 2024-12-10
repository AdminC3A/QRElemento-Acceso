import { Html5Qrcode } from "https://unpkg.com/html5-qrcode?module";

let html5Qrcode;

// Inicializar el lector QR
function initializeScanner() {
  html5Qrcode = new Html5Qrcode("reader");

  // Obtener las cámaras disponibles
  Html5Qrcode.getCameras()
    .then((cameras) => {
      if (cameras && cameras.length > 0) {
        const readerContainer = document.getElementById("reader-container");

        // Crear un menú desplegable para seleccionar cámaras
        const cameraSelect = document.createElement("select");
        cameraSelect.id = "cameraSelect";
        cameraSelect.style.margin = "10px 0";
        cameras.forEach((camera, index) => {
          const option = document.createElement("option");
          option.value = camera.id;
          option.text = camera.label || `Cámara ${index + 1}`;
          cameraSelect.appendChild(option);
        });
        readerContainer.appendChild(cameraSelect);

        // Crear un botón para iniciar el escaneo
        const startButton = document.createElement("button");
        startButton.innerText = "Iniciar Escaneo";
        startButton.style.marginTop = "10px";
        startButton.onclick = () => startScanner(cameraSelect.value);
        readerContainer.appendChild(startButton);
      } else {
        alert("No se encontraron cámaras disponibles.");
      }
    })
    .catch((err) => {
      console.error("Error al obtener las cámaras: ", err);
      alert("Error al acceder a las cámaras. Verifica los permisos.");
    });
}

// Iniciar el escaneo con la cámara seleccionada
function startScanner(cameraId) {
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
    .catch((err) => {
      console.error("Error al iniciar el escaneo: ", err);
    });
}

// Detener el escaneo
function stopScanner() {
  html5Qrcode.stop().then(() => {
    console.log("Escaneo detenido.");
  }).catch((err) => {
    console.error("Error al detener el escaneo: ", err);
  });
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  console.log(`Código escaneado: ${decodedText}`);
  document.getElementById("result").innerText = `Código escaneado: ${decodedText}`;
  stopScanner();
  validateAccess(decodedText);
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
  initializeScanner();
}

// Ejecutar al cargar la página
window.onload = initializeScanner;
