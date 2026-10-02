import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { SKILL_TAXONOMY } from '../utils/skillTaxonomy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Common package-to-skill mappings for manifests
 */
const PACKAGE_TO_SKILL = {
  // Node / JavaScript / TypeScript
  'react': { skill: 'React', category: 'Frontend' },
  'react-dom': { skill: 'React', category: 'Frontend' },
  'next': { skill: 'Next.js', category: 'Frontend' },
  '@angular/core': { skill: 'Angular', category: 'Frontend' },
  'vue': { skill: 'Vue', category: 'Frontend' },
  'tailwindcss': { skill: 'Tailwind CSS', category: 'Frontend' },
  'sass': { skill: 'Sass', category: 'Frontend' },
  'redux': { skill: 'Redux', category: 'Frontend' },
  '@reduxjs/toolkit': { skill: 'Redux', category: 'Frontend' },
  'express': { skill: 'Express', category: 'Backend' },
  'express-jwt': { skill: 'Express', category: 'Backend' },
  '@nestjs/core': { skill: 'NestJS', category: 'Backend' },
  'graphql': { skill: 'GraphQL', category: 'Backend' },
  'mongodb': { skill: 'MongoDB', category: 'Databases' },
  'mongoose': { skill: 'MongoDB', category: 'Databases' },
  'pg': { skill: 'PostgreSQL', category: 'Databases' },
  'postgres': { skill: 'PostgreSQL', category: 'Databases' },
  'mysql': { skill: 'MySQL', category: 'Databases' },
  'mysql2': { skill: 'MySQL', category: 'Databases' },
  'redis': { skill: 'Redis', category: 'Databases' },
  'ioredis': { skill: 'Redis', category: 'Databases' },
  'sqlite3': { skill: 'SQLite', category: 'Databases' },
  'better-sqlite3': { skill: 'SQLite', category: 'Databases' },
  'firebase': { skill: 'Firebase', category: 'Databases' },
  '@supabase/supabase-js': { skill: 'Supabase', category: 'Databases' },
  'typescript': { skill: 'TypeScript', category: 'Programming Languages' },

  // Python
  'django': { skill: 'Django', category: 'Backend' },
  'djangorestframework': { skill: 'Django', category: 'Backend' },
  'flask': { skill: 'Flask', category: 'Backend' },
  'fastapi': { skill: 'FastAPI', category: 'Backend' },
  'tensorflow': { skill: 'TensorFlow', category: 'AI / ML' },
  'torch': { skill: 'PyTorch', category: 'AI / ML' },
  'torchvision': { skill: 'PyTorch', category: 'AI / ML' },
  'pytorch': { skill: 'PyTorch', category: 'AI / ML' },
  'scikit-learn': { skill: 'Scikit-learn', category: 'AI / ML' },
  'sklearn': { skill: 'Scikit-learn', category: 'AI / ML' },
  'pandas': { skill: 'Pandas', category: 'AI / ML' },
  'numpy': { skill: 'NumPy', category: 'AI / ML' },
  'openai': { skill: 'OpenAI', category: 'AI / ML' },
  'psycopg2': { skill: 'PostgreSQL', category: 'Databases' },
  'psycopg2-binary': { skill: 'PostgreSQL', category: 'Databases' },
  'pymongo': { skill: 'MongoDB', category: 'Databases' },
  'sqlalchemy': { skill: 'SQL', category: 'Programming Languages' },
  'pytest': { skill: 'Python', category: 'Programming Languages' }
};

/**
 * Safely sanitizes GITHUB_TOKEN from process.env:
 * - Dynamically loads latest server/.env if needed
 * - Trims whitespace
 * - Removes accidental enclosing quotes
 * - Cleans accidental placeholder prefixes before valid token prefixes (github_pat_ or ghp_)
 * - Never logs or prints token
 */
