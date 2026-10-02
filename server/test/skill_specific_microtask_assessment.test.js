import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  createSession, 
  startAssessment, 
  submitAssessment,
  getAssessment,
  getSession 
} from '../src/services/sessionStore.js';
import { 
  generateSkillAssessment, 
  sanitizeAssessmentForClient,
  getAllSupportedSkills,
  registerSkillQuestions,
  resolveAssessmentSkillName
} from '../src/services/skillAssessmentGenerator.js';
import { evaluateSkillAssessment } from '../src/services/assessmentEvaluator.js';

describe('SkillProof 100% Skill-Specific Practical Micro-Task Verification Tests', () => {

  const MANDATED_58_SKILLS = [
    // Programming / Development (13)
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Kotlin', 'Swift',
    // Web Development (8)
    'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js',
    // Backend / API (5)
    'FastAPI', 'Flask', 'Django', 'REST API', 'GraphQL',
    // Database (8)
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'Firebase', 'Firestore',
    // DevOps / Cloud (8)
    'Docker', 'Docker Compose', 'Kubernetes', 'AWS', 'Microsoft Azure', 'Google Cloud', 'CI/CD', 'GitHub Actions',
    // Version Control (3)
    'Git', 'GitHub', 'GitLab',
    // Data / AI (5)
    'Pandas', 'NumPy', 'Data Analysis', 'Machine Learning', 'Artificial Intelligence',
    // Other Technical Skills (8)
    'Linux', 'Computer Networks', 'Operating Systems', 'Data Structures', 'Algorithms', 'OOP', 'System Design', 'Cybersecurity'
  ];

  test('Requirement 1 & 2 & 3: Every one of the 58 skills generates exactly 5 questions with correct numbers and skill isolation', () => {
    assert.strictEqual(MANDATED_58_SKILLS.length, 58, 'Must verify all 58 requested skills');

    for (const skillName of MANDATED_58_SKILLS) {
      const assessment = generateSkillAssessment(skillName, 'intermediate');
      
      // Exactly 5 questions
      assert.strictEqual(assessment.questions.length, 5, `Skill "${skillName}" must have exactly 5 questions`);
      assert.strictEqual(assessment.totalQuestions, 5, `Skill "${skillName}" totalQuestions must equal 5`);

      // 100% skill-specific: Every question must strictly belong to the selected skill
      for (let i = 0; i < 5; i++) {
        const q = assessment.questions[i];
        assert.strictEqual(q.questionNumber, i + 1, `Question ${i + 1} must have questionNumber ${i + 1}`);
        assert.strictEqual(q.skill.toLowerCase(), skillName.toLowerCase(), 
          `Question ${i + 1} for "${skillName}" had mismatched skill "${q.skill}"`);
        assert.ok(q.question && q.question.trim().length > 10, `Question ${i + 1} must have descriptive prompt`);
      }
    }
  });

  test('Requirement 1: SQL -> Exactly 5 SQL questions, zero non-SQL concepts', () => {
    const assessment = generateSkillAssessment('SQL');
    assert.strictEqual(assessment.questions.length, 5);
    assessment.questions.forEach((q, idx) => {
      assert.strictEqual(q.skill, 'SQL');
      assert.strictEqual(q.questionNumber, idx + 1);
      // Verify SQL concepts
      const text = (q.question + ' ' + (q.starterCode || '') + ' ' + q.expectedAnswer).toLowerCase();
      assert.ok(text.includes('sql') || text.includes('select') || text.includes('from') || text.includes('group by'),
        `SQL question ${idx + 1} must contain SQL concepts: ${q.question}`);
    });
  });

  test('Requirement 1: PostgreSQL -> Exactly 5 PostgreSQL questions, NOT generic duplicate SQL', () => {
    const assessment = generateSkillAssessment('PostgreSQL');
    assert.strictEqual(assessment.questions.length, 5);
    const combined = assessment.questions.map(q => q.question + ' ' + (q.expectedAnswer || '')).join(' ').toLowerCase();
    
    // Check PostgreSQL-specific features: JSONB, INTERVAL, DENSE_RANK, ON CONFLICT, WITH RECURSIVE
    assert.ok(combined.includes('interval') || combined.includes('jsonb') || combined.includes('rank') || combined.includes('conflict'),
      'PostgreSQL assessment must test PostgreSQL-specific features');
    assessment.questions.forEach(q => assert.strictEqual(q.skill, 'PostgreSQL'));
  });

  test('Requirement 1: Firebase -> Exactly 5 Firebase tasks, NEVER SQL or PostgreSQL questions', () => {
    const assessment = generateSkillAssessment('Firebase');
    assert.strictEqual(assessment.questions.length, 5);
    
    for (const q of assessment.questions) {
      assert.strictEqual(q.skill, 'Firebase');
      const text = (q.question + ' ' + (q.starterCode || '')).toLowerCase();
      // Ensure NO SQL clauses are present as main driver
      assert.ok(!text.includes('select name, salary from employees'), 'Firebase assessment must NEVER contain employee SQL query');
      assert.ok(text.includes('firebase') || text.includes('firestore') || text.includes('auth'), 
        `Firebase task must contain Firebase SDK/rules concepts: ${q.question}`);
    }
  });

  test('Requirement 1: Docker -> Exactly 5 Docker tasks, NEVER SQL', () => {
    const assessment = generateSkillAssessment('Docker');
    assert.strictEqual(assessment.questions.length, 5);

    for (const q of assessment.questions) {
      assert.strictEqual(q.skill, 'Docker');
      const text = (q.question + ' ' + (q.starterCode || '')).toLowerCase();
      assert.ok(!text.includes('select * from employees'), 'Docker assessment must NEVER contain SQL queries');
      assert.ok(text.includes('docker') || text.includes('container') || text.includes('image') || text.includes('volume') || text.includes('network'),
        `Docker task must test Docker container concepts: ${q.question}`);
    }
  });

  test('Requirement 1: FastAPI -> Exactly 5 FastAPI tasks', () => {
    const assessment = generateSkillAssessment('FastAPI');
    assert.strictEqual(assessment.questions.length, 5);

    for (const q of assessment.questions) {
      assert.strictEqual(q.skill, 'FastAPI');
      const text = (q.question + ' ' + (q.starterCode || '')).toLowerCase();
      assert.ok(text.includes('fastapi') || text.includes('pydantic') || text.includes('endpoint') || text.includes('depends'),
        `FastAPI task must test FastAPI API concepts: ${q.question}`);
    }
  });

  test('Requirement 1: GitHub -> Exactly 5 GitHub tasks', () => {
    const assessment = generateSkillAssessment('GitHub');
    assert.strictEqual(assessment.questions.length, 5);

    for (const q of assessment.questions) {
      assert.strictEqual(q.skill, 'GitHub');
      const text = (q.question + ' ' + (q.starterCode || '')).toLowerCase();
      assert.ok(text.includes('github') || text.includes('pull request') || text.includes('branch protection') || text.includes('remote') || text.includes('secrets'),
        `GitHub task must test GitHub workflow concepts: ${q.question}`);
    }
  });

  test('Requirement 1: Python -> Exactly 5 Python tasks', () => {
    const assessment = generateSkillAssessment('Python');
    assert.strictEqual(assessment.questions.length, 5);

    for (const q of assessment.questions) {
      assert.strictEqual(q.skill, 'Python');
      const text = (q.question + ' ' + (q.starterCode || '')).toLowerCase();
      assert.ok(text.includes('python') || text.includes('def ') || text.includes('yield') || text.includes('decorator') || text.includes('class '),
        `Python task must test Python programming concepts: ${q.question}`);
    }
  });

  test('Requirement 1: React -> Exactly 5 React tasks', () => {
    const assessment = generateSkillAssessment('React');
    assert.strictEqual(assessment.questions.length, 5);

    for (const q of assessment.questions) {
      assert.strictEqual(q.skill, 'React');
      const text = (q.question + ' ' + (q.starterCode || '')).toLowerCase();
      assert.ok(text.includes('react') || text.includes('hook') || text.includes('usestate') || text.includes('useeffect') || text.includes('component'),
        `React task must test React component concepts: ${q.question}`);
    }
  });

  test('Requirement 1: Git -> Exactly 5 Git command tasks', () => {
    const assessment = generateSkillAssessment('Git');
    assert.strictEqual(assessment.questions.length, 5);

    for (const q of assessment.questions) {
      assert.strictEqual(q.skill, 'Git');
      const text = (q.question + ' ' + (q.starterCode || '')).toLowerCase();
      assert.ok(text.includes('git') || text.includes('commit') || text.includes('branch') || text.includes('stash') || text.includes('conflict'),
        `Git task must test Git version control concepts: ${q.question}`);
    }
  });

  test('Requirement 4: Extensible architecture supports dynamic future skills without code rewrite', () => {
    const dynamicAssessment = generateSkillAssessment('QuantumAlgorithmToolbox');
    assert.strictEqual(dynamicAssessment.skill, 'QuantumAlgorithmToolbox');
    assert.strictEqual(dynamicAssessment.questions.length, 5);
    
    // Check questions 1-5 strictly assigned to new skill
    dynamicAssessment.questions.forEach((q, idx) => {
      assert.strictEqual(q.skill, 'QuantumAlgorithmToolbox');
      assert.strictEqual(q.questionNumber, idx + 1);
    });

    // Test dynamic skill registration
    registerSkillQuestions('Solidity', [
      { id: 'sol_1', type: 'code', question: 'Write a basic ERC-20 token contract interface.' },
      { id: 'sol_2', type: 'code', question: 'Implement a modifier onlyRole in Solidity.' },
      { id: 'sol_3', type: 'code', question: 'Handle reentrancy guard with Checks-Effects-Interactions.' },
      { id: 'sol_4', type: 'code', question: 'Optimize gas usage using calldata instead of memory.' },
      { id: 'sol_5', type: 'code', question: 'Implement an upgradeable beacon proxy.' }
    ]);

    const solAssessment = generateSkillAssessment('Solidity');
    assert.strictEqual(solAssessment.skill, 'Solidity');
    assert.strictEqual(solAssessment.questions.length, 5);
    assert.strictEqual(solAssessment.questions[0].question, 'Write a basic ERC-20 token contract interface.');
  });

  test('Requirement 8: Backend skill validation strictly blocks mismatched skill questions', () => {
    const session = createSession({
      candidateName: 'Jordan Lee',
      claimedSkills: [{ id: 'sk_fb', name: 'Firebase', skill: 'Firebase', status: 'CLAIMED-ONLY' }]
    });

    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'Firebase'
    });

    assert.strictEqual(assessment.skill, 'Firebase');
    assert.strictEqual(assessment.questions.length, 5);
    assessment.questions.forEach(q => {
      assert.strictEqual(q.skill, 'Firebase');
    });
  });

  test('Requirement 11 & 12: Authoritative backend evaluation with 70% threshold and dynamic skill result', () => {
    const session = createSession({
      candidateName: 'Morgan Smith',
      claimedSkills: [
        { id: 'sk_dock', name: 'Docker', skill: 'Docker', status: 'CLAIMED-ONLY' },
        { id: 'sk_fb', name: 'Firebase', skill: 'Firebase', status: 'CLAIMED-ONLY' }
      ]
    });

    // 1. Docker Assessment - Passing
    const dockerAssessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'Docker'
    });

    const dockerAnswers = [
      { questionId: 'docker_q1', answer: 'FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["uvicorn", "main:app"]' },
      { questionId: 'docker_q2', answer: 'docker run -d --name web_api -p 8080:80 -e ENV=production my-web-image:latest' },
      { questionId: 'docker_q3', answer: 'FROM node:20 AS builder\nWORKDIR /app\nRUN npm run build\nFROM node:20 AS runner\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/server.js"]' },
      { questionId: 'docker_q4', answer: 'docker volume create pg_data\ndocker run -d --name db -v pg_data:/var/lib/postgresql/data postgres' },
      { questionId: 'docker_q5', answer: 'docker network create app_net\ndocker run --network app_net redis\ndocker run --network app_net app' }
    ];

    const submitResult = submitAssessment({
      assessmentId: dockerAssessment.assessmentId,
      sessionId: session.sessionId,
      answers: dockerAnswers
    });

    assert.strictEqual(submitResult.skill.skill || submitResult.skill.name, 'Docker');
    assert.strictEqual(submitResult.assessmentResult.skill, 'Docker');
    assert.ok(submitResult.assessmentResult.percentage >= 70);
    assert.strictEqual(submitResult.assessmentResult.passed, true);
    assert.strictEqual(submitResult.assessmentResult.status, 'passed');

    // 2. Firebase Assessment - Below 70% fails
    const firebaseAssessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'Firebase'
    });

    const failedAnswers = [
      { questionId: 'firebase_q1', answer: 'incomplete code' }
    ];

    const failResult = submitAssessment({
      assessmentId: firebaseAssessment.assessmentId,
      sessionId: session.sessionId,
      answers: failedAnswers
    });

    assert.strictEqual(failResult.assessmentResult.skill, 'Firebase');
    assert.ok(failResult.assessmentResult.percentage < 70);
    assert.strictEqual(failResult.assessmentResult.passed, false);
    assert.strictEqual(failResult.assessmentResult.status, 'failed');
  });

  test('Requirement 17: Sanitized assessment never leaks answer keys or validation criteria', () => {
    const rawAssessment = generateSkillAssessment('FastAPI');
    const sanitized = sanitizeAssessmentForClient(rawAssessment);

    assert.strictEqual(sanitized.questions.length, 5);
    sanitized.questions.forEach(q => {
      assert.strictEqual(q.expectedAnswer, undefined, 'expectedAnswer must be stripped');
      assert.strictEqual(q.validationCriteria, undefined, 'validationCriteria must be stripped');
      assert.strictEqual(q.explanation, undefined, 'explanation must be stripped');
      assert.ok(q.question, 'question must be present');
      assert.ok(q.skill, 'skill must be present');
    });
  });

});
