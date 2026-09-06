interface RegisterData {
  tipoDocumento: string;
  documentoIdentidad: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  correo: string;
  password: string;
  numeroTele: string;
}

interface RegisterResponse {
  success?: boolean;
  error?: string;
}
export const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000) => {  // Aumentado a 15 segundos
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log('Intentando conectar a:', url);
    console.log('Opciones de la petición:', JSON.stringify(options));

    // Verificar si la URL es accesible con más detalles
    console.log('Verificando accesibilidad del servidor...');
    const checkResponse = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    }).catch((error) => {
      console.error('Error en la verificación inicial:', error);
      return null;
    });

    if (!checkResponse) {
      console.error('El servidor no responde a la verificación inicial');
      throw new Error('No se puede acceder al servidor. Verifica la conexión y la dirección IP');
    }

    console.log('Servidor accesible, realizando petición principal...');
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'Connection': 'keep-alive'
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La conexión tardó demasiado tiempo');
    }
    throw error;
  }
};

export const registerUser = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    console.log('Iniciando registro...');
    console.log('URL del servidor:', 'https://reconocimiento-estrabismo-9hi3.onrender.com');
    console.log('Enviando datos:', userData);

    const response = await fetchWithTimeout('https://reconocimiento-estrabismo-9hi3.onrender.com/auth/register/responsable', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    
    if (!response.ok) {
      console.error('Error en la respuesta del servidor:', response.status, data);
      return { 
        success: false, 
        error: data.message || `Error del servidor (${response.status})`
      };
    }

    return { success: true, ...data };
  } catch (error) {
    console.error('Error detallado:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión desconocido'
    };
  }
};
