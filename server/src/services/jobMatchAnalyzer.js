import { SKILL_TAXONOMY, buildAliasPattern } from '../utils/skillTaxonomy.js';
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
 * Handles cases like:
 * - "Postgres" -> "PostgreSQL"
 * - "React.js" -> "React"
 * - "Fast API" -> "FastAPI"
 * - "Node JS" -> "Node.js"
 * - "PowerBI" -> "Power BI"
 * 
 * @param {string} skillName 
 * @returns {string} Canonical skill name
 */
export function normalizeSkillName(skillName) {
  if (!skillName || typeof skillName !== 'string') return '';
  const trimmed = skillName.trim();
  const lower = trimmed.toLowerCase();

  // Direct taxonomy lookup
  const entry = TAXONOMY_MAP.get(lower);
  if (entry) return entry.name;

  // Strip trailing punctuation / common prefixes/suffixes
  const stripped = lower.replace(/[.,;:]+$/, '').trim();
  const strippedEntry = TAXONOMY_MAP.get(stripped);
  if (strippedEntry) return strippedEntry.name;

  // Handle common space/hyphen variations (e.g., "fast-api" -> "FastAPI", "node-js" -> "Node.js")
  const noHyphen = lower.replace(/[-_]+/g, ' ');
  const noHyphenEntry = TAXONOMY_MAP.get(noHyphen);
  if (noHyphenEntry) return noHyphenEntry.name;

  const noSpace = lower.replace(/[\s-_]+/g, '');
  for (const [key, value] of TAXONOMY_MAP.entries()) {
    if (key.replace(/[\s-_.]+/g, '') === noSpace) {
      return value.name;
    }
  }

  return trimmed;
}

/**
 * Canonicalizes skill status into 'proven' | 'partial' | 'unverified'.
 * 
 * @param {string} status 
 * @returns {'proven' | 'partial' | 'unverified'}
 */
export function normalizeSkillStatus(status = '') {
  const s = String(status).toLowerCase().trim();
  if (s === 'proven' || s === 'proved') return 'proven';
  if (s === 'partial' || s === 'partially_proven') return 'partial';
  return 'unverified';
}

/**
 * Extracts responsibilities bullet points or lines from raw Job Description text.
 * 
 * @param {string} text 
 * @returns {string[]} List of cleaned responsibility strings
 */
export function extractResponsibilities(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/);
  const responsibilities = [];
  let inResponsibilitiesSection = false;

  const RESP_HEADER_REGEX = /(?:responsibilities|key\s+responsibilities|core\s+responsibilities|duties|what\s+you(?:'ll|\s+will)\s+do|role\s+overview|daily\s+scope|scope\s+of\s+work)\s*[:\n]/i;
  const OTHER_SECTION_REGEX = /(?:requirements|qualifications|required\s+skills|preferred\s+skills|what\s+we\s+offer|benefits|technologies|tech\s+stack|about\s+the\s+role|about\s+us|nice\s+to\s+have)\s*[:\n]/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (RESP_HEADER_REGEX.test(line)) {
      inResponsibilitiesSection = true;
      continue;
    }

    if (inResponsibilitiesSection && OTHER_SECTION_REGEX.test(line)) {
      inResponsibilitiesSection = false;
      continue;
    }

    if (inResponsibilitiesSection) {
      const cleaned = line.replace(/^[-*•·–—]\s*/, '').replace(/^\d+[\.)]\s*/, '').trim();
      if (cleaned.length >= 8) {
        responsibilities.push(cleaned);
      }
    }
  }

  // Fallback: search for bullet points with action verbs if no explicit section header found
  if (responsibilities.length === 0) {
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (/^[-*•·]\s*(?:Build|Develop|Design|Architect|Implement|Create|Maintain|Manage|Lead|Collaborate|Optimize|Write|Deliver|Deploy|Scale|Support|Preprocess|Train|Enforce)\b/i.test(line)) {
        const cleaned = line.replace(/^[-*•·–—]\s*/, '').trim();
        if (cleaned.length >= 8 && !OTHER_SECTION_REGEX.test(line)) {
          responsibilities.push(cleaned);
        }
      }
    }
  }

  return responsibilities;
}

/**
 * Detects which taxonomy technologies or skills are mentioned in a single responsibility sentence.
 * 
 * @param {string} text 
 * @returns {string[]} Canonical skill names detected
 */
function detectSkillsInText(text) {
  if (!text || typeof text !== 'string') return [];
  const found = new Set();

  for (const entry of SKILL_TAXONOMY) {
    const sortedAliases = [...entry.aliases].sort((a, b) => b.length - a.length);
    for (const alias of sortedAliases) {
      const isCaseSensitive = (entry.caseSensitive && (alias.length <= 2 || alias === 'Java' || alias === 'Go')) || alias === 'REST';
      const pattern = buildAliasPattern(alias, isCaseSensitive);
      if (pattern.test(text)) {
        found.add(entry.name);
        break;
      }
    }
  }

  return Array.from(found);
}

