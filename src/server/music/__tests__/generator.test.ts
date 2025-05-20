import { MusicGenerator } from '../generator';
import { MidiEvent } from '../../midi/stream';

describe('MusicGenerator', () => {
  let musicGenerator: MusicGenerator;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
    musicGenerator = new MusicGenerator(mockCallback);
  });

  it('should call callback with initial music parameters', () => {
    expect(mockCallback).toHaveBeenCalledWith({
      key: 'C',
      scale: 'major',
      mode: 'ionian'
    });
  });

  it('should generate different types of MIDI events', () => {
    const events: MidiEvent[] = [];
    
    // Generate a bunch of events to test the distribution
    for (let i = 0; i < 20; i++) {
      events.push(musicGenerator.generateNextEvent());
    }
    
    // Check note events
    const noteEvents = events.filter(event => event.type === 'note');
    expect(noteEvents.length).toBeGreaterThan(0);
    
    // Each event should have a timestamp
    events.forEach(event => {
      expect(event.timestamp).toBeDefined();
      expect(typeof event.timestamp).toBe('number');
    });
  });

  it('should expose current musical parameters', () => {
    expect(musicGenerator.getCurrentKey()).toBeDefined();
    expect(musicGenerator.getCurrentScale()).toBeDefined();
    expect(musicGenerator.getCurrentMode()).toBeDefined();
  });
});