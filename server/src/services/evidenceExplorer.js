/**
 * SkillProof Evidence Explorer Service (Stage 7)
 * 
 * Normalizes and synthesizes observable GitHub evidence and cross-verification
 * results into a structured format for user inspection.
 * 
 * Semantic Constraints:
 * - Only populate fields when real empirical data exists.
 * - Never fabricate repositories, commits, files, manifests, or evidence.
 * - UNVERIFIED skills must show an honest "No observable evidence found" state.
 */

/**
 * Maps verification status to human-readable proof confidence rating.
 * 
 * @param {string} status - 'PROVED' | 'PARTIAL' | 'UNVERIFIED'
 * @returns {'High' | 'Moderate' | 'Unsubstantiated'}
 */
function getConfidenceRating(status) {
  if (status === 'PROVED') return 'High';
  if (status === 'PARTIAL') return 'Moderate';
  return 'Unsubstantiated';
}

/**
 * Normalizes an evidence artifact into a standardized display structure.
 * 
 * @param {object} ev - Raw evidence item
 * @param {string} skillName - Name of the canonical skill
 * @returns {object} { type, label, details, source }
 */
function normalizeEvidenceItem(ev, skillName) {
  const evType = (ev.evidenceType || '').toLowerCase();
  const details = ev.details || `${skillName} detected`;

  let type = 'Supporting Evidence';
  let label = details;

  if (evType === 'dependency') {
    type = 'Dependency Manifest';
    label = ev.file || (details.includes('package.json') ? 'package.json' : (details.includes('requirements.txt') ? 'requirements.txt' : `${skillName} dependency`));
  } else if (evType === 'manifest') {
    type = 'Configuration Manifest';
    if (details.toLowerCase().includes('docker')) {
      label = 'Dockerfile / docker-compose';
    } else if (details.toLowerCase().includes('github actions') || details.toLowerCase().includes('.github')) {
      label = 'GitHub Actions workflow (.github/)';
    } else {
      label = ev.file || 'Configuration Manifest';
    }
  } else if (evType === 'repository-language') {
    type = 'Language Statistics';
    label = `${skillName} language detected`;
  } else if (evType === 'readme' || details.toLowerCase().includes('readme')) {
    type = 'README';
    label = 'README reference';
  } else if (evType === 'test' || details.toLowerCase().includes('test')) {
    type = 'Tests';
    label = 'Tests detected';
  }

  return {
    type,
    label,
    details,
    source: ev.file || ev.source || ev.repositoryUrl || details
  };
}

/**
 * Builds the Evidence Explorer structure from cross-verification data and GitHub analysis.
 * 
 * @param {object} crossVerification - Output from Stage 4 cross-verification
 * @param {object} github - Output from Stage 3 GitHub repository analysis
 * @returns {{ skills: Array }} Structured evidence explorer payload
 */
