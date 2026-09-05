import { updateProfile, UserData } from '../updateProfileService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock global fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('updateProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    process.env.NEXT_PUBLIC_API_PACIENTES_URL = 'https://api.example.com';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_PACIENTES_URL;
  });

  describe('updateProfile', () => {
    const mockUserData: UserData = {
      nombres: 'Juan',
      apellidos: 'Pérez',
      edad: 30,
      correo: 'juan@example.com',
      numeroTele: '1234567890'
    };

    it('debe actualizar el perfil exitosamente con token', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token';
      const mockResponse = {
        success: true,
        message: 'Perfil actualizado correctamente',
        data: mockUserData
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await updateProfile(mockUserData);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('userToken');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://api.example.com/Update');
      expect(callArgs[1]?.method).toBe('PUT');
      expect(callArgs[1]?.headers).toMatchObject({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      });
    });

    it('debe actualizar el perfil sin token cuando no está disponible', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Perfil actualizado correctamente'
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await updateProfile(mockUserData);

      // Assert
      expect(result).toEqual(mockResponse);
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).not.toHaveProperty('Authorization');
    });

    it('debe enviar los datos correctos en el body de la petición', async () => {
      // Arrange
      const mockToken = 'mock-token';
      const mockResponse = { success: true };

      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await updateProfile(mockUserData);

      // Assert
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body).toMatchObject(mockUserData);
      expect(body.nombres).toBe(mockUserData.nombres);
      expect(body.apellidos).toBe(mockUserData.apellidos);
      expect(body.edad).toBe(mockUserData.edad);
      expect(body.correo).toBe(mockUserData.correo);
      expect(body.numeroTele).toBe(mockUserData.numeroTele);
    });

    it('debe retornar error cuando el servidor responde con error', async () => {
      // Arrange
      const mockToken = 'mock-token';
      const errorResponse = {
        message: 'Error al actualizar el perfil'
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 400,
        ok: false,
        json: async () => errorResponse,
      } as Response);

      // Act
      const result = await updateProfile(mockUserData);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Error al actualizar el perfil');
    });

    it('debe retornar error genérico cuando no hay mensaje en la respuesta', async () => {
      // Arrange
      const mockToken = 'mock-token';

      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 500,
        ok: false,
        json: async () => ({}),
      } as Response);

      // Act
      const result = await updateProfile(mockUserData);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Error al actualizar el perfil');
    });

    it('debe manejar errores de conexión', async () => {
      // Arrange
      const mockToken = 'mock-token';
      const connectionError = new Error('Network error');

      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      mockFetch.mockRejectedValueOnce(connectionError);

      // Act
      const result = await updateProfile(mockUserData);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Error al conectar con el servidor');
    });

    it('debe manejar errores al obtener el token de AsyncStorage', async () => {
      // Arrange
      const storageError = new Error('Storage error');

      mockAsyncStorage.getItem.mockRejectedValueOnce(storageError);
      // El servicio maneja el error en el catch y retorna un objeto con error
      // pero como el error ocurre antes del fetch, no se llama a fetch
      
      // Act
      const result = await updateProfile(mockUserData);

      // Assert
      // El servicio debería retornar un error cuando falla AsyncStorage
      expect(result).toHaveProperty('error');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('userToken');
    });

    it('debe configurar los headers correctamente con token', async () => {
      // Arrange
      const mockToken = 'bearer-token-123';
      const mockResponse = { success: true };

      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await updateProfile(mockUserData);

      // Assert
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toMatchObject({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      });
    });

    it('debe manejar diferentes valores de edad', async () => {
      // Arrange
      const testCases = [
        { ...mockUserData, edad: 0 },
        { ...mockUserData, edad: 18 },
        { ...mockUserData, edad: 65 },
        { ...mockUserData, edad: 100 }
      ];
      const mockToken = 'mock-token';
      const mockResponse = { success: true };

      for (const userData of testCases) {
        mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => mockResponse,
        } as Response);

        // Act
        await updateProfile(userData);

        // Assert
        const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const body = JSON.parse(callArgs[1]?.body as string);
        expect(body.edad).toBe(userData.edad);
      }
    });

    it('debe manejar strings vacíos en campos opcionales', async () => {
      // Arrange
      const userDataWithEmptyFields: UserData = {
        nombres: 'Juan',
        apellidos: 'Pérez',
        edad: 30,
        correo: '',
        numeroTele: ''
      };
      const mockToken = 'mock-token';
      const mockResponse = { success: true };

      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await updateProfile(userDataWithEmptyFields);

      // Assert
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.correo).toBe('');
      expect(body.numeroTele).toBe('');
    });
  });
});

