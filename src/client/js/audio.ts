/**
 * Audio module for synthesizing piano sounds using Web Audio API
 */

import { MidiEvent, MidiNote } from '../../shared/types';

interface AudioModule {
  playNote: (note: MidiNote) => void;
  stopNote: (note: MidiNote) => void;
  allNotesOff: () => void;
  processMidiEvent: (event: MidiEvent) => void;
}

export function setupAudio(audioContext: AudioContext): AudioModule {
  // Active notes map to track currently playing notes
  const activeNotes: Map<number, { oscillator: OscillatorNode, gain: GainNode }> = new Map();
  
  // Track pedal state
  const pedalStates = {
    sustain: false,   // Damper pedal (sustain)
    sostenuto: false, // Sostenuto pedal
    soft: false       // Soft pedal (una corda)
  };
  
  // Notes to sustain when sustain pedal is active
  const sustainedNotes: Map<number, MidiNote> = new Map();
  
  // Master volume control
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0.7; // Set to 70% volume
  masterGain.connect(audioContext.destination);
  
  /**
   * Creates a piano sound for a given note
   * @param note - MIDI note to play
   */
  function playNote(note: MidiNote): void {
    // If note is already playing, stop it first
    if (activeNotes.has(note.number)) {
      stopNote(note);
    }
    
    // Calculate frequency from MIDI note number (A4 = 69 = 440Hz)
    const frequency = 440 * Math.pow(2, (note.number - 69) / 12);
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'triangle'; // Triangle wave gives a softer tone
    oscillator.frequency.value = frequency;
    
    // Create gain node for envelope
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    
    // Apply velocity (MIDI velocity range is 0-127)
    const velocityFactor = note.velocity / 127;
    
    // Connect oscillator to gain node, gain to master output
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    // Start oscillator
    oscillator.start();
    
    // Apply attack envelope (quick attack for piano)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      velocityFactor, 
      audioContext.currentTime + 0.005
    );
    
    // Slight decay after initial attack
    gainNode.gain.linearRampToValueAtTime(
      velocityFactor * 0.8,
      audioContext.currentTime + 0.1
    );
    
    // Store the active note
    activeNotes.set(note.number, { oscillator, gain: gainNode });
    
    // Also track this note for sustain if sustain pedal is active
    if (pedalStates.sustain) {
      sustainedNotes.set(note.number, note);
    }
  }
  
  /**
   * Stops playing a note with a release envelope
   * @param note - MIDI note to stop
   */
  function stopNote(note: MidiNote): void {
    // If sustain pedal is down, don't stop the note yet
    if (pedalStates.sustain) {
      sustainedNotes.set(note.number, note);
      return;
    }
    
    const activeNote = activeNotes.get(note.number);
    if (!activeNote) return;
    
    const { gain } = activeNote;
    
    // Apply release envelope
    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3); // 300ms release
    
    // Remove from active notes after release
    setTimeout(() => {
      const noteToStop = activeNotes.get(note.number);
      if (noteToStop) {
        noteToStop.oscillator.stop();
        noteToStop.oscillator.disconnect();
        noteToStop.gain.disconnect();
        activeNotes.delete(note.number);
      }
    }, 300);
  }
  
  /**
   * Processes a MIDI event
   * @param event - MIDI event to process
   */
  function processMidiEvent(event: MidiEvent): void {
    switch (event.type) {
      case 'noteOn':
        playNote(event.note);
        break;
        
      case 'noteOff':
        stopNote(event.note);
        break;
        
      case 'controlChange':
        handleControlChange(event.controller, event.value);
        break;
        
      // SysEx messages are ignored in Web Audio implementation
      case 'sysex':
        // Do nothing - SysEx is for hardware MIDI
        break;
    }
  }
  
  /**
   * Handles MIDI control change messages
   * @param controller - MIDI controller number
   * @param value - Controller value
   */
  function handleControlChange(controller: number, value: number): void {
    switch (controller) {
      // Sustain/damper pedal
      case 64:
        pedalStates.sustain = value >= 64;
        
        // If pedal is released, stop all sustained notes
        if (!pedalStates.sustain) {
          sustainedNotes.forEach((note) => {
            stopNote(note);
          });
          sustainedNotes.clear();
        }
        break;
        
      // Sostenuto pedal
      case 66:
        pedalStates.sostenuto = value >= 64;
        break;
        
      // Soft pedal
      case 67:
        pedalStates.soft = value >= 64;
        // Reduce overall volume if soft pedal is pressed
        masterGain.gain.value = pedalStates.soft ? 0.5 : 0.7;
        break;
    }
    
    // Update pedal status in UI
    updatePedalDisplay();
  }
  
  /**
   * Updates pedal status display in the UI
   */
  function updatePedalDisplay(): void {
    const pedalStatusElement = document.getElementById('pedal-status');
    if (!pedalStatusElement) return;
    
    const activeStates = [];
    if (pedalStates.sustain) activeStates.push('Sustain');
    if (pedalStates.sostenuto) activeStates.push('Sostenuto');
    if (pedalStates.soft) activeStates.push('Soft');
    
    pedalStatusElement.textContent = activeStates.length ? activeStates.join(', ') : '-';
  }
  
  /**
   * Stop all notes immediately
   */
  function allNotesOff(): void {
    // Stop all active notes
    activeNotes.forEach(({ oscillator, gain }) => {
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();
      }, 100);
    });
    
    // Clear all notes
    activeNotes.clear();
    sustainedNotes.clear();
    
    // Reset pedals
    pedalStates.sustain = false;
    pedalStates.sostenuto = false;
    pedalStates.soft = false;
    
    updatePedalDisplay();
  }
  
  return {
    playNote,
    stopNote,
    allNotesOff,
    processMidiEvent
  };
}