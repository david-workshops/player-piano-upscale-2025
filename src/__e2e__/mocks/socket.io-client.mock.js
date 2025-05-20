// Mock for socket.io-client in E2E tests
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
  id: 'mock-socket-id'
};

// Export a function that returns the mock socket
const io = jest.fn().mockReturnValue(mockSocket);

// Add a reference to the mock socket instance for tests to access
io.mockSocket = mockSocket;

module.exports = io;