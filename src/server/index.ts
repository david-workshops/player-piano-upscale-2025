/**
 * Server entry point
 * This file initializes the Express server and WebSocket connection for MIDI streaming
 */
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { initMidiGenerator } from './midi/generator';

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Set port
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// API routes
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Initialize MIDI generator for this connection
  const { startGeneration, stopGeneration, changeParameters } = initMidiGenerator(socket);
  
  // Start generating MIDI data
  startGeneration();
  
  // Handle client requests to change parameters
  socket.on('change-parameters', (params) => {
    changeParameters(params);
  });
  
  // Stop generation when client disconnects
  socket.on('stop-generation', () => {
    stopGeneration();
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    stopGeneration();
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;