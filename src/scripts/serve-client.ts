import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.CLIENT_PORT || 8080;

// Serve static files from the client directory
const clientDir = path.join(__dirname, '../../dist/client');
app.use(express.static(clientDir));

// Serve index.html for any route
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Client development server running on http://localhost:${PORT}`);
});