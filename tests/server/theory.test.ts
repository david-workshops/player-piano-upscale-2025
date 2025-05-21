import { getScaleNotes, getPianoRange } from '../../src/server/midi/theory';

describe('Music Theory Functions', () => {
  describe('getPianoRange', () => {
    it('should return the correct range for a standard piano', () => {
      const range = getPianoRange();
      
      expect(range.min).toBe(21); // A0, lowest key
      expect(range.max).toBe(108); // C8, highest key
    });
  });
  
  describe('getScaleNotes', () => {
    it('should return correct notes for C major scale', () => {
      const notes = getScaleNotes({ key: 'C', scale: 'major', mode: 'ionian' });
      
      // C major scale: C, D, E, F, G, A, B
      expect(notes).toHaveLength(7);
      expect(notes[0].name).toBe('C');
      expect(notes[1].name).toBe('D');
      expect(notes[2].name).toBe('E');
      expect(notes[3].name).toBe('F');
      expect(notes[4].name).toBe('G');
      expect(notes[5].name).toBe('A');
      expect(notes[6].name).toBe('B');
    });
    
    it('should return correct notes for A minor scale', () => {
      const notes = getScaleNotes({ key: 'A', scale: 'minor', mode: 'aeolian' });
      
      // A minor scale: A, B, C, D, E, F, G
      expect(notes).toHaveLength(7);
      expect(notes[0].name).toBe('A');
      expect(notes[1].name).toBe('B');
      expect(notes[2].name).toBe('C');
      expect(notes[3].name).toBe('D');
      expect(notes[4].name).toBe('E');
      expect(notes[5].name).toBe('F');
      expect(notes[6].name).toBe('G');
    });
    
    it('should handle different modes correctly', () => {
      const notes = getScaleNotes({ key: 'C', scale: 'major', mode: 'dorian' });
      
      // C dorian should be like D dorian but starting on C
      // So: C, D, Eb, F, G, A, Bb
      expect(notes).toHaveLength(7);
      expect(notes[0].name).toBe('C');
      expect(notes[2].midiOffset).toBe(3); // Eb
      expect(notes[6].midiOffset).toBe(10); // Bb
    });
  });
});