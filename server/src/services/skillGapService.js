import { SKILL_TAXONOMY } from '../utils/skillTaxonomy.js';
import { getCanonicalSkillName, compareJobWithVerifiedSkills, normalizeEvidenceStatus } from './jobMatcher.js';
import { getSession } from './sessionStore.js';

/**
 * Curated technical gap guidelines per technology.
 * Maps canonical skill names to domain-specific missing evidence,
 * recommended micro-tasks, and realistic estimated completion times.
 */
const SKILL_GAP_CATALOG = {
  'Docker': {
    category: 'DevOps',
    estimatedTime: '1–2 hours',
    claimedReason: 'Docker is claimed but repository evidence was not found.',
    partialReason: 'Docker references or basic commands were found, but dedicated container manifests or orchestration are missing.',
    missingEvidence: [
      'Dockerfile in repository root',
      'docker-compose.yml configuration',
      'Container build and run instructions in README',
      'Verified container networking with database service'
    ],
    recommendation: 'Create a Dockerfile, build the image, run the application in Docker, and connect the application to PostgreSQL.',
    microTask: {
      title: 'Containerize Application with Docker & Compose',
      steps: [
        'Create a Dockerfile in your project root with multi-stage build',
        'Build the container image locally: docker build -t app .',
        'Run the application in Docker and test port forwarding',
        'Connect the containerized application to PostgreSQL using docker-compose'
      ]
    }
  },
  'React': {
    category: 'Frontend',
    estimatedTime: '2–3 hours',
    claimedReason: 'React is claimed but repository evidence was not found.',
    partialReason: 'React evidence exists but is limited.',
    missingEvidence: [
      'Dedicated React component structure with hooks and state management',
      'package.json declaring React and React-DOM dependencies',
      'Interactive UI consuming backend API endpoints',
      'Component tests or responsive layout styling'
    ],
    recommendation: 'Build a small React frontend connected to the FastAPI backend.',
    microTask: {
      title: 'Build Interactive React Client for Backend API',
      steps: [
        'Initialize a React project with Vite or Create React App',
        'Build responsive components to consume FastAPI backend endpoints',
        'Implement state handling, loading indicators, and error boundaries',
        'Push the React codebase with package.json to GitHub'
      ]
    }
  },
  'FastAPI': {
    category: 'Backend',
    estimatedTime: '1–2 hours',
    claimedReason: 'FastAPI is claimed but API implementation evidence was not found.',
    partialReason: 'FastAPI imports detected, but lacks full REST endpoint coverage or validation models.',
    missingEvidence: [
      'main.py with FastAPI router endpoints',
      'Pydantic request and response schemas',
      'Automated test suite using pytest and TestClient',
      'Interactive OpenAPI Swagger documentation'
    ],
    recommendation: 'Create a RESTful FastAPI service with Pydantic request models, dependency injection, and automated tests.',
    microTask: {
      title: 'Build Robust FastAPI REST Microservice',
      steps: [
        'Initialize FastAPI application with structured APIRouter endpoints',
        'Define Pydantic models for payload validation and error handling',
        'Implement dependency injection for database sessions',
        'Write automated test cases with pytest and push to GitHub'
      ]
    }
  },
  'PostgreSQL': {
    category: 'Databases',
    estimatedTime: '1–2 hours',
    claimedReason: 'PostgreSQL is claimed but database schema or repository evidence was not found.',
    partialReason: 'PostgreSQL connection strings detected, but relational schema migrations and table definitions are missing.',
    missingEvidence: [
      'SQL migration scripts or schema.sql definitions',
      'Relational tables with primary keys and foreign key constraints',
      'Parameterized query layer or ORM models (SQLAlchemy/Prisma)',
      'Database connection pooling configuration'
    ],
    recommendation: 'Create PostgreSQL database migrations, define relational tables with indexes, and query data using connection pooling.',
    microTask: {
      title: 'Implement PostgreSQL Schema & Relational Models',
      steps: [
        'Create schema.sql or migration scripts defining relational tables',
        'Configure database connection pooling in your backend application',
        'Implement CRUD operations using parameterized SQL queries or ORM',
        'Push migration files and seed data scripts to repository'
      ]
    }
  },
  'Python': {
    category: 'Programming Languages',
    estimatedTime: '1–2 hours',
    claimedReason: 'Python is claimed but observable source code was not found.',
    partialReason: 'Python files detected, but lacking structured modules, package manifests, or test suites.',
    missingEvidence: [
      'Clean Python source files (.py) with modular architecture',
      'requirements.txt, pyproject.toml, or Pipfile dependency declaration',
      'Automated unit tests using unittest or pytest',
      'Type annotations and docstrings'
    ],
    recommendation: 'Build a modular Python application with package manifests, automated tests, and clear README documentation.',
    microTask: {
      title: 'Develop Modular Python Project with Automated Tests',
      steps: [
        'Structure Python application into packages with __init__.py',
        'Create requirements.txt declaring explicit dependency versions',
        'Write unit tests verifying core algorithmic logic',
        'Push code and automated test workflow to GitHub'
      ]
    }
  },
  'Git': {
    category: 'DevOps',
    estimatedTime: '30–60 mins',
    claimedReason: 'Git is claimed but observable multi-commit or branching evidence was not found.',
    partialReason: 'Single initial commit observed without feature branching or pull request history.',
    missingEvidence: [
      'Meaningful commit history spanning multiple development milestones',
      'Feature branch pull request workflows with code review notes',
      'Atomic commit messages following conventional commits',
      'Release tags or GitHub release notes'
    ],
    recommendation: 'Demonstrate Git proficiency by organizing codebase work into feature branches with descriptive commit messages.',
    microTask: {
      title: 'Establish Git Branching & Pull Request Workflow',
      steps: [
        'Create and switch to a feature branch (e.g., git checkout -b feature/auth)',
        'Make atomic commits with descriptive commit messages',
        'Push the branch and open a Pull Request on GitHub',
        'Merge the pull request and create a semantic release tag (v1.0.0)'
      ]
    }
  },
  'TypeScript': {
    category: 'Programming Languages',
    estimatedTime: '1–2 hours',
    claimedReason: 'TypeScript is claimed but type definitions or tsconfig were not found.',
    partialReason: 'TypeScript installed, but source code relies heavily on `any` types without strict checking.',
    missingEvidence: [
      'tsconfig.json with strict mode enabled',
      '.ts or .tsx source files with custom interface definitions',
      'Zero type errors during tsc compilation',
      'Strongly-typed API request/response boundaries'
    ],
    recommendation: 'Configure strict TypeScript compilation, define explicit data models, and eliminate any type bypasses.',
    microTask: {
      title: 'Implement Strict TypeScript Architecture',
      steps: [
        'Add tsconfig.json with "strict": true',
        'Define interface and type contracts for all data models',
        'Refactor application code to eliminate any implicit "any" types',
        'Verify compilation passes with `npx tsc --noEmit` and push to GitHub'
      ]
    }
  },
  'Node.js': {
    category: 'Backend',
    estimatedTime: '1–2 hours',
    claimedReason: 'Node.js is claimed but server runtime implementation was not found.',
    partialReason: 'Node.js dependencies present in package.json, but no custom backend service logic detected.',
    missingEvidence: [
      'package.json with start and dev server scripts',
      'Express or Fastify HTTP server implementation',
      'Asynchronous middleware and route handling',
      'Environment variable configuration (.env.example)'
    ],
    recommendation: 'Build a Node.js REST API with asynchronous route handlers, middleware error handling, and environment config.',
    microTask: {
      title: 'Build Asynchronous Node.js Server',
      steps: [
        'Initialize Node.js application with package.json scripts',
        'Implement Express or Fastify server with JSON parsing middleware',
        'Create modular route controllers handling asynchronous requests',
        'Add .env.example configuration and push to GitHub'
      ]
    }
  },
  'Kubernetes': {
    category: 'DevOps',
    estimatedTime: '2–4 hours',
    claimedReason: 'Kubernetes is claimed but deployment manifests were not found.',
    partialReason: 'Kubernetes mentioned in documentation, but no functional YAML manifests exist in repository.',
    missingEvidence: [
      'Deployment manifest specifying container replicas and resource limits',
      'Service manifest (ClusterIP, NodePort, or LoadBalancer)',
      'ConfigMap and Secret declarations for configuration',
      'Readiness and liveness probe definitions'
    ],
    recommendation: 'Create Kubernetes deployment and service manifests to deploy the containerized application on a cluster.',
    microTask: {
      title: 'Deploy Containerized Service to Kubernetes',
      steps: [
        'Write deployment.yaml specifying container image, replicas, and probes',
        'Create service.yaml exposing the application port',
        'Test manifests locally using Minikube, Kind, or Docker Desktop',
        'Commit all Kubernetes manifests under a k8s/ directory'
      ]
    }
  },
  'MongoDB': {
    category: 'Databases',
    estimatedTime: '1–2 hours',
    claimedReason: 'MongoDB is claimed but document schema or database queries were not found.',
    partialReason: 'MongoDB driver installed, but database models or aggregation pipelines are missing.',
    missingEvidence: [
      'Mongoose or PyMongo schema and document models',
      'CRUD operations handling nested document structures',
      'Aggregation pipeline queries for reporting or analytics',
      'Database connection string management and error recovery'
    ],
    recommendation: 'Implement MongoDB data models, write document queries with indexing, and handle database connections cleanly.',
    microTask: {
      title: 'Implement MongoDB Document Data Store',
      steps: [
        'Define Mongoose or PyMongo document schemas with validation',
        'Implement CRUD API endpoints interacting with MongoDB collections',
        'Write an aggregation pipeline query for analytics',
        'Push code and database seed script to GitHub'
      ]
    }
  },
  'Redis': {
    category: 'Databases',
    estimatedTime: '1–2 hours',
    claimedReason: 'Redis is claimed but caching implementation was not found.',
    partialReason: 'Redis client initialized, but no active caching or TTL mechanisms are implemented.',
    missingEvidence: [
      'Redis client connection with error handling and retry logic',
      'Cache-aside read/write implementation with expiration TTLs',
      'Cache invalidation strategy on data updates',
      'Integration with backend API endpoints'
    ],
    recommendation: 'Implement Redis as an in-memory cache layer with TTL expiration and cache-aside query pattern.',
    microTask: {
      title: 'Implement Redis In-Memory Cache Layer',
      steps: [
        'Set up Redis client connection in your backend service',
        'Implement cache-aside pattern on high-traffic GET endpoints',
        'Set appropriate TTLs and invalidate cache on data mutations',
        'Push caching service code and documentation to GitHub'
      ]
    }
  },
  'AWS': {
    category: 'Cloud',
    estimatedTime: '2–3 hours',
    claimedReason: 'AWS is claimed but cloud deployment or infrastructure code was not found.',
    partialReason: 'AWS mentioned, but no Infrastructure-as-Code or AWS SDK integration observed.',
    missingEvidence: [
      'Infrastructure as Code (Terraform, CloudFormation, or AWS CDK)',
      'AWS SDK integration (e.g., S3 file uploads, SES, SQS)',
      'Automated deployment pipeline to AWS ECS, Lambda, or App Runner',
      'Architecture diagram and deployment instructions'
    ],
    recommendation: 'Integrate AWS SDK for cloud storage (S3) or write Terraform manifests to deploy services to AWS.',
    microTask: {
      title: 'Integrate AWS Cloud Services',
      steps: [
        'Set up AWS SDK client with secure credential management',
        'Implement S3 bucket file upload/download functionality',
        'Write Terraform or CloudFormation script for bucket provisioning',
        'Push infrastructure code and architectural documentation'
      ]
    }
  },
  'Power BI': {
    category: 'Tools',
    estimatedTime: '1–2 hours',
    claimedReason: 'Power BI is claimed but observable report or DAX evidence was not found.',
    partialReason: 'Power BI mentioned, but no report screenshots, measures, or data model demonstrated.',
    missingEvidence: [
      '.pbix report file or public dashboard link',
      'Custom DAX measures for business calculations',
      'Multi-table dimensional data model (Star Schema)',
      'Interactive executive visual dashboard'
    ],
    recommendation: 'Build a Power BI report with star-schema modeling, custom DAX measures, and interactive KPI visuals.',
    microTask: {
      title: 'Build Executive Power BI Analytics Report',
      steps: [
        'Import dataset and construct relational star schema model',
        'Write custom DAX measures for YoY growth and KPI tracking',
        'Design interactive executive dashboard with slicers and drill-downs',
        'Upload .pbix file or screenshot documentation to repository'
      ]
    }
  }
};

