module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__e2e__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__e2e__/setup.ts'],
  testTimeout: 10000,
  // Mock modules that don't work in JSDOM
  moduleNameMapper: {
    // Mock tone.js to prevent audio context errors
    'tone': '<rootDir>/src/__e2e__/mocks/tone.mock.js',
    // Mock socket.io-client for e2e tests
    'socket.io-client': '<rootDir>/src/__e2e__/mocks/socket.io-client.mock.js'
  },
};