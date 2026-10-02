import { SKILL_TAXONOMY } from '../utils/skillTaxonomy.js';

/**
 * Build lookup maps from the canonical skill taxonomy for fast, case-insensitive
 * resolution of skills and their known aliases.
 */
const TAXONOMY_MAP = new Map();
for (const entry of SKILL_TAXONOMY) {
  TAXONOMY_MAP.set(entry.name.toLowerCase(), entry);
  for (const alias of entry.aliases) {
    TAXONOMY_MAP.set(alias.toLowerCase(), entry);
  }
}

/**
 * Specific relationship rules for cross-verification (e.g. CI/CD implemented by GitHub Actions)
 */
const SKILL_RELATIONSHIPS = {
  'ci/cd': ['github actions', 'jenkins', 'ci/cd', 'continuous integration', 'continuous delivery', 'gh actions'],
  'github actions': ['ci/cd', 'github actions', 'gh actions']
};

/**
 * Collects all observable GitHub evidence matching a claimed resume skill.
 * 
 * @param {string} claimedSkillName - Name of the claimed skill
 * @param {Array} allEvidence - Observable evidence items from Stage 3
 * @param {Array} repositories - Analyzed repositories list from Stage 3
 * @returns {Array} List of matched observable evidence records
 */
export function findEvidenceForSkill(claimedSkillName, allEvidence = [], repositories = []) {
  if (!claimedSkillName || typeof claimedSkillName !== 'string') return [];

  const targetLower = claimedSkillName.toLowerCase().trim();
  const taxonomyEntry = TAXONOMY_MAP.get(targetLower);
  const canonicalName = taxonomyEntry ? taxonomyEntry.name.toLowerCase() : targetLower;
  const aliases = taxonomyEntry ? taxonomyEntry.aliases.map(a => a.toLowerCase()) : [];
  const related = SKILL_RELATIONSHIPS[targetLower] || [];

  const matchedEvidence = [];
  const seenKey = new Set();

  // 1. Match from aggregated Stage 3 evidence items (dependencies, manifests, language stats)
  for (const ev of allEvidence) {
    if (!ev || !ev.skill) continue;
    const evSkillLower = ev.skill.toLowerCase().trim();

    let isMatch = false;
    if (evSkillLower === targetLower || evSkillLower === canonicalName) {
      isMatch = true;
    } else if (aliases.includes(evSkillLower)) {
      isMatch = true;
    } else if (related.includes(evSkillLower)) {
      isMatch = true;
    }

    if (isMatch) {
      const key = `${ev.repository}::${ev.evidenceType}::${ev.details}`;
      if (!seenKey.has(key)) {
        seenKey.add(key);
        matchedEvidence.push(ev);
      }
    }
  }

  // 2. Cross-reference repository language breakdowns directly to ensure no observed language is missed
  for (const repo of repositories) {
    const repoLanguages = Array.isArray(repo.languages) ? repo.languages : [];
    for (const lang of repoLanguages) {
      const langLower = lang.toLowerCase().trim();
      let isLangMatch = (
        langLower === targetLower ||
        langLower === canonicalName ||
        aliases.includes(langLower) ||
        related.includes(langLower)
      );

      if (isLangMatch) {
        const details = `${lang} detected in repository language statistics`;
        const key = `${repo.name}::repository-language::${details}`;
        if (!seenKey.has(key)) {
          seenKey.add(key);
          matchedEvidence.push({
            skill: claimedSkillName,
            repository: repo.name,
            repositoryUrl: repo.url,
            evidenceType: 'repository-language',
            strength: 'supporting',
            details
          });
        }
      }
    }
  }

  return matchedEvidence;
}

/**
 * Deterministically classifies a claimed skill into PROVED, PARTIAL, or UNVERIFIED.
 * 
 * Rules:
 * - UNVERIFIED: No observable evidence found in repositories, languages, or manifests.
 * - PROVED:
 *     - At least 1 strong evidence item (e.g. declared package dependency, Dockerfile, GitHub Actions workflow, Cargo.toml, etc.), OR
 *     - Observed as a detected language across 2 or more distinct public repositories, OR
 *     - Observed as the primary language of at least 1 repository.
 * - PARTIAL:
 *     - Observable in language statistics of a single repository without a verified dependency manifest or primary status.
 * 
 * @param {object} claimedSkill - { skill, category, matchedTerm }
 * @param {Array} matchingEvidence - Matched evidence records
 * @param {Array} repositories - All analyzed repositories
 * @returns {object} Classification record with status, explanation, repositories, and evidence
 */
