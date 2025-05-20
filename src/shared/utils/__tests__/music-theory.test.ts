import {
  noteToMidi,
  midiToNote,
  getScale,
  getMode,
  getChord,
  SCALES,
  MODES
} from '../music-theory';

describe('Music Theory Utilities', () => {
  describe('noteToMidi', () => {
    test('converts C4 (middle C) to MIDI note 60', () => {
      expect(noteToMidi('C', 4)).toBe(60);
    });
    
    test('converts A4 (440Hz) to MIDI note 69', () => {
      expect(noteToMidi('A', 4)).toBe(69);
    });
    
    test('converts F#5 to MIDI note 78', () => {
      expect(noteToMidi('F#', 5)).toBe(78);
    });
    
    test('converts Bb3 to MIDI note 58 (using flat notation)', () => {
      expect(noteToMidi('Bb', 3)).toBe(58);
    });
    
    test('throws error for invalid note name', () => {
      expect(() => noteToMidi('H', 4)).toThrow();
    });
  });
  
  describe('midiToNote', () => {
    test('converts MIDI note 60 to C4', () => {
      const { note, octave } = midiToNote(60);
      expect(note).toBe('C');
      expect(octave).toBe(4);
    });
    
    test('converts MIDI note 69 to A4', () => {
      const { note, octave } = midiToNote(69);
      expect(note).toBe('A');
      expect(octave).toBe(4);
    });
    
    test('converts MIDI note 61 to C#4 (using sharps)', () => {
      const { note, octave } = midiToNote(61);
      expect(note).toBe('C#');
      expect(octave).toBe(4);
    });
    
    test('converts MIDI note 61 to Db4 (using flats)', () => {
      const { note, octave } = midiToNote(61, true);
      expect(note).toBe('Db');
      expect(octave).toBe(4);
    });
  });
  
  describe('getScale', () => {
    test('generates C major scale correctly', () => {
      const cMajorScale = getScale('C', 4, 'major');
      // C4, D4, E4, F4, G4, A4, B4
      expect(cMajorScale).toEqual([60, 62, 64, 65, 67, 69, 71]);
    });
    
    test('generates A minor scale correctly', () => {
      const aMinorScale = getScale('A', 4, 'naturalMinor');
      // A4, B4, C5, D5, E5, F5, G5
      expect(aMinorScale).toEqual([69, 71, 72, 74, 76, 77, 79]);
    });
    
    test('generates F# pentatonic major scale correctly', () => {
      const fSharpPentScale = getScale('F#', 3, 'pentatonicMajor');
      // F#3, G#3, A#3, C#4, D#4
      expect(fSharpPentScale).toEqual([54, 56, 58, 61, 63]);
    });
    
    test('generates multiple octaves correctly', () => {
      const cMajorTwoOctaves = getScale('C', 4, 'major', 2);
      // C4 through B5
      expect(cMajorTwoOctaves.length).toBe(14); // 7 notes per octave * 2
      expect(cMajorTwoOctaves[0]).toBe(60); // C4
      expect(cMajorTwoOctaves[13]).toBe(83); // B5
    });
  });
  
  describe('getMode', () => {
    test('generates C ionian mode correctly (same as C major)', () => {
      const cIonian = getMode('C', 4, 'ionian');
      expect(cIonian).toEqual([60, 62, 64, 65, 67, 69, 71]); // C4, D4, E4, F4, G4, A4, B4
    });
    
    test('generates D dorian mode correctly', () => {
      const dDorian = getMode('D', 4, 'dorian');
      expect(dDorian).toEqual([62, 64, 65, 67, 69, 71, 72]); // D4, E4, F4, G4, A4, B4, C5
    });
    
    test('generates E phrygian mode correctly', () => {
      const ePhrygian = getMode('E', 4, 'phrygian');
      expect(ePhrygian).toEqual([64, 65, 67, 69, 71, 72, 74]); // E4, F4, G4, A4, B4, C5, D5
    });
  });
  
  describe('getChord', () => {
    test('generates a C major triad correctly', () => {
      const cMajorScale = getScale('C', 4, 'major');
      const cMajorTriad = getChord(cMajorScale, 0); // Starting on first note (C)
      expect(cMajorTriad).toEqual([60, 64, 67]); // C4, E4, G4
    });
    
    test('generates a D minor triad correctly', () => {
      const cMajorScale = getScale('C', 4, 'major');
      const dMinorTriad = getChord(cMajorScale, 1); // Starting on second note (D)
      expect(dMinorTriad).toEqual([62, 65, 69]); // D4, F4, A4
    });
    
    test('generates a C major seventh chord correctly', () => {
      const cMajorScale = getScale('C', 4, 'major');
      const cMajor7 = getChord(cMajorScale, 0, [0, 2, 4, 6]); // Adding 7th
      expect(cMajor7).toEqual([60, 64, 67, 71]); // C4, E4, G4, B4
    });
  });
});