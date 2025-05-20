/**
 * UI Component initialization
 * Sets up event listeners for UI elements
 */

interface UICallbacks {
  onStop: () => void;
  onOutputToggle: (useMidiOut: boolean) => void;
}

export function initUI(callbacks: UICallbacks): void {
  // Get DOM elements
  const stopButton = document.getElementById('stop-button');
  const outputToggle = document.getElementById('output-toggle') as HTMLInputElement;
  
  // Set up stop button
  if (stopButton) {
    stopButton.addEventListener('click', () => {
      callbacks.onStop();
    });
  }
  
  // Set up output toggle
  if (outputToggle) {
    outputToggle.checked = false; // Default to Web Audio
    
    outputToggle.addEventListener('change', () => {
      callbacks.onOutputToggle(outputToggle.checked);
    });
  }
  
  // Handle keyboard shortcuts
  window.addEventListener('keydown', (event) => {
    // Space bar to stop
    if (event.code === 'Space') {
      event.preventDefault();
      callbacks.onStop();
    }
    
    // M key to toggle output mode
    if (event.code === 'KeyM') {
      if (outputToggle) {
        outputToggle.checked = !outputToggle.checked;
        callbacks.onOutputToggle(outputToggle.checked);
      }
    }
  });
}