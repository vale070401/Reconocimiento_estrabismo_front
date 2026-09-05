
interface LoginResponse {
  token?: string;
  error?: string;
  success?: boolean;
}

export const loginUser = async (correo: string, password: string): Promise<LoginResponse> => {
  try {
    const url = 'https://reconocimiento-estrabismo.onrender.com/auth/login';
    console.log('Intentando conectar a:', url);
    console.log('Datos de inicio de sesión:', { correo });

    // Verificar primero si el servidor está accesible
    try {
      console.log('Verificando disponibilidad del servidor...');
      const checkResponse = await fetch(
        'https://reconocimiento-estrabismo.onrender.com/auth', { 
        method: 'HEAD',
        headers: {
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      });
      console.log('Respuesta de verificación:', checkResponse.status);
    } catch (checkError) {
      console.error('Error al verificar el servidor:', checkError);
      return { error: 'No se puede acceder al servidor. Verifica tu conexión y la dirección IP.' };
    }

    console.log('Enviando petición de login...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({ correo, password }),
    });
    

    if (response.status !== 200) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error respuesta servidor:', response.status, errorData);
      return { error: `Error del servidor: ${response.status} ${errorData.message || ''}` };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error de conexión:', error);
    return { error: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` };
  }
};
