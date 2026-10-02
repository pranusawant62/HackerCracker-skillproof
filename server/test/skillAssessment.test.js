import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  createSession, 
  getSession, 
  startAssessment, 
  submitAssessment,
  assessmentsStore 
} from '../src/services/sessionStore.js';
import { 
  generateSkillAssessment, 
  sanitizeAssessmentForClient 
} from '../src/services/skillAssessmentGenerator.js';
import { evaluateAssessment } from '../src/services/assessmentEvaluator.js';
import { compareJobWithVerifiedSkills } from '../src/services/jobMatcher.js';
import { getSkillGapDetails } from '../src/services/skillGapService.js';
import { calculateSkillGrowth } from '../src/services/skillGrowthService.js';
import { generateDeterministicSkillAnalysis } from '../src/services/aiSkillAnalysis.js';

function createFreshTestSession() {
  return createSession({
    candidateName: 'Alex Mercer',
    claimedSkills: [
      { id: 'sk_sql', name: 'SQL', skill: 'SQL', status: 'CLAIMED-ONLY', evidence: [] },
      { id: 'sk_py', name: 'Python', skill: 'Python', status: 'CLAIMED-ONLY', evidence: [] },
      { id: 'sk_doc', name: 'Docker', skill: 'Docker', status: 'CLAIMED-ONLY', evidence: [] }
    ]
  });
}

