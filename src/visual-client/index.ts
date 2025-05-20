import { io } from 'socket.io-client';
import { MidiEvent, Note, WeatherData } from '../shared/types';
import { FreepikService } from './freepik-service';

// Connect to the same server as the piano client
const socket = io();

// DOM elements
const startButton = document.getElementById('start-btn') as HTMLButtonElement;
const stopButton = document.getElementById('stop-btn') as HTMLButtonElement;
const currentImageElement = document.getElementById('current-image') as HTMLDivElement;
const nextImageElement = document.getElementById('next-image') as HTMLDivElement;
const promptInfoElement = document.getElementById('prompt-info') as HTMLElement;
const notesInfoElement = document.getElementById('notes-info') as HTMLElement;
const weatherInfoElement = document.getElementById('weather-info') as HTMLElement;
const consoleOutput = document.getElementById('console-output') as HTMLElement;

// Get API key from environment (in a real app) or from a secure config
// For development, we'll use a placeholder when there's no API key
const apiKey = ''; // process.env.FREEPIK_API_KEY

// Freepik service
const freepikService = new FreepikService(apiKey);

// State variables
let isPlaying = false;
let imageUpdateInterval: number | null = null;
let currentWeather: WeatherData | null = null;
let notesPlaying: Note[] = [];
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
    if (imageUrl.startsWith('http')) {
      // It's a real API image URL
      currentImageElement.style.backgroundImage = `url(${imageUrl})`;
      logToConsole('Using real Freepik API image');
    } else {
      // It's a CSS gradient (placeholder)
      currentImageElement.style.backgroundImage = imageUrl;
      logToConsole('Using placeholder gradient image');
    }
    
    currentImageElement.style.opacity = '1';
    nextImageElement.style.opacity = '0';
    
    // Update the prompt info
    promptInfoElement.textContent = freepikService.getLastPrompt();
    
    logToConsole('Visualization initialized');
    return true;
  } catch (error) {
    logToConsole(`Error initializing visualization: ${error}`);
    return false;
  }
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
  logToConsole(`Image refresh started, interval: ${IMAGE_UPDATE_INTERVAL/1000} seconds`);
}

// Stop image refresh cycle
function stopImageRefresh() {
  if (imageUpdateInterval !== null) {
    clearInterval(imageUpdateInterval);
    imageUpdateInterval = null;
    logToConsole('Image refresh stopped');
  }
}

