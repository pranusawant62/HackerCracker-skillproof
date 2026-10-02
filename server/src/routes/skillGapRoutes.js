import express from 'express';
import { analyzeSkillGaps } from '../services/skillGapService.js';
import { getSession } from '../services/sessionStore.js';

const router = express.Router();

/**
 * POST /api/skill-gaps
 * 
 * Computes structured skill gap details combining:
 * Job Match Result + Verified Skill Evidence.
 * 
 * Accepts:
 * {
 *   jobMatchResult?: object,
 *   verifiedSkills?: Array,
 *   jobDescription?: object | string,
 *   sessionId?: string,
 *   claimedSkills?: Array
 * }
 */
router.post('/skill-gaps', (req, res) => {
  try {
    const {
      jobMatchResult,
      verifiedSkills,
      jobDescription,
      sessionId,
      claimedSkills,
      crossVerification
    } = req.body || {};

    let session = null;
    let candidateSkills = Array.isArray(verifiedSkills) && verifiedSkills.length > 0
      ? verifiedSkills
      : claimedSkills;

    if (sessionId) {
      session = getSession(sessionId);
      if (session && (!candidateSkills || candidateSkills.length === 0)) {
        candidateSkills = session.claimedSkills || [];
      }
    }

    const gapResult = analyzeSkillGaps({
      jobMatchResult,
      verifiedSkills: candidateSkills,
      jobDescription,
      sessionId,
      claimedSkills: candidateSkills,
      crossVerification: crossVerification || session?.crossVerification || {}
    });

    return res.status(200).json(gapResult);

  } catch (err) {
    console.error('[Skill Gaps POST Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while generating skill gap details.'
    });
  }
});

/**
 * GET /api/skill-gaps
 * 
 * Retrieves skill gap details for an active candidate session or queried skills.
 * Query options:
 * ?sessionId=...
 * ?skills=Docker,React
 * ?role=Full-Stack Developer
 */
router.get('/skill-gaps', (req, res) => {
  try {
    const { sessionId, role, skills } = req.query;

    let session = null;
    let candidateSkills = [];

    if (sessionId) {
      session = getSession(sessionId);
    }

    if (session && Array.isArray(session.claimedSkills)) {
      candidateSkills = session.claimedSkills;
    } else if (skills) {
      try {
        candidateSkills = typeof skills === 'string' && skills.startsWith('[')
          ? JSON.parse(skills)
          : skills.split(',').map(s => ({ skill: s.trim(), status: 'CLAIMED-ONLY' }));
      } catch (_) {
        candidateSkills = [];
      }
    }

    const gapResult = analyzeSkillGaps({
      sessionId: sessionId || '',
      verifiedSkills: candidateSkills,
      claimedSkills: candidateSkills,
      crossVerification: session?.crossVerification || {},
      jobDescription: role ? { role } : {}
    });

    return res.status(200).json(gapResult);

  } catch (err) {
    console.error('[Skill Gaps GET Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while fetching skill gaps.'
    });
  }
});

export default router;
