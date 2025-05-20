/**
 * Visualization Module
 * Handles the visualization of piano notes and musical data
 */

// Constants for piano keyboard
const TOTAL_KEYS = 88;
const FIRST_MIDI_NOTE = 21; // A0
const WHITE_KEY_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEY_POSITIONS = [1, 3, 6, 8, 10]; // Relative to C

// Active notes for visualization
const activeNotes = new Set();

// Piano keyboard DOM element
let pianoKeyboard = null;
let keyElements = {};

// Note name display element
let notesDisplay = null;

// Pedal status elements
let damperStatus = null;
let sostenutStatus = null;
let softStatus = null;

// Musical context display elements
let contextKeyDisplay = null;
let contextScaleDisplay = null;
let contextModeDisplay = null;

/**
 * Initialize the piano keyboard visualization
 */
function initPianoKeyboard() {
  pianoKeyboard = document.getElementById('piano-keyboard');
  
  if (!pianoKeyboard) {
    console.error('Piano keyboard element not found');
    return;
  }
  
  // Clear any existing keys
  pianoKeyboard.innerHTML = '';
  
  // Create a key element for each note
  for (let midiNote = FIRST_MIDI_NOTE; midiNote < FIRST_MIDI_NOTE + TOTAL_KEYS; midiNote++) {
    const keyElement = createKeyElement(midiNote);
    pianoKeyboard.appendChild(keyElement);
    keyElements[midiNote] = keyElement;
  }
}

/**
 * Create a piano key DOM element for a given MIDI note
 * @param {number} midiNote - MIDI note number
 * @returns {HTMLElement} - Key DOM element
 */
function createKeyElement(midiNote) {
  const noteInfo = getNoteInfo(midiNote);
  const keyElement = document.createElement('div');
  
  keyElement.className = `piano-key ${noteInfo.isBlack ? 'black-key' : 'white-key'}`;
  keyElement.dataset.note = midiNote;
  keyElement.dataset.noteName = noteInfo.name;
  
  // Add note name label for C keys
  if (noteInfo.name === 'C') {
    const label = document.createElement('span');
    label.className = 'key-label';
    label.textContent = `${noteInfo.name}${noteInfo.octave}`;
    keyElement.appendChild(label);
  }
  
  return keyElement;
}

/**
 * Get note information (name, octave, whether it's black) from MIDI note number
 * @param {number} midiNote - MIDI note number
 * @returns {Object} - Note information
 */
function getNoteInfo(midiNote) {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  
  // Note names - use sharps
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const name = NOTE_NAMES[noteIndex];
  const isBlack = name.includes('#');
  
  return { name, octave, isBlack };
}

/**
 * Initialize the visualization displays
 */
function initDisplays() {
  // Get note display element
  notesDisplay = document.getElementById('notes-display');
  
  // Get pedal status elements
  damperStatus = document.getElementById('damper-status');
  sostenutStatus = document.getElementById('sostenuto-status');
  softStatus = document.getElementById('soft-status');
  
  // Get musical context elements
  contextKeyDisplay = document.getElementById('context-key');
  contextScaleDisplay = document.getElementById('context-scale');
  contextModeDisplay = document.getElementById('context-mode');
}

/**
 * Update the active note display in the visualization
 */
function updateNotesDisplay() {
  if (!notesDisplay) return;
  
  if (activeNotes.size === 0) {
    notesDisplay.textContent = '-';
    return;
  }
  
  // Convert MIDI notes to note names and join with commas
  const noteNames = Array.from(activeNotes).map(note => {
    const { name, octave } = getNoteInfo(note);
    return `${name}${octave}`;
  }).sort().join(', ');
  
  notesDisplay.textContent = noteNames;
}

/**
 * Update the key visualization on the piano keyboard
 * @param {number} midiNote - MIDI note number
 * @param {boolean} isActive - Whether the note is active (pressed)
 */
function updateKeyVisualization(midiNote, isActive) {
  const keyElement = keyElements[midiNote];
  if (!keyElement) return;
  
  if (isActive) {
    keyElement.classList.add('key-active');
    activeNotes.add(midiNote);
  } else {
    keyElement.classList.remove('key-active');
    activeNotes.delete(midiNote);
  }
  
  updateNotesDisplay();
}

/**
 * Update the pedal status display
 * @param {string} type - Pedal type ('damper', 'sostenuto', 'soft')
 * @param {string} value - Pedal value ('ON' or 'OFF')
 */
function updatePedalDisplay(type, value) {
  let element = null;
  
  switch (type) {
    case 'damper':
      element = damperStatus;
      break;
    case 'sostenuto':
      element = sostenutStatus;
      break;
    case 'soft':
      element = softStatus;
      break;
  }
  
  if (element) {
    element.textContent = value;
    element.className = 'value ' + (value === 'ON' ? 'pedal-active' : 'pedal-inactive');
  }
}

/**
 * Update the musical context display
 * @param {Object} context - Musical context information (key, scale, mode)
 */
function updateContextDisplay(context) {
  if (contextKeyDisplay) {
    contextKeyDisplay.textContent = context.key;
  }
  
  if (contextScaleDisplay) {
    contextScaleDisplay.textContent = context.scale;
  }
  
  if (contextModeDisplay) {
    contextModeDisplay.textContent = context.mode;
  }
}

/**
 * Clear all active notes in the visualization
 */
function clearActiveNotes() {
  activeNotes.clear();
  updateNotesDisplay();
  
  // Clear all active key visuals
  Object.values(keyElements).forEach(keyElement => {
    keyElement.classList.remove('key-active');
  });
}

// Initialize the visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initPianoKeyboard();
  initDisplays();
  
  // Set up event listeners for notes
  document.addEventListener('noteOn', (event) => {
    updateKeyVisualization(event.detail.noteNumber, true);
  });
  
  document.addEventListener('noteOff', (event) => {
    updateKeyVisualization(event.detail.noteNumber, false);
  });
  
  // Set up event listener for pedal changes
  document.addEventListener('pedalChange', (event) => {
    updatePedalDisplay(event.detail.type, event.detail.value);
  });
  
  // Set up event listener for all notes off
  document.addEventListener('allNotesOff', () => {
    clearActiveNotes();
  });
});

// Export the module interface
window.pianoVisualization = {
  updateContextDisplay
};