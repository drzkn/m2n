import axios from 'axios';

// Función para obtener variables de entorno compatibles con Vite y Node.js
const getEnvVar = (key: string): string | undefined => {
  // En Vite, usar import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // En Node.js, usar process.env
  return process.env[key];
};

// Validación de variables de entorno requeridas
const requiredEnvVars = {
  NOTION_API_KEY: getEnvVar('NOTION_API_KEY'),
  NOTION_BASE_URL: getEnvVar('NOTION_BASE_URL'),
  NOTION_API_VERSION: getEnvVar('NOTION_API_VERSION'),
};

// Verificar que todas las variables necesarias estén presentes
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`La variable de entorno ${key} es requerida pero no está definida`);
  }
});

const notionApiClient = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    'Authorization': `Bearer ${requiredEnvVars.NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  },
});

notionApiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

notionApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Error de autenticación (401): Verifica que tu NOTION_API_KEY sea válida');
      console.error('Headers enviados:', error.config?.headers);
    }
    console.error('Error en la llamada a Notion:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default notionApiClient;
