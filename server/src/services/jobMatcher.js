import { SKILL_TAXONOMY } from '../utils/skillTaxonomy.js';
import { parseJobDescription } from './jobDescriptionParser.js';

/**
 * Fast lookup map for normalizing any skill alias or canonical name to its canonical taxonomy entry.
 */
const TAXONOMY_MAP = new Map();
for (const entry of SKILL_TAXONOMY) {
  TAXONOMY_MAP.set(entry.name.toLowerCase(), entry);
  for (const alias of entry.aliases) {
    TAXONOMY_MAP.set(alias.toLowerCase(), entry);
  }
}

/**
 * Normalizes a skill name or alias to its canonical taxonomy skill name.
 * Falls back to the trimmed original name if not found in taxonomy.
 * 
 * @param {string} skillName 
 * @returns {string} Canonical skill name
 */
export function getCanonicalSkillName(skillName) {
  if (!skillName || typeof skillName !== 'string') return '';
  const lower = skillName.trim().toLowerCase();
  const entry = TAXONOMY_MAP.get(lower);
  return entry ? entry.name : skillName.trim();
}

/**
 * Normalizes an array or map of requirements, deduplicating skills and ensuring
 * required skills take precedence over preferred skills.
 * 
 * @param {object} jobRequirements - { required: [], preferred: [] } or array of skills
 * @returns {{ requiredSkills: Array, preferredSkills: Array }}
 */
export function normalizeJobRequirements(jobRequirements = {}) {
  let rawRequired = [];
  let rawPreferred = [];

  if (Array.isArray(jobRequirements)) {
    rawRequired = jobRequirements;
  } else if (jobRequirements && typeof jobRequirements === 'object') {
    rawRequired = Array.isArray(jobRequirements.required) ? jobRequirements.required : [];
    rawPreferred = Array.isArray(jobRequirements.preferred) ? jobRequirements.preferred : [];
  }

  const requiredMap = new Map();
  const preferredMap = new Map();

  // Process required skills first
  for (const item of rawRequired) {
    const rawName = typeof item === 'string' ? item : (item.skill || item.name || '');
    if (!rawName) continue;
    const canonical = getCanonicalSkillName(rawName);
    if (!requiredMap.has(canonical)) {
      const taxonomyEntry = TAXONOMY_MAP.get(canonical.toLowerCase());
      requiredMap.set(canonical, {
        skill: canonical,
        category: taxonomyEntry ? taxonomyEntry.category : (item.category || 'Other'),
        matchedTerm: typeof item === 'object' && item.matchedTerm ? item.matchedTerm : rawName,
        importance: 'required'
      });
    }
  }

  // Process preferred skills (only if not already listed in required)
  for (const item of rawPreferred) {
    const rawName = typeof item === 'string' ? item : (item.skill || item.name || '');
    if (!rawName) continue;
    const canonical = getCanonicalSkillName(rawName);
    if (!requiredMap.has(canonical) && !preferredMap.has(canonical)) {
      const taxonomyEntry = TAXONOMY_MAP.get(canonical.toLowerCase());
      preferredMap.set(canonical, {
        skill: canonical,
        category: taxonomyEntry ? taxonomyEntry.category : (item.category || 'Other'),
        matchedTerm: typeof item === 'object' && item.matchedTerm ? item.matchedTerm : rawName,
        importance: 'preferred'
      });
    }
  }

  return {
    requiredSkills: Array.from(requiredMap.values()),
    preferredSkills: Array.from(preferredMap.values())
  };
}

/**
 * Builds a fast lookup map from crossVerification.results and claimedSkills.
 * 
 * @param {Array} verificationResults - Array of verified skill objects from Stage 4/5
 * @param {Array} claimedSkills - Array of claimed skills from Stage 2
 * @returns {Map<string, object>}
 */
