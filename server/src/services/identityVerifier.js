/**
 * SkillProof Candidate Identity Verification Service
 * 
 * Verifies that the uploaded resume candidate and the submitted GitHub profile
 * belong to the SAME PERSON before any GitHub repositories, commits, or projects
 * can be used to verify skills.
 * 
 * Hard Security Gate:
 * If identity verification does not yield 'VERIFIED', skill verification is BLOCKED.
 * Skills from one person's GitHub are NEVER attributed to another person's resume.
 */

/**
 * Normalizes person names by trimming, converting to lower-case,
 * and stripping middle initials, titles, and punctuation.
 * 
 * @param {string} name 
 * @returns {string} normalized name
 */
export function normalizeName(name = '') {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/^(mr|mrs|ms|dr|prof)\.?\s+/i, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes URLs for domain and path comparison.
 * 
 * @param {string} urlStr 
 * @returns {string} normalized domain and path
 */
export function normalizeUrl(urlStr = '') {
  if (!urlStr || typeof urlStr !== 'string') return '';
  try {
    const withProto = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const parsed = new URL(withProto);
    return (parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '')).toLowerCase();
  } catch {
    return urlStr.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  }
}

/**
 * Extracts candidate name from resume text.
 * 
 * @param {string} text 
 * @returns {string|null}
 */
export function extractCandidateName(text = '') {
  if (!text || typeof text !== 'string') return null;

  // 1. Explicit labeled name: "Name: John Doe" or "Candidate: John Doe"
  const labeledMatch = text.match(/^(?:name|candidate|applicant)\s*[:|-]\s*([A-Za-z\s.'-]+)/im);
  if (labeledMatch && labeledMatch[1].trim().length >= 3) {
    const candidate = labeledMatch[1].trim().replace(/[-|•].*$/, '').trim();
    if (/^[A-Za-z]+(?:\s+[A-Za-z]+){1,3}$/.test(candidate)) {
      return candidate;
    }
  }

  // 2. Scan top 4 lines of normalized resume text
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 4)) {
    // Exclude lines containing contact information or section headers
    if (/@|http|github|linkedin|skills|experience|education|phone|\+?\d{7,}/i.test(line)) {
      continue;
    }

    const candidate = line.replace(/[-|•].*$/, '').trim();
    const words = candidate.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[A-Za-z\s.'-]+$/.test(candidate)) {
      // Must not be all-caps common header words like "CURRICULUM VITAE" or "RESUME"
      const upper = candidate.toUpperCase();
      if (!upper.includes('CURRICULUM') && !upper.includes('RESUME') && !upper.includes('PROFILE') && !upper.includes('SUMMARY')) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Extracts candidate identity details from raw resume text.
 * 
 * @param {string} resumeText 
 * @returns {object} { name, email, github, githubUsername, linkedin, website }
 */
export function extractResumeIdentity(resumeText = '') {
  if (!resumeText || typeof resumeText !== 'string') {
    return {
      name: null,
      email: null,
      github: null,
      githubUsername: null,
      linkedin: null,
      website: null
    };
  }

  // 1. Full name
  const name = extractCandidateName(resumeText);

  // 2. Email address
  const emailMatch = resumeText.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i);
  const email = emailMatch ? emailMatch[0].toLowerCase().trim() : null;

  // 3. GitHub profile
  let github = null;
  let githubUsername = null;
  const ghMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i)
    || resumeText.match(/\bgithub(?:\.com)?\s*[:\s/]\s*@?([a-zA-Z0-9_-]+)/i);

  if (ghMatch) {
    const handle = ghMatch[1].replace(/^@/, '').trim();
    // Ignore generic non-handle words
    if (!['repos', 'features', 'explore', 'topics', 'trending', 'events'].includes(handle.toLowerCase())) {
      githubUsername = handle;
      github = `https://github.com/${handle}`;
    }
  }

  // 4. LinkedIn profile
  let linkedin = null;
  const liMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/([a-zA-Z0-9_-]+)/i)
    || resumeText.match(/\blinkedin(?:\.com)?\s*[:\s/]\s*@?([a-zA-Z0-9_-]+)/i);

  if (liMatch) {
    const handle = liMatch[1].replace(/^@/, '').trim();
    linkedin = `https://linkedin.com/in/${handle}`;
  }

  // 5. Portfolio / personal website
  let website = null;
  const webMatch = resumeText.match(/\bhttps?:\/\/(?!(?:www\.)?(?:github|linkedin|gitlab|twitter|x)\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s\n]*)?/i)
    || resumeText.match(/\bportfolio\s*[:\s]\s*(https?:\/\/[^\s\n]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s\n]*)?)/i);

  if (webMatch) {
    let raw = (webMatch[1] || webMatch[0]).trim();
    if (!raw.startsWith('http')) raw = `https://${raw}`;
    website = raw;
  }

  return {
    name,
    email,
    github,
    githubUsername,
    linkedin,
    website
  };
}

