/**
 * Data Display Component
 * Renders a retro terminal style display for MIDI data and system information
 */

// Message types for styling
type MessageType = 'system' | 'note' | 'chord' | 'pedal' | 'parameter';

export class DataDisplay {
  private container: HTMLElement;
  private messageLimit: number = 100; // Maximum number of messages to display
  private messages: { text: string; type: MessageType }[] = [];
  
  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with ID "${containerId}" not found`);
    }
    
    this.container = container;
  }
  
  /**
   * Add a message to the display
   * @param text - The message text
   * @param type - The type of message for styling
   */
  public addMessage(text: string, type: MessageType = 'system'): void {
    // Format timestamp
    const timestamp = new Date().toISOString().substr(11, 8);
    const fullText = `[${timestamp}] ${text}`;
    
    // Add to messages array
    this.messages.unshift({ text: fullText, type });
    
    // Trim messages if over limit
    if (this.messages.length > this.messageLimit) {
      this.messages = this.messages.slice(0, this.messageLimit);
    }
    
    // Update display
    this.render();
  }
  
  /**
   * Clear all messages from the display
   */
  public clear(): void {
    this.messages = [];
    this.render();
  }
  
  /**
   * Render all messages to the display
   */
  private render(): void {
    // Clear existing content
    this.container.innerHTML = '';
    
    // Add messages
    this.messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = `terminal-message ${message.type}`;
      messageElement.textContent = message.text;
      this.container.appendChild(messageElement);
    });
  }
}