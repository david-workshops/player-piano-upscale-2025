/**
 * Music theory utilities
 */

// Note names with and without sharps
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Common scales defined by their intervals in semitones
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  wholeTone: [0, 2, 4, 6, 8, 10],
  octatonic: [0, 2, 3, 5, 6, 8, 9, 11]
};

// Modes based on major scale
export const MODES = {
  ionian: 0,     // Same as major
  dorian: 1,     // Starting on 2nd degree of major scale
  phrygian: 2,   // Starting on 3rd degree of major scale
  lydian: 3,     // Starting on 4th degree of major scale
  mixolydian: 4, // Starting on 5th degree of major scale
  aeolian: 5,    // Starting on 6th degree (natural minor)
  locrian: 6     // Starting on 7th degree of major scale
};

/**
 * Converts a note name and octave to MIDI note number
 * @param noteName Note name (e.g., "C", "F#")
 * @param octave Octave number (e.g., 4 for middle C)
 * @returns MIDI note number (0-127)
 */
export function noteToMidi(noteName: string, octave: number): number {
  const noteIndex = NOTES.indexOf(noteName);
  if (noteIndex === -1) {
    // Try with flat notation
    const flatIndex = NOTES_FLAT.indexOf(noteName);
    if (flatIndex === -1) {
      throw new Error(`Invalid note name: ${noteName}`);
    }
    return flatIndex + (octave + 1) * 12;
  }
  return noteIndex + (octave + 1) * 12;
}

/**
 * Converts a MIDI note number to note name and octave
 * @param midiNote MIDI note number (0-127)
 * @param useFlats Whether to use flat notation instead of sharps
 * @returns Object with note name and octave
 */
export function midiToNote(midiNote: number, useFlats = false): { note: string; octave: number } {
  const noteNames = useFlats ? NOTES_FLAT : NOTES;
  const octave = Math.floor(midiNote / 12) - 1;
  const note = noteNames[midiNote % 12];
  return { note, octave };
}

/**
 * Gets the notes of a scale
 * @param rootNote Root note name (e.g., "C", "F#")
 * @param rootOctave Root note octave
 * @param scaleType Scale type (e.g., "major", "naturalMinor")
 * @param numOctaves Number of octaves to generate
 * @returns Array of MIDI note numbers
 */
export function getScale(
  rootNote: string,
  rootOctave: number,
  scaleType: keyof typeof SCALES,
  numOctaves = 1
): number[] {
  const rootMidi = noteToMidi(rootNote, rootOctave);
  const intervals = SCALES[scaleType];
  
  const notes: number[] = [];
  for (let octave = 0; octave < numOctaves; octave++) {
    for (const interval of intervals) {
      const note = rootMidi + interval + (octave * 12);
      if (note <= 127) { // Max MIDI note
        notes.push(note);
      }
    }
  }
  return notes;
}

/**
 * Gets the notes of a mode
 * @param rootNote Root note name
 * @param rootOctave Root note octave
 * @param mode Mode name (e.g., "dorian", "mixolydian")
 * @param numOctaves Number of octaves to generate
 * @returns Array of MIDI note numbers
 */
export function getMode(
  rootNote: string,
  rootOctave: number,
  mode: keyof typeof MODES,
  numOctaves = 1
): number[] {
  // Find the major scale that this mode is derived from
  const modeOffset = MODES[mode];
  const rootMidi = noteToMidi(rootNote, rootOctave);
  
  // Find the root of the major scale this mode is based on
  const majorScaleRoot = (rootMidi - SCALES.major[modeOffset] + 12) % 12;
  const majorScaleRootOctave = rootOctave - (modeOffset > 0 && majorScaleRoot > rootMidi % 12 ? 1 : 0);
  
  const majorScaleRootNote = NOTES[majorScaleRoot];
  const majorScale = getScale(majorScaleRootNote, majorScaleRootOctave, 'major', numOctaves + 1);
  
  // Extract the mode starting from the correct position
  const modeIndex = majorScale.indexOf(rootMidi);
  if (modeIndex === -1) {
    throw new Error('Could not find mode root note in scale');
  }
  
  const notes: number[] = [];
  const totalNotes = numOctaves * 7; // 7 notes per octave in diatonic scales
  
  for (let i = 0; i < totalNotes; i++) {
    const index = modeIndex + i;
    if (index < majorScale.length) {
      notes.push(majorScale[index]);
    }
  }
  
  return notes;
}

/**
 * Generates a chord from a scale/mode
 * @param scaleNotes Array of MIDI note numbers in the scale/mode
 * @param startIndex Starting position in the scale
 * @param intervals Intervals for the chord (e.g., [0, 2, 4] for a triad)
 * @returns Array of MIDI note numbers forming the chord
 */
export function getChord(
  scaleNotes: number[],
  startIndex: number,
  intervals: number[] = [0, 2, 4]
): number[] {
  return intervals.map(interval => {
    const index = (startIndex + interval) % scaleNotes.length;
    return scaleNotes[index];
  });
}

/**
 * Generates a random musical context (key, scale, mode)
 * @returns Random musical context
 */
export function generateRandomContext(): { key: string; scale: string; mode: string } {
  const keys = NOTES;
  const scaleTypes = Object.keys(SCALES);
  const modeTypes = Object.keys(MODES);
  
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const randomScale = scaleTypes[Math.floor(Math.random() * scaleTypes.length)];
  const randomMode = modeTypes[Math.floor(Math.random() * modeTypes.length)];
  
  return {
    key: randomKey,
    scale: randomScale,
    mode: randomMode
  };
}