/**
 * Builds structured gap analysis for a single skill.
 * 
 * @param {object} params
 * @param {string} params.skill - Skill name
 * @param {string} params.status - Evidence status ('CLAIMED-ONLY' | 'PARTIAL' | 'NO EVIDENCE' | 'PROVEN')
 * @param {object} [params.candidateEvidence] - Candidate's observable evidence if available
 * @returns {object} Structured gap details
 */
export function getSkillGapDetails({ skill, status, candidateEvidence = {} }) {
  const canonical = getCanonicalSkillName(skill);
  const normalizedStatus = normalizeEvidenceStatus(status, 'CLAIMED-ONLY');
  const catalogEntry = SKILL_GAP_CATALOG[canonical];

  // 1. Status & Category
  let category = catalogEntry?.category || candidateEvidence?.category || 'Other';
  if (category === 'Other') {
    const tax = SKILL_TAXONOMY.find(t => t.name.toLowerCase() === canonical.toLowerCase());
    if (tax) category = tax.category;
  }

  // 2. Reason why it is a gap
  let reason = '';
  const isFailedAssessment = candidateEvidence?.assessmentStatus === 'failed';
  const asmtScore = candidateEvidence?.assessmentScore || 0;

  if (isFailedAssessment) {
    reason = `Assessment attempted but not passed (${asmtScore}%). Minimum passing score is 70%.`;
  } else if (normalizedStatus === 'PROVEN') {
    reason = `${canonical} is fully verified with observable evidence.`;
  } else if (normalizedStatus === 'PARTIAL') {
    reason = catalogEntry?.partialReason || `${canonical} evidence exists but is limited.`;
  } else if (normalizedStatus === 'CLAIMED-ONLY') {
    reason = catalogEntry?.claimedReason || `${canonical} is claimed but repository evidence was not found.`;
  } else {
    // NO EVIDENCE (missing)
    reason = `${canonical} is required by the role, but no observable repository evidence or resume claim was found.`;
  }

  // 3. Evidence currently found
  let currentEvidence = '';
  if (isFailedAssessment) {
    currentEvidence = `Practical micro-task assessment attempted (${asmtScore}%), but score fell below the 70% verification threshold.`;
  } else if (normalizedStatus === 'PROVEN') {
    const repos = candidateEvidence?.repositories || [];
    currentEvidence = repos.length > 0
      ? `Verified across ${repos.length} repository: ${repos.map(r => typeof r === 'string' ? r : r.name).join(', ')}.`
      : `Verified with direct technical implementation evidence.`;
  } else if (normalizedStatus === 'PARTIAL') {
    const repos = candidateEvidence?.repositories || [];
    if (repos.length > 0) {
      currentEvidence = `Observed in language statistics or partial usage in ${repos.map(r => typeof r === 'string' ? r : r.name).join(', ')}, but lacking dedicated project architecture.`;
    } else {
      currentEvidence = `Partial technical footprint detected, but lacking standalone manifests or verifiable implementation proof.`;
    }
  } else if (normalizedStatus === 'CLAIMED-ONLY') {
    currentEvidence = `Claimed on resume/profile, but 0 observable artifacts or public repositories were found.`;
  } else {
    currentEvidence = `No evidence found across public GitHub repositories or candidate profile.`;
  }

  // 4. Missing Evidence
  let missingEvidence = [];
  if (normalizedStatus === 'PROVEN') {
    missingEvidence = [];
  } else if (isFailedAssessment) {
    missingEvidence = [
      `Passing score (70% or higher) on the ${canonical} practical assessment`,
      `Verified practical task implementations in assessment`,
      `Observable technical artifacts or repository code`
    ];
  } else if (catalogEntry?.missingEvidence) {
    missingEvidence = catalogEntry.missingEvidence;
  } else {
    missingEvidence = [
      `Observable source code implementation files for ${canonical}`,
      `Build or package manifest declaring ${canonical} dependencies`,
      `Runnable project documentation and setup instructions in README.md`
    ];
  }

  // 5. Recommended Micro-Task & Steps
  let recommendation = '';
  let microTask = null;
  let estimatedTime = catalogEntry?.estimatedTime || '1–2 hours';

  if (isFailedAssessment) {
    recommendation = `Complete the ${canonical} Micro-Task again. Review practical operations and attain at least 70% to verify this skill.`;
    estimatedTime = '10–15 minutes';
    microTask = {
      title: `Retake ${canonical} Micro-Task Assessment`,
      steps: [
        `Review practical ${canonical} syntax, key functions, and edge cases`,
        `Click "Prove with Micro-Task" or "Retake Assessment" on ${canonical}`,
        `Complete the practical tasks and achieve at least 70%`,
        `Submit assessment to earn verified status`
      ]
    };
  } else if (normalizedStatus === 'PROVEN') {
    recommendation = `${canonical} is already verified. Maintain regular repository commits to keep evidence fresh.`;
    microTask = {
      title: `Maintain Verified ${canonical} Evidence`,
      steps: [
        `Keep project dependencies up to date`,
        `Maintain active commit history on GitHub`,
        `Document new features in repository README`
      ]
    };
    estimatedTime = '0 mins';
  } else if (catalogEntry) {
    recommendation = catalogEntry.recommendation;
    microTask = catalogEntry.microTask;
  } else {
    recommendation = `Build a small demonstration project implementing ${canonical} and push to a public GitHub repository.`;
    microTask = {
      title: `Build Demonstration Project for ${canonical}`,
      steps: [
        `Initialize a dedicated project repository for ${canonical}`,
        `Implement working source code demonstrating ${canonical} core features`,
        `Include build/dependency manifests and run instructions in README`,
        `Push commits and verify public repository accessibility on GitHub`
      ]
    };
  }

  return {
    skill: canonical,
    status: normalizedStatus,
    category,
    reason,
    currentEvidence,
    missingEvidence,
    recommendation,
    microTask,
    estimatedTime
  };
}

