/**
 * MIDI Note representation
 */
export interface MidiNote {
  /** MIDI note number (0-127) */
  noteNumber: number;
  /** Velocity (0-127) */
  velocity: number;
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp when the note was triggered */
  timestamp: number;
}

/**
 * MIDI Chord representation (collection of notes played simultaneously)
 */
export interface MidiChord {
  /** Notes in the chord */
  notes: MidiNote[];
  /** Timestamp when the chord was triggered */
  timestamp: number;
}

/**
 * Piano pedal types
 */
export enum PedalType {
  DAMPER = 'damper', // Sustain pedal
  SOSTENUTO = 'sostenuto',
  SOFT = 'soft'
}

/**
 * Piano pedal state
 */
export interface PedalState {
  /** Type of pedal */
  type: PedalType;
  /** Value between 0 (off) and 127 (fully pressed) */
  value: number;
  /** Timestamp when the pedal state was changed */
  timestamp: number;
}

/**
 * Musical key, scale, and mode information
 */
export interface MusicalContext {
  /** Root note (C, C#, D, etc.) */
  key: string;
  /** Scale (major, minor, etc.) */
  scale: string;
  /** Mode (ionian, dorian, etc.) */
  mode: string;
  /** Timestamp when the context was established */
  timestamp: number;
}

/**
 * All musical events that can be sent from server to client
 */
export type MusicalEvent = MidiNote | MidiChord | PedalState | MusicalContext;