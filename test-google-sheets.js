// Importar las funciones desde google-sheets.js
const { getValidCodes, logAccess } = require('./google-sheets.js');

// ID de tu Google Sheet
const SHEET_ID = '1Ae6ue6kGeDc_g9X9mYd8MkTPYSF5nPsFdZKo1FUu3P8';

async function testGoogleSheets() {
    try {
        // 1. Leer la lista de códigos válidos
        console.log('Leyendo códigos válidos...');
        const validCodes = await getValidCodes(SHEET_ID);
        console.log('Códigos válidos:', validCodes);

        // 2. Probar registrar un acceso
        const timestamp = new Date().toLocaleString(); // Fecha y hora actual
        const qrCode = 'TEST123'; // Código QR de prueba
        const status = validCodes.includes(qrCode) ? 'Aceptado' : 'No Válido'; // Validar

        console.log('Registrando acceso...');
        await logAccess(SHEET_ID, timestamp, qrCode, status);
        console.log('Acceso registrado con éxito.');
    } catch (error) {
        console.error('Error durante la prueba:', error);
    }
}

// Ejecutar la prueba
testGoogleSheets();