function getSanitizedToken() {
  dotenv.config({ path: envPath });

  const rawToken = process.env.GITHUB_TOKEN;
  if (!rawToken || typeof rawToken !== 'string') return '';
  let token = rawToken.trim().replace(/^["']|["']$/g, '');

  const patIdx = token.indexOf('github_pat_');
  if (patIdx !== -1) {
    token = token.slice(patIdx).trim();
  } else {
    const ghpIdx = token.indexOf('ghp_');
    if (ghpIdx !== -1) {
      token = token.slice(ghpIdx).trim();
    }
  }

  return token;
}

/**
 * Standard fetch helper with GitHub API headers and optional auth token.
 * Never leaks token or Authorization header in logs or error messages.
 */
async function fetchGitHub(endpoint) {
  const headers = {
    'User-Agent': 'SkillProof-Verification-Service',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const token = getSanitizedToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
  let response;

  try {
    response = await fetch(url, { headers });
  } catch (networkErr) {
    throw new Error('Network error while communicating with the GitHub API.');
  }

  // 401: Invalid or expired GitHub token
  if (response.status === 401) {
    throw new Error('GitHub authentication failed: The configured GITHUB_TOKEN is invalid or expired.');
  }

  // 404: Resource not found
  if (response.status === 404) {
    return { ok: false, status: 404, data: null };
  }

  // 403: Rate limit exceeded or access forbidden
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const resetTime = response.headers.get('x-ratelimit-reset');
    const resetDate = resetTime 
      ? new Date(parseInt(resetTime, 10) * 1000).toLocaleTimeString() 
      : 'shortly';

    if (rateLimitRemaining === '0') {
      throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}.`);
    }

    throw new Error(`GitHub API access forbidden (HTTP 403). Rate limit resets at ${resetDate}.`);
  }

  if (!response.ok) {
    throw new Error(`GitHub API request failed with HTTP ${response.status}.`);
  }

  const data = await response.json().catch(() => null);
  return { ok: true, status: response.status, data };
}

/**
 * Fetches raw file content directly from GitHub download_url or contents endpoint.
 */
async function fetchRawFileContent(fileItem) {
  if (!fileItem) return null;

  try {
    if (fileItem.download_url) {
      const res = await fetch(fileItem.download_url, {
        headers: {
          'User-Agent': 'SkillProof-Verification-Service'
        }
      });
      if (res.ok) return await res.text();
    }

    if (fileItem.content && fileItem.encoding === 'base64') {
      return Buffer.from(fileItem.content, 'base64').toString('utf8');
    }
  } catch (err) {
    return null;
  }

  return null;
}

/**
 * Maps a detected language name to our canonical SkillProof skill taxonomy.
 */
function mapLanguageToSkill(langName) {
  if (!langName) return null;
  const normalized = langName.toLowerCase().trim();

  for (const entry of SKILL_TAXONOMY) {
    if (entry.name.toLowerCase() === normalized) return entry.name;
    for (const alias of entry.aliases) {
      if (alias.toLowerCase() === normalized) return entry.name;
    }
  }

  return null;
}

/**
 * Inspects package.json dependencies and extracts matching skill evidence.
 */
function inspectPackageJson(content, repo) {
  const evidence = [];
  try {
    const pkg = JSON.parse(content);
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };

    for (const dep of Object.keys(allDeps)) {
      const lowerDep = dep.toLowerCase();
      if (PACKAGE_TO_SKILL[lowerDep]) {
        const { skill } = PACKAGE_TO_SKILL[lowerDep];
        evidence.push({
          skill,
          repository: repo.name,
          repositoryUrl: repo.html_url,
          evidenceType: 'dependency',
          strength: 'strong',
          details: `${skill} found in package.json dependencies (${dep})`
        });
      }
    }
  } catch (e) {
    // Gracefully handle malformed package.json
  }
  return evidence;
}

/**
 * Inspects requirements.txt and extracts matching skill evidence.
 */
function inspectRequirementsTxt(content, repo) {
  const evidence = [];
  if (!content) return evidence;

  const lines = content.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Strip version specifiers (e.g. "django>=4.0" -> "django")
    const pkgName = line.split(/[=<>~;]/)[0].trim().toLowerCase();
    if (PACKAGE_TO_SKILL[pkgName]) {
      const { skill } = PACKAGE_TO_SKILL[pkgName];
      evidence.push({
        skill,
        repository: repo.name,
        repositoryUrl: repo.html_url,
        evidenceType: 'dependency',
        strength: 'strong',
        details: `${skill} found in requirements.txt (${pkgName})`
      });
    }
  }
  return evidence;
}

/**
 * Inspects other build and manifest files (pyproject.toml, pom.xml, build.gradle, Cargo.toml, go.mod).
 */
function inspectOtherManifests(fileName, content, repo) {
  const evidence = [];
  if (!content) return evidence;
  const lowerContent = content.toLowerCase();

  if (fileName === 'pyproject.toml') {
    for (const [pkg, info] of Object.entries(PACKAGE_TO_SKILL)) {
      if (lowerContent.includes(`"${pkg}"`) || lowerContent.includes(`'${pkg}'`) || lowerContent.includes(`${pkg} =`)) {
        evidence.push({
          skill: info.skill,
          repository: repo.name,
          repositoryUrl: repo.html_url,
          evidenceType: 'dependency',
          strength: 'strong',
          details: `${info.skill} found in pyproject.toml (${pkg})`
        });
      }
    }
  } else if (fileName === 'pom.xml' || fileName === 'build.gradle') {
    if (lowerContent.includes('spring-boot') || lowerContent.includes('springframework.boot')) {
      evidence.push({
        skill: 'Spring Boot',
        repository: repo.name,
        repositoryUrl: repo.html_url,
        evidenceType: 'dependency',
        strength: 'strong',
        details: `Spring Boot detected in ${fileName}`
      });
    }
    evidence.push({
      skill: 'Java',
      repository: repo.name,
      repositoryUrl: repo.html_url,
      evidenceType: 'manifest',
      strength: 'supporting',
      details: `Java build manifest (${fileName}) detected`
    });
  } else if (fileName === 'cargo.toml') {
    evidence.push({
      skill: 'Rust',
      repository: repo.name,
      repositoryUrl: repo.html_url,
      evidenceType: 'manifest',
      strength: 'supporting',
      details: 'Rust Cargo build manifest (Cargo.toml) detected'
    });
  } else if (fileName === 'go.mod') {
    evidence.push({
      skill: 'Go',
      repository: repo.name,
      repositoryUrl: repo.html_url,
      evidenceType: 'manifest',
      strength: 'supporting',
      details: 'Go module manifest (go.mod) detected'
    });
  }

  return evidence;
}

/**
/**
 * Fetches public identity and profile metadata for a target GitHub handle.
 * 
 * @param {string} username 
 * @returns {Promise<object>} Enriched profile metadata
 */
export async function fetchGitHubProfile(username) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    throw new Error('A valid GitHub username is required.');
  }

  const cleanUsername = username.trim().replace(/^@/, '');

  const userRes = await fetchGitHub(`/users/${encodeURIComponent(cleanUsername)}`);
  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${cleanUsername}" was not found.`);
    }
    throw new Error(`Failed to fetch GitHub profile for "${cleanUsername}".`);
  }

  const user = userRes.data;
  return {
    username: user.login,
    name: user.name || null,
    email: user.email ? user.email.toLowerCase() : null,
    bio: user.bio || null,
    blog: user.blog || null,
    company: user.company || null,
    twitterUsername: user.twitter_username || null,
    profileUrl: user.html_url,
    publicRepositories: user.public_repos || 0,
    followers: user.followers || 0,
    following: user.following || 0,
    avatarUrl: user.avatar_url
  };
}

