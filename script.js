// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  // Mostrar el código escaneado
  document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

  // Procesar el código escaneado
  console.log("Código procesado:", decodedText);

  // No detenemos el escáner para que continúe
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
    // Si no hay una cámara seleccionada, buscar la cámara trasera automáticamente
    getBackCameraId()
      .then((cameraId) => {
        startScanner(cameraId);
      })
      .catch((error) => {
        console.error("Error al obtener la cámara trasera:", error);
        document.getElementById("result").innerText =
          "Error al acceder a la cámara. Verifica los permisos.";
      });
  }
}

// Función para obtener la cámara trasera automáticamente
function getBackCameraId() {
  return Html5Qrcode.getCameras().then((cameras) => {
    if (cameras && cameras.length > 0) {
      // Buscar la cámara trasera
      const backCamera = cameras.find((camera) =>
        camera.label.toLowerCase().includes("back")
      );
      return backCamera ? backCamera.id : cameras[0].id; // Usar la trasera si está disponible
    } else {
      throw new Error("No se encontraron cámaras disponibles.");
    }
  });
}

// Inicializar el escáner QR con la cámara trasera automáticamente
getBackCameraId()
  .then((cameraId) => {
    startScanner(cameraId); // Usar cámara trasera automáticamente
  })
  .catch((error) => {
    console.error("Error al obtener la cámara trasera:", error);
    document.getElementById("result").innerText =
      "Error al acceder a la cámara. Verifica los permisos.";
  });
