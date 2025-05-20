import { ScaleGenerator } from '../scales';

describe('ScaleGenerator', () => {
  let scaleGenerator: ScaleGenerator;

  beforeEach(() => {
    scaleGenerator = new ScaleGenerator();
  });

  it('should initialize with default values', () => {
    expect(scaleGenerator.getCurrentKey()).toBe('C');
    expect(scaleGenerator.getCurrentScale()).toBe('major');
    expect(scaleGenerator.getCurrentMode()).toBe('ionian');
  });

  it('should change key when randomChange is called with seed 0', () => {
    // Mock Math.random to return predictable values
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValueOnce(0.1); // For changeType = 0 (key change)
    Math.random = jest.fn().mockReturnValueOnce(0.1); // For selecting a key

    scaleGenerator.randomChange();
    
    // Verify key was changed but scale and mode remained the same
    expect(scaleGenerator.getCurrentKey()).not.toBe('C');
    expect(scaleGenerator.getCurrentScale()).toBe('major');
    expect(scaleGenerator.getCurrentMode()).toBe('ionian');

    Math.random = originalRandom;
  });

  it('should generate notes within the specified range', () => {
    const min = 60; // Middle C
    const max = 72; // C one octave higher

    for (let i = 0; i < 10; i++) {
      const note = scaleGenerator.getRandomNoteInScale(min, max);
      expect(note).toBeGreaterThanOrEqual(min);
      expect(note).toBeLessThanOrEqual(max);
    }
  });
});