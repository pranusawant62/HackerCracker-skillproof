import express from 'express';
import multer from 'multer';
import { extractResumeText, extractClaimedSkills } from '../services/pdfParser.js';
import { fetchGitHubProfile, analyzeGithub } from '../services/githubAnalyzer.js';
import { matchSkills } from '../services/skillMatcher.js';
import { extractResumeIdentity, extractGithubIdentity, verifyCandidateIdentity } from '../services/identityVerifier.js';
import { 
  createSession, 
  getSession, 
  addSkillToSession, 
  deleteSkillFromSession,
  updateSkillEvidence, 
  calculateSessionSummary,
  normalizeSkillStatus,
  recalculateSkillStatus,
  getSkillExplanation
} from '../services/sessionStore.js';
import { analyzeSkillEvidence, extractResumeEvidenceForSkill } from '../services/evidenceAnalyzer.js';

const router = express.Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// In-memory storage: do NOT save uploaded files to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfExt = file.originalname && file.originalname.toLowerCase().endsWith('.pdf');

    if (isPdfMime || isPdfExt) {
      cb(null, true);
    } else {
      const err = new Error('Only PDF files (.pdf) are supported.');
      err.code = 'INVALID_FILE_TYPE';
      cb(err, false);
    }
  }
});

// Middleware to wrap multer and capture file upload errors cleanly
function handleFileUpload(req, res, next) {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: `File size exceeds the allowed limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
          });
        }
        return res.status(400).json({
          success: false,
          error: `Upload error: ${err.message}`
        });
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed.'
      });
    }

    next();
  });
}

// Multer for optional evidence document/file upload
const evidenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

/**
 * POST /api/verify
 * 
 * 1. Ingests resume PDF in memory and extracts claimed skills.
 * 2. Extracts candidate identity signals from resume (name, email, github, linkedin, website).
 * 3. Fetches legitimate public GitHub profile identity information.
 * 4. Verifies candidate identity once before any skill verification.
 * 5. HARD SECURITY GATE: If identity is not VERIFIED, blocks GitHub repository analysis.
 * 6. If VERIFIED, analyzes repositories once, initializes candidateVerificationSession.
 */
router.post('/verify', handleFileUpload, async (req, res) => {
  try {
    const { githubUsername, candidateName } = req.body;
    const resumeFile = req.file;

    // Validate required fields
    if (!githubUsername || !githubUsername.trim()) {
      return res.status(400).json({
        success: false,
        error: 'GitHub username is required.'
      });
    }

    if (!resumeFile || !resumeFile.buffer) {
      return res.status(400).json({
        success: false,
        error: 'Resume PDF file is required.'
      });
    }

    // 1. Extract and normalize text using pdfParser service
    let extracted;
    try {
      extracted = await extractResumeText(resumeFile.buffer);
    } catch (parseErr) {
      return res.status(422).json({
        success: false,
        error: parseErr.message || 'The uploaded file could not be parsed as a valid PDF.'
      });
    }

    // 2. Perform deterministic taxonomy skill extraction from resume
    const claimedSkills = extractClaimedSkills(extracted.text);

    // 3. Extract candidate identity from resume
    const resumeIdentity = extractResumeIdentity(extracted.text);

    // 4. Fetch GitHub user public identity metadata
    const cleanUsername = githubUsername.trim().replace(/^@/, '');
    let githubProfile = null;
    let githubError = null;

    try {
      githubProfile = await fetchGitHubProfile(cleanUsername);
    } catch (ghErr) {
      console.warn(`[GitHub Profile Fetch Warning for ${cleanUsername}]:`, ghErr.message);
      githubError = ghErr.message || 'GitHub profile could not be reached.';
    }

    // 5. Run Candidate Identity Verification (Checks Candidate Identity Consistency)
    const githubIdentity = extractGithubIdentity(githubProfile || { username: cleanUsername });
    const identityResult = verifyCandidateIdentity({
      candidateName: (candidateName || '').trim(),
      resumeIdentity,
      githubIdentity,
      submittedUsername: cleanUsername
    });

    // ========================================================
    // Proceed with GitHub Skill Verification
    // ========================================================
    let githubResult = null;
    try {
      githubResult = await analyzeGithub(cleanUsername, githubProfile);
    } catch (ghErr) {
      console.warn(`[GitHub Analysis Warning for ${cleanUsername}]:`, ghErr.message);
      githubError = ghErr.message || 'GitHub analysis could not be completed.';
    }

    // Run Stage 4 Cross-Verification
    const crossVerification = matchSkills(claimedSkills, githubResult);

    // Format claimed skills with source, status, and evidence array
    const finalCandidateName = candidateName || resumeIdentity?.name || '';
    const formattedSkills = await Promise.all(claimedSkills.map(async (c, idx) => {
      const match = crossVerification.results.find(r => r.skill.toLowerCase() === c.skill.toLowerCase());
      const rawStatus = match?.status || 'UNVERIFIED';
      const ghStatus = normalizeSkillStatus(rawStatus);

      const initialEvidence = [];

      // 1. Attach GitHub Evidence if found from Stage 4
      if (match && Array.isArray(match.evidence)) {
        match.evidence.forEach(ev => {
          const isProved = ghStatus === 'proven';
          initialEvidence.push({
            id: `ev_gh_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            type: ev.evidenceType || 'github_repo',
            title: `GitHub Repository: ${ev.repository || 'repository'}`,
            url: ev.repositoryUrl || `https://github.com/${cleanUsername}/${ev.repository}`,
            details: ev.details || `${ev.skill} detected in repository`,
            evidenceRelevance: isProved ? 'direct' : 'partial',
            verificationStatus: ghStatus,
            skillMatch: true,
            candidateIdentityMatch: true,
            confidence: isProved ? 'high' : 'medium',
            observableArtifacts: [ev.details || `${ev.skill} codebase artifacts`],
            artifacts: [ev.details || `${ev.skill} codebase artifacts`],
            submittedByCandidate: false,
            verified: isProved,
            createdAt: new Date().toISOString()
          });
        });
      }

      // 2. Extract and attach Observable Resume Evidence from actual resume project/experience context
      try {
        const resumeEv = await extractResumeEvidenceForSkill(extracted.text, c.skill, finalCandidateName);
        if (resumeEv && resumeEv.evidenceItem) {
          initialEvidence.push({
            id: `ev_res_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            type: 'resume',
            title: `Resume Observable Evidence: ${c.skill}`,
            details: resumeEv.context || resumeEv.explanation,
            evidenceRelevance: resumeEv.evidenceItem.evidenceRelevance,
            verificationStatus: resumeEv.evidenceItem.verificationStatus,
            skillMatch: resumeEv.evidenceItem.skillMatch,
            candidateIdentityMatch: true,
            confidence: resumeEv.evidenceItem.confidence,
            observableArtifacts: resumeEv.evidenceItem.observableArtifacts,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`[Resume Evidence Extraction Warning for ${c.skill}]:`, err.message);
      }

      const skillObj = {
        id: `skill_${idx + 1}_${c.skill.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        skill: c.skill,
        category: c.category || 'Other',
        matchedTerm: c.matchedTerm || c.skill,
        claimSource: 'resume', // Extracted from resume
        status: 'unverified',
        evidence: initialEvidence,
        explanation: `No sufficient observable evidence was found for ${c.skill}.`,
        lastUpdatedAt: new Date().toISOString()
      };

      // 3. Recalculate canonical status deterministically across all accumulated evidence
      skillObj.status = recalculateSkillStatus(skillObj);
      skillObj.explanation = getSkillExplanation(skillObj);

      return skillObj;
    }));

    // Create persistent candidate verification session
    const session = createSession({
      candidateName: candidateName || resumeIdentity?.name || '',
      githubUsername: cleanUsername,
      githubUrl: `https://github.com/${cleanUsername}`,
      identityStatus: 'verified',
      identityVerification: identityResult,
      resume: {
        filename: resumeFile.originalname,
        pages: extracted.pages,
        textLength: extracted.textLength,
        identity: resumeIdentity
      },
      claimedSkills: formattedSkills,
      github: githubResult,
      crossVerification
    });

    const summary = calculateSessionSummary(session);

    return res.status(200).json({
      success: true,
      isBlocked: false,
      sessionId: session.sessionId,
      candidateVerificationSession: session,
      identityVerification: identityResult,
      githubUsername: cleanUsername,
      resume: session.resume,
      claimedSkills: session.claimedSkills,
      github: session.github,
      githubError,
      crossVerification,
      summary
    });

  } catch (unexpectedErr) {
    console.error('[Verify Route Error]:', unexpectedErr);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while processing the verification request.'
    });
  }
});