function buildCandidateSkillsMap(verificationResults = [], claimedSkills = []) {
  const map = new Map();
  const safeResults = Array.isArray(verificationResults) ? verificationResults : [];
  const safeClaimed = Array.isArray(claimedSkills) ? claimedSkills : [];

  // Index Stage 4/5 cross-verification results first
  for (const item of safeResults) {
    if (!item || !item.skill) continue;
    const canonical = getCanonicalSkillName(item.skill);
    map.set(canonical.toLowerCase(), {
      ...item,
      skill: canonical,
      isClaimedOnResume: true
    });
  }

  // Index any claimed skills not yet in map
  for (const claimed of safeClaimed) {
    if (!claimed || !claimed.skill) continue;
    const canonical = getCanonicalSkillName(claimed.skill);
    const key = canonical.toLowerCase();

    const hasPassedAssessment = claimed.assessmentStatus === 'passed' ||
      (Array.isArray(claimed.evidence) && claimed.evidence.some(e => (e.type === 'microtask_assessment' || e.evidenceSource === 'microtask_assessment') && e.passed));
    
    const assessmentResult = claimed.assessmentResult || (Array.isArray(claimed.evidence) ? claimed.evidence.find(e => e.type === 'microtask_assessment') : null);

    const hasFailedAssessment = claimed.assessmentStatus === 'failed' ||
      (Array.isArray(claimed.evidence) && claimed.evidence.some(e => e.type === 'microtask_assessment' && !e.passed));

    const asmtScore = assessmentResult?.percentage || assessmentResult?.score || (hasPassedAssessment ? 85 : 0);

    if (!map.has(key)) {
      if (hasPassedAssessment) {
        map.set(key, {
          skill: canonical,
          category: claimed.category || 'Other',
          status: 'PROVED',
          verificationMethod: 'microtask_assessment',
          assessmentScore: asmtScore,
          explanation: `Verified through Micro-Task Assessment — ${asmtScore}%`,
          repositories: [],
          evidence: claimed.evidence || [],
          matchedTerm: claimed.matchedTerm || claimed.skill,
          isClaimedOnResume: true
        });
      } else {
        map.set(key, {
          skill: canonical,
          category: claimed.category || 'Other',
          status: 'UNVERIFIED',
          assessmentStatus: hasFailedAssessment ? 'failed' : 'not_started',
          assessmentScore: asmtScore,
          explanation: hasFailedAssessment
            ? `Assessment attempted but not passed (${asmtScore}%). Minimum passing score is 70%.`
            : 'Claimed on resume, but not supported by observable GitHub evidence in public repositories.',
          repositories: [],
          evidence: claimed.evidence || [],
          matchedTerm: claimed.matchedTerm || claimed.skill,
          isClaimedOnResume: true
        });
      }
    } else {
      const existing = map.get(key);
      if (hasPassedAssessment && existing.status !== 'PROVED') {
        existing.status = 'PROVED';
        existing.verificationMethod = 'microtask_assessment';
        existing.assessmentScore = asmtScore;
        existing.explanation = `Verified through Micro-Task Assessment — ${asmtScore}%`;
        existing.evidence = [...(existing.evidence || []), ...(claimed.evidence || [])];
      } else if (hasFailedAssessment) {
        existing.assessmentStatus = 'failed';
        existing.assessmentScore = asmtScore;
      }
    }
  }

  return map;
}

/**
 * Deterministically evaluates Job Requirements against Candidate Verification Data.
 * 
 * Required Scoring:
 * - PROVED = 1.0
 * - PARTIAL = 0.6
 * - UNVERIFIED = 0 (claimed without proof)
 * - MISSING = 0 (not on resume, not on GitHub)
 * 
 * Match Percentage = Math.round(((matched * 1.0 + partial * 0.6) / totalRequired) * 100)
 * 
 * Preferred skills are analyzed separately and do not inflate or hide required-skill gaps.
 * 
 * @param {object} params
 * @param {Array} [params.claimedSkills=[]] - Claimed skills from Stage 2
 * @param {object} [params.crossVerification={}] - Cross-verification output from Stage 4
 * @param {object|Array} [params.jobRequirements={}] - Job requirements from Stage 6A
 * @returns {object} Job Match Analysis Result
 */
