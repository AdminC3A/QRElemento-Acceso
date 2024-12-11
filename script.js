const csvUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv"; // URL del archivo CSV simplificado

let validCodes = []; // Array para almacenar los códigos válidos

// Cargar base de datos desde el CSV
fetch(csvUrl)
    .then((response) => {
        if (!response.ok) {
            throw new Error("No se pudo cargar la base de datos.");
        }
        return response.text();
    })
    .then((csvText) => {
        validCodes = csvText.split("\n").map((line) => line.trim());
        document.getElementById("result").innerText = "Base de datos cargada correctamente.";
    })
    .catch((error) => {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    });

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

    const validationImage = document.getElementById("validation-image");

    if (validCodes.includes(decodedText)) {
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = `Código detectado: ${decodedText} - Acceso Permitido.`;
    } else {
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText = `Código detectado: ${decodedText} - Acceso Denegado.`;
    }

    setTimeout(() => {
        validationImage.style.display = "none";
    }, 5000);
}
