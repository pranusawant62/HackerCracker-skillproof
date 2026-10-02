/**
 * Automatic Job Description Generator Service
 * 
 * Deterministically generates realistic job descriptions based strictly
 * on a candidate's VERIFIED (proven) skills.
 * 
 * Invariants:
 * 1. PROVEN skills must be treated as verified evidence and anchor the required skills.
 * 2. PARTIAL skills are treated as secondary or preferred/nice-to-have competencies.
 * 3. CLAIMED-ONLY (unverified) skills are NEVER treated as proven.
 * 4. Deterministic and reproducible for identical skill profiles.
 * 5. If insufficient verified skills are present, returns a helpful fallback guidance response.
 */

// Canonical role templates and their affinity mappings
const ROLE_PROFILES = [
  {
    id: 'fullstack',
    role: 'Full-Stack Software Engineer',
    department: 'Product Engineering',
    category: 'Full-Stack',
    summaryTemplate: (topSkills) =>
      `We are seeking a Full-Stack Software Engineer to build and scale end-to-end web applications. In this role, you will work across both client-facing interfaces and high-performance server architectures using ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Design, implement, and maintain responsive web user interfaces.',
      'Architect and scale robust backend services, microservices, and server systems.',
      'Model relational and document data stores, write optimized queries, and manage migrations.',
      'Collaborate across teams following agile practices, automated testing, and continuous delivery.',
      'Maintain version control hygiene, pull request workflows, and code documentation.'
    ],
    primaryKeywords: ['react', 'next.js', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css'],
    secondaryKeywords: ['node.js', 'express', 'python', 'fastapi', 'django', 'flask', 'java', 'spring boot', 'postgresql', 'mysql', 'mongodb', 'sql']
  },
  {
    id: 'backend',
    role: 'Backend Developer',
    department: 'Core Infrastructure & Services',
    category: 'Backend',
    summaryTemplate: (topSkills) =>
      `We are looking for a Backend Developer to engineer robust server-side systems, microservices, and high-throughput data processing services powered by ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Design, develop, and maintain high-performance server-side services and application endpoints.',
      'Architect database schemas, implement indexing strategies, and optimize complex queries.',
      'Build secure, scalable data persistence and caching layers with low latency.',
      'Enforce code review standards, quality gates, and automated deployment practices.',
      'Implement automated integration testing and monitor service health in production.'
    ],
    primaryKeywords: ['python', 'fastapi', 'django', 'flask', 'java', 'spring boot', 'go', 'golang', 'rust', 'c#', 'node.js', 'express', 'nestjs', 'php', 'ruby'],
    secondaryKeywords: ['postgresql', 'mysql', 'mongodb', 'redis', 'sql', 'sqlite', 'git', 'github', 'docker']
  },
  {
    id: 'frontend',
    role: 'Frontend Developer',
    department: 'User Experience Engineering',
    category: 'Frontend',
    summaryTemplate: (topSkills) =>
      `We are seeking a skilled Frontend Developer to craft interactive, accessible, and high-performance web experiences utilizing modern tools including ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Develop modern, responsive web applications using component-driven UI architectures.',
      'Translate design wireframes and user workflows into pixel-perfect, accessible code.',
      'Optimize web performance, client-side caching, and bundle delivery across devices.',
      'Integrate frontend applications with server-side endpoints and structured data streams.',
      'Collaborate using disciplined version control, continuous integration, and automated UI testing.'
    ],
    primaryKeywords: ['react', 'next.js', 'vue', 'angular', 'typescript', 'javascript', 'html', 'css', 'tailwind css', 'redux', 'sass'],
    secondaryKeywords: ['git', 'github', 'ui/ux', 'webpack', 'vite']
  },
  {
    id: 'data_analytics',
    role: 'Power BI / Data Analyst',
    department: 'Business Intelligence & Analytics',
    category: 'Data & Analytics',
    summaryTemplate: (topSkills) =>
      `We are looking for a Data Analyst to transform complex datasets into actionable business intelligence reports and dynamic dashboards using ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Build interactive dashboards, KPI reports, and executive scorecards.',
      'Write analytical calculations, measures, and data models to extract business insights.',
      'Perform data cleansing, transformation, and automated reporting workflows.',
      'Collaborate with business stakeholders to understand reporting and decision-support needs.',
      'Ensure data accuracy, governance, and row-level security across BI workspaces.'
    ],
    primaryKeywords: ['power bi', 'tableau', 'dax', 'power query', 'sql', 'data analytics', 'data visualization'],
    secondaryKeywords: ['postgresql', 'mysql', 'python', 'pandas', 'excel']
  },
  {
    id: 'data_engineering',
    role: 'Data Engineer',
    department: 'Data Platforms',
    category: 'Databases & Data Platforms',
    summaryTemplate: (topSkills) =>
      `We are seeking a Data Engineer to design, construct, and scale reliable data pipelines, normalized data stores, and analytical warehouses using ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Architect normalized schemas, analytical databases, and high-volume data ingestion pipelines.',
      'Write optimized queries, stored procedures, and automated transformation workflows.',
      'Build robust data ingestion frameworks across structured and unstructured data stores.',
      'Implement data quality validation, partition maintenance, and query execution planning.',
      'Maintain version-controlled database migrations and cloud integration pipelines.'
    ],
    primaryKeywords: ['postgresql', 'mysql', 'sql', 'mongodb', 'redis', 'database schema', 'database management'],
    secondaryKeywords: ['python', 'pandas', 'docker', 'git', 'github', 'cloud']
  },
  {
    id: 'devops',
    role: 'DevOps / Cloud Engineer',
    department: 'Platform & Cloud Infrastructure',
    category: 'DevOps',
    summaryTemplate: (topSkills) =>
      `We are looking for a DevOps Engineer to automate build, deployment, and cloud infrastructure pipelines leveraging containerization and orchestration with ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Design and manage containerized application deployments and service orchestration.',
      'Build automated delivery workflows, build pipelines, and release gates.',
      'Provision, monitor, and scale secure cloud infrastructure environments.',
      'Maintain system observability, container registries, and infrastructure as code.',
      'Collaborate with development teams to ensure high availability and rapid disaster recovery.'
    ],
    primaryKeywords: ['docker', 'kubernetes', 'k8s', 'github actions', 'ci/cd', 'terraform', 'aws', 'azure', 'gcp', 'linux'],
    secondaryKeywords: ['git', 'github', 'python', 'go', 'bash']
  },
  {
    id: 'mobile',
    role: 'Mobile Application Developer',
    department: 'Mobile Engineering',
    category: 'Mobile',
    summaryTemplate: (topSkills) =>
      `We are seeking a Mobile Developer to build engaging, high-performance mobile applications on cross-platform and native ecosystems with ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Develop smooth, responsive mobile client applications with clean architecture.',
      'Integrate mobile clients with server-side endpoints and push notification infrastructure.',
      'Optimize app memory footprint, offline caching, and battery performance.',
      'Manage app store submission lifecycles, code signing, and beta testing distribution.',
      'Maintain version-controlled codebases and automated test coverage.'
    ],
    primaryKeywords: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'],
    secondaryKeywords: ['typescript', 'javascript', 'firebase', 'git', 'github']
  },
  {
    id: 'ai_ml',
    role: 'AI / Machine Learning Engineer',
    department: 'Applied Machine Learning',
    category: 'AI / ML',
    summaryTemplate: (topSkills) =>
      `We are seeking an AI/ML Engineer to research, train, and deploy predictive models and intelligent algorithmic systems using ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Preprocess large unstructured and structured datasets for model training and evaluation.',
      'Train, fine-tune, and validate deep learning and statistical machine learning architectures.',
      'Deploy production-ready inference endpoints and scalable model serving pipelines.',
      'Benchmark model latency, accuracy, and drift in live production environments.',
      'Collaborate using version-controlled experiment tracking and containerized workflows.'
    ],
    primaryKeywords: ['python', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'openai', 'machine learning'],
    secondaryKeywords: ['fastapi', 'docker', 'git', 'github', 'postgresql']
  },
  {
    id: 'general_swe',
    role: 'Software Engineer',
    department: 'Engineering',
    category: 'Software Engineering',
    summaryTemplate: (topSkills) =>
      `We are looking for a Software Engineer to design, implement, and maintain reliable software systems and services utilizing ${topSkills.join(', ')}.`,
    coreResponsibilities: [
      'Develop clean, maintainable, and well-tested software components and services.',
      'Collaborate across cross-functional teams to deliver customer-facing features.',
      'Participate in design reviews, code reviews, and architectural discussions.',
      'Maintain disciplined version control workflows and release automation.',
      'Diagnose and resolve performance bottlenecks across application layers.'
    ],
    primaryKeywords: ['c++', 'c', 'c#', 'java', 'python', 'git', 'github', 'sql'],
    secondaryKeywords: ['docker', 'linux', 'algorithms', 'data structures']
  }
];

