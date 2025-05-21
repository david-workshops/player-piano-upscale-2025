import { Server } from 'socket.io';
import { generateMidiSequence } from './generator';
import { MidiEvent, MidiNote } from '../../shared/types';

/**
 * Sets up the MIDI streaming functionality over WebSockets
 * @param io - Socket.io server instance
 */
export function setupMidiStream(io: Server): void {
  // Handle client connections
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    let isPlaying = false;
    let streamInterval: NodeJS.Timeout | null = null;
    
    // Start streaming MIDI data
    socket.on('start', (config: { outputMode: 'browser' | 'midi' }) => {
      if (isPlaying) return;
      
      isPlaying = true;
      const currentKey = { key: 'C', scale: 'major', mode: 'ionian' };
      
      // Stream MIDI events at regular intervals
      streamInterval = setInterval(() => {
        const midiData = generateMidiSequence(currentKey);
        
        // Every few minutes, change the key/scale/mode
        if (Math.random() < 0.001) { // Very low probability for change
          const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
          const scales = ['major', 'minor', 'harmonic minor', 'melodic minor'];
          const modes = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
          
          currentKey.key = keys[Math.floor(Math.random() * keys.length)];
          currentKey.scale = scales[Math.floor(Math.random() * scales.length)];
          currentKey.mode = modes[Math.floor(Math.random() * modes.length)];
          
          // Inform client about the key change
          socket.emit('keyChange', currentKey);
        }
        
        // Send MIDI data to the client
        socket.emit('midiData', midiData);
      }, 500); // Send data every 500ms
    });
    
    // Stop streaming MIDI data
    socket.on('stop', () => {
      if (streamInterval) {
        clearInterval(streamInterval);
        streamInterval = null;
        isPlaying = false;
        
        // Send all notes off message
        socket.emit('allNotesOff');
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
      if (streamInterval) {
        clearInterval(streamInterval);
        streamInterval = null;
      }
    });
  });
}