import express from 'express';
import { parseJobDescription } from '../services/jobDescriptionParser.js';
import { matchJobSkills, compareJobWithVerifiedSkills } from '../services/jobMatcher.js';
import { analyzeJobMatch } from '../services/jobMatchAnalyzer.js';
import { generateJobDescription } from '../services/jobDescriptionGenerator.js';
import { getSession } from '../services/sessionStore.js';

const router = express.Router();

const MIN_LENGTH = 30;
const MAX_LENGTH = 50000;

/**
 * POST /api/job-match
 * 
 * Accepts a Job Description text payload, validates input,
 * deterministically extracts technical skills, and separates
 * required vs preferred requirements.
 */
router.post('/job-match', (req, res) => {
  try {
    const { jobDescription } = req.body;

    // 1. Reject empty / non-string input
    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Job description text is required.'
      });
    }

    const trimmed = jobDescription.trim();

    // 2. Reject extremely short job descriptions
    if (trimmed.length < MIN_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Job description is too short (${trimmed.length} characters). Please provide a substantive job description of at least ${MIN_LENGTH} characters.`
      });
    }

    // 3. Reject excessively large inputs
    if (trimmed.length > MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Job description exceeds maximum allowed length of ${MAX_LENGTH.toLocaleString()} characters.`
      });
    }

    // 4. Extract required and preferred skills deterministically
    const parsed = parseJobDescription(trimmed);

    // 5. Return structured response matching Stage 6A specification
    return res.status(200).json({
      success: true,
      jobDescription: {
        characterCount: trimmed.length
      },
      requiredSkills: parsed.requirements.required,
      preferredSkills: parsed.requirements.preferred,
      allSkills: parsed.extractedSkills
    });

  } catch (err) {
    console.error('[Job Match Route Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while parsing the job description.'
    });
  }
});

/**
 * POST /api/job-match/analyze
 * 
 * Compares candidate verified skills against target job description.
 * Accepts:
 * {
 *   verifiedSkills: [...],
 *   jobDescription: {...} | string,
 *   sessionId?: string,
 *   claimedSkills?: Array
 * }
 * 
 * Response:
 * {
 *   role: string,
 *   score: number,
 *   requiredSkills: string[],
 *   matchedSkills: Array,
 *   partialSkills: Array,
 *   skillGaps: Array,
 *   summary: string
 * }
 */
router.post('/job-match/analyze', (req, res) => {
  try {
    const { 
      verifiedSkills,
      jobDescription, 
      sessionId, 
      claimedSkills, 
      crossVerification 
    } = req.body || {};

    // 1. Validate Job Description
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required.'
      });
    }

    let jdText = '';
    let jdObj = null;

    if (typeof jobDescription === 'string') {
      const trimmed = jobDescription.trim();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          error: 'Job description text cannot be empty.'
        });
      }
      if (trimmed.length < MIN_LENGTH) {
        return res.status(400).json({
          success: false,
          error: `Job description is too short (${trimmed.length} characters). Minimum ${MIN_LENGTH} characters required.`
        });
      }
      if (trimmed.length > MAX_LENGTH) {
        return res.status(400).json({
          success: false,
          error: `Job description exceeds maximum allowed length of ${MAX_LENGTH.toLocaleString()} characters.`
        });
      }
      jdText = trimmed;
      jdObj = trimmed;
    } else if (typeof jobDescription === 'object') {
      jdObj = jobDescription;
      if (typeof jobDescription.jobDescriptionText === 'string') {
        jdText = jobDescription.jobDescriptionText;
      } else if (typeof jobDescription.text === 'string') {
        jdText = jobDescription.text;
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid job description format.'
      });
    }

    // 2. Resolve Candidate Skills from verifiedSkills, sessionId, or claimedSkills
    let candidateSkills = [];
    let session = null;

    if (Array.isArray(verifiedSkills) && verifiedSkills.length > 0) {
      candidateSkills = verifiedSkills;
    } else if (sessionId) {
      session = getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Verification session not found or expired.'
        });
      }
      if (!session.claimedSkills || !Array.isArray(session.claimedSkills) || session.claimedSkills.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No claimed skills found for this candidate session.'
        });
      }
      candidateSkills = session.claimedSkills;
    } else if (Array.isArray(claimedSkills) && claimedSkills.length > 0) {
      candidateSkills = claimedSkills;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Candidate verified skills or sessionId is required.'
      });
    }

    // 3. Run Deterministic Comparison Engine
    const analysis = compareJobWithVerifiedSkills({
      verifiedSkills: candidateSkills,
      jobDescription: jdObj,
      claimedSkills: Array.isArray(claimedSkills) ? claimedSkills : (session?.claimedSkills || []),
      crossVerification: crossVerification || {}
    });

    // 4. Optional Responsibilities analysis if job description text is available
    let responsibilities = [];
    if (jdText && jdText.length >= MIN_LENGTH) {
      try {
        const textAnalysis = analyzeJobMatch(jdText, candidateSkills);
        responsibilities = textAnalysis.responsibilities || [];
      } catch (_) {
        // Fallback: responsibilities remain empty if text parser fails
      }
    }

    // 5. Return response adhering to task specification with top-level keys
    return res.status(200).json({
      success: true,
      role: analysis.role,
      score: analysis.score,
      requiredSkills: analysis.requiredSkills,
      matchedSkills: analysis.matchedSkills,
      partialSkills: analysis.partialSkills,
      skillGaps: analysis.skillGaps,
      summary: analysis.summary,
      // Backward compatibility fields for existing UI and previous tests:
      match: {
        role: analysis.role,
        percentage: analysis.score,
        score: analysis.score,
        requiredSkills: analysis.requiredSkills,
        matchedSkills: analysis.matchedSkills,
        partialSkills: analysis.partialSkills,
        gapSkills: analysis.skillGaps,
        skillGaps: analysis.skillGaps,
        claimedUnverifiedSkills: analysis.claimedUnverifiedSkills,
        responsibilities,
        explanation: analysis.summary,
        summary: analysis.summary,
        scoring: {
          matchedPoints: analysis.earnedPoints,
          totalRequiredPoints: analysis.totalRequired,
          formula: 'earned_points / total_required * 100'
        }
      },
      gapSkills: analysis.skillGaps,
      claimedUnverifiedSkills: analysis.claimedUnverifiedSkills,
      responsibilities,
      session: session || null
    });

  } catch (err) {
    console.error('[Job Match Analyze Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An unexpected error occurred while analyzing job match.'
    });
  }
});

/**
 * POST /api/job-description/generate
 * 
 * Automatically determines a suitable target role from the candidate's strongest PROVEN skills
 * and generates a realistic job description containing:
 * - role
 * - summary
 * - responsibilities
 * - requiredSkills
 * - preferredSkills
 * - technologies
 * - jobDescriptionText
 */
router.post('/job-description/generate', (req, res) => {
  try {
    let { skills, sessionId } = req.body || {};

    // If sessionId is provided and skills is not, resolve skills from active session
    if ((!skills || !Array.isArray(skills) || skills.length === 0) && sessionId) {
      const session = getSession(sessionId);
      if (session && Array.isArray(session.claimedSkills)) {
        skills = session.claimedSkills;
      }
    }

    const jdResult = generateJobDescription({
      skills: Array.isArray(skills) ? skills : []
    });

    return res.status(200).json({
      success: true,
      ...jdResult
    });

  } catch (err) {
    console.error('[Job Description Generate Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while generating the job description.'
    });
  }
});

export default router;
