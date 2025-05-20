import { MidiStreamer } from '../stream';
import { Server } from 'socket.io';

// Mock socket.io
jest.mock('socket.io', () => {
  return {
    Server: jest.fn().mockImplementation(() => {
      return {
        emit: jest.fn()
      };
    })
  };
});

describe('MidiStreamer', () => {
  let midiStreamer: MidiStreamer;
  let mockServer: any;

  beforeEach(() => {
    jest.useFakeTimers();
    mockServer = new Server();
    midiStreamer = new MidiStreamer(mockServer);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start and stop streaming', () => {
    // Start streaming
    midiStreamer.startStreaming();
    
    // Verify that emitting occurs after an interval
    jest.advanceTimersByTime(1000);
    expect(mockServer.emit).toHaveBeenCalledWith('midiEvent', expect.any(Object));
    
    // Stop streaming
    midiStreamer.stopStreaming();
    
    // Verify all notes off message was sent
    expect(mockServer.emit).toHaveBeenCalledWith('allNotesOff');
    
    // Clear mock calls
    mockServer.emit.mockClear();
    
    // Verify no more events are emitted after stopping
    jest.advanceTimersByTime(1000);
    expect(mockServer.emit).not.toHaveBeenCalled();
  });

  it('should provide current musical parameters', () => {
    const params = midiStreamer.getCurrentMusicalParameters();
    expect(params).toHaveProperty('key');
    expect(params).toHaveProperty('scale');
    expect(params).toHaveProperty('mode');
  });
});