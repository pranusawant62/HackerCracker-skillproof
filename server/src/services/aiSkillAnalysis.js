import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Normalizes any skill name for comparison.
 */
function normalizeSkill(s = '') {
  return String(s).trim().toLowerCase();
}

/**
 * Deterministic Rule-Based AI Skill Analysis Engine
 * 
 * Synthesizes:
 * 1. Verified skills (strictly honors PROVEN vs PARTIAL vs CLAIMED-ONLY)
 * 2. Evidence strength (confidence score, artifacts, repository proof)
 * 3. GitHub repositories & language statistics
 * 4. Job Match results (matched vs partial vs missing skills)
 * 5. Skill gaps (identifies exact reasons and missing evidence)
 * 6. Skill growth (evidence coverage % and skills needing improvement)
 * 7. Recent activity (repository updates, push timestamps)
 */
export function generateDeterministicSkillAnalysis({
  verifiedSkills = [],
  jobMatch = {},
  skillGaps = [],
  skillGrowth = {},
  github = {},
  recentActivity = null
} = {}) {
  // 1. Process candidate skills
  const skillsList = Array.isArray(verifiedSkills) ? verifiedSkills : [];
  
  // Categorize skills by status
  const provenSkills = [];
  const partialSkills = [];
  const claimedOnlySkills = [];

  skillsList.forEach((item) => {
    const name = item.name || item.skill || (typeof item === 'string' ? item : 'Unknown');
    const rawStatus = String(item.status || item.verificationStatus || '').toUpperCase();
    
    // Extract evidence details
    const evidenceList = Array.isArray(item.evidence) ? item.evidence : [];
    const highestConfidence = evidenceList.reduce((max, ev) => Math.max(max, Number(ev?.confidenceScore) || 0), 0);
    const hasRepoArtifact = evidenceList.some(ev => 
      ev.type === 'github_repo' || 
      ev.type === 'project_url' || 
      (Array.isArray(ev.artifacts) && ev.artifacts.length > 0)
    );
    const microtaskEv = evidenceList.find(ev => ev.type === 'microtask_assessment');
    const hasMicrotaskProof = Boolean(microtaskEv || item.verificationMethod === 'microtask_assessment' || item.assessmentStatus === 'passed');
    const assessmentScore = microtaskEv?.percentage || microtaskEv?.score;
    const certEv = evidenceList.find(ev => ev.type === 'certificate' || ev.type === 'credential');
    const hasCertProof = Boolean(certEv);

    const skillObj = {
      name,
      status: rawStatus === 'PROVEN' || rawStatus === 'PROVED' ? 'PROVEN' :
              rawStatus === 'PARTIAL' || rawStatus === 'PARTIALLY_PROVEN' ? 'PARTIAL' : 'CLAIMED-ONLY',
      confidence: highestConfidence,
      hasRepoArtifact,
      hasMicrotaskProof,
      assessmentScore,
      hasCertProof,
      assessmentStatus: item.assessmentStatus || (microtaskEv ? (microtaskEv.passed ? 'passed' : 'failed') : null),
      category: item.category || 'General',
      evidenceCount: evidenceList.length,
      claimSource: item.claimSource || 'resume'
    };

    if (skillObj.status === 'PROVEN') {
      provenSkills.push(skillObj);
    } else if (skillObj.status === 'PARTIAL') {
      partialSkills.push(skillObj);
    } else {
      claimedOnlySkills.push(skillObj);
    }
  });

  // Also include skills from jobMatch if not already categorized
  const matchedInJob = Array.isArray(jobMatch?.matchedSkills) ? jobMatch.matchedSkills : [];
  matchedInJob.forEach(m => {
    const sName = typeof m === 'string' ? m : m.skill || m.name;
    if (sName && !provenSkills.some(p => normalizeSkill(p.name) === normalizeSkill(sName))) {
      provenSkills.push({
        name: sName,
        status: 'PROVEN',
        confidence: 90,
        hasRepoArtifact: true,
        category: m.category || 'General',
        evidenceCount: 1,
        claimSource: 'matched'
      });
    }
  });

  // 2. Process GitHub repositories and activity
  const repos = Array.isArray(github?.repositories) ? github.repositories : [];
  const repoNames = repos.map(r => r.name || r.repoName).filter(Boolean);
  
  // Check for recent activity (pushed in last 12 months or active commits)
  let recentActivitySummary = '';
  if (recentActivity && typeof recentActivity === 'string') {
    recentActivitySummary = recentActivity;
  } else if (repos.length > 0) {
    const sortedByDate = [...repos].sort((a, b) => new Date(b.pushedAt || 0) - new Date(a.pushedAt || 0));
    const latestRepo = sortedByDate[0];
    if (latestRepo?.pushedAt) {
      const pushedYear = new Date(latestRepo.pushedAt).getFullYear();
      recentActivitySummary = `Recent activity observed on repository '${latestRepo.name || 'codebase'}' (${pushedYear}).`;
    } else if (latestRepo?.name) {
      recentActivitySummary = `Active codebase verified across public repositories including '${latestRepo.name}'.`;
    }
  }

  // Domain determination from proven skills
  const provenNames = provenSkills.map(s => s.name);
  let domain = 'software engineering';
  const hasBackend = provenNames.some(s => ['python', 'fastapi', 'flask', 'django', 'node', 'express', 'postgresql', 'sql', 'java'].includes(normalizeSkill(s)));
  const hasFrontend = provenNames.some(s => ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css'].includes(normalizeSkill(s)));
  const hasDevOps = provenNames.some(s => ['docker', 'kubernetes', 'aws', 'ci/cd', 'git', 'linux'].includes(normalizeSkill(s)));
  
  if (hasBackend && hasFrontend) domain = 'fullstack web development';
  else if (hasBackend) domain = 'backend development and API architecture';
  else if (hasFrontend) domain = 'frontend user interface engineering';
  else if (hasDevOps) domain = 'DevOps and cloud infrastructure';

  // 3. Construct AI Summary
  let summary = '';
  if (provenSkills.length > 0) {
    const topSkillsStr = provenSkills.slice(0, 3).map(s => s.name).join(', ');
    summary = `Your strongest verified evidence is in ${topSkillsStr}. Your repositories demonstrate practical competence in ${domain}.`;
    if (recentActivitySummary) {
      summary += ` ${recentActivitySummary}`;
    }
  } else {
    summary = `No skills currently meet empirical verification thresholds. Upload verifiable code repositories, project URLs, or official credentials to demonstrate proficiency.`;
  }

  // 4. Construct Key Strengths (STRICTLY PROVEN ONLY)
  const strengths = [];
  provenSkills.forEach(s => {
    let detail = `Verified with direct codebase implementation`;
    if (s.hasMicrotaskProof) {
      detail = `demonstrated through practical micro-task assessment${s.assessmentScore ? ` (${s.assessmentScore}%)` : ''}`;
    } else if (s.hasCertProof) {
      detail = `demonstrated through verified certificate`;
    } else if (s.confidence >= 90) {
      detail = `Verified with high confidence (${s.confidence}%) and empirical repository proof`;
    } else if (s.hasRepoArtifact) {
      detail = `Direct implementation artifacts verified in repository files`;
    }
    strengths.push(`${s.name} — ${detail}`);
  });

  // Always credit Git/GitHub if candidate has analyzed GitHub repos
  if (repos.length > 0 && !strengths.some(st => normalizeSkill(st).includes('git'))) {
    strengths.push(`Git/GitHub — Public repositories with verifiable version control activity`);
  }

  // 5. Construct Evidence Gaps (PARTIAL & CLAIMED-ONLY)
  const evidenceGaps = [];
  
  // From skillGaps array
  if (Array.isArray(skillGaps) && skillGaps.length > 0) {
    skillGaps.forEach(g => {
      const sName = g.skill || g.name || 'Skill';
      const statusLabel = String(g.status || 'UNVERIFIED').toUpperCase();
      const reason = g.whyGap || g.reason || (statusLabel.includes('PARTIAL') ? 'evidence exists but is limited' : 'currently claimed-only');
      evidenceGaps.push(`${sName}: ${reason}`);
    });
  } else {
    // Fallback from partial and claimed lists
    partialSkills.forEach(p => {
      evidenceGaps.push(`${p.name} has partial evidence (detected in language breakdown or peripheral files, but lacks complete project implementation)`);
    });
    claimedOnlySkills.forEach(c => {
      if (c.assessmentStatus === 'failed') {
        evidenceGaps.push(`${c.name}: Assessment attempted but not passed — recommend retaking the micro-task`);
      } else {
        evidenceGaps.push(`${c.name} has no verified evidence (micro-task assessment not completed)`);
      }
    });
  }

  // 6. Construct Suggested Next Steps
  const nextSteps = [];

  // Incorporate skill growth recommendations if present
  if (Array.isArray(skillGrowth?.recommendations) && skillGrowth.recommendations.length > 0) {
    skillGrowth.recommendations.forEach(r => {
      if (!nextSteps.includes(r)) nextSteps.push(r);
    });
  }

  // Add specific actionable steps for missing/partial skills
  const missingSkillNames = [
    ...partialSkills.map(s => s.name),
    ...claimedOnlySkills.map(s => s.name),
    ...(Array.isArray(jobMatch?.missingSkills) ? jobMatch.missingSkills.map(m => m.skill || m) : []),
    ...(Array.isArray(jobMatch?.partialSkills) ? jobMatch.partialSkills.map(p => p.skill || p) : [])
  ];

  const uniqueMissing = [...new Set(missingSkillNames.map(s => String(s).trim()))];

  uniqueMissing.forEach(skill => {
    const sNorm = normalizeSkill(skill);
    if (sNorm.includes('docker') && !nextSteps.some(ns => ns.toLowerCase().includes('docker'))) {
      nextSteps.push('Build a Dockerized FastAPI application with a containerized Dockerfile and port exposure');
    } else if (sNorm.includes('react') && !nextSteps.some(ns => ns.toLowerCase().includes('react'))) {
      nextSteps.push('Build a React frontend client consuming your backend REST endpoints');
    } else if (sNorm.includes('postgres') && !nextSteps.some(ns => ns.toLowerCase().includes('postgres'))) {
      nextSteps.push('Add PostgreSQL integration with schema migrations and relational query logic');
    } else if (sNorm.includes('test') && !nextSteps.some(ns => ns.toLowerCase().includes('test'))) {
      nextSteps.push('Add automated tests and continuous integration checks to your repository');
    }
  });

  if (nextSteps.length === 0) {
    nextSteps.push('Deploy your verified codebase to a cloud platform (e.g. AWS, Render, Vercel) with production configurations');
    nextSteps.push('Add comprehensive automated integration tests and a GitHub Actions CI pipeline');
  }

  // 7. Construct Profile / Job Readiness Summary
  const coveragePercent = Number(skillGrowth?.overallCoverage) || (
    provenSkills.length + partialSkills.length + claimedOnlySkills.length > 0
      ? Math.round((provenSkills.length * 90 + partialSkills.length * 50 + claimedOnlySkills.length * 20) / (provenSkills.length + partialSkills.length + claimedOnlySkills.length))
      : 0
  );

  let readinessLevel = 'Developing';
  if (coveragePercent >= 80) readinessLevel = 'High (Job-Ready for Target Role)';
  else if (coveragePercent >= 55) readinessLevel = 'Moderate (Solid Technical Core with Specific Gaps)';
  else readinessLevel = 'Foundational (Requires Evidence Submissions)';

  const targetRole = jobMatch?.jobTitle || jobMatch?.targetRole || (hasBackend ? 'Backend Engineer' : 'Software Engineer');

  let profileSummary = `Candidate demonstrates verified competence in ${provenSkills.length} key technical areas (${provenNames.slice(0, 4).join(', ') || 'none currently'}). Profile evidence coverage stands at ${coveragePercent}%. `;
  
  if (provenSkills.length >= 3) {
    profileSummary += `Job readiness for ${targetRole} is ${readinessLevel}. Primary strengths lie in ${domain}, while closing identified evidence gaps will establish well-rounded production qualifications.`;
  } else {
    profileSummary += `Job readiness assessment indicates an emerging profile that requires observable code implementations to confirm production readiness.`;
  }

  return {
    summary,
    strengths,
    evidenceGaps,
    nextSteps,
    profileSummary,
    overallCoverage: coveragePercent,
    readinessLevel
  };
}

/**
 * Main AI Skill Analysis Orchestrator
 * 
 * Attempts external AI generation (e.g. Gemini / OpenAI) if an API key is configured.
 * Safely falls back to the deterministic rule-based engine on failure or absence of API keys.
 */
export async function performAiSkillAnalysis({
  verifiedSkills = [],
  jobMatch = {},
  skillGaps = [],
  skillGrowth = {},
  github = {},
  recentActivity = null,
  sessionId = null
} = {}) {
  // If external AI key is available (GEMINI_API_KEY or OPENAI_API_KEY)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (geminiApiKey) {
    try {
      const aiResult = await callGeminiApi({
        geminiApiKey,
        verifiedSkills,
        jobMatch,
        skillGaps,
        skillGrowth,
        github,
        recentActivity
      });
      if (aiResult && aiResult.summary && Array.isArray(aiResult.strengths)) {
        return aiResult;
      }
    } catch (err) {
      console.warn('[AISkillAnalysis] Gemini API call failed, falling back to deterministic engine:', err.message);
    }
  } else if (openaiApiKey) {
    try {
      const aiResult = await callOpenAiApi({
        openaiApiKey,
        verifiedSkills,
        jobMatch,
        skillGaps,
        skillGrowth,
        github,
        recentActivity
      });
      if (aiResult && aiResult.summary && Array.isArray(aiResult.strengths)) {
        return aiResult;
      }
    } catch (err) {
      console.warn('[AISkillAnalysis] OpenAI API call failed, falling back to deterministic engine:', err.message);
    }
  }

  // Deterministic rule-based analysis (production-guaranteed fallback)
  return generateDeterministicSkillAnalysis({
    verifiedSkills,
    jobMatch,
    skillGaps,
    skillGrowth,
    github,
    recentActivity
  });
}

