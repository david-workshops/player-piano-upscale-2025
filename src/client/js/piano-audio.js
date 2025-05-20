/**
 * Piano Audio Module
 * Handles the generation of piano sounds using Web Audio API
 */

// Wait for module to load before creating audio context
let audioContext = null;
let masterGainNode = null;

// Maps of active notes and their associated audio nodes
const activeOscillators = new Map();
const activeGainNodes = new Map();

// Piano samples would be better, but for this demo we'll use synthesized tones
// with envelopes that somewhat mimic a piano

// Pedal states
const pedalStates = {
  damper: false,   // Sustain pedal
  sostenuto: false, // Sostenuto pedal
  soft: false      // Soft pedal
};

// Notes sustained by damper pedal
const sustainedNotes = new Set();

// Notes held by sostenuto pedal (only those that were down when pedal was pressed)
const sostenutedNotes = new Set();

// Initialize audio on first user interaction
function initAudio() {
  if (audioContext) return;
  
  // Create audio context
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create master gain node
  masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.7; // Master volume
  masterGainNode.connect(audioContext.destination);
  
  console.log('Audio context initialized');
}

/**
 * Create a piano-like envelope for a note
 * @param {GainNode} gainNode - The gain node to apply envelope to
 * @param {number} velocity - MIDI velocity (0-127)
 * @param {number} duration - Note duration in milliseconds
 * @param {boolean} isSoft - Whether soft pedal is active
 */
function applyPianoEnvelope(gainNode, velocity, duration, isSoft = false) {
  const velocityFactor = velocity / 127;
  // Reduce volume if soft pedal is active
  const softFactor = isSoft ? 0.5 : 1.0;
  
  const now = audioContext.currentTime;
  
  // Attack (very fast for piano)
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(velocityFactor * softFactor, now + 0.01);
  
  // Initial decay (quick)
  gainNode.gain.linearRampToValueAtTime(velocityFactor * 0.7 * softFactor, now + 0.1);
  
  // Sustain and release
  if (duration && duration > 0) {
    // Gradual decay during sustain
    gainNode.gain.linearRampToValueAtTime(velocityFactor * 0.5 * softFactor, now + (duration / 1000) * 0.5);
    
    // Release phase
    const releaseStart = now + (duration / 1000);
    gainNode.gain.linearRampToValueAtTime(velocityFactor * 0.3 * softFactor, releaseStart);
    gainNode.gain.exponentialRampToValueAtTime(0.001, releaseStart + 0.5); // 0.5 second release
    gainNode.gain.setValueAtTime(0, releaseStart + 0.5);
  }
}

/**
 * Generates frequency for a given MIDI note number
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {number} - Frequency in Hz
 */
function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Creates multiple oscillators with slight detuning for a richer sound
 * @param {number} frequency - Base frequency
 * @param {GainNode} gainNode - Gain node to connect to
 * @param {boolean} isSoft - Whether soft pedal is active (changes timbre)
 * @returns {Array} - Array of created oscillators
 */
function createPianoOscillators(frequency, gainNode, isSoft = false) {
  const oscillators = [];
  
  // Create multiple oscillators with slight detuning for a richer sound
  // Main tone (sine for fundamental)
  const mainOsc = audioContext.createOscillator();
  mainOsc.type = 'sine';
  mainOsc.frequency.value = frequency;
  mainOsc.connect(gainNode);
  oscillators.push(mainOsc);
  
  // Add harmonics with different waveforms for piano-like timbre
  // First harmonic (one octave up)
  const harmonicOsc1 = audioContext.createOscillator();
  harmonicOsc1.type = 'triangle';
  harmonicOsc1.frequency.value = frequency * 2;
  
  const harmonicGain1 = audioContext.createGain();
  harmonicGain1.gain.value = isSoft ? 0.1 : 0.3; // Softer with soft pedal
  harmonicOsc1.connect(harmonicGain1);
  harmonicGain1.connect(gainNode);
  oscillators.push(harmonicOsc1);
  
  // Higher partial for brightness
  const harmonicOsc2 = audioContext.createOscillator();
  harmonicOsc2.type = 'sine';
  harmonicOsc2.frequency.value = frequency * 4;
  
  const harmonicGain2 = audioContext.createGain();
  harmonicGain2.gain.value = isSoft ? 0.03 : 0.1; // Much softer with soft pedal
  harmonicOsc2.connect(harmonicGain2);
  harmonicGain2.connect(gainNode);
  oscillators.push(harmonicOsc2);
  
  // Add slight detuning for chorus effect
  if (!isSoft) { // No detuning when soft pedal is active
    const detuneOsc = audioContext.createOscillator();
    detuneOsc.type = 'sine';
    detuneOsc.frequency.value = frequency * 1.001; // Very slight detuning
    
    const detuneGain = audioContext.createGain();
    detuneGain.gain.value = 0.05;
    detuneOsc.connect(detuneGain);
    detuneGain.connect(gainNode);
    oscillators.push(detuneOsc);
  }
  
  // Start all oscillators
  oscillators.forEach(osc => osc.start());
  
  return oscillators;
}

