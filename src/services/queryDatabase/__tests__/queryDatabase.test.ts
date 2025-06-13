import notionApiClient from '../../config';
import { queryDatabase } from '../queryDatabase';

// Mock de axios
jest.mock('../../config', () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}));


describe('queryDatabase', () => {
  const mockDatabaseId = 'test-database-id';
  const mockFilter = {
    property: 'Status',
    status: {
      equals: 'Done'
    }
  };
  const mockResponseData = {
    results: [
      {
        id: 'page-1',
        properties: {
          Name: {
            title: [{ text: { content: 'Test Page 1' } }]
          }
        }
      },
      {
        id: 'page-2',
        properties: {
          Name: {
            title: [{ text: { content: 'Test Page 2' } }]
          }
        }
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería consultar una base de datos sin filtro', async () => {
    (notionApiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

    const result = await queryDatabase(mockDatabaseId);

    // Verificar que se llamó a la API con los parámetros correctos
    expect(notionApiClient.post).toHaveBeenCalledWith(
      `/databases/${mockDatabaseId}/query`,
      { filter: undefined }
    );
    expect(notionApiClient.post).toHaveBeenCalledTimes(1);

    // Verificar que se devuelven los datos correctos
    expect(result).toEqual(mockResponseData);
  });

  it('debería consultar una base de datos con filtro', async () => {
    // Configurar el mock para que devuelva datos exitosos
    (notionApiClient.post as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

    const result = await queryDatabase(mockDatabaseId, mockFilter);

    // Verificar que se llamó a la API con los parámetros correctos
    expect(notionApiClient.post).toHaveBeenCalledWith(
      `/databases/${mockDatabaseId}/query`,
      { filter: mockFilter }
    );
    expect(notionApiClient.post).toHaveBeenCalledTimes(1);

    // Verificar que se devuelven los datos correctos
    expect(result).toEqual(mockResponseData);
  });

  it('debería manejar errores correctamente', async () => {
    const mockError = new Error('API Error');
    (notionApiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

    // Verificar que la función lanza el error
    await expect(queryDatabase(mockDatabaseId)).rejects.toThrow('API Error');

    // Verificar que se llamó a la API
    expect(notionApiClient.post).toHaveBeenCalledWith(
      `/databases/${mockDatabaseId}/query`,
      { filter: undefined }
    );
    expect(notionApiClient.post).toHaveBeenCalledTimes(1);
  });
});
