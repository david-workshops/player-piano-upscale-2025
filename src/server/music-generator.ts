import { MidiEvent, Note, Scale, Pedal } from '../shared/types';

// Music theory constants
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES: Record<Scale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
};

// State variables
let currentKey = Math.floor(Math.random() * 12); // 0-11 for C through B
let currentScale: Scale = 'major';
let lastModeChangeTime = Date.now();
let noteCounter = 0;
let density = 0.7; // Probability of generating a note vs. silence

// Helper function to get notes in the current key and scale
function getScaleNotes(): number[] {
  return SCALES[currentScale].map(interval => (currentKey + interval) % 12);
}

// Helper function to generate a random note in the current key and scale
function generateRandomNote(octaveRange = { min: 1, max: 7 }): Note {
  const scaleNotes = getScaleNotes();
  const noteIndex = Math.floor(Math.random() * scaleNotes.length);
  const note = scaleNotes[noteIndex];
  const octave = Math.floor(Math.random() * (octaveRange.max - octaveRange.min + 1)) + octaveRange.min;
  const midiNum = note + (octave * 12) + 12; // MIDI note numbers start at C0 = 12
  
  return {
    name: NOTES[note],
    octave,
    midiNumber: midiNum,
    velocity: Math.floor(Math.random() * 40) + 60, // 60-100
    duration: Math.random() * 2000 + 500, // 500-2500ms
  };
}

// Function to generate chords in the current key and scale
function generateChord(numNotes = 3): Note[] {
  const scaleNotes = getScaleNotes();
  const rootIndex = Math.floor(Math.random() * scaleNotes.length);
  const rootNote = scaleNotes[rootIndex];
  
  const chordNotes: Note[] = [];
  
  // Add root note
  const rootOctave = Math.floor(Math.random() * 3) + 3; // Octaves 3-5
  chordNotes.push({
    name: NOTES[rootNote],
    octave: rootOctave,
    midiNumber: rootNote + (rootOctave * 12) + 12,
    velocity: Math.floor(Math.random() * 30) + 70, // 70-100
    duration: Math.random() * 3000 + 2000, // 2000-5000ms
  });
  
  // Add other chord tones (using 3rds)
  for (let i = 1; i < numNotes; i++) {
    const nextIndex = (rootIndex + (i * 2)) % scaleNotes.length;
    const nextNote = scaleNotes[nextIndex];
    const nextOctave = rootOctave + (nextIndex < rootIndex ? 1 : 0);
    
    chordNotes.push({
      name: NOTES[nextNote],
      octave: nextOctave,
      midiNumber: nextNote + (nextOctave * 12) + 12,
      velocity: Math.floor(Math.random() * 20) + 60, // 60-80
      duration: chordNotes[0].duration * (0.8 + Math.random() * 0.4), // Slight variation from root
    });
  }
  
  return chordNotes;
}

// Occasionally change key, scale, or mode
function maybeChangeMusicalContext(): void {
  const now = Date.now();
  
  // Change approximately every 3-5 minutes
  if (now - lastModeChangeTime > (3 * 60 * 1000) && Math.random() < 0.01) {
    // 1% chance per check when we're past the minimum time
    const changeType = Math.floor(Math.random() * 3);
    
    if (changeType === 0) {
      // Change key
      currentKey = Math.floor(Math.random() * 12);
    } else if (changeType === 1) {
      // Change scale
      const scaleNames = Object.keys(SCALES) as Scale[];
      currentScale = scaleNames[Math.floor(Math.random() * scaleNames.length)];
    } else {
      // Change both
      currentKey = Math.floor(Math.random() * 12);
      const scaleNames = Object.keys(SCALES) as Scale[];
      currentScale = scaleNames[Math.floor(Math.random() * scaleNames.length)];
    }
    
    lastModeChangeTime = now;
  }
}

// Track last time sustain pedal was turned off
let lastSustainOffTime = Date.now();
let sustainPedalEnabled = true;

// Decide which pedal to use
function decidePedal(): Pedal | null {
  const rand = Math.random();
  const now = Date.now();
  
  // Ensure long periods without sustain pedal (at least 15-30 seconds)
  const timeSinceLastOff = now - lastSustainOffTime;
  if (!sustainPedalEnabled && timeSinceLastOff > 15000 + Math.random() * 15000) {
    sustainPedalEnabled = true;
  } else if (sustainPedalEnabled && Math.random() < 0.01) {
    // Occasionally disable sustain pedal for a period
    sustainPedalEnabled = false;
    lastSustainOffTime = now;
    return { type: 'sustain', value: 0 }; // Turn off sustain pedal
  }
  
  if (rand < 0.05 && sustainPedalEnabled) {
    return { type: 'sustain', value: Math.random() * 0.5 + 0.5 }; // 0.5-1.0
  } else if (rand < 0.1) {
    return { type: 'sostenuto', value: 1 };
  } else if (rand < 0.15) {
    return { type: 'soft', value: Math.random() * 0.7 + 0.3 }; // 0.3-1.0
  }
  
  return null;
}

// Main function to generate MIDI events
export function generateMidiEvent(): MidiEvent {
  noteCounter++;
  maybeChangeMusicalContext();
  
  // Randomly introduce silence
  if (Math.random() > density) {
    // Return a "silence" event - not an actual MIDI event, but used to
    // indicate that nothing is happening for this interval
    return {
      type: 'silence',
      duration: Math.random() * 500 + 100, // 100-600ms of silence
    };
  }
  
  // Occasionally use pedals
  const pedal = decidePedal();
  if (pedal) {
    return {
      type: 'pedal',
      pedal,
    };
  }
  
  // Decide between note, chord, or counterpoint
  const eventType = Math.random();
  
  if (eventType < 0.5) {
    // Generate a single note
    return {
      type: 'note',
      note: generateRandomNote(),
      currentKey: NOTES[currentKey],
      currentScale,
    };
  } else if (eventType < 0.8) {
    // Generate a chord
    const chordSize = Math.floor(Math.random() * 3) + 3; // 3-5 notes
    return {
      type: 'chord',
      notes: generateChord(chordSize),
      currentKey: NOTES[currentKey],
      currentScale,
    };
  } else {
    // Generate counterpoint (2-4 notes across different registers)
    const numVoices = Math.floor(Math.random() * 3) + 2; // 2-4 voices
    const notes: Note[] = [];
    
    for (let i = 0; i < numVoices; i++) {
      // Assign each voice to a different register
      const minOctave = i + 2; // From octave 2 and up
      const maxOctave = Math.min(minOctave + 2, 7); // Maximum octave 7
      
      notes.push(generateRandomNote({ min: minOctave, max: maxOctave }));
    }
    
    return {
      type: 'counterpoint',
      notes,
      currentKey: NOTES[currentKey],
      currentScale,
    };
  }
}