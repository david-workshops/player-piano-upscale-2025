import { 
  MidiNote, 
  MidiChord, 
  PedalState, 
  PedalType, 
  MusicalContext,
  MusicalEvent
} from '../../shared/types/music';

import {
  getScale,
  getMode,
  getChord,
  generateRandomContext,
  SCALES,
  MODES
} from '../../shared/utils/music-theory';

/**
 * Service responsible for generating musical content
 */
export class MusicGenerator {
  private currentContext: MusicalContext;
  private lastEventTime: number;
  private notes: number[];
  
  // Configuration
  private readonly minVelocity = 40;
  private readonly maxVelocity = 100;
  private readonly minDuration = 500;   // 0.5 seconds
  private readonly maxDuration = 4000;  // 4 seconds
  private readonly minInterval = 300;   // Minimum time between events
  private readonly maxInterval = 2000;  // Maximum time between events
  private readonly chordProbability = 0.4;
  private readonly pedalProbability = 0.2;
  private readonly contextChangeProbability = 0.01;
  private readonly baseOctave = 3;      // Middle octave
  private readonly octaveRange = 4;     // Number of octaves to use
  
  constructor() {
    // Initialize with a random musical context
    const { key, scale, mode } = generateRandomContext();
    this.currentContext = {
      key,
      scale,
      mode,
      timestamp: Date.now()
    };
    
    this.lastEventTime = Date.now();
    this.notes = this.generateNotes();
  }
  
  /**
   * Generate notes based on current musical context
   */
  private generateNotes(): number[] {
    // If we have a scale and mode, use the mode
    if (this.currentContext.scale === 'major' && MODES[this.currentContext.mode as keyof typeof MODES] !== undefined) {
      return getMode(
        this.currentContext.key, 
        this.baseOctave,
        this.currentContext.mode as keyof typeof MODES,
        this.octaveRange
      );
    }
    
    // Otherwise use the scale directly
    return getScale(
      this.currentContext.key,
      this.baseOctave,
      this.currentContext.scale as keyof typeof SCALES,
      this.octaveRange
    );
  }
  
  /**
   * Generate a random MIDI note from current scale/mode
   */
  private generateNote(): MidiNote {
    const noteIndex = Math.floor(Math.random() * this.notes.length);
    const noteNumber = this.notes[noteIndex];
    const velocity = this.minVelocity + Math.floor(Math.random() * (this.maxVelocity - this.minVelocity));
    const duration = this.minDuration + Math.floor(Math.random() * (this.maxDuration - this.minDuration));
    
    return {
      noteNumber,
      velocity,
      duration,
      timestamp: Date.now()
    };
  }
  
  /**
   * Generate a random chord from current scale/mode
   */
  private generateChord(): MidiChord {
    const startIndex = Math.floor(Math.random() * this.notes.length);
    
    // Choose a chord type (simple triad, seventh, etc.)
    const chordTypes = [
      [0, 2, 4],    // Triad
      [0, 2, 4, 6], // Seventh
      [0, 2, 4, 7], // Add9
      [0, 3, 6]     // Quartal
    ];
    
    const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
    const chordNotes = getChord(this.notes, startIndex, chordType);
    
    const velocity = this.minVelocity + Math.floor(Math.random() * (this.maxVelocity - this.minVelocity));
    const duration = this.minDuration + Math.floor(Math.random() * (this.maxDuration - this.minDuration));
    
    const notes: MidiNote[] = chordNotes.map(noteNumber => ({
      noteNumber,
      velocity,
      duration,
      timestamp: Date.now()
    }));
    
    return {
      notes,
      timestamp: Date.now()
    };
  }
  
  /**
   * Generate a random pedal event
   */
  private generatePedalEvent(): PedalState {
    const pedalTypes = [PedalType.DAMPER, PedalType.SOSTENUTO, PedalType.SOFT];
    const type = pedalTypes[Math.floor(Math.random() * pedalTypes.length)];
    
    // Either fully press or fully release
    const value = Math.random() > 0.5 ? 127 : 0;
    
    return {
      type,
      value,
      timestamp: Date.now()
    };
  }
  
  /**
   * Possibly change the musical context
   */
  private maybeChangeContext(): MusicalContext | null {
    if (Math.random() < this.contextChangeProbability) {
      const { key, scale, mode } = generateRandomContext();
      this.currentContext = {
        key,
        scale,
        mode,
        timestamp: Date.now()
      };
      
      // Generate new notes based on updated context
      this.notes = this.generateNotes();
      
      return this.currentContext;
    }
    
    return null;
  }
  
  /**
   * Generate the next musical event
   */
  public generateNextEvent(): MusicalEvent {
    // First check if we should change context
    const contextChange = this.maybeChangeContext();
    if (contextChange) {
      return contextChange;
    }
    
    // Decide what kind of event to generate
    const rand = Math.random();
    
    if (rand < this.chordProbability) {
      return this.generateChord();
    } else if (rand < this.chordProbability + this.pedalProbability) {
      return this.generatePedalEvent();
    } else {
      return this.generateNote();
    }
  }
  
  /**
   * Calculate time until next event
   */
  public getTimeUntilNextEvent(): number {
    return this.minInterval + Math.floor(Math.random() * (this.maxInterval - this.minInterval));
  }
  
  /**
   * Get the current musical context
   */
  public getCurrentContext(): MusicalContext {
    return this.currentContext;
  }
}