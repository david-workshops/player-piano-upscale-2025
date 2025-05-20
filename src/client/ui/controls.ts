// Import WebMidi from 'webmidi' would be here, but we're using script tag in HTML
// for simplicity, so the WebMidi object is available globally

declare global {
  interface Window {
    WebMidi: any;
  }
}

export interface MidiOutputControl {
  output: any | null;
}

export function setupMidiOutput(): MidiOutputControl {
  const outputControl: MidiOutputControl = {
    output: null
  };
  
  const outputModeSelect = document.getElementById('outputMode') as HTMLSelectElement;
  const statusElement = document.getElementById('status') as HTMLDivElement;
  const visualizationElement = document.getElementById('visualization') as HTMLElement;
  
  // Initialize WebMidi when selecting MIDI output
  outputModeSelect.addEventListener('change', async () => {
    const mode = outputModeSelect.value;
    
    // If MIDI output is selected, try to enable WebMidi
    if (mode === 'midi') {
      try {
        // Check if WebMidi is available
        if (window.WebMidi) {
          if (!window.WebMidi.enabled) {
            await window.WebMidi.enable();
          }
          
          // Get the first available output or null
          outputControl.output = window.WebMidi.outputs.length > 0 ? 
            window.WebMidi.outputs[0] : null;
          
          // Update status
          if (outputControl.output) {
            statusElement.textContent = `STATUS: MIDI OUT - ${outputControl.output.name}`;
            addLog(`MIDI OUTPUT SELECTED: ${outputControl.output.name}`);
          } else {
            statusElement.textContent = 'STATUS: NO MIDI DEVICES FOUND';
            addLog('ERROR: NO MIDI OUTPUT DEVICES FOUND');
            
            // Switch back to browser audio
            outputModeSelect.value = 'browser';
          }
        } else {
          statusElement.textContent = 'STATUS: WEBMIDI NOT SUPPORTED';
          addLog('ERROR: WEBMIDI API NOT SUPPORTED IN THIS BROWSER');
          
          // Switch back to browser audio
          outputModeSelect.value = 'browser';
        }
      } catch (error) {
        console.error('WebMidi could not be enabled:', error);
        statusElement.textContent = 'STATUS: MIDI ERROR';
        addLog(`ERROR: COULD NOT ENABLE WEBMIDI - ${error}`);
        
        // Switch back to browser audio
        outputModeSelect.value = 'browser';
      }
    } else {
      // Browser audio mode
      statusElement.textContent = 'STATUS: BROWSER AUDIO';
      addLog('USING BROWSER AUDIO OUTPUT');
    }
  });
  
  function addLog(message: string): void {
    const timestamp = new Date().toISOString().substring(11, 23);
    
    // Add log message at the end
    const currentText = visualizationElement.textContent || '';
    const lines = currentText.split('\n');
    lines.push(`[${timestamp}] ${message}`);
    
    // Keep only the last 25 lines
    if (lines.length > 25) {
      visualizationElement.textContent = lines.slice(lines.length - 25).join('\n');
    } else {
      visualizationElement.textContent = lines.join('\n');
    }
    
    // Scroll to bottom
    visualizationElement.scrollTop = visualizationElement.scrollHeight;
  }
  
  return outputControl;
}