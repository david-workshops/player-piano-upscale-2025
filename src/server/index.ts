import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { setupMidiStream } from './midi/stream';

// Create Express application
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const CLIENT_PATH = path.join(__dirname, '../../client');

// Serve static client files
app.use(express.static(CLIENT_PATH));

// Serve index.html for any GET request to the root
app.get('/', (_req, res) => {
  res.sendFile(path.join(CLIENT_PATH, 'index.html'));
});

// Setup WebSocket MIDI streaming
setupMidiStream(io);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});