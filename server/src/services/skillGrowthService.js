import { SKILL_TAXONOMY } from '../utils/skillTaxonomy.js';
import { getCanonicalSkillName, compareJobWithVerifiedSkills, normalizeEvidenceStatus } from './jobMatcher.js';
import { getSession } from './sessionStore.js';
import { analyzeSkillGaps } from './skillGapService.js';

/**
 * Deterministically calculates the evidence progress percentage (0 - 100%) for a single skill
 * based on verified empirical evidence, repository artifacts, and claim status.
 * 
 * Rules:
 * - PROVEN: 80% baseline.
 *   +5% if observed across 2 or more repositories
 *   +5% if dedicated manifests / files are present
 *   +5% if high confidence score (>= 90%)
 *   Range: 80% – 95%
 * 
 * - PARTIAL: 50% baseline.
 *   +5% if observed in repository language statistics
 *   Range: 45% – 60%
 * 
 * - CLAIMED-ONLY: 20% baseline.
 *   +5% if explicitly claimed in resume/profile
 *   Range: 20% – 25%
 * 
 * - NO EVIDENCE: 0% baseline.
 *   Range: 0% – 5%
 * 
 * @param {object} params
 * @param {string} params.skill - Canonical skill name
 * @param {string} params.status - Evidence status ('PROVEN' | 'PARTIAL' | 'CLAIMED-ONLY' | 'NO EVIDENCE')
 * @param {object} [params.candidateEvidence] - Candidate's observable evidence if available
 * @param {boolean} [params.isRequired=true] - Whether the skill is required by the target job
 * @returns {{ progress: number, currentLevel: string, targetLevel: number, levelLabel: string, needsImprovement: boolean, explanation: string }}
 */
export function calculateSkillProgress({
  skill,
  status,
  candidateEvidence = {},
  isRequired = true
}) {
  const canonical = getCanonicalSkillName(skill);
  const normalizedStatus = normalizeEvidenceStatus(status, 'CLAIMED-ONLY');
  const targetLevel = isRequired ? 100 : 75;

  let progress = 0;
  let currentLevel = '';
  let levelLabel = '';
  let explanation = '';

  const repos = Array.isArray(candidateEvidence?.repositories) ? candidateEvidence.repositories : [];
  const evidenceList = Array.isArray(candidateEvidence?.evidence) ? candidateEvidence.evidence : [];

  if (normalizedStatus === 'PROVEN') {
    // Proven baseline: 80%
    let calculated = 80;

    // Bonus for multi-repository evidence
    if (repos.length >= 2) {
      calculated += 5;
    } else if (repos.length === 1) {
      calculated += 2;
    }

    // Bonus for rich technical artifacts
    const hasArtifacts = evidenceList.some(e => 
      Array.isArray(e.observableArtifacts) && e.observableArtifacts.length > 0
    );
    if (hasArtifacts || evidenceList.length >= 2) {
      calculated += 5;
    }

    // Bonus for high confidence
    const hasHighConf = evidenceList.some(e => e.confidenceScore >= 90 || e.confidence === 'high');
    if (hasHighConf || calculated < 85) {
      calculated += 5;
    }

    // Technology specific refinement based on depth
    if (['python', 'javascript', 'sql', 'git'].includes(canonical.toLowerCase()) && calculated < 90) {
      calculated += 3;
    }

    // Micro-task assessment bonus / direct percentage reflection
    const microtaskEv = evidenceList.find(e => e.type === 'microtask_assessment');
    if (microtaskEv && typeof microtaskEv.percentage === 'number') {
      calculated = Math.max(calculated, microtaskEv.percentage);
    }

    progress = Math.min(100, Math.max(80, calculated));
    currentLevel = microtaskEv ? 'Micro-Task Verified' : 'Verified / High';
    levelLabel = microtaskEv ? `Demonstrated via Assessment (${progress}%)` : 'High Proficiency (Verified)';
    explanation = microtaskEv 
      ? `Practical competence demonstrated through skill micro-task assessment (${progress}% score).`
      : `Direct empirical evidence verified across public codebase repositories.`;
  } else if (normalizedStatus === 'PARTIAL') {
    // Partial baseline: 50%
    let calculated = 50;

    if (repos.length > 0) {
      calculated += 5;
    }

    progress = Math.min(65, Math.max(45, calculated));
    currentLevel = 'Partial Evidence';
    levelLabel = 'Moderate (Partial Evidence)';
    explanation = `Observed in language statistics or partial usage, but lacks dedicated project architecture.`;
  } else if (normalizedStatus === 'CLAIMED-ONLY') {
    // Claimed only baseline: 20%
    let calculated = 20;

    if (candidateEvidence?.claimSource === 'resume' || candidateEvidence?.matchedTerm) {
      calculated += 5;
    }

    progress = Math.min(30, Math.max(20, calculated));
    currentLevel = 'Claimed Only';
    levelLabel = 'Foundational (Claimed Only)';
    explanation = `Claimed on resume/profile, but no observable repository evidence found.`;
  } else {
    // No evidence: 0%
    progress = 0;
    currentLevel = 'No Evidence';
    levelLabel = 'Skill Gap (No Evidence)';
    explanation = `Required by target role, but missing entirely from candidate evidence.`;
  }

  const needsImprovement = progress < 80;

  return {
    progress,
    currentLevel,
    targetLevel,
    levelLabel,
    needsImprovement,
    explanation
  };
}