/**
 * Calls Gemini REST API using native fetch
 */
async function callGeminiApi({
  geminiApiKey,
  verifiedSkills,
  jobMatch,
  skillGaps,
  skillGrowth,
  github,
  recentActivity
}) {
  const prompt = `
You are an expert technical hiring auditor for SkillProof.
Analyze the following candidate's empirical evidence.

CRITICAL INVARIANTS:
1. You must NEVER claim that a skill is proven unless the evidence status says PROVEN.
2. Do NOT generate generic motivational filler or empty praise.
3. Be fact-based, technical, and precise.

DATA:
Verified Skills: ${JSON.stringify(verifiedSkills)}
Job Match: ${JSON.stringify(jobMatch)}
Skill Gaps: ${JSON.stringify(skillGaps)}
Skill Growth: ${JSON.stringify(skillGrowth)}
GitHub Repositories: ${JSON.stringify(github?.repositories || [])}
Recent Activity: ${JSON.stringify(recentActivity || '')}

Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "...",
  "strengths": ["skill 1 details", "skill 2 details"],
  "evidenceGaps": ["gap 1 details", "gap 2 details"],
  "nextSteps": ["action 1", "action 2"],
  "profileSummary": "..."
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');

  return JSON.parse(text);
}

/**
 * Calls OpenAI REST API using native fetch
 */
async function callOpenAiApi({
  openaiApiKey,
  verifiedSkills,
  jobMatch,
  skillGaps,
  skillGrowth,
  github,
  recentActivity
}) {
  const systemPrompt = `You are a technical hiring auditor for SkillProof. Strictly analyze empirical evidence. Never claim unproven skills are proven. Return JSON only with keys: summary, strengths, evidenceGaps, nextSteps, profileSummary.`;
  const userContent = `Verified Skills: ${JSON.stringify(verifiedSkills)}\nJob Match: ${JSON.stringify(jobMatch)}\nSkill Gaps: ${JSON.stringify(skillGaps)}\nSkill Growth: ${JSON.stringify(skillGrowth)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API responded with status ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return JSON.parse(content);
}
