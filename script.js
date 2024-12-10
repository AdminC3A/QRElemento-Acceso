import { Html5Qrcode } from "https://unpkg.com/html5-qrcode?module";

let html5Qrcode;

// Inicializar el lector QR
function initializeScanner() {
  html5Qrcode = new Html5Qrcode("reader");
  
  // Obtener las cámaras disponibles
  Html5Qrcode.getCameras()
    .then((cameras) => {
      if (cameras && cameras.length > 0) {
        // Crear un menú para seleccionar cámaras
        const cameraSelect = document.createElement("select");
        cameraSelect.id = "cameraSelect";
        cameras.forEach((camera, index) => {
          const option = document.createElement("option");
          option.value = camera.id;
          option.text = camera.label || `Cámara ${index + 1}`;
          cameraSelect.appendChild(option);
        });

        const readerContainer = document.getElementById("reader-container");
        readerContainer.appendChild(cameraSelect);

        // Botón para iniciar con la cámara seleccionada
        const startButton = document.createElement("button");
        startButton.innerText = "Iniciar Escaneo";
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

// Manejar el r
