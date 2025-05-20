// Mock for Tone.js in E2E tests
const Tone = {
  // Main Tone classes
  PolySynth: jest.fn().mockImplementation(function() {
    return {
      toDestination: jest.fn().mockReturnThis(),
      connect: jest.fn(),
      set: jest.fn(),
      triggerAttack: jest.fn(),
      triggerRelease: jest.fn(),
      releaseAll: jest.fn()
    };
  }),
  Synth: jest.fn().mockImplementation(function() {
    return {
      toDestination: jest.fn().mockReturnThis(),
      connect: jest.fn(),
      triggerAttack: jest.fn(),
      triggerRelease: jest.fn()
    };
  }),
  Reverb: jest.fn().mockImplementation(function() {
    return {
      toDestination: jest.fn().mockReturnThis()
    };
  }),
  // Transport for scheduling
  Transport: {
    schedule: jest.fn().mockReturnValue(123), // Return a mock ID
    clear: jest.fn()
  },
  // Utilities
  start: jest.fn().mockResolvedValue(undefined),
  now: jest.fn().mockReturnValue(0),
  Frequency: jest.fn().mockImplementation((note) => {
    return {
      toNote: jest.fn().mockReturnValue(`A${note % 12}`)
    };
  })
};

module.exports = Tone;