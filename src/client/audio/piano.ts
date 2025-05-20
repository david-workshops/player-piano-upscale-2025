import * as Tone from 'tone';

interface AudioEngine {
  playNote: (note: number, velocity: number, duration: number) => void;
  setSustain: (on: boolean) => void;
  allNotesOff: () => void;
}

export function initAudio(): AudioEngine {
  // Create a polyphonic synthesizer
  const piano = new Tone.PolySynth(Tone.Synth).toDestination();
  
  // Set up basic piano-like envelope
  piano.set({
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.8,
      release: 1
    }
  });
  
  // Set up effects for more realistic piano sound
  const reverb = new Tone.Reverb({
    decay: 3,
    wet: 0.2
  }).toDestination();
  
  // Connect synth to effects
  piano.connect(reverb);
  
  // Active notes for sustain pedal
  const activeNotes = new Map<number, number>(); // Store Tone.Transport event IDs
  let sustainOn = false;

  // Convert MIDI note to frequency
  const midiToFreq = (note: number): string => {
    return Tone.Frequency(note, "midi").toNote();
  };
  
  // Convert MIDI velocity to Tone.js velocity (0-1)
  const velocityToGain = (velocity: number): number => {
    return velocity / 127;
  };
  
  return {
    playNote: (note: number, velocity: number, duration: number) => {
      // Convert MIDI values to Tone.js values
      const freq = midiToFreq(note);
      const vel = velocityToGain(velocity);
      const durationSeconds = duration / 1000;
      
      // Schedule note to play
      const now = Tone.now();
      
      // Play the note
      piano.triggerAttack(freq, now, vel);
      
      // If sustain is off, schedule the release
      if (!sustainOn) {
        const event = Tone.Transport.schedule(() => {
          piano.triggerRelease(freq);
        }, now + durationSeconds);
        
        // Store the event for potential cancellation
        activeNotes.set(note, event);
      } else {
        // If sustain is on, store the note without scheduling release
        activeNotes.set(note, -1); // Use a dummy value since we don't have an event ID
      }
    },
    
    setSustain: (on: boolean) => {
      sustainOn = on;
      
      // If sustain is turned off, release all notes that have completed their duration
      if (!on) {
        // Get current time
        const now = Tone.now();
        
        // Release all sustained notes
        activeNotes.forEach((eventId, note) => {
          if (eventId !== -1) {
            Tone.Transport.clear(eventId);
          }
          piano.triggerRelease(midiToFreq(note));
        });
        
        // Clear active notes
        activeNotes.clear();
      }
    },
    
    allNotesOff: () => {
      // Clear all scheduled events
      activeNotes.forEach(eventId => {
        if (eventId !== -1) {
          Tone.Transport.clear(eventId);
        }
      });
      
      // Release all notes
      piano.releaseAll();
      
      // Reset sustain
      sustainOn = false;
      
      // Clear active notes
      activeNotes.clear();
    }
  };
}