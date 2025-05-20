import { io } from 'socket.io-client';
import { MidiEvent, Note } from '../shared/types';

// Connect to the server
const socket = io();

// DOM elements
const startButton = document.getElementById('start-btn') as HTMLButtonElement;
const stopButton = document.getElementById('stop-btn') as HTMLButtonElement;
const outputSelect = document.getElementById('output-select') as HTMLSelectElement;
const visualization = document.getElementById('visualization') as HTMLDivElement;
const currentKeyDisplay = document.getElementById('current-key') as HTMLElement;
const currentScaleDisplay = document.getElementById('current-scale') as HTMLElement;
const notesPlayingDisplay = document.getElementById('notes-playing') as HTMLElement;
const pedalsStatusDisplay = document.getElementById('pedals-status') as HTMLElement;
const consoleOutput = document.getElementById('console-output') as HTMLElement;

// AudioContext and MIDI
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let midiOutput: WebMidi.MIDIOutput | null = null;
let activeNotes: Map<number, { oscillator: OscillatorNode, gainNode: GainNode, endTime: number }> = new Map();

// Pedal status
const pedalStatus = {
  sustain: 0,
  sostenuto: 0,
  soft: 0
};

// Piano state
let notesPlaying: Note[] = [];

// Initialize audio
function initAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5;
    gainNode.connect(audioContext.destination);
    logToConsole('Audio initialized');
  }
}

// Initialize MIDI
async function initMidi() {
  try {
    if (navigator.requestMIDIAccess) {
      const midiAccess = await navigator.requestMIDIAccess();
      const outputs = midiAccess.outputs.values();
      
      // Get the first available MIDI output
      const output = outputs.next().value;
      if (output) {
        midiOutput = output;
        logToConsole(`MIDI output selected: ${midiOutput.name}`);
        return true;
      } else {
        logToConsole('No MIDI outputs available');
        return false;
      }
    } else {
      logToConsole('WebMIDI not supported in this browser');
      return false;
    }
  } catch (error) {
    logToConsole(`Error initializing MIDI: ${error}`);
    return false;
  }
}

// Play a note using Web Audio API
function playNote(note: Note) {
  if (!audioContext || !gainNode) initAudio();
  if (!audioContext || !gainNode) return;
  
  const now = audioContext.currentTime;
  
  // Create oscillator
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine'; // Piano-like sound
  oscillator.frequency.value = midiToFrequency(note.midiNumber);
  
  // Create note-specific gain node for envelope
  const noteGain = audioContext.createGain();
  noteGain.gain.value = 0;
  
  // Connect nodes
  oscillator.connect(noteGain);
  noteGain.connect(gainNode);
  
  // Apply envelope
  const velocityGain = note.velocity / 127;
  const attackTime = 0.01;
  const releaseTime = 0.3;
  
  // Attack
  noteGain.gain.setValueAtTime(0, now);
  noteGain.gain.linearRampToValueAtTime(velocityGain, now + attackTime);
  
  // Calculate end time based on sustain pedal
  const sustainMultiplier = pedalStatus.sustain > 0.5 ? 3 : 1;
  const noteDuration = note.duration / 1000 * sustainMultiplier;
  const endTime = now + noteDuration;
  
  // Release
  noteGain.gain.setValueAtTime(velocityGain, endTime - releaseTime);
  noteGain.gain.linearRampToValueAtTime(0, endTime);
  
  // Start and schedule stop
  oscillator.start(now);
  oscillator.stop(endTime + 0.1);
  
  // Store active note
  activeNotes.set(note.midiNumber, { 
    oscillator, 
    gainNode: noteGain, 
    endTime: endTime 
  });
  
  // Schedule cleanup
  setTimeout(() => {
    activeNotes.delete(note.midiNumber);
  }, (noteDuration + 0.2) * 1000);
  
  // Add to notes playing
  notesPlaying.push(note);
  
  // Create visualization element
  createNoteVisualization(note);
}

// Play a note using MIDI output
function playMidiNote(note: Note) {
  if (!midiOutput) return;
  
  // NoteOn message
  midiOutput.send([0x90, note.midiNumber, note.velocity]);
  
  // Schedule NoteOff
  setTimeout(() => {
    midiOutput?.send([0x80, note.midiNumber, 0]);
  }, note.duration);
  
  // Add to notes playing
  notesPlaying.push(note);
  
  // Create visualization element
  createNoteVisualization(note);
}

// Stop all notes
function stopAllNotes() {
  // Stop Web Audio notes
  if (audioContext) {
    activeNotes.forEach(({ oscillator, gainNode }) => {
      const now = audioContext!.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      setTimeout(() => oscillator.stop(), 200);
    });
    activeNotes.clear();
  }
  
  // Stop MIDI notes
  if (midiOutput) {
    // Send All Notes Off message
    midiOutput.send([0xB0, 123, 0]);
  }
  
  // Clear notes playing
  notesPlaying = [];
  notesPlayingDisplay.textContent = '--';
  
  // Clear visualization
  visualization.innerHTML = '';
}

// Send MIDI pedal message
function handlePedal(type: string, value: number) {
  // Update pedal status
  if (type === 'sustain') {
    pedalStatus.sustain = value;
    if (midiOutput) {
      midiOutput.send([0xB0, 64, Math.floor(value * 127)]);
    }
  } else if (type === 'sostenuto') {
    pedalStatus.sostenuto = value;
    if (midiOutput) {
      midiOutput.send([0xB0, 66, Math.floor(value * 127)]);
    }
  } else if (type === 'soft') {
    pedalStatus.soft = value;
    if (midiOutput) {
      midiOutput.send([0xB0, 67, Math.floor(value * 127)]);
    }
  }
  
  // Update pedal display
  updatePedalDisplay();
}

