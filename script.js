// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// Base de datos simulada de códigos permitidos
const apiUrl = "https://script.google.com/a/macros/casatresaguas.com/s/AKfycbwrTwr8mIhDPHOS5APWE6C4cuvKlv0F0zXvhG-5km1b5Zw7MKfbjtLmC3eJvvpQsUbb/exec";

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  html5Qrcode.pause(); // Pausa temporalmente el lector

  // Validación del código con la API
  fetch(`${apiUrl}?qrCode=${encodeURIComponent(decodedText)}`)
    .then((response) => response.json())
    .then((data) => {
      const validationImage = document.getElementById("validation-image");

      if (data.isValid) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        resultElement.innerText = `Acceso Permitido\nNombre: ${data.associatedName}\nCompañía: ${data.associatedCompany}\nPuesto: ${data.associatedPosition}`;
      } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        resultElement.innerText = "Acceso Denegado. Código no válido.";
      }

      // Ocultar la imagen y reanudar el escaneo después de 5 segundos
      setTimeout(() => {
        validationImage.style.display = "none";
        html5Qrcode.resume(); // Reanuda el lector
      }, 5000);
    })
    .catch((error) => {
      console.error("Error al conectar con la API:", error);
      resultElement.innerText = "Error al validar el código QR.";
      html5Qrcode.resume(); // Reanuda incluso en caso de error
    });
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
