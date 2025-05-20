import { Server } from 'socket.io';
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

/**
 * Handles streaming of MIDI events to connected clients
 */
export class MidiStreamer {
  private io: Server;
  private streamInterval: NodeJS.Timeout | null = null;
  private musicGenerator: MusicGenerator;
  
  /**
   * Creates a new MIDI streamer
   * @param io Socket.IO server instance for streaming events
   */
  constructor(io: Server) {
    this.io = io;
    
    // Create music generator with callback for parameter changes
    this.musicGenerator = new MusicGenerator((params) => {
      // Emit parameter changes to all clients
      this.io.emit('musicParametersChanged', params);
    });
  }
  
  /**
   * Starts streaming MIDI events
   * @param _options Optional parameters (unused in auto mode)
   */
  public startStreaming(_options: { key?: string; scale?: string; mode?: string } = {}): void {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
    }
    
    // Start streaming at regular intervals
    this.streamInterval = setInterval(() => {
      const event = this.musicGenerator.generateNextEvent();
      this.io.emit('midiEvent', event);
    }, 1000); // Generate a new event every second
  }
  
  /**
   * Stops streaming MIDI events
   */
  public stopStreaming(): void {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
      
      // Send all notes off message
      this.io.emit('allNotesOff');
    }
  }
  
  /**
   * Gets the current musical parameters
   * @returns Current key, scale, and mode
   */
  public getCurrentMusicalParameters(): { key: string; scale: string; mode: string } {
    return {
      key: this.musicGenerator.getCurrentKey(),
      scale: this.musicGenerator.getCurrentScale(),
      mode: this.musicGenerator.getCurrentMode()
    };
  }
}