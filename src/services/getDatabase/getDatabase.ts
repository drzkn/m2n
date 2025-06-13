import notionApiClient from '../config';

export const getDatabase = async (databaseId: string) => {
  try {
    const response = await notionApiClient.get(`/databases/${databaseId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener la base de datos:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      code: error.response?.data?.code,
      requestId: error.response?.data?.request_id
    });
    throw error;
  }
};