/**
 * Normalizes input skills array into verified, partial, and unverified categories.
 * 
 * @param {Array} rawSkills 
 * @returns {{ proven: string[], partial: string[], unverified: string[] }}
 */
export function normalizeSkillsInput(rawSkills = []) {
  const proven = new Set();
  const partial = new Set();
  const unverified = new Set();

  if (!Array.isArray(rawSkills)) {
    return { proven: [], partial: [], unverified: [] };
  }

  for (const item of rawSkills) {
    if (!item) continue;

    let skillName = '';
    let status = 'unverified';

    if (typeof item === 'string') {
      skillName = item.trim();
      status = 'proven'; // If passed as plain list of confirmed skills
    } else if (typeof item === 'object') {
      skillName = (item.skill || item.name || '').trim();
      status = (item.status || item.verificationStatus || 'unverified').toLowerCase();
    }

    if (!skillName) continue;

    if (status === 'proven' || status === 'proved') {
      proven.add(skillName);
    } else if (status === 'partially_proven' || status === 'partial') {
      partial.add(skillName);
    } else {
      unverified.add(skillName);
    }
  }

  // Remove any skill from partial or unverified if it is proven
  proven.forEach(s => {
    partial.delete(s);
    unverified.delete(s);
  });

  return {
    proven: Array.from(proven),
    partial: Array.from(partial),
    unverified: Array.from(unverified)
  };
}