export function matchJobSkills({
  claimedSkills = [],
  crossVerification = {},
  jobRequirements = {}
} = {}) {
  const verificationResults = Array.isArray(crossVerification?.results) 
    ? crossVerification.results 
    : [];

  const candidateMap = buildCandidateSkillsMap(verificationResults, claimedSkills);
  const { requiredSkills, preferredSkills: normalizedPreferred } = normalizeJobRequirements(jobRequirements);

  const matchedSkills = [];
  const partialSkills = [];
  const skillGaps = [];
  const preferredResults = [];

  let requiredScoreSum = 0;

  // 1. Evaluate Required Skills
  for (const req of requiredSkills) {
    const key = req.skill.toLowerCase();
    const candidateData = candidateMap.get(key);

    if (candidateData) {
      if (candidateData.status === 'PROVED') {
        matchedSkills.push({
          skill: req.skill,
          category: candidateData.category || req.category,
          status: 'PROVED',
          scoreContribution: 1.0,
          isClaimedOnResume: true,
          explanation: candidateData.explanation || 'Verified through observable GitHub repository evidence.',
          repositories: candidateData.repositories || [],
          evidence: candidateData.evidence || []
        });
        requiredScoreSum += 1.0;
      } else if (candidateData.status === 'PARTIAL') {
        partialSkills.push({
          skill: req.skill,
          category: candidateData.category || req.category,
          status: 'PARTIAL',
          scoreContribution: 0.6,
          isClaimedOnResume: true,
          explanation: candidateData.explanation || 'Observed in repository language statistics, but lacking dedicated package manifests or multi-repository usage.',
          repositories: candidateData.repositories || [],
          evidence: candidateData.evidence || []
        });
        requiredScoreSum += 0.6;
      } else {
        // UNVERIFIED: Claimed on resume but no GitHub evidence
        skillGaps.push({
          skill: req.skill,
          category: candidateData.category || req.category,
          status: 'UNVERIFIED',
          scoreContribution: 0,
          isClaimedOnResume: true,
          explanation: 'Claimed on resume, but not supported by observable GitHub evidence in public repositories.',
          repositories: [],
          evidence: []
        });
      }
    } else {
      // MISSING: Not claimed on resume, not on GitHub
      skillGaps.push({
        skill: req.skill,
        category: req.category,
        status: 'MISSING',
        scoreContribution: 0,
        isClaimedOnResume: false,
        explanation: 'Not claimed on resume and no observable GitHub evidence detected.',
        repositories: [],
        evidence: []
      });
    }
  }

  // 2. Evaluate Preferred Skills (Reported separately; does not affect required match score)
  for (const pref of normalizedPreferred) {
    const key = pref.skill.toLowerCase();
    const candidateData = candidateMap.get(key);

    if (candidateData) {
      preferredResults.push({
        skill: pref.skill,
        category: candidateData.category || pref.category,
        status: candidateData.status,
        matchStatus: candidateData.status === 'PROVED' ? 'MATCHED' : (candidateData.status === 'PARTIAL' ? 'PARTIAL' : 'UNVERIFIED'),
        isClaimedOnResume: true,
        explanation: candidateData.status === 'PROVED'
          ? 'Preferred skill verified with direct GitHub repository proof.'
          : (candidateData.status === 'PARTIAL'
            ? 'Preferred skill observed in repository language statistics.'
            : 'Preferred skill claimed on resume, but not supported by observable GitHub evidence.'),
        repositories: candidateData.repositories || [],
        evidence: candidateData.evidence || []
      });
    } else {
      preferredResults.push({
        skill: pref.skill,
        category: pref.category,
        status: 'MISSING',
        matchStatus: 'MISSING',
        isClaimedOnResume: false,
        explanation: 'Preferred skill not claimed on resume and not observed on GitHub.',
        repositories: [],
        evidence: []
      });
    }
  }

  const totalRequired = requiredSkills.length;
  const matchPercentage = totalRequired > 0 
    ? Math.round((requiredScoreSum / totalRequired) * 100) 
    : 0;

  // 3. Construct Evidence-Aware Assessment Explanations
  const strongMatches = matchedSkills.map(s => {
    const repoCount = s.repositories?.length || 1;
    return `${s.skill}: Verified with direct observable GitHub evidence across ${repoCount} ${repoCount === 1 ? 'repository' : 'repositories'}.`;
  });

  const areasToStrengthen = partialSkills.map(s => {
    return `${s.skill}: Supporting evidence found in repository language statistics. Add dedicated build/manifest declarations or multi-repository projects to prove complete proficiency.`;
  });

  const missingEvidence = skillGaps.map(s => {
    return s.isClaimedOnResume
      ? `${s.skill}: Claimed on resume but unverified. Build a public repository or push codebase artifacts to prove this skill.`
      : `${s.skill}: Required by the job description but not found on resume or GitHub profile.`;
  });

  return {
    summary: {
      matchPercentage,
      totalRequired,
      matched: matchedSkills.length,
      partial: partialSkills.length,
      gaps: skillGaps.length,
      totalPreferred: normalizedPreferred.length
    },
    matchedSkills,
    partialSkills,
    skillGaps,
    preferredSkills: preferredResults,
    assessment: {
      strongMatches,
      areasToStrengthen,
      missingEvidence
    }
  };
}

