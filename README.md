# Piano Project

A minimalist counterpoint piano music generator with a retro-styled interface.

## Features

- Generates minimalist counterpoint music that slowly changes over time
- Streams MIDI notes and chords from a Node.js server to a web client
- Plays notes through the browser or MIDI output
- Full piano range utilization without human playing restrictions
- Automatic key, scale, and mode changes with real-time display
- Sustain, sostenuto, and soft pedal support
- Real-time visualization with retro computer appearance

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/david-workshops/demo2.git
cd demo2
npm install
```

## Running the Project

Build the TypeScript files and start the server:

```bash
npm run build
npm start
```

For development with concurrent server and client building:

```bash
npm run start:dev
```

Then open your browser and navigate to:

```
http://localhost:3000
```

## Controls

- **Output Mode**: Choose between browser audio playback or MIDI output
- **Current Key/Scale/Mode**: Displays the current musical parameters
- **Start**: Begin the music stream
- **Stop**: End the music stream and turn off all active notes

## Development

### Testing

Run the tests with:

```bash
npm test
```

Run the tests in watch mode:

```bash
npm run test:watch
```

### Linting

Lint the code with:

```bash
npm run lint
```

### Documentation

Generate TypeDoc documentation:

```bash
npm run docs
```

Serve the documentation locally:

```bash
npm run docs:serve
```

Then open your browser to http://localhost:8080 to view the documentation.

#### Online Documentation

The project documentation is automatically published to GitHub Pages when changes are pushed to the main branch. You can access the latest documentation at:

```
https://[organization-name].github.io/demo2/
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- Linting checks
- TypeScript type-checking
- Unit tests
- E2E tests
- Build verification
- Documentation generation and deployment to GitHub Pages

The workflows run automatically on push to main branch and on pull requests.

## Requirements

- Node.js 14+
- Modern web browser with Web Audio support
- MIDI device (optional, for MIDI output)