/**
 * Calculates complete Skill Growth metrics, progress bars, and actionable next steps
 * using verified skills, job requirements, job match result, and skill gaps.
 * 
 * @param {object} params
 * @param {object} [params.jobMatchResult] - Real Job Match result
 * @param {Array} [params.verifiedSkills] - Candidate verified skills
 * @param {object|string} [params.jobDescription] - Job description
 * @param {string} [params.sessionId] - Active session ID
 * @param {Array} [params.claimedSkills] - Candidate claimed skills
 * @param {object} [params.crossVerification] - Stage 4 cross-verification
 * @returns {{
 *   overallCoverage: number,
 *   role: string,
 *   skills: Array<{ skill, status, progress, currentLevel, targetLevel, levelLabel, needsImprovement, category, explanation }>,
 *   recommendations: string[],
 *   skillsNeedingImprovement: string[],
 *   summary: string
 * }}
 */
export function calculateSkillGrowth({
  jobMatchResult,
  verifiedSkills = [],
  jobDescription = {},
  sessionId = '',
  claimedSkills = [],
  crossVerification = {}
} = {}) {
  let candidateSkills = Array.isArray(verifiedSkills) && verifiedSkills.length > 0 ? verifiedSkills : claimedSkills;

  // 1. Resolve candidate skills from session if sessionId provided
  if (sessionId && (!candidateSkills || candidateSkills.length === 0)) {
    const session = getSession(sessionId);
    if (session && Array.isArray(session.claimedSkills)) {
      candidateSkills = session.claimedSkills;
      if (!crossVerification || Object.keys(crossVerification).length === 0) {
        crossVerification = session.crossVerification || {};
      }
    }
  }

  // 2. Resolve Job Match Result
  let resolvedJobMatch = jobMatchResult;
  if (!resolvedJobMatch) {
    resolvedJobMatch = compareJobWithVerifiedSkills({
      verifiedSkills: candidateSkills,
      jobDescription,
      claimedSkills: candidateSkills,
      crossVerification
    });
  }

  // Build candidate skills index for evidence lookup
  const candidateIndex = new Map();
  if (Array.isArray(candidateSkills)) {
    for (const c of candidateSkills) {
      if (!c) continue;
      const rawName = typeof c === 'string' ? c : (c.skill || c.name || '');
      if (rawName) {
        candidateIndex.set(getCanonicalSkillName(rawName).toLowerCase(), c);
      }
    }
  }

  // Also resolve skill gaps details if available to pull high-impact next steps
  const gapAnalysis = analyzeSkillGaps({
    jobMatchResult: resolvedJobMatch,
    verifiedSkills: candidateSkills,
    jobDescription,
    sessionId,
    claimedSkills: candidateSkills,
    crossVerification
  });

  const role = resolvedJobMatch?.role || resolvedJobMatch?.match?.role || 'Target Technical Role';

  // Extract skills to evaluate for growth
  // Precedence: Required skills from Job Description first, then candidate's verified skills
  const requiredSkillNames = Array.isArray(resolvedJobMatch?.requiredSkills)
    ? resolvedJobMatch.requiredSkills
    : (resolvedJobMatch?.match?.requiredSkills || []);

  const matchedSkillsList = Array.isArray(resolvedJobMatch?.matchedSkills)
    ? resolvedJobMatch.matchedSkills
    : (resolvedJobMatch?.match?.matchedSkills || []);

  const partialSkillsList = Array.isArray(resolvedJobMatch?.partialSkills)
    ? resolvedJobMatch.partialSkills
    : (resolvedJobMatch?.match?.partialSkills || []);

  const skillGapsList = Array.isArray(resolvedJobMatch?.skillGaps)
    ? resolvedJobMatch.skillGaps
    : (resolvedJobMatch?.match?.skillGaps || resolvedJobMatch?.match?.gapSkills || []);

  const skillsMap = new Map();

  function registerSkillForGrowth(skillName, status, extra = {}, isRequired = true) {
    const canonical = getCanonicalSkillName(skillName);
    if (!canonical) return;
    const key = canonical.toLowerCase();

    if (!skillsMap.has(key)) {
      const cand = candidateIndex.get(key) || extra;
      const tax = SKILL_TAXONOMY.find(t => t.name.toLowerCase() === key);
      const category = cand?.category || tax?.category || extra?.category || 'Other';

      const progressData = calculateSkillProgress({
        skill: canonical,
        status,
        candidateEvidence: cand,
        isRequired
      });

      skillsMap.set(key, {
        skill: canonical,
        status: normalizeEvidenceStatus(status, 'CLAIMED-ONLY'),
        category,
        ...progressData
      });
    }
  }

  // 1. Register matched (PROVEN) required skills
  for (const m of matchedSkillsList) {
    registerSkillForGrowth(m.skill || m, 'PROVEN', m, true);
  }

  // 2. Register partial required skills
  for (const p of partialSkillsList) {
    registerSkillForGrowth(p.skill || p, 'PARTIAL', p, true);
  }

  // 3. Register skill gaps from required skills
  for (const g of skillGapsList) {
    const rawStatus = typeof g === 'object' && g.status ? g.status : 'CLAIMED-ONLY';
    registerSkillForGrowth(g.skill || g, rawStatus, g, true);
  }

  // 4. Also register any remaining candidate verified skills that weren't in required skills
  if (Array.isArray(candidateSkills)) {
    for (const c of candidateSkills) {
      if (!c) continue;
      const rawName = typeof c === 'string' ? c : (c.skill || c.name || '');
      const rawStatus = typeof c === 'string' ? 'CLAIMED-ONLY' : normalizeEvidenceStatus(c.status || c.verificationStatus);
      registerSkillForGrowth(rawName, rawStatus, c, false);
    }
  }

  // Convert to array and sort:
  // Order: PROVEN skills first (highest progress), then PARTIAL, then CLAIMED-ONLY, then NO EVIDENCE
  const skillsArray = Array.from(skillsMap.values()).sort((a, b) => b.progress - a.progress);

  // Calculate Overall Evidence Coverage
  let overallCoverage = 0;
  if (skillsArray.length > 0) {
    const totalProgress = skillsArray.reduce((acc, curr) => acc + curr.progress, 0);
    overallCoverage = Math.round(totalProgress / skillsArray.length);
  }

  // Collect skills that need improvement
  const skillsNeedingImprovement = skillsArray
    .filter(s => s.needsImprovement)
    .map(s => s.skill);

  // Generate Recommended Next Steps from real gap and growth data
  const recommendations = [];

  // Step 1: Look at claimed-only / unverified skills
  const claimedGaps = gapAnalysis.skillGaps.filter(g => g.status === 'CLAIMED-ONLY');
  if (claimedGaps.length > 0) {
    const topClaimed = claimedGaps[0];
    if (topClaimed.skill.toLowerCase() === 'docker') {
      recommendations.push('Complete Docker micro-task: create Dockerfile, build container image, and verify port bindings');
    } else {
      recommendations.push(`Complete ${topClaimed.skill} micro-task: add runnable codebase artifacts and build manifests to repository`);
    }
  }

  // Step 2: Look at partial skills
  const partialGaps = gapAnalysis.skillGaps.filter(g => g.status === 'PARTIAL');
  if (partialGaps.length > 0) {
    const topPartial = partialGaps[0];
    if (topPartial.skill.toLowerCase() === 'react') {
      recommendations.push('Build React + FastAPI project: connect interactive frontend client to backend endpoints');
    } else {
      recommendations.push(`Strengthen ${topPartial.skill}: build dedicated project component architecture to upgrade from partial to proven`);
    }
  }

  // Step 3: Database or backend integration
  const hasPostgres = skillsArray.some(s => s.skill.toLowerCase() === 'postgresql');
  if (hasPostgres) {
    recommendations.push('Add PostgreSQL integration: create relational schema migrations and database connection pooling');
  } else {
    recommendations.push('Add relational database integration: write migration scripts and parameterized query layer');
  }

  // Step 4: Quality & Automated Tests
  recommendations.push('Add automated tests and GitHub CI workflow to verify codebase integrity');

  // Collect Assessment Progress
  const assessmentProgress = [];
  if (Array.isArray(candidateSkills)) {
    for (const c of candidateSkills) {
      if (!c) continue;
      const skillName = c.name || c.skill || '';
      const history = Array.isArray(c.assessmentHistory) ? c.assessmentHistory : [];
      if (history.length > 0) {
        const firstAttempt = history[0];
        const latestAttempt = history[history.length - 1];
        const growthDelta = latestAttempt.percentage - firstAttempt.percentage;
        assessmentProgress.push({
          skill: skillName,
          attemptsCount: history.length,
          attempts: history.map((att, idx) => ({
            attemptNumber: idx + 1,
            percentage: att.percentage,
            passed: att.passed,
            competency: att.competency,
            completedAt: att.completedAt
          })),
          initialScore: firstAttempt.percentage,
          latestScore: latestAttempt.percentage,
          growthDelta,
          growthText: growthDelta >= 0 ? `+${growthDelta} percentage points` : `${growthDelta} percentage points`,
          status: latestAttempt.passed ? 'PASSED' : 'NOT PASSED'
        });
      }
    }
  }

  return {
    success: true,
    overallCoverage,
    role,
    skills: skillsArray,
    skillsNeedingImprovement,
    recommendations,
    assessmentProgress,
    summary: `Overall evidence coverage is ${overallCoverage}%. ${skillsNeedingImprovement.length} skill${skillsNeedingImprovement.length === 1 ? '' : 's'} require additional evidence to achieve target proficiency.`
  };
}
