/**
 * SkillProof Client API Service
 *
 * Handles multipart uploads, verification requests,
 * skill evidence, job matching, skill growth, and assessments.
 */

// Backend API URL: localhost during local development, or deployed backend
const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://hacker-cracker-skillproof-pbwb-5rqctb5uv-hackcracker.vercel.app');

/**
 * Sends the candidate's resume PDF and GitHub handle
 * to the backend verification endpoint.
 */
export async function verifyCandidate(resumeFile, githubUsername, candidateName) {
  if (!resumeFile) {
    throw new Error('Please select a resume PDF file.');
  }

  if (!githubUsername || !githubUsername.trim()) {
    throw new Error('Please enter a GitHub username.');
  }

  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('githubUsername', githubUsername.trim());
  if (candidateName && typeof candidateName === 'string') {
    formData.append('candidateName', candidateName.trim());
  }

  // Do NOT set Content-Type manually for FormData.
  const response = await fetch(`${API_BASE_URL}/api/verify`, {
    method: 'POST',
    body: formData
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || `Request failed with status code ${response.status}`
    );
  }

  return result;
}

/**
 * Analyzes candidate skills against a job description.
 */
export async function analyzeJobMatch({
  jobDescription,
  sessionId,
  claimedSkills,
  verifiedSkills,
  crossVerification
}) {
  if (
    !jobDescription ||
    (typeof jobDescription === 'string' && !jobDescription.trim())
  ) {
    throw new Error('Please enter a job description to analyze.');
  }

  const payloadJd =
    typeof jobDescription === 'string'
      ? jobDescription.trim()
      : jobDescription;

  const candidateVerifiedSkills =
    Array.isArray(verifiedSkills) && verifiedSkills.length > 0
      ? verifiedSkills
      : Array.isArray(claimedSkills)
        ? claimedSkills
        : [];

  const response = await fetch(
    `${API_BASE_URL}/api/job-match/analyze`,
    {
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
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || `Request failed with status code ${response.status}`
    );
  }

  return result;
}

/**
 * Explores observable evidence breakdown.
 */
export async function fetchEvidenceExplorer({
  crossVerification,
  github
}) {
  const response = await fetch(
    `${API_BASE_URL}/api/evidence/explore`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        crossVerification: crossVerification || {},
        github: github || {}
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || `Request failed with status code ${response.status}`
    );
  }

  return result;
}

/**
 * Adds a new technical skill.
 */
export async function addManualSkill({
  sessionId,
  skill,
  category = 'Other'
}) {
  if (!skill || !skill.trim()) {
    throw new Error('Please enter a skill name.');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/skills/add`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        skill: skill.trim(),
        category
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        `Failed to add skill with status ${response.status}`
    );
  }

  return result;
}

/**
 * Submits evidence for a specific skill.
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

    if (skillId) {
      formData.append('skillId', skillId);
    }

    formData.append(
      'evidenceType',
      evidenceType || 'file'
    );

    if (url) {
      formData.append('url', url);
    }

    if (title) {
      formData.append('title', title);
    }

    if (notes) {
      formData.append('notes', notes);
    }

    formData.append('file', file);

    response = await fetch(
      `${API_BASE_URL}/api/skills/evidence`,
      {
        method: 'POST',
        body: formData
      }
    );
  } else {
    response = await fetch(
      `${API_BASE_URL}/api/skills/evidence`,
      {
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
      }
    );
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        `Evidence submission failed with status ${response.status}`
    );
  }

  return result;
}

/**
 * Generates a targeted job description.
 */
export async function generateJobDescriptionApi({
  skills,
  sessionId
} = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/job-description/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        skills: skills || [],
        sessionId: sessionId || ''
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        `Failed to generate job description (status: ${response.status})`
    );
  }

  return result;
}

/**
 * Fetches skill gap details.
 */
export async function fetchSkillGapsApi({
  jobMatchResult,
  verifiedSkills,
  claimedSkills,
  jobDescription,
  sessionId
} = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/skill-gaps`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobMatchResult: jobMatchResult || null,
        verifiedSkills:
          verifiedSkills || claimedSkills || [],
        claimedSkills:
          claimedSkills || verifiedSkills || [],
        jobDescription: jobDescription || null,
        sessionId: sessionId || ''
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        `Failed to fetch skill gap details (status: ${response.status})`
    );
  }

  return result;
}

/**
 * Fetches Skill Growth metrics.
 */
export async function fetchSkillGrowthApi({
  jobMatchResult,
  verifiedSkills,
  claimedSkills,
  jobDescription,
  sessionId
} = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/skill-growth`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobMatchResult: jobMatchResult || null,
        verifiedSkills:
          verifiedSkills || claimedSkills || [],
        claimedSkills:
          claimedSkills || verifiedSkills || [],
        jobDescription: jobDescription || null,
        sessionId: sessionId || ''
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        `Failed to fetch skill growth data (status: ${response.status})`
    );
  }

  return result;
}

/**
 * Fetches AI Skill Analysis.
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
  const response = await fetch(
    `${API_BASE_URL}/api/ai-skill-analysis`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verifiedSkills:
          verifiedSkills || claimedSkills || [],
        jobMatch:
          jobMatch || jobMatchResult || {},
        skillGaps: skillGaps || [],
        skillGrowth: skillGrowth || {},
        github: github || {},
        recentActivity: recentActivity || null,
        sessionId: sessionId || ''
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        `Failed to fetch AI skill analysis (status: ${response.status})`
    );
  }

  return result;
}

/**
 * Deletes a manually added skill.
 */
export async function deleteSkillApi({
  sessionId,
  skillId
}) {
  if (!sessionId) {
    throw new Error('Session ID is required.');
  }

  if (!skillId) {
    throw new Error('Skill ID is required.');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/skills/${encodeURIComponent(skillId)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        `Failed to delete skill (status: ${response.status})`
    );
  }

  return result;
}

/**
 * Starts a practical skill assessment.
 */
export async function startAssessmentApi({
  sessionId,
  skill,
  difficulty = 'intermediate'
}) {
  const activeSessionId = sessionId || 'session_demo_candidate';

  if (!skill) {
    throw new Error('Skill name is required.');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/skill-assessment/start`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: activeSessionId,
        skill,
        difficulty
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        result.message ||
        `Failed to start assessment (status: ${response.status})`
    );
  }

  return result;
}

/**
 * Submits candidate assessment answers.
 */
export async function submitAssessmentApi({
  assessmentId,
  sessionId,
  answers = []
}) {
  if (!assessmentId) {
    throw new Error('Assessment ID is required.');
  }

  const activeSessionId = sessionId || 'session_demo_candidate';

  const response = await fetch(
    `${API_BASE_URL}/api/skill-assessment/submit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assessmentId,
        sessionId: activeSessionId,
        answers
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        result.message ||
        `Failed to submit assessment (status: ${response.status})`
    );
  }

  return result;
}

/**
 * Retrieves assessment details by ID.
 */
export async function getAssessmentApi(
  assessmentId
) {
  if (!assessmentId) {
    throw new Error('Assessment ID is required.');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/skill-assessment/${encodeURIComponent(assessmentId)}`
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        result.message ||
        `Failed to fetch assessment (status: ${response.status})`
    );
  }

  return result;
}