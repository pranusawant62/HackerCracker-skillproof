/**
 * SkillProof Skill Micro-Task Assessment Generator
 * 
 * Generates practical, 100% skill-specific assessments for technical skills.
 * Guarantees:
 * - Exactly 5 questions per assessment
 * - 100% skill-isolated (no cross-contamination: Firebase produces Firebase, Docker produces Docker, etc.)
 * - Progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard)
 * - Safe sanitization for client (answer keys and internal evaluation patterns stripped)
 * - Extensible architecture supporting all 58 canonical skills and dynamic future skills
 */

import { 
  getQuestionsForSkill, 
  getAllSupportedSkills, 
  registerSkillQuestions, 
  resolveAssessmentSkillName,
  generateDynamicSkillQuestions 
} from './assessment/questionBank/index.js';

export { 
  getAllSupportedSkills, 
  registerSkillQuestions, 
  resolveAssessmentSkillName,
  generateDynamicSkillQuestions 
};

/**
 * Generates a full skill assessment for a target skill.
 * 
 * @param {string} skill - Target skill name
 * @param {string} [difficulty='intermediate'] - Assessment difficulty
 * @returns {object} Assessment object with questions and server-side answer keys
 */
export function generateSkillAssessment(skill, difficulty = 'intermediate') {
  if (!skill || typeof skill !== 'string' || !skill.trim()) {
    throw new Error('Valid skill name is required to generate an assessment.');
  }

  const cleanSkill = skill.trim();
  const { canonicalSkill, questions } = getQuestionsForSkill(cleanSkill);

  // Strict backend validation:
  // 1. Exactly 5 questions
  if (!Array.isArray(questions) || questions.length !== 5) {
    throw new Error(`Assessment generation failed: expected exactly 5 questions for ${canonicalSkill}, received ${questions?.length || 0}.`);
  }

  // 2. Skill integrity: every question must match canonicalSkill
  for (const q of questions) {
    if (q.skill.toLowerCase() !== canonicalSkill.toLowerCase()) {
      throw new Error(`Integrity violation: selected skill "${canonicalSkill}" does not match question skill "${q.skill}".`);
    }
  }

  const assessmentId = `asmt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    assessmentId,
    skill: canonicalSkill,
    difficulty: difficulty || 'intermediate',
    estimatedTime: '10 minutes',
    estimatedTimeMinutes: 10,
    passingScore: 70,
    maxScore: 100,
    totalQuestions: 5,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    status: 'in_progress',
    questions: questions.map((q, idx) => ({
      ...q,
      questionNumber: idx + 1,
      skill: canonicalSkill
    }))
  };
}

/**
 * Sanitizes an assessment for sending to the frontend.
 * Expected answers, internal evaluation criteria, regex patterns, and secret keys
 * are strictly stripped before returning to client.
 * 
 * @param {object} assessment 
 * @returns {object} Client-safe assessment
 */
export function sanitizeAssessmentForClient(assessment) {
  if (!assessment) return null;

  return {
    assessmentId: assessment.assessmentId,
    sessionId: assessment.sessionId,
    skill: assessment.skill,
    difficulty: assessment.difficulty,
    estimatedTime: assessment.estimatedTime || '10 minutes',
    estimatedTimeMinutes: assessment.estimatedTimeMinutes || 10,
    passingScore: assessment.passingScore || 70,
    maxScore: assessment.maxScore || 100,
    totalQuestions: assessment.questions ? assessment.questions.length : 5,
    status: assessment.status || 'in_progress',
    questions: (assessment.questions || []).map((q, idx) => ({
      id: q.id,
      skill: q.skill,
      questionNumber: q.questionNumber || (idx + 1),
      type: q.type,
      difficulty: q.difficulty,
      question: q.question,
      starterCode: q.starterCode || null,
      options: Array.isArray(q.options) 
        ? q.options.map(opt => typeof opt === 'object' && opt !== null ? opt.text : opt)
        : null,
      points: q.points || 20
    }))
  };
}
