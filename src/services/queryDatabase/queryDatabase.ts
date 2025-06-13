
import notionApiClient from '../config';
export const queryDatabase = async (databaseId: string, filter?: any) => {
  try {
    const response = await notionApiClient.post(`/databases/${databaseId}/query`, {
      filter: filter || undefined
    });
    return response.data;
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    throw error;
  }
}; 