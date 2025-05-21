/**
 * Represents a key configuration with key, scale, and mode
 */
export interface KeyConfig {
  key: string;
  scale: string;
  mode: string;
}

/**
 * Represents a note in a musical scale
 */
export interface ScaleNote {
  name: string;
  midiOffset: number;
}

/**
 * Represents a MIDI note with number, name, octave, and velocity
 */
export interface MidiNote {
  number: number;
  name: string;
  octave: number;
  velocity: number;
}

/**
 * Represents a MIDI control change event
 */
export interface MidiControlChange {
  type: 'controlChange';
  controller: number; // CC number
  value: number;      // CC value
  timestamp: number;  // Time of event
}

/**
 * Represents a MIDI note on event
 */
export interface MidiNoteOn {
  type: 'noteOn';
  note: MidiNote;
  timestamp: number;
}

/**
 * Represents a MIDI note off event
 */
export interface MidiNoteOff {
  type: 'noteOff';
  note: MidiNote;
  timestamp: number;
}

/**
 * Represents a MIDI system exclusive message
 */
export interface MidiSysEx {
  type: 'sysex';
  data: number[];
  timestamp: number;
}

/**
 * Union type for all MIDI events
 */
export type MidiEvent = MidiNoteOn | MidiNoteOff | MidiControlChange | MidiSysEx;