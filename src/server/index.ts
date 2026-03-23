import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware chain
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware for invalid JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
let server: any;

export const startServer = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        resolve();
      });

      server.on('error', (err: Error) => {
        console.error('Server startup error:', err);
        reject(err);
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      reject(err);
    }
  });
};

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    const shutdownTimeout = setTimeout(() => {
      console.log('Shutdown timeout reached. Forcing exit...');
      process.exit(1);
    }, 10000); // 10 second timeout

    server.close((err: Error) => {
      clearTimeout(shutdownTimeout);
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      console.log('Server closed successfully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app };