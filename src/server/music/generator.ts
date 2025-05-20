import { MidiEvent, MidiNote, MidiChord, PedalEvent } from '../midi/stream';
import { ScaleGenerator } from './scales';

// MIDI note ranges for piano
const LOWEST_NOTE = 21;  // A0
const HIGHEST_NOTE = 108; // C8

export class MusicGenerator {
  private scaleGenerator: ScaleGenerator;
  private lastEventTime: number = 0;
  private activeNotes: Set<number> = new Set();
  private silenceProbability = 0.2; // Probability of a silence
  private chordProbability = 0.4;   // Probability of playing a chord
  private pedalProbability = 0.1;   // Probability of a pedal event
  private keyChangeInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
  private lastKeyChangeTime = Date.now();
  
  constructor() {
    this.scaleGenerator = new ScaleGenerator();
  }
  
  public setKey(key: string): void {
    this.scaleGenerator.setKey(key);
  }
  
  public setScale(scale: string): void {
    this.scaleGenerator.setScale(scale);
  }
  
  public setMode(mode: string): void {
    this.scaleGenerator.setMode(mode);
  }
  
  public generateNextEvent(): MidiEvent {
    const now = Date.now();
    
    // Occasionally change key/scale/mode (every 5 minutes)
    if (now - this.lastKeyChangeTime > this.keyChangeInterval) {
      this.scaleGenerator.randomChange();
      this.lastKeyChangeTime = now;
    }
    
    // Decide what type of event to generate
    const rand = Math.random();
    
    // Generate silence
    if (rand < this.silenceProbability) {
      return this.generateSilence();
    }
    
    // Generate pedal event
    if (rand < this.silenceProbability + this.pedalProbability) {
      return this.generatePedalEvent();
    }
    
    // Generate chord
    if (rand < this.silenceProbability + this.pedalProbability + this.chordProbability) {
      return this.generateChordEvent();
    }
    
    // Generate note
    return this.generateNoteEvent();
  }
  
  private generateNoteEvent(): MidiEvent {
    const note = this.generateRandomNote();
    this.activeNotes.add(note.note);
    
    // Schedule note off after duration
    setTimeout(() => {
      this.activeNotes.delete(note.note);
    }, note.duration);
    
    return {
      type: 'note',
      data: note,
      timestamp: Date.now()
    };
  }
  
  private generateChordEvent(): MidiEvent {
    const numNotes = 2 + Math.floor(Math.random() * 4); // 2-5 notes in a chord
    const notes: MidiNote[] = [];
    
    // Generate notes in the chord
    for (let i = 0; i < numNotes; i++) {
      const note = this.generateRandomNote();
      notes.push(note);
      this.activeNotes.add(note.note);
      
      // Schedule note off
      setTimeout(() => {
        this.activeNotes.delete(note.note);
      }, note.duration);
    }
    
    const chord: MidiChord = { notes };
    
    return {
      type: 'chord',
      data: chord,
      timestamp: Date.now()
    };
  }
  
  private generatePedalEvent(): MidiEvent {
    // Randomly choose pedal type
    const pedalTypes: Array<'sustain' | 'sostenuto' | 'soft'> = ['sustain', 'sostenuto', 'soft'];
    const type = pedalTypes[Math.floor(Math.random() * pedalTypes.length)];
    
    // Generate random value (0 = off, 127 = fully on)
    const value = Math.random() < 0.5 ? 0 : 127;
    
    const pedalEvent: PedalEvent = { type, value };
    
    return {
      type: 'pedal',
      data: pedalEvent,
      timestamp: Date.now()
    };
  }
  
  private generateSilence(): MidiEvent {
    // For silence, we'll create a dummy event with a special flag
    return {
      type: 'note',
      data: { note: -1, velocity: 0, duration: 0 },
      timestamp: Date.now()
    };
  }
  
  private generateRandomNote(): MidiNote {
    // Generate a note within the piano range using scale
    const midiNote = this.scaleGenerator.getRandomNoteInScale(LOWEST_NOTE, HIGHEST_NOTE);
    
    // Generate random velocity (volume) - emphasis on middle volumes for more musical expression
    const velocity = 60 + Math.floor(Math.random() * 40); // Range: 60-100
    
    // Generate random duration - more variation for musical interest
    const durationBase = 500 + Math.floor(Math.random() * 3000); // 0.5 - 3.5 seconds
    const durationVariation = Math.floor(Math.random() * 500); // Up to 0.5 second variation
    const duration = durationBase + durationVariation;
    
    return {
      note: midiNote,
      velocity,
      duration,
      channel: 0 // Default channel
    };
  }
}