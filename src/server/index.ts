import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { MusicGenerator } from './services/music-generator';

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Initialize music generator
const musicGenerator = new MusicGenerator();

// Set up Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send current musical context to new client
  socket.emit('musical-event', musicGenerator.getCurrentContext());
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start streaming music events
function streamMusicEvents() {
  // Generate and emit a new music event
  const event = musicGenerator.generateNextEvent();
  io.emit('musical-event', event);
  
  // Schedule the next event
  const nextEventTime = musicGenerator.getTimeUntilNextEvent();
  setTimeout(streamMusicEvents, nextEventTime);
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the player piano`);
  
  // Start streaming music events after server is running
  setTimeout(streamMusicEvents, 1000);
});