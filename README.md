# Player Piano

A virtual player piano application that generates minimalist counterpoint music with evolving key and scale changes.

## Features

- Node.js server backend streaming MIDI notes and chords
- Web Audio API for piano sound synthesis (no external libraries)
- Minimalist counterpoint composition that changes over time
- Support for piano pedals (sustain, sostenuto, soft)
- Retro computer UI with live visualization
- MIDI output support
- Accessibility compliant with WCAG 2.2
- Weather-influenced music generation
- AI-generated visualizations based on music and weather data

## Requirements

- Node.js 16 or higher
- npm 7 or higher

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/player-piano.git
   cd player-piano
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

Start both frontends and the server:
```
npm run dev:all
```

Or start individual components:
```
npm run dev           # Runs server and main piano client
npm run dev:server    # Runs only the server
npm run dev:client    # Runs only the piano client
npm run dev:visual    # Runs only the visualization client
```

The applications will be available at:
- Piano Interface: http://localhost:5173
- Visualization Interface: http://localhost:5174

## Usage

### Piano Interface
1. Click the "START" button to begin generating and playing music
2. Use the output selector to choose between browser audio and MIDI output
3. The visualization will show currently playing notes
4. Information about the current key, scale, and pedals will be displayed
5. Click "STOP" to stop all playback

### Visualization Interface
1. Click the "START" button to begin visualization generation
2. The system will create AI-generated abstract visualizations based on:
   - The notes currently being played
   - Current weather conditions
3. Visualizations refresh every 45 seconds with smooth transitions
4. Information about the prompt and musical influences is displayed

## MIDI Output

To use MIDI output instead of browser audio:
1. Connect a MIDI device to your computer
2. Select "MIDI OUTPUT" from the dropdown
3. Start the player

Note: MIDI output requires a browser that supports the Web MIDI API (Chrome, Edge, Opera).

## Development

Build the application:
```
npm run build
```

Run tests:
```
npm test
```

Run E2E tests:
```
npm run test:e2e
```

Lint the code:
```
npm run lint
```

Generate documentation:
```
npm run docs
```

## Technical Details

### Music Generation

The application generates minimalist counterpoint music with:
- Slowly evolving key and scale changes
- Full use of the piano range
- Varying density and complexity
- Natural silences and dynamic changes
- Support for pedal usage
- Weather-influenced musical parameters

### Visualization Generation

The visualization frontend:
- Generates prompts based on playing notes and weather data
- Creates minimalist abstract "sea of colour" visualizations
- Updates every 45 seconds with smooth transitions
- Displays information about the current prompt and influences
- Integrates with the Freepik Mystic AI API for image generation
  - Falls back to CSS gradients when API key is not provided
  - Uses optimal configuration for abstract image generation
  - Dynamically adjusts image parameters based on musical content

### Freepik API Integration

The visualization system uses the Freepik Mystic AI API with the following features:
- POST requests to generate images from dynamically created prompts
- GET requests to retrieve completed image generation tasks
- Optimal parameter configuration using:
  - Appropriate resolution (2K)
  - Dynamic aspect ratio selection
  - Creative detailing adjustments based on music complexity
  - Engine selection based on weather conditions

See the [Visual Client README](src/visual-client/README.md) for detailed API setup instructions.

### Architecture

- Backend: Node.js with Express and Socket.io
- Frontend: HTML/CSS/TypeScript with Web Audio API
- Visual Frontend: Second client for AI-generated visualizations
- Real-time communication via WebSockets
- Documentation generated with TypeDoc

## License

This project is licensed under the MIT License - see the LICENSE file for details.
