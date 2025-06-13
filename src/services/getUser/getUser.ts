import notionApiClient from '../config';
export const getUser = async () => {
  try {
    const response = await notionApiClient.get(`/users/me`);
    return response.data;
  } catch (error) {
    console.error('Error al consultar el usuario:', error);
    throw error;
  }
}; 