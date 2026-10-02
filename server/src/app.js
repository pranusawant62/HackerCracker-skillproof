import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Explicitly load server/.env before routes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

import healthRoutes from './routes/healthRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import skillGapRoutes from './routes/skillGapRoutes.js';
import skillGrowthRoutes from './routes/skillGrowthRoutes.js';
import aiSkillAnalysisRoutes from './routes/aiSkillAnalysisRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for the React client
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server) or from allowed frontend origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any localhost origin during local development
    if (/^http:\/\/localhost:[0-9]+$/.test(origin) || /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Modular API Routes
app.use('/api', healthRoutes);
app.use('/api', verifyRoutes);
app.use('/api', jobRoutes);
app.use('/api', evidenceRoutes);
app.use('/api', skillGapRoutes);
app.use('/api', skillGrowthRoutes);
app.use('/api', aiSkillAnalysisRoutes);
app.use('/api', assessmentRoutes);

// Global fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start Express Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[SkillProof API] Server running on http://localhost:${PORT}`);
  });
}

export default app;
