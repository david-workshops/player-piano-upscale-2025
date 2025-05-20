# Player Piano

A virtual player piano that generates and plays minimalist counterpoint music. This application features:

- A Node.js backend that generates MIDI notes and streams them to the client
- A frontend that plays the generated music using the Web Audio API
- Visualization of the currently playing notes and musical information
- Support for all piano pedals (sustain, sostenuto, soft)
- Music that slowly evolves over time with changing keys, scales, and modes

## Requirements

- Node.js v16 or higher
- npm v8 or higher

## Installation

1. Clone the repository:

```bash
git clone https://github.com/david-workshops/demo2.git
cd demo2
```

2. Install dependencies:

```bash
npm install
```

3. Build the application:

```bash
npm run build
```

## Running the Application

Start the development server (auto-rebuilds on changes):

```bash
npm run dev
```

Or build and run in production mode:

```bash
npm run build
npm start
```

Then open your browser to [http://localhost:3000](http://localhost:3000) to see and hear the player piano.

## Features

- **Minimalist counterpoint music**: The generated music follows minimalist principles with slow evolution over time.
- **Full piano range**: The application utilizes the entire range of the piano, playing patterns that would be impossible for human performers.
- **Piano pedal simulation**: Includes damper (sustain), sostenuto, and soft pedal effects.
- **Visualization**: Real-time display of currently playing notes, pedal status, and musical context.
- **Multiple output options**: Play through your browser using Web Audio API or output to a MIDI device (if your browser supports WebMIDI).

## Development

### Project Structure

- `src/server/`: Node.js server that generates and streams MIDI events
- `src/client/`: Browser frontend with Web Audio API implementation
- `src/shared/`: Common code shared between client and server

### Available Scripts

- `npm run dev`: Run the application in development mode with auto-reloading
- `npm run build`: Build the TypeScript application
- `npm start`: Run the application in production mode
- `npm test`: Run the test suite
- `npm run lint`: Check code style with ESLint
- `npm run lint:fix`: Fix code style issues automatically
- `npm run docs`: Generate documentation using TypeDoc

## Testing

Run the tests with:

```bash
npm test
```

## License

ISC
