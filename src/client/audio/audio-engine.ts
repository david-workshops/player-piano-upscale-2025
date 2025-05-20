/**
 * Audio Engine
 * Handles playback of MIDI notes using Web Audio API
 */
/// <reference path="./webmidi.d.ts" />

import { MidiChord, MidiNote, XPMidiParams } from '../../shared/types';

type OutputMode = 'webaudio' | 'midi';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private activeNotes: Map<number, OscillatorNode[]> = new Map();
  private pianoSamples: Map<number, AudioBuffer> = new Map();
  private outputMode: OutputMode = 'webaudio';
  private midiAccess: WebMidi.MIDIAccess | null = null;
  private midiOutput: WebMidi.MIDIOutput | null = null;
  
  constructor() {
    this.initMIDIIfAvailable();
  }
  
  /**
   * Initialize the Web Audio API context if it hasn't been already
   */
  public initializeIfNeeded(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.7; // Set default volume
      this.gainNode.connect(this.audioContext.destination);
      
      // Load piano samples
      this.loadPianoSamples();
    }
  }
  
  /**
   * Set the output mode (Web Audio API or MIDI output)
   */
  public setOutputMode(mode: OutputMode): void {
    this.outputMode = mode;
    if (mode === 'midi' && !this.midiAccess) {
      this.initMIDIIfAvailable();
    }
  }
  
  /**
   * Initialize Web MIDI API if available
   */
  private async initMIDIIfAvailable(): Promise<void> {
    if (navigator.requestMIDIAccess) {
      try {
        this.midiAccess = await navigator.requestMIDIAccess();
        this.updateMIDIOutputs();
        
        this.midiAccess.addEventListener('statechange', () => {
          this.updateMIDIOutputs();
        });
      } catch (err) {
        console.error('MIDI access denied:', err);
      }
    }
  }
  
  /**
   * Update available MIDI outputs and select the first available one
   */
  private updateMIDIOutputs(): void {
    if (!this.midiAccess) return;
    
    const outputs = Array.from(this.midiAccess.outputs.values());
    this.midiOutput = outputs.length > 0 ? outputs[0] : null;
    
    if (this.midiOutput) {
      console.log(`MIDI output selected: ${this.midiOutput.name}`);
    } else {
      console.warn('No MIDI outputs available');
    }
  }
  
  /**
   * Load piano samples for more realistic playback
   */
  private loadPianoSamples(): void {
    // In a real implementation, we would load actual piano samples
    // For this demo, we'll use a simple sine wave generator
    console.log('Piano sample loading would happen here in a full implementation');
  }
  
  /**
   * Play a single MIDI note
   */
  public playNote(note: MidiNote, xpParams?: XPMidiParams): void {
    this.initializeIfNeeded();
    
    if (this.outputMode === 'midi') {
      this.playNoteViaMIDI(note, xpParams);
    } else {
      this.playNoteViaWebAudio(note, xpParams);
    }
  }
  
  /**
   * Play a chord (multiple simultaneous notes)
   */
  public playChord(chord: MidiChord, xpParams?: XPMidiParams): void {
    chord.notes.forEach(note => {
      this.playNote(note, xpParams);
    });
  }
  
  /**
   * Stop all currently playing notes
   */
  public stopAllNotes(): void {
    if (this.outputMode === 'midi' && this.midiOutput) {
      // Send All Notes Off message
      this.midiOutput.send([0xB0, 123, 0]);
    } else {
      // Stop all Web Audio notes
      this.activeNotes.forEach((oscillators, pitch) => {
        oscillators.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {
            // Ignore errors from already stopped oscillators
          }
        });
      });
      this.activeNotes.clear();
    }
  }
  
  /**
   * Play a note using Web Audio API
   */
  private playNoteViaWebAudio(note: MidiNote, xpParams?: XPMidiParams): void {
    if (!this.audioContext || !this.gainNode) return;
    
    // Convert MIDI pitch to frequency
    const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12);
    
    // Create oscillators for more complex timbre
    const oscillators: OscillatorNode[] = [];
    
    // Create main oscillator (piano-like)
    const mainOsc = this.audioContext.createOscillator();
    mainOsc.type = 'sine';
    mainOsc.frequency.value = frequency;
    
    // Create envelope for the note
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;
    
    // Set attack
    envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(
      note.velocity / 127, 
      this.audioContext.currentTime + 0.01
    );
    
    // Set release
    envelope.gain.setValueAtTime(
      note.velocity / 127, 
      this.audioContext.currentTime + (note.duration / 1000) - 0.1
    );
    envelope.gain.linearRampToValueAtTime(
      0, 
      this.audioContext.currentTime + (note.duration / 1000)
    );
    
    // Connect oscillator -> envelope -> gain -> output
    mainOsc.connect(envelope);
    envelope.connect(this.gainNode);
    
    // Start the oscillator
    mainOsc.start();
    mainOsc.stop(this.audioContext.currentTime + (note.duration / 1000) + 0.1);
    
    oscillators.push(mainOsc);
    
    // Add harmonics for richer sound
    const harmonics = [2, 3, 4, 5];
    const harmonicGains = [0.5, 0.25, 0.125, 0.06];
    
    harmonics.forEach((harmonic, i) => {
      const harmonicOsc = this.audioContext.createOscillator();
      harmonicOsc.type = 'sine';
      harmonicOsc.frequency.value = frequency * harmonic;
      
      const harmonicGain = this.audioContext.createGain();
      harmonicGain.gain.value = harmonicGains[i] * (note.velocity / 127);
      
      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(envelope);
      
      harmonicOsc.start();
      harmonicOsc.stop(this.audioContext.currentTime + (note.duration / 1000) + 0.1);
      
      oscillators.push(harmonicOsc);
    });
    
    // Store active notes to be able to stop them later
    this.activeNotes.set(note.pitch, oscillators);
    
    // Handle pedal if XP MIDI params are provided
    if (xpParams?.pedalData) {
      this.applyPedalEffect(xpParams.pedalData);
    }
  }
  
  /**
   * Play a note via MIDI output
   */
  private playNoteViaMIDI(note: MidiNote, xpParams?: XPMidiParams): void {
    if (!this.midiOutput) return;
    
    // Send Note On message (channel 1)
    this.midiOutput.send([0x90, note.pitch, note.velocity]);
    
    // Apply pedal data if provided
    if (xpParams?.pedalData) {
      const { damper, sostenuto, soft } = xpParams.pedalData;
      
      // Damper/sustain pedal (CC 64)
      if (typeof damper === 'number') {
        this.midiOutput.send([0xB0, 64, damper]);
      }
      
      // Sostenuto pedal (CC 66)
      if (typeof sostenuto === 'number') {
        this.midiOutput.send([0xB0, 66, sostenuto]);
      }
      
      // Soft pedal (CC 67)
      if (typeof soft === 'number') {
        this.midiOutput.send([0xB0, 67, soft]);
      }
    }
    
    // Schedule Note Off message
    setTimeout(() => {
      if (this.midiOutput) {
        this.midiOutput.send([0x80, note.pitch, 0]);
      }
    }, note.duration);
  }
  
  /**
   * Apply pedal effects to the Web Audio output
   */
  private applyPedalEffect(pedalData: { damper?: number; sostenuto?: number; soft?: number }): void {
    if (!this.audioContext || !this.gainNode) return;
    
    // Damper pedal extends release time
    if (typeof pedalData.damper === 'number' && pedalData.damper > 0) {
      // Extend release time of all active notes
      const damperAmount = pedalData.damper / 127;
      // In a real implementation, we would adjust the release of all notes
    }
    
    // Soft pedal reduces volume
    if (typeof pedalData.soft === 'number' && pedalData.soft > 0) {
      const softAmount = 1 - (pedalData.soft / 127) * 0.25;
      if (this.gainNode) {
        this.gainNode.gain.linearRampToValueAtTime(
          softAmount * 0.7,
          this.audioContext.currentTime + 0.1
        );
      }
    } else if (this.gainNode) {
      // Reset gain if soft pedal is not active
      this.gainNode.gain.linearRampToValueAtTime(0.7, this.audioContext.currentTime + 0.1);
    }
    
    // Sostenuto pedal is more complex and would require tracking which notes
    // were active when the pedal was pressed. Simplified for this demo.
  }
}