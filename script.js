// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// Base de datos simulada de códigos permitidos
const validCodes = ["12345", "67890", "abcde"]; // Ejemplo de códigos válidos

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  // Mostrar el código escaneado
  document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

  // Obtener el contenedor de la imagen de validación
  const validationImage = document.getElementById("validation-image");

  // Cotejar el código con la base de datos
  if (validCodes.includes(decodedText)) {
    // Código válido: mostrar imagen verde
    validationImage.src = "images/Permitido.png"; // Ruta de la imagen verde
    validationImage.style.display = "block"; // Mostrar la imagen
  } else {
    // Código inválido: mostrar imagen roja
    validationImage.src = "images/Denegado.png"; // Ruta de la imagen roja
    validationImage.style.display = "block"; // Mostrar la imagen
  }

  // Ocultar la imagen después de 2 segundos
  setTimeout(() => {
    validationImage.style.display = "none";
  }, 2000);

  // No detenemos el escáner para que continúe escaneando
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
        qrbox: { width: 125, height: 125 },
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
