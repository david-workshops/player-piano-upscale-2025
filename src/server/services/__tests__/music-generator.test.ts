import { MusicGenerator } from '../music-generator';
import { MidiNote, MidiChord, PedalState, MusicalContext } from '../../../shared/types/music';

describe('MusicGenerator', () => {
  let musicGenerator: MusicGenerator;
  
  beforeEach(() => {
    musicGenerator = new MusicGenerator();
  });
  
  test('initializes with a valid musical context', () => {
    const context = musicGenerator.getCurrentContext();
    
    expect(context).toBeDefined();
    expect(context.key).toBeDefined();
    expect(context.scale).toBeDefined();
    expect(context.mode).toBeDefined();
    expect(context.timestamp).toBeDefined();
  });
  
  test('generates valid time interval between events', () => {
    const interval = musicGenerator.getTimeUntilNextEvent();
    
    expect(interval).toBeGreaterThanOrEqual(300); // minInterval
    expect(interval).toBeLessThanOrEqual(2000);  // maxInterval
  });
  
  test('generates valid musical events', () => {
    const event = musicGenerator.generateNextEvent();
    
    // Event should be one of: MidiNote, MidiChord, PedalState, or MusicalContext
    
    // Check if it's a MidiNote
    if ('noteNumber' in event) {
      const note = event as MidiNote;
      expect(note.noteNumber).toBeGreaterThanOrEqual(0);
      expect(note.noteNumber).toBeLessThanOrEqual(127);
      expect(note.velocity).toBeGreaterThanOrEqual(40); // minVelocity
      expect(note.velocity).toBeLessThanOrEqual(100); // maxVelocity
      expect(note.duration).toBeGreaterThanOrEqual(500); // minDuration
      expect(note.duration).toBeLessThanOrEqual(4000); // maxDuration
      expect(note.timestamp).toBeDefined();
    }
    // Check if it's a MidiChord
    else if ('notes' in event) {
      const chord = event as MidiChord;
      expect(Array.isArray(chord.notes)).toBe(true);
      expect(chord.notes.length).toBeGreaterThan(0);
      
      // Check each note in the chord
      chord.notes.forEach(note => {
        expect(note.noteNumber).toBeGreaterThanOrEqual(0);
        expect(note.noteNumber).toBeLessThanOrEqual(127);
        expect(note.velocity).toBeGreaterThanOrEqual(40);
        expect(note.velocity).toBeLessThanOrEqual(100);
      });
      
      expect(chord.timestamp).toBeDefined();
    }
    // Check if it's a PedalState
    else if ('type' in event && 'value' in event) {
      const pedal = event as PedalState;
      expect(['damper', 'sostenuto', 'soft']).toContain(pedal.type);
      expect(pedal.value).toBeGreaterThanOrEqual(0);
      expect(pedal.value).toBeLessThanOrEqual(127);
      expect(pedal.timestamp).toBeDefined();
    }
    // Check if it's a MusicalContext
    else if ('key' in event && 'scale' in event && 'mode' in event) {
      const context = event as MusicalContext;
      expect(context.key).toBeDefined();
      expect(context.scale).toBeDefined();
      expect(context.mode).toBeDefined();
      expect(context.timestamp).toBeDefined();
    }
    else {
      // If none of the above, this test should fail
      expect(true).toBe(false);
    }
  });
  
  // Generate multiple events to test distribution
  test('generates a variety of event types over multiple calls', () => {
    const eventCounts = {
      note: 0,
      chord: 0,
      pedal: 0,
      context: 0
    };
    
    // Generate a significant number of events to test distribution
    for (let i = 0; i < 100; i++) {
      const event = musicGenerator.generateNextEvent();
      
      if ('noteNumber' in event) {
        eventCounts.note++;
      } else if ('notes' in event) {
        eventCounts.chord++;
      } else if ('type' in event && 'value' in event) {
        eventCounts.pedal++;
      } else if ('key' in event && 'scale' in event && 'mode' in event) {
        eventCounts.context++;
      }
    }
    
    // We expect to see at least some of each type (though context changes are rare)
    expect(eventCounts.note + eventCounts.chord).toBeGreaterThan(0);
    
    // Log counts for information
    console.log('Event distribution:', eventCounts);
  });
});