import { MusicStateEvent, musicState } from "../shared/music-state";
import { WeatherData } from "../shared/types";
import { FreepikService } from "./freepik-service";

// DOM elements
const currentImageElement = document.getElementById(
  "current-image",
) as HTMLDivElement;
const nextImageElement = document.getElementById(
  "next-image",
) as HTMLDivElement;
const promptInfoElement = document.getElementById("prompt-info") as HTMLElement;
const notesInfoElement = document.getElementById("notes-info") as HTMLElement;
const weatherInfoElement = document.getElementById(
  "weather-info",
) as HTMLElement;
const consoleOutput = document.getElementById("console-output") as HTMLElement;
const debugOverlay = document.getElementById("debug-overlay") as HTMLDivElement;

// API debug elements
const apiConfiguredElement = document.getElementById("api-configured") as HTMLElement;
const apiStatusElement = document.getElementById("api-status") as HTMLElement;
const apiRequestsElement = document.getElementById("api-requests") as HTMLElement;
const apiErrorElement = document.getElementById("api-error") as HTMLElement;

// Get API key from environment variables (loaded by dotenv in server)
// No need to hardcode it here
const freepikService = new FreepikService();

// State variables
let isPlaying = false;
let imageUpdateInterval: number | null = null;
let fadeInProgress = false;

// Constants
const IMAGE_UPDATE_INTERVAL = 45 * 1000; // 45 seconds
const FADE_TRANSITION_DURATION = 3000; // 3 seconds

// Initialize visualization
async function initVisualization() {
  try {
    // Generate the first image
    const imageUrl = await freepikService.generateImage();

    // Use the result either as a direct URL or as a CSS gradient
    if (imageUrl.startsWith("http")) {
      // It's a real API image URL
      currentImageElement.style.backgroundImage = `url(${imageUrl})`;
      logToConsole("Using real Freepik API image");
    } else {
      // It's a CSS gradient (placeholder)
      currentImageElement.style.backgroundImage = imageUrl;
      logToConsole("Using placeholder gradient image");
    }

    currentImageElement.style.opacity = "1";
    nextImageElement.style.opacity = "0";

    // Update the prompt info
    promptInfoElement.textContent = freepikService.getLastPrompt();

    logToConsole("Visualization initialized");
    return true;
  } catch (error) {
    logToConsole(`Error initializing visualization: ${error}`);
    return false;
  }
}

// Start the visualization automatically
function startVisualization() {
  if (isPlaying) return;

  isPlaying = true;
  logToConsole("Starting visualization");

  // Initialize the first image and start refresh cycle
  initVisualization().then(() => {
    startImageRefresh();
  });

  // Tell the server we're starting
  musicState.start();
}

// Stop the visualization
function stopVisualization() {
  if (!isPlaying) return;

  isPlaying = false;
  stopImageRefresh();
  musicState.stop();
  logToConsole("Visualization stopped");
}

// Start image refresh cycle
function startImageRefresh() {
  if (imageUpdateInterval !== null) {
    clearInterval(imageUpdateInterval);
  }

  // First update immediately
  updateImage();

  // Set interval for updates
  imageUpdateInterval = window.setInterval(updateImage, IMAGE_UPDATE_INTERVAL);
  logToConsole(
    `Image refresh started, interval: ${IMAGE_UPDATE_INTERVAL / 1000} seconds`,
  );
  
  // Also update debug info regularly
  setInterval(updateApiDebugInfo, 1000);
}

// Stop image refresh cycle
function stopImageRefresh() {
  if (imageUpdateInterval !== null) {
    clearInterval(imageUpdateInterval);
    imageUpdateInterval = null;
    logToConsole("Image refresh stopped");
  }
}

// Update image with fade transition
async function updateImage() {
  if (fadeInProgress) {
    return; // Skip if a fade is already in progress
  }

  try {
    fadeInProgress = true;
    
    // Update debug info to show pending request
    updateApiDebugInfo();

    // Generate a new image for the hidden layer
    const newImageUrl = await freepikService.generateImage();
    
    // Update debug info after request completes
    updateApiDebugInfo();

    // Update the next image container (currently hidden)
    if (newImageUrl.startsWith("http")) {
      // Real API image URL
      // Preload the image before showing it
      await preloadImage(newImageUrl);
      nextImageElement.style.backgroundImage = `url(${newImageUrl})`;
      logToConsole("New Freepik API image loaded");
    } else {
      // CSS gradient (placeholder)
      nextImageElement.style.backgroundImage = newImageUrl;
      logToConsole("New placeholder gradient generated");
    }

    // Start the fade transition
    nextImageElement.style.opacity = "1";
    currentImageElement.style.opacity = "0";

    // Update the prompt info
    promptInfoElement.textContent = freepikService.getLastPrompt();

    // After transition completes, swap the layers
    setTimeout(() => {
      // Swap the z-index of the layers
      const tempZIndex = currentImageElement.style.zIndex;
      currentImageElement.style.zIndex = nextImageElement.style.zIndex;
      nextImageElement.style.zIndex = tempZIndex;

      // Reset opacity for next transition
      currentImageElement.style.opacity = "1";
      nextImageElement.style.opacity = "0";

      // Copy the image to the current layer
      currentImageElement.style.backgroundImage =
        nextImageElement.style.backgroundImage;

      fadeInProgress = false;
      logToConsole("Image updated with fade transition");
      
      // Update debug info after transition completes
      updateApiDebugInfo();
    }, FADE_TRANSITION_DURATION);
  } catch (error) {
    fadeInProgress = false;
    logToConsole(`Error updating image: ${error}`);
    
    // Update debug info with error
    updateApiDebugInfo();
  }
}