/**
 * POST /api/skills/add
 * 
 * Allows candidate to manually add a skill after resume processing.
 * Does NOT restart the verification process.
 * Stores claimSource: "manual".
 * Checks existing session GitHub repositories for evidence.
 */
router.post('/skills/add', (req, res) => {
  try {
    const { sessionId, skill, category } = req.body || {};

    if (!skill || !skill.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Skill name is required.'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required to add skills.'
      });
    }

    const { session, skill: addedSkill, isNew } = addSkillToSession(sessionId, skill.trim(), category || 'Other');
    const summary = calculateSessionSummary(session);

    return res.status(200).json({
      success: true,
      isNew,
      skill: addedSkill,
      session,
      claimedSkills: session.claimedSkills,
      summary,
      message: isNew 
        ? `Skill "${addedSkill.skill}" successfully added to claimed skills.`
        : `Skill "${addedSkill.skill}" already exists in candidate profile.`
    });
  } catch (err) {
    console.error('[Add Skill Error]:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to add skill.'
    });
  }
});

/**
 * POST /api/skills/evidence (and POST /api/skills/:skillId/evidence)
 * 
 * Submits evidence for a specific skill (e.g. Power BI, Java).
 * Supported evidence types:
 * - github_repo
 * - project_url
 * - portfolio
 * - file
 * - certificate
 * - demo_url
 * - other
 * 
 * Analyzes only the submitted evidence and updates ONLY that skill's status.
 * Reuses the existing verified candidate session without asking for GitHub URL again.
 */
