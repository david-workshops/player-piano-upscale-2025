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
  const activeNotes = new Map<number, Tone.ToneEvent>();
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
        activeNotes.set(note, new Tone.ToneEvent());
      }
    },
    
    setSustain: (on: boolean) => {
      sustainOn = on;
      
      // If sustain is turned off, release all notes that have completed their duration
      if (!on) {
        // Get current time
        const now = Tone.now();
        
        // Release all sustained notes
        activeNotes.forEach((event, note) => {
          Tone.Transport.clear(event);
          piano.triggerRelease(midiToFreq(note));
        });
        
        // Clear active notes
        activeNotes.clear();
      }
    },
    
    allNotesOff: () => {
      // Clear all scheduled events
      activeNotes.forEach(event => {
        Tone.Transport.clear(event);
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