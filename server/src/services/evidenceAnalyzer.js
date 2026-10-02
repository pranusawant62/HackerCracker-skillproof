import { extractResumeText } from './pdfParser.js';
import { SKILL_TAXONOMY } from '../utils/skillTaxonomy.js';

/**
 * Detailed technical skill profiles defining direct observable patterns,
 * broader category patterns, and unrelated domain cues.
 */
export const SKILL_PROFILES = {
  'power bi': {
    name: 'Power BI',
    category: 'Data & Analytics',
    directTerms: ['power bi', 'microsoft power bi', 'power bi desktop', 'power bi service', 'dax', 'power query', '.pbix', 'pbix', 'pbi', 'power bi report', 'power bi dashboard', 'power bi workspace'],
    directRegex: /\b(power\s*bi|powerbi|pbix|\.pbix|dax|power\s*query)\b/i,
    technicalArtifacts: ['microsoft power bi', 'power bi desktop', 'dax', 'power query', 'm language', '.pbix', 'pbix', 'dashboard', 'report', 'data model', 'measures', 'calculated columns', 'power bi service', 'workspaces'],
    technicalArtifactsRegex: /\b(microsoft\s+power\s*bi|power\s*bi\s*desktop|dax|power\s*query|m\s*language|m\s*code|\.pbix|pbix|dashboards?|reports?|data\s*models?|measures?|calculated\s*columns?|workspaces?)\b/i,
    indirectTerms: ['business intelligence', 'dashboard development', 'data visualization', 'data analytics', 'data model', 'bi report'],
    indirectRegex: /\b(business\s*intelligence|data\s*visualization|data\s*analytics|dashboard\s*development)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'kanban', 'csm', 'pmp', 'product owner', 'safe', 'java', 'python', 'html', 'css', 'git', 'docker', 'react', 'angular', 'c++', 'kubernetes', 'aws', 'scrummaster']
  },
  'tableau': {
    name: 'Tableau',
    category: 'Data & Analytics',
    directTerms: ['tableau', 'twb', 'twbx'],
    directRegex: /\b(tableau|twbx?)\b/i,
    technicalArtifacts: ['tableau', 'twb', 'twbx', 'tableau server', 'calculated fields', 'parameters', 'data blending', 'tableau prep', 'dashboards', 'worksheets'],
    technicalArtifactsRegex: /\b(twbx?|tableau\s*server|calculated\s*fields?|parameters?|data\s*blending|tableau\s*prep|dashboards?|worksheets?)\b/i,
    indirectTerms: ['data visualization', 'dashboard', 'business intelligence'],
    indirectRegex: /\b(data\s*visualization|business\s*intelligence)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'kanban', 'csm', 'pmp', 'java', 'python', 'scrummaster']
  },
  'git': {
    name: 'Git',
    category: 'Tools',
    directTerms: ['git', 'git repository', 'git commit', 'git branch', 'git merge', 'git workflow', 'github repository', 'version control', 'commits', 'branches', 'pull request', 'merge conflict'],
    directRegex: /\b(git|github|gitlab|version\s*control|git\s*commits?|git\s*branch(?:es|ing)?|git\s*merge|pull\s*requests?)\b/i,
    technicalArtifacts: ['git commit', 'git branch', 'git merge', 'git rebase', 'git pull', 'git push', 'git repository', 'git workflow', 'commit history', 'pull request'],
    technicalArtifactsRegex: /\b(git\s*commits?|git\s*branch(?:es|ing)?|git\s*merge|git\s*rebase|git\s*pull|git\s*push|git\s*repository|pull\s*requests?|merge\s*conflicts?|\.gitignore)\b/i,
    indirectTerms: ['software engineering', 'devops', 'ci/cd', 'code repository'],
    indirectRegex: /\b(software\s*engineering|devops|ci\/cd|code\s*repository)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'kanban', 'csm', 'pmp', 'product owner', 'safe', 'sprint planning', 'scrummaster', 'power bi', 'tableau']
  },
  'github': {
    name: 'GitHub',
    category: 'Tools',
    directTerms: ['github', 'git', 'gh-pages', 'github actions'],
    directRegex: /\b(github|git|gh-actions|github\s*actions)\b/i,
    technicalArtifacts: ['github', 'github actions', 'gh-pages', 'pull requests', 'workflow yaml', '.github'],
    technicalArtifactsRegex: /\b(github\s*actions|gh-pages|pull\s*requests?|\.github|workflow|repository)\b/i,
    indirectTerms: ['version control', 'devops'],
    indirectRegex: /\b(version\s*control|devops)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'kanban', 'csm', 'pmp', 'scrummaster']
  },
  'java': {
    name: 'Java',
    category: 'Programming Languages',
    directTerms: ['java', 'java se', 'java ee', 'spring boot', 'springboot', 'spring framework', 'maven', 'pom.xml', 'gradle', 'jvm', 'jdk', 'j2ee', '.java'],
    // Ensure "java" does NOT match "javascript"
    directRegex: /(?:^|[^a-zA-Z0-9])(java(?![a-zA-Z0-9]|script)|java\s*se|java\s*ee|spring\s*boot|springboot|maven|pom\.xml|gradle|jvm|jdk|j2ee|\.java)(?:$|[^a-zA-Z0-9])/i,
    technicalArtifacts: ['java implementation', 'spring boot', 'maven', 'gradle', 'jvm', 'jdk', 'pom.xml', 'build.gradle', 'java classes', 'interfaces', 'packages', '.java'],
    technicalArtifactsRegex: /\b(spring\s*boot|springboot|maven|gradle|jvm|jdk|pom\.xml|build\.gradle|interfaces?|packages?|\.java|hibernate|jpa|multithreading|servlets?)\b/i,
    indirectTerms: ['object oriented programming', 'oop', 'software engineering', 'computer science', 'programming fundamentals', 'backend development', 'software development'],
    indirectRegex: /\b(object[\s-]oriented|oop|software\s*engineering|computer\s*science|programming\s*fundamentals|backend\s*development)\b/i,
    unrelatedDomains: ['python', 'power bi', 'scrum', 'agile', 'kanban', 'csm', 'pmp', 'html', 'css', 'tableau', 'ruby', 'scrummaster']
  },
  'python': {
    name: 'Python',
    category: 'Programming Languages',
    directTerms: ['python', 'python3', 'python2', '.py', 'py', 'requirements.txt', 'fastapi', 'flask', 'django', 'pandas', 'numpy', 'scipy', 'pytorch', 'tensorflow', 'pip', 'conda', 'poetry', 'pytest'],
    directRegex: /(?:^|[^a-zA-Z0-9])(python(?:3|2)?|requirements\.txt|fastapi|flask|django|pandas|numpy|pytorch|tensorflow|pytest|\.py)(?:$|[^a-zA-Z0-9])/i,
    technicalArtifacts: ['python implementation', 'functions', 'classes', 'fastapi', 'flask', 'django', 'pandas', 'numpy', 'scipy', 'pytorch', 'tensorflow', 'pytest', 'python source', '.py', 'requirements.txt', 'pyproject.toml'],
    technicalArtifactsRegex: /\b(fastapi|flask|django|pandas|numpy|scipy|pytorch|tensorflow|pytest|classes|functions?|requirements\.txt|pyproject\.toml|\.py|virtualenv|pip)\b/i,
    indirectTerms: ['data science', 'scripting', 'software engineering', 'machine learning', 'programming fundamentals'],
    indirectRegex: /\b(data\s*science|scripting|software\s*engineering|machine\s*learning|programming\s*fundamentals)\b/i,
    unrelatedDomains: ['java', 'scrum', 'agile', 'csm', 'pmp', 'power bi', 'tableau', 'html', 'css', 'scrummaster']
  },
  'fastapi': {
    name: 'FastAPI',
    category: 'Backend',
    directTerms: ['fastapi', 'uvicorn', 'pydantic', 'starlette', 'openapi', 'python backend'],
    directRegex: /\b(fastapi|uvicorn|pydantic|starlette|openapi)\b/i,
    technicalArtifacts: ['fastapi', 'uvicorn', 'pydantic', 'starlette', 'openapi', 'swagger', 'endpoints'],
    technicalArtifactsRegex: /\b(uvicorn|pydantic|starlette|openapi|swagger|endpoints?|api\s*routes?)\b/i,
    indirectTerms: ['python', 'rest api', 'backend development', 'microservices'],
    indirectRegex: /\b(python|rest\s*api|backend\s*development)\b/i,
    unrelatedDomains: ['power bi', 'scrum', 'agile', 'html', 'css', 'tableau', 'scrummaster']
  },
  'react': {
    name: 'React',
    category: 'Frontend',
    directTerms: ['react', 'reactjs', 'react.js', 'jsx', 'tsx', 'usestate', 'useeffect', 'redux', 'react router'],
    directRegex: /\b(react|reactjs|react\.js|jsx|tsx|usestate|useeffect|redux)\b/i,
    technicalArtifacts: ['react', 'jsx', 'tsx', 'usestate', 'useeffect', 'hooks', 'redux', 'components', 'react router'],
    technicalArtifactsRegex: /\b(jsx|tsx|usestate|useeffect|hooks?|redux|components?|react\s*router|virtual\s*dom)\b/i,
    indirectTerms: ['frontend development', 'web development', 'javascript', 'ui components', 'single page application'],
    indirectRegex: /\b(frontend\s*development|web\s*development|javascript|ui\s*components)\b/i,
    unrelatedDomains: ['power bi', 'scrum', 'agile', 'csm', 'pmp', 'tableau', 'flutter', 'scrummaster']
  },
  'docker': {
    name: 'Docker',
    category: 'DevOps',
    directTerms: ['docker', 'dockerfile', 'docker-compose', 'docker compose', 'containerization', 'containers', 'docker hub'],
    directRegex: /\b(docker|dockerfile|docker-compose|containerization)\b/i,
    technicalArtifacts: ['dockerfile', 'docker build', 'docker run', 'docker compose', 'container', 'image', 'registry', 'docker-compose.yml'],
    technicalArtifactsRegex: /\b(dockerfile|docker\s*build|docker\s*run|docker[\s-]compose|containers?|images?|registry|dockerhub|docker-compose\.yml)\b/i,
    indirectTerms: ['devops', 'cloud infrastructure', 'container management'],
    indirectRegex: /\b(devops|cloud\s*infrastructure)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'power bi', 'tableau', 'scrummaster']
  },
  'kubernetes': {
    name: 'Kubernetes',
    category: 'DevOps',
    directTerms: ['kubernetes', 'k8s', 'kubectl', 'helm', 'minikube', 'pods', 'ingress'],
    directRegex: /\b(kubernetes|k8s|kubectl|helm|minikube)\b/i,
    technicalArtifacts: ['kubernetes', 'k8s', 'kubectl', 'helm', 'minikube', 'pods', 'ingress', 'deployments', 'services', 'configmap'],
    technicalArtifactsRegex: /\b(k8s|kubectl|helm|minikube|pods?|ingress|deployments?|services?|configmap|cluster)\b/i,
    indirectTerms: ['container orchestration', 'cloud infrastructure', 'devops'],
    indirectRegex: /\b(container\s*orchestration|cloud\s*infrastructure|devops)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'power bi', 'tableau', 'scrummaster']
  },
  'postgresql': {
    name: 'PostgreSQL',
    category: 'Databases',
    directTerms: ['postgresql', 'postgres', 'psql', 'pg_dump', 'relational database'],
    directRegex: /\b(postgresql|postgres|psql|pg_dump)\b/i,
    technicalArtifacts: ['postgresql', 'create table', 'schema', 'indexes', 'postgresql queries', 'foreign keys', 'constraints', 'explain', 'pg_dump'],
    technicalArtifactsRegex: /\b(create\s+table|schemas?|indexes?|foreign\s+keys?|constraints?|explain|pg_dump|psql|queries)\b/i,
    indirectTerms: ['sql', 'database management', 'rdbms', 'relational database'],
    indirectRegex: /\b(sql|database\s*management|rdbms|relational\s*database)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'power bi', 'html', 'css', 'scrummaster']
  },
  'sql': {
    name: 'SQL',
    category: 'Databases',
    directTerms: ['sql', 'mysql', 'postgresql', 'sqlite', 'select', 'join', 'database schema', 'queries'],
    directRegex: /\b(sql|mysql|postgresql|sqlite|queries|querying|database\s*schema)\b/i,
    technicalArtifacts: ['select', 'insert', 'update', 'delete', 'create table', 'join', 'index', 'primary key', 'foreign key', 'schema', 'query', 'postgresql', 'mysql', 'sql server', 'normalization', 'stored procedure', 'transaction', 'explain', '.sql', 'ddl', 'dml'],
    technicalArtifactsRegex: /\b(select|insert|update|delete|create\s+table|join|index(?:es)?|primary\s+key|foreign\s+key|schemas?|queries|querying|postgresql|postgres|mysql|sql\s*server|normaliz(?:ation|ed)|stored\s+procedures?|transactions?|explain|\.sql|ddl|dml)\b/i,
    indirectTerms: ['data modeling', 'database management', 'rdbms'],
    indirectRegex: /\b(data\s*modeling|database\s*management|rdbms)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'kanban', 'csm', 'pmp', 'java', 'python', 'html', 'css', 'power bi', 'tableau', 'scrummaster']
  },
  'firebase': {
    name: 'Firebase',
    category: 'Databases',
    directTerms: ['firebase', 'firestore', 'firebase auth', 'cloud firestore', 'firebase realtime database', 'cloud functions', 'firebase hosting'],
    directRegex: /\b(firebase|firestore|firebase\s*auth|realtime\s*database)\b/i,
    technicalArtifacts: ['firebase authentication', 'firestore', 'realtime database', 'firebase storage', 'cloud functions', 'firebase sdk', 'security rules', 'firebase.json'],
    technicalArtifactsRegex: /\b(firestore|realtime\s*database|firebase\s*auth|firebase\s*storage|cloud\s*functions|security\s*rules|firebase\.json|nosql)\b/i,
    indirectTerms: ['nosql', 'cloud database', 'backend as a service', 'baas'],
    indirectRegex: /\b(nosql|cloud\s*database|baas)\b/i,
    unrelatedDomains: ['mysql', 'postgresql', 'postgres', 'oracle', 'sql server', 'sqlite', 'scrum', 'agile', 'kanban', 'csm', 'pmp', 'power bi', 'tableau', 'java', 'html', 'css', 'scrummaster']
  },
  'html': {
    name: 'HTML',
    category: 'Frontend',
    directTerms: ['html', 'html5', 'dom', 'markup', 'semantic html'],
    directRegex: /\b(html|html5)\b/i,
    technicalArtifacts: ['html5', 'semantic html', 'dom', 'markup', 'tags', 'elements', 'form validation', 'canvas', '.html'],
    technicalArtifactsRegex: /\b(html5|semantic\s*html|dom|markup|tags?|elements?|canvas|\.html)\b/i,
    indirectTerms: ['web design', 'web development', 'frontend'],
    indirectRegex: /\b(web\s*design|web\s*development|frontend)\b/i,
    unrelatedDomains: ['java', 'python', 'git', 'power bi', 'scrum', 'scrummaster']
  },
  'css': {
    name: 'CSS',
    category: 'Frontend',
    directTerms: ['css', 'css3', 'sass', 'scss', 'styling', 'flexbox', 'grid'],
    directRegex: /\b(css|css3|sass|scss|flexbox)\b/i,
    technicalArtifacts: ['css3', 'sass', 'scss', 'flexbox', 'grid', 'styling', 'responsive design', 'media queries', '.css'],
    technicalArtifactsRegex: /\b(css3|sass|scss|flexbox|grid|styling|responsive\s*design|media\s*queries|\.css)\b/i,
    indirectTerms: ['web design', 'web development', 'frontend styling'],
    indirectRegex: /\b(web\s*design|web\s*development|frontend)\b/i,
    unrelatedDomains: ['java', 'python', 'git', 'power bi', 'scrum', 'scrummaster']
  }
};

