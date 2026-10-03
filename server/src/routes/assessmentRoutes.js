import { Router } from 'express';
import { 
  startAssessment, 
  submitAssessment, 
  getAssessment,
  getSession,
  createSession 
} from '../services/sessionStore.js';
import { 
  generateSkillAssessment, 
  sanitizeAssessmentForClient 
} from '../services/skillAssessmentGenerator.js';

const router = Router();

/**
 * POST /api/skill-assessment/start
 * Starts a practical micro-task assessment for a target skill.
 */
router.post('/skill-assessment/start', (req, res) => {
  try {
    const { sessionId, skill, difficulty = 'intermediate' } = req.body;

    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Skill name is required.'
      });
    }

    const activeSessionId = sessionId || 'session_demo_candidate';
    if (!getSession(activeSessionId)) {
      createSession({
        sessionId: activeSessionId,
        candidateName: 'Candidate',
        claimedSkills: [{ skill }]
      });
    }

    const sanitizedAssessment = startAssessment({ sessionId: activeSessionId, skill, difficulty });

    return res.status(200).json({
      success: true,
      assessment: sanitizedAssessment,
      message: `Assessment started for ${skill}. Answer the practical tasks to verify competency.`
    });
  } catch (err) {
    console.error('[Start Assessment Error]', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to start skill assessment.'
    });
  }
});

/**
 * POST /api/skill-assessment/submit
 * Submits candidate answers for evaluation and records the result.
 */
router.post('/skill-assessment/submit', (req, res) => {
  try {
    const { assessmentId, sessionId, answers } = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        error: 'Assessment ID is required.'
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers must be provided as an array.'
      });
    }

    const result = submitAssessment({ assessmentId, sessionId, answers });

    return res.status(200).json({
      success: true,
      assessmentResult: result.assessmentResult,
      session: result.session,
      skill: result.skill,
      message: result.assessmentResult.passed
        ? `Skill verified via practical assessment (${result.assessmentResult.percentage}% - ${result.assessmentResult.competency}).`
        : `Assessment completed (${result.assessmentResult.percentage}%). Minimum passing score is 70%.`
    });
  } catch (err) {
    console.error('[Submit Assessment Error]', err);
    const statusCode = err.message?.includes('not found') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to submit and evaluate assessment.'
    });
  }
});

/**
 * GET /api/skill-assessment/:assessmentId
 * Retrieves assessment status or results.
 */
router.get('/skill-assessment/:assessmentId', (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        error: 'Assessment ID is required.'
      });
    }

    const assessment = getAssessment(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found.'
      });
    }

    if (assessment.status === 'in_progress') {
      return res.status(200).json({
        success: true,
        assessment: sanitizeAssessmentForClient(assessment)
      });
    }

    return res.status(200).json({
      success: true,
      assessment: {
        assessmentId: assessment.assessmentId,
        skill: assessment.skill,
        status: assessment.status,
        score: assessment.score,
        maxScore: assessment.maxScore,
        percentage: assessment.percentage,
        passed: assessment.passed,
        competency: assessment.competency,
        completedAt: assessment.submittedAt,
        strengths: assessment.strengths,
        improvementAreas: assessment.improvementAreas,
        results: assessment.results
      }
    });
  } catch (err) {
    console.error('[Get Assessment Error]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve assessment.'
    });
  }
});

/**
 * POST /api/skill-assessment/generate
 * Generates an assessment preview without session binding.
 */
router.post('/skill-assessment/generate', (req, res) => {
  try {
    const { skill, difficulty = 'intermediate' } = req.body;

    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Skill name is required.'
      });
    }

    const assessment = generateSkillAssessment(skill, difficulty);
    return res.status(200).json({
      success: true,
      assessment: sanitizeAssessmentForClient(assessment)
    });
  } catch (err) {
    console.error('[Generate Assessment Error]', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to generate assessment.'
    });
  }
});

export default router;
