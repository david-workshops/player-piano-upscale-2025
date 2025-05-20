/**
 * Client entry point
 * Initializes all client-side components and establishes connection to server
 */
import './styles.css';
import { Socket, io } from 'socket.io-client';
import { AudioEngine } from './audio/audio-engine';
import { PianoVisualizer } from './visualization/piano-visualizer';
import { DataDisplay } from './visualization/data-display';
import { initUI } from './components/ui';
import { MidiChord, MidiNote, MusicalParameters, XPMidiParams } from '../shared/types';

// Initialize Socket.IO connection
const socket: Socket = io();

// Initialize Audio Engine
const audioEngine = new AudioEngine();

// Initialize visualizations
const pianoVisualizer = new PianoVisualizer('piano-visualization');
const dataDisplay = new DataDisplay('terminal-content');

// Initialize UI components and connect them to functionality
const ui = initUI({
  onStop: () => {
    socket.emit('stop-generation');
    audioEngine.stopAllNotes();
    pianoVisualizer.clearAllNotes();
    dataDisplay.addMessage('PLAYBACK STOPPED', 'system');
  },
  onOutputToggle: (useMidiOut: boolean) => {
    audioEngine.setOutputMode(useMidiOut ? 'midi' : 'webaudio');
    dataDisplay.addMessage(`OUTPUT MODE: ${useMidiOut ? 'MIDI' : 'WEB AUDIO'}`, 'system');
  }
});

// Event listeners for socket events
socket.on('connect', () => {
  dataDisplay.addMessage('CONNECTED TO SERVER', 'system');
});

socket.on('disconnect', () => {
  dataDisplay.addMessage('DISCONNECTED FROM SERVER', 'system');
  audioEngine.stopAllNotes();
  pianoVisualizer.clearAllNotes();
});

// Handle incoming MIDI events
socket.on('midi-event', (event: { 
  type: 'note' | 'chord', 
  data: MidiNote | MidiChord,
  xpParams?: XPMidiParams
}) => {
  // Process the event based on its type
  if (event.type === 'note') {
    const note = event.data as MidiNote;
    audioEngine.playNote(note, event.xpParams);
    pianoVisualizer.showNote(note);
    dataDisplay.addMessage(`NOTE: ${note.pitch} (vel: ${note.velocity}, dur: ${note.duration}ms)`, 'note');
  } else if (event.type === 'chord') {
    const chord = event.data as MidiChord;
    audioEngine.playChord(chord, event.xpParams);
    pianoVisualizer.showChord(chord);
    
    const noteList = chord.notes.map(n => n.pitch).join(', ');
    dataDisplay.addMessage(`CHORD: [${noteList}]`, 'chord');
  }
  
  // Display XP MIDI parameters if present
  if (event.xpParams?.pedalData) {
    const { damper, sostenuto, soft } = event.xpParams.pedalData;
    if (damper) dataDisplay.addMessage(`PEDAL: Damper ${damper}`, 'pedal');
    if (sostenuto) dataDisplay.addMessage(`PEDAL: Sostenuto ${sostenuto}`, 'pedal');
    if (soft) dataDisplay.addMessage(`PEDAL: Soft ${soft}`, 'pedal');
  }
});

// Handle parameter changes from server
socket.on('parameter-change', (data: { 
  type: string, 
  parameters: Partial<MusicalParameters> 
}) => {
  if (data.type === 'musical') {
    const params = data.parameters;
    dataDisplay.addMessage(`MUSICAL CONTEXT: ${params.key || ''} ${params.scale || ''} ${params.mode || ''}`, 'parameter');
  }
});

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
  // Start audio context on user interaction
  document.addEventListener('click', () => {
    audioEngine.initializeIfNeeded();
  }, { once: true });
  
  dataDisplay.addMessage('PLAYER PIANO INITIALIZED', 'system');
  dataDisplay.addMessage('WAITING FOR SERVER CONNECTION...', 'system');
});