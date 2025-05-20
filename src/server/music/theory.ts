/**
 * Music Theory Utilities
 * Provides functions for working with musical keys, scales, and modes
 */

// MIDI note values for C (base octave)
const NOTE_C = 0;
const NOTE_C_SHARP = 1;
const NOTE_D = 2;
const NOTE_D_SHARP = 3;
const NOTE_E = 4;
const NOTE_F = 5;
const NOTE_F_SHARP = 6;
const NOTE_G = 7;
const NOTE_G_SHARP = 8;
const NOTE_A = 9;
const NOTE_A_SHARP = 10;
const NOTE_B = 11;

// Map key strings to base MIDI values
const KEY_TO_MIDI: { [key: string]: number } = {
  'C': NOTE_C,
  'C#': NOTE_C_SHARP,
  'Db': NOTE_C_SHARP,
  'D': NOTE_D,
  'D#': NOTE_D_SHARP,
  'Eb': NOTE_D_SHARP,
  'E': NOTE_E,
  'F': NOTE_F,
  'F#': NOTE_F_SHARP,
  'Gb': NOTE_F_SHARP,
  'G': NOTE_G,
  'G#': NOTE_G_SHARP,
  'Ab': NOTE_G_SHARP,
  'A': NOTE_A,
  'A#': NOTE_A_SHARP,
  'Bb': NOTE_A_SHARP,
  'B': NOTE_B,
};

// Scale patterns (semitone intervals from root)
const SCALE_PATTERNS: { [key: string]: number[] } = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'minor': [0, 2, 3, 5, 7, 8, 10],
  'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
  'melodic_minor': [0, 2, 3, 5, 7, 9, 11],
  'pentatonic': [0, 2, 4, 7, 9],
  'blues': [0, 3, 5, 6, 7, 10],
  'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

// Mode rotations (0 = ionian/major, 1 = dorian, etc.)
const MODE_ROTATIONS: { [key: string]: number } = {
  'ionian': 0,
  'dorian': 1,
  'phrygian': 2,
  'lydian': 3,
  'mixolydian': 4,
  'aeolian': 5,
  'locrian': 6,
};

/**
 * Get MIDI note values for a given key and scale
 * @param key - The root key (e.g., "C", "F#")
 * @param scale - The scale type (e.g., "major", "minor")
 * @returns Array of MIDI note values (0-11) for the scale
 */
export function getScaleNotes(key: string, scale: string): number[] {
  const rootNote = KEY_TO_MIDI[key] || 0;
  const pattern = SCALE_PATTERNS[scale] || SCALE_PATTERNS.major;
  
  return pattern.map(interval => (rootNote + interval) % 12);
}

/**
 * Get MIDI note values for a given key, scale, and mode
 * @param key - The root key (e.g., "C", "F#")
 * @param scale - The scale type (e.g., "major", "minor")
 * @param mode - The mode name (e.g., "ionian", "dorian")
 * @returns Array of MIDI note values (0-11) for the mode
 */
export function getModeNotes(key: string, scale: string, mode: string): number[] {
  let scaleNotes = getScaleNotes(key, scale);
  
  // If mode is specified, rotate the scale
  if (mode && mode !== 'ionian' && scale === 'major') {
    const rotation = MODE_ROTATIONS[mode] || 0;
    scaleNotes = [...scaleNotes.slice(rotation), ...scaleNotes.slice(0, rotation)];
    
    // Adjust notes to be relative to the new root
    const newRoot = scaleNotes[0];
    scaleNotes = scaleNotes.map(note => note % 12);
  }
  
  return scaleNotes;
}

/**
 * Get the name of a MIDI note
 * @param midiValue - MIDI note value (0-127)
 * @returns String representation of the note (e.g., "C4")
 */
export function getMidiNoteName(midiValue: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pitchClass = midiValue % 12;
  const octave = Math.floor(midiValue / 12) - 1;
  
  return `${noteNames[pitchClass]}${octave}`;
}