/**
 * Builds a fast candidate skill lookup map from session claimedSkills.
 * 
 * @param {Array} claimedSkills 
 * @returns {Map<string, { skill: string, canonical: string, status: 'proven' | 'partial' | 'unverified', category: string, evidence: Array }>}
 */
function buildCandidateLookup(claimedSkills = []) {
  const map = new Map();
  if (!Array.isArray(claimedSkills)) return map;

  for (const item of claimedSkills) {
    if (!item) continue;
    const rawName = typeof item === 'string' ? item : (item.skill || item.name || '');
    if (!rawName) continue;

    const canonical = normalizeSkillName(rawName);
    const rawStatus = typeof item === 'object' ? (item.status || item.verificationStatus || 'unverified') : 'proven';
    const status = normalizeSkillStatus(rawStatus);

    const key = canonical.toLowerCase();
    
    // If multiple entries exist, keep the highest status (proven > partial > unverified)
    if (map.has(key)) {
      const existing = map.get(key);
      if (status === 'proven' || (status === 'partial' && existing.status !== 'proven')) {
        map.set(key, {
          skill: canonical,
          canonical,
          status,
          category: item.category || existing.category || 'Other',
          evidence: Array.isArray(item.evidence) ? item.evidence : existing.evidence
        });
      }
    } else {
      map.set(key, {
        skill: canonical,
        canonical,
        status,
        category: item.category || 'Other',
        evidence: Array.isArray(item.evidence) ? item.evidence : []
      });
    }
  }

  return map;
}

/**
 * Deterministically analyzes a Job Description against candidate skills.
 * 
 * Scoring:
 * - Proven match = 100 points
 * - Partial match = 50 points
 * - Claimed/unverified = 0 points
 * - Missing = 0 points
 * 
 * Percentage:
 * Math.round(matched_points / total_required_points * 100)
 * 
 * @param {string} jobDescription - Raw Job Description text
 * @param {Array} claimedSkills - Candidate skills from session.claimedSkills
 * @returns {object} Structured Match Result
 */