// Update image with fade transition
async function updateImage() {
  if (fadeInProgress) {
    return; // Skip if a fade is already in progress
  }
  
  try {
    fadeInProgress = true;
    
    // Generate a new image for the hidden layer
    const newImageUrl = await freepikService.generateImage();
    
    // Update the next image container (currently hidden)
    if (newImageUrl.startsWith('http')) {
      // Real API image URL
      // Preload the image before showing it
      await preloadImage(newImageUrl);
      nextImageElement.style.backgroundImage = `url(${newImageUrl})`;
      logToConsole('New Freepik API image loaded');
    } else {
      // CSS gradient (placeholder)
      nextImageElement.style.backgroundImage = newImageUrl;
      logToConsole('New placeholder gradient generated');
    }
    
    // Start the fade transition
    nextImageElement.style.opacity = '1';
    currentImageElement.style.opacity = '0';
    
    // Update the prompt info
    promptInfoElement.textContent = freepikService.getLastPrompt();
    
    // After transition completes, swap the layers
    setTimeout(() => {
      // Swap the z-index of the layers
      const tempZIndex = currentImageElement.style.zIndex;
      currentImageElement.style.zIndex = nextImageElement.style.zIndex;
      nextImageElement.style.zIndex = tempZIndex;
      
      // Reset opacity for next transition
      currentImageElement.style.opacity = '1';
      nextImageElement.style.opacity = '0';
      
      // Copy the image to the current layer
      currentImageElement.style.backgroundImage = nextImageElement.style.backgroundImage;
      
      fadeInProgress = false;
      logToConsole('Image updated with fade transition');
    }, FADE_TRANSITION_DURATION);
    
  } catch (error) {
    fadeInProgress = false;
    logToConsole(`Error updating image: ${error}`);
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

// Update the notes info display
function updateNotesInfo() {
  if (notesPlaying.length > 0) {
    const noteNames = notesPlaying.map(n => `${n.name}${n.octave}`).join(', ');
    const midiNumbers = notesPlaying.map(n => n.midiNumber);
    
    notesInfoElement.textContent = noteNames;
    
    // Update the Freepik service with current notes
    freepikService.updateNotes(noteNames.split(', '), midiNumbers);
  } else {
    notesInfoElement.textContent = '--';
    freepikService.updateNotes([], []);
  }
  
  // Cleanup notes that are finished playing
  const now = Date.now();
  notesPlaying = notesPlaying.filter(note => {
    return (note._startTime || 0) + note.duration > now;
  });
}

// Update weather info
function updateWeatherInfo(weather: WeatherData) {
  weatherInfoElement.textContent = `${weather.temperature}°C, ${weather.weatherDescription}`;
  
  // Update the Freepik service with weather data
  freepikService.updateWeather(weather);
  currentWeather = weather;
}

// Log message to console
function logToConsole(message: string) {
  const timestamp = new Date().toISOString().substring(11, 19);
  consoleOutput.innerHTML += `[${timestamp}] ${message}\n`;
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Socket event handlers
socket.on('connect', () => {
  logToConsole('Connected to server');
});

socket.on('disconnect', () => {
  logToConsole('Disconnected from server');
  if (imageUpdateInterval !== null) {
    clearInterval(imageUpdateInterval);
    imageUpdateInterval = null;
  }
});

// Handle MIDI events from server
socket.on('midi', (event: MidiEvent) => {
  switch (event.type) {
    case 'note':
      // Add timestamp to the note for tracking
      event.note._startTime = Date.now();
      notesPlaying.push(event.note);
      updateNotesInfo();
      break;
      
    case 'chord':
    case 'counterpoint':
      // Add all notes in the chord or counterpoint
      event.notes.forEach(note => {
        // Add timestamp to the note for tracking
        note._startTime = Date.now();
        notesPlaying.push(note);
      });
      updateNotesInfo();
      break;
      
    case 'allNotesOff':
      notesPlaying = [];
      updateNotesInfo();
      break;
  }
});

// Handle weather updates
socket.on('weather', (weatherData: WeatherData) => {
  updateWeatherInfo(weatherData);
  logToConsole(`Weather update received: ${weatherData.temperature}°C, ${weatherData.weatherDescription}`);
});

// Button event listeners
startButton.addEventListener('click', async () => {
  if (!isPlaying) {
    isPlaying = true;
    
    // Initialize the first image
    const success = await initVisualization();
    if (success) {
      // Start the image refresh cycle
      startImageRefresh();
      
      // Tell the server we're starting (it might send us current state)
      socket.emit('start');
      logToConsole('Visualization started');
    } else {
      isPlaying = false;
    }
  }
});

stopButton.addEventListener('click', () => {
  if (isPlaying) {
    isPlaying = false;
    stopImageRefresh();
    socket.emit('stop');
    logToConsole('Visualization stopped');
  }
});

// Cleanup function
window.addEventListener('beforeunload', () => {
  if (imageUpdateInterval !== null) {
    clearInterval(imageUpdateInterval);
  }
});

// Initialize the UI layers
currentImageElement.style.zIndex = '2';
nextImageElement.style.zIndex = '1';

// Initialization message
logToConsole('Piano Visualizer initialized');
logToConsole('Click START to begin visualization');

// Add missing property to Note interface for tracking
declare module '../shared/types' {
  interface Note {
    _startTime?: number;
  }
}