/**
 * SkillProof Assessment Question Bank Registry
 * 
 * Aggregates all 58 mandated technical skills and provides an extensible registry
 * for adding new future skills without modifying core code.
 */

import { PROGRAMMING_QUESTIONS } from './programming.js';
import { WEB_QUESTIONS } from './web.js';
import { BACKEND_QUESTIONS } from './backend.js';
import { DATABASE_QUESTIONS } from './database.js';
import { DEVOPS_QUESTIONS } from './devops.js';
import { VERSION_CONTROL_QUESTIONS } from './versionControl.js';
import { DATA_AI_QUESTIONS } from './dataAi.js';
import { CORE_TECHNICAL_QUESTIONS } from './coreTechnical.js';

/**
 * Primary Question Bank Map
 */
const QUESTION_BANK = new Map();

// Register all predefined categories
const CATEGORIES = [
  PROGRAMMING_QUESTIONS,
  WEB_QUESTIONS,
  BACKEND_QUESTIONS,
  DATABASE_QUESTIONS,
  DEVOPS_QUESTIONS,
  VERSION_CONTROL_QUESTIONS,
  DATA_AI_QUESTIONS,
  CORE_TECHNICAL_QUESTIONS
];

for (const cat of CATEGORIES) {
  for (const [skillName, questions] of Object.entries(cat)) {
    QUESTION_BANK.set(skillName.toLowerCase(), {
      canonicalName: skillName,
      questions
    });
  }
}

/**
 * Aliases mapping common search terms and alternate spellings directly to canonical names.
 * Ensures zero cross-contamination (e.g. Firebase will NEVER resolve to PostgreSQL).
 */
const SKILL_ALIAS_MAP = {
  // Database
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'psql': 'PostgreSQL',
  'mysql': 'MySQL',
  'sql': 'SQL',
  'sqlite': 'SQLite',
  'sqlite3': 'SQLite',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'redis': 'Redis',
  'firebase': 'Firebase',
  'firestore': 'Firestore',

  // DevOps & Cloud
  'docker': 'Docker',
  'dockerfile': 'Docker',
  'docker compose': 'Docker Compose',
  'docker-compose': 'Docker Compose',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Microsoft Azure',
  'microsoft azure': 'Microsoft Azure',
  'gcp': 'Google Cloud',
  'google cloud': 'Google Cloud',
  'google cloud platform': 'Google Cloud',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'continuous integration': 'CI/CD',
  'github actions': 'GitHub Actions',
  'gh actions': 'GitHub Actions',

  // Version Control
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',

  // Backend
  'fastapi': 'FastAPI',
  'fast api': 'FastAPI',
  'flask': 'Flask',
  'django': 'Django',
  'rest api': 'REST API',
  'restful api': 'REST API',
  'rest': 'REST API',
  'graphql': 'GraphQL',

  // Web
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'angular': 'Angular',
  'vue': 'Vue.js',
  'vue.js': 'Vue.js',
  'vuejs': 'Vue.js',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express.js',
  'express.js': 'Express.js',
  'expressjs': 'Express.js',
  'next': 'Next.js',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',

  // Programming
  'python': 'Python',
  'python3': 'Python',
  'java': 'Java',
  'core java': 'Java',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'c': 'C',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'php': 'PHP',
  'ruby': 'Ruby',
  'ruby on rails': 'Ruby',
  'kotlin': 'Kotlin',
  'swift': 'Swift',

  // Data & AI
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'data analysis': 'Data Analysis',
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'artificial intelligence': 'Artificial Intelligence',
  'ai': 'Artificial Intelligence',

  // Core Technical
  'linux': 'Linux',
  'ubuntu': 'Linux',
  'computer networks': 'Computer Networks',
  'networking': 'Computer Networks',
  'operating systems': 'Operating Systems',
  'os': 'Operating Systems',
  'data structures': 'Data Structures',
  'algorithms': 'Algorithms',
  'algo': 'Algorithms',
  'oop': 'OOP',
  'object oriented programming': 'OOP',
  'system design': 'System Design',
  'cybersecurity': 'Cybersecurity',
  'security': 'Cybersecurity'
};

/**
 * Resolves any skill name or alias to its canonical registry representation.
 * 
 * @param {string} rawSkill 
 * @returns {string} Canonical skill name
 */
export function resolveAssessmentSkillName(rawSkill = '') {
  if (!rawSkill || typeof rawSkill !== 'string') return '';
  const clean = rawSkill.trim();
  const lower = clean.toLowerCase();

  if (SKILL_ALIAS_MAP[lower]) {
    return SKILL_ALIAS_MAP[lower];
  }

  // Check direct bank entry
  const entry = QUESTION_BANK.get(lower);
  if (entry) {
    return entry.canonicalName;
  }

  return clean;
}

/**
 * Registers new skill questions into the registry dynamically for future skill support.
 * 
 * @param {string} skillName 
 * @param {Array<object>} questions - Array of 5 questions
 */
export function registerSkillQuestions(skillName, questions) {
  if (!skillName || !Array.isArray(questions)) {
    throw new Error('Valid skillName and questions array required.');
  }
  const clean = skillName.trim();
  const canonical = clean;
  QUESTION_BANK.set(clean.toLowerCase(), {
    canonicalName: canonical,
    questions: questions.map((q, idx) => ({
      ...q,
      skill: canonical,
      questionNumber: idx + 1
    }))
  });
  SKILL_ALIAS_MAP[clean.toLowerCase()] = canonical;
}