describe('Skill Micro-Task Assessment Comprehensive Tests', () => {

  test('1. Generates skill-specific SQL assessment with realistic questions', () => {
    const assessment = generateSkillAssessment('SQL', 'intermediate');
    assert.strictEqual(assessment.skill, 'SQL');
    assert.ok(assessment.questions.length >= 4);
    assert.strictEqual(assessment.passingScore, 70);

    const sqlQueries = assessment.questions.filter(q => q.type === 'sql_query' || q.type === 'sql');
    assert.ok(sqlQueries.length >= 2);
    assert.ok(assessment.questions.some(q => q.question.toLowerCase().includes('salary')));
  });

  test('2. Generates skill-specific Python assessment with code tasks', () => {
    const assessment = generateSkillAssessment('Python', 'intermediate');
    assert.strictEqual(assessment.skill, 'Python');
    assert.ok(assessment.questions.length >= 4);

    const codeTasks = assessment.questions.filter(q => q.type === 'code_writing' || q.type === 'code');
    assert.ok(codeTasks.length >= 1);
    assert.ok(assessment.questions.some(q => q.starterCode && q.starterCode.includes('def ')));
  });

  test('3. Robust fallback generator for unknown / arbitrary skills', () => {
    const assessment = generateSkillAssessment('QuantumComputingFramework', 'intermediate');
    assert.strictEqual(assessment.skill, 'QuantumComputingFramework');
    assert.ok(assessment.questions.length >= 3);
    assert.ok(assessment.questions[0].question.includes('QuantumComputingFramework'));
  });

  test('4. Assessment start returns sanitized assessment without answer keys', () => {
    const session = createFreshTestSession();
    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'SQL',
      difficulty: 'intermediate'
    });

    assert.ok(assessment);
    assert.ok(assessment.assessmentId);
    assert.strictEqual(assessment.skill, 'SQL');
    assert.ok(Array.isArray(assessment.questions));

    // Verify answer keys and expected answers MUST NOT be exposed
    assessment.questions.forEach(q => {
      assert.strictEqual(q.expectedAnswer, undefined);
      assert.strictEqual(q.testCases, undefined);
      assert.strictEqual(q.correctOptionIndex, undefined);
    });
  });

  test('5. Assessment submission evaluates answers deterministically', () => {
    const session = createFreshTestSession();
    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'SQL',
      difficulty: 'intermediate'
    });

    const answers = [
      { questionId: 'sql_q1', answer: 'SELECT * FROM employees WHERE salary > 50000;' },
      { questionId: 'sql_q2', answer: 'SELECT e.name, d.department_name, e.salary FROM employees e JOIN departments d ON e.department_id = d.id;' },
      { questionId: 'sql_q3', answer: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);' },
      { questionId: 'sql_q4', answer: 'WHERE filters rows before grouping, while HAVING filters aggregated groups after GROUP BY.' },
      { questionId: 'sql_q5', answer: 'SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;' }
    ];

    const submitResult = submitAssessment({
      assessmentId: assessment.assessmentId,
      sessionId: session.sessionId,
      answers
    });

    assert.ok(submitResult.assessmentResult);
    assert.ok(submitResult.assessmentResult.score > 0);
    assert.ok(submitResult.assessmentResult.percentage >= 70);
    assert.strictEqual(submitResult.assessmentResult.status, 'passed');
    assert.strictEqual(submitResult.assessmentResult.verificationMethod, 'microtask_assessment');
    assert.ok(submitResult.assessmentResult.strengths.length > 0);
  });

  test('6. Evaluator awards marks accurately and calculates competency', () => {
    const assessment = generateSkillAssessment('SQL', 'intermediate');
    const answers = [
      { questionId: 'sql_q1', answer: 'SELECT * FROM employees WHERE salary > 50000;' },
      { questionId: 'sql_q2', answer: 'SELECT e.name, d.department_name, e.salary FROM employees e INNER JOIN departments d ON e.department_id = d.id;' },
      { questionId: 'sql_q3', answer: 'SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1;' },
      { questionId: 'sql_q4', answer: 'WHERE filters row by row before GROUP BY, while HAVING filters aggregated summaries.' },
      { questionId: 'sql_q5', answer: 'SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;' }
    ];

    const evaluation = evaluateAssessment(assessment, answers);
    assert.ok(evaluation.percentage >= 80);
    assert.ok(['Strong', 'Excellent', 'Competent'].includes(evaluation.competency));
    assert.strictEqual(evaluation.passed, true);
  });

  test('7. Fails assessment if answers are incorrect or below 70%', () => {
    const session = createFreshTestSession();
    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'SQL',
      difficulty: 'intermediate'
    });

    const answers = [
      { questionId: 'sql_q1', answer: 'gibberish non sql' },
      { questionId: 'sql_q2', answer: 'wrong answer' }
    ];

    const submitResult = submitAssessment({
      assessmentId: assessment.assessmentId,
      sessionId: session.sessionId,
      answers
    });

    assert.ok(submitResult.assessmentResult.percentage < 70);
    assert.strictEqual(submitResult.assessmentResult.status, 'failed');
    assert.strictEqual(submitResult.assessmentResult.passed, false);

    // 17. Failed assessment does not become verified in session
    const updatedSession = getSession(session.sessionId);
    const sqlSkill = updatedSession.claimedSkills.find(s => (s.name === 'SQL' || s.skill === 'SQL'));
    assert.notStrictEqual(sqlSkill.status, 'PROVEN');
    assert.strictEqual(sqlSkill.assessmentStatus, 'failed');
  });

  test('8 & 16. Passed assessment updates session claimedSkill to microtask verified without faking certificate or github', () => {
    const session = createFreshTestSession();
    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'SQL',
      difficulty: 'intermediate'
    });

    const answers = [
      { questionId: 'sql_q1', answer: 'SELECT * FROM employees WHERE salary > 50000;' },
      { questionId: 'sql_q2', answer: 'SELECT e.name, d.department_name, e.salary FROM employees e JOIN departments d ON e.department_id = d.id;' },
      { questionId: 'sql_q3', answer: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);' },
      { questionId: 'sql_q4', answer: 'WHERE filters rows before grouping, while HAVING filters aggregated groups.' },
      { questionId: 'sql_q5', answer: 'SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;' }
    ];

    submitAssessment({ assessmentId: assessment.assessmentId, sessionId: session.sessionId, answers });

    const updatedSession = getSession(session.sessionId);
    const sqlSkill = updatedSession.claimedSkills.find(s => (s.name === 'SQL' || s.skill === 'SQL'));
    assert.strictEqual(sqlSkill.assessmentStatus, 'passed');
    assert.strictEqual(sqlSkill.status.toLowerCase(), 'proven');
    assert.strictEqual(sqlSkill.verificationMethod, 'microtask_assessment');

    const microtaskEv = sqlSkill.evidence.find(e => e.type === 'microtask_assessment');
    assert.ok(microtaskEv);
    assert.strictEqual(microtaskEv.evidenceSource, 'microtask_assessment');
    assert.ok(microtaskEv.percentage >= 70);
    assert.strictEqual(sqlSkill.evidence.some(e => e.type === 'certificate'), false);
  });

  test('9. Handles empty or missing answers gracefully with 0 score', () => {
    const session = createFreshTestSession();
    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'SQL',
      difficulty: 'intermediate'
    });

    const submitResult = submitAssessment({
      assessmentId: assessment.assessmentId,
      sessionId: session.sessionId,
      answers: []
    });

    assert.strictEqual(submitResult.assessmentResult.score, 0);
    assert.strictEqual(submitResult.assessmentResult.percentage, 0);
    assert.strictEqual(submitResult.assessmentResult.passed, false);
  });

  test('10. Rejects invalid assessment ID', () => {
    const session = createFreshTestSession();
    assert.throws(() => {
      submitAssessment({
        assessmentId: 'non-existent-id',
        sessionId: session.sessionId,
        answers: []
      });
    }, /not found/i);
  });

  test('11. Rejects invalid session ID on start', () => {
    assert.throws(() => {
      startAssessment({
        sessionId: 'invalid-session-999',
        skill: 'SQL'
      });
    }, /not found/i);
  });

  test('12. Prevents duplicate submission of the same assessment', () => {
    const session = createFreshTestSession();
    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'SQL',
      difficulty: 'intermediate'
    });

    submitAssessment({
      assessmentId: assessment.assessmentId,
      sessionId: session.sessionId,
      answers: [{ questionId: 'sql_q1', answer: 'SELECT * FROM employees WHERE salary > 50000;' }]
    });

    assert.throws(() => {
      submitAssessment({
        assessmentId: assessment.assessmentId,
        sessionId: session.sessionId,
        answers: [{ questionId: 'sql_q1', answer: 'SELECT * FROM employees WHERE salary > 50000;' }]
      });
    }, /submitted/i);
  });

  test('13. Enforces assessment expiration', () => {
    const session = createFreshTestSession();
    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'SQL',
      difficulty: 'intermediate'
    });

    const stored = assessmentsStore.get(assessment.assessmentId);
    stored.expiresAt = new Date(Date.now() - 1000).toISOString();

    assert.throws(() => {
      submitAssessment({
        assessmentId: assessment.assessmentId,
        sessionId: session.sessionId,
        answers: [{ questionId: 'sql_q1', answer: 'SELECT * FROM employees WHERE salary > 50000;' }]
      });
    }, /expired/i);
  });

  test('14. Answer key is not exposed by sanitizeAssessmentForClient', () => {
    const assessment = generateSkillAssessment('SQL', 'intermediate');
    const sanitized = sanitizeAssessmentForClient(assessment);

    sanitized.questions.forEach(q => {
      assert.strictEqual(q.expectedAnswer, undefined);
      assert.strictEqual(q.testCases, undefined);
      assert.strictEqual(q.correctOptionIndex, undefined);
    });
  });

  test('15. Ignores frontend tampering: backend calculates authoritative score', () => {
    const session = createFreshTestSession();
    const assessment = startAssessment({
      sessionId: session.sessionId,
      skill: 'SQL',
      difficulty: 'intermediate'
    });

    const submitResult = submitAssessment({
      assessmentId: assessment.assessmentId,
      sessionId: session.sessionId,
      score: 100,
      percentage: 100,
      status: 'passed',
      answers: [
        { questionId: 'sql_q1', answer: 'completely wrong gibberish' }
      ]
    });

    assert.ok(submitResult.assessmentResult.score < 70);
    assert.strictEqual(submitResult.assessmentResult.passed, false);
  });

  test('18. Job Match recognizes passed micro-task as demonstrated competency with explanation', () => {
    const candidateSkills = [
      {
        name: 'SQL',
        status: 'PROVEN',
        verificationMethod: 'microtask_assessment',
        evidence: [
          {
            type: 'microtask_assessment',
            percentage: 86,
            score: 86,
            competency: 'Strong',
            passed: true
          }
        ]
      }
    ];

    const match = compareJobWithVerifiedSkills({
      jobDescription: {
        role: 'Database Engineer',
        requiredSkills: ['SQL']
      },
      verifiedSkills: candidateSkills
    });

    const matchPct = match.summary?.matchPercentage ?? match.matchPercentage;
    assert.strictEqual(matchPct, 100);
    assert.strictEqual(match.matchedSkills.length, 1);
    assert.strictEqual(match.matchedSkills[0].skill, 'SQL');
    assert.strictEqual(match.matchedSkills[0].verificationMethod, 'microtask_assessment');
    assert.ok(match.matchedSkills[0].explanation.includes('Micro-Task Assessment — 86%'));
  });

  test('19. Job Match does NOT give full match to failed micro-task', () => {
    const candidateSkills = [
      {
        name: 'SQL',
        status: 'CLAIMED-ONLY',
        assessmentStatus: 'failed',
        evidence: [
          {
            type: 'microtask_assessment',
            percentage: 50,
            passed: false
          }
        ]
      }
    ];

    const match = compareJobWithVerifiedSkills({
      jobDescription: {
        role: 'Database Engineer',
        requiredSkills: ['SQL']
      },
      verifiedSkills: candidateSkills
    });

    assert.strictEqual(match.matchedSkills.length, 0);
    assert.strictEqual(match.skillGaps.length, 1);
    assert.strictEqual(match.skillGaps[0].skill, 'SQL');
  });

  test('20. Skill Gap details recommends completing micro-task again if failed', () => {
    const candidateSkills = [
      {
        name: 'SQL',
        status: 'CLAIMED-ONLY',
        assessmentStatus: 'failed',
        assessmentScore: 55,
        assessmentHistory: [
          { percentage: 55, passed: false }
        ]
      }
    ];

    const gap = getSkillGapDetails({
      skill: 'SQL',
      status: 'CLAIMED-ONLY',
      candidateEvidence: candidateSkills[0]
    });

    assert.ok(gap);
    assert.strictEqual(gap.skill, 'SQL');
    assert.ok(gap.reason.includes('Assessment attempted') || gap.reason.includes('failed'));
    assert.ok((gap.recommendation || '').toLowerCase().includes('micro-task') || (gap.microTask?.title || '').toLowerCase().includes('sql') || gap.reason.includes('55%'));
  });

  test('21. Skill Growth records assessment history and delta progression', () => {
    const candidateSkills = [
      {
        name: 'SQL',
        status: 'PROVEN',
        assessmentHistory: [
          { attemptId: 'att1', percentage: 52, passed: false },
          { attemptId: 'att2', percentage: 68, passed: false },
          { attemptId: 'att3', percentage: 86, passed: true }
        ],
        evidence: [
          { type: 'microtask_assessment', percentage: 86, passed: true }
        ]
      }
    ];

    const growth = calculateSkillGrowth({
      verifiedSkills: candidateSkills,
      jobDescription: { role: 'Data Analyst', requiredSkills: ['SQL'] }
    });

    assert.ok(growth.assessmentProgress);
    assert.strictEqual(growth.assessmentProgress.length, 1);
    assert.strictEqual(growth.assessmentProgress[0].skill, 'SQL');
    assert.strictEqual(growth.assessmentProgress[0].growthDelta, 34);
    assert.strictEqual(growth.assessmentProgress[0].growthText, '+34 percentage points');
  });

  test('22. AI Skill Analysis highlights micro-task assessment proof in strengths', () => {
    const candidateSkills = [
      {
        name: 'SQL',
        status: 'PROVEN',
        verificationMethod: 'microtask_assessment',
        evidence: [
          { type: 'microtask_assessment', percentage: 86, passed: true }
        ]
      },
      {
        name: 'Docker',
        status: 'CLAIMED-ONLY',
        assessmentStatus: 'failed',
        evidence: []
      }
    ];

    const analysis = generateDeterministicSkillAnalysis({
      verifiedSkills: candidateSkills,
      jobMatch: { matchedSkills: [], missingSkills: ['Docker'] }
    });

    assert.ok(analysis.strengths.some(s => s.includes('SQL') && s.toLowerCase().includes('micro-task assessment')));
    assert.ok(analysis.evidenceGaps.some(g => g.includes('Docker') && g.toLowerCase().includes('assessment attempted')));
  });

  test('23 & 24. Preserves certificate and GitHub verification engine rules', () => {
    const candidateSkills = [
      {
        name: 'Python',
        status: 'PROVEN',
        evidence: [
          {
            type: 'github_repo',
            repoName: 'alex/fastapi-backend',
            confidenceScore: 92,
            observableArtifacts: ['FastAPI router', 'SQLAlchemy models']
          }
        ]
      },
      {
        name: 'AWS',
        status: 'PROVEN',
        evidence: [
          {
            type: 'certificate',
            confidenceScore: 95,
            observableArtifacts: ['AWS Solutions Architect Certificate PDF']
          }
        ]
      }
    ];

    const match = compareJobWithVerifiedSkills({
      jobDescription: { requiredSkills: ['Python', 'AWS'] },
      verifiedSkills: candidateSkills
    });

    const matchPct = match.summary?.matchPercentage ?? match.matchPercentage;
    assert.strictEqual(matchPct, 100);
    assert.strictEqual(match.matchedSkills.find(m => m.skill === 'Python').verificationMethod, 'github');
    assert.strictEqual(match.matchedSkills.find(m => m.skill === 'AWS').verificationMethod, 'certificate');
  });
});