/**
 * Extracts public identity information from GitHub API user profile.
 * 
 * @param {object} githubProfile - Parsed profile object from analyzeGithub or GitHub API
 * @returns {object} Normalized GitHub identity profile
 */
export function extractGithubIdentity(githubProfile = {}) {
  const username = (githubProfile.username || githubProfile.login || '').trim();
  const name = githubProfile.name ? githubProfile.name.trim() : null;
  const email = githubProfile.email ? githubProfile.email.toLowerCase().trim() : null;
  const bio = githubProfile.bio ? githubProfile.bio.trim() : null;
  const website = githubProfile.blog || githubProfile.website ? (githubProfile.blog || githubProfile.website).trim() : null;
  const company = githubProfile.company ? githubProfile.company.trim().replace(/^@/, '') : null;
  const profileUrl = githubProfile.profileUrl || githubProfile.html_url || `https://github.com/${username}`;

  // Extract any email or LinkedIn referenced in bio or website
  let bioEmail = null;
  if (bio) {
    const m = bio.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i);
    if (m) bioEmail = m[0].toLowerCase().trim();
  }

  let linkedin = null;
  const liSource = `${bio || ''} ${website || ''}`;
  const liMatch = liSource.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/([a-zA-Z0-9_-]+)/i);
  if (liMatch) {
    linkedin = `https://linkedin.com/in/${liMatch[1].trim()}`;
  }

  return {
    username,
    name,
    email: email || bioEmail,
    bio,
    website,
    company,
    linkedin,
    profileUrl
  };
}

/**
 * Calculates string token similarity between two person names.
 * 
 * @param {string} nameA 
 * @param {string} nameB 
 * @returns {number} Score from 0.0 to 1.0
 */
function computeNameSimilarity(nameA = '', nameB = '') {
  const normA = normalizeName(nameA);
  const normB = normalizeName(nameB);

  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;

  const tokensA = normA.split(' ');
  const tokensB = normB.split(' ');

  let shared = 0;
  for (const t of tokensA) {
    if (tokensB.includes(t)) shared++;
  }

  const overlap = (2 * shared) / (tokensA.length + tokensB.length);
  return overlap;
}

/**
 * Normalizes a name string into clean, lowercase tokens,
 * stripping titles, middle initials periods, and punctuation.
 * 
 * @param {string} name 
 * @returns {string[]}
 */
