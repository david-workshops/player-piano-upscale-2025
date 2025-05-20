/**
 * Web Audio API implementation of the audio engine interface
 * This module replaces Tone.js with native Web Audio API
 */

/**
 * AudioEngine interface defines the methods needed for piano sound playback
 */
export interface AudioEngine {
  /**
   * Plays a single note with the specified parameters
   * @param note - MIDI note number (0-127)
   * @param velocity - MIDI velocity (0-127)
   * @param duration - Duration in milliseconds
   */
  playNote: (note: number, velocity: number, duration: number) => void;
  
  /**
   * Sets the sustain pedal state
   * @param on - Whether the sustain pedal is pressed (true) or released (false)
   */
  setSustain: (on: boolean) => void;
  
  /**
   * Stops all active notes immediately
   */
  allNotesOff: () => void;
  
  /**
   * Starts the audio context (must be called after user interaction)
   */
  startAudio: () => Promise<void>;
}

// Note map to track active notes and their scheduled release timeouts
interface ActiveNote {
  gainNode: GainNode;
  oscillators: OscillatorNode[];
  releaseTimeout?: number;
}

/**
 * Class implementing an audio engine using the Web Audio API
 */
export class WebAudioEngine implements AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  
  // Track active notes and sustain state
  private activeNotes: Map<number, ActiveNote> = new Map();
  private sustainedNotes: Set<number> = new Set();
  private isSustainOn: boolean = false;
  
  /**
   * Initializes the audio context and sets up the audio processing graph
   */
  private async initializeContext(): Promise<void> {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.5; // Set master volume
      this.masterGain.connect(this.audioContext.destination);
      
      // Create reverb
      await this.createReverb();
      
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      throw new Error('Failed to initialize Web Audio engine');
    }
  }
  
  /**
   * Creates a simple reverb effect
   */
  private async createReverb(): Promise<void> {
    if (!this.audioContext || !this.masterGain) return;
    
    try {
      // Create convolver node for reverb
      this.reverbNode = this.audioContext.createConvolver();
      
      // Generate a simple impulse response
      const impulseResponse = await this.generateImpulseResponse(2, 1.5);
      this.reverbNode.buffer = impulseResponse;
      
      // Create a gain node to control reverb level
      const reverbGain = this.audioContext.createGain();
      reverbGain.gain.value = 0.2; // 20% wet signal
      
      // Connect reverb to output
      this.reverbNode.connect(reverbGain);
      reverbGain.connect(this.audioContext.destination);
    } catch (error) {
      console.warn('Could not create reverb, continuing without it:', error);
    }
  }
  
  /**
   * Generates an impulse response for the reverb effect
   * @param duration - Duration of the impulse response in seconds
   * @param decay - Decay rate of the impulse response
   * @returns AudioBuffer containing the impulse response
   */
  private async generateImpulseResponse(duration: number, decay: number): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    // Generate impulse response for left and right channels
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        // Exponential decay
        const t = i / sampleRate;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - t / duration, decay);
      }
    }
    
    return impulse;
  }
  
  /**
   * Converts a MIDI note number to its corresponding frequency in Hz
   * @param midiNote - MIDI note number (0-127)
   * @returns Frequency in Hz
   */
  private midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }
  
  /**
   * Converts a MIDI velocity (0-127) to a gain value (0-1)
   * @param velocity - MIDI velocity
   * @returns Gain value
   */
  private velocityToGain(velocity: number): number {
    return Math.min(1, Math.max(0, velocity / 127));
  }
  
  /**
   * Creates a piano-like note with multiple harmonics
   * @param note - MIDI note number
   * @param velocity - MIDI velocity (0-127)
   * @returns Object containing the gain node and oscillator nodes
   */
  private createNote(note: number, velocity: number): ActiveNote | null {
    if (!this.audioContext || !this.masterGain) return null;
    
    try {
      const frequency = this.midiToFrequency(note);
      const gain = this.velocityToGain(velocity);
      
      // Create a gain node for this note
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0;
      
      // Connect to output and reverb if available
      gainNode.connect(this.masterGain);
      if (this.reverbNode) {
        gainNode.connect(this.reverbNode);
      }
      
      // Create oscillators for a richer piano sound
      const oscillators: OscillatorNode[] = [];
      
      // Main oscillator (fundamental frequency)
      const osc1 = this.audioContext.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.value = frequency;
      osc1.connect(gainNode);
      
      // Second oscillator (one octave up, softer)
      const osc2 = this.audioContext.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = frequency * 2;
      
      // Create another gain node for the second oscillator to make it quieter
      const osc2Gain = this.audioContext.createGain();
      osc2Gain.gain.value = 0.2;
      osc2.connect(osc2Gain);
      osc2Gain.connect(gainNode);
      
      // Add a slight detuned oscillator for richness
      const osc3 = this.audioContext.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.value = frequency * 1.003; // Slightly detuned
      
      const osc3Gain = this.audioContext.createGain();
      osc3Gain.gain.value = 0.1;
      osc3.connect(osc3Gain);
      osc3Gain.connect(gainNode);
      
      // Start oscillators
      const now = this.audioContext.currentTime;
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      
      // Apply attack envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(gain, now + 0.02);
      
      oscillators.push(osc1, osc2, osc3);
      
      return {
        gainNode,
        oscillators
      };
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  }
  
  /**
   * Releases a note with a proper release envelope
   * @param noteNumber - MIDI note number
   * @param immediate - Whether to release immediately (true) or with envelope (false)
   */
  private releaseNote(noteNumber: number, immediate: boolean = false): void {
    const activeNote = this.activeNotes.get(noteNumber);
    if (!activeNote || !this.audioContext) return;
    
    // Clear any pending release timeout
    if (activeNote.releaseTimeout) {
      window.clearTimeout(activeNote.releaseTimeout);
      activeNote.releaseTimeout = undefined;
    }
    
    // If sustain is on and not an immediate release, add to sustained notes
    if (this.isSustainOn && !immediate) {
      this.sustainedNotes.add(noteNumber);
      return;
    }
    
    const now = this.audioContext.currentTime;
    const release = immediate ? 0.1 : 1.0; // Release time in seconds
    
    try {
      // Apply release envelope
      activeNote.gainNode.gain.cancelScheduledValues(now);
      activeNote.gainNode.gain.setValueAtTime(activeNote.gainNode.gain.value, now);
      activeNote.gainNode.gain.exponentialRampToValueAtTime(0.001, now + release);
      
      // Stop oscillators and clean up after release
      setTimeout(() => {
        try {
          activeNote.oscillators.forEach(osc => osc.stop());
          this.activeNotes.delete(noteNumber);
        } catch (e) {
          console.warn('Error stopping oscillators:', e);
        }
      }, release * 1000 + 100);
      
    } catch (error) {
      console.warn('Error in release envelope:', error);
      
      // Fallback: stop immediately
      try {
        activeNote.oscillators.forEach(osc => osc.stop());
        this.activeNotes.delete(noteNumber);
      } catch (e) {
        console.warn('Error in fallback note release:', e);
      }
    }
  }
  
  /**
   * Plays a note with the specified duration
   * @param note - MIDI note number
   * @param velocity - MIDI velocity (0-127)
   * @param duration - Duration in milliseconds
   */
  public playNote(note: number, velocity: number, duration: number): void {
    if (!this.audioContext) {
      console.warn('AudioContext not initialized, call startAudio() first');
      return;
    }
    
    // Stop any currently playing instance of this note
    if (this.activeNotes.has(note)) {
      this.releaseNote(note, true);
    }
    
    // Create a new note
    const activeNote = this.createNote(note, velocity);
    if (!activeNote) return;
    
    // Store in active notes
    this.activeNotes.set(note, activeNote);
    
    // Schedule note release if not using sustain
    if (!this.isSustainOn) {
      const releaseTimeout = window.setTimeout(() => {
        this.releaseNote(note);
      }, duration);
      
      activeNote.releaseTimeout = releaseTimeout;
    }
  }
  
  /**
   * Sets the sustain pedal state
   * @param on - Whether the pedal is pressed (true) or released (false)
   */
  public setSustain(on: boolean): void {
    this.isSustainOn = on;
    
    // If sustain is turned off, release all sustained notes
    if (!on && this.sustainedNotes.size > 0) {
      for (const note of this.sustainedNotes) {
        this.releaseNote(note);
      }
      this.sustainedNotes.clear();
    }
  }
  
  /**
   * Stops all active notes immediately
   */
  public allNotesOff(): void {
    // Release all notes immediately
    for (const note of this.activeNotes.keys()) {
      this.releaseNote(note, true);
    }
    
    // Clear sustained notes
    this.sustainedNotes.clear();
    this.isSustainOn = false;
  }
  
  /**
   * Starts the audio context (must be called after user interaction)
   */
  public async startAudio(): Promise<void> {
    try {
      await this.initializeContext();
      
      // Resume context if suspended
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      console.log('Web Audio engine started successfully');
    } catch (error) {
      console.error('Failed to start audio:', error);
      throw new Error('Could not start audio engine');
    }
  }
}

/**
 * Fallback audio engine that just logs actions without producing sound
 * Used when Web Audio API is not available
 */
export class FallbackAudioEngine implements AudioEngine {
  constructor() {
    console.warn('Using fallback audio engine - sounds will not play');
  }
  
  public playNote(note: number, velocity: number, duration: number): void {
    console.log(`[Fallback] Play note: ${note}, velocity: ${velocity}, duration: ${duration}ms`);
  }
  
  public setSustain(on: boolean): void {
    console.log(`[Fallback] Set sustain: ${on}`);
  }
  
  public allNotesOff(): void {
    console.log('[Fallback] All notes off');
  }
  
  public async startAudio(): Promise<void> {
    console.log('[Fallback] Audio context started (mock)');
    return Promise.resolve();
  }
}

/**
 * Creates and returns an appropriate audio engine instance
 * @returns An AudioEngine implementation
 */
export function createWebAudioEngine(): AudioEngine {
  // Check if Web Audio API is supported
  if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
    try {
      return new WebAudioEngine();
    } catch (error) {
      console.error('Error creating WebAudioEngine:', error);
      return new FallbackAudioEngine();
    }
  } else {
    // Fallback for environments without Web Audio API
    return new FallbackAudioEngine();
  }
}