/**
 * WebSocket module for handling MIDI data from server
 */

import { MidiEvent, KeyConfig } from '../../shared/types';

interface WebSocketModule {
  startPlayback: (outputMode: 'browser' | 'midi') => void;
  stopPlayback: () => void;
}

interface AudioModule {
  processMidiEvent: (event: MidiEvent) => void;
  allNotesOff: () => void;
}

interface VisualizationModule {
  updateNoteActivity: (event: MidiEvent) => void;
  updateKeyInfo: (keyConfig: KeyConfig) => void;
}

export function setupWebSocket(
  audioModule: AudioModule,
  visualModule: VisualizationModule
): WebSocketModule {
  // Socket.io connection
  const socket = io();
  
  // MIDI output (if supported)
  let midiOutput: WebMidi.MIDIOutput | null = null;
  let midiAccess: WebMidi.MIDIAccess | null = null;
  
  // Initialize Web MIDI API if available
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
      .then((access) => {
        midiAccess = access;
        console.log('MIDI access granted', access);
      })
      .catch((err) => {
        console.error('Error accessing MIDI devices:', err);
      });
  }
  
  // Listen for WebSocket events
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    audioModule.allNotesOff();
  });
  
  socket.on('midiData', (events: MidiEvent[]) => {
    events.forEach((event) => {
      // Process event for audio synthesis
      audioModule.processMidiEvent(event);
      
      // Update visualization
      visualModule.updateNoteActivity(event);
      
      // Send to MIDI output if available and selected
      if (midiOutput && event.type === 'noteOn') {
        const { number, velocity } = event.note;
        midiOutput.send([0x90, number, velocity]); // Note On
      } else if (midiOutput && event.type === 'noteOff') {
        const { number } = event.note;
        midiOutput.send([0x80, number, 0]); // Note Off
      } else if (midiOutput && event.type === 'controlChange') {
        const { controller, value } = event;
        midiOutput.send([0xB0, controller, value]); // Control Change
      }
    });
  });
  
  socket.on('keyChange', (keyConfig: KeyConfig) => {
    console.log('Key changed:', keyConfig);
    visualModule.updateKeyInfo(keyConfig);
  });
  
  socket.on('allNotesOff', () => {
    console.log('All notes off message received');
    audioModule.allNotesOff();
    
    // If MIDI output is active, send all notes off message
    if (midiOutput) {
      // Channel Mode Message: All Notes Off (Control Change 123, value 0)
      midiOutput.send([0xB0, 123, 0]);
    }
  });
  
  /**
   * Sets up MIDI output device
   * @returns Promise that resolves when MIDI is set up
   */
  async function setupMidiOutput(): Promise<boolean> {
    if (!midiAccess) return false;
    
    // Get all MIDI outputs
    const outputs = Array.from(midiAccess.outputs.values());
    
    if (outputs.length === 0) {
      console.warn('No MIDI output devices detected');
      return false;
    }
    
    // Use the first available MIDI output
    midiOutput = outputs[0];
    console.log('Using MIDI output:', midiOutput.name);
    return true;
  }
  
  return {
    startPlayback: async (outputMode: 'browser' | 'midi') => {
      if (outputMode === 'midi') {
        const midiSetup = await setupMidiOutput();
        if (!midiSetup) {
          console.warn('Failed to setup MIDI output, falling back to browser audio');
          outputMode = 'browser';
        }
      } else {
        midiOutput = null;
      }
      
      // Tell server to start streaming MIDI data
      socket.emit('start', { outputMode });
    },
    
    stopPlayback: () => {
      // Tell server to stop streaming MIDI data
      socket.emit('stop');
    }
  };
}