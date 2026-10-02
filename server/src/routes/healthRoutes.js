import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint indicating service uptime and whether
 * GitHub API authentication is configured.
 * Strictly avoids exposing any secret token values.
 */
router.get('/health', (req, res) => {
  // Ensure latest .env state is read even if edited while server is running
  dotenv.config({ path: envPath });

  const raw = process.env.GITHUB_TOKEN;
  const isGithubConfigured = Boolean(
    raw && raw.trim().length > 0 && !raw.includes('<FRESH_GITHUB_TOKEN>')
  );

  res.status(200).json({
    status: 'ok',
    service: 'SkillProof API',
    githubConfigured: isGithubConfigured,
    timestamp: new Date().toISOString()
  });
});

export default router;
