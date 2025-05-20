# Player Piano

A generative player piano application that streams MIDI notes and chords from a Node.js server to a web client. The client plays the music using the Web Audio API without relying on Tone.js.

## Features

- Server-side generation of minimalist counterpoint music
- Web Audio API integration for piano sound synthesis
- Support for XP MIDI for Enspire Pro disklavier system
- Full piano range utilization with support for pedal controls
- Dynamic key, scale, and mode changes
- Retro-styled visualization of playing notes and musical data
- Support for both browser audio playback and MIDI output

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/player-piano.git
   cd player-piano
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

Run both server and client in development mode with hot reloading:

```bash
npm run dev
```

This will start:
- The backend server on port 3000
- The frontend dev server on port 8080

### Production Build

Build both server and client for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Usage

1. Open your browser to `http://localhost:8080`
2. The player piano will automatically start generating and playing music
3. Use the UI controls to:
   - Stop playback and turn off all active notes
   - Toggle between browser audio and MIDI output
4. The data display will show real-time information about:
   - Notes and chords being played
   - Current key, scale, and mode
   - Pedal activity
   - System status

## Testing

Run unit tests:

```bash
npm test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## Linting

Check code for style issues:

```bash
npm run lint
```

Fix automatically fixable issues:

```bash
npm run lint:fix
```

## Documentation

Generate documentation:

```bash
npm run docs
```

View the documentation by opening `docs/index.html` in your browser.

## Project Structure

```
/
├── src/
│   ├── client/              # Frontend code
│   │   ├── audio/           # Web Audio API implementation
│   │   ├── components/      # UI components
│   │   ├── visualization/   # Visualization components
│   │   ├── index.html       # HTML entry point
│   │   ├── index.ts         # Client entry point
│   │   └── styles.css       # CSS styles
│   ├── server/              # Backend code
│   │   ├── midi/            # MIDI generation logic
│   │   ├── music/           # Music theory utilities
│   │   └── index.ts         # Server entry point
│   └── shared/              # Shared types and utilities
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── e2e/                 # End-to-end tests
├── public/                  # Static assets (build output)
├── .github/workflows/       # GitHub Actions workflows
├── docs/                    # Generated documentation
└── ... (config files)
```

## License

MIT
