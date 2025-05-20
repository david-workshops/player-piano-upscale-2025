import { initAudio } from './audio/piano';
import { Visualizer } from './visualization/visualizer';
import { setupMidiOutput } from './ui/controls';
import { io, Socket as SocketIOClient } from 'socket.io-client';

// Define interfaces for MIDI events
interface MidiNote {
  note: number;
  velocity: number;
  duration: number;
  channel?: number;
}

interface MidiChord {
  notes: MidiNote[];
}

interface PedalEvent {
  type: 'sustain' | 'sostenuto' | 'soft';
  value: number;
}

interface MidiEvent {
  type: 'note' | 'chord' | 'pedal';
  data: MidiNote | MidiChord | PedalEvent;
  timestamp: number;
}

// Socket.io connection
const socket: SocketIOClient = io();

// Initialize modules
const audioEngine = initAudio();
const visualizer = new Visualizer('visualization');
const midiOutput = setupMidiOutput();

// UI Elements
const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const outputModeSelect = document.getElementById('outputMode') as HTMLSelectElement;
const statusElement = document.getElementById('status') as HTMLDivElement;
const currentKeyElement = document.getElementById('currentKey') as HTMLSpanElement;
const currentScaleElement = document.getElementById('currentScale') as HTMLSpanElement;
const currentModeElement = document.getElementById('currentMode') as HTMLSpanElement;

// Current state
let isPlaying = false;
const activeNotes: Set<number> = new Set();

// Handle start button
startBtn.addEventListener('click', () => {
  if (isPlaying) return;
  
  // Start stream without specific options - server will choose automatically
  socket.emit('startStream', {});
  isPlaying = true;
  statusElement.textContent = 'STATUS: PLAYING - Auto mode';
  visualizer.log('STREAMING STARTED...');
  visualizer.log('CONFIGURATION: Auto-changing key, scale, and mode');
});

// Handle stop button
stopBtn.addEventListener('click', () => {
  if (!isPlaying) return;
  
  socket.emit('stopStream');
  isPlaying = false;
  statusElement.textContent = 'STATUS: IDLE';
  visualizer.log('STREAMING STOPPED...');
  
  // Stop all active notes
  stopAllNotes();
});

// Handle incoming MIDI events
socket.on('midiEvent', (event: MidiEvent) => {
  // Display in visualizer
  visualizer.visualizeMIDIEvent(event);
  
  // Process event based on type
  const outputMode = outputModeSelect.value;
  
  switch (event.type) {
    case 'note':
      const noteData = event.data as { note: number; velocity: number; duration: number; channel?: number };
      
      // Check if it's a silence (dummy note)
      if (noteData.note === -1) return;
      
      // Play note using selected output method
      if (outputMode === 'browser') {
        audioEngine.playNote(noteData.note, noteData.velocity, noteData.duration);
      } else if (outputMode === 'midi' && midiOutput.output) {
        midiOutput.output.playNote(noteData.note, noteData.channel || 0, { 
          duration: noteData.duration,
          velocity: noteData.velocity / 127 // WebMIDI uses 0-1 for velocity
        });
      }
      
      // Track active note
      activeNotes.add(noteData.note);
      break;
      
    case 'chord':
      const chordData = event.data as { notes: Array<{ note: number; velocity: number; duration: number; channel?: number }> };
      
      // Play each note in the chord
      chordData.notes.forEach(note => {
        if (outputMode === 'browser') {
          audioEngine.playNote(note.note, note.velocity, note.duration);
        } else if (outputMode === 'midi' && midiOutput.output) {
          midiOutput.output.playNote(note.note, note.channel || 0, { 
            duration: note.duration,
            velocity: note.velocity / 127
          });
        }
        
        // Track active notes
        activeNotes.add(note.note);
      });
      break;
      
    case 'pedal':
      const pedalData = event.data as { type: string; value: number };
      
      // Handle pedal events
      if (outputMode === 'browser') {
        // Handle browser audio pedal (sustain only for now)
        if (pedalData.type === 'sustain') {
          audioEngine.setSustain(pedalData.value > 0);
        }
      } else if (outputMode === 'midi' && midiOutput.output) {
        // Handle MIDI pedal messages
        // Control change values for pedals: sustain = 64, sostenuto = 66, soft = 67
        const ccNumber = 
          pedalData.type === 'sustain' ? 64 :
          pedalData.type === 'sostenuto' ? 66 :
          pedalData.type === 'soft' ? 67 : 64;
          
        midiOutput.output.sendControlChange(ccNumber, pedalData.value, 0);
      }
      break;
  }
});

// Handle all notes off message
socket.on('allNotesOff', () => {
  stopAllNotes();
});

// Handle music parameter changes
socket.on('musicParametersChanged', (params: { key: string; scale: string; mode: string }) => {
  // Update the UI with current settings
  currentKeyElement.textContent = params.key;
  currentScaleElement.textContent = params.scale;
  currentModeElement.textContent = params.mode;
  
  // Log the change
  visualizer.log(`MUSIC CHANGED: KEY=${params.key}, SCALE=${params.scale}, MODE=${params.mode}`);
  
  if (isPlaying) {
    statusElement.textContent = `STATUS: PLAYING - ${params.key} ${params.scale} ${params.mode}`;
  }
});

// Stop all active notes
function stopAllNotes() {
  // Get output mode
  const outputMode = outputModeSelect.value;
  
  // Stop notes based on output mode
  if (outputMode === 'browser') {
    audioEngine.allNotesOff();
  } else if (outputMode === 'midi' && midiOutput.output) {
    midiOutput.output.stopNote('all');
    
    // Also send all sounds off message (CC 120)
    midiOutput.output.sendControlChange(120, 0, 0);
    
    // Reset all controllers (CC 121)
    midiOutput.output.sendControlChange(121, 0, 0);
  }
  
  // Clear active notes tracking
  activeNotes.clear();
}