// Setup file for E2E tests
// This file is run before each test

// Import web audio mocks
import './mocks/web-audio.mock.js';

// Mock window.location
const mockLocation = {
  host: 'localhost:3000',
  protocol: 'http:',
  origin: 'http://localhost:3000',
  pathname: '/',
  href: 'http://localhost:3000/'
};

// Set location properties
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock HTMLMediaElement
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();

// Mock functions that aren't available in jsdom
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn()
  };
};

// Mock requestAnimationFrame
window.requestAnimationFrame = (callback: FrameRequestCallback): number => setTimeout(callback, 0) as unknown as number;
window.cancelAnimationFrame = jest.fn();

// Helpers for tests
export const testHelpers = {
  // Function to wait for a specified time
  wait: (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms)),

  // Function to simulate DOM events
  simulateEvent: (element: Element, eventName: string, options: object = {}): void => {
    const event = new Event(eventName, {
      bubbles: true,
      cancelable: true,
      ...options
    });
    element.dispatchEvent(event);
  },

  // Function to render HTML into document
  renderHTML: (html: string): void => {
    document.body.innerHTML = html;
  }
};

// Console log wrapper for debugging
const originalConsoleLog = console.log;
console.log = (...args) => {
  originalConsoleLog('[E2E Test]', ...args);
};