/**
 * Main GitHub Analysis Service.
 *
 * @param {string} username - Target GitHub user handle
 * @param {object} [existingProfile=null] - Pre-fetched profile if available
 * @returns {Promise<{ profile: object, repositories: Array, evidence: Array }>}
 */
export async function analyzeGithub(username, existingProfile = null) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    throw new Error('A valid GitHub username is required.');
  }

  const cleanUsername = username.trim().replace(/^@/, '');

  // 1. Fetch user public profile (or reuse pre-fetched profile)
  const profile = existingProfile || await fetchGitHubProfile(cleanUsername);

  // 2. Fetch user's public repositories (prefer recent non-forks, limit to 15)
  const reposRes = await fetchGitHub(`/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=30&type=public`);
  const rawRepos = Array.isArray(reposRes.data) ? reposRes.data : [];

  // Filter out forks for original work; fallback to all if user only has forks
  const nonForkRepos = rawRepos.filter(r => !r.fork);
  const candidateRepos = nonForkRepos.length > 0 ? nonForkRepos : rawRepos;
  const selectedRepos = candidateRepos.slice(0, 15);

  const analyzedRepositories = [];
  const allEvidence = [];

  // 3. Inspect each repository for languages and manifest dependencies
  for (const repo of selectedRepos) {
    const repoEvidence = [];
    const detectedLanguagesList = [];

    // Language statistics
    try {
      const langRes = await fetchGitHub(`/repos/${repo.owner.login}/${repo.name}/languages`);
      if (langRes.ok && langRes.data && typeof langRes.data === 'object') {
        const langKeys = Object.keys(langRes.data);
        for (const lang of langKeys) {
          detectedLanguagesList.push(lang);
          const mappedSkill = mapLanguageToSkill(lang);
          if (mappedSkill) {
            repoEvidence.push({
              skill: mappedSkill,
              repository: repo.name,
              repositoryUrl: repo.html_url,
              evidenceType: 'repository-language',
              strength: 'supporting',
              details: `${mappedSkill} detected in repository language statistics`
            });
          }
        }
      }
    } catch (langErr) {
      // Continue without language stats if single repo call fails
    }

    // Inspect repository root for manifest files
    try {
      const contentsRes = await fetchGitHub(`/repos/${repo.owner.login}/${repo.name}/contents`);
      if (contentsRes.ok && Array.isArray(contentsRes.data)) {
        const rootItems = contentsRes.data;
        const rootItemNames = rootItems.map(i => i.name.toLowerCase());

        // Docker manifest check
        if (rootItemNames.includes('dockerfile') || rootItemNames.includes('docker-compose.yml') || rootItemNames.includes('docker-compose.yaml')) {
          repoEvidence.push({
            skill: 'Docker',
            repository: repo.name,
            repositoryUrl: repo.html_url,
            evidenceType: 'manifest',
            strength: 'strong',
            details: 'Docker configuration (Dockerfile / docker-compose) detected in repository'
          });
        }

        // CI/CD check (.github directory)
        if (rootItemNames.includes('.github')) {
          repoEvidence.push({
            skill: 'GitHub Actions',
            repository: repo.name,
            repositoryUrl: repo.html_url,
            evidenceType: 'manifest',
            strength: 'strong',
            details: 'GitHub Actions workflow configuration detected in .github/'
          });
        }

        // Check package.json
        const pkgItem = rootItems.find(i => i.name.toLowerCase() === 'package.json');
        if (pkgItem) {
          const content = await fetchRawFileContent(pkgItem);
          if (content) {
            const deps = inspectPackageJson(content, repo);
            repoEvidence.push(...deps);
          }
        }

        // Check requirements.txt
        const reqItem = rootItems.find(i => i.name.toLowerCase() === 'requirements.txt');
        if (reqItem) {
          const content = await fetchRawFileContent(reqItem);
          if (content) {
            const deps = inspectRequirementsTxt(content, repo);
            repoEvidence.push(...deps);
          }
        }

        // Check other manifests (pyproject.toml, pom.xml, build.gradle, Cargo.toml, go.mod)
        const otherManifests = ['pyproject.toml', 'pom.xml', 'build.gradle', 'cargo.toml', 'go.mod'];
        for (const manifestName of otherManifests) {
          const item = rootItems.find(i => i.name.toLowerCase() === manifestName);
          if (item) {
            const content = await fetchRawFileContent(item);
            if (content) {
              const deps = inspectOtherManifests(item.name.toLowerCase(), content, repo);
              repoEvidence.push(...deps);
            }
          }
        }
      }
    } catch (contentErr) {
      // Continue without manifest inspection if single repo call fails
    }

    // Deduplicate evidence within the repository
    const uniqueRepoEvidence = [];
    const seenEvidenceKey = new Set();
    for (const ev of repoEvidence) {
      const key = `${ev.skill}::${ev.evidenceType}::${ev.details}`;
      if (!seenEvidenceKey.has(key)) {
        seenEvidenceKey.add(key);
        uniqueRepoEvidence.push(ev);
        allEvidence.push(ev);
      }
    }

    analyzedRepositories.push({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || 'No description provided.',
      language: repo.language || (detectedLanguagesList[0] || 'Unknown'),
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      updatedAt: repo.updated_at,
      languages: detectedLanguagesList.length > 0 ? detectedLanguagesList : (repo.language ? [repo.language] : []),
      evidence: uniqueRepoEvidence
    });
  }

  // Deduplicate root evidence list
  const uniqueAllEvidence = [];
  const seenAllKey = new Set();
  for (const ev of allEvidence) {
    const key = `${ev.skill}::${ev.repository}::${ev.evidenceType}`;
    if (!seenAllKey.has(key)) {
      seenAllKey.add(key);
      uniqueAllEvidence.push(ev);
    }
  }

  return {
    profile,
    repositories: analyzedRepositories,
    evidence: uniqueAllEvidence
  };
}