/**
 * Returns skill profile with regexes and aliases, dynamically falling back
 * to the taxonomy for unlisted skills.
 */
function resolveSkillProfile(cleanSkill) {
  const lower = cleanSkill.toLowerCase().trim();
  if (SKILL_PROFILES[lower]) {
    return SKILL_PROFILES[lower];
  }

  // Lookup in canonical SKILL_TAXONOMY
  const taxEntry = SKILL_TAXONOMY.find(e => e.name.toLowerCase() === lower);
  const aliases = taxEntry ? taxEntry.aliases : [cleanSkill];
  const escapedAliases = aliases.map(a => a.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&'));
  const directRegex = new RegExp(`(?:^|[^a-zA-Z0-9])(${escapedAliases.join('|')})(?:$|[^a-zA-Z0-9])`, 'i');

  return {
    name: cleanSkill,
    category: taxEntry?.category || 'General',
    directTerms: aliases,
    directRegex,
    technicalArtifacts: aliases,
    technicalArtifactsRegex: directRegex,
    indirectTerms: ['software engineering', 'computer science', 'programming', 'development'],
    indirectRegex: /\b(software\s*engineering|computer\s*science|programming|development)\b/i,
    unrelatedDomains: ['scrum', 'agile', 'kanban', 'csm', 'pmp', 'scrummaster']
  };
}

/**
 * Extracts and compares candidate name from document content against verified candidate identity.
 * 
 * @param {string} text - Extracted document text
 * @param {string} candidateName - Verified candidate name (e.g. "Swetha Konney")
 * @returns {{ match: boolean | null, extractedName: string | null }}
 */
function verifyCandidateNameInDocument(text = '', candidateName = '') {
  if (!text || typeof text !== 'string') return { match: null, extractedName: null };
  const cleanCand = (candidateName || '').trim();

  // Pattern for certificate recipient lines:
  // e.g. "Awarded to Pranav Sharma", "Certifies that Swetha Konney has...", "Presented to John Doe"
  const recipientRegex = /(?:awarded\s+to|presented\s+to|certifies\s+that|certify\s+that|this\s+is\s+to\s+certify\s+that|issued\s+to|granted\s+to|conferred\s+upon|completed\s+by|recipient:?|student:?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)+)/i;
  const match = text.match(recipientRegex);

  if (match && match[1]) {
    const extractedName = match[1].trim();

    if (cleanCand) {
      const candTokens = cleanCand.toLowerCase().split(/\s+/).filter(Boolean);
      const extLower = extractedName.toLowerCase();
      // Name matches if all parts of candidate name are present or first/last match
      const isMatch = candTokens.every(t => extLower.includes(t)) || 
                      (candTokens.length >= 2 && extLower.includes(candTokens[0]) && extLower.includes(candTokens[candTokens.length - 1]));

      return {
        match: isMatch,
        extractedName
      };
    }

    return { match: null, extractedName };
  }

  // If candidate name is explicitly present in text
  if (cleanCand) {
    const candTokens = cleanCand.toLowerCase().split(/\s+/).filter(Boolean);
    const textLower = text.toLowerCase();
    if (candTokens.every(t => textLower.includes(t))) {
      return { match: true, extractedName: cleanCand };
    }
  }

  return { match: null, extractedName: null };
}

