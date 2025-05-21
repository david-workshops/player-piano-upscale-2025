# Piano Player - Minimalist Counterpoint

A web-based piano player that generates minimalist counterpoint music using Web Audio API. The application features a Node.js backend that streams MIDI data to a browser-based client, which renders the music using the Web Audio API.

## Features

- Server-generated MIDI stream with minimalist counterpoint approach
- Web Audio API for piano sound synthesis (no external libraries like Tone.js)
- Support for full piano range with no human playing restrictions
- Dynamic key/scale/mode changes over time
- Support for damper/sustain, sostenuto, and soft pedals
- XP MIDI support for Enspire Pro Disklavier system
- Visualization of playing notes and music data
- Retro computer interface design
- WCAG 2.2 accessibility compliant

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/david-workshops/demo2.git
   cd demo2
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

### Running the Application

Start both the server and client in development mode:

```
npm run dev
```

This will:
- Start the Node.js server (default port: 3000)
- Launch the client application

Once running, open your browser to the URL shown in the console (typically http://localhost:3000).

### Production

For production use:

```
npm start
```

## Usage

1. Press the "PLAY" button to start the music generation.
2. Choose between "Browser Audio" or "MIDI Output" (if your browser supports Web MIDI API).
3. Use the "STOP" button to stop playback and turn off all active notes.
4. The visualization displays:
   - Current key, scale, and mode
   - Active notes
   - Pedal status
   - A visual representation of notes as they play

## Development

### Project Structure

```
/
├── src/
│   ├── server/        # Node.js server code
│   │   ├── midi/      # MIDI generation and music theory
│   │   └── utils/     # Utility functions
│   ├── client/        # Browser client code
│   │   ├── js/        # TypeScript files for client
│   │   └── css/       # Styles
│   └── shared/        # Shared types and utilities
├── tests/             # Test files
├── dist/              # Compiled code (generated)
└── docs/              # Documentation (generated)
```

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run docs` - Generate documentation

## Accessibility

This application is designed to be WCAG 2.2 compliant. Features include:
- Proper heading structure
- ARIA labels
- Keyboard navigation support
- Focus management
- High contrast visuals
- Reduced motion support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
