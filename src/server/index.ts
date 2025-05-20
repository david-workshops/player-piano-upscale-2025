import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { generateMidiEvent } from './music-generator';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Serve static files from the "dist/client" directory
app.use(express.static(path.join(__dirname, '../../client')));

// Send all requests to index.html so client-side routing works
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  let playing = false;
  let intervalId: NodeJS.Timeout | null = null;

  // Start streaming MIDI events
  socket.on('start', () => {
    if (!playing) {
      playing = true;
      console.log('Starting MIDI stream');
      
      // Generate MIDI events at regular intervals
      intervalId = setInterval(() => {
        const event = generateMidiEvent();
        socket.emit('midi', event);
      }, 100); // Generate events every 100ms (adjust as needed)
    }
  });

  // Stop streaming MIDI events
  socket.on('stop', () => {
    if (playing && intervalId) {
      clearInterval(intervalId);
      playing = false;
      console.log('Stopped MIDI stream');
      
      // Send all notes off message
      socket.emit('midi', { type: 'allNotesOff' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});

export default server;