/**
 * Analyzes candidate-submitted evidence for a specific skill with strict validation:
 * - Direct evidence specifically demonstrates the target skill.
 * - Partial evidence is related to domain but lacks specific practical proof.
 * - Unrelated evidence belongs to another domain and remains UNVERIFIED.
 * - Invalid evidence is empty, unreadable, or possesses identity mismatch.
 * 
 * Filename alone is NEVER trusted to prove a skill.
 * Actual document content is authoritative.
 * 
 * @param {object} params
 * @param {string} params.skill - Target skill being substantiated (e.g. "Power BI", "Git", "Java")
 * @param {string} [params.evidenceType] - Evidence type ('certificate', 'github_repo', 'project_url', 'file', etc.)
 * @param {string} [params.url] - Submitted URL (project, repo, demo, portfolio)
 * @param {string} [params.title] - Evidence title/label
 * @param {string} [params.notes] - Candidate description or technical explanation
 * @param {Buffer} [params.fileBuffer] - File buffer if a document was uploaded
 * @param {string} [params.filename] - Original filename if uploaded
 * @param {string} [params.mimetype] - MIME type of uploaded file
 * @param {string} [params.candidateName] - Verified candidate name (e.g. "Swetha Konney")
 * @returns {Promise<{ status: "proven" | "partially_proven" | "unverified", evidenceItem: object, explanation: string }>}
 */
