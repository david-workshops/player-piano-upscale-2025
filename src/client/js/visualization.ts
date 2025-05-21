/**
 * Visualization module for displaying MIDI data
 */

import { MidiEvent, MidiNote, KeyConfig } from '../../shared/types';

interface VisualizationModule {
  updateNoteActivity: (event: MidiEvent) => void;
  updateKeyInfo: (keyConfig: KeyConfig) => void;
}

export function setupVisualization(): VisualizationModule {
  const pianoRollElement = document.getElementById('piano-roll');
  const activeNotesElement = document.getElementById('active-notes');
  const currentKeyElement = document.getElementById('current-key');
  const currentScaleElement = document.getElementById('current-scale');
  const currentModeElement = document.getElementById('current-mode');
  
  // Map to track note elements in the visualization
  const noteElements: Map<number, HTMLElement> = new Map();
  
  // Set of currently active notes
  const activeNotes: Set<number> = new Set();
  
  /**
   * Updates the piano roll visualization
   * @param note - MIDI note information
   * @param isActive - Whether the note is currently active
   */
  function updatePianoRoll(note: MidiNote, isActive: boolean): void {
    if (!pianoRollElement) return;
    
    const { number } = note;
    
    // Check if we already have an element for this note
    if (isActive && !noteElements.has(number)) {
      // Create a new element for this note
      const noteElement = document.createElement('div');
      noteElement.className = 'note active';
      
      // Position based on pitch (higher notes towards top)
      const minNote = 21; // A0
      const maxNote = 108; // C8
      const noteRange = maxNote - minNote;
      const heightPercentage = ((maxNote - number) / noteRange) * 100;
      
      // Calculate width based on velocity
      const widthPercentage = (note.velocity / 127) * 80 + 20; // 20% to 100% width
      
      // Position horizontally randomly across the piano roll
      const leftPosition = Math.random() * (100 - widthPercentage);
      
      // Set styles
      noteElement.style.top = `${heightPercentage}%`;
      noteElement.style.left = `${leftPosition}%`;
      noteElement.style.width = `${widthPercentage}%`;
      
      // Add to DOM
      pianoRollElement.appendChild(noteElement);
      
      // Store reference
      noteElements.set(number, noteElement);
      activeNotes.add(number);
    } else if (!isActive && noteElements.has(number)) {
      // Remove note visualization after a delay
      const noteElement = noteElements.get(number);
      if (noteElement) {
        noteElement.classList.remove('active');
        setTimeout(() => {
          noteElement.remove();
          noteElements.delete(number);
          activeNotes.delete(number);
        }, 300);
      }
    }
    
    // Update active notes display
    updateActiveNotesDisplay();
  }
  
  /**
   * Updates the display of currently active notes
   */
  function updateActiveNotesDisplay(): void {
    if (!activeNotesElement) return;
    
    if (activeNotes.size === 0) {
      activeNotesElement.textContent = '-';
      return;
    }
    
    // Convert note numbers to note names with octaves
    const noteNames = Array.from(activeNotes).map((noteNumber) => {
      const octave = Math.floor(noteNumber / 12) - 1;
      const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][noteNumber % 12];
      return `${noteName}${octave}`;
    }).sort();
    
    // If there are many notes, show a truncated list
    if (noteNames.length > 10) {
      activeNotesElement.textContent = `${noteNames.slice(0, 10).join(', ')}, +${noteNames.length - 10} more`;
    } else {
      activeNotesElement.textContent = noteNames.join(', ');
    }
  }
  
  /**
   * Processes a MIDI event and updates the visualization
   * @param event - MIDI event
   */
  function updateNoteActivity(event: MidiEvent): void {
    switch (event.type) {
      case 'noteOn':
        updatePianoRoll(event.note, true);
        break;
        
      case 'noteOff':
        updatePianoRoll(event.note, false);
        break;
        
      case 'controlChange':
        // Control change events are handled by the audio module
        // We could visualize pedal state here if desired
        break;
    }
  }
  
  /**
   * Updates the key information display
   * @param keyConfig - Current key configuration
   */
  function updateKeyInfo(keyConfig: KeyConfig): void {
    if (currentKeyElement) {
      currentKeyElement.textContent = keyConfig.key;
    }
    
    if (currentScaleElement) {
      currentScaleElement.textContent = keyConfig.scale;
    }
    
    if (currentModeElement) {
      currentModeElement.textContent = keyConfig.mode;
    }
  }
  
  return {
    updateNoteActivity,
    updateKeyInfo
  };
}