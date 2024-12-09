// URL de la API de Google Apps Script
const apiUrl = "https://script.google.com/macros/s/AKfycb.../exec"; // Reemplaza con la URL de tu API

// Función para manejar el resultado exitoso del escaneo
async function onScanSuccess(decodedText) {
    // Mostrar el código escaneado mientras se verifica
    document.getElementById("result").innerText = `Código escaneado: ${decodedText}. Verificando...`;

    try {
        // Llamar a la API con el código escaneado
        const response = await fetch(`${apiUrl}?code=${decodedText}`);
        const data = await response.json();

        // Mostrar el resultado
        if (data.isValid) {
            document.getElementById("result").innerHTML = `
                <p style="color: green; font-weight: bold;">Código válido</p>
                <button onclick="startScanner()" style="background-color: green; color: white;">Escanear otro</button>
            `;
        } else {
            document.getElementById("result").innerHTML = `
                <p style="color: red; font-weight: bold;">Código no válido</p>
                <button onclick="startScanner()" style="background-color: red; color: white;">Intentar de nuevo</button>
            `;
        }
    } catch (error) {
        console.error("Error al conectar con la API:", error);
        document.getElementById("result").innerHTML = `
            <p style="color: red;">Error al conectar con la base de datos</p>
        `;
    }
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

// Inicializar el escáner QR
function startScanner() {
    const html5QrCodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: 250 }
    );

    html5QrCodeScanner.render(onScanSuccess, onScanError);
}

// Iniciar el escáner al cargar la página
startScanner();