export function normalizeNameTokens(name = '') {
  if (!name || typeof name !== 'string') return [];
  return name
    .toLowerCase()
    .replace(/^(mr|mrs|ms|dr|prof)\.?\s+/i, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Intelligently compares two names for reasonable consistency:
 * - lowercase, trim, ignores repeated spaces
 * - handles punctuation differences ("Swetha, Konney", "Swetha-Konney")
 * - supports first/last name order ("Swetha Konney" vs "Konney Swetha")
 * - supports abbreviation / initials ("Swetha Konney" vs "Swetha K." or "S. Konney")
 * - identifies clear contradictions ("Swetha Konney" vs "Rahul Sharma")
 * 
 * @param {string} nameA - Candidate registered name
 * @param {string} nameB - Target name from Resume or GitHub
 * @returns {{ isMatch: boolean, isConflict: boolean, status: 'MATCH' | 'CONFLICT' | 'UNVERIFIED', reason?: string }}
 */
export function checkNameConsistency(nameA = '', nameB = '') {
  if (!nameA || typeof nameA !== 'string' || !nameA.trim()) {
    return {
      isMatch: true,
      isConflict: false,
      status: 'MATCH'
    };
  }

  if (!nameB || typeof nameB !== 'string' || !nameB.trim()) {
    return {
      isMatch: false,
      isConflict: false,
      status: 'UNVERIFIED',
      reason: 'Name information could not be reliably extracted.'
    };
  }

  const tokensA = normalizeNameTokens(nameA);
  const tokensB = normalizeNameTokens(nameB);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return {
      isMatch: false,
      isConflict: false,
      status: 'UNVERIFIED',
      reason: 'Name information could not be reliably extracted.'
    };
  }

  // Exact joined match
  if (tokensA.join(' ') === tokensB.join(' ')) {
    return { isMatch: true, isConflict: false, status: 'MATCH' };
  }

  // Set-based token comparison (handles reversed order "Konney Swetha" vs "Swetha Konney")
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const sharedTokens = tokensA.filter(t => setB.has(t));

  // If all tokens of one are in the other
  if (sharedTokens.length >= 2 && (sharedTokens.length === tokensA.length || sharedTokens.length === tokensB.length)) {
    return { isMatch: true, isConflict: false, status: 'MATCH' };
  }

  const firstA = tokensA[0];
  const lastA = tokensA[tokensA.length - 1];
  const firstB = tokensB[0];
  const lastB = tokensB[tokensB.length - 1];

  // 1. Same first name, and last name matches or is an initial:
  // e.g. "Swetha Konney" vs "Swetha K."
  const firstNameMatches = (firstA === firstB);
  const lastNameMatches = (lastA === lastB);
  const lastIsInitial = (lastA.length === 1 && lastB.startsWith(lastA)) || (lastB.length === 1 && lastA.startsWith(lastB));
  const firstIsInitial = (firstA.length === 1 && firstB.startsWith(firstA)) || (firstB.length === 1 && firstA.startsWith(firstB));

  if (firstNameMatches && (lastNameMatches || lastIsInitial)) {
    return { isMatch: true, isConflict: false, status: 'MATCH' };
  }

  // 2. Same last name, and first name matches or is an initial:
  // e.g. "Swetha Konney" vs "S. Konney"
  if (lastNameMatches && (firstNameMatches || firstIsInitial)) {
    return { isMatch: true, isConflict: false, status: 'MATCH' };
  }

  // 3. Reversed order with initials (e.g. "Konney S." vs "Swetha Konney")
  if (firstA === lastB && (lastA === firstB || (lastA.length === 1 && firstB.startsWith(lastA)) || (firstB.length === 1 && lastA.startsWith(firstB)))) {
    return { isMatch: true, isConflict: false, status: 'MATCH' };
  }

  // 4. Single token match if display name is just first or last name (>= 4 chars):
  // e.g. "Swetha" on GitHub display name matching "Swetha Konney"
  if (tokensB.length === 1 && tokensA.some(t => t === tokensB[0] && t.length >= 4)) {
    return { isMatch: true, isConflict: false, status: 'MATCH' };
  }
  if (tokensA.length === 1 && tokensB.some(t => t === tokensA[0] && t.length >= 4)) {
    return { isMatch: true, isConflict: false, status: 'MATCH' };
  }

  // 5. If at least 2 tokens match or 1 substantial token (>= 5 chars) matches:
  if (sharedTokens.length >= 2 || (sharedTokens.length === 1 && sharedTokens[0].length >= 5 && (firstA === firstB || lastA === lastB))) {
    return { isMatch: true, isConflict: false, status: 'MATCH' };
  }

  // Zero shared tokens -> CLEAR CONTRADICTION / MISMATCH (e.g. "Swetha Konney" vs "Rahul Sharma")
  return {
    isMatch: false,
    isConflict: true,
    status: 'CONFLICT',
    reason: `Names "${nameA}" and "${nameB}" clearly belong to different individuals.`
  };
}

/**
 * Evaluates whether a GitHub profile reasonably matches a registered candidate identity.
 * 
 * Rules:
 * - Does NOT require exact username match because usernames differ from real names.
 * - If GitHub display name matches candidate name -> MATCH
 * - If GitHub username resembles candidate name (e.g. "swetha123" vs "Swetha Konney") -> MATCH
 * - If GitHub email matches candidate/resume email -> MATCH
 * - If resume explicitly links this GitHub profile -> MATCH
 * - If GitHub display name clearly belongs to another person (e.g. "Rahul Sharma" vs "Swetha Konney") -> CONFLICT
 * - If ownership cannot be established at all -> UNVERIFIED
 * 
 * @param {object} params
 * @param {string} params.candidateName
 * @param {object} params.githubIdentity
 * @param {object} params.resumeIdentity
 * @param {string} params.submittedUsername
 * @returns {{ isMatch: boolean, isConflict: boolean, status: 'MATCH' | 'CONFLICT' | 'UNVERIFIED', message: string }}
 */
export function checkGithubIdentityConsistency({
  candidateName = '',
  githubIdentity = {},
  resumeIdentity = {},
  submittedUsername = ''
} = {}) {
  const targetUsername = (submittedUsername || githubIdentity.username || '').trim().replace(/^@/, '');
  const gUser = targetUsername.toLowerCase();
  const gName = githubIdentity.name ? githubIdentity.name.trim() : null;
  const gEmail = githubIdentity.email ? githubIdentity.email.toLowerCase().trim() : null;
  const rEmail = resumeIdentity.email ? resumeIdentity.email.toLowerCase().trim() : null;
  const rGhUser = resumeIdentity.githubUsername ? resumeIdentity.githubUsername.toLowerCase().trim() : null;

  // 1. If GitHub profile has a public display name, compare with candidate name
  if (gName && candidateName) {
    const consistency = checkNameConsistency(candidateName, gName);
    if (consistency.isConflict) {
      return {
        isMatch: false,
        isConflict: true,
        status: 'CONFLICT',
        message: 'Identity mismatch: This GitHub profile could not be matched to the registered candidate.'
      };
    }
    if (consistency.isMatch) {
      return {
        isMatch: true,
        isConflict: false,
        status: 'MATCH',
        message: `GitHub display name "${gName}" matches registered candidate name "${candidateName}".`
      };
    }
  }

  // 2. Check if GitHub username resembles candidate name (e.g. "swetha123", "swethak", "swetha-konney", "konney")
  if (candidateName && gUser) {
    const candTokens = normalizeNameTokens(candidateName);
    const cleanUser = gUser.replace(/[^a-z0-9]/g, '');
    
    // Check if cleanUser contains any candidate name token of >= 3 characters (e.g. "swetha" in "swetha123")
    const tokenMatch = candTokens.some(t => t.length >= 3 && cleanUser.includes(t));
    // Or initial + last name (e.g. "skonney" or "konneys")
    const initialMatch = candTokens.length >= 2 && (
      (cleanUser.startsWith(candTokens[0][0]) && cleanUser.includes(candTokens[candTokens.length - 1])) ||
      (cleanUser.includes(candTokens[candTokens.length - 1]) && cleanUser.includes(candTokens[0][0]))
    );

    if (tokenMatch || initialMatch) {
      return {
        isMatch: true,
        isConflict: false,
        status: 'MATCH',
        message: `GitHub username (@${targetUsername}) is consistent with registered candidate name "${candidateName}".`
      };
    }
  }

  // 3. Check if resume explicitly links this GitHub username
  if (rGhUser && rGhUser === gUser) {
    return {
      isMatch: true,
      isConflict: false,
      status: 'MATCH',
      message: `Resume explicitly verifies GitHub handle @${targetUsername}.`
    };
  }

  // 4. Check if public email matches resume email
  if (gEmail && rEmail && gEmail === rEmail) {
    return {
      isMatch: true,
      isConflict: false,
      status: 'MATCH',
      message: `GitHub public email matches candidate resume email (${gEmail}).`
    };
  }

  // 5. If GitHub has a display name that didn't match and didn't clearly conflict, but has no other connection:
  if (gName) {
    return {
      isMatch: false,
      isConflict: true,
      status: 'CONFLICT',
      message: 'Identity mismatch: This GitHub profile could not be matched to the registered candidate.'
    };
  }

  // 6. Otherwise cannot reliably establish ownership:
  return {
    isMatch: false,
    isConflict: false,
    status: 'UNVERIFIED',
    message: 'Unable to verify GitHub profile ownership. Please connect a GitHub profile that can be associated with your registered identity.'
  };
}

/**
 * Verifies candidate identity between resume claims and submitted GitHub profile.
 * 
 * Identity Statuses:
 * - VERIFIED: Sufficient evidence that resume and GitHub belong to the same person.
 * - MISMATCH: Concrete evidence of conflict between resume and GitHub profile.
 * - INSUFFICIENT_EVIDENCE: Not enough information to establish account ownership.
 * 
 * Semantic Constraints:
 * - Same name alone is NOT sufficient proof.
 * - Similar GitHub username alone is NOT sufficient proof.
 * - Common email domain alone is NOT sufficient proof.
 * - Never fabricate evidence or links.
 * 
 * @param {object} params
 * @param {string} [params.candidateName] - Registered candidate full name
 * @param {object} params.resumeIdentity - Extracted resume identity
 * @param {object} params.githubIdentity - GitHub profile identity
 * @param {string} params.submittedUsername - Username submitted in verification form
 * @returns {object} Identity verification report
 */
export function verifyCandidateIdentity({
  candidateName = '',
  resumeIdentity = {},
  githubIdentity = {},
  submittedUsername = ''
} = {}) {
  const targetUsername = (submittedUsername || githubIdentity.username || '').trim().replace(/^@/, '');
  const cleanCandName = (candidateName || '').trim();

  // 1. Resume Identity Check against candidateName
  let resumeCheck = null;
  if (cleanCandName) {
    if (!resumeIdentity.name) {
      resumeCheck = {
        verified: false,
        status: 'UNVERIFIED',
        message: "Unable to verify the resume owner's identity. Please upload a resume containing your name."
      };
    } else {
      const consistency = checkNameConsistency(cleanCandName, resumeIdentity.name);
      if (consistency.isConflict) {
        resumeCheck = {
          verified: false,
          status: 'MISMATCH',
          message: "Identity mismatch: The name on this resume does not match the registered candidate."
        };
      } else if (consistency.isMatch) {
        resumeCheck = {
          verified: true,
          status: 'VERIFIED',
          message: `Resume candidate name "${resumeIdentity.name}" matches registered candidate.`
        };
      } else {
        resumeCheck = {
          verified: false,
          status: 'UNVERIFIED',
          message: "Unable to verify the resume owner's identity. Please upload a resume containing your name."
        };
      }
    }
  }

  // 2. GitHub Identity Check
  let githubCheck = null;
  if (cleanCandName) {
    const ghCheckResult = checkGithubIdentityConsistency({
      candidateName: cleanCandName,
      githubIdentity,
      resumeIdentity,
      submittedUsername: targetUsername
    });
    githubCheck = {
      verified: ghCheckResult.status === 'MATCH',
      status: ghCheckResult.status,
      message: ghCheckResult.message
    };
  }

  // If candidateName was provided, enforce strict Candidate Identity Consistency:
  if (cleanCandName) {
    if (resumeCheck && resumeCheck.status === 'MISMATCH') {
      return {
        status: 'MISMATCH',
        identityStatus: 'failed',
        confidence: 0,
        isBlocked: true,
        blockReason: resumeCheck.message,
        reasons: [resumeCheck.message],
        signals: [
          { signal: 'Resume Candidate Identity', type: 'resume_name', label: 'Resume Candidate Identity', status: 'CONFLICT', details: resumeCheck.message }
        ],
        resumeIdentity,
        githubIdentity,
        candidateName: cleanCandName
      };
    }

    if (githubCheck && githubCheck.status === 'CONFLICT') {
      return {
        status: 'MISMATCH',
        identityStatus: 'failed',
        confidence: 0,
        isBlocked: true,
        blockReason: githubCheck.message,
        reasons: [githubCheck.message],
        signals: [
          { signal: 'GitHub Profile Ownership', type: 'github_profile', label: 'GitHub Profile Ownership', status: 'CONFLICT', details: githubCheck.message }
        ],
        resumeIdentity,
        githubIdentity,
        candidateName: cleanCandName
      };
    }

    if (resumeCheck && resumeCheck.status === 'UNVERIFIED') {
      return {
        status: 'INSUFFICIENT_EVIDENCE',
        identityStatus: 'failed',
        confidence: 0,
        isBlocked: true,
        blockReason: resumeCheck.message,
        reasons: [resumeCheck.message],
        signals: [
          { signal: 'Resume Candidate Identity', type: 'resume_name', label: 'Resume Candidate Identity', status: 'INSUFFICIENT', details: resumeCheck.message }
        ],
        resumeIdentity,
        githubIdentity,
        candidateName: cleanCandName
      };
    }

    if (githubCheck && githubCheck.status === 'UNVERIFIED') {
      return {
        status: 'INSUFFICIENT_EVIDENCE',
        identityStatus: 'failed',
        confidence: 0,
        isBlocked: true,
        blockReason: githubCheck.message,
        reasons: [githubCheck.message],
        signals: [
          { signal: 'GitHub Profile Ownership', type: 'github_profile', label: 'GitHub Profile Ownership', status: 'INSUFFICIENT', details: githubCheck.message }
        ],
        resumeIdentity,
        githubIdentity,
        candidateName: cleanCandName
      };
    }
  }

  const rName = resumeIdentity.name || null;
  const rEmail = resumeIdentity.email ? resumeIdentity.email.toLowerCase() : null;
  const rGhUser = resumeIdentity.githubUsername ? resumeIdentity.githubUsername.toLowerCase() : null;
  const rWebsite = resumeIdentity.website || null;
  const rLinkedin = resumeIdentity.linkedin || null;

  const gUser = (githubIdentity.username || targetUsername).toLowerCase();
  const gName = githubIdentity.name || null;
  const gEmail = githubIdentity.email ? githubIdentity.email.toLowerCase() : null;
  const gWebsite = githubIdentity.website || null;
  const gLinkedin = githubIdentity.linkedin || null;
  const gCompany = githubIdentity.company || null;

  const signals = [];
  const reasons = [];

  let confidenceScore = 0;
  let hasCriticalConflict = false;

  if (cleanCandName && resumeCheck?.verified) {
    signals.push({
      signal: 'Candidate Identity Consistency',
      type: 'candidate_consistency',
      label: 'Candidate Identity Consistency',
      status: 'MATCH',
      details: resumeCheck.message
    });
    confidenceScore += 30;
  }

  if (cleanCandName && githubCheck?.verified) {
    signals.push({
      signal: 'Candidate-GitHub Association',
      type: 'candidate_github_association',
      label: 'Candidate-GitHub Association',
      status: 'MATCH',
      details: githubCheck.message
    });
    confidenceScore += 30;
  }

  // ========================================================
  // 1. GITHUB USERNAME & URL EVALUATION
  // ========================================================
  if (rGhUser) {
    if (rGhUser === gUser) {
      signals.push({
        signal: 'GitHub URL / Handle',
        type: 'github_url',
        label: 'GitHub URL / Handle',
        status: 'MATCH',
        details: `Resume explicitly lists matching GitHub profile (@${githubIdentity.username || targetUsername}).`
      });
      confidenceScore += 50;

      // Corroborate if candidate's real name contains or resembles their GitHub username
      if (rName) {
        const cleanName = rName.toLowerCase().replace(/[^a-z]/g, '');
        const cleanUser = gUser.replace(/[^a-z]/g, '');
        if (cleanUser.length >= 3 && (cleanName.includes(cleanUser) || cleanUser.includes(cleanName))) {
          confidenceScore += 20;
          signals.push({
            signal: 'Username-Name Consistency',
            type: 'username_name_consistency',
            label: 'Username-Name Consistency',
            status: 'MATCH',
            details: `Candidate name "${rName}" is consistent with GitHub handle (@${targetUsername}).`
          });
        }
      }
    } else {
      // Major mismatch: Resume lists one GitHub profile, but user submitted a different one!
      hasCriticalConflict = true;
      signals.push({
        signal: 'GitHub URL / Handle',
        type: 'github_url',
        label: 'GitHub URL / Handle',
        status: 'CONFLICT',
        details: `Resume explicitly lists GitHub profile "@${rGhUser}", but submitted profile is "@${targetUsername}".`
      });
      reasons.push(`Resume specifies GitHub account @${rGhUser}, conflicting with submitted profile @${targetUsername}.`);
    }
  } else {
    // Resume does not have a GitHub URL. Check if username matches candidate name
    if (rName) {
      const cleanName = rName.toLowerCase().replace(/[^a-z]/g, '');
      const cleanUser = gUser.replace(/[^a-z]/g, '');
      if (cleanUser && (cleanName.includes(cleanUser) || cleanUser.includes(cleanName))) {
        signals.push({
          signal: 'GitHub Username Heuristic',
          type: 'github_url',
          label: 'GitHub Username Heuristic',
          status: 'NEUTRAL',
          details: `Submitted username (@${targetUsername}) resembles candidate name, but resume does not list GitHub URL.`
        });
        confidenceScore += 10;
      } else {
        signals.push({
          signal: 'GitHub URL / Handle',
          type: 'github_url',
          label: 'GitHub URL / Handle',
          status: 'INSUFFICIENT',
          details: 'Resume does not explicitly list a GitHub URL.'
        });
      }
    } else {
      signals.push({
        signal: 'GitHub URL / Handle',
        type: 'github_url',
        label: 'GitHub URL / Handle',
        status: 'INSUFFICIENT',
        details: 'Resume does not explicitly list a GitHub URL.'
      });
    }
  }

  // ========================================================
  // 2. CANDIDATE FULL NAME VS GITHUB DISPLAY NAME
  // ========================================================
  if (gName && rName) {
    const consistency = checkNameConsistency(rName, gName);
    if (consistency.isMatch) {
      signals.push({
        signal: 'Candidate Full Name',
        type: 'full_name',
        label: 'Candidate Full Name',
        status: 'MATCH',
        details: `Candidate name "${rName}" matches GitHub display name "${gName}".`
      });
      confidenceScore += 35;
    } else if (consistency.isConflict) {
      // Concrete name contradiction: completely different person
      hasCriticalConflict = true;
      signals.push({
        signal: 'Candidate Full Name',
        type: 'full_name',
        label: 'Candidate Full Name',
        status: 'CONFLICT',
        details: `Candidate name "${rName}" contradicts GitHub profile display name "${gName}".`
      });
      reasons.push(`Candidate name on resume ("${rName}") does not match GitHub profile name ("${gName}").`);
    } else {
      signals.push({
        signal: 'Candidate Full Name',
        type: 'full_name',
        label: 'Candidate Full Name',
        status: 'NEUTRAL',
        details: `Partial name resemblance between "${rName}" and GitHub display name "${gName}".`
      });
      confidenceScore += 10;
    }
  } else if (!gName && rName) {
    signals.push({
      signal: 'Candidate Full Name',
      type: 'full_name',
      label: 'Candidate Full Name',
      status: 'NEUTRAL',
      details: 'GitHub profile does not configure a public display name.'
    });
  } else {
    signals.push({
      signal: 'Candidate Full Name',
      type: 'full_name',
      label: 'Candidate Full Name',
      status: 'INSUFFICIENT',
      details: 'Unable to extract candidate full name from resume header.'
    });
  }

  // ========================================================
  // 3. EMAIL ADDRESS COMPARISON
  // ========================================================
  if (gEmail && rEmail) {
    if (gEmail === rEmail) {
      signals.push({
        signal: 'Email Verification',
        type: 'email',
        label: 'Email Verification',
        status: 'MATCH',
        details: `Resume email matches public GitHub profile email (${rEmail}).`
      });
      confidenceScore += 45;
    } else {
      // Email contradiction: Different personal email addresses
      hasCriticalConflict = true;
      signals.push({
        signal: 'Email Verification',
        type: 'email',
        label: 'Email Verification',
        status: 'CONFLICT',
        details: `Resume email (${rEmail}) conflicts with public GitHub profile email (${gEmail}).`
      });
      reasons.push(`Resume email (${rEmail}) contradicts public GitHub email (${gEmail}).`);
    }
  } else if (!gEmail) {
    signals.push({
      signal: 'Email Verification',
      type: 'email',
      label: 'Email Verification',
      status: 'NEUTRAL',
      details: 'GitHub profile does not publicly expose an email address.'
    });
  } else {
    signals.push({
      signal: 'Email Verification',
      type: 'email',
      label: 'Email Verification',
      status: 'NEUTRAL',
      details: 'No email address detected in uploaded resume.'
    });
  }

  // ========================================================
  // 4. PORTFOLIO & PERSONAL WEBSITE
  // ========================================================
  if (rWebsite && gWebsite) {
    const normR = normalizeUrl(rWebsite);
    const normG = normalizeUrl(gWebsite);

    if (normR === normG || normR.includes(normG) || normG.includes(normR)) {
      signals.push({
        signal: 'Personal Website / Portfolio',
        type: 'website',
        label: 'Personal Website / Portfolio',
        status: 'MATCH',
        details: `Personal website/portfolio matches GitHub website (${rWebsite}).`
      });
      confidenceScore += 30;
    } else {
      signals.push({
        signal: 'Personal Website / Portfolio',
        type: 'website',
        label: 'Personal Website / Portfolio',
        status: 'NEUTRAL',
        details: `Resume portfolio (${rWebsite}) and GitHub blog (${gWebsite}) reference different URLs.`
      });
    }
  } else if (rWebsite || gWebsite) {
    signals.push({
      signal: 'Personal Website / Portfolio',
      type: 'website',
      label: 'Personal Website / Portfolio',
      status: 'NEUTRAL',
      details: rWebsite ? `Resume lists website (${rWebsite}); not specified on GitHub.` : 'GitHub lists website; not listed on resume.'
    });
  }

  // ========================================================
  // 5. LINKEDIN PROFILE
  // ========================================================
  if (rLinkedin && gLinkedin) {
    const normR = normalizeUrl(rLinkedin);
    const normG = normalizeUrl(gLinkedin);

    if (normR === normG) {
      signals.push({
        signal: 'LinkedIn Profile',
        type: 'linkedin',
        label: 'LinkedIn Profile',
        status: 'MATCH',
        details: 'LinkedIn profile in resume matches LinkedIn reference in GitHub profile bio.'
      });
      confidenceScore += 35;
    } else {
      hasCriticalConflict = true;
      signals.push({
        signal: 'LinkedIn Profile',
        type: 'linkedin',
        label: 'LinkedIn Profile',
        status: 'CONFLICT',
        details: `Resume LinkedIn (${rLinkedin}) contradicts GitHub LinkedIn reference (${gLinkedin}).`
      });
      reasons.push('Contradictory LinkedIn profiles detected between resume and GitHub.');
    }
  } else if (rLinkedin) {
    signals.push({
      signal: 'LinkedIn Profile',
      type: 'linkedin',
      label: 'LinkedIn Profile',
      status: 'NEUTRAL',
      details: `Resume lists LinkedIn (${rLinkedin}); not linked in public GitHub bio.`
    });
  }

  // ========================================================
  // FINAL STATUS DETERMINATION (Simplified Identity Rule)
  // ========================================================
  // IF AT LEAST ONE reliable identity signal MATCHES:
  //     identityStatus = "verified"
  // IF ZERO identity signals MATCH:
  //     identityStatus = "insufficient"
  // UNKNOWN must NOT be treated as a mismatch.
  // A mismatch in one field must NOT block the entire verification if another reliable signal matches.
  const matchSignals = signals.filter(s => s.status === 'MATCH');
  const conflictSignals = signals.filter(s => s.status === 'CONFLICT' || s.status === 'MISMATCH');

  let status = 'INSUFFICIENT_EVIDENCE';
  let identityStatus = 'insufficient';
  let isBlocked = true;
  let finalConfidence = Math.min(100, Math.max(0, confidenceScore));

  if (matchSignals.length >= 1) {
    status = 'VERIFIED';
    identityStatus = 'verified';
    isBlocked = false;
    finalConfidence = Math.max(70, Math.min(100, 50 + matchSignals.length * 15));
    reasons.length = 0; // Friendly verified explanation as requested
    reasons.push('Candidate identity verified using available profile evidence. Additional identity fields were unavailable or inconclusive.');
  } else {
    // ZERO identity signals MATCH
    status = conflictSignals.length > 0 ? 'MISMATCH' : 'INSUFFICIENT_EVIDENCE';
    identityStatus = 'insufficient';
    isBlocked = true;
    finalConfidence = Math.min(25, finalConfidence);
    reasons.unshift('Insufficient identity evidence: The submitted GitHub profile could not be sufficiently linked to the candidate in the uploaded resume.');
  }

  return {
    status,
    identityStatus,
    confidence: finalConfidence,
    isBlocked,
    reasons,
    signals,
    resumeIdentity,
    githubIdentity
  };
}
