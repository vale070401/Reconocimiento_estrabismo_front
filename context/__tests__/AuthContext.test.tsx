import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Usar el localStorage global que está mockeado en jest.setup.js
const localStorageMock = global.localStorage;

// Componente de prueba para usar el hook
const TestComponent: React.FC<{ testId?: string }> = ({ testId = 'test' }) => {
  const auth = useAuth();
  return (
    <div data-testid={testId}>
      <div data-testid="isAuthenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</div>
      <button data-testid="login-btn" onClick={() => auth.login({ documento: '123', token: 'token123' })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('AuthProvider', () => {
    it('debe proporcionar valores iniciales cuando no hay usuario almacenado', () => {
      // Arrange & Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });

    it('debe cargar usuario desde localStorage al montar', async () => {
      // Arrange
      const storedUser = { documento: '123456', token: 'stored-token' };
      localStorageMock.setItem('user', JSON.stringify(storedUser));

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
        expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(storedUser));
      });
    });

    it('debe manejar localStorage vacío correctamente', () => {
      // Arrange - Asegurar que localStorage esté vacío
      localStorageMock.clear();

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  describe('useAuth hook', () => {
    it('debe lanzar error cuando se usa fuera del AuthProvider', () => {
      // Arrange
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act & Assert
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth debe usarse dentro de un AuthProvider');

      consoleError.mockRestore();
    });

    it('debe proporcionar el hook correctamente dentro del AuthProvider', () => {
      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert
      expect(screen.getByTestId('isAuthenticated')).toBeTruthy();
      expect(screen.getByTestId('user')).toBeTruthy();
    });
  });

  describe('login', () => {
    it('debe actualizar el estado del usuario al hacer login', async () => {
      // Arrange - El botón usa estos valores hardcodeados
      const expectedUser = { documento: '123', token: 'token123' };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Act
      const loginButton = screen.getByTestId('login-btn');
      await act(async () => {
        loginButton.click();
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
        expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(expectedUser));
      });
      expect((localStorageMock.setItem as jest.Mock)).toHaveBeenCalledWith('user', JSON.stringify(expectedUser));
    });

    it('debe guardar el usuario en localStorage al hacer login', async () => {
      // Arrange
      const userData = { documento: '456', token: 'token456' };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Act
      const loginButton = screen.getByTestId('login-btn');
      await act(async () => {
        loginButton.click();
      });

      // Assert
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'user',
          JSON.stringify({ documento: '123', token: 'token123' })
        );
      });
    });

    it('debe actualizar isAuthenticated a true después del login', async () => {
      // Arrange
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');

      // Act
      const loginButton = screen.getByTestId('login-btn');
      await act(async () => {
        loginButton.click();
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      });
    });
  });

  describe('logout', () => {
    it('debe limpiar el estado del usuario al hacer logout', async () => {
      // Arrange
      const storedUser = { documento: '123', token: 'token123' };
      localStorageMock.setItem('user', JSON.stringify(storedUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Esperar a que se cargue el usuario
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      });

      // Act
      const logoutButton = screen.getByTestId('logout-btn');
      await act(async () => {
        logoutButton.click();
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
        expect(screen.getByTestId('user').textContent).toBe('null');
      });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('debe remover el usuario de localStorage al hacer logout', async () => {
      // Arrange
      const storedUser = { documento: '123', token: 'token123' };
      localStorageMock.setItem('user', JSON.stringify(storedUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      });

      // Act
      const logoutButton = screen.getByTestId('logout-btn');
      await act(async () => {
        logoutButton.click();
      });

      // Assert
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      });
    });

    it('debe actualizar isAuthenticated a false después del logout', async () => {
      // Arrange
      const storedUser = { documento: '123', token: 'token123' };
      localStorageMock.setItem('user', JSON.stringify(storedUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      });

      // Act
      const logoutButton = screen.getByTestId('logout-btn');
      await act(async () => {
        logoutButton.click();
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      });
    });
  });

  describe('isAuthenticated', () => {
    it('debe ser false cuando no hay usuario', () => {
      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    });

    it('debe ser true cuando hay usuario', async () => {
      // Arrange
      const storedUser = { documento: '123', token: 'token123' };
      localStorageMock.setItem('user', JSON.stringify(storedUser));

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      });
    });

    it('debe cambiar dinámicamente con login y logout', async () => {
      // Arrange
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Inicialmente false
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');

      // Login -> true
      const loginButton = screen.getByTestId('login-btn');
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      });

      // Logout -> false
      const logoutButton = screen.getByTestId('logout-btn');
      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      });
    });
  });

  describe('Integración completa', () => {
    it('debe mantener el estado del usuario a través de múltiples operaciones', async () => {
      // Arrange
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login
      const loginButton = screen.getByTestId('login-btn');
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      });

      // Logout
      const logoutButton = screen.getByTestId('logout-btn');
      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      });

      // Login nuevamente
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      });
    });
  });
});

