import { loginUser } from '../authService';

// Mock global fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Helper para crear mocks de Response
const createMockResponse = (status: number, ok: boolean, data?: any): any => {
  return {
    status,
    ok,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers(),
    redirected: false,
    type: 'default',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    json: jest.fn(async () => data || {}),
    text: jest.fn(),
    bytes: jest.fn(),
  };
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('loginUser', () => {
    const mockCorreo = 'test@example.com';
    const mockPassword = 'password123';

    it('debe realizar login exitoso y retornar token', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token';
      const mockResponse = {
        token: mockToken,
        success: true
      };

      // Mock HEAD request (verificación de servidor)
      mockFetch
        .mockResolvedValueOnce(createMockResponse(200, true))
        // Mock POST request (login)
        .mockResolvedValueOnce(createMockResponse(200, true, mockResponse));

      // Act
      const result = await loginUser(mockCorreo, mockPassword);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.token).toBe(mockToken);
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      // Verificar que se llamó con los parámetros correctos
      const loginCall = mockFetch.mock.calls[1];
      expect(loginCall[0]).toBe('https://reconocimiento-estrabismo-9hi3.onrender.com/auth/login');
      expect(loginCall[1]?.method).toBe('POST');
      expect(loginCall[1]?.headers).toMatchObject({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });
    });

    it('debe retornar error cuando el servidor no está accesible', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      // Act
      const result = await loginUser(mockCorreo, mockPassword);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('No se puede acceder al servidor');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('debe retornar error cuando la respuesta del servidor no es 200', async () => {
      // Arrange
      const errorResponse = {
        message: 'Credenciales inválidas'
      };

      mockFetch
        .mockResolvedValueOnce(createMockResponse(200, true))
        .mockResolvedValueOnce(createMockResponse(401, false, errorResponse));

      // Act
      const result = await loginUser(mockCorreo, mockPassword);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Error del servidor: 401');
      expect(result.error).toContain('Credenciales inválidas');
    });

    it('debe manejar errores de conexión durante el login', async () => {
      // Arrange
      const connectionError = new Error('Connection timeout');

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockRejectedValueOnce(connectionError);

      // Act
      const result = await loginUser(mockCorreo, mockPassword);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Error de conexión');
      expect(result.error).toContain('Connection timeout');
    });

    it('debe manejar errores cuando la respuesta JSON es inválida', async () => {
      // Arrange
      const mockResponse = createMockResponse(500, false, {});
      mockResponse.json = jest.fn(async () => {
        throw new Error('Invalid JSON');
      });
      
      mockFetch
        .mockResolvedValueOnce(createMockResponse(200, true))
        .mockResolvedValueOnce(mockResponse);

      // Act
      const result = await loginUser(mockCorreo, mockPassword);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Error del servidor: 500');
    });

    it('debe enviar los datos correctos en el body de la petición', async () => {
      // Arrange
      const mockResponse = { token: 'token', success: true };

      mockFetch
        .mockResolvedValueOnce(createMockResponse(200, true))
        .mockResolvedValueOnce(createMockResponse(200, true, mockResponse));

      // Act
      await loginUser(mockCorreo, mockPassword);

      // Assert
      const loginCall = mockFetch.mock.calls[1];
      const body = JSON.parse(loginCall[1]?.body as string);
      expect(body.correo).toBe(mockCorreo);
      expect(body.password).toBe(mockPassword);
    });

    it('debe manejar errores desconocidos correctamente', async () => {
      // Arrange
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        } as Response)
        .mockRejectedValueOnce('Unknown error');

      // Act
      const result = await loginUser(mockCorreo, mockPassword);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Error de conexión');
      expect(result.error).toContain('Error desconocido');
    });
  });
});

