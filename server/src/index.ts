import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import personRoutes from './routes/person.routes';
import searchRoutes from './routes/search.routes';
import uploadRoutes from './routes/upload.routes';
import groupRoutes from './routes/group.routes';
import relationshipRoutes from './routes/relationship.routes';
import activityRoutes from './routes/activity.routes';
import userRoutes from './routes/user.routes';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://192.168.1.31:8080',
    'http://192.168.1.31:8082',
    'http://192.168.1.31:8083'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicitly handle preflight requests
app.options('*', cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://192.168.1.31:8080',
    'http://192.168.1.31:8082',
    'http://192.168.1.31:8083'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Documentation: load swagger.json from dist or fallback to src
try {
  let swaggerPath = path.join(__dirname, 'swagger.json');
  if (!fs.existsSync(swaggerPath)) {
    swaggerPath = path.join(__dirname, '../src/swagger.json');
  }
  if (fs.existsSync(swaggerPath)) {
    const swaggerJson = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
    // @ts-ignore
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));
  } else {
    console.warn('swagger.json not found; /api-docs will be unavailable');
  }
} catch (e) {
  console.warn('Failed to load swagger.json; /api-docs disabled', e);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
console.log(`Attempting to start server...`);

// Add a basic route to test
app.get('/', (req, res) => {
  res.send('Server is running');
});

const server = app.listen(5001, '0.0.0.0', () => {
  console.log('Server is running on:');
  console.log('- http://localhost:5001');
  console.log('- http://192.168.1.31:5001');
  console.log('Try accessing these URLs in your browser');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  server.close(() => {
    console.log('HTTP server closed');
  });
});