router.post('/skills/evidence', evidenceUpload.single('file'), async (req, res) => {
  try {
    const { sessionId, skillId, skill, evidenceType, url, title, notes } = req.body || {};
    const uploadedFile = req.file;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required.'
      });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Verification session not found.'
      });
    }

    // PRIMARY identifier: skillId first, fallback to skill
    const targetIdentifier = skillId || skill;
    if (!targetIdentifier) {
      return res.status(400).json({
        success: false,
        error: 'Target skill ID or name is required.'
      });
    }

    const foundSkill = session.claimedSkills.find(
      s => s.id === targetIdentifier || s.skill.toLowerCase() === String(targetIdentifier).toLowerCase()
    );
    const targetSkillName = foundSkill ? foundSkill.skill : (skill || targetIdentifier);
    const targetSkillId = foundSkill ? foundSkill.id : targetIdentifier;

    const candidateName = req.body.candidateName ||
                          session.candidateName || 
                          session.resume?.name || 
                          session.identityVerification?.resumeIdentity?.name || 
                          session.identityVerification?.verifiedName || 
                          '';

    // Run deterministic skill-specific evidence analysis
    const analysis = await analyzeSkillEvidence({
      skill: targetSkillName,
      evidenceType: evidenceType || 'project_url',
      url: url || '',
      title: title || '',
      notes: notes || '',
      fileBuffer: uploadedFile?.buffer,
      filename: uploadedFile?.originalname,
      mimetype: uploadedFile?.mimetype,
      candidateName
    });

    // Update only this skill in session
    const { skill: updatedSkill, session: updatedSession } = updateSkillEvidence(
      sessionId,
      targetSkillId,
      analysis.evidenceItem
    );

    const summary = calculateSessionSummary(updatedSession);

    return res.status(200).json({
      success: true,
      skill: updatedSkill,
      session: updatedSession,
      evidence: analysis.evidenceItem,
      evidenceItem: analysis.evidenceItem,
      skillStatus: updatedSkill.status,
      claimedSkills: updatedSession.claimedSkills,
      summary,
      message: analysis.explanation
    });
  } catch (err) {
    console.error('[Evidence Submission Error]:', err);
    return res.status(400).json({
      success: false,
      error: err.message || 'Evidence submission failed.'
    });
  }
});