export function buildEvidenceExplorer(crossVerification = {}, github = {}) {
  // Graceful handling of missing/empty inputs
  if (!crossVerification && !github) {
    return { skills: [] };
  }

  const rawResults = Array.isArray(crossVerification?.results) ? crossVerification.results : [];
  const rawRepos = Array.isArray(github?.repositories) ? github.repositories : [];

  // Index repositories by name (case-insensitive) for fast lookup
  const repoMap = new Map();
  for (const repo of rawRepos) {
    if (!repo || !repo.name) continue;
    repoMap.set(repo.name.toLowerCase().trim(), repo);
  }

  const skills = [];

  for (const item of rawResults) {
    if (!item || !item.skill) continue;

    const skillName = item.skill;
    const category = item.category || 'Other';
    const status = item.status || 'UNVERIFIED';
    const rationale = item.explanation || (status === 'UNVERIFIED' 
      ? 'No observable evidence was found in public repositories, commit language statistics, or package manifests.'
      : 'Verified through observable GitHub repository evidence.');
    const confidence = getConfidenceRating(status);

    // Identify supporting repositories and their specific evidence for this skill
    const skillEvList = Array.isArray(item.evidence) ? item.evidence : [];
    const skillRepoRefs = Array.isArray(item.repositories) ? item.repositories : [];

    // Group evidence items by repository name
    const repoEvidenceMap = new Map();

    for (const ev of skillEvList) {
      if (!ev || !ev.repository) continue;
      const rKey = ev.repository.toLowerCase().trim();
      if (!repoEvidenceMap.has(rKey)) {
        repoEvidenceMap.set(rKey, []);
      }
      repoEvidenceMap.get(rKey).push(ev);
    }

    // Ensure any repo mentioned in item.repositories is accounted for even if evidence list is empty
    for (const rRef of skillRepoRefs) {
      const rName = typeof rRef === 'string' ? rRef : (rRef?.name || '');
      if (!rName) continue;
      const rKey = rName.toLowerCase().trim();
      if (!repoEvidenceMap.has(rKey)) {
        repoEvidenceMap.set(rKey, []);
      }
    }

    const repositories = [];
    let languageEvidenceCount = 0;
    let manifestEvidenceCount = 0;
    let configEvidenceCount = 0;
    let testEvidenceCount = 0;
    let readmeEvidenceCount = 0;

    for (const [rKey, evItems] of repoEvidenceMap.entries()) {
      const repoMeta = repoMap.get(rKey);
      const repoName = repoMeta?.name || (typeof skillRepoRefs.find(r => (typeof r === 'string' ? r : r.name).toLowerCase() === rKey) === 'object'
        ? skillRepoRefs.find(r => r.name.toLowerCase() === rKey).name
        : rKey);

      const htmlUrl = repoMeta?.url || repoMeta?.htmlUrl || repoMeta?.html_url || (typeof skillRepoRefs.find(r => (typeof r === 'string' ? r : r.name).toLowerCase() === rKey) === 'object'
        ? skillRepoRefs.find(r => r.name.toLowerCase() === rKey).url
        : `https://github.com/${repoName}`);

      const normalizedEvList = [];
      const seenEvKeys = new Set();

      for (const ev of evItems) {
        const norm = normalizeEvidenceItem(ev, skillName);
        const evDedupKey = `${norm.type}::${norm.label}`;
        if (!seenEvKeys.has(evDedupKey)) {
          seenEvKeys.add(evDedupKey);
          normalizedEvList.push(norm);

          if (norm.type === 'Language Statistics') languageEvidenceCount++;
          else if (norm.type === 'Dependency Manifest') manifestEvidenceCount++;
          else if (norm.type === 'Configuration Manifest') configEvidenceCount++;
          else if (norm.type === 'Tests') testEvidenceCount++;
          else if (norm.type === 'README') readmeEvidenceCount++;
        }
      }

      repositories.push({
        name: repoName,
        fullName: repoMeta?.fullName || repoMeta?.full_name || repoName,
        htmlUrl,
        description: repoMeta?.description || null,
        language: repoMeta?.language || (repoMeta?.languages && repoMeta.languages[0]) || null,
        updatedAt: repoMeta?.updatedAt || repoMeta?.updated_at || null,
        stars: typeof repoMeta?.stars === 'number' ? repoMeta.stars : (repoMeta?.stargazers_count || 0),
        forks: typeof repoMeta?.forks === 'number' ? repoMeta.forks : (repoMeta?.forks_count || 0),
        evidence: normalizedEvList
      });
    }

    skills.push({
      skill: skillName,
      category,
      status,
      rationale,
      confidence,
      repositories,
      evidenceSummary: {
        repositories: repositories.length,
        commits: null, // Commit history not queried to avoid rate limits
        languages: languageEvidenceCount,
        manifests: manifestEvidenceCount,
        configurations: configEvidenceCount,
        tests: testEvidenceCount,
        readmeReferences: readmeEvidenceCount
      }
    });
  }

  return { skills };
}
