# Piano Project

A minimalist counterpoint piano music generator with a retro-styled interface.

## Features

- Generates minimalist counterpoint music that slowly changes over time
- Streams MIDI notes and chords from a Node.js server to a web client
- Plays notes through the browser or MIDI output
- Full piano range utilization without human playing restrictions
- Key, scale, and mode controls with occasional automatic changes
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

Build the TypeScript files:

```bash
npm run build
```

Start the server:

```bash
npm start
```

Then open your browser and navigate to:

```
http://localhost:3000
```

## Development

For development with hot reloading:

```bash
npm run dev
```

## Controls

- **Output Mode**: Choose between browser audio playback or MIDI output
- **Key**: Select the musical key (C, C#, D, etc.)
- **Scale**: Choose the scale (Major, Minor, Harmonic Minor, etc.)
- **Mode**: Select the mode (Ionian, Dorian, Phrygian, etc.)
- **Start**: Begin the music stream
- **Stop**: End the music stream and turn off all active notes

## Requirements

- Node.js 14+
- Modern web browser with Web Audio support
- MIDI device (optional, for MIDI output)
