/**
 * SkillProof Client API Service
 * 
 * Handles multipart uploads of resume PDFs and GitHub profile verification requests.
 */

/**
 * Sends the candidate's resume PDF and GitHub handle to the backend verification endpoint.
 *
 * @param {File} resumeFile 
 * @param {string} githubUsername 
 * @returns {Promise<{ success: boolean, githubUsername: string, resume: { filename: string, pages: number, textLength: number, text: string } }>}
 */
export async function verifyCandidate(resumeFile, githubUsername) {
  if (!resumeFile) {
    throw new Error('Please select a resume PDF file.');
  }

  if (!githubUsername || !githubUsername.trim()) {
    throw new Error('Please enter a GitHub username.');
  }

  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('githubUsername', githubUsername.trim());

  // Note: Do NOT set 'Content-Type' header manually!
  // The browser automatically computes the boundary for multipart/form-data.
  const response = await fetch('/api/verify', {
    method: 'POST',
    body: formData
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Request failed with status code ${response.status}`);
  }

  return result;
}

/**
 * Analyzes candidate skills and cross-verification results against a job description.
 *
 * @param {object} params
 * @param {string} params.jobDescription - Raw job description text
 * @param {Array} params.claimedSkills - Extracted claimed skills from Stage 2
 * @param {object} params.crossVerification - Cross-verification output from Stage 4
 * @returns {Promise<object>} Match analysis results
 */
export async function analyzeJobMatch({ jobDescription, sessionId, claimedSkills, verifiedSkills, crossVerification }) {
  if (!jobDescription || (typeof jobDescription === 'string' && !jobDescription.trim())) {
    throw new Error('Please enter a job description to analyze.');
  }

  const payloadJd = typeof jobDescription === 'string' ? jobDescription.trim() : jobDescription;
  const candidateVerifiedSkills = (Array.isArray(verifiedSkills) && verifiedSkills.length > 0)
    ? verifiedSkills
    : (Array.isArray(claimedSkills) ? claimedSkills : []);

  const response = await fetch('/api/job-match/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jobDescription: payloadJd,
      sessionId: sessionId || '',
      verifiedSkills: candidateVerifiedSkills,
      claimedSkills: candidateVerifiedSkills,
      crossVerification: crossVerification || {}
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Request failed with status code ${response.status}`);
  }

  return result;
}

/**
 * Explores observable evidence breakdown for all analyzed skills.
 *
 * @param {object} params
 * @param {object} params.crossVerification - Cross-verification output from Stage 4
 * @param {object} params.github - GitHub analysis output from Stage 3
 * @returns {Promise<object>} Structured evidence explorer data
 */
export async function fetchEvidenceExplorer({ crossVerification, github }) {
  const response = await fetch('/api/evidence/explore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      crossVerification: crossVerification || {},
      github: github || {}
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Request failed with status code ${response.status}`);
  }

  return result;
}

/**
 * Adds a new technical skill manually to the active candidate verification session.
 * 
 * @param {object} params
 * @param {string} params.sessionId - Candidate verification session ID
 * @param {string} params.skill - Skill name to add (e.g. "Power BI", "Java")
 * @param {string} [params.category] - Technical category
 * @returns {Promise<object>} Added skill response
 */
export async function addManualSkill({ sessionId, skill, category = 'Other' }) {
  if (!skill || !skill.trim()) {
    throw new Error('Please enter a skill name.');
  }

  const response = await fetch('/api/skills/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId,
      skill: skill.trim(),
      category
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Failed to add skill with status ${response.status}`);
  }

  return result;
}

