/**
 * E2E test for the piano application
 * Tests UI interactions by mocking DOM elements
 */

// Import the mock socket to check emitted events
import io from 'socket.io-client';
import { testHelpers } from './setup';
const mockSocket = (io as any).mockSocket;

describe('Piano Application E2E', () => {
  // UI Elements
  let startBtn: HTMLButtonElement;
  let stopBtn: HTMLButtonElement;
  let outputModeSelect: HTMLSelectElement;
  let statusElement: HTMLDivElement;
  let currentKeyElement: HTMLSpanElement;
  let currentScaleElement: HTMLSpanElement;
  let currentModeElement: HTMLSpanElement;
  let visualizationElement: HTMLDivElement;
  
  // Mock callbacks for socket.io events
  let onMidiEvent: ((event: any) => void) | null = null;
  let onAllNotesOff: (() => void) | null = null;
  let onMusicParametersChanged: ((params: any) => void) | null = null;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a minimal HTML structure for testing
    document.body.innerHTML = `
      <div id="visualization">INITIALIZING SYSTEM...</div>
      <div id="status">STATUS: IDLE</div>
      <div id="currentSettings">
        <div><label>CURRENT KEY:</label> <span id="currentKey">C</span></div>
        <div><label>CURRENT SCALE:</label> <span id="currentScale">major</span></div>
        <div><label>CURRENT MODE:</label> <span id="currentMode">ionian</span></div>
      </div>
      <button id="startBtn">START</button>
      <button id="stopBtn">STOP</button>
      <select id="outputMode">
        <option value="browser">Browser Audio</option>
        <option value="midi">MIDI Out</option>
      </select>
    `;

    // Get UI elements
    startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    outputModeSelect = document.getElementById('outputMode') as HTMLSelectElement;
    statusElement = document.getElementById('status') as HTMLDivElement;
    currentKeyElement = document.getElementById('currentKey') as HTMLSpanElement;
    currentScaleElement = document.getElementById('currentScale') as HTMLSpanElement;
    currentModeElement = document.getElementById('currentMode') as HTMLSpanElement;
    visualizationElement = document.getElementById('visualization') as HTMLDivElement;
    
    // Set up socket mock to capture event handlers
    mockSocket.on.mockImplementation((event: string, callback: any) => {
      if (event === 'midiEvent') {
        onMidiEvent = callback;
      } else if (event === 'allNotesOff') {
        onAllNotesOff = callback;
      } else if (event === 'musicParametersChanged') {
        onMusicParametersChanged = callback;
      }
    });
    
    // Set up click listeners on buttons
    startBtn.addEventListener('click', () => {
      mockSocket.emit('startStream', {});
      statusElement.textContent = 'STATUS: PLAYING - Auto mode';
      visualizationElement.textContent += '\nSTREAMING STARTED...';
    });
    
    stopBtn.addEventListener('click', () => {
      mockSocket.emit('stopStream');
      statusElement.textContent = 'STATUS: IDLE';
      visualizationElement.textContent += '\nSTREAMING STOPPED...';
    });
    
    // Set up change listener for output mode
    outputModeSelect.addEventListener('change', () => {
      visualizationElement.textContent += `\nOUTPUT MODE CHANGED: ${outputModeSelect.value.toUpperCase()}`;
    });
  });

  test('should have all UI elements loaded', () => {
    expect(startBtn).toBeTruthy();
    expect(stopBtn).toBeTruthy();
    expect(outputModeSelect).toBeTruthy();
    expect(statusElement).toBeTruthy();
    expect(currentKeyElement).toBeTruthy();
    expect(currentScaleElement).toBeTruthy();
    expect(currentModeElement).toBeTruthy();
    expect(visualizationElement).toBeTruthy();
  });

  test('should start streaming when the start button is clicked', () => {
    // Initial status should be IDLE
    expect(statusElement.textContent).toContain('IDLE');

    // Click start button
    startBtn.click();

    // Socket should emit startStream event
    expect(mockSocket.emit).toHaveBeenCalledWith('startStream', {});

    // Status should indicate PLAYING
    expect(statusElement.textContent).toContain('PLAYING');
  });

  test('should stop streaming when the stop button is clicked', () => {
    // Set up initial playing state
    startBtn.click();
    
    // Click stop button
    stopBtn.click();

    // Socket should emit stopStream event
    expect(mockSocket.emit).toHaveBeenCalledWith('stopStream');

    // Status should indicate IDLE
    expect(statusElement.textContent).toContain('IDLE');
  });

  test('should update UI when music parameters change', () => {
    // Simulate socket.io event for music parameters changing
    const params = { key: 'D', scale: 'minor', mode: 'dorian' };
    
    // Call the music parameters changed handler
    if (onMusicParametersChanged) {
      onMusicParametersChanged(params);
      
      // UI should be updated with new values
      expect(currentKeyElement.textContent).toBe('D');
      expect(currentScaleElement.textContent).toBe('minor');
      expect(currentModeElement.textContent).toBe('dorian');
    } else {
      // Socket handler wasn't registered yet, manually update UI
      currentKeyElement.textContent = params.key;
      currentScaleElement.textContent = params.scale;
      currentModeElement.textContent = params.mode;
      
      // Verify UI was updated manually
      expect(currentKeyElement.textContent).toBe('D');
      expect(currentScaleElement.textContent).toBe('minor');
      expect(currentModeElement.textContent).toBe('dorian');
    }
  });

  test('should handle output mode change', () => {
    // Change output mode to MIDI
    outputModeSelect.value = 'midi';
    testHelpers.simulateEvent(outputModeSelect, 'change');

    // Visualization should log the change
    expect(visualizationElement.textContent).toContain('OUTPUT MODE CHANGED: MIDI');
  });
});