export function classifySkill(claimedSkill, matchingEvidence = [], repositories = []) {
  const skillName = claimedSkill.skill;
  const category = claimedSkill.category || 'Other';

  // If no observable evidence exists, mark UNVERIFIED
  if (!matchingEvidence || matchingEvidence.length === 0) {
    return {
      skill: skillName,
      category,
      matchedTerm: claimedSkill.matchedTerm || skillName,
      resumeClaim: {
        skill: skillName,
        category,
        matchedTerm: claimedSkill.matchedTerm || skillName
      },
      status: 'UNVERIFIED',
      explanation: 'No observable evidence was found in public repositories, commit language statistics, or package manifests.',
      repositories: [],
      evidence: []
    };
  }

  // Extract unique supporting repositories with links
  const repoMap = new Map();
  for (const ev of matchingEvidence) {
    if (ev.repository && !repoMap.has(ev.repository)) {
      repoMap.set(ev.repository, {
        name: ev.repository,
        url: ev.repositoryUrl || `https://github.com/${ev.repository}`
      });
    }
  }
  const supportingRepositories = Array.from(repoMap.values());
  const repoCount = supportingRepositories.length;

  // Check for strong evidence (dependencies, manifests)
  const hasStrongEvidence = matchingEvidence.some(
    e => e.strength === 'strong' || e.evidenceType === 'dependency' || e.evidenceType === 'manifest'
  );

  // Check if primary language of any repository
  const isPrimaryLanguage = repositories.some(
    r => r.language && (r.language.toLowerCase() === skillName.toLowerCase())
  );

  let status;
  let explanation;

  if (hasStrongEvidence) {
    status = 'PROVED';
    const depCount = matchingEvidence.filter(e => e.evidenceType === 'dependency').length;
    const manifestCount = matchingEvidence.filter(e => e.evidenceType === 'manifest').length;

    if (depCount > 0 && manifestCount > 0) {
      explanation = `Direct proof verified through package dependency declarations and configuration manifests in ${repoCount} ${repoCount === 1 ? 'repository' : 'repositories'}.`;
    } else if (depCount > 0) {
      explanation = `Direct proof verified through declared package dependencies in ${repoCount} ${repoCount === 1 ? 'repository' : 'repositories'}.`;
    } else {
      explanation = `Direct proof verified through project configuration / build manifests in ${repoCount} ${repoCount === 1 ? 'repository' : 'repositories'}.`;
    }
  } else if (repoCount >= 2) {
    status = 'PROVED';
    explanation = `Demonstrated across multiple public repositories (${repoCount} repositories) in active codebase language statistics.`;
  } else if (isPrimaryLanguage) {
    status = 'PROVED';
    explanation = `Demonstrated as the primary codebase language for repository "${supportingRepositories[0]?.name}".`;
  } else {
    status = 'PARTIAL';
    explanation = `Observed in repository language statistics for "${supportingRepositories[0]?.name}", but dedicated package manifests or multi-repository usage were not detected.`;
  }

  return {
    skill: skillName,
    category,
    matchedTerm: claimedSkill.matchedTerm || skillName,
    resumeClaim: {
      skill: skillName,
      category,
      matchedTerm: claimedSkill.matchedTerm || skillName
    },
    status,
    explanation,
    repositories: supportingRepositories,
    evidence: matchingEvidence
  };
}

/**
 * Cross-verification service:
 * Compares each claimed resume skill against available GitHub evidence.
 * 
 * @param {Array} claimedSkills - Extracted resume skills from Stage 2
 * @param {object} githubData - Analyzed GitHub profile and repository evidence from Stage 3
 * @returns {object} { summary: { totalClaimed, proved, partial, unverified, verificationRate, assessment }, results: Array }
 */
export function matchSkills(claimedSkills = [], githubData = {}) {
  const allEvidence = (githubData && Array.isArray(githubData.evidence)) ? githubData.evidence : [];
  const repositories = (githubData && Array.isArray(githubData.repositories)) ? githubData.repositories : [];

  const results = [];
  let proved = 0;
  let partial = 0;
  let unverified = 0;

  for (const claimed of claimedSkills) {
    const matchingEv = findEvidenceForSkill(claimed.skill, allEvidence, repositories);
    const classification = classifySkill(claimed, matchingEv, repositories);

    if (classification.status === 'PROVED') {
      proved++;
    } else if (classification.status === 'PARTIAL') {
      partial++;
    } else {
      unverified++;
    }

    results.push(classification);
  }

  const totalClaimed = claimedSkills.length;
  const verificationRate = totalClaimed > 0 ? Math.round(((proved + (partial * 0.5)) / totalClaimed) * 100) : 0;

  return {
    summary: {
      totalClaimed,
      proved,
      partial,
      unverified,
      verificationRate,
      assessment: 'This SkillProof verification report objectively contrasts technical skills claimed on the uploaded resume with observable, empirical evidence from public GitHub repositories, commit language breakdowns, and package/build manifests. Skills without observable codebase or manifest artifacts remain unverified.'
    },
    results
  };
}
