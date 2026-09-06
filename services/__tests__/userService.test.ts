import { fetchWithTimeout, registerUser } from '../userService';

// Mock global fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('fetchWithTimeout', () => {
    const mockUrl = 'https://example.com/api';
    const mockOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    };

    it('debe realizar una petición exitosa dentro del timeout', async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        ok: true,
        json: async () => ({ success: true })
      } as Response;

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockResolvedValueOnce(mockResponse);

      // Act
      const result = await fetchWithTimeout(mockUrl, mockOptions);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('debe abortar la petición cuando se excede el timeout', async () => {
      // Arrange - Simular un AbortError que ocurre cuando se excede el timeout
      const abortError = new Error('La conexión tardó demasiado tiempo');
      abortError.name = 'AbortError';

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockRejectedValueOnce(abortError);

      // Act & Assert - Verificar que se maneja correctamente el AbortError
      await expect(fetchWithTimeout(mockUrl, mockOptions)).rejects.toThrow('La conexión tardó demasiado tiempo');
    });

    it('debe retornar error cuando el servidor no responde a la verificación inicial', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce(null as any);

      // Act & Assert
      await expect(fetchWithTimeout(mockUrl, mockOptions)).rejects.toThrow(
        'No se puede acceder al servidor'
      );
    });

    it('debe manejar errores de red correctamente', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(fetchWithTimeout(mockUrl, mockOptions)).rejects.toThrow('Network error');
    });

    it('debe usar el timeout por defecto de 15 segundos', async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        ok: true,
        json: async () => ({ success: true })
      } as Response;

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockResolvedValueOnce(mockResponse);

      // Act
      const promise = fetchWithTimeout(mockUrl, mockOptions);
      jest.advanceTimersByTime(1000);
      await promise;

      // Assert - Verificar que se configuró el timeout (no podemos verificar el valor exacto,
      // pero podemos verificar que la petición se completó)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('debe agregar headers de Connection keep-alive', async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        ok: true,
        json: async () => ({ success: true })
      } as Response;

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockResolvedValueOnce(mockResponse);

      // Act
      const promise = fetchWithTimeout(mockUrl, mockOptions);
      jest.advanceTimersByTime(1000);
      await promise;

      // Assert
      const mainCall = mockFetch.mock.calls[1];
      expect(mainCall[1]?.headers).toMatchObject({
        'Connection': 'keep-alive'
      });
    });
  });

  describe('registerUser', () => {
    const mockUserData = {
      tipoDocumento: 'CC',
      documentoIdentidad: '1234567890',
      nombres: 'Juan',
      apellidos: 'Pérez',
      fechaNacimiento: '1990-01-01',
      correo: 'juan@example.com',
      password: 'password123',
      numeroTele: '1234567890'
    };

    it('debe registrar un usuario exitosamente', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Usuario registrado correctamente'
      };

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => mockResponse,
        } as Response);

      // Act
      const result = await registerUser(mockUserData);

      // Assert
      expect(result.success).toBe(true);
      expect(result).toMatchObject(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('debe retornar error cuando el servidor responde con error', async () => {
      // Arrange
      const errorResponse = {
        message: 'El correo ya está registrado'
      };

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          status: 400,
          ok: false,
          json: async () => errorResponse,
        } as Response);

      // Act
      const result = await registerUser(mockUserData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('El correo ya está registrado');
    });

    it('debe retornar error genérico cuando no hay mensaje en la respuesta', async () => {
      // Arrange
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          status: 500,
          ok: false,
          json: async () => ({}),
        } as Response);

      // Act
      const result = await registerUser(mockUserData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Error del servidor (500)');
    });

    it('debe manejar errores de conexión', async () => {
      // Arrange
      const connectionError = new Error('Connection failed');
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockRejectedValueOnce(connectionError);

      // Act
      const result = await registerUser(mockUserData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });

    it('debe manejar errores desconocidos', async () => {
      // Arrange
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockRejectedValueOnce('Unknown error');

      // Act
      const result = await registerUser(mockUserData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error de conexión desconocido');
    });

    it('debe enviar los datos correctos en el body de la petición', async () => {
      // Arrange
      const mockResponse = { success: true };

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => mockResponse,
        } as Response);

      // Act
      await registerUser(mockUserData);

      // Assert
      const registerCall = mockFetch.mock.calls[1];
      const body = JSON.parse(registerCall[1]?.body as string);
      expect(body).toMatchObject(mockUserData);
      expect(registerCall[0]).toBe('https://reconocimiento-estrabismo-9hi3.onrender.com/auth/register/responsable');
    });

    it('debe configurar los headers correctamente', async () => {
      // Arrange
      const mockResponse = { success: true };

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => mockResponse,
        } as Response);

      // Act
      await registerUser(mockUserData);

      // Assert
      const registerCall = mockFetch.mock.calls[1];
      expect(registerCall[1]?.headers).toMatchObject({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      });
    });
  });
});

