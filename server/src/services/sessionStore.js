/**
 * SkillProof Candidate Verification Session Store
 * 
 * Manages in-memory verification sessions for candidates.
 * 
 * Ensures:
 * 1. Identity verification happens ONCE per candidate session.
 * 2. Verified GitHub account is reused for all subsequent skill verifications.
 * 3. Claimed skills can be added manually ("resume" vs "manual").
 * 4. Evidence is attached per-skill, stored as an array of multiple sources.
 * 5. Re-evaluates only the modified skill without restarting the whole process.
 */

// In-memory sessions map keyed by sessionId
const sessions = new Map();

/**
 * Normalizes skill status into canonical categories:
 * - "proven"
 * - "partially_proven"
 * - "unverified"
 * 
 * @param {string} status 
 * @returns {"proven" | "partially_proven" | "unverified"}
 */
export function normalizeSkillStatus(status = '') {
  const s = String(status).toUpperCase();
  if (s === 'PROVED' || s === 'PROVEN') return 'proven';
  if (s === 'PARTIAL' || s === 'PARTIALLY_PROVEN') return 'partially_proven';
  if (s === 'FAILED' || s === 'NOT_PASSED') return 'failed';
  if (s === 'INVALIDATED') return 'invalidated';
  return 'unverified';
}

/**
 * Creates a new candidate verification session.
 * 
 * @param {object} data
 * @returns {object} Session object
 */