/**
 * Evaluates candidate's proven skills against technical role archetypes
 * and deterministically selects the highest-scoring matching role.
 * 
 * @param {string[]} provenSkills 
 * @returns {object} The chosen role profile
 */
export function determineRoleFromSkills(provenSkills = []) {
  if (!provenSkills || provenSkills.length === 0) {
    return null;
  }

  const lowerProven = provenSkills.map(s => s.toLowerCase());

  // Check special Full-Stack condition: Must have at least 1 frontend AND 1 backend/database skill
  const fullstackProfile = ROLE_PROFILES.find(p => p.id === 'fullstack');
  const hasFrontend = lowerProven.some(s => fullstackProfile.primaryKeywords.includes(s));
  const hasBackend = lowerProven.some(s => fullstackProfile.secondaryKeywords.includes(s));
  const isFullstackCandidate = hasFrontend && hasBackend;

  let bestProfile = null;
  let bestScore = -1;

  for (const profile of ROLE_PROFILES) {
    if (profile.id === 'fullstack' && !isFullstackCandidate) {
      continue; // Skip fullstack if candidate doesn't have both frontend and backend
    }

    let score = 0;

    // Primary keywords: +15 points
    for (const kw of profile.primaryKeywords) {
      if (lowerProven.includes(kw)) {
        score += 15;
      }
    }

    // Secondary keywords: +8 points
    for (const kw of profile.secondaryKeywords) {
      if (lowerProven.includes(kw)) {
        score += 8;
      }
    }

    // Priority bonus for specialized roles
    if (profile.id === 'backend' && (lowerProven.includes('fastapi') || lowerProven.includes('django') || lowerProven.includes('spring boot'))) {
      score += 10;
    }
    if (profile.id === 'data_analytics' && (lowerProven.includes('power bi') || lowerProven.includes('tableau') || lowerProven.includes('dax'))) {
      score += 20;
    }
    if (profile.id === 'devops' && (lowerProven.includes('docker') || lowerProven.includes('kubernetes'))) {
      score += 15;
    }

    if (score > bestScore) {
      bestScore = score;
      bestProfile = profile;
    }
  }

  // Fallback to General Software Engineer if score is 0 or no profile matched
  if (!bestProfile || bestScore <= 0) {
    return ROLE_PROFILES.find(p => p.id === 'general_swe') || ROLE_PROFILES[0];
  }

  return bestProfile;
}

/**
 * Builds deterministic, tailored job description text, structured requirements,
 * and relevant technologies matching the proven and partial skill profile.
 * 
 * @param {object} params
 * @param {Array} params.skills - Candidate skills array (from session.claimedSkills or manual)
 * @returns {object} Structured Job Description output matching the contract
 */
