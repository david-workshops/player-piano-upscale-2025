/**
 * Types for MIDI data and musical parameters
 */

/**
 * MIDI Note interface representing a single note
 */
export interface MidiNote {
  pitch: number;      // MIDI pitch (0-127)
  velocity: number;   // MIDI velocity (0-127)
  duration: number;   // Duration in milliseconds
  startTime: number;  // Start time in milliseconds from generation start
}

/**
 * MIDI Chord interface representing multiple simultaneous notes
 */
export interface MidiChord {
  notes: MidiNote[];  // Array of notes in the chord
  startTime: number;  // Start time in milliseconds from generation start
}

/**
 * XP MIDI parameters for Enspire Pro disklavier system
 */
export interface XPMidiParams {
  pedalData?: PedalData;  // Optional pedal data
  extendedVelocity?: number;  // Extended velocity resolution
  extendedRelease?: number;   // Extended release velocity
}

/**
 * Pedal data for controlling piano pedals
 */
export interface PedalData {
  damper?: number;    // Damper/sustain pedal value (0-127)
  sostenuto?: number; // Sostenuto pedal value (0-127)
  soft?: number;      // Soft pedal value (0-127)
}

/**
 * Musical parameters for generation
 */
export interface MusicalParameters {
  key: string;        // Musical key (e.g., "C", "F#")
  scale: string;      // Scale type (e.g., "major", "minor", "dorian")
  mode: string;       // Mode name (e.g., "ionian", "lydian")
  tempo: number;      // Tempo in beats per minute
  density: number;    // Note density (0-1)
  range: {            // MIDI pitch range to use
    min: number;
    max: number;
  };
}