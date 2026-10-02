import express from 'express';
import { performAiSkillAnalysis, generateDeterministicSkillAnalysis } from '../services/aiSkillAnalysis.js';
import { getSession } from '../services/sessionStore.js';
import { analyzeSkillGaps } from '../services/skillGapService.js';
import { calculateSkillGrowth } from '../services/skillGrowthService.js';

const router = express.Router();

/**
 * POST /api/ai-skill-analysis
 * 
 * Generates an empirical, high-signal AI analysis synthesizing:
 * 1. Verified skills
 * 2. Evidence strength
 * 3. GitHub repositories
 * 4. Job Match result
 * 5. Skill gaps
 * 6. Skill growth
 * 7. Recent activity
 * 
 * Response:
 * {
 *   "summary": "...",
 *   "strengths": [],
 *   "evidenceGaps": [],
 *   "nextSteps": [],
 *   "profileSummary": "..."
 * }
 */
router.post('/ai-skill-analysis', async (req, res) => {
  try {
    const {
      verifiedSkills,
      jobMatch,
      skillGaps,
      skillGrowth,
      sessionId,
      claimedSkills,
      github,
      recentActivity
    } = req.body || {};

    let session = null;
    let candidateSkills = Array.isArray(verifiedSkills) && verifiedSkills.length > 0
      ? verifiedSkills
      : claimedSkills;
    let sessionGithub = github;

    if (sessionId) {
      session = getSession(sessionId);
      if (session) {
        if (!candidateSkills || candidateSkills.length === 0) {
          candidateSkills = session.claimedSkills || [];
        }
        if (!sessionGithub) {
          sessionGithub = session.github || {};
        }
      }
    }

    // Auto-calculate skill gaps if not passed
    let computedGaps = Array.isArray(skillGaps) && skillGaps.length > 0 ? skillGaps : null;
    if (!computedGaps && (jobMatch || candidateSkills?.length > 0)) {
      try {
        const gapRes = analyzeSkillGaps({
          jobMatchResult: jobMatch || null,
          verifiedSkills: candidateSkills || [],
          claimedSkills: candidateSkills || []
        });
        computedGaps = gapRes?.skillGaps || [];
      } catch (e) {
        computedGaps = [];
      }
    }

    // Auto-calculate skill growth if not passed
    let computedGrowth = skillGrowth && Object.keys(skillGrowth).length > 0 ? skillGrowth : null;
    if (!computedGrowth && (jobMatch || candidateSkills?.length > 0)) {
      try {
        computedGrowth = calculateSkillGrowth({
          jobMatchResult: jobMatch || null,
          verifiedSkills: candidateSkills || [],
          claimedSkills: candidateSkills || []
        });
      } catch (e) {
        computedGrowth = {};
      }
    }

    const analysis = await performAiSkillAnalysis({
      verifiedSkills: candidateSkills || [],
      jobMatch: jobMatch || {},
      skillGaps: computedGaps || [],
      skillGrowth: computedGrowth || {},
      github: sessionGithub || {},
      recentActivity: recentActivity || session?.recentActivity || null,
      sessionId
    });

    return res.status(200).json({
      success: true,
      ...analysis
    });
  } catch (err) {
    console.error('[AI Skill Analysis Error]', err);
    // Graceful fallback to deterministic engine on error
    const fallback = generateDeterministicSkillAnalysis({
      verifiedSkills: req.body?.verifiedSkills || req.body?.claimedSkills || [],
      jobMatch: req.body?.jobMatch || {},
      skillGaps: req.body?.skillGaps || [],
      skillGrowth: req.body?.skillGrowth || {}
    });

    return res.status(200).json({
      success: true,
      ...fallback
    });
  }
});

/**
 * GET /api/ai-skill-analysis
 * Allows query-based retrieval for testing or session hydration
 */
router.get('/ai-skill-analysis', async (req, res) => {
  try {
    const { sessionId } = req.query;
    let session = null;
    let candidateSkills = [];
    let github = {};

    if (sessionId) {
      session = getSession(sessionId);
      if (session) {
        candidateSkills = session.claimedSkills || [];
        github = session.github || {};
      }
    }

    const analysis = await performAiSkillAnalysis({
      verifiedSkills: candidateSkills,
      sessionId,
      github
    });

    return res.status(200).json({
      success: true,
      ...analysis
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to generate AI skill analysis',
      details: err.message
    });
  }
});

export default router;
