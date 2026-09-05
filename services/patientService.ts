import { fetchWithTimeout } from './userService';

export interface PatientData {
  tipoDocumento: 'REGISTRO_CIVIL' | 'TI' | 'NUIP' | 'PASAPORTE';
  documentoIdentidad: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: 'M' | 'F' | 'O' | 'N';
  documentoIdentidadResponsable: string;
  parentesco: string;
  correo?: string;
  numeroTele?: string;
}

interface PatientResponse {
  success?: boolean;
  error?: string;
  data?: any;
}

export const registerPatient = async (patientData: PatientData, token: string): Promise<PatientResponse> => {
  try {
    const url = 'https://reconocimiento-estrabismo.onrender.com/auth/register/paciente';
    
    // Preparar los datos según el formato esperado por el endpoint
    const requestData = {
      tipoDocumento: patientData.tipoDocumento,
      documentoIdentidad: patientData.documentoIdentidad,
      nombres: patientData.nombres,
      apellidos: patientData.apellidos,
      fechaNacimiento: patientData.fechaNacimiento,
      genero: patientData.genero,
      documentoIdentidadResponsable: patientData.documentoIdentidadResponsable,
      parentesco: patientData.parentesco,
      correo: patientData.correo || '',
      numeroTele: patientData.numeroTele || ''
    };

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      }
    );

    const data = await response.json();

    if (response.status !== 200) {
      return { success: false, error: data.message || 'Error al registrar el paciente' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error al registrar paciente:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al registrar el paciente' 
    };
  }
};

