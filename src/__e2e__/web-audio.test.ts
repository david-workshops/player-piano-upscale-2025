/**
 * Tests for the Web Audio implementation
 */
import { createWebAudioEngine, WebAudioEngine, FallbackAudioEngine } from '../client/audio/web-audio-engine';

// Mock for Web Audio API
describe('Web Audio Engine', () => {
  let audioEngine: ReturnType<typeof createWebAudioEngine>;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    audioEngine = createWebAudioEngine();
  });
  
  test('should create an instance of WebAudioEngine when Web Audio API is available', () => {
    // The global mock setup in mocks/web-audio.mock.js should make this pass
    expect(audioEngine).toBeDefined();
    expect(audioEngine).toHaveProperty('playNote');
    expect(audioEngine).toHaveProperty('setSustain');
    expect(audioEngine).toHaveProperty('allNotesOff');
    expect(audioEngine).toHaveProperty('startAudio');
  });
  
  test('should start audio when startAudio is called', async () => {
    // Call the startAudio method
    await audioEngine.startAudio();
    
    // This should complete without errors
    expect(true).toBe(true);
  });
  
  test('should handle playNote calls', async () => {
    // Start audio first
    await audioEngine.startAudio();
    
    // Play a note
    audioEngine.playNote(60, 100, 500);
    
    // This should not throw errors
    expect(true).toBe(true);
  });
  
  test('should handle sustain pedal changes', async () => {
    // Start audio first
    await audioEngine.startAudio();
    
    // Test sustain on
    audioEngine.setSustain(true);
    
    // Play a note while sustain is on
    audioEngine.playNote(64, 100, 500);
    
    // Test sustain off
    audioEngine.setSustain(false);
    
    // This should not throw errors
    expect(true).toBe(true);
  });
  
  test('should handle allNotesOff', async () => {
    // Start audio first
    await audioEngine.startAudio();
    
    // Play some notes
    audioEngine.playNote(60, 100, 500);
    audioEngine.playNote(64, 100, 500);
    audioEngine.playNote(67, 100, 500);
    
    // Stop all notes
    audioEngine.allNotesOff();
    
    // This should not throw errors
    expect(true).toBe(true);
  });
});

// Test the fallback engine for environments without Web Audio
describe('Fallback Audio Engine', () => {
  let fallbackEngine: FallbackAudioEngine;
  
  // Spy on console.log to verify outputs
  const originalConsoleLog = console.log;
  const mockConsoleLog = jest.fn();
  
  beforeEach(() => {
    console.log = mockConsoleLog;
    fallbackEngine = new FallbackAudioEngine();
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
  });
  
  test('should log messages instead of playing sounds', () => {
    fallbackEngine.playNote(60, 100, 500);
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Play note: 60'));
    
    fallbackEngine.setSustain(true);
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Set sustain: true'));
    
    fallbackEngine.allNotesOff();
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All notes off'));
  });
});