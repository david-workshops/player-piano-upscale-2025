import { MidiEvent, MidiNote, KeyConfig } from '../../shared/types';
import { getScaleNotes, getPianoRange } from './theory';

/**
 * Generates a sequence of MIDI events for minimalist counterpoint music
 * @param keyConfig - Current key, scale and mode configuration
 * @returns Array of MIDI events
 */
export function generateMidiSequence(keyConfig: KeyConfig): MidiEvent[] {
  const events: MidiEvent[] = [];
  const pianoRange = getPianoRange();
  const scaleNotes = getScaleNotes(keyConfig);
  
  // Decide if this should be a moment of silence
  // This creates "breathing room" in the music
  if (Math.random() < 0.2) {
    return events; // Return empty array for silence
  }
  
  // Determine number of notes to play simultaneously
  // This creates the "impossible for human" piano piece effect
  const notesCount = Math.floor(Math.random() * 8) + 1; // 1-8 notes
  
  // For each note we want to play
  for (let i = 0; i < notesCount; i++) {
    // Select a note from our scale across the full piano range
    const scaleNote = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
    const octave = Math.floor(Math.random() * 7) + 1; // Piano range octaves 1-7
    
    // MIDI note number (C4 = 60)
    const noteNumber = ((octave + 1) * 12) + scaleNote.midiOffset;
    
    // Ensure note is within piano range
    if (noteNumber < pianoRange.min || noteNumber > pianoRange.max) {
      continue;
    }
    
    // Add note on event
    const velocity = Math.floor(Math.random() * 40) + 60; // 60-99 velocity (medium to loud)
    events.push({
      type: 'noteOn',
      note: {
        number: noteNumber,
        name: scaleNote.name,
        octave: octave,
        velocity: velocity
      },
      timestamp: Date.now()
    });
    
    // Occasionally add pedal events
    if (Math.random() < 0.1) {
      // Decide which pedal to use
      const pedalType = Math.random();
      if (pedalType < 0.6) {
        // Sustain/damper pedal (most common)
        events.push({
          type: 'controlChange',
          controller: 64, // Sustain pedal
          value: 127, // On
          timestamp: Date.now()
        });
      } else if (pedalType < 0.8) {
        // Sostenuto pedal
        events.push({
          type: 'controlChange',
          controller: 66, // Sostenuto pedal
          value: 127, // On
          timestamp: Date.now()
        });
      } else {
        // Soft pedal
        events.push({
          type: 'controlChange',
          controller: 67, // Soft pedal
          value: 127, // On
          timestamp: Date.now()
        });
      }
    }
  }
  
  // Add XP MIDI data for Enspire Pro if needed
  if (Math.random() < 0.3) { // Occasionally add XP MIDI data
    events.push({
      type: 'sysex',
      data: generateXPMidiData(),
      timestamp: Date.now()
    });
  }
  
  return events;
}

/**
 * Generates XP MIDI SysEx data for Enspire Pro Disklavier
 * @returns Array of numbers representing SysEx data
 */
function generateXPMidiData(): number[] {
  // This is a simplified example of XP MIDI SysEx data
  // In a real application, this would be more complex and specific to Disklavier
  return [
    0xF0, // SysEx start
    0x43, // Yamaha manufacturer ID
    0x73, // XP MIDI ID
    // Additional bytes would go here for actual Disklavier control
    0xF7  // SysEx end
  ];
}