// Create visualization for a note
function createNoteVisualization(note: Note) {
  const noteElement = document.createElement('div');
  noteElement.className = 'note-block';
  noteElement.textContent = `${note.name}${note.octave}`;
  
  // Set width based on duration
  const width = Math.max(30, Math.min(200, note.duration / 50));
  noteElement.style.width = `${width}px`;
  
  // Set color intensity based on velocity
  const intensity = Math.floor((note.velocity / 127) * 100);
  noteElement.style.backgroundColor = `hsl(120, 100%, ${intensity}%)`;
  
  visualization.appendChild(noteElement);
  
  // Remove after duration
  setTimeout(() => {
    noteElement.remove();
  }, note.duration);
  
  // Update notes playing display
  updateNotesPlayingDisplay();
}

// Update pedal display
function updatePedalDisplay() {
  const pedals = [];
  
  if (pedalStatus.sustain > 0) {
    pedals.push(`SUSTAIN: ${Math.floor(pedalStatus.sustain * 100)}%`);
  }
  if (pedalStatus.sostenuto > 0) {
    pedals.push(`SOSTENUTO: ${Math.floor(pedalStatus.sostenuto * 100)}%`);
  }
  if (pedalStatus.soft > 0) {
    pedals.push(`SOFT: ${Math.floor(pedalStatus.soft * 100)}%`);
  }
  
  pedalsStatusDisplay.textContent = pedals.length > 0 ? pedals.join(', ') : '--';
}

// Update notes playing display
function updateNotesPlayingDisplay() {
  if (notesPlaying.length > 0) {
    const noteNames = notesPlaying.map(n => `${n.name}${n.octave}`).join(', ');
    notesPlayingDisplay.textContent = noteNames;
  } else {
    notesPlayingDisplay.textContent = '--';
  }
  
  // Cleanup notes that are finished playing
  const now = Date.now();
  notesPlaying = notesPlaying.filter(note => {
    return (note._startTime || 0) + note.duration > now;
  });
}

// Convert MIDI note number to frequency
function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Log message to console
function logToConsole(message: string) {
  const timestamp = new Date().toISOString().substring(11, 19);
  consoleOutput.innerHTML += `[${timestamp}] ${message}\n`;
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Handle MIDI events from server
socket.on('midi', (event: MidiEvent) => {
  const output = outputSelect.value;
  
  switch (event.type) {
    case 'note':
      // Update key and scale display
      currentKeyDisplay.textContent = event.currentKey;
      currentScaleDisplay.textContent = event.currentScale;
      
      // Add timestamp to the note for tracking
      event.note._startTime = Date.now();
      
      // Play the note using selected output
      if (output === 'browser') {
        playNote(event.note);
      } else if (output === 'midi' && midiOutput) {
        playMidiNote(event.note);
      }
      logToConsole(`Playing note: ${event.note.name}${event.note.octave}`);
      break;
      
    case 'chord':
    case 'counterpoint':
      // Update key and scale display
      currentKeyDisplay.textContent = event.currentKey;
      currentScaleDisplay.textContent = event.currentScale;
      
      // Play all notes in the chord or counterpoint
      event.notes.forEach(note => {
        // Add timestamp to the note for tracking
        note._startTime = Date.now();
        
        if (output === 'browser') {
          playNote(note);
        } else if (output === 'midi' && midiOutput) {
          playMidiNote(note);
        }
      });
      logToConsole(`Playing ${event.type}: ${event.notes.length} notes`);
      break;
      
    case 'pedal':
      handlePedal(event.pedal.type, event.pedal.value);
      logToConsole(`Pedal: ${event.pedal.type} ${Math.floor(event.pedal.value * 100)}%`);
      break;
      
    case 'allNotesOff':
      stopAllNotes();
      logToConsole('All notes off');
      break;
      
    case 'silence':
      logToConsole(`Silence: ${event.duration}ms`);
      break;
  }
});

// Socket connection events
socket.on('connect', () => {
  logToConsole('Connected to server');
});

socket.on('disconnect', () => {
  logToConsole('Disconnected from server');
});

// Event listeners
startButton.addEventListener('click', () => {
  initAudio();
  if (outputSelect.value === 'midi') {
    initMidi().then(success => {
      if (success) {
        socket.emit('start');
        logToConsole('Starting MIDI stream - MIDI output');
      } else {
        outputSelect.value = 'browser';
        socket.emit('start');
        logToConsole('MIDI not available, falling back to browser audio');
      }
    });
  } else {
    socket.emit('start');
    logToConsole('Starting MIDI stream - Browser audio');
  }
});

stopButton.addEventListener('click', () => {
  socket.emit('stop');
  logToConsole('Stopping MIDI stream');
});

outputSelect.addEventListener('change', () => {
  if (outputSelect.value === 'midi') {
    initMidi().then(success => {
      if (!success) {
        outputSelect.value = 'browser';
        logToConsole('MIDI not available, falling back to browser audio');
      }
    });
  }
});

// Cleanup function
window.addEventListener('beforeunload', () => {
  socket.emit('stop');
  stopAllNotes();
});

// Initialization
logToConsole('Player Piano initialized');
logToConsole('Click START to begin playing');

// Add missing property to Note interface for tracking
declare module '../shared/types' {
  interface Note {
    _startTime?: number;
  }
}