/**
 * Normalizes an evidence status to one of the 4 standard SkillProof statuses:
 * - PROVEN
 * - PARTIAL
 * - CLAIMED-ONLY
 * - NO EVIDENCE
 * 
 * @param {string} rawStatus
 * @param {string} [defaultStatus='CLAIMED-ONLY']
 * @returns {'PROVEN' | 'PARTIAL' | 'CLAIMED-ONLY' | 'NO EVIDENCE'}
 */
export function normalizeEvidenceStatus(rawStatus, defaultStatus = 'CLAIMED-ONLY') {
  if (!rawStatus) return defaultStatus;
  const s = String(rawStatus).trim().toLowerCase();
  if (s === 'proven' || s === 'proved') return 'PROVEN';
  if (s === 'partial' || s === 'partially_proven' || s === 'partially proven') return 'PARTIAL';
  if (s === 'claimed-only' || s === 'claimed_only' || s === 'claimed' || s === 'unverified') return 'CLAIMED-ONLY';
  if (s === 'no evidence' || s === 'no_evidence' || s === 'missing') return 'NO EVIDENCE';
  return defaultStatus;
}

/**
 * Compares a Job Description against Candidate Verified Skills.
 * 
 * Rules:
 * - Evidence Statuses: PROVEN, PARTIAL, CLAIMED-ONLY, NO EVIDENCE.
 * - CLAIMED-ONLY must NOT count as PROVEN (0 credit).
 * - Every required job skill is classified into:
 *   1. Matched (PROVEN)
 *   2. Partial (PARTIAL)
 *   3. Gap (CLAIMED-ONLY or NO EVIDENCE)
 * 
 * Scoring:
 * - PROVEN required skill = full credit (1.0)
 * - PARTIAL required skill = half credit (0.5)
 * - CLAIMED-ONLY = zero credit (0.0)
 * - NO EVIDENCE = zero credit (0.0)
 * - Score = Math.round((earnedPoints / totalRequired) * 100)
 * 
 * @param {object} params
 * @param {Array} [params.verifiedSkills=[]] - User's verified skills
 * @param {object|string} [params.jobDescription={}] - Generated or pasted job description
 * @param {Array} [params.claimedSkills=[]] - Optional fallback claimed skills
 * @param {object} [params.crossVerification={}] - Optional Stage 4 cross-verification output
 * @returns {{
 *   role: string,
 *   score: number,
 *   requiredSkills: string[],
 *   matchedSkills: Array,
 *   partialSkills: Array,
 *   skillGaps: Array,
 *   summary: string
 * }}
 */
