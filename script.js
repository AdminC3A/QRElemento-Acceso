// URL de la base de datos CSV
const csvUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";
let database = []; // Variable global para almacenar los datos procesados

// Función para cargar la base de datos desde el CSV
function loadDatabase() {
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar la base de datos.");
            }
            return response.text(); // Obtener el contenido del archivo CSV como texto
        })
        .then(csvData => {
            // Procesar el archivo CSV
            const rows = csvData.split("\n").slice(1); // Saltar la fila de encabezados
            database = rows.map(row => {
                const [CodigoQR, Nombre, Compañia, Puesto] = row.split(",");
                return {
                    CodigoQR: CodigoQR.trim(),
                    Nombre: Nombre.trim(),
                    Compañia: Compañia.trim(),
                    Puesto: Puesto.trim()
                };
            });

            console.log("Base de datos cargada:", database); // Verificar los datos cargados
        })
        .catch(error => {
            console.error("Error al cargar la base de datos:", error);
            document.getElementById("result").innerText = "Error al cargar la base de datos.";
        });
}

// Llamar a la función para cargar la base de datos al iniciar
loadDatabase();