export async function analyzeSkillEvidence({
  skill,
  evidenceType = 'project_url',
  url = '',
  title = '',
  notes = '',
  fileBuffer = null,
  filename = '',
  mimetype = '',
  candidateName = ''
} = {}) {
  const cleanSkill = (skill || '').trim();
  if (!cleanSkill) {
    throw new Error('Skill name is required for evidence analysis.');
  }

  const profile = resolveSkillProfile(cleanSkill);
  const cleanUrl = (url || '').trim();
  const cleanTitle = (title || '').trim();
  const cleanNotes = (notes || '').trim();
  const cleanFilename = (filename || '').trim();

  let fileText = '';
  let isFileEmpty = false;
  let isFileUnreadable = false;

  // 1. Extract text from uploaded document (Authoritative Source)
  if (fileBuffer) {
    if (fileBuffer.length === 0) {
      isFileEmpty = true;
    } else {
      if (mimetype === 'application/pdf' || cleanFilename.toLowerCase().endsWith('.pdf')) {
        try {
          const parsed = await extractResumeText(fileBuffer);
          fileText = (parsed.text || '').trim();
          if (fileText.length === 0) {
            isFileEmpty = true;
          }
        } catch {
          // If PDF parsing fails, check if plain text buffer has content
          const raw = fileBuffer.toString('utf8').trim();
          if (raw.length === 0) {
            isFileUnreadable = true;
          } else {
            fileText = raw;
          }
        }
      } else {
        fileText = fileBuffer.toString('utf8').trim();
        if (fileText.length === 0) {
          isFileEmpty = true;
        }
      }
    }
  }

  // Handle empty or unreadable uploaded document (RULE 3 & RULE 13)
  if (fileBuffer && (isFileEmpty || isFileUnreadable)) {
    const explanation = isFileEmpty
      ? 'Evidence document is empty (0 readable characters). Uploaded files must contain verifiable technical content.'
      : 'Evidence document is corrupted or unreadable. Evidence could not be reliably analyzed.';

    const evidenceItem = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: evidenceType,
      title: cleanTitle || `${cleanSkill} Evidence (${cleanFilename || 'document'})`,
      filename: cleanFilename || null,
      url: cleanUrl || null,
      targetSkill: cleanSkill,
      evidenceRelevance: 'invalid', // STRICT CLASSIFICATION: INVALID
      verificationStatus: 'unverified',
      candidateIdentityMatch: null,
      skillMatch: false,
      confidence: 'none',
      confidenceScore: 0,
      explanation,
      details: explanation,
      observableArtifacts: ['Document contains no readable text or is empty'],
      artifacts: ['Document contains no readable text or is empty'],
      detectedKeywords: [],
      submittedByCandidate: true,
      submittedAt: new Date().toISOString(),
      verified: false
    };

    return {
      status: 'unverified',
      evidenceItem,
      explanation
    };
  }

  // 2. Determine Search Scope:
  // RULE 4: FILENAME MUST NOT BE TRUSTED AS EVIDENCE.
  // When a file is uploaded, the content of the document is authoritative.
  let primaryContent = '';
  if (fileBuffer && fileText) {
    // Search the actual document text only. Do NOT include filename or title.
    primaryContent = fileText;
  } else {
    // When no file was uploaded, inspect candidate technical notes and non-default title.
    // Filter out generic auto-generated titles like "${skill} Evidence (...)"
    const isAutoTitle = new RegExp(`^${cleanSkill.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')}\\s+Evidence\\s*\\(`, 'i').test(cleanTitle);
    const meaningfulTitle = isAutoTitle ? '' : cleanTitle;
    primaryContent = [meaningfulTitle, cleanNotes].filter(Boolean).join(' ');
  }

  const contentLower = primaryContent.toLowerCase();

  // 3. Candidate Name Verification (RULE 6)
  let candidateIdentityMatch = null;
  const textForIdentity = fileText || primaryContent;
  if (textForIdentity && candidateName) {
    const nameCheck = verifyCandidateNameInDocument(textForIdentity, candidateName);
    candidateIdentityMatch = nameCheck.match;

    // Flag identity mismatch if another person's name is detected as recipient
    if (nameCheck.match === false && nameCheck.extractedName) {
      const explanation = `Evidence identity does not match the verified candidate (Issued to "${nameCheck.extractedName}" vs Verified Candidate "${candidateName}"). Document cannot be used to prove candidate skills.`;

      const evidenceItem = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: evidenceType,
        title: cleanTitle || `${cleanSkill} Evidence`,
        filename: cleanFilename || null,
        url: cleanUrl || null,
        targetSkill: cleanSkill,
        evidenceRelevance: 'invalid', // STRICT CLASSIFICATION: INVALID DUE TO MISMATCH
        verificationStatus: 'unverified',
        candidateIdentityMatch: false,
        skillMatch: false,
        confidence: 'none',
        confidenceScore: 0,
        explanation,
        details: explanation,
        observableArtifacts: [
          `Identity mismatch detected: Document recipient "${nameCheck.extractedName}" does not match candidate "${candidateName}"`
        ],
        artifacts: [
          `Identity mismatch detected: Document recipient "${nameCheck.extractedName}" does not match candidate "${candidateName}"`
        ],
        detectedKeywords: [],
        submittedByCandidate: true,
        submittedAt: new Date().toISOString(),
        verified: false
      };

      return {
        status: 'unverified',
        evidenceItem,
        explanation
      };
    }
  }

  // 4. Inspect for Direct Skill Matches
  const directMatches = [];
  if (profile.directRegex.test(primaryContent)) {
    profile.directTerms.forEach(term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&');
      const reg = new RegExp(`(?:^|[^a-zA-Z0-9])(${escaped})(?:$|[^a-zA-Z0-9])`, 'i');
      if (reg.test(primaryContent)) {
        directMatches.push(term);
      }
    });
  }

  // Special case for Git with GitHub repositories:
  // A GitHub repository demonstrates Git usage unless it is explicitly unrelated
  const isGithubRepoLink = cleanUrl.toLowerCase().includes('github.com') || evidenceType === 'github_repo';
  if (profile.name.toLowerCase() === 'git' && isGithubRepoLink) {
    if (!directMatches.includes('git repository')) {
      directMatches.push('git repository');
    }
  }

  // 5. Inspect for Unrelated Domain Indicators (RULE 7)
  const unrelatedHits = [];
  if (profile.unrelatedDomains) {
    profile.unrelatedDomains.forEach(domain => {
      const escaped = domain.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&');
      const reg = new RegExp(`(?:^|[^a-zA-Z0-9])(${escaped})(?:$|[^a-zA-Z0-9])`, 'i');
      if (reg.test(primaryContent)) {
        unrelatedHits.push(domain);
      }
    });
  }

  // 6. Inspect for Indirect / Partial Matches
  const indirectMatches = [];
  if (profile.indirectRegex && profile.indirectRegex.test(primaryContent)) {
    profile.indirectTerms.forEach(term => {
      if (contentLower.includes(term.toLowerCase())) {
        indirectMatches.push(term);
      }
    });
  }

  // 7. Inspect for Concrete Skill-Specific Technical Artifacts
  const matchedArtifacts = [];
  if (profile.technicalArtifactsRegex && profile.technicalArtifactsRegex.test(primaryContent)) {
    (profile.technicalArtifacts || []).forEach(art => {
      const escaped = art.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&');
      const reg = new RegExp(`(?:^|[^a-zA-Z0-9])(${escaped})(?:$|[^a-zA-Z0-9])`, 'i');
      if (reg.test(primaryContent)) {
        matchedArtifacts.push(art);
      }
    });
  }

  // 8. Inspect for Implementation Context (Action verbs / technical syntax)
  const ACTION_VERBS_REGEX = /\b(built|build|building|designed|design|designing|developed|develop|developing|implemented|implement|implementing|created|create|creating|optimized|optimize|optimizing|engineered|engineering|architected|architecting|deployed|deploying|integrated|integrating|configured|configuring|automated|automating|maintained|maintaining|refactored|analyzed|analyzing|modeled|modeling|model|queried|querying|interactive)\b/i;
  const CODE_SYNTAX_REGEX = /(?:create\s+table|select\s+.*\s+from|insert\s+into|update\s+.*\s+set|delete\s+from|from\s+.*\s+join|def\s+[a-z_]|class\s+[A-Z]|import\s+[\w.]+|package\s+[\w.]+|public\s+class|@[\w]+|dockerfile|package\.json|requirements\.txt|\.sql|\.py|\.java|\.pbix)/i;
  const hasImplementationContext = ACTION_VERBS_REGEX.test(primaryContent) || CODE_SYNTAX_REGEX.test(primaryContent);

  // 9. Inspect for Certificate Credential Context
  const isCertificate = evidenceType === 'certificate' || /(?:certified|certificate|certifies\s+that|credential|awarded\s+to|presented\s+to|license|associate|professional|specialist|completion\s+of|diploma|exam)/i.test(primaryContent);

  // 10. Strict Classification Logic (DIRECT | PARTIAL | UNRELATED | INVALID)
  let evidenceRelevance = 'unrelated';
  let verificationStatus = 'unverified';
  let skillMatch = false;
  let confidence = 'none';
  let confidenceScore = 0;
  let explanation = '';
  const observableArtifacts = [];

  const hasDirect = directMatches.length > 0;
  const hasIndirect = indirectMatches.length > 0;
  const hasUnrelated = unrelatedHits.length > 0;

  // RULE 4 & RULE 8: If content identifies an unrelated technology/domain and lacks target skill
  if (hasUnrelated && !hasDirect) {
    evidenceRelevance = 'unrelated';
    verificationStatus = 'unverified';
    skillMatch = false;
    confidence = 'none';
    confidenceScore = 0;
    const domainLabel = unrelatedHits.map(u => u.toUpperCase()).join(' / ');
    explanation = `The uploaded ${isCertificate ? 'certificate' : 'evidence'} is for ${domainLabel} and does not substantiate ${cleanSkill}.`;
    observableArtifacts.push(`Identified unrelated technology/domain: ${unrelatedHits.join(', ')}`);
    observableArtifacts.push(`No observable ${cleanSkill} artifacts found in content`);
  }
  // RULE: Certificate Verification
  else if (isCertificate && hasDirect) {
    evidenceRelevance = 'direct';
    verificationStatus = 'proven';
    skillMatch = true;
    confidence = 'high';

    const idPts = candidateIdentityMatch === true ? 30 : 25;
    const skillPts = 35;
    const artPts = (matchedArtifacts.length >= 2 || directMatches.length >= 2) ? 25 : 20;
    const srcPts = 10;
    confidenceScore = Math.min(98, idPts + skillPts + artPts + srcPts);

    explanation = `Certificate specifically identifies ${cleanSkill}. Verified credential directly demonstrates competence in ${cleanSkill}.`;
    observableArtifacts.push(`Verified certificate credential specifically identifying ${cleanSkill}`);
    if (cleanTitle) observableArtifacts.push(`Certificate title: "${cleanTitle}"`);
    observableArtifacts.push(`Direct credential matches: ${directMatches.join(', ')}`);
    if (matchedArtifacts.length > 0) {
      observableArtifacts.push(`Technical artifacts: ${matchedArtifacts.join(', ')}`);
    }
  }
  // RULE: Direct Technical Implementation Verification (Non-Certificate)
  else if (hasDirect && hasImplementationContext && (matchedArtifacts.length > 0 || isGithubRepoLink)) {
    evidenceRelevance = 'direct';
    verificationStatus = 'proven';
    skillMatch = true;
    confidence = 'high';

    const idPts = candidateIdentityMatch === true ? 30 : 25;
    const skillPts = 35;
    const artPts = (matchedArtifacts.length >= 2 || directMatches.length >= 2) ? 25 : 20;
    const srcPts = (fileBuffer || evidenceType === 'github_repo') ? 10 : 9;
    confidenceScore = Math.min(98, idPts + skillPts + artPts + srcPts);

    explanation = `Observable ${cleanSkill} artifacts and technical implementation verified via candidate-submitted ${evidenceType.replace('_', ' ')}.`;
    observableArtifacts.push(`Verified observable ${cleanSkill} technical artifacts`);
    if (cleanUrl) observableArtifacts.push(`Project/Repo reference: ${cleanUrl}`);
    observableArtifacts.push(`Artifact evidence: ${matchedArtifacts.length > 0 ? matchedArtifacts.join(', ') : directMatches.join(', ')}`);
  }
  // RULE: Partial Evidence (Familiarity or partial artifacts, but insufficient proof)
  else if ((hasDirect || hasIndirect) && (matchedArtifacts.length > 0 || hasImplementationContext || hasIndirect)) {
    evidenceRelevance = 'partial';
    verificationStatus = 'partially_proven';
    skillMatch = true;
    confidence = 'medium';

    const idPts = candidateIdentityMatch === true ? 20 : 15;
    const skillPts = 18;
    const artPts = 10;
    const srcPts = 5;
    confidenceScore = idPts + skillPts + artPts + srcPts;

    explanation = `Evidence indicates familiarity with ${cleanSkill}, but lacks sufficient concrete technical artifacts (e.g. schemas, queries, measures, or code) or implementation depth to prove practical proficiency.`;
    observableArtifacts.push(`Partial domain familiarity detected for ${cleanSkill}`);
    if (indirectMatches.length > 0) {
      observableArtifacts.push(`Broader domain match: ${indirectMatches.join(', ')}`);
    }
  }
  // No observable technical artifacts or implementation context found (e.g. bare skill name claim)
  else {
    evidenceRelevance = 'unrelated';
    verificationStatus = 'unverified';
    skillMatch = false;
    confidence = 'none';
    confidenceScore = 0;
    explanation = `Submitted evidence does not substantiate ${cleanSkill}. A skill claim or keyword alone without observable technical artifacts or implementation context cannot prove proficiency.`;
    observableArtifacts.push(`No observable ${cleanSkill} artifacts or implementation context found in submitted evidence`);
  }

  // 8. Construct Final Structured Evidence Item
  const evidenceItem = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: evidenceType,
    title: cleanTitle || `${cleanSkill} Evidence (${evidenceType.replace('_', ' ')})`,
    url: cleanUrl || null,
    filename: cleanFilename || null,
    targetSkill: cleanSkill,
    evidenceRelevance, // "direct" | "partial" | "unrelated" | "invalid"
    verificationStatus, // "proven" | "partially_proven" | "unverified"
    candidateIdentityMatch, // true | false | null
    skillMatch, // true | false
    confidence, // "high" | "medium" | "low" | "none"
    confidenceScore, // 0-100 numeric score
    explanation,
    details: explanation,
    observableArtifacts,
    artifacts: observableArtifacts,
    detectedKeywords: directMatches,
    submittedByCandidate: true,
    submittedAt: new Date().toISOString(),
    verified: verificationStatus === 'proven'
  };

  return {
    status: verificationStatus,
    evidenceItem,
    explanation
  };
}

