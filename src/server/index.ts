import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { MidiStreamer } from './midi/stream';

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/client', express.static(path.join(__dirname, '../../dist/client')));

// Serve index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Create MIDI streamer
const midiStreamer = new MidiStreamer(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A client connected');
  
  // Send current musical parameters
  const currentParams = {
    key: midiStreamer.getCurrentMusicalParameters().key,
    scale: midiStreamer.getCurrentMusicalParameters().scale,
    mode: midiStreamer.getCurrentMusicalParameters().mode
  };
  socket.emit('musicParametersChanged', currentParams);
  
  // Start streaming when a client requests it
  socket.on('startStream', () => {
    console.log('Starting stream in auto mode');
    midiStreamer.startStreaming();
  });
  
  // Stop streaming when requested
  socket.on('stopStream', () => {
    console.log('Stopping stream');
    midiStreamer.stopStreaming();
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});