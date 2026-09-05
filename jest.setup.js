// Mock global fetch
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock localStorage con funciones jest.fn() para poder hacer assertions
// Usamos un store compartido para mantener el estado
const localStorageStore = {};

const localStorageMock = {
  getItem: jest.fn((key) => {
    return localStorageStore[key] || null;
  }),
  setItem: jest.fn((key, value) => {
    localStorageStore[key] = value.toString();
  }),
  removeItem: jest.fn((key) => {
    delete localStorageStore[key];
  }),
  clear: jest.fn(() => {
    Object.keys(localStorageStore).forEach(key => {
      delete localStorageStore[key];
    });
  }),
  // Guardar referencia al store para acceso en tests
  __store: localStorageStore,
};

global.localStorage = localStorageMock;
// También asegurar que window.localStorage apunte al mismo mock (para jsdom)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
}

