import { Server, Socket } from 'socket.io';
import { MusicGenerator } from '../music/generator';

export interface MidiNote {
  note: number;    // MIDI note number (0-127)
  velocity: number; // Velocity (0-127)
  duration: number; // Duration in milliseconds
  channel?: number; // MIDI channel (0-15)
}

export interface MidiChord {
  notes: MidiNote[];
}

export interface PedalEvent {
  type: 'sustain' | 'sostenuto' | 'soft';
  value: number; // 0-127
}

export interface MidiEvent {
  type: 'note' | 'chord' | 'pedal';
  data: MidiNote | MidiChord | PedalEvent;
  timestamp: number;
}

export class MidiStreamer {
  private io: Server;
  private streamInterval: NodeJS.Timeout | null = null;
  private musicGenerator: MusicGenerator;
  
  constructor(io: Server) {
    this.io = io;
    this.musicGenerator = new MusicGenerator();
  }
  
  public startStreaming(options: { key?: string; scale?: string; mode?: string } = {}): void {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
    }
    
    // Set music generator options
    if (options.key) this.musicGenerator.setKey(options.key);
    if (options.scale) this.musicGenerator.setScale(options.scale);
    if (options.mode) this.musicGenerator.setMode(options.mode);
    
    // Start streaming at regular intervals
    this.streamInterval = setInterval(() => {
      const event = this.musicGenerator.generateNextEvent();
      this.io.emit('midiEvent', event);
    }, 1000); // Adjust timing as needed
  }
  
  public stopStreaming(): void {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
      
      // Send all notes off message
      this.io.emit('allNotesOff');
    }
  }
}