/**
 * Generates comprehensive Skill Gap Details for candidate verification against a job.
 * Automatically utilizes:
 * Job Match Result + Verified Skill Evidence.
 * 
 * Rules:
 * - PROVEN skills are NOT gaps (they are matched).
 * - PARTIAL skills are gaps (limited proof requiring enhancement).
 * - CLAIMED-ONLY skills are gaps (claimed without proof).
 * - NO EVIDENCE skills are gaps (missing requirements).
 * 
 * @param {object} params
 * @param {object} [params.jobMatchResult] - Existing Job Match result (if available)
 * @param {Array} [params.verifiedSkills] - Candidate verified skills
 * @param {object|string} [params.jobDescription] - Job description
 * @param {string} [params.sessionId] - Session ID
 * @param {Array} [params.claimedSkills] - Candidate claimed skills
 * @param {object} [params.crossVerification] - Cross-verification output
 * @returns {object} Structured Skill Gap Details Response
 */
export function analyzeSkillGaps({
  jobMatchResult,
  verifiedSkills = [],
  jobDescription = {},
  sessionId = '',
  claimedSkills = [],
  crossVerification = {}
} = {}) {
  let resolvedJobMatch = jobMatchResult;
  let candidateSkills = Array.isArray(verifiedSkills) && verifiedSkills.length > 0 ? verifiedSkills : claimedSkills;

  // 1. If sessionId is provided and skills are empty, look up authoritative session
  if (sessionId && (!candidateSkills || candidateSkills.length === 0)) {
    const session = getSession(sessionId);
    if (session && Array.isArray(session.claimedSkills)) {
      candidateSkills = session.claimedSkills;
      if (!crossVerification || Object.keys(crossVerification).length === 0) {
        crossVerification = session.crossVerification || {};
      }
    }
  }

  // 2. If jobMatchResult is not provided, run compareJobWithVerifiedSkills
  if (!resolvedJobMatch) {
    resolvedJobMatch = compareJobWithVerifiedSkills({
      verifiedSkills: candidateSkills,
      jobDescription,
      claimedSkills: candidateSkills,
      crossVerification
    });
  }

  // 3. Extract Gaps: Both skillGaps (CLAIMED-ONLY, NO EVIDENCE) and partialSkills (PARTIAL)
  const rawSkillGaps = resolvedJobMatch?.skillGaps || resolvedJobMatch?.match?.skillGaps || resolvedJobMatch?.match?.gapSkills || [];
  const rawPartialSkills = resolvedJobMatch?.partialSkills || resolvedJobMatch?.match?.partialSkills || [];

  // Build candidate skills index for evidence lookup
  const candidateIndex = new Map();
  if (Array.isArray(candidateSkills)) {
    for (const c of candidateSkills) {
      if (!c) continue;
      const name = typeof c === 'string' ? c : (c.skill || c.name || '');
      if (name) {
        candidateIndex.set(getCanonicalSkillName(name).toLowerCase(), c);
      }
    }
  }

  const structuredGaps = [];
  const processedSkills = new Set();

  // Helper to add gap item
  function addGapItem(item, defaultStatus) {
    const rawName = typeof item === 'string' ? item : (item.skill || item.name || '');
    if (!rawName) return;
    const canonical = getCanonicalSkillName(rawName);
    const key = canonical.toLowerCase();
    if (processedSkills.has(key)) return;
    processedSkills.add(key);

    const cand = candidateIndex.get(key);
    const status = typeof item === 'object' && item.status ? item.status : defaultStatus;

    const gapDetails = getSkillGapDetails({
      skill: canonical,
      status,
      candidateEvidence: cand || item
    });

    structuredGaps.push(gapDetails);
  }

  // Process CLAIMED-ONLY and NO EVIDENCE gaps first
  for (const gap of rawSkillGaps) {
    addGapItem(gap, 'CLAIMED-ONLY');
  }

  // Process PARTIAL skills as gaps needing strengthening
  for (const partial of rawPartialSkills) {
    addGapItem(partial, 'PARTIAL');
  }

  // If candidate has any claimed skills that are unverified (and not in required list), include them too
  if (Array.isArray(candidateSkills)) {
    for (const cand of candidateSkills) {
      if (!cand) continue;
      const rawName = typeof cand === 'string' ? cand : (cand.skill || cand.name || '');
      const rawStatus = typeof cand === 'string' ? 'CLAIMED-ONLY' : normalizeEvidenceStatus(cand.status || cand.verificationStatus);
      if (rawStatus === 'CLAIMED-ONLY' || rawStatus === 'PARTIAL') {
        const canonical = getCanonicalSkillName(rawName);
        const key = canonical.toLowerCase();
        if (!processedSkills.has(key)) {
          addGapItem(cand, rawStatus);
        }
      }
    }
  }

  const role = resolvedJobMatch?.role || resolvedJobMatch?.match?.role || 'Target Technical Role';

  // Construct factual summary
  let summary = '';
  if (structuredGaps.length === 0) {
    summary = 'All required technical competencies are supported with verified evidence. Zero skill gaps detected!';
  } else {
    const claimedCount = structuredGaps.filter(g => g.status === 'CLAIMED-ONLY').length;
    const partialCount = structuredGaps.filter(g => g.status === 'PARTIAL').length;
    const missingCount = structuredGaps.filter(g => g.status === 'NO EVIDENCE').length;

    const parts = [];
    if (claimedCount > 0) parts.push(`${claimedCount} claimed without evidence`);
    if (partialCount > 0) parts.push(`${partialCount} partially supported`);
    if (missingCount > 0) parts.push(`${missingCount} missing entirely`);

    summary = `${structuredGaps.length} skill gap${structuredGaps.length === 1 ? '' : 's'} identified (${parts.join(', ')}). Follow recommended micro-tasks to close each gap.`;
  }

  return {
    success: true,
    role,
    totalGaps: structuredGaps.length,
    skillGaps: structuredGaps,
    summary
  };
}
