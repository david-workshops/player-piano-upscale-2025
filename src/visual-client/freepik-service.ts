import { WeatherData } from '../shared/types';

// Interface for the Freepik API response
interface FreepikApiResponse {
  status: string;
  data: {
    url: string;
    id: string;
  };
}

// Structure to track active notes
interface ActiveNotes {
  noteNames: string[];
  count: number;
  highestNote: number;
  lowestNote: number;
}

export class FreepikService {
  private baseUrl = 'https://docs.freepik.com/mystic';
  private lastPrompt = '';
  private activeNotes: ActiveNotes = {
    noteNames: [],
    count: 0,
    highestNote: 0,
    lowestNote: 127
  };
  private weatherData: WeatherData | null = null;

  // Update the active notes being played
  public updateNotes(noteNames: string[], midiNumbers: number[] = []) {
    this.activeNotes.noteNames = noteNames;
    this.activeNotes.count = noteNames.length;
    
    if (midiNumbers.length > 0) {
      this.activeNotes.highestNote = Math.max(...midiNumbers);
      this.activeNotes.lowestNote = Math.min(...midiNumbers);
    }
  }

  // Update the weather data
  public updateWeather(weather: WeatherData) {
    this.weatherData = weather;
  }

  // Generate a prompt based on current music and weather
  public generatePrompt(): string {
    // Start with a base prompt for a minimalist abstract sea of color
    let prompt = 'Minimalist abstract sea of color';
    
    // Add color influence based on notes being played
    if (this.activeNotes.count > 0) {
      // Add color variation based on note range
      if (this.activeNotes.highestNote > 80) { // Higher notes
        prompt += ', with bright yellow and white colors in the upper areas';
      } else if (this.activeNotes.lowestNote < 48) { // Lower notes
        prompt += ', with deep blue and purple hues in the lower areas';
      } else { // Middle range
        prompt += ', with balanced green and cyan tones throughout';
      }
      
      // Add texture based on number of notes
      if (this.activeNotes.count > 4) {
        prompt += ', complex layered textures';
      } else if (this.activeNotes.count > 0) {
        prompt += ', simple flowing textures';
      }
    } else {
      // Default when no notes are playing
      prompt += ', calm and serene, minimal texture';
    }
    
    // Add weather influence if available
    if (this.weatherData) {
      // Temperature influence
      if (this.weatherData.temperature < 0) {
        prompt += ', cold blue and white tones';
      } else if (this.weatherData.temperature < 10) {
        prompt += ', cool cyan and light blue palette';
      } else if (this.weatherData.temperature > 30) {
        prompt += ', warm red and orange hues';
      } else if (this.weatherData.temperature > 20) {
        prompt += ', golden yellow and amber shades';
      }
      
      // Weather condition influence
      const code = this.weatherData.weatherCode;
      if ([0, 1].includes(code)) { // Clear
        prompt += ', clear and radiant, high contrast';
      } else if ([2, 3].includes(code)) { // Cloudy
        prompt += ', soft diffused light, gentle gradients';
      } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) { // Rain
        prompt += ', vertical flowing lines, water-like reflections';
      } else if ([71, 73, 75, 77, 85, 86].includes(code)) { // Snow
        prompt += ', delicate white particles, soft texture';
      } else if ([95, 96, 99].includes(code)) { // Thunderstorm
        prompt += ', dramatic contrasts, electric energy';
      }
    }
    
    // Add style qualifiers to ensure minimalist abstraction
    prompt += ', ultra minimalist, color field painting style, rothko-inspired, digital art';
    
    this.lastPrompt = prompt;
    return prompt;
  }

  // Get the last generated prompt
  public getLastPrompt(): string {
    return this.lastPrompt;
  }

  // Generate an image using the Freepik API
  public async generateImage(): Promise<string> {
    const prompt = this.generatePrompt();
    
    try {
      // In a real implementation, this would call the Freepik API
      // Since we can't make external API calls in this environment, we'll simulate it
      console.log(`Would call Freepik API with prompt: ${prompt}`);
      
      // Simulate API response with a placeholder image URL
      // This would be replaced with actual API call in production
      const colors = this.getColorsFromPrompt(prompt);
      const placeholderUrl = this.generatePlaceholderImage(colors);
      
      return placeholderUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }
  
  // Extract dominant colors from the prompt to use for our placeholder
  private getColorsFromPrompt(prompt: string): string[] {
    const colorMap: {[key: string]: string} = {
      'blue': '#0066cc',
      'deep blue': '#003366',
      'light blue': '#66ccff',
      'purple': '#6600cc',
      'yellow': '#ffcc00',
      'bright yellow': '#ffff00',
      'white': '#ffffff',
      'green': '#00cc66',
      'cyan': '#00cccc',
      'red': '#cc0000',
      'orange': '#ff6600',
      'golden': '#cc9900',
      'amber': '#ffbf00'
    };
    
    // Extract colors mentioned in the prompt
    const colors: string[] = [];
    Object.keys(colorMap).forEach(color => {
      if (prompt.includes(color)) {
        colors.push(colorMap[color]);
      }
    });
    
    // Add some defaults if no colors were found
    if (colors.length === 0) {
      colors.push('#0066cc', '#00cc66', '#ffcc00');
    }
    
    return colors;
  }
  
  // Generate a CSS gradient as a placeholder for the actual API image
  private generatePlaceholderImage(colors: string[]): string {
    // Ensure we have at least 2 colors for the gradient
    if (colors.length === 1) {
      colors.push('#000000');
    }
    
    // Create a CSS gradient based on the extracted colors
    let gradientType = 'linear-gradient(';
    
    // Add different angles based on weather if available
    if (this.weatherData) {
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(this.weatherData.weatherCode)) {
        // Rain - vertical gradient
        gradientType += '180deg, ';
      } else if (this.weatherData.temperature > 25) {
        // Hot - diagonal gradient
        gradientType += '135deg, ';
      } else {
        // Default - radial gradient for other conditions
        gradientType = 'radial-gradient(circle, ';
      }
    } else {
      // Random angle if no weather data
      const angle = Math.floor(Math.random() * 360);
      gradientType += `${angle}deg, `;
    }
    
    // Add color stops
    colors.forEach((color, index) => {
      const percentage = Math.floor((index / (colors.length - 1)) * 100);
      gradientType += `${color} ${percentage}%`;
      
      if (index < colors.length - 1) {
        gradientType += ', ';
      }
    });
    
    gradientType += ')';
    return gradientType;
  }
}