/**
 * Extracts observable project/experience evidence for a claimed skill from resume text.
 * Strictly adheres to the RESUME EVIDENCE RULE:
 * A skill can become PROVEN from the resume only when the resume contains BOTH:
 * A. Skill-specific technical evidence (concrete technical artifacts)
 * AND
 * B. A meaningful implementation/project/experience context (action verbs)
 * 
 * Plain skill-list mentions (e.g. "Skills: SQL, Power BI, Python") or lone skill mentions
 * are merely CLAIMS and will NEVER prove a skill.
 * 
 * @param {string} resumeText 
 * @param {string} skillName 
 * @param {string} candidateName 
 * @returns {Promise<object|null>} Analysis result or null if no observable context
 */
export async function extractResumeEvidenceForSkill(resumeText = '', skillName = '', candidateName = '') {
  if (!resumeText || !skillName) return null;

  const cleanSkill = skillName.trim();
  const lowerSkill = cleanSkill.toLowerCase();
  const profile = resolveSkillProfile(cleanSkill);

  const lines = resumeText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  // 1. Filter out lines in Skills sections or pure skill-claim lists
  const skillsHeaderRegex = /^(?:technical\s+skills?|skills?(?:\s+(?:&\s+tools|and\s+tools|inventory|summary))?|core\s+competencies|technologies|tools|languages(?:\s+and\s+frameworks)?|proficiencies|areas\s+of\s+expertise)[\s:]*$/i;
  const nonSkillsHeaderRegex = /^(?:experience|work\s+experience|professional\s+experience|employment(?:\s+history)?|projects|personal\s+projects|academic\s+projects|portfolio|education|certifications?|awards?|summary|profile|about\s+me)[\s:]*$/i;

  // Implementation / project action verbs
  const strongActionVerbRegex = /\b(built|designed|developed|implemented|engineered|architected|created|optimized|constructed|refactored|migrated|modeled|automated|integrated|authored|configured|deployed|queried|administered)\b/i;
  const anyActionVerbRegex = /\b(built|designed|developed|implemented|engineered|architected|created|optimized|constructed|refactored|migrated|modeled|automated|integrated|authored|configured|deployed|queried|administered|worked|used|maintained|managed|spearheaded|programmed|tested|debugged|executed|delivered|established)\b/i;

  // Skill-specific concrete implementation artifacts
  const SKILL_ARTIFACT_PATTERNS = {
    'sql': /\b(schema|schemas|queries|querying|indexing|indexes|stored\s+procedures?|joins?|normalization|normalized|views?|triggers?|migrations?|postgresql|postgres|mysql|sqlite|relational\s+database|foreign\s+keys?|ddl|dml)\b/i,
    'power bi': /\b(dax|power\s*query|dashboards?|pbix|\.pbix|reports?|visualizations?|m\s*code|data\s*models?|workspaces?|kpi)\b/i,
    'python': /\b(fastapi|flask|django|pandas|numpy|scipy|pytorch|tensorflow|pytest|scripting|backend|rest\s*api|apis?|asyncio|pip|requirements\.txt|automation)\b/i,
    'java': /\b(spring\s*boot|springboot|spring|maven|pom\.xml|gradle|hibernate|jpa|microservices|jvm|jdk|multithreading|servlets?)\b/i,
    'firebase': /\b(firestore|cloud\s*functions|realtime\s*database|firebase\s*auth|hosting|nosql|collections?)\b/i,
    'react': /\b(components?|hooks?|usestate|useeffect|redux|jsx|tsx|router|state\s*management|frontend)\b/i,
    'docker': /\b(dockerfile|docker-compose|containers?|images?|containerization|volumes?)\b/i,
    'kubernetes': /\b(kubectl|helm|pods?|ingress|deployments?|cluster|yaml|manifests?)\b/i,
    'postgresql': /\b(psql|queries|schema|pg_dump|indexing|indexes|stored\s+procedures?|relational)\b/i,
    'fastapi': /\b(uvicorn|pydantic|starlette|openapi|swagger|endpoints?|backend)\b/i,
    'git': /\b(commits?|branches?|pull\s*requests?|merge|repository|repositories|rebase|version\s*control)\b/i
  };

  const artifactRegex = SKILL_ARTIFACT_PATTERNS[lowerSkill] || profile.indirectRegex;

  let inSkillsSection = false;
  const relevantDirectLines = [];
  const relevantPartialLines = [];

  for (const line of lines) {
    if (skillsHeaderRegex.test(line)) {
      inSkillsSection = true;
      continue;
    }
    if (nonSkillsHeaderRegex.test(line)) {
      inSkillsSection = false;
      continue;
    }

    // Skip all lines while inside the Skills section (mere claims)
    if (inSkillsSection) {
      continue;
    }

    // Skip pure skill claim lines outside section (e.g. "Skills: SQL, Python" or comma-delimited lists without verbs)
    if (/^(?:technical\s+skills?|skills?|technologies|tools|languages)[\s:]/i.test(line)) {
      continue;
    }

    const delimiters = (line.match(/[,|•·/]/g) || []).length;
    const hasAnyVerb = anyActionVerbRegex.test(line);
    if (delimiters >= 2 && !hasAnyVerb) {
      continue;
    }

    // Must be a descriptive sentence/statement (at least 4 words and at least 15 chars)
    const wordCount = line.split(/\s+/).filter(Boolean).length;
    if (wordCount < 4 || line.length < 15) {
      continue;
    }

    // Must have an action verb
    if (!hasAnyVerb) {
      continue;
    }

    // Check if line matches the skill
    const matchesSkill = profile.directRegex ? profile.directRegex.test(line) : false;
    const matchesIndirect = profile.indirectRegex ? profile.indirectRegex.test(line) : false;

    if (!matchesSkill && !matchesIndirect) {
      continue;
    }

    // Check for technical artifacts
    const hasArtifact = artifactRegex ? artifactRegex.test(line) : false;
    const hasStrongVerb = strongActionVerbRegex.test(line);

    // Rule: PROVEN requires BOTH skill-specific technical artifacts AND strong implementation context
    if (matchesSkill && hasStrongVerb && hasArtifact) {
      relevantDirectLines.push(line);
    } else if (matchesSkill || (matchesIndirect && hasArtifact)) {
      relevantPartialLines.push(line);
    }
  }

  // If no descriptive project/experience lines contain evidence for this skill
  if (relevantDirectLines.length === 0 && relevantPartialLines.length === 0) {
    return null;
  }

  const isDirect = relevantDirectLines.length > 0;
  const chosenLines = isDirect ? relevantDirectLines : relevantPartialLines;
  const bestLine = chosenLines[0].replace(/^[-*•·]\s*/, '').trim();
  const combinedContext = chosenLines.join('. ');

  const verificationStatus = isDirect ? 'proven' : 'partially_proven';
  const evidenceRelevance = isDirect ? 'direct' : 'partial';
  const confidence = isDirect ? 'high' : 'medium';
  const confidenceScore = isDirect ? 94 : 52;
  const explanation = isDirect
    ? `Observable ${cleanSkill} technical implementation substantiated by resume project/experience context: "${bestLine}".`
    : `Resume mentions ${cleanSkill} in experience context ("${bestLine}"), but lacks specific observable technical implementation artifacts.`;

  const observableArtifacts = [
    `Resume Statement: "${bestLine}"`
  ];
  if (isDirect) {
    observableArtifacts.push(`Observable ${cleanSkill} project implementation substantiated`);
  } else {
    observableArtifacts.push(`General implementation context detected for ${cleanSkill}`);
  }

  const evidenceItem = {
    id: `ev_res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'resume',
    title: `Resume Observable Evidence: ${cleanSkill}`,
    url: null,
    filename: null,
    targetSkill: cleanSkill,
    evidenceRelevance,
    verificationStatus,
    candidateIdentityMatch: true,
    skillMatch: true,
    confidence,
    confidenceScore,
    explanation,
    details: explanation,
    observableArtifacts,
    artifacts: observableArtifacts,
    detectedKeywords: [cleanSkill],
    submittedByCandidate: false,
    submittedAt: new Date().toISOString(),
    verified: verificationStatus === 'proven'
  };

  return {
    status: verificationStatus,
    evidenceItem,
    explanation,
    context: combinedContext
  };
}


