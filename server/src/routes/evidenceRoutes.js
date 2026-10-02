import express from 'express';
import { buildEvidenceExplorer } from '../services/evidenceExplorer.js';

const router = express.Router();

/**
 * GET /api/evidence
 * 
 * Informational endpoint for the Evidence Explorer API service.
 */
router.get('/evidence', (req, res) => {
  return res.status(200).json({
    success: true,
    service: 'SkillProof Evidence Explorer API',
    usage: 'POST /api/evidence/explore with { crossVerification, github }'
  });
});

/**
 * POST /api/evidence/explore
 * 
 * Transforms candidate cross-verification and GitHub data into an
 * evidence-explorer model for interactive inspection.
 * 
 * Accepts:
 * {
 *   crossVerification: object,
 *   github: object
 * }
 */
router.post('/evidence/explore', (req, res) => {
  try {
    const { crossVerification, github } = req.body || {};

    // Validate body structure
    if (req.body && typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body. Expected a JSON object with crossVerification and github.'
      });
    }

    const explorerData = buildEvidenceExplorer(crossVerification, github);

    return res.status(200).json({
      success: true,
      skills: explorerData.skills
    });
  } catch (err) {
    console.error('[Evidence Explorer Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while building the evidence explorer.'
    });
  }
});

export default router;
