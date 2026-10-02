import express from 'express';
import { calculateSkillGrowth } from '../services/skillGrowthService.js';
import { getSession } from '../services/sessionStore.js';

const router = express.Router();

/**
 * POST /api/skill-growth
 * 
 * Automatically calculates skill progress, overall evidence coverage,
 * and recommended next steps using:
 * 1. Verified skills
 * 2. Job requirements
 * 3. Job match result
 * 4. Skill gaps
 * 5. Evidence status
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
router.post('/skill-growth', (req, res) => {
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

    const growthResult = calculateSkillGrowth({
      jobMatchResult,
      verifiedSkills: candidateSkills,
      jobDescription,
      sessionId,
      claimedSkills: candidateSkills,
      crossVerification: crossVerification || session?.crossVerification || {}
    });

    return res.status(200).json(growthResult);

  } catch (err) {
    console.error('[Skill Growth POST Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while calculating skill growth.'
    });
  }
});

/**
 * GET /api/skill-growth
 * 
 * Query:
 * ?sessionId=...
 * ?role=...
 * ?skills=Python,React,Docker
 */
router.get('/skill-growth', (req, res) => {
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

    const growthResult = calculateSkillGrowth({
      sessionId: sessionId || '',
      verifiedSkills: candidateSkills,
      claimedSkills: candidateSkills,
      crossVerification: session?.crossVerification || {},
      jobDescription: role ? { role } : {}
    });

    return res.status(200).json(growthResult);

  } catch (err) {
    console.error('[Skill Growth GET Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while fetching skill growth data.'
    });
  }
});

export default router;
