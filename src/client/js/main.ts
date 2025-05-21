/**
 * Main entry point for the client-side application
 */

import { setupAudio } from './audio';
import { setupVisualization } from './visualization';
import { setupWebSocket } from './websocket';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioModule = setupAudio(audioContext);
  const visualizationModule = setupVisualization();
  const socketModule = setupWebSocket(audioModule, visualizationModule);
  
  // DOM elements
  const playButton = document.getElementById('play-button') as HTMLButtonElement;
  const stopButton = document.getElementById('stop-button') as HTMLButtonElement;
  const outputModeSelect = document.getElementById('output-mode') as HTMLSelectElement;
  
  // Event listeners
  playButton.addEventListener('click', () => {
    // Resume audio context if suspended (browsers require user gesture)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Get output mode
    const outputMode = outputModeSelect.value as 'browser' | 'midi';
    
    // Start playback
    socketModule.startPlayback(outputMode);
    
    // Update UI
    playButton.disabled = true;
    stopButton.disabled = false;
  });
  
  stopButton.addEventListener('click', () => {
    // Stop playback
    socketModule.stopPlayback();
    
    // Update UI
    playButton.disabled = false;
    stopButton.disabled = true;
  });
  
  // Initial state
  stopButton.disabled = true;
  
  // Check for Web MIDI API support
  if (navigator.requestMIDIAccess) {
    console.log('Web MIDI API is supported in this browser');
  } else {
    console.warn('Web MIDI API is not supported in this browser');
    // Disable MIDI output option
    const midiOption = outputModeSelect.querySelector('option[value="midi"]');
    if (midiOption) {
      midiOption.disabled = true;
      midiOption.textContent = 'MIDI Output (not supported)';
    }
  }
});