/**
 * Plays a MIDI note
 * @param {number} noteNumber - MIDI note number
 * @param {number} velocity - Note velocity (0-127)
 * @param {number} duration - Note duration in ms
 */
function playNote(noteNumber, velocity, duration) {
  if (!audioContext) initAudio();
  
  // If the note is already playing, stop it first
  stopNote(noteNumber);
  
  // Create gain node for this note
  const gainNode = audioContext.createGain();
  gainNode.connect(masterGainNode);
  
  // Create oscillators for piano-like sound
  const frequency = midiToFrequency(noteNumber);
  const oscillators = createPianoOscillators(frequency, gainNode, pedalStates.soft);
  
  // Apply envelope
  applyPianoEnvelope(gainNode, velocity, duration, pedalStates.soft);
  
  // Store references for later cleanup
  activeOscillators.set(noteNumber, oscillators);
  activeGainNodes.set(noteNumber, gainNode);
  
  // Update UI to show active note
  document.dispatchEvent(new CustomEvent('noteOn', { detail: { noteNumber, velocity } }));
}

/**
 * Stops a MIDI note
 * @param {number} noteNumber - MIDI note number
 */
function stopNote(noteNumber) {
  // Check if note is active
  if (!activeOscillators.has(noteNumber)) return;
  
  // If sustain pedal is active, add to sustained notes instead of stopping
  if (pedalStates.damper) {
    sustainedNotes.add(noteNumber);
    return;
  }
  
  // If sostenuto pedal is active and this note is held by it, don't stop it
  if (pedalStates.sostenuto && sostenutedNotes.has(noteNumber)) {
    return;
  }
  
  // Get oscillators and gain node
  const oscillators = activeOscillators.get(noteNumber);
  const gainNode = activeGainNodes.get(noteNumber);
  
  if (oscillators && gainNode) {
    // Apply release envelope
    const now = audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    // Stop oscillators after release
    oscillators.forEach(osc => {
      try {
        osc.stop(now + 0.5);
      } catch (e) {
        console.warn('Error stopping oscillator:', e);
      }
    });
    
    // Clean up after release
    setTimeout(() => {
      activeOscillators.delete(noteNumber);
      activeGainNodes.delete(noteNumber);
    }, 500);
  }
  
  // Update UI to show note is off
  document.dispatchEvent(new CustomEvent('noteOff', { detail: { noteNumber } }));
}

/**
 * Set pedal state
 * @param {string} pedalType - Type of pedal ('damper', 'sostenuto', 'soft')
 * @param {number} value - Pedal position (0-127)
 */
function setPedal(pedalType, value) {
  const isActive = value > 64; // Consider pedal active if value > 64
  
  switch (pedalType) {
    case 'damper':
      if (pedalStates.damper !== isActive) {
        pedalStates.damper = isActive;
        
        // If pedal is released, stop all sustained notes
        if (!isActive) {
          sustainedNotes.forEach(noteNumber => {
            stopNote(noteNumber);
          });
          sustainedNotes.clear();
        }
      }
      break;
      
    case 'sostenuto':
      if (pedalStates.sostenuto !== isActive) {
        pedalStates.sostenuto = isActive;
        
        // If pedal is pressed, capture currently active notes
        if (isActive) {
          activeOscillators.forEach((_, noteNumber) => {
            sostenutedNotes.add(noteNumber);
          });
        } else {
          // If pedal is released, stop all sostenuto notes that aren't still actively pressed
          sostenutedNotes.forEach(noteNumber => {
            // Only stop if not sustained by damper pedal
            if (!pedalStates.damper || !sustainedNotes.has(noteNumber)) {
              stopNote(noteNumber);
            }
          });
          sostenutedNotes.clear();
        }
      }
      break;
      
    case 'soft':
      pedalStates.soft = isActive;
      // Soft pedal affects timbre of new notes, doesn't need to change existing ones
      break;
  }
  
  // Dispatch event for UI update
  document.dispatchEvent(new CustomEvent('pedalChange', { 
    detail: { type: pedalType, value: isActive ? 'ON' : 'OFF' } 
  }));
}

/**
 * Stop all notes and reset pedals
 */
function stopAllNotes() {
  // Stop all active oscillators
  activeOscillators.forEach((oscillators, noteNumber) => {
    const gainNode = activeGainNodes.get(noteNumber);
    if (gainNode) {
      const now = audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    }
    
    oscillators.forEach(osc => {
      try {
        osc.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        console.warn('Error stopping oscillator:', e);
      }
    });
  });
  
  // Clear all collections
  activeOscillators.clear();
  activeGainNodes.clear();
  sustainedNotes.clear();
  sostenutedNotes.clear();
  
  // Reset pedal states
  pedalStates.damper = false;
  pedalStates.sostenuto = false;
  pedalStates.soft = false;
  
  // Update UI
  document.dispatchEvent(new CustomEvent('allNotesOff'));
  
  // Update pedal UI
  ['damper', 'sostenuto', 'soft'].forEach(type => {
    document.dispatchEvent(new CustomEvent('pedalChange', { 
      detail: { type, value: 'OFF' } 
    }));
  });
}

// Export the module interface
window.pianoAudio = {
  playNote,
  stopNote,
  setPedal,
  stopAllNotes,
  initAudio
};