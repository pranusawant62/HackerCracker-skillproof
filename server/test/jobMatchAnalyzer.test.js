import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  analyzeJobMatch, 
  normalizeSkillName, 
  normalizeSkillStatus, 
  extractResponsibilities 
} from '../src/services/jobMatchAnalyzer.js';
import { createSession, getSession } from '../src/services/sessionStore.js';

test('Job Match Analysis Feature Tests', async (t) => {

  // TEST 1: Python proven + Python required -> matched
  await t.test('1. Python proven + Python required -> matched (100 points)', () => {
    const jd = `Job Title: Python Backend Engineer
Requirements:
- Strong proficiency in Python is required.
Responsibilities:
- Build server-side applications.`;

    const candidateSkills = [
      { skill: 'Python', status: 'proven' }
    ];

    const result = analyzeJobMatch(jd, candidateSkills);

    assert.equal(result.percentage, 100);
    assert.equal(result.matchedSkills.length, 1);
    assert.equal(result.matchedSkills[0].skill, 'Python');
    assert.equal(result.matchedSkills[0].status, 'PROVEN');
    assert.equal(result.matchedSkills[0].points, 100);
    assert.ok(result.matchedSkills[0].explanation.includes('Python is proven through verified evidence'));
    assert.equal(result.partialSkills.length, 0);
    assert.equal(result.gapSkills.length, 0);
  });

  // TEST 2: Python partial + Python required -> partial
  await t.test('2. Python partial + Python required -> partial (50 points)', () => {
    const jd = `Job Title: Python Developer
Qualifications:
- Must have experience with Python.`;

    const candidateSkills = [
      { skill: 'Python', status: 'partial' }
    ];

    const result = analyzeJobMatch(jd, candidateSkills);

    assert.equal(result.percentage, 50);
    assert.equal(result.matchedSkills.length, 0);
    assert.equal(result.partialSkills.length, 1);
    assert.equal(result.partialSkills[0].skill, 'Python');
    assert.equal(result.partialSkills[0].status, 'PARTIAL');
    assert.equal(result.partialSkills[0].points, 50);
    assert.ok(result.partialSkills[0].explanation.includes('Python is partially verified'));
  });

  // TEST 3: Python claimed + Python required -> not verified
  await t.test('3. Python claimed + Python required -> not verified (0 points)', () => {
    const jd = `Job Title: Python Specialist
Required Skills:
- Essential knowledge of Python.`;

    const candidateSkills = [
      { skill: 'Python', status: 'unverified' }
    ];

    const result = analyzeJobMatch(jd, candidateSkills);

    assert.equal(result.percentage, 0);
    assert.equal(result.matchedSkills.length, 0);
    assert.equal(result.partialSkills.length, 0);
    assert.equal(result.gapSkills.length, 1);
    assert.equal(result.gapSkills[0].skill, 'Python');
    assert.equal(result.gapSkills[0].status, 'UNVERIFIED');
    assert.equal(result.gapSkills[0].points, 0);
    assert.ok(result.gapSkills[0].explanation.includes('Python is claimed but currently has no verified evidence'));

    // Appears in claimedUnverifiedSkills
    assert.ok(result.claimedUnverifiedSkills.some(s => s.skill === 'Python'));
  });

  // TEST 4: Missing skill -> gap
  await t.test('4. Missing skill -> gap (0 points)', () => {
    const jd = `Job Title: SQL Specialist
Required Qualifications:
- Mandatory proficiency in SQL is required.`;

    const candidateSkills = [
      { skill: 'Python', status: 'proven' } // SQL is missing
    ];

    const result = analyzeJobMatch(jd, candidateSkills);

    assert.equal(result.percentage, 0);
    assert.equal(result.gapSkills.length, 1);
    assert.equal(result.gapSkills[0].skill, 'SQL');
    assert.equal(result.gapSkills[0].status, 'MISSING');
    assert.equal(result.gapSkills[0].points, 0);
    assert.ok(result.gapSkills[0].explanation.includes('SQL is required by the role but no verified SQL evidence was found'));
  });

  // TEST 5: Multiple skills calculation
  await t.test('5. Multiple skills calculation: 2 proven, 1 partial, 1 unverified, 1 missing out of 5 required -> 50%', () => {
    // 5 required skills:
    // Python (proven: 100)
    // FastAPI (proven: 100)
    // React (partial: 50)
    // Docker (unverified: 0)
    // PostgreSQL (missing: 0)
    // Total points = 250 / 500 = 50%
    const jd = `Job Title: Full-Stack Engineer
Required Qualifications:
- Strong knowledge of Python is required.
- Must have experience with FastAPI.
- Solid understanding of React.
- Docker is essential.
- Mandatory background in PostgreSQL.`;

    const candidateSkills = [
      { skill: 'Python', status: 'proven' },
      { skill: 'FastAPI', status: 'proven' },
      { skill: 'React', status: 'partial' },
      { skill: 'Docker', status: 'unverified' }
      // PostgreSQL is not claimed
    ];

    const result = analyzeJobMatch(jd, candidateSkills);

    assert.equal(result.requiredSkills.length, 5);
    assert.equal(result.matchedSkills.length, 2);
    assert.equal(result.partialSkills.length, 1);
    assert.equal(result.gapSkills.length, 2);
    assert.equal(result.percentage, 50);
  });

  // TEST 6: Skill normalization
  await t.test('6. Skill normalization: Postgres -> PostgreSQL, React.js -> React, Fast API -> FastAPI, Node JS -> Node.js, PowerBI -> Power BI', () => {
    assert.equal(normalizeSkillName('Postgres'), 'PostgreSQL');
    assert.equal(normalizeSkillName('postgres'), 'PostgreSQL');
    assert.equal(normalizeSkillName('React.js'), 'React');
    assert.equal(normalizeSkillName('reactjs'), 'React');
    assert.equal(normalizeSkillName('Fast API'), 'FastAPI');
    assert.equal(normalizeSkillName('fastapi'), 'FastAPI');
    assert.equal(normalizeSkillName('Node JS'), 'Node.js');
    assert.equal(normalizeSkillName('node.js'), 'Node.js');
    assert.equal(normalizeSkillName('PowerBI'), 'Power BI');
    assert.equal(normalizeSkillName('power bi'), 'Power BI');

    // Matching in JD with non-canonical text against canonical candidate skills
    const jd = `Job Title: Engineer
Required Skills:
- Experience with Postgres is required.
- Proficiency in React.js is mandatory.
- Familiarity with Fast API.
- Working knowledge of Node JS.
- Solid experience in PowerBI.`;

    const candidateSkills = [
      { skill: 'PostgreSQL', status: 'proven' },
      { skill: 'React', status: 'proven' },
      { skill: 'FastAPI', status: 'proven' },
      { skill: 'Node.js', status: 'proven' },
      { skill: 'Power BI', status: 'proven' }
    ];

    const result = analyzeJobMatch(jd, candidateSkills);

    assert.equal(result.matchedSkills.length, 5);
    assert.equal(result.percentage, 100);
    assert.ok(result.matchedSkills.some(s => s.skill === 'PostgreSQL'));
    assert.ok(result.matchedSkills.some(s => s.skill === 'React'));
    assert.ok(result.matchedSkills.some(s => s.skill === 'FastAPI'));
    assert.ok(result.matchedSkills.some(s => s.skill === 'Node.js'));
    assert.ok(result.matchedSkills.some(s => s.skill === 'Power BI'));
  });

  // TEST 7: Empty job description
  await t.test('7. Empty or short job description throws clear error', () => {
    assert.throws(() => {
      analyzeJobMatch('', [{ skill: 'Python', status: 'proven' }]);
    }, /Job description text is required/);

    assert.throws(() => {
      analyzeJobMatch('Too short', [{ skill: 'Python', status: 'proven' }]);
    }, /Job description is too short/);
  });

  // TEST 8: Missing session in session store
  await t.test('8. Missing session lookup handles gracefully', () => {
    const session = getSession('non-existent-session-id-xyz');
    assert.equal(session, null);
  });

  // TEST 9: Deterministic percentage
  await t.test('9. Match score calculation is 100% deterministic and reproducible', () => {
    const jd = `Job Title: Backend Developer
Required Qualifications:
- Proven experience with Python.
- Proven experience with FastAPI.
- Required skills include PostgreSQL.
- Git version control is essential.`;

    const candidateSkills = [
      { skill: 'Python', status: 'proven' },
      { skill: 'FastAPI', status: 'proven' },
      { skill: 'PostgreSQL', status: 'proven' },
      { skill: 'Git', status: 'partial' }
    ];

    const run1 = analyzeJobMatch(jd, candidateSkills);
    const run2 = analyzeJobMatch(jd, candidateSkills);

    assert.equal(run1.percentage, run2.percentage);
    assert.equal(run1.percentage, 88); // (100 + 100 + 100 + 50) / 400 = 350 / 400 = 87.5% -> 88%
    assert.deepEqual(run1.requiredSkills, run2.requiredSkills);
    assert.deepEqual(run1.matchedSkills, run2.matchedSkills);
    assert.deepEqual(run1.partialSkills, run2.partialSkills);
    assert.deepEqual(run1.gapSkills, run2.gapSkills);
  });

  // TEST 10: Claimed skill must never increase verified match score
  await t.test('10. Claimed skill must NEVER increase verified match score', () => {
    const jd = `Job Title: Cloud & Backend Engineer
Required Qualifications:
- Python is mandatory.
- Docker is required.
- Kubernetes is required.`;

    const candidateVerifiedOnly = [
      { skill: 'Python', status: 'proven' }
    ];

    const candidateWithClaimed = [
      { skill: 'Python', status: 'proven' },
      { skill: 'Docker', status: 'unverified' },
      { skill: 'Kubernetes', status: 'unverified' }
    ];

    const resultVerifiedOnly = analyzeJobMatch(jd, candidateVerifiedOnly);
    const resultWithClaimed = analyzeJobMatch(jd, candidateWithClaimed);

    // Both should yield exactly 33% (100 / 300)
    assert.equal(resultVerifiedOnly.percentage, 33);
    assert.equal(resultWithClaimed.percentage, 33);
    assert.equal(resultWithClaimed.percentage, resultVerifiedOnly.percentage);

    // Claimed skills must not be in matchedSkills or partialSkills
    assert.equal(resultWithClaimed.matchedSkills.length, 1);
    assert.equal(resultWithClaimed.partialSkills.length, 0);
    assert.equal(resultWithClaimed.gapSkills.length, 2);
  });

  // TEST 11: Responsibilities analysis with supporting skills
  await t.test('11. Responsibilities correctly tag supporting verified skills or gaps', () => {
    const jd = `Job Title: Backend Engineer
Key Responsibilities:
- Build and maintain REST APIs using FastAPI and Python.
- Manage relational databases with PostgreSQL.
- Containerize applications with Docker.
Required Qualifications:
- Experience with Python.`;

    const candidateSkills = [
      { skill: 'Python', status: 'proven' },
      { skill: 'FastAPI', status: 'proven' },
      { skill: 'PostgreSQL', status: 'proven' }
      // Docker is missing
    ];

    const result = analyzeJobMatch(jd, candidateSkills);

    assert.ok(result.responsibilities.length >= 3);

    const apiResp = result.responsibilities.find(r => r.responsibility.includes('REST APIs'));
    assert.ok(apiResp);
    assert.equal(apiResp.status, 'supported');
    assert.ok(apiResp.explanation.includes('Supported by'));

    const dbResp = result.responsibilities.find(r => r.responsibility.includes('databases'));
    assert.ok(dbResp);
    assert.equal(dbResp.status, 'supported');
    assert.ok(dbResp.explanation.includes('Supported by PostgreSQL'));

    const dockerResp = result.responsibilities.find(r => r.responsibility.includes('Containerize'));
    assert.ok(dockerResp);
    assert.equal(dockerResp.status, 'gap');
    assert.ok(dockerResp.explanation.includes('Docker evidence not found'));
  });

});
