// Helper compartido para crear mocks de Response
export const createMockResponse = (status: number, ok: boolean, data?: any): any => {
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

