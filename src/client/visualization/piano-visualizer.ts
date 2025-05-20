/**
 * Piano Visualizer Component
 * Creates a visual representation of a piano keyboard with active notes
 */
import { MidiChord, MidiNote } from '../../shared/types';

export class PianoVisualizer {
  private container: HTMLElement;
  private keys: Map<number, HTMLElement> = new Map();
  private activeNotes: Set<number> = new Set();
  
  // Piano constants
  private readonly PIANO_MIN = 21;  // A0
  private readonly PIANO_MAX = 108; // C8
  private readonly BLACK_KEY_PATTERN = [false, true, false, true, false, false, true, false, true, false, true, false];
  
  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with ID "${containerId}" not found`);
    }
    
    this.container = container;
    this.createKeyboard();
  }
  
  /**
   * Create the visual keyboard
   */
  private createKeyboard(): void {
    // Clear any existing content
    this.container.innerHTML = '';
    
    // Calculate key width based on container width and number of white keys
    const totalKeys = this.PIANO_MAX - this.PIANO_MIN + 1;
    const whiteKeyCount = this.countWhiteKeys();
    const whiteKeyWidth = 100 / whiteKeyCount; // Percentage width
    
    let whiteKeyIndex = 0;
    
    // Create keys from lowest to highest note
    for (let pitch = this.PIANO_MIN; pitch <= this.PIANO_MAX; pitch++) {
      const isBlack = this.isBlackKey(pitch);
      const keyElement = document.createElement('div');
      keyElement.className = isBlack ? 'piano-key black' : 'piano-key';
      
      if (isBlack) {
        // Position black keys between white keys
        const leftPosition = (whiteKeyIndex - 0.35) * whiteKeyWidth;
        keyElement.style.left = `${leftPosition}%`;
        keyElement.style.width = `${whiteKeyWidth * 0.7}%`;
      } else {
        // Position white keys sequentially
        keyElement.style.left = `${whiteKeyIndex * whiteKeyWidth}%`;
        keyElement.style.width = `${whiteKeyWidth}%`;
        whiteKeyIndex++;
      }
      
      this.container.appendChild(keyElement);
      this.keys.set(pitch, keyElement);
    }
  }
  
  /**
   * Determine if a MIDI pitch corresponds to a black key
   */
  private isBlackKey(pitch: number): boolean {
    return this.BLACK_KEY_PATTERN[pitch % 12];
  }
  
  /**
   * Count the number of white keys in the piano range
   */
  private countWhiteKeys(): number {
    let count = 0;
    for (let pitch = this.PIANO_MIN; pitch <= this.PIANO_MAX; pitch++) {
      if (!this.isBlackKey(pitch)) {
        count++;
      }
    }
    return count;
  }
  
  /**
   * Show a note on the visualizer
   */
  public showNote(note: MidiNote): void {
    const keyElement = this.keys.get(note.pitch);
    if (keyElement) {
      // Add active class
      keyElement.classList.add('active');
      this.activeNotes.add(note.pitch);
      
      // Schedule removal of active class
      setTimeout(() => {
        keyElement.classList.remove('active');
        this.activeNotes.delete(note.pitch);
      }, note.duration);
    }
  }
  
  /**
   * Show a chord on the visualizer
   */
  public showChord(chord: MidiChord): void {
    chord.notes.forEach(note => this.showNote(note));
  }
  
  /**
   * Clear all active notes from the visualizer
   */
  public clearAllNotes(): void {
    this.activeNotes.forEach(pitch => {
      const keyElement = this.keys.get(pitch);
      if (keyElement) {
        keyElement.classList.remove('active');
      }
    });
    this.activeNotes.clear();
  }
}