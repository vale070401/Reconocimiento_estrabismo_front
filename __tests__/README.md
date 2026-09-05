# Pruebas Unitarias

Este proyecto incluye un conjunto completo de pruebas unitarias equivalentes a JUnit5 y Mockito, utilizando Jest y las librerías de testing de React.

## Configuración

Las pruebas están configuradas usando:
- **Jest**: Framework de testing (equivalente a JUnit5)
- **@testing-library/react**: Para pruebas de componentes React
- **@testing-library/react-native**: Para pruebas específicas de React Native
- **Mocks**: Para simular dependencias externas (equivalente a Mockito)

## Estructura de Pruebas

```
services/__tests__/
  ├── authService.test.ts          # Pruebas para el servicio de autenticación
  ├── userService.test.ts          # Pruebas para el servicio de usuarios
  ├── patientService.test.ts       # Pruebas para el servicio de pacientes
  └── updateProfileService.test.ts # Pruebas para el servicio de actualización de perfil

context/__tests__/
  └── AuthContext.test.tsx         # Pruebas para el contexto de autenticación
```

## Ejecutar las Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo watch (desarrollo)
```bash
npm run test:watch
```

### Ejecutar pruebas con cobertura
```bash
npm run test:coverage
```

### Ejecutar pruebas específicas
```bash
npm test authService
npm test userService
npm test patientService
npm test updateProfileService
npm test AuthContext
```

## Cobertura de Pruebas

### authService.test.ts
- ✅ Login exitoso con token
- ✅ Manejo de errores de servidor no accesible
- ✅ Manejo de respuestas de error del servidor (401, 500, etc.)
- ✅ Manejo de errores de conexión
- ✅ Validación de datos enviados en la petición
- ✅ Manejo de errores desconocidos

### userService.test.ts
- ✅ `fetchWithTimeout`: Peticiones exitosas dentro del timeout
- ✅ `fetchWithTimeout`: Abortar peticiones que exceden el timeout
- ✅ `fetchWithTimeout`: Manejo de errores de red
- ✅ `fetchWithTimeout`: Validación de headers
- ✅ `registerUser`: Registro exitoso de usuarios
- ✅ `registerUser`: Manejo de errores del servidor
- ✅ `registerUser`: Validación de datos enviados

### patientService.test.ts
- ✅ Registro exitoso de pacientes
- ✅ Validación de todos los tipos de documento permitidos
- ✅ Validación de todos los géneros permitidos
- ✅ Manejo de campos opcionales (correo, numeroTele)
- ✅ Validación de token de autorización
- ✅ Manejo de errores del servidor
- ✅ Manejo de errores de conexión

### updateProfileService.test.ts
- ✅ Actualización exitosa de perfil con token
- ✅ Actualización de perfil sin token
- ✅ Validación de datos enviados
- ✅ Manejo de diferentes valores de edad
- ✅ Manejo de campos opcionales vacíos
- ✅ Manejo de errores del servidor
- ✅ Manejo de errores de conexión
- ✅ Manejo de errores de AsyncStorage

### AuthContext.test.tsx
- ✅ Inicialización correcta del contexto
- ✅ Carga de usuario desde localStorage
- ✅ Funcionalidad de login
- ✅ Funcionalidad de logout
- ✅ Estado de autenticación (isAuthenticated)
- ✅ Persistencia en localStorage
- ✅ Manejo de errores cuando se usa fuera del provider
- ✅ Flujos de integración completos

## Patrones de Testing Utilizados

### Arrange-Act-Assert (AAA)
Todas las pruebas siguen el patrón AAA:
- **Arrange**: Configurar mocks y datos de prueba
- **Act**: Ejecutar la función/método a probar
- **Assert**: Verificar los resultados esperados

### Mocks y Stubs
- `fetch` global mockeado para simular peticiones HTTP
- `AsyncStorage` mockeado para simular almacenamiento local
- `localStorage` mockeado para pruebas web

### Casos de Prueba Cubiertos
- ✅ Casos exitosos (happy path)
- ✅ Casos de error
- ✅ Casos límite (edge cases)
- ✅ Validación de datos
- ✅ Manejo de excepciones
- ✅ Integración entre componentes

## Mejores Prácticas Implementadas

1. **Aislamiento**: Cada prueba es independiente y no depende de otras
2. **Limpieza**: `beforeEach` y `afterEach` para limpiar mocks entre pruebas
3. **Nombres descriptivos**: Los nombres de las pruebas describen claramente qué se está probando
4. **Cobertura completa**: Se prueban tanto casos exitosos como casos de error
5. **Validación exhaustiva**: Se verifica tanto el resultado como los parámetros de las llamadas

## Notas

- Las pruebas utilizan `jest.fn()` para crear mocks (equivalente a Mockito's `mock()`)
- Se utiliza `jest.clearAllMocks()` en `beforeEach` para asegurar que cada prueba comience limpia
- Los timeouts se manejan usando `jest.useFakeTimers()` para controlar el tiempo en las pruebas
- Las pruebas de React utilizan `@testing-library/react` para renderizar y probar componentes

