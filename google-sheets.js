// Importar la biblioteca de Google APIs
const { google } = require('googleapis');

// Función para autenticar y conectar a Google Sheets
async function connectToGoogleSheets() {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON); // Leer credenciales de Netlify

    // Configurar la autenticación
    const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Permisos para leer y escribir
    });

    // Crear cliente de autenticación
    const client = await auth.getClient();

    // Inicializar API de Sheets
    const sheets = google.sheets({ version: 'v4', auth: client });

    return sheets;
}

// Función para leer la lista de códigos permitidos
async function getValidCodes(sheetId) {
    const sheets = await connectToGoogleSheets();

    // Leer la hoja "Base de Datos" (columna A)
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Base de Datos!A:A', // Columna A de la pestaña "Base de Datos"
    });

    const values = response.data.values || [];
    return values.flat(); // Convertir en un arreglo plano
}

// Función para registrar un acceso en "Respuestas de formulario 1"
async function logAccess(sheetId, timestamp, qrCode, status) {
    const sheets = await connectToGoogleSheets();

    // Agregar una nueva fila con los datos
    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Respuestas de formulario 1', // Pestaña donde registraremos los datos
        valueInputOption: 'USER_ENTERED', // Permiti