// Helper function to preload an image
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// Update API debug information
function updateApiDebugInfo() {
  const debugInfo = freepikService.getDebugInfo();
  
  // Update API configuration status
  apiConfiguredElement.textContent = debugInfo.apiConfigured ? "YES" : "NO";
  apiConfiguredElement.className = "info-value " + (debugInfo.apiConfigured ? "success" : "error");
  
  // Update current API status
  if (debugInfo.usePlaceholder) {
    apiStatusElement.textContent = "USING PLACEHOLDER (CSS GRADIENTS)";
    apiStatusElement.className = "info-value warning";
  } else if (debugInfo.requestStats.pendingRequest) {
    apiStatusElement.textContent = "REQUEST IN PROGRESS...";
    apiStatusElement.className = "info-value pending";
  } else {
    apiStatusElement.textContent = "READY";
    apiStatusElement.className = "info-value success";
  }
  
  // Update request statistics
  apiRequestsElement.textContent = 
    `Total: ${debugInfo.requestStats.totalRequests}, ` +
    `Success: ${debugInfo.requestStats.successfulRequests}, ` +
    `Failed: ${debugInfo.requestStats.failedRequests}`;
  
  // Update last error if any
  if (debugInfo.requestStats.lastError) {
    apiErrorElement.textContent = debugInfo.requestStats.lastError;
    apiErrorElement.className = "info-value error";
  } else {
    apiErrorElement.textContent = "None";
    apiErrorElement.className = "info-value";
  }
}

// Toggle debug overlay visibility
function toggleDebugOverlay() {
  debugOverlay.classList.toggle("visible");
  updateApiDebugInfo(); // Update API debug info when overlay is shown
  logToConsole("Debug overlay toggled");
}

// Update the notes info display
function updateNotesInfo() {
  const notesPlaying = musicState.getNotesPlaying();
  
  if (notesPlaying.length > 0) {
    const noteNames = notesPlaying
      .map((n) => `${n.name}${n.octave}`)
      .join(", ");
    const midiNumbers = notesPlaying.map((n) => n.midiNumber);

    notesInfoElement.textContent = noteNames;

    // Update the Freepik service with current notes
    freepikService.updateNotes(noteNames.split(", "), midiNumbers);
  } else {
    notesInfoElement.textContent = "--";
    freepikService.updateNotes([], []);
  }
}

// Update weather info
function updateWeatherInfo() {
  const weather = musicState.getWeatherData();
  if (!weather) return;
  
  weatherInfoElement.textContent = `${weather.temperature}°C, ${weather.weatherDescription}`;

  // Update the Freepik service with weather data
  freepikService.updateWeather(weather);
}

// Log message to console
function logToConsole(message: string) {
  const timestamp = new Date().toISOString().substring(11, 19);
  consoleOutput.innerHTML += `[${timestamp}] ${message}\n`;
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Subscribe to music state events
musicState.subscribe((event: MusicStateEvent) => {
  switch (event.type) {
    case "notes-updated":
      updateNotesInfo();
      break;
      
    case "weather-updated":
      updateWeatherInfo();
      break;
      
    case "all-notes-off":
      // Update display to show no notes
      updateNotesInfo();
      break;
  }
});

// Socket connection events
const socket = musicState.getSocket();

socket.on("connect", () => {
  logToConsole("Connected to server");

  // Auto-start the visualization on connection
  startVisualization();
});

socket.on("disconnect", () => {
  logToConsole("Disconnected from server");

  // Auto-stop the visualization on disconnect
  stopVisualization();
});

// Cleanup function
window.addEventListener("beforeunload", () => {
  if (imageUpdateInterval !== null) {
    clearInterval(imageUpdateInterval);
  }
});

// Initialize the UI layers
currentImageElement.style.zIndex = "2";
nextImageElement.style.zIndex = "1";

// Add event listener for keyboard events (? key for debug overlay)
document.addEventListener("keydown", (event) => {
  if (event.key === "?") {
    toggleDebugOverlay();
  }
});

// Initialize displays with current state
updateNotesInfo();
updateWeatherInfo();
updateApiDebugInfo();

// Initialization message
logToConsole("Piano Visualizer initialized");
logToConsole("Auto-starting visualization");

// Add missing property to Note interface for tracking
declare module "../shared/types" {
  interface Note {
    _startTime?: number;
  }
}
