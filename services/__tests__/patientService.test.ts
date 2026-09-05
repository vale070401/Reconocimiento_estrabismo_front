import { registerPatient, PatientData } from '../patientService';
import { fetchWithTimeout } from '../userService';

// Mock fetchWithTimeout
jest.mock('../userService', () => ({
  fetchWithTimeout: jest.fn()
}));

const mockFetchWithTimeout = fetchWithTimeout as jest.MockedFunction<typeof fetchWithTimeout>;

describe('patientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerPatient', () => {
    const mockToken = 'mock-jwt-token';
    const mockPatientData: PatientData = {
      tipoDocumento: 'REGISTRO_CIVIL',
      documentoIdentidad: '1234567890',
      nombres: 'María',
      apellidos: 'González',
      fechaNacimiento: '2015-05-15',
      genero: 'F',
      documentoIdentidadResponsable: '9876543210',
      parentesco: 'Madre',
      correo: 'maria@example.com',
      numeroTele: '1234567890'
    };

    it('debe registrar un paciente exitosamente', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          documentoIdentidad: mockPatientData.documentoIdentidad
        }
      };

      mockFetchWithTimeout.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await registerPatient(mockPatientData, mockToken);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
      
      // Verificar que se llamó con los parámetros correctos
      const callArgs = mockFetchWithTimeout.mock.calls[0];
      expect(callArgs[0]).toBe('https://reconocimiento-estrabismo.onrender.com/auth/register/paciente');
      expect(callArgs[1]?.method).toBe('POST');
      expect(callArgs[1]?.headers).toMatchObject({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      });
    });

    it('debe preparar los datos correctamente en el request', async () => {
      // Arrange
      const mockResponse = { success: true, data: {} };

      mockFetchWithTimeout.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await registerPatient(mockPatientData, mockToken);

      // Assert
      const callArgs = mockFetchWithTimeout.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      
      expect(requestBody.tipoDocumento).toBe(mockPatientData.tipoDocumento);
      expect(requestBody.documentoIdentidad).toBe(mockPatientData.documentoIdentidad);
      expect(requestBody.nombres).toBe(mockPatientData.nombres);
      expect(requestBody.apellidos).toBe(mockPatientData.apellidos);
      expect(requestBody.fechaNacimiento).toBe(mockPatientData.fechaNacimiento);
      expect(requestBody.genero).toBe(mockPatientData.genero);
      expect(requestBody.documentoIdentidadResponsable).toBe(mockPatientData.documentoIdentidadResponsable);
      expect(requestBody.parentesco).toBe(mockPatientData.parentesco);
      expect(requestBody.correo).toBe(mockPatientData.correo);
      expect(requestBody.numeroTele).toBe(mockPatientData.numeroTele);
    });

    it('debe manejar campos opcionales vacíos (correo y numeroTele)', async () => {
      // Arrange
      const patientDataSinOpcionales: PatientData = {
        ...mockPatientData,
        correo: undefined,
        numeroTele: undefined
      };
      const mockResponse = { success: true, data: {} };

      mockFetchWithTimeout.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await registerPatient(patientDataSinOpcionales, mockToken);

      // Assert
      const callArgs = mockFetchWithTimeout.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      expect(requestBody.correo).toBe('');
      expect(requestBody.numeroTele).toBe('');
    });

    it('debe retornar error cuando el servidor responde con error', async () => {
      // Arrange
      const errorResponse = {
        message: 'El paciente ya está registrado'
      };

      mockFetchWithTimeout.mockResolvedValueOnce({
        status: 400,
        ok: false,
        json: async () => errorResponse,
      } as Response);

      // Act
      const result = await registerPatient(mockPatientData, mockToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('El paciente ya está registrado');
    });

    it('debe retornar error genérico cuando no hay mensaje en la respuesta', async () => {
      // Arrange
      mockFetchWithTimeout.mockResolvedValueOnce({
        status: 500,
        ok: false,
        json: async () => ({}),
      } as Response);

      // Act
      const result = await registerPatient(mockPatientData, mockToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al registrar el paciente');
    });

    it('debe manejar errores de conexión', async () => {
      // Arrange
      const connectionError = new Error('Network error');
      mockFetchWithTimeout.mockRejectedValueOnce(connectionError);

      // Act
      const result = await registerPatient(mockPatientData, mockToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('debe manejar errores desconocidos', async () => {
      // Arrange
      mockFetchWithTimeout.mockRejectedValueOnce('Unknown error');

      // Act
      const result = await registerPatient(mockPatientData, mockToken);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Error desconocido al registrar el paciente');
    });

    it('debe validar todos los tipos de documento permitidos', async () => {
      // Arrange
      const tiposDocumento: PatientData['tipoDocumento'][] = [
        'REGISTRO_CIVIL',
        'TI',
        'NUIP',
        'PASAPORTE'
      ];
      const mockResponse = { success: true, data: {} };

      for (const tipoDoc of tiposDocumento) {
        mockFetchWithTimeout.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => mockResponse,
        } as Response);

        // Act
        const result = await registerPatient(
          { ...mockPatientData, tipoDocumento: tipoDoc },
          mockToken
        );

        // Assert
        expect(result.success).toBe(true);
      }
    });

    it('debe validar todos los géneros permitidos', async () => {
      // Arrange
      const generos: PatientData['genero'][] = ['M', 'F', 'O', 'N'];
      const mockResponse = { success: true, data: {} };

      for (const genero of generos) {
        mockFetchWithTimeout.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => mockResponse,
        } as Response);

        // Act
        const result = await registerPatient(
          { ...mockPatientData, genero },
          mockToken
        );

        // Assert
        expect(result.success).toBe(true);
      }
    });

    it('debe incluir el token de autorización en el header', async () => {
      // Arrange
      const customToken = 'custom-token-123';
      const mockResponse = { success: true, data: {} };

      mockFetchWithTimeout.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await registerPatient(mockPatientData, customToken);

      // Assert
      const callArgs = mockFetchWithTimeout.mock.calls[0];
      expect(callArgs[1]?.headers).toMatchObject({
        'Authorization': `Bearer ${customToken}`
      });
    });
  });
});