/**
 * Submits evidence for a specific skill (e.g., project URL, GitHub repo, file/doc, certificate).
 * 
 * @param {object} params
 * @param {string} params.sessionId - Active session ID
 * @param {string} params.skill - Target skill name
 * @param {string} params.evidenceType - Type of evidence (project_url, github_repo, portfolio, certificate, file, demo_url, other)
 * @param {string} [params.url] - URL to repo, project, or certificate
 * @param {string} [params.title] - Optional title
 * @param {string} [params.notes] - Candidate notes / technical context
 * @param {File} [params.file] - Optional uploaded file
 * @returns {Promise<object>} Updated skill and analysis response
 */
export async function submitSkillEvidence({
  sessionId,
  skill,
  skillId,
  evidenceType,
  url,
  title,
  notes,
  file
}) {
  let response;

  if (file) {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('skill', skill);
    if (skillId) formData.append('skillId', skillId);
    formData.append('evidenceType', evidenceType || 'file');
    if (url) formData.append('url', url);
    if (title) formData.append('title', title);
    if (notes) formData.append('notes', notes);
    formData.append('file', file);

    response = await fetch('/api/skills/evidence', {
      method: 'POST',
      body: formData
    });
  } else {
    response = await fetch('/api/skills/evidence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        skill,
        skillId,
        evidenceType: evidenceType || 'project_url',
        url: url || '',
        title: title || '',
        notes: notes || ''
      })
    });
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Evidence submission failed with status ${response.status}`);
  }

  return result;
}

/**
 * Automatically generates a targeted job description based on the candidate's verified skills.
 * 
 * @param {object} params
 * @param {Array} [params.skills] - Candidate claimed/verified skills array
 * @param {string} [params.sessionId] - Active candidate session ID
 * @returns {Promise<{
 *   success: boolean,
 *   role: string,
 *   department: string,
 *   summary: string,
 *   responsibilities: string[],
 *   requiredSkills: string[],
 *   preferredSkills: string[],
 *   technologies: string[],
 *   jobDescriptionText: string
 * }>}
 */
export async function generateJobDescriptionApi({ skills, sessionId } = {}) {
  const response = await fetch('/api/job-description/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      skills: skills || [],
      sessionId: sessionId || ''
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Failed to generate job description (status: ${response.status})`);
  }

  return result;
}

/**
 * Fetches structured skill gap details including reason, evidence found,
 * missing evidence artifacts, recommended micro-tasks, and estimated completion time.
 * 
 * @param {object} params
 * @param {object} [params.jobMatchResult] - Job match analysis result
 * @param {Array} [params.verifiedSkills] - Candidate verified skills
 * @param {object|string} [params.jobDescription] - Job description
 * @param {string} [params.sessionId] - Candidate session ID
 * @returns {Promise<{
 *   success: boolean,
 *   role: string,
 *   totalGaps: number,
 *   skillGaps: Array,
 *   summary: string
 * }>}
 */
export async function fetchSkillGapsApi({
  jobMatchResult,
  verifiedSkills,
  claimedSkills,
  jobDescription,
  sessionId
} = {}) {
  const response = await fetch('/api/skill-gaps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jobMatchResult: jobMatchResult || null,
      verifiedSkills: verifiedSkills || claimedSkills || [],
      claimedSkills: claimedSkills || verifiedSkills || [],
      jobDescription: jobDescription || null,
      sessionId: sessionId || ''
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Failed to fetch skill gap details (status: ${response.status})`);
  }

  return result;
}

/**
 * Automatically fetches calculated Skill Growth metrics, progress bars,
 * current vs target levels, and recommended next steps.
 * 
 * @param {object} params
 * @param {object} [params.jobMatchResult] - Real Job Match result
 * @param {Array} [params.verifiedSkills] - Candidate verified skills
 * @param {object|string} [params.jobDescription] - Job description
 * @param {string} [params.sessionId] - Active session ID
 * @returns {Promise<{
 *   success: boolean,
 *   overallCoverage: number,
 *   role: string,
 *   skills: Array,
 *   skillsNeedingImprovement: string[],
 *   recommendations: string[],
 *   summary: string
 * }>}
 */
export async function fetchSkillGrowthApi({
  jobMatchResult,
  verifiedSkills,
  claimedSkills,
  jobDescription,
  sessionId
} = {}) {
  const response = await fetch('/api/skill-growth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jobMatchResult: jobMatchResult || null,
      verifiedSkills: verifiedSkills || claimedSkills || [],
      claimedSkills: claimedSkills || verifiedSkills || [],
      jobDescription: jobDescription || null,
      sessionId: sessionId || ''
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Failed to fetch skill growth data (status: ${response.status})`);
  }

  return result;
}

