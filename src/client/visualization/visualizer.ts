export class Visualizer {
  private element: HTMLElement;
  private maxLines = 25;
  private lines: string[] = [];
  private midiNoteNames = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];
  
  constructor(elementId: string) {
    this.element = document.getElementById(elementId) as HTMLElement;
    if (!this.element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }
  }
  
  public log(message: string): void {
    const timestamp = new Date().toISOString().substring(11, 23);
    this.addLine(`[${timestamp}] ${message}`);
  }
  
  public visualizeMIDIEvent(event: any): void {
    const timestamp = new Date().toISOString().substring(11, 23);
    
    switch (event.type) {
      case 'note':
        const noteData = event.data as { note: number; velocity: number; duration: number };
        
        // Check if it's a silence
        if (noteData.note === -1) {
          this.addLine(`[${timestamp}] SILENCE (${noteData.duration}ms)`);
          return;
        }
        
        // Format note information
        const noteName = this.midiNoteToName(noteData.note);
        const velocity = noteData.velocity;
        const duration = noteData.duration;
        
        this.addLine(
          `[${timestamp}] NOTE: ${noteName} (${noteData.note}) ` +
          `VEL: ${velocity} DUR: ${duration}ms`
        );
        break;
        
      case 'chord':
        const chordData = event.data as { notes: Array<{ note: number; velocity: number; duration: number }> };
        
        // Format chord information
        const noteNames = chordData.notes.map(n => this.midiNoteToName(n.note)).join(', ');
        const noteNumbers = chordData.notes.map(n => n.note).join(', ');
        
        this.addLine(
          `[${timestamp}] CHORD: ${noteNames} (${noteNumbers}) ` +
          `COUNT: ${chordData.notes.length}`
        );
        break;
        
      case 'pedal':
        const pedalData = event.data as { type: string; value: number };
        
        // Format pedal information
        const pedalType = pedalData.type.toUpperCase();
        const pedalValue = pedalData.value;
        const pedalState = pedalValue > 0 ? 'ON' : 'OFF';
        
        this.addLine(
          `[${timestamp}] PEDAL: ${pedalType} ${pedalState} (${pedalValue})`
        );
        break;
    }
  }
  
  private addLine(line: string): void {
    // Add new line
    this.lines.push(line);
    
    // Keep only the maximum number of lines
    if (this.lines.length > this.maxLines) {
      this.lines.shift();
    }
    
    // Update the display
    this.updateDisplay();
  }
  
  private updateDisplay(): void {
    // Update the element content
    this.element.textContent = this.lines.join('\n');
    
    // Auto-scroll to bottom
    this.element.scrollTop = this.element.scrollHeight;
  }
  
  private midiNoteToName(note: number): string {
    const octave = Math.floor(note / 12) - 1;
    const noteName = this.midiNoteNames[note % 12];
    return `${noteName}${octave}`;
  }
}