// Alias for REST-style endpoint /api/skills/:skillId/evidence
router.post('/skills/:skillId/evidence', evidenceUpload.single('file'), async (req, res) => {
  req.body = req.body || {};
  req.body.skillId = req.params.skillId;
  
  try {
    const { sessionId, skillId, skill, evidenceType, url, title, notes } = req.body;
    const uploadedFile = req.file;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required.' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Verification session not found.' });
    }

    // PRIMARY identifier: skillId first, fallback to skill
    const targetIdentifier = skillId || skill;
    const foundSkill = session.claimedSkills.find(
      s => s.id === targetIdentifier || s.skill.toLowerCase() === String(targetIdentifier).toLowerCase()
    );
    const targetSkillName = foundSkill ? foundSkill.skill : (skill || targetIdentifier);
    const targetSkillId = foundSkill ? foundSkill.id : targetIdentifier;

    const candidateName = req.body.candidateName ||
                          session.candidateName || 
                          session.resume?.name || 
                          session.identityVerification?.resumeIdentity?.name || 
                          session.identityVerification?.verifiedName || 
                          '';

    const analysis = await analyzeSkillEvidence({
      skill: targetSkillName,
      evidenceType: evidenceType || 'project_url',
      url: url || '',
      title: title || '',
      notes: notes || '',
      fileBuffer: uploadedFile?.buffer,
      filename: uploadedFile?.originalname,
      mimetype: uploadedFile?.mimetype,
      candidateName
    });

    const { skill: updatedSkill, session: updatedSession } = updateSkillEvidence(
      sessionId,
      targetSkillId,
      analysis.evidenceItem
    );

    const summary = calculateSessionSummary(updatedSession);

    return res.status(200).json({
      success: true,
      skill: updatedSkill,
      session: updatedSession,
      evidence: analysis.evidenceItem,
      evidenceItem: analysis.evidenceItem,
      skillStatus: updatedSkill.status,
      claimedSkills: updatedSession.claimedSkills,
      summary,
      message: analysis.explanation
    });
  } catch (err) {
    console.error('[Evidence Submission Error]:', err);
    return res.status(400).json({ success: false, error: err.message || 'Evidence submission failed.' });
  }
});

/**
 * DELETE /api/skills/:skillId
 * (and DELETE /api/skills)
 * 
 * Deletes a manually added skill and all its evidence from the authoritative session.
 * 
 * Response:
 * {
 *   "success": true,
 *   "deletedSkill": { ... },
 *   "session": { ... }
 * }
 */
router.delete(['/skills/:skillId', '/skills'], (req, res) => {
  try {
    const skillId = req.params.skillId || req.body?.skillId || req.body?.skill || req.query?.skillId || req.query?.skill;
    const sessionId = req.body?.sessionId || req.query?.sessionId || req.headers['x-session-id'];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required to delete a skill.'
      });
    }

    if (!skillId) {
      return res.status(400).json({
        success: false,
        error: 'Skill ID or name is required.'
      });
    }

    const { session, deletedSkill } = deleteSkillFromSession(sessionId, skillId);
    const summary = calculateSessionSummary(session);

    return res.status(200).json({
      success: true,
      deletedSkill,
      session,
      summary,
      message: `Skill "${deletedSkill.skill}" was successfully deleted.`
    });
  } catch (err) {
    const message = err.message || 'Failed to delete skill.';
    const statusCode = message.includes('not found') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      error: message
    });
  }
});

/**
 * GET /api/session/:sessionId
 * 
 * Returns the current candidate verification session state.
 */
router.get('/session/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found or expired.'
    });
  }

  const summary = calculateSessionSummary(session);
  return res.status(200).json({
    success: true,
    session,
    candidateVerificationSession: session,
    summary
  });
});

export default router;
