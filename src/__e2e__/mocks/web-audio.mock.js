// Mock for Web Audio API in tests
class MockAudioContext {
  currentTime = 0;
  state = 'suspended';
  destination = {};
  sampleRate = 44100;
  
  constructor() {}
  
  createGain() {
    return {
      gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
        cancelScheduledValues: jest.fn()
      },
      connect: jest.fn()
    };
  }
  
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        value: 440
      },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };
  }
  
  createConvolver() {
    return {
      buffer: null,
      connect: jest.fn()
    };
  }
  
  createBuffer(channels, length, sampleRate) {
    const channelData = new Float32Array(length).fill(0);
    return {
      getChannelData: jest.fn().mockReturnValue(channelData),
      length,
      sampleRate,
      numberOfChannels: channels
    };
  }
  
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

// Setup global window object with AudioContext
global.window = global.window || {};
global.window.AudioContext = MockAudioContext;
global.window.webkitAudioContext = MockAudioContext;
global.AudioContext = MockAudioContext;

// Mock setTimeout for testing
global.setTimeout = jest.fn((callback) => {
  callback();
  return 123; // Mock timeout ID
});

global.clearTimeout = jest.fn();

module.exports = { MockAudioContext };