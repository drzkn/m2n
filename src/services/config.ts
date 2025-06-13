import axios from 'axios';

// Validación de variables de entorno requeridas
const requiredEnvVars = {
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_BASE_URL: process.env.NOTION_BASE_URL,
  NOTION_API_VERSION: process.env.NOTION_API_VERSION,
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