/**
 * Automatically fetches empirical AI Skill Analysis synthesizing verified skills,
 * evidence strength, GitHub repositories, Job Match result, skill gaps, and skill growth.
 */
export async function fetchAiSkillAnalysisApi({
  verifiedSkills,
  claimedSkills,
  jobMatch,
  jobMatchResult,
  skillGaps,
  skillGrowth,
  github,
  recentActivity,
  sessionId
} = {}) {
  const response = await fetch('/api/ai-skill-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      verifiedSkills: verifiedSkills || claimedSkills || [],
      jobMatch: jobMatch || jobMatchResult || {},
      skillGaps: skillGaps || [],
      skillGrowth: skillGrowth || {},
      github: github || {},
      recentActivity: recentActivity || null,
      sessionId: sessionId || ''
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Failed to fetch AI skill analysis (status: ${response.status})`);
  }

  return result;
}

/**
 * Deletes a manually added skill and its associated evidence from the authoritative session.
 * 
 * @param {object} params
 * @param {string} params.sessionId - Candidate verification session ID
 * @param {string} params.skillId - Skill ID or skill name
 * @returns {Promise<{ success: boolean, deletedSkill: object, session: object }>}
 */
export async function deleteSkillApi({ sessionId, skillId }) {
  if (!sessionId) {
    throw new Error('Session ID is required.');
  }
  if (!skillId) {
    throw new Error('Skill ID is required.');
  }

  const response = await fetch(`/api/skills/${encodeURIComponent(skillId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Failed to delete skill (status: ${response.status})`);
  }

  return result;
}

/**
 * Starts a new practical micro-task assessment session for a skill.
 * 
 * @param {object} params
 * @param {string} params.sessionId
 * @param {string} params.skill
 * @param {string} [params.difficulty='intermediate']
 * @returns {Promise<{ success: boolean, assessment: object }>}
 */
export async function startAssessmentApi({ sessionId, skill, difficulty = 'intermediate' }) {
  if (!sessionId) throw new Error('Session ID is required.');
  if (!skill) throw new Error('Skill name is required.');

  const response = await fetch('/api/skill-assessment/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, skill, difficulty })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || `Failed to start assessment (status: ${response.status})`);
  }
  return result;
}

/**
 * Submits candidate answers for evaluation by the authoritative backend engine.
 * 
 * @param {object} params
 * @param {string} params.assessmentId
 * @param {string} [params.sessionId]
 * @param {Array<{ questionId: string, answer: string }>} params.answers
 * @returns {Promise<{ success: boolean, assessmentResult: object, session: object }>}
 */
export async function submitAssessmentApi({ assessmentId, sessionId, answers = [] }) {
  if (!assessmentId) throw new Error('Assessment ID is required.');

  const response = await fetch('/api/skill-assessment/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessmentId, sessionId, answers })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || `Failed to submit assessment (status: ${response.status})`);
  }
  return result;
}

/**
 * Retrieves assessment details by ID.
 * 
 * @param {string} assessmentId
 * @returns {Promise<{ success: boolean, assessment: object }>}
 */
export async function getAssessmentApi(assessmentId) {
  if (!assessmentId) throw new Error('Assessment ID is required.');

  const response = await fetch(`/api/skill-assessment/${encodeURIComponent(assessmentId)}`);
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || `Failed to fetch assessment (status: ${response.status})`);
  }
  return result;
}
