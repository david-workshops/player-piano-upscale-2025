export class ScaleGenerator {
  private key = 'C'; // Default key
  private scale = 'major'; // Default scale
  private mode = 'ionian'; // Default mode
  
  // Define all possible keys
  private allKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Define scale patterns (semitone steps)
  private scalePatterns: Record<string, number[]> = {
    major: [2, 2, 1, 2, 2, 2, 1], // Major scale pattern
    minor: [2, 1, 2, 2, 1, 2, 2], // Natural minor scale pattern
    harmonicMinor: [2, 1, 2, 2, 1, 3, 1], // Harmonic minor scale pattern
    melodicMinor: [2, 1, 2, 2, 2, 2, 1], // Melodic minor scale pattern
    pentatonicMajor: [2, 2, 3, 2, 3], // Major pentatonic scale pattern
    pentatonicMinor: [3, 2, 2, 3, 2], // Minor pentatonic scale pattern
    chromatic: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] // Chromatic scale pattern
  };
  
  // Define mode patterns (semitone steps)
  private modePatterns: Record<string, number[]> = {
    ionian: [2, 2, 1, 2, 2, 2, 1], // Same as major
    dorian: [2, 1, 2, 2, 2, 1, 2],
    phrygian: [1, 2, 2, 2, 1, 2, 2],
    lydian: [2, 2, 2, 1, 2, 2, 1],
    mixolydian: [2, 2, 1, 2, 2, 1, 2],
    aeolian: [2, 1, 2, 2, 1, 2, 2], // Same as natural minor
    locrian: [1, 2, 2, 1, 2, 2, 2]
  };
  
  constructor() {
    // Initialize with default settings
  }
  
  public setKey(key: string): void {
    if (this.allKeys.includes(key)) {
      this.key = key;
    } else {
      console.warn(`Invalid key: ${key}, using default key: ${this.key}`);
    }
  }
  
  public setScale(scale: string): void {
    if (scale in this.scalePatterns) {
      this.scale = scale;
    } else {
      console.warn(`Invalid scale: ${scale}, using default scale: ${this.scale}`);
    }
  }
  
  public setMode(mode: string): void {
    if (mode in this.modePatterns) {
      this.mode = mode;
    } else {
      console.warn(`Invalid mode: ${mode}, using default mode: ${this.mode}`);
    }
  }
  
  public randomChange(): void {
    // Randomly change key, scale, or mode (but not all at once for subtle changes)
    const changeType = Math.floor(Math.random() * 3);
    
    switch (changeType) {
      case 0:
        // Change key
        this.key = this.allKeys[Math.floor(Math.random() * this.allKeys.length)];
        break;
      case 1:
        // Change scale
        const scales = Object.keys(this.scalePatterns);
        this.scale = scales[Math.floor(Math.random() * scales.length)];
        break;
      case 2:
        // Change mode
        const modes = Object.keys(this.modePatterns);
        this.mode = modes[Math.floor(Math.random() * modes.length)];
        break;
    }
    
    console.log(`Music changed to: Key=${this.key}, Scale=${this.scale}, Mode=${this.mode}`);
  }
  
  public getRandomNoteInScale(min: number, max: number): number {
    // Get the tonic note number for the current key
    const tonicIndex = this.allKeys.indexOf(this.key);
    if (tonicIndex === -1) return min; // Fallback
    
    // Get the pattern based on scale or mode
    const pattern = this.scale === 'major' || this.scale === 'minor' 
      ? this.modePatterns[this.mode] 
      : this.scalePatterns[this.scale];
    
    // Build the scale starting from the tonic
    const scale: number[] = [];
    let currentNote = tonicIndex;
    
    // Create a full range of notes in the scale
    while (currentNote < 127) {
      scale.push(currentNote);
      for (const step of pattern) {
        currentNote += step;
        if (currentNote < 127) {
          scale.push(currentNote);
        }
      }
    }
    
    // Filter notes to be within the specified range
    const notesInRange = scale.filter(note => note >= min && note <= max);
    
    // If no notes in range, return a fallback
    if (notesInRange.length === 0) {
      return min;
    }
    
    // Return a random note from the filtered scale
    return notesInRange[Math.floor(Math.random() * notesInRange.length)];
  }
}