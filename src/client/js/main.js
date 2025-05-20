/**
 * Main Application Script
 * Coordinates between WebSocket communication, audio generation, and visualization
 */

// Wait for socket.io to load (it's included as a script tag from the server)
let socket = null;

// Current output mode
let outputMode = 'browser'; // 'browser' or 'midi'

// MIDI output device (if available)
let midiOutput = null;

// Currently active notes (to handle note-off events)
const activeNotes = new Map(); // noteNumber -> timeout ID for auto-release

// Document ready handler
document.addEventListener('DOMContentLoaded', () => {
  // Initialize socket.io connection
  initSocketConnection();
  
  // Initialize UI event handlers
  initUIHandlers();
  
  // Check for Web MIDI support
  if (navigator.requestMIDIAccess) {
    checkMIDIAccess();
  } else {
    // Hide MIDI option if not supported
    const midiOption = document.querySelector('option[value="midi"]');
    if (midiOption) midiOption.disabled = true;
  }
});

/**
 * Initialize WebSocket connection to server
 */
function initSocketConnection() {
  // Connect to server using socket.io
  socket = io();
  
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
  
  // Handle musical events from server
  socket.on('musical-event', handleMusicalEvent);
}

/**
 * Process musical events from the server
 * @param {Object} event - Musical event data
 */
function handleMusicalEvent(event) {
  // Handle different types of events
  if (event.noteNumber !== undefined) {
    // Single MIDI note
    handleNote(event);
  } else if (event.notes !== undefined) {
    // Chord (multiple notes)
    handleChord(event);
  } else if (event.type !== undefined && event.value !== undefined) {
    // Pedal state change
    handlePedal(event);
  } else if (event.key !== undefined && event.scale !== undefined) {
    // Musical context change
    handleContextChange(event);
  }
}

/**
 * Handle a MIDI note event
 * @param {Object} note - MIDI note data
 */
function handleNote(note) {
  const { noteNumber, velocity, duration } = note;
  
  // If this note is already active, clear its timeout
  if (activeNotes.has(noteNumber)) {
    clearTimeout(activeNotes.get(noteNumber));
  }
  
  // Play the note
  if (outputMode === 'browser') {
    window.pianoAudio.playNote(noteNumber, velocity, duration);
  } else if (outputMode === 'midi' && midiOutput) {
    // Send MIDI note-on message
    midiOutput.send([0x90, noteNumber, velocity]);
  }
  
  // Set timeout to stop the note after its duration
  const timeoutId = setTimeout(() => {
    if (outputMode === 'browser') {
      window.pianoAudio.stopNote(noteNumber);
    } else if (outputMode === 'midi' && midiOutput) {
      // Send MIDI note-off message
      midiOutput.send([0x80, noteNumber, 0]);
    }
    activeNotes.delete(noteNumber);
  }, duration);
  
  activeNotes.set(noteNumber, timeoutId);
}

/**
 * Handle a chord event (multiple simultaneous notes)
 * @param {Object} chord - Chord data
 */
function handleChord(chord) {
  const { notes } = chord;
  
  // Play each note in the chord
  notes.forEach(note => {
    handleNote(note);
  });
}

/**
 * Handle a pedal state change event
 * @param {Object} pedal - Pedal data
 */
function handlePedal(pedal) {
  const { type, value } = pedal;
  
  if (outputMode === 'browser') {
    window.pianoAudio.setPedal(type, value);
  } else if (outputMode === 'midi' && midiOutput) {
    // Map pedal types to MIDI CC numbers
    const pedalCCs = {
      'damper': 64,    // Sustain pedal
      'sostenuto': 66, // Sostenuto pedal
      'soft': 67       // Soft pedal
    };
    
    const cc = pedalCCs[type];
    if (cc) {
      // Send MIDI CC message
      midiOutput.send([0xB0, cc, value]);
    }
  }
}

/**
 * Handle a musical context change event
 * @param {Object} context - Musical context data
 */
function handleContextChange(context) {
  // Update visualization with new context
  window.pianoVisualization.updateContextDisplay(context);
}

/**
 * Initialize UI event handlers
 */
function initUIHandlers() {
  // Stop button
  const stopButton = document.getElementById('stop-button');
  if (stopButton) {
    stopButton.addEventListener('click', () => {
      stopAllNotes();
    });
  }
  
  // Output mode selector
  const outputSelector = document.getElementById('output-mode');
  if (outputSelector) {
    outputSelector.addEventListener('change', (e) => {
      // Stop any playing notes before changing output
      stopAllNotes();
      
      outputMode = e.target.value;
      console.log(`Output mode changed to: ${outputMode}`);
      
      // Initialize audio context if browser mode
      if (outputMode === 'browser') {
        window.pianoAudio.initAudio();
      }
    });
  }
  
  // Ensure audio context is initialized on first user gesture
  document.addEventListener('click', () => {
    if (outputMode === 'browser') {
      window.pianoAudio.initAudio();
    }
  }, { once: true });
}

/**
 * Stop all currently playing notes
 */
function stopAllNotes() {
  // Clear all active note timeouts
  activeNotes.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  activeNotes.clear();
  
  if (outputMode === 'browser') {
    window.pianoAudio.stopAllNotes();
  } else if (outputMode === 'midi' && midiOutput) {
    // Send all notes off message
    midiOutput.send([0xB0, 123, 0]);
    
    // Reset all pedals
    midiOutput.send([0xB0, 64, 0]); // Sustain
    midiOutput.send([0xB0, 66, 0]); // Sostenuto
    midiOutput.send([0xB0, 67, 0]); // Soft
  }
}

/**
 * Check for Web MIDI support and initialize if available
 */
async function checkMIDIAccess() {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    
    if (midiAccess.outputs.size > 0) {
      // Get the first available MIDI output
      midiOutput = midiAccess.outputs.values().next().value;
      console.log(`MIDI output available: ${midiOutput.name}`);
    } else {
      console.log('No MIDI outputs available');
      // Disable MIDI option if no outputs
      const midiOption = document.querySelector('option[value="midi"]');
      if (midiOption) midiOption.disabled = true;
    }
  } catch (err) {
    console.error('Error accessing MIDI devices:', err);
    // Disable MIDI option on error
    const midiOption = document.querySelector('option[value="midi"]');
    if (midiOption) midiOption.disabled = true;
  }
}