import { AudioEngine, createWebAudioEngine } from './web-audio-engine';

/**
 * Initializes the audio system using the Web Audio API
 * @returns An AudioEngine implementation
 */
export function initAudio(): AudioEngine {
  return createWebAudioEngine();
}