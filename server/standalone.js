import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client build
const clientPath = join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// Register API routes
await registerRoutes(app);

// Serve the React app for any non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(clientPath, 'index.html'));
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Fertilizer Factory Management App Started!');
  console.log('🚀 نظام إدارة مصنع الأسمدة بدأ التشغيل!');
  console.log('');
  console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
  console.log(`🌐 افتح المتصفح واذهب إلى: http://localhost:${PORT}`);
  console.log('');
  console.log('Press Ctrl+C to stop the application');
  console.log('اضغط Ctrl+C لإيقاف التطبيق');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n💫 Shutting down gracefully...');
  console.log('💫 جارٍ إغلاق التطبيق...');
  server.close(() => {
    console.log('🔒 Application closed');
    console.log('🔒 تم إغلاق التطبيق');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n💫 Shutting down gracefully...');
  console.log('💫 جارٍ إغلاق التطبيق...');
  server.close(() => {
    console.log('🔒 Application closed');
    console.log('🔒 تم إغلاق التطبيق');
    process.exit(0);
  });
});