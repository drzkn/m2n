import notionApiClient from '../config';
export const getPage = async (pageId: string) => {
  try {
    const response = await notionApiClient.get(`/page/${pageId}`);
    return response.data;
  } catch (error) {
    console.error('Error al consultar la página:', error);
    throw error;
  }
}; 