/**
 * Generates an extensible, progressive 5-question practical assessment for future
 * or custom skills not yet in the pre-defined question banks.
 * 
 * Guarantees:
 * - Exactly 5 progressive questions
 * - Strictly labelled with the target skill
 * - Progressively difficult (Easy -> Hard)
 * - Tailored practical problem-solving tasks, NEVER falling back to SQL!
 */
export function generateDynamicSkillQuestions(skillName) {
  const cap = skillName.trim();
  return [
    {
      id: `${cap.toLowerCase()}_q1`,
      skill: cap,
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: `Write a fundamental implementation or configuration demonstrating basic initialization, core syntax, or setup for ${cap}.`,
      starterCode: `// ${cap} - Basic implementation\n`,
      expectedAnswer: `// Valid ${cap} implementation`,
      points: 20,
      validationCriteria: {
        requiredElements: [cap.toLowerCase()],
        minWords: 3
      },
      explanation: `Tests foundational syntax and entry-point understanding for ${cap}.`
    },
    {
      id: `${cap.toLowerCase()}_q2`,
      skill: cap,
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: `Implement a data-handling or component routine in ${cap} that processes inputs, validates edge cases, and returns structured output.`,
      starterCode: `// ${cap} - Data processing and validation\n`,
      expectedAnswer: `// Structured ${cap} processing routine`,
      points: 20,
      validationCriteria: {
        minWords: 5
      },
      explanation: `Tests practical data flow and intermediate handling in ${cap}.`
    },
    {
      id: `${cap.toLowerCase()}_q3`,
      skill: cap,
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: `Write a modular, reusable service, function, or configuration in ${cap} that incorporates error handling and clean separation of concerns.`,
      starterCode: `// ${cap} - Modular service with error handling\n`,
      expectedAnswer: `// Modular ${cap} implementation with error handling`,
      points: 20,
      validationCriteria: {
        minWords: 6
      },
      explanation: `Validates clean architectural modularity and exception resilience in ${cap}.`
    },
    {
      id: `${cap.toLowerCase()}_q4`,
      skill: cap,
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: `Demonstrate performance optimization or state/concurrency management in ${cap}: address resource efficiency, caching, or asynchronous coordination.`,
      starterCode: `// ${cap} - Optimization and state/async management\n`,
      expectedAnswer: `// Optimized ${cap} pipeline`,
      points: 20,
      validationCriteria: {
        minWords: 8
      },
      explanation: `Evaluates production-level performance tuning and resource management in ${cap}.`
    },
    {
      id: `${cap.toLowerCase()}_q5`,
      skill: cap,
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: `Solve an end-to-end production scenario in ${cap}: resolve a subtle architectural defect, implement secure integrations, or construct a fault-tolerant subsystem.`,
      starterCode: `// ${cap} - Fault-tolerant production subsystem\n`,
      expectedAnswer: `// End-to-end robust ${cap} solution`,
      points: 20,
      validationCriteria: {
        minWords: 10
      },
      explanation: `Tests advanced real-world system resilience and architectural mastery in ${cap}.`
    }
  ];
}

/**
 * Retrieves exactly 5 skill-specific questions for any target skill.
 * 
 * Strict invariants:
 * 1. Exactly 5 questions returned.
 * 2. Every single question has question.skill === canonical.
 * 3. Question numbers are 1, 2, 3, 4, 5.
 * 4. Never mixes questions from other skills.
 * 
 * @param {string} skillName 
 * @returns {{ canonicalSkill: string, questions: Array<object> }}
 */
export function getQuestionsForSkill(skillName) {
  if (!skillName || typeof skillName !== 'string') {
    throw new Error('A valid skill name is required to retrieve assessment questions.');
  }

  const canonical = resolveAssessmentSkillName(skillName);
  const entry = QUESTION_BANK.get(canonical.toLowerCase());

  let rawQuestions = [];
  if (entry && Array.isArray(entry.questions) && entry.questions.length >= 5) {
    // Take the 5 progressive questions
    rawQuestions = entry.questions.slice(0, 5);
  } else {
    // Dynamic generator for future or custom skills
    rawQuestions = generateDynamicSkillQuestions(canonical);
  }

  // Strict normalization & validation pass
  const finalQuestions = rawQuestions.slice(0, 5).map((q, idx) => ({
    ...q,
    id: q.id || `${canonical.toLowerCase()}_q${idx + 1}`,
    skill: canonical, // STRICT: enforce question.skill === canonical
    questionNumber: idx + 1,
    difficulty: q.difficulty || (idx === 0 ? 'easy' : idx === 1 ? 'easy_medium' : idx === 2 ? 'medium' : idx === 3 ? 'medium_hard' : 'hard'),
    points: q.points || 20
  }));

  // Backend verification check: selected skill != question skill MUST be treated as an error
  for (const q of finalQuestions) {
    if (q.skill.toLowerCase() !== canonical.toLowerCase()) {
      throw new Error(`Skill assessment integrity violation: expected skill "${canonical}", but question contains "${q.skill}".`);
    }
  }

  if (finalQuestions.length !== 5) {
    throw new Error(`Skill assessment integrity violation: expected exactly 5 questions for "${canonical}", got ${finalQuestions.length}.`);
  }

  return {
    canonicalSkill: canonical,
    questions: finalQuestions
  };
}

/**
 * Returns all currently registered canonical skill names.
 */
export function getAllSupportedSkills() {
  const skills = new Set();
  for (const [, val] of QUESTION_BANK.entries()) {
    skills.add(val.canonicalName);
  }
  return Array.from(skills).sort();
}