export function analyzeJobMatch(jobDescription, claimedSkills = []) {
  if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    throw new Error('Job description text is required.');
  }

  const trimmedJd = jobDescription.trim();
  if (trimmedJd.length < 30) {
    throw new Error(`Job description is too short (${trimmedJd.length} characters). Minimum 30 characters required.`);
  }

  // 1. Parse Job Description into structured requirements
  const parsed = parseJobDescription(trimmedJd);
  const rawRequired = parsed.requirements?.required || [];
  const rawPreferred = parsed.requirements?.preferred || [];

  // Deduplicate and normalize required skills
  const requiredMap = new Map();
  for (const r of rawRequired) {
    const rawName = typeof r === 'string' ? r : (r.skill || r.name || '');
    if (!rawName) continue;
    const canonical = normalizeSkillName(rawName);
    const key = canonical.toLowerCase();
    if (!requiredMap.has(key)) {
      requiredMap.set(key, {
        skill: canonical,
        category: r.category || 'Other'
      });
    }
  }

  // Deduplicate and normalize preferred skills
  const preferredMap = new Map();
  for (const p of rawPreferred) {
    const rawName = typeof p === 'string' ? p : (p.skill || p.name || '');
    if (!rawName) continue;
    const canonical = normalizeSkillName(rawName);
    const key = canonical.toLowerCase();
    if (!requiredMap.has(key) && !preferredMap.has(key)) {
      preferredMap.set(key, {
        skill: canonical,
        category: p.category || 'Other'
      });
    }
  }

  const requiredSkillsList = Array.from(requiredMap.values());
  const preferredSkillsList = Array.from(preferredMap.values());

  // 2. Build candidate lookup map
  const candidateLookup = buildCandidateLookup(claimedSkills);

  // 3. Match Evaluation
  const matchedSkills = [];
  const partialSkills = [];
  const gapSkills = [];
  const claimedUnverifiedSkills = [];

  let matchedPoints = 0;
  const totalRequired = requiredSkillsList.length;
  const totalRequiredPoints = totalRequired * 100;

  for (const req of requiredSkillsList) {
    const key = req.skill.toLowerCase();
    const candidateMatch = candidateLookup.get(key);

    if (candidateMatch) {
      if (candidateMatch.status === 'proven') {
        matchedSkills.push({
          skill: req.skill,
          status: 'PROVEN',
          points: 100,
          category: req.category,
          explanation: `${req.skill} is proven through verified evidence.`,
          evidence: candidateMatch.evidence || []
        });
        matchedPoints += 100;
      } else if (candidateMatch.status === 'partial') {
        partialSkills.push({
          skill: req.skill,
          status: 'PARTIAL',
          points: 50,
          category: req.category,
          explanation: `${req.skill} is partially verified.`,
          evidence: candidateMatch.evidence || []
        });
        matchedPoints += 50;
      } else {
        // Claimed by candidate, but unverified
        gapSkills.push({
          skill: req.skill,
          status: 'UNVERIFIED',
          points: 0,
          category: req.category,
          explanation: `${req.skill} is claimed but currently has no verified evidence.`
        });
        claimedUnverifiedSkills.push({
          skill: req.skill,
          status: 'CLAIMED_ONLY',
          category: req.category,
          explanation: `${req.skill} is claimed but currently has no verified evidence.`
        });
      }
    } else {
      // Completely missing from candidate
      gapSkills.push({
        skill: req.skill,
        status: 'MISSING',
        points: 0,
        category: req.category,
        explanation: `${req.skill} is required by the role but no verified ${req.skill} evidence was found.`
      });
    }
  }

  // Also include any candidate claimed skills that are unverified (even if not required) in claimedUnverifiedSkills
  for (const [, cand] of candidateLookup.entries()) {
    if (cand.status === 'unverified') {
      const alreadyIncluded = claimedUnverifiedSkills.some(c => c.skill.toLowerCase() === cand.skill.toLowerCase());
      if (!alreadyIncluded) {
        claimedUnverifiedSkills.push({
          skill: cand.skill,
          status: 'CLAIMED_ONLY',
          category: cand.category,
          explanation: `${cand.skill} is claimed but currently has no verified evidence.`
        });
      }
    }
  }

  // 4. Calculate deterministic match percentage
  const percentage = totalRequiredPoints > 0 
    ? Math.round((matchedPoints / totalRequiredPoints) * 100) 
    : 0;

  // 5. Construct factual explanation
  let explanation = '';
  if (totalRequired === 0) {
    explanation = 'No required technical skills were detected in the job description.';
  } else {
    const matchedCount = matchedSkills.length;
    const partialCount = partialSkills.length;
    const gapCount = gapSkills.length;

    const parts = [];
    parts.push(`${matchedCount} of ${totalRequired} required skill${totalRequired === 1 ? '' : 's'} ${matchedCount === 1 ? 'is' : 'are'} directly supported by verified evidence.`);
    if (partialCount > 0) {
      parts.push(`${partialCount} additional skill${partialCount === 1 ? ' has' : 's have'} partial evidence`);
    }
    if (gapCount > 0) {
      parts.push(`${gapCount} required skill${gapCount === 1 ? '' : 's'} currently lack${gapCount === 1 ? 's' : ''} supporting evidence.`);
    }

    if (parts.length === 3) {
      explanation = `${parts[0]} ${parts[1]} and ${parts[2]}`;
    } else if (parts.length === 2) {
      explanation = `${parts[0]} ${parts[1]}`;
    } else {
      explanation = parts[0];
    }
  }

  // 6. Responsibilities Analysis
  const rawResponsibilities = extractResponsibilities(trimmedJd);
  const responsibilities = rawResponsibilities.map((respText) => {
    const detectedSkills = detectSkillsInText(respText);
    const supportingSkills = [];
    const partialSupportingSkills = [];
    const missingSkills = [];

    for (const sk of detectedSkills) {
      const cand = candidateLookup.get(sk.toLowerCase());
      if (cand) {
        if (cand.status === 'proven') supportingSkills.push(sk);
        else if (cand.status === 'partial') partialSupportingSkills.push(sk);
        else missingSkills.push(sk);
      } else {
        missingSkills.push(sk);
      }
    }

    let status = 'general';
    let respExplanation = 'General engineering responsibility.';

    if (supportingSkills.length > 0) {
      status = 'supported';
      respExplanation = `✓ Supported by ${supportingSkills.join(' + ')}`;
    } else if (partialSupportingSkills.length > 0) {
      status = 'partially_supported';
      respExplanation = `◐ Partially supported by ${partialSupportingSkills.join(' + ')}`;
    } else if (missingSkills.length > 0) {
      status = 'gap';
      respExplanation = `✕ ${missingSkills.join(' + ')} evidence not found`;
    }

    return {
      responsibility: respText,
      detectedSkills,
      supportingSkills,
      missingSkills,
      status,
      explanation: respExplanation
    };
  });

  return {
    percentage,
    requiredSkills: requiredSkillsList.map(r => r.skill),
    preferredSkills: preferredSkillsList.map(p => p.skill),
    matchedSkills,
    partialSkills,
    gapSkills,
    claimedUnverifiedSkills,
    responsibilities,
    explanation,
    scoring: {
      matchedPoints,
      totalRequiredPoints,
      formula: 'matched_points / total_required_points * 100'
    }
  };
}