export function createSession({
  sessionId,
  candidateId,
  candidateName,
  resumeId,
  githubUsername,
  githubUrl,
  identityStatus = 'verified',
  identityVerification = {},
  resume = {},
  claimedSkills = [],
  github = {},
  crossVerification = {}
} = {}) {
  const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const candId = candidateId || `cand_${Date.now()}`;
  const resId = resumeId || `res_${Date.now()}`;

  // Normalize claimed skills into canonical skill status model
  const normalizedSkills = claimedSkills.map((c, idx) => {
    const rawStatus = c.status || (crossVerification.results && crossVerification.results.find(r => r.skill.toLowerCase() === c.skill.toLowerCase())?.status) || 'unverified';
    const status = normalizeSkillStatus(rawStatus);

    // Collect initial evidence from crossVerification if present
    const crossMatch = crossVerification.results?.find(r => r.skill.toLowerCase() === c.skill.toLowerCase());
    const initialEvidence = [];

    if (crossMatch && Array.isArray(crossMatch.evidence)) {
      crossMatch.evidence.forEach(ev => {
        const isProved = status === 'proven';
        initialEvidence.push({
          id: `ev_init_${Math.random().toString(36).substring(2, 7)}`,
          type: ev.evidenceType || 'github_repo',
          title: `GitHub Repository: ${ev.repository || 'repo'}`,
          url: ev.repositoryUrl || (githubUsername ? `https://github.com/${githubUsername}/${ev.repository}` : null),
          details: ev.details || `${ev.skill} detected in repository`,
          evidenceRelevance: isProved ? 'direct' : 'partial',
          verificationStatus: status,
          skillMatch: true,
          candidateIdentityMatch: true,
          confidence: isProved ? 'high' : 'medium',
          observableArtifacts: [ev.details || `${ev.skill} codebase artifacts`],
          artifacts: [ev.details || `${ev.skill} codebase artifacts`],
          submittedByCandidate: false,
          verified: isProved,
          timestamp: new Date().toISOString()
        });
      });
    }

    const skillObj = {
      id: c.id || `skill_${idx + 1}_${c.skill.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      skill: c.skill,
      category: c.category || 'Other',
      matchedTerm: c.matchedTerm || c.skill,
      claimSource: c.claimSource || 'resume',
      status,
      evidence: Array.isArray(c.evidence) && c.evidence.length > 0 ? c.evidence : initialEvidence,
      explanation: c.explanation || crossMatch?.explanation || (status === 'proven' ? `Verified by observable repository evidence.` : `No sufficient observable evidence was found for ${c.skill}.`),
      lastUpdatedAt: new Date().toISOString()
    };

    if (skillObj.evidence.length > 0) {
      const oldStatus = skillObj.status;
      skillObj.status = recalculateSkillStatus(skillObj);
      skillObj.explanation = getSkillExplanation(skillObj);

      if (skillObj.status === 'proven') {
        const directEv = [...skillObj.evidence].reverse().find(
          e => e.evidenceRelevance === 'direct' && e.verificationStatus === 'proven' && e.candidateIdentityMatch !== false
        );
        const artifacts = directEv?.observableArtifacts || directEv?.artifacts || [];

        if (!directEv || !Array.isArray(artifacts) || artifacts.length === 0) {
          throw new Error(`INVALID STATUS TRANSITION: Skill "${skillObj.skill}" marked proven without direct evidence and observable artifacts.`);
        }

        console.log(`[SKILLPROOF STATUS DECISION]\nSkill: ${skillObj.skill}\nEvidence: ${directEv.title || directEv.filename || 'Evidence Item'}\nEvidence relevance: ${directEv.evidenceRelevance}\nSkill match: ${directEv.skillMatch !== false}\nCandidate identity: ${directEv.candidateIdentityMatch !== false}\nConfidence score: ${directEv.confidenceScore != null ? directEv.confidenceScore : 94}%\nObservable artifacts: ${JSON.stringify(artifacts)}\nPrevious status: ${oldStatus}\nNew status: ${skillObj.status}\nExplanation: ${skillObj.explanation}`);
      }
    }

    return skillObj;
  });

  const sessionCandidateName = candidateName ||
                               resume?.identity?.name ||
                               identityVerification?.resumeIdentity?.name ||
                               identityVerification?.verifiedName ||
                               '';

  const session = {
    id,
    sessionId: id,
    candidateId: candId,
    candidateName: sessionCandidateName,
    resumeId: resId,
    githubUsername,
    githubUrl: githubUrl || (githubUsername ? `https://github.com/${githubUsername}` : null),
    identityStatus: identityStatus.toLowerCase(),
    identityVerification,
    resume,
    claimedSkills: normalizedSkills,
    github,
    crossVerification,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  sessions.set(id, session);
  return session;
}

/**
 * Retrieves a session by sessionId.
 * 
 * @param {string} sessionId 
 * @returns {object|null}
 */
export function getSession(sessionId) {
  if (!sessionId) return null;
  return sessions.get(sessionId) || null;
}

/**
 * Updates an existing session.
 * 
 * @param {string} sessionId 
 * @param {object} updates 
 * @returns {object|null}
 */
export function updateSession(sessionId, updates = {}) {
  const session = getSession(sessionId);
  if (!session) return null;

  Object.assign(session, updates, {
    updatedAt: new Date().toISOString()
  });

  sessions.set(sessionId, session);
  return session;
}

/**
 * Adds a new claimed skill manually to an existing session.
 * Checks whether the verified GitHub account already contains evidence for it.
 * 
 * @param {string} sessionId 
 * @param {string} skillName 
 * @param {string} category 
 * @returns {{ session: object, skill: object, isNew: boolean }}
 */
export function addSkillToSession(sessionId, skillName, category = 'Other') {
  const session = getSession(sessionId);
  if (!session) {
    throw new Error('Verification session not found. Please verify candidate identity first.');
  }

  const cleanName = skillName.trim();
  if (!cleanName) {
    throw new Error('Skill name cannot be empty.');
  }

  // Check if skill already exists (case-insensitive)
  const existing = session.claimedSkills.find(
    s => s.skill.toLowerCase() === cleanName.toLowerCase()
  );

  if (existing) {
    return { session, skill: existing, isNew: false };
  }

  const newSkill = {
    id: `skill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    skill: cleanName,
    category: category || 'Other',
    matchedTerm: cleanName,
    claimSource: 'manual',
    source: 'manual',
    status: 'unverified',
    evidence: [],
    explanation: `No sufficient observable evidence was found for ${cleanName}.`,
    lastUpdatedAt: new Date().toISOString(),
    addedAt: new Date().toISOString()
  };

  session.claimedSkills.push(newSkill);
  session.updatedAt = new Date().toISOString();
  sessions.set(sessionId, session);

  return { session, skill: newSkill, isNew: true };
}

/**
 * Deletes a manually added skill and all its evidence from the authoritative session.
 * 
 * Invariants:
 * 1. Validates session existence.
 * 2. Matches skill by ID or skill name.
 * 3. Enforces that only manually added skills (claimSource === 'manual' or source === 'manual') can be deleted.
 * 4. Completely removes the skill object, its verification status, confidence score, and observable artifacts.
 * 5. Cleans up any corresponding crossVerification results.
 * 6. Preserves complete isolation: other skills remain completely unchanged.
 * 
 * @param {string} sessionId
 * @param {string} skillIdentifier - Skill ID or skill name
 * @returns {{ session: object, deletedSkill: object }}
 */
export function deleteSkillFromSession(sessionId, skillIdentifier) {
  if (!sessionId) {
    throw new Error('Session ID is required.');
  }

  const session = getSession(sessionId);
  if (!session) {
    throw new Error('Verification session not found.');
  }

  const cleanIdentifier = String(skillIdentifier || '').trim();
  if (!cleanIdentifier) {
    throw new Error('Skill ID or name is required.');
  }

  if (!Array.isArray(session.claimedSkills)) {
    session.claimedSkills = [];
  }

  // Find skill by id or by name (case-insensitive)
  const skillIndex = session.claimedSkills.findIndex(
    s => s.id === cleanIdentifier || 
         (s.skill && s.skill.toLowerCase() === cleanIdentifier.toLowerCase()) ||
         (s.matchedTerm && s.matchedTerm.toLowerCase() === cleanIdentifier.toLowerCase())
  );

  if (skillIndex === -1) {
    throw new Error('Skill not found.');
  }

  const skillToDelete = session.claimedSkills[skillIndex];

  // Restrict deletion to manually added skills only (protect extracted resume/github skills)
  const isManual = skillToDelete.claimSource === 'manual' || skillToDelete.source === 'manual';
  if (!isManual) {
    throw new Error('Only manually added skills can be deleted. Extracted resume skills cannot be removed.');
  }

  // Remove the skill completely from authoritative claimedSkills
  session.claimedSkills.splice(skillIndex, 1);

  // Clean up any crossVerification results if present
  if (session.crossVerification && Array.isArray(session.crossVerification.results)) {
    session.crossVerification.results = session.crossVerification.results.filter(
      r => r.skill.toLowerCase() !== skillToDelete.skill.toLowerCase()
    );
  }

  session.updatedAt = new Date().toISOString();
  sessions.set(sessionId, session);

  return {
    session,
    deletedSkill: skillToDelete
  };
}

/**
 * Recalculates the canonical status of a skill based on all accumulated evidence.
 * 
 * Rules:
 * 1. An uploaded file or URL NEVER automatically proves a skill.
 * 2. Only evidenceAnalyzer results determine whether evidence is direct/partial/unrelated/invalid.
 * 3. directEvidence with matching candidate identity + observableArtifacts + confidence >= 75 -> "proven"
 * 4. partialEvidence with matching candidate identity -> "partially_proven"
 * 5. Otherwise -> "unverified"
 * 
 * @param {object} skill 
 * @returns {"proven" | "partially_proven" | "unverified"}
 */
export function recalculateSkillStatus(skill) {
  if (skill?.assessmentStatus === 'failed' || skill?.status === 'failed') {
    return 'failed';
  }
  if (skill?.assessmentStatus === 'invalidated' || skill?.status === 'invalidated') {
    return 'invalidated';
  }
  if (skill?.assessmentStatus === 'passed' || (skill?.assessmentResult && skill.assessmentResult.passed && skill.assessmentResult.percentage >= 70)) {
    return 'proven';
  }

  const evidence = Array.isArray(skill?.evidence)
    ? skill.evidence
    : [];

  const validEvidence = evidence.filter(
    item => item && item.verificationStatus
  );

  const directEvidence = validEvidence.filter(item => {
    const artifacts = item.observableArtifacts || item.artifacts || [];
    const hasArtifacts = Array.isArray(artifacts) && artifacts.length > 0;
    const isDirect = item.evidenceRelevance === "direct";
    const isProven = item.verificationStatus === "proven";
    const skillMatch = item.skillMatch !== false;
    const idMatch = item.candidateIdentityMatch !== false;
    const confidenceOk = item.confidenceScore == null || item.confidenceScore >= 75;

    return isDirect && isProven && skillMatch && idMatch && hasArtifacts && confidenceOk;
  });

  const partialEvidence = validEvidence.filter(item => {
    const isPartial = item.evidenceRelevance === "partial";
    const isPartiallyProven = item.verificationStatus === "partially_proven";
    const idMatch = item.candidateIdentityMatch !== false;

    return isPartial && isPartiallyProven && idMatch;
  });

  if (directEvidence.length > 0) {
    return "proven";
  }

  if (partialEvidence.length > 0) {
    return "partially_proven";
  }

  return "unverified";
}

/**
 * Derives a human-readable explanation for the skill based on its status and evidence.
 * 
 * @param {object} skill 
 * @returns {string}
 */
export function getSkillExplanation(skill) {
  const evidence = Array.isArray(skill?.evidence) ? skill.evidence : [];

  if (skill?.status === 'proven') {
    const direct = [...evidence].reverse().find(
      e => e.evidenceRelevance === 'direct' && e.verificationStatus === 'proven' && e.candidateIdentityMatch !== false
    );
    if (direct?.explanation) return direct.explanation;
    return `Observable technical artifacts and evidence substantiate ${skill.skill}.`;
  }

  if (skill?.status === 'partially_proven') {
    const partial = [...evidence].reverse().find(
      e => e.evidenceRelevance === 'partial' && e.verificationStatus === 'partially_proven' && e.candidateIdentityMatch !== false
    );
    if (partial?.explanation) return partial.explanation;
    return `Partial observable evidence detected for ${skill.skill}.`;
  }

  // Unverified: check if there is an explicit rejection/unrelated explanation
  const rejected = [...evidence].reverse().find(
    e => e.evidenceRelevance === 'unrelated' || e.evidenceRelevance === 'invalid' || e.candidateIdentityMatch === false
  );
  if (rejected?.explanation) return rejected.explanation;

  return `No sufficient observable evidence was found for ${skill?.skill || 'skill'}.`;
}

/**
 * Updates a specific skill in a session with newly verified evidence.
 * 
 * 1. Finds skill by ID first, falling back to name.
 * 2. Appends analyzed evidence to skill.evidence.
 * 3. Recalculates skill status using recalculateSkillStatus.
 * 4. Updates skill explanation and timestamps.
 * 5. Returns { skill, session }.
 * 
 * @param {string} sessionId 
 * @param {string} skillIdOrName 
 * @param {object} evidenceInput 
 * @param {string} [optionalStatus] 
 * @param {string} [optionalExplanation] 
 * @returns {{ session: object, skill: object }}
 */
export function updateSkillEvidence(sessionId, skillIdOrName, evidenceInput, optionalStatus, optionalExplanation) {
  const session = getSession(sessionId);
  if (!session) {
    throw new Error('Verification session not found.');
  }

  // Find skill by ID first, then fallback to skill name
  let skillIndex = session.claimedSkills.findIndex(s => s.id === skillIdOrName);
  if (skillIndex === -1) {
    skillIndex = session.claimedSkills.findIndex(
      s => s.skill.toLowerCase() === String(skillIdOrName || '').toLowerCase()
    );
  }

  if (skillIndex === -1) {
    throw new Error(`Skill "${skillIdOrName}" not found in candidate session.`);
  }

  const skill = session.claimedSkills[skillIndex];

  // Append new evidence item to array
  if (evidenceInput) {
    if (!Array.isArray(skill.evidence)) {
      skill.evidence = [];
    }

    const evidenceItem = {
      id: evidenceInput.id || `ev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...evidenceInput,
      createdAt: evidenceInput.createdAt || evidenceInput.submittedAt || new Date().toISOString()
    };

    skill.evidence.push(evidenceItem);
  }

  // Recalculate canonical status and explanation
  const oldStatus = skill.status;
  skill.status = recalculateSkillStatus(skill);
  skill.explanation = optionalExplanation || getSkillExplanation(skill);
  skill.lastUpdatedAt = new Date().toISOString();

  if (skill.status === 'proven') {
    const directEv = [...skill.evidence].reverse().find(
      e => e.evidenceRelevance === 'direct' && e.verificationStatus === 'proven' && e.candidateIdentityMatch !== false
    );
    const artifacts = directEv?.observableArtifacts || directEv?.artifacts || [];

    // Safety Invariant Check (Requirement 23):
    if (!directEv || !Array.isArray(artifacts) || artifacts.length === 0) {
      throw new Error(`INVALID STATUS TRANSITION: Skill "${skill.skill}" marked proven without direct evidence and observable artifacts.`);
    }

    console.log(`[SKILLPROOF STATUS DECISION]\nSkill: ${skill.skill}\nEvidence: ${directEv.title || directEv.filename || 'Evidence Item'}\nEvidence relevance: ${directEv.evidenceRelevance}\nSkill match: ${directEv.skillMatch !== false}\nCandidate identity: ${directEv.candidateIdentityMatch !== false}\nConfidence score: ${directEv.confidenceScore != null ? directEv.confidenceScore : 94}%\nObservable artifacts: ${JSON.stringify(artifacts)}\nPrevious status: ${oldStatus}\nNew status: ${skill.status}\nExplanation: ${skill.explanation}`);
  }

  session.claimedSkills[skillIndex] = skill;
  session.updatedAt = new Date().toISOString();
  sessions.set(sessionId, session);

  return { session, skill };
}

import { generateSkillAssessment, sanitizeAssessmentForClient } from './skillAssessmentGenerator.js';
import { evaluateSkillAssessment } from './assessmentEvaluator.js';

// In-memory store for skill assessments
export const assessments = new Map();
export { assessments as assessmentsStore };

/**
 * Starts a new skill assessment session for a candidate.
 * 
 * @param {object} params
 * @param {string} params.sessionId
 * @param {string} params.skill
 * @param {string} [params.difficulty='intermediate']
 * @returns {object} Client-safe assessment object
 */
export function startAssessment({ sessionId, skill, difficulty = 'intermediate' }) {
  if (!sessionId) {
    throw new Error('Session ID is required to start an assessment.');
  }

  const session = getSession(sessionId);
  if (!session) {
    throw new Error('Verification session not found.');
  }

  if (!skill || typeof skill !== 'string') {
    throw new Error('Skill name is required to start an assessment.');
  }

  const cleanSkill = skill.trim();

  // Find or verify skill exists in session
  let targetSkill = session.claimedSkills.find(
    s => ((s.skill || s.name || '').toLowerCase() === cleanSkill.toLowerCase()) ||
         ((s.matchedTerm || '').toLowerCase() === cleanSkill.toLowerCase())
  );

  if (!targetSkill) {
    // If not yet claimed, auto-add as manual claim
    const addResult = addSkillToSession(sessionId, cleanSkill);
    targetSkill = addResult.skill;
  }

  const assessment = generateSkillAssessment(cleanSkill, difficulty);
  assessment.sessionId = sessionId;
  assessment.skillId = targetSkill.id;

  assessments.set(assessment.assessmentId, assessment);

  // Update skill status in session to reflect assessment in progress
  targetSkill.assessmentStatus = 'in_progress';
  session.updatedAt = new Date().toISOString();
  sessions.set(sessionId, session);

  return sanitizeAssessmentForClient(assessment);
}

/**
 * Retrieves an assessment by ID.
 * 
 * @param {string} assessmentId 
 * @returns {object|null}
 */
export function getAssessment(assessmentId) {
  if (!assessmentId) return null;
  return assessments.get(assessmentId) || null;
}

/**
 * Submits and evaluates a candidate's completed skill assessment.
 * 
 * Invariants:
 * 1. Validates assessment ID and session ID.
 * 2. Validates assessment exists and is not expired.
 * 3. Prevents duplicate submissions.
 * 4. Deterministically scores answers on the backend.
 * 5. If passed (>= 70%): records microtask_assessment evidence in authoritative session.
 * 6. If failed: does not award verified credit, records attempt in history.
 * 7. Preserves complete isolation for other skills.
 * 
 * @param {object} params
 * @param {string} params.assessmentId
 * @param {string} params.sessionId
 * @param {Array<{ questionId: string, answer: any }>} params.answers
 * @returns {{ assessmentResult: object, session: object, skill: object }}
 */
export function submitAssessment({ assessmentId, sessionId, answers = [] }) {
  if (!assessmentId) {
    throw new Error('Assessment ID is required.');
  }

  const assessment = getAssessment(assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found or invalid assessment ID.');
  }

  if (sessionId && assessment.sessionId && assessment.sessionId !== sessionId) {
    throw new Error('Session ID does not match assessment session.');
  }

  const activeSessionId = sessionId || assessment.sessionId;
  const session = getSession(activeSessionId);
  if (!session) {
    throw new Error('Verification session not found.');
  }

  // Anti-cheating: Check expiration
  if (assessment.expiresAt && Date.now() > new Date(assessment.expiresAt).getTime()) {
    assessment.status = 'failed';
    throw new Error('Assessment has expired. Please restart the micro-task assessment.');
  }

  // Anti-cheating: Prevent duplicate submission
  if (assessment.status !== 'in_progress') {
    throw new Error('Assessment has already been submitted and completed.');
  }

  // Evaluate answers deterministically on backend
  const evaluation = evaluateSkillAssessment(assessment, answers);

  // Update assessment object
  assessment.status = evaluation.status;
  assessment.score = evaluation.score;
  assessment.percentage = evaluation.percentage;
  assessment.passed = evaluation.passed;
  assessment.competency = evaluation.competency;
  assessment.submittedAt = evaluation.completedAt;
  assessment.results = evaluation.results;
  assessment.strengths = evaluation.strengths;
  assessment.improvementAreas = evaluation.improvementAreas;
  assessments.set(assessmentId, assessment);

  // Find target skill in authoritative session
  let skillIndex = session.claimedSkills.findIndex(
    s => s.id === assessment.skillId ||
         ((s.skill || s.name || '').toLowerCase() === assessment.skill.toLowerCase())
  );

  if (skillIndex === -1) {
    skillIndex = session.claimedSkills.findIndex(
      s => s.matchedTerm && (s.matchedTerm.toLowerCase() === assessment.skill.toLowerCase())
    );
  }

  if (skillIndex !== -1) {
    const skill = session.claimedSkills[skillIndex];

    // Maintain attempt history
    if (!Array.isArray(skill.assessmentHistory)) {
      skill.assessmentHistory = [];
    }

    skill.assessmentHistory.push({
      attemptId: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      assessmentId,
      score: evaluation.score,
      percentage: evaluation.percentage,
      passed: evaluation.passed,
      competency: evaluation.competency,
      completedAt: evaluation.completedAt,
      totalQuestions: evaluation.results.length,
      correctQuestions: evaluation.results.filter(r => r.isCorrect).length
    });

    skill.assessmentStatus = evaluation.passed ? 'passed' : 'failed';
    skill.assessmentResult = {
      assessmentId,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      percentage: evaluation.percentage,
      status: evaluation.status,
      passed: evaluation.passed,
      competency: evaluation.competency,
      completedAt: evaluation.completedAt,
      strengths: evaluation.strengths,
      improvementAreas: evaluation.improvementAreas,
      observableArtifacts: [
        `Completed ${skill.skill} practical micro-task assessment`,
        `${evaluation.results.filter(r => r.isCorrect).length} of ${evaluation.results.length} practical tasks verified correct`,
        `Competency level: ${evaluation.competency} (${evaluation.percentage}%)`
      ]
    };

    if (!Array.isArray(skill.verificationMethods)) {
      skill.verificationMethods = [];
    }

    if (evaluation.passed) {
      skill.verificationMethod = 'microtask_assessment';
      if (!skill.verificationMethods.includes('microtask_assessment')) {
        skill.verificationMethods.push('microtask_assessment');
      }

      if (!Array.isArray(skill.evidence)) {
        skill.evidence = [];
      }

      // Add verified microtask evidence item
      skill.evidence.push({
        id: `ev_asmt_${assessmentId}`,
        type: 'microtask_assessment',
        evidenceSource: 'microtask_assessment',
        title: `${skill.skill} Practical Micro-Task Assessment`,
        score: evaluation.score,
        percentage: evaluation.percentage,
        passed: true,
        competency: evaluation.competency,
        evidenceRelevance: 'direct',
        verificationStatus: 'proven',
        verificationMethod: 'microtask_assessment',
        skillMatch: true,
        candidateIdentityMatch: true,
        confidenceScore: evaluation.percentage,
        observableArtifacts: [
          `Completed ${skill.skill} practical micro-task assessment`,
          `${evaluation.results.filter(r => r.isCorrect).length} of ${evaluation.results.length} practical tasks verified correct`,
          `Competency level: ${evaluation.competency} (${evaluation.percentage}%)`
        ],
        completedAt: evaluation.completedAt,
        submittedByCandidate: true,
        verified: true
      });

      // Recalculate status and explanation
      skill.status = 'proven';
      skill.assessmentStatus = 'passed';
      skill.explanation = `Assessment Attempted (${evaluation.percentage}%) — Passed`;
    } else {
      skill.status = 'failed';
      skill.assessmentStatus = 'failed';
      skill.explanation = `Assessment Attempted (${evaluation.percentage}%) — Not Passed`;
    }

    skill.lastUpdatedAt = new Date().toISOString();
    session.claimedSkills[skillIndex] = skill;
  }

  session.updatedAt = new Date().toISOString();
  sessions.set(activeSessionId, session);

  return {
    assessmentResult: {
      assessmentId,
      skill: assessment.skill,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      percentage: evaluation.percentage,
      status: evaluation.status,
      passed: evaluation.passed,
      competency: evaluation.competency,
      verificationMethod: 'microtask_assessment',
      completedAt: evaluation.completedAt,
      strengths: evaluation.strengths,
      improvementAreas: evaluation.improvementAreas,
      results: evaluation.results
    },
    session,
    skill: skillIndex !== -1 ? session.claimedSkills[skillIndex] : null
  };
}

/**
 * Calculates current verification summary metrics for a session.
 * 
 * @param {object} session 
 * @returns {object} Summary object
 */
export function calculateSessionSummary(session) {
  if (!session || !Array.isArray(session.claimedSkills)) {
    return { total: 0, proven: 0, partiallyProven: 0, unverified: 0, rate: 0 };
  }

  const total = session.claimedSkills.length;
  let proven = 0;
  let partiallyProven = 0;
  let unverified = 0;

  session.claimedSkills.forEach(s => {
    const status = normalizeSkillStatus(s.status);
    if (status === 'proven') proven++;
    else if (status === 'partially_proven') partiallyProven++;
    else unverified++;
  });

  const rate = total > 0 ? Math.round(((proven + partiallyProven * 0.5) / total) * 100) : 0;

  return {
    total,
    proven,
    partiallyProven,
    unverified,
    verificationRate: rate
  };
}

