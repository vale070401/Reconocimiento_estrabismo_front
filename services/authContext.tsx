import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  id: number;
  correo: string;
  rol: string;
  nombres: string;
  apellidos: string;
  documentoIdentidad: string;
  tipoDocumento: string | null;
  numeroTele?: string;
  // Campos específicos de Responsable
  parentesco?: string;
  ocupacion?: string;
  ciudadResidencia?: string;
  iat?: number;
  exp?: number;
  sub?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      try {
        const decoded = jwtDecode<UserData>(token);
        setUserData(decoded);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error decodificando el token:', error);
        await logout();
      }
    }
  };

  const login = async (token: string) => {
    try {
      const decoded = jwtDecode<UserData>(token);
      await AsyncStorage.setItem('userToken', token);
      setUserData(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserData(null);
    setIsAuthenticated(false);
  };

  const updateToken = async (token: string) => {
    try {
      const decoded = jwtDecode<UserData>(token);
      await AsyncStorage.setItem('userToken', token);
      setUserData(decoded);
    } catch (error) {
      console.error('Error al actualizar el token:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}