export function generateJobDescription({ skills = [] } = {}) {
  const { proven, partial, unverified } = normalizeSkillsInput(skills);

  // Insufficient verified skills fallback
  if (proven.length === 0) {
    return {
      role: 'Insufficient Verified Skills',
      department: 'Engineering',
      summary: 'No verified technical skills were detected. Upload verifiable evidence (such as GitHub repositories or certified technical credentials) to automatically generate a targeted job description.',
      responsibilities: [
        'Verify technical skills through observable code, commits, or certificates.',
        'Link active GitHub repositories demonstrating project architecture.',
        'Submit verifiable evidence to establish proven technical competencies.'
      ],
      requiredSkills: [],
      preferredSkills: partial.length > 0 ? partial : [],
      technologies: partial.length > 0 ? partial : [],
      jobDescriptionText: `Job Title: Technical Candidate (Pending Verification)
Department: Engineering

About the Role:
Currently, there are insufficient verified technical skills to generate a targeted role description. Please upload GitHub repositories or technical certificates to verify your skills.

Required Qualifications:
- Verifiable proof of technical implementation is required.

Preferred Qualifications:
${partial.length > 0 ? partial.map(s => `- Experience with ${s} is a plus.`).join('\n') : '- Familiarity with modern software development.'}

Technologies:
${partial.join(', ')}`
    };
  }

  // Determine best-matching role profile
  const profile = determineRoleFromSkills(proven);

  // Tailor title if a strong primary language/tool is proven
  let roleTitle = profile.role;
  const lowerProven = proven.map(s => s.toLowerCase());

  if (profile.id === 'backend') {
    if (lowerProven.includes('python')) roleTitle = 'Backend Developer';
    else if (lowerProven.includes('java')) roleTitle = 'Java Backend Developer';
    else if (lowerProven.includes('go')) roleTitle = 'Go Backend Engineer';
  } else if (profile.id === 'frontend') {
    if (lowerProven.includes('react')) roleTitle = 'React Frontend Developer';
    else if (lowerProven.includes('angular')) roleTitle = 'Angular Developer';
  } else if (profile.id === 'data_analytics') {
    if (lowerProven.includes('power bi')) roleTitle = 'Power BI / Data Analyst';
    else if (lowerProven.includes('tableau')) roleTitle = 'Tableau / BI Analyst';
  }

  // Summary
  const topProven = proven.slice(0, 4);
  const summary = profile.summaryTemplate(topProven);

  // Required skills are anchored strictly on PROVEN skills
  const requiredSkills = [...proven];

  // Preferred skills incorporate PARTIAL skills and unverified skills as nice-to-haves
  const preferredSkills = [];
  partial.forEach(s => {
    if (!requiredSkills.includes(s) && !preferredSkills.includes(s)) {
      preferredSkills.push(s);
    }
  });

  // Include up to 2 unverified claimed skills as preferred/bonus if available
  unverified.slice(0, 2).forEach(s => {
    if (!requiredSkills.includes(s) && !preferredSkills.includes(s)) {
      preferredSkills.push(s);
    }
  });

  // If preferred skills are sparse, suggest standard complementary technologies
  if (preferredSkills.length === 0) {
    if (profile.id === 'backend') preferredSkills.push('Docker', 'Redis');
    else if (profile.id === 'frontend') preferredSkills.push('Tailwind CSS', 'Next.js');
    else if (profile.id === 'data_analytics') preferredSkills.push('Python', 'PostgreSQL');
    else preferredSkills.push('CI/CD', 'Cloud Infrastructure');
  }

  // Deduplicated list of relevant technologies
  const technologies = Array.from(new Set([...requiredSkills, ...preferredSkills]));

  // Responsibilities tailored with candidate's actual proven tools
  const responsibilities = profile.coreResponsibilities.map((resp, idx) => {
    if (idx === 0 && proven.length >= 2) {
      return `${resp.replace(/\.$/, '')} using ${proven.slice(0, 2).join(' and ')}.`;
    }
    if (idx === 1 && proven.length >= 3) {
      return `${resp.replace(/\.$/, '')} incorporating ${proven[2]}.`;
    }
    return resp;
  });

  // Construct complete, realistic job description text compatible with Stage 6A/6B parsers
  const jobDescriptionText = `Job Title: ${roleTitle}
Department: ${profile.department}

About the Role:
${summary}

Key Responsibilities:
${responsibilities.map(r => `- ${r}`).join('\n')}

Required Qualifications:
${requiredSkills.map(s => `- Strong, verified proficiency in ${s}.`).join('\n')}
- Proven ability to deliver production-quality code and maintain version control hygiene.

Preferred Qualifications:
${preferredSkills.map(s => `- Experience or familiarity with ${s} is a plus.`).join('\n')}
- Exposure to modern agile workflows and collaborative software engineering.

Technologies:
${technologies.join(', ')}`;

  return {
    role: roleTitle,
    department: profile.department,
    summary,
    responsibilities,
    requiredSkills,
    preferredSkills,
    technologies,
    jobDescriptionText
  };
}
