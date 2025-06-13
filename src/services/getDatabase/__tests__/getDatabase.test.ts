import notionApiClient from '../../config';
import { getDatabase } from '../getDatabase';


// Mock de axios
jest.mock('../../config', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

describe('getDatabase', () => {
  const mockDatabaseId = 'test-database-id';
  const mockDatabaseData = {
    id: mockDatabaseId,
    title: 'Test Database',
    properties: {
      Name: {
        title: {}
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería obtener correctamente una base de datos', async () => {
    // Configurar el mock para que devuelva datos exitosos
    (notionApiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockDatabaseData });

    const result = await getDatabase(mockDatabaseId);

    // Verificar que se llamó a la API con los parámetros correctos
    expect(notionApiClient.get).toHaveBeenCalledWith(`/databases/${mockDatabaseId}`);
    expect(notionApiClient.get).toHaveBeenCalledTimes(1);

    // Verificar que se devuelven los datos correctos
    expect(result).toEqual(mockDatabaseData);
  });

  it('debería manejar errores correctamente', async () => {
    const mockError = new Error('API Error');
    (notionApiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

    // Verificar que la función lanza el error
    await expect(getDatabase(mockDatabaseId)).rejects.toThrow('API Error');

    // Verificar que se llamó a la API
    expect(notionApiClient.get).toHaveBeenCalledWith(`/databases/${mockDatabaseId}`);
    expect(notionApiClient.get).toHaveBeenCalledTimes(1);
  });
});
