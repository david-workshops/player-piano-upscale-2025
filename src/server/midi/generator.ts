/**
 * MIDI Generator
 * Generates MIDI notes and chords in minimalist counterpoint style
 * with support for various musical parameters and XP MIDI features.
 */
import { Socket } from 'socket.io';
import { MidiNote, MidiChord, MusicalParameters, XPMidiParams, PedalData } from '../../shared/types';
import { getScaleNotes, getModeNotes } from '../music/theory';

// Piano range constants
const PIANO_MIN = 21;  // A0
const PIANO_MAX = 108; // C8

// Default musical parameters
const DEFAULT_PARAMS: MusicalParameters = {
  key: 'C',
  scale: 'major',
  mode: 'ionian',
  tempo: 60,
  density: 0.3,
  range: {
    min: PIANO_MIN,
    max: PIANO_MAX,
  },
};

/**
 * Initialize a MIDI generator that will stream notes to the client
 * @param socket - Socket.IO connection to stream MIDI data
 * @returns Object with methods to control generation
 */
export function initMidiGenerator(socket: Socket) {
  let isGenerating = false;
  let intervalId: NodeJS.Timeout | null = null;
  let currentParams: MusicalParameters = { ...DEFAULT_PARAMS };
  let generationStartTime = Date.now();
  
  // Calculate time between events based on tempo and density
  const getTimeBetweenEvents = () => {
    const beatDuration = 60000 / currentParams.tempo;
    return beatDuration * (1 + Math.random() * (4 - currentParams.density * 3));
  };
  
  /**
   * Generate a single note in the current key/scale
   * @returns A MIDI note object
   */
  const generateNote = (): MidiNote => {
    const scaleNotes = getModeNotes(currentParams.key, currentParams.scale, currentParams.mode);
    const { min, max } = currentParams.range;
    
    // Select octave and note within the piano range
    const octave = Math.floor(Math.random() * 8) + 1; // 1-8
    const scaleIndex = Math.floor(Math.random() * scaleNotes.length);
    const basePitch = scaleNotes[scaleIndex];
    
    // Calculate MIDI pitch and ensure it's within range
    let pitch = basePitch + (octave * 12);
    pitch = Math.max(min, Math.min(max, pitch));
    
    // Generate velocity (soft to medium-loud for minimalist style)
    const velocity = Math.floor(40 + Math.random() * 50);
    
    // Generate duration (longer durations for minimalist style)
    const beatDuration = 60000 / currentParams.tempo;
    const duration = beatDuration * (1 + Math.floor(Math.random() * 4));
    
    return {
      pitch,
      velocity,
      duration,
      startTime: Date.now() - generationStartTime,
    };
  };
  
  /**
   * Generate a chord with 2-4 notes in the current key/scale
   * @returns A MIDI chord object
   */
  const generateChord = (): MidiChord => {
    const noteCount = Math.floor(2 + Math.random() * 3); // 2-4 notes
    const notes: MidiNote[] = [];
    
    // Generate the root note
    const rootNote = generateNote();
    notes.push(rootNote);
    
    // Add additional notes
    for (let i = 1; i < noteCount; i++) {
      const note = generateNote();
      // Ensure same duration for all notes in chord
      note.duration = rootNote.duration;
      notes.push(note);
    }
    
    return {
      notes,
      startTime: rootNote.startTime,
    };
  };
  
  /**
   * Generate pedal data for the piano
   * @returns Pedal data object
   */
  const generatePedalData = (): PedalData => {
    // Only occasionally use pedals
    const useDamper = Math.random() < 0.3;
    const useSostenuto = Math.random() < 0.1;
    const useSoft = Math.random() < 0.15;
    
    return {
      damper: useDamper ? Math.floor(Math.random() * 80) + 40 : 0,    // 40-120 when used
      sostenuto: useSostenuto ? Math.floor(Math.random() * 80) + 40 : 0, // 40-120 when used
      soft: useSoft ? Math.floor(Math.random() * 60) + 30 : 0,         // 30-90 when used
    };
  };
  
  /**
   * Occasionally change key, scale, or mode
   */
  const maybeChangeMusicalContext = () => {
    // Change approximately once every several minutes
    if (Math.random() < 0.005) {
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const scales = ['major', 'minor', 'harmonic_minor', 'melodic_minor', 'pentatonic'];
      const modes = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
      
      // Randomly select a parameter to change
      const changeType = Math.floor(Math.random() * 3);
      
      switch (changeType) {
        case 0:
          currentParams.key = keys[Math.floor(Math.random() * keys.length)];
          break;
        case 1:
          currentParams.scale = scales[Math.floor(Math.random() * scales.length)];
          break;
        case 2:
          currentParams.mode = modes[Math.floor(Math.random() * modes.length)];
          break;
      }
      
      // Emit the parameter change
      socket.emit('parameter-change', {
        type: 'musical',
        parameters: {
          key: currentParams.key,
          scale: currentParams.scale,
          mode: currentParams.mode,
        },
      });
    }
  };
  
  /**
   * Generate and emit a musical event (note, chord, or silence)
   */
  const generateEvent = () => {
    // Occasionally include silence for breathing room
    if (Math.random() < 0.2) {
      // Silence event, do nothing but still wait
      return;
    }
    
    // Choose between single note and chord
    const isChord = Math.random() < 0.4;
    
    // Generate pedal data
    const pedalData = generatePedalData();
    
    // Generate XP MIDI parameters for Enspire Pro
    const xpParams: XPMidiParams = {
      pedalData,
      extendedVelocity: Math.floor(Math.random() * 127),
      extendedRelease: Math.floor(Math.random() * 127),
    };
    
    if (isChord) {
      const chord = generateChord();
      socket.emit('midi-event', {
        type: 'chord',
        data: chord,
        xpParams,
      });
    } else {
      const note = generateNote();
      socket.emit('midi-event', {
        type: 'note',
        data: note,
        xpParams,
      });
    }
    
    // Occasionally change musical parameters
    maybeChangeMusicalContext();
  };
  
  /**
   * Start generating MIDI events
   */
  const startGeneration = () => {
    if (isGenerating) return;
    
    isGenerating = true;
    generationStartTime = Date.now();
    
    // Send initial parameters to client
    socket.emit('parameter-change', {
      type: 'musical',
      parameters: currentParams,
    });
    
    // Schedule the first event
    const scheduleNextEvent = () => {
      if (!isGenerating) return;
      
      generateEvent();
      
      // Schedule next event with variable timing
      const nextEventTime = getTimeBetweenEvents();
      intervalId = setTimeout(scheduleNextEvent, nextEventTime);
    };
    
    scheduleNextEvent();
  };
  
  /**
   * Stop generating MIDI events
   */
  const stopGeneration = () => {
    isGenerating = false;
    if (intervalId) {
      clearTimeout(intervalId);
      intervalId = null;
    }
  };
  
  /**
   * Change generation parameters
   * @param params - New parameters to apply
   */
  const changeParameters = (params: Partial<MusicalParameters>) => {
    currentParams = { ...currentParams, ...params };
    
    // Notify client of parameter change
    socket.emit('parameter-change', {
      type: 'musical',
      parameters: currentParams,
    });
  };
  
  return {
    startGeneration,
    stopGeneration,
    changeParameters,
  };
}