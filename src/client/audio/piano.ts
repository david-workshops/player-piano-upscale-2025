import * as Tone from 'tone';

interface AudioEngine {
  playNote: (note: number, velocity: number, duration: number) => void;
  setSustain: (on: boolean) => void;
  allNotesOff: () => void;
  startAudio: () => Promise<void>;
}

export function initAudio(): AudioEngine {
  // Create a polyphonic synthesizer
  // First check if Tone.js is properly loaded
  if (typeof Tone !== 'object' || !Tone.PolySynth) {
    console.error('Tone.js is not properly loaded or PolySynth is not available');
    // Provide a fallback implementation that logs errors instead of crashing
    return createFallbackAudioEngine();
  }
  
  // Create PolySynth with Tone.Synth as voice
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
  
  // Active notes for sustain pedal - store transportId (number) for each note
  const activeNotes = new Map<number, number>();
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
        const transportId = Tone.Transport.schedule(() => {
          piano.triggerRelease(freq);
        }, now + durationSeconds) as unknown as number;
        
        // Store the event ID for potential cancellation
        activeNotes.set(note, transportId);
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
        activeNotes.forEach((transportId, note) => {
          if (transportId !== -1) {
            Tone.Transport.clear(transportId);
          }
          piano.triggerRelease(midiToFreq(note));
        });
        
        // Clear active notes
        activeNotes.clear();
      }
    },
    
    allNotesOff: () => {
      // Clear all scheduled events
      activeNotes.forEach(transportId => {
        if (transportId !== -1) {
          Tone.Transport.clear(transportId);
        }
      });
      
      // Release all notes
      piano.releaseAll();
      
      // Reset sustain
      sustainOn = false;
      
      // Clear active notes
      activeNotes.clear();
    },
    
    startAudio: async () => {
      // This method will be called after user interaction to start audio context
      await Tone.start();
      console.log('Audio context started');
    }
  };
}

// Create a fallback audio engine that just logs actions but doesn't try to play sounds
// This is used when Tone.js fails to load properly
function createFallbackAudioEngine(): AudioEngine {
  console.warn('Using fallback audio engine - sounds will not play');
  return {
    playNote: (note: number, velocity: number, duration: number) => {
      console.log(`[Fallback] Play note: ${note}, velocity: ${velocity}, duration: ${duration}ms`);
    },
    setSustain: (on: boolean) => {
      console.log(`[Fallback] Set sustain: ${on}`);
    },
    allNotesOff: () => {
      console.log('[Fallback] All notes off');
    },
    startAudio: async () => {
      console.log('[Fallback] Audio context started (mock)');
      return Promise.resolve();
    }
  };
}