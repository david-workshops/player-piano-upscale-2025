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

Start the development server:
```
npm run dev
```

This will:
- Start the Node.js server on port 3000
- Start the development client on port 5173
- Open your browser to http://localhost:5173

## Usage

1. Click the "START" button to begin generating and playing music
2. Use the output selector to choose between browser audio and MIDI output
3. The visualization will show currently playing notes
4. Information about the current key, scale, and pedals will be displayed
5. Click "STOP" to stop all playback

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

### Architecture

- Backend: Node.js with Express and Socket.io
- Frontend: HTML/CSS/TypeScript with Web Audio API
- Real-time communication via WebSockets
- Documentation generated with TypeDoc

## License

This project is licensed under the MIT License - see the LICENSE file for details.