export function compareJobWithVerifiedSkills({
  verifiedSkills = [],
  jobDescription = {},
  claimedSkills = [],
  crossVerification = {}
} = {}) {
  // 1. Build candidate skills lookup map
  // Status rank for conflict resolution: PROVEN (3) > PARTIAL (2) > CLAIMED-ONLY (1) > NO EVIDENCE (0)
  const STATUS_RANKS = {
    'PROVEN': 3,
    'PARTIAL': 2,
    'CLAIMED-ONLY': 1,
    'NO EVIDENCE': 0
  };

  const candidateMap = new Map();

  function registerCandidateSkill(skillName, rawStatus, extra = {}) {
    const rawName = typeof skillName === 'string' ? skillName : (skillName?.skill || skillName?.name || '');
    if (!rawName || typeof rawName !== 'string') return;
    const canonical = getCanonicalSkillName(rawName);
    const key = canonical.toLowerCase();

    const microtaskEv = Array.isArray(extra.evidence) ? extra.evidence.find(e => (e.type === 'microtask_assessment' || e.evidenceSource === 'microtask_assessment')) : null;
    const hasPassedAssessment = extra.assessmentStatus === 'passed' || (Boolean(microtaskEv) && microtaskEv.passed !== false && ((microtaskEv.percentage || microtaskEv.score || 0) >= 70));
    const asmtScore = extra.assessmentScore || extra.assessmentResult?.percentage || extra.assessmentResult?.score || microtaskEv?.percentage || microtaskEv?.score || (hasPassedAssessment ? 85 : 0);
    const effectiveStatus = hasPassedAssessment ? 'PROVEN' : normalizeEvidenceStatus(rawStatus, 'CLAIMED-ONLY');
    const existing = candidateMap.get(key);

    if (!existing || (STATUS_RANKS[effectiveStatus] || 0) > (STATUS_RANKS[existing.status] || 0)) {
      const certEv = Array.isArray(extra.evidence) && extra.evidence.some(e => e.type === 'certificate' || e.type === 'credential');
      const githubEv = Array.isArray(extra.evidence) && extra.evidence.some(e => e.type === 'github_repo' || e.type === 'project_url');

      let method = 'evidence';
      if (hasPassedAssessment) method = 'microtask_assessment';
      else if (extra.verificationMethod) method = extra.verificationMethod;
      else if (certEv) method = 'certificate';
      else if (githubEv || (extra.repositories && extra.repositories.length > 0)) method = 'github';

      const taxonomyEntry = TAXONOMY_MAP.get(key);
      const entryObj = {
        skill: canonical,
        status: effectiveStatus,
        verificationMethod: method,
        assessmentStatus: extra.assessmentStatus || (hasPassedAssessment ? 'passed' : 'not_started'),
        assessmentScore: asmtScore,
        category: taxonomyEntry ? taxonomyEntry.category : (extra.category || 'Other'),
        evidence: Array.isArray(extra.evidence) ? extra.evidence : (existing?.evidence || []),
        repositories: Array.isArray(extra.repositories) ? extra.repositories : (existing?.repositories || [])
      };
      // Allow string comparison if tested directly
      Object.defineProperty(entryObj, 'toString', {
        value: function() { return this.skill; },
        enumerable: false
      });
      candidateMap.set(key, entryObj);
    }
  }

  // 1a. Process verifiedSkills array (items here are candidate skills with verification statuses)
  if (Array.isArray(verifiedSkills)) {
    for (const item of verifiedSkills) {
      if (!item) continue;
      const rawName = typeof item === 'string' ? item : (item.skill || item.name || '');
      // If passed as a plain string in verifiedSkills, treat as PROVEN; if object has explicit status, normalize it
      const rawStatus = typeof item === 'string' ? 'PROVEN' : (item.status || item.verificationStatus || 'PROVEN');
      registerCandidateSkill(rawName, rawStatus, item);
    }
  }

  // 1b. Process crossVerification results if provided
  const crossResults = Array.isArray(crossVerification?.results) ? crossVerification.results : [];
  for (const item of crossResults) {
    if (!item || !item.skill) continue;
    registerCandidateSkill(item.skill, item.status, item);
  }

  // 1c. Process claimedSkills array if provided
  if (Array.isArray(claimedSkills)) {
    for (const item of claimedSkills) {
      if (!item) continue;
      const rawName = typeof item === 'string' ? item : (item.skill || item.name || '');
      const rawStatus = typeof item === 'string' ? 'CLAIMED-ONLY' : (item.status || item.verificationStatus || 'CLAIMED-ONLY');
      registerCandidateSkill(rawName, rawStatus, item);
    }
  }

  // 2. Resolve Role and Required Skills from jobDescription
  let role = '';
  let rawRequiredSkills = [];

  if (jobDescription && typeof jobDescription === 'object') {
    role = jobDescription.role || jobDescription.title || jobDescription.jobTitle || '';

    if (Array.isArray(jobDescription.requiredSkills)) {
      rawRequiredSkills = jobDescription.requiredSkills;
    } else if (Array.isArray(jobDescription.requirements?.required)) {
      rawRequiredSkills = jobDescription.requirements.required;
    } else if (Array.isArray(jobDescription.required)) {
      rawRequiredSkills = jobDescription.required;
    } else if (typeof jobDescription.jobDescriptionText === 'string') {
      const parsed = parseJobDescription(jobDescription.jobDescriptionText);
      rawRequiredSkills = parsed.requirements?.required || [];
      if (!role) {
        const roleMatch = jobDescription.jobDescriptionText.match(/(?:role|job title|title)\s*:\s*([^\r\n]+)/i);
        role = roleMatch ? roleMatch[1].trim() : (parsed.title || '');
      }
    } else if (typeof jobDescription.text === 'string') {
      const parsed = parseJobDescription(jobDescription.text);
      rawRequiredSkills = parsed.requirements?.required || [];
      if (!role) {
        const roleMatch = jobDescription.text.match(/(?:role|job title|title)\s*:\s*([^\r\n]+)/i);
        role = roleMatch ? roleMatch[1].trim() : (parsed.title || '');
      }
    }
  } else if (typeof jobDescription === 'string' && jobDescription.trim()) {
    const parsed = parseJobDescription(jobDescription.trim());
    rawRequiredSkills = parsed.requirements?.required || [];
    const roleMatch = jobDescription.match(/(?:role|job title|title)\s*:\s*([^\r\n]+)/i);
    role = roleMatch ? roleMatch[1].trim() : (parsed.title || '');
  }

  if (!role) {
    role = 'Target Technical Role';
  }

  // Deduplicate and canonicalize required skills
  const requiredMap = new Map();
  for (const item of rawRequiredSkills) {
    const rawName = typeof item === 'string' ? item : (item.skill || item.name || '');
    if (!rawName) continue;
    const canonical = getCanonicalSkillName(rawName);
    const key = canonical.toLowerCase();
    if (!requiredMap.has(key)) {
      const taxonomyEntry = TAXONOMY_MAP.get(key);
      requiredMap.set(key, {
        skill: canonical,
        category: taxonomyEntry ? taxonomyEntry.category : (item.category || 'Other')
      });
    }
  }

  const requiredSkillsList = Array.from(requiredMap.values());

  // 3. Compare Required Skills against Candidate Skills
  // Scoring rules:
  // - PROVEN = 1.0 (full credit)
  // - PARTIAL = 0.5 (half credit)
  // - CLAIMED-ONLY = 0.0 (zero credit - CLAIMED-ONLY must NOT count as PROVEN)
  // - NO EVIDENCE = 0.0 (zero credit)
  const matchedSkills = [];
  const partialSkills = [];
  const skillGaps = [];
  let earnedPoints = 0;

  for (const req of requiredSkillsList) {
    const key = req.skill.toLowerCase();
    const cand = candidateMap.get(key);

    if (cand) {
      if (cand.status === 'PROVEN') {
        const isMicrotask = cand.verificationMethod === 'microtask_assessment';
        const matchItem = {
          skill: req.skill,
          status: 'PROVEN',
          points: 1.0,
          scoreContribution: 1.0,
          verificationMethod: cand.verificationMethod || (isMicrotask ? 'microtask_assessment' : 'evidence'),
          category: cand.category || req.category,
          explanation: isMicrotask
            ? `Verified through Micro-Task Assessment — ${cand.assessmentScore || 85}%`
            : `${req.skill} is verified with direct observable evidence.`,
          repositories: cand.repositories || [],
          evidence: cand.evidence || []
        };
        Object.defineProperty(matchItem, 'toString', {
          value: function() { return this.skill; },
          enumerable: false
        });
        matchedSkills.push(matchItem);
        earnedPoints += 1.0;
      } else if (cand.status === 'PARTIAL') {
        const partialItem = {
          skill: req.skill,
          status: 'PARTIAL',
          points: 0.5,
          scoreContribution: 0.5,
          category: cand.category || req.category,
          explanation: `${req.skill} is partially supported by evidence.`,
          repositories: cand.repositories || [],
          evidence: cand.evidence || []
        };
        Object.defineProperty(partialItem, 'toString', {
          value: function() { return this.skill; },
          enumerable: false
        });
        partialSkills.push(partialItem);
        earnedPoints += 0.5;
      } else {
        // CLAIMED-ONLY: zero credit!
        const isFailedAsmt = cand.assessmentStatus === 'failed';
        const gapItem = {
          skill: req.skill,
          status: 'CLAIMED-ONLY',
          points: 0,
          scoreContribution: 0,
          isClaimed: true,
          assessmentStatus: cand.assessmentStatus || 'not_started',
          assessmentScore: cand.assessmentScore,
          category: cand.category || req.category,
          explanation: isFailedAsmt
            ? `Assessment attempted but not passed (${cand.assessmentScore || 0}%). Minimum passing score is 70%.`
            : `${req.skill} is claimed on resume/profile but lacks verified evidence. Zero credit.`
        };
        Object.defineProperty(gapItem, 'toString', {
          value: function() { return this.skill; },
          enumerable: false
        });
        skillGaps.push(gapItem);
      }
    } else {
      // NO EVIDENCE: zero credit!
      const missingItem = {
        skill: req.skill,
        status: 'NO EVIDENCE',
        points: 0,
        scoreContribution: 0,
        isClaimed: false,
        category: req.category,
        explanation: `${req.skill} is required by the role but no evidence was found. Zero credit.`
      };
      Object.defineProperty(missingItem, 'toString', {
        value: function() { return this.skill; },
        enumerable: false
      });
      skillGaps.push(missingItem);
    }
  }

  // 4. Calculate Match Score
  const totalRequired = requiredSkillsList.length;
  const score = totalRequired > 0 
    ? Math.round((earnedPoints / totalRequired) * 100) 
    : 0;

  // 5. Construct Factual Summary String
  let summary = '';
  if (totalRequired === 0) {
    summary = 'No required skills specified in the job description.';
  } else {
    const parts = [];
    parts.push(`${matchedSkills.length} of ${totalRequired} required skills (${score}%) are proven by verified evidence.`);
    if (partialSkills.length > 0) {
      parts.push(`${partialSkills.length} required skill${partialSkills.length === 1 ? ' has' : 's have'} partial evidence.`);
    }
    if (skillGaps.length > 0) {
      const claimedGaps = skillGaps.filter(g => g.status === 'CLAIMED-ONLY').map(g => g.skill);
      const missingGaps = skillGaps.filter(g => g.status === 'NO EVIDENCE').map(g => g.skill);
      if (claimedGaps.length > 0 && missingGaps.length > 0) {
        parts.push(`${claimedGaps.length} claimed without evidence (${claimedGaps.join(', ')}) and ${missingGaps.length} missing entirely (${missingGaps.join(', ')}).`);
      } else if (claimedGaps.length > 0) {
        parts.push(`${claimedGaps.length} skill gap${claimedGaps.length === 1 ? '' : 's'} claimed without verified evidence (${claimedGaps.join(', ')}).`);
      } else {
        parts.push(`${missingGaps.length} skill gap${missingGaps.length === 1 ? '' : 's'} missing from evidence (${missingGaps.join(', ')}).`);
      }
    }
    summary = parts.join(' ');
  }

  return {
    role,
    score,
    matchPercentage: score,
    requiredSkills: requiredSkillsList.map(r => r.skill),
    matchedSkills,
    partialSkills,
    skillGaps,
    summary,
    // Supporting metadata
    earnedPoints,
    totalRequired,
    claimedUnverifiedSkills: skillGaps.filter(g => g.status === 'CLAIMED-ONLY')
  };
}
