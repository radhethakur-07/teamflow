import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Basic Socket connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
  });
});

// Start Server Function
const startServer = async () => {
  try {
    // Attempt database connection
    await connectDatabase();

    server.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`  TeamFlow API Server running in ${config.nodeEnv.toUpperCase()} mode`);
      console.log(`  Local URL:   http://localhost:${config.port}`);
      console.log(`  Health API:  http://localhost:${config.port}/api/health`);
      console.log(`  CORS Origin: ${config.cors.allowedOrigins.join(', ')}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('[Server] Startup error:', error.message);
    process.exit(1);
  }
};

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
  
  io.close(() => {
    console.log('[Socket.IO] Socket server closed.');
  });

  server.close(async () => {
    console.log('[Server] HTTP server terminated.');
    await disconnectDatabase();
    process.exit(0);
  });

  // Force close after 10 seconds if hanging
  setTimeout(() => {
    console.error('[Server] Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

export { app, server, io };
