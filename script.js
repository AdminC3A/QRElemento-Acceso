// URL de la API de Google Apps Script
const googleApiUrl = "https://script.google.com/a/macros/casatresaguas.com/s/AKfycbzgazNRLGnkSSV8WPIDPPDZUB_4l-ibq8nroqdn9zHJZgOuYa5K5hepJE_85ODqXkOB/exec";

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    document.getElementById("result").innerText = `Código detectado: ${decodedText}`;
    const validationImage = document.getElementById("validation-image");

    // Determinar si el código es válido
    const isValid = validCodes.includes(decodedText);
    const result = isValid ? "Permitido" : "Denegado";

    // Mostrar la imagen de validación
    validationImage.src = isValid ? "images/Permitido.png" : "images/Denegado.png";
    validationImage.style.display = "block";

    document.getElementById("result").innerText += ` - Acceso ${result}`;

    // Registrar el resultado en la hoja de Google
    fetch(googleApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            qrCode: decodedText, // Código QR escaneado
            result: result, // Resultado del acceso
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Registro guardado correctamente.");
            } else {
                console.error("Error al guardar el registro:", data.error);
            }
        })
        .catch(error => {
            console.error("Error al conectar con la API de Google:", error);
        });

    // Ocultar la imagen después de 5 segundos
    setTimeout(() => {
        validationImage.style.display = "none";
    }, 5000);
}
