import test from 'node:test';
import assert from 'node:assert/strict';
import { compareJobWithVerifiedSkills, normalizeEvidenceStatus } from '../src/services/jobMatcher.js';

test('Automatic Job Match Analysis Service Tests', async (t) => {

  // TEST 1: Exact User Prompt Scenario
  await t.test('1. Exact User Scenario: 4 PROVEN, 1 PARTIAL, 1 CLAIMED-ONLY vs 5 Required Skills', () => {
    // User profile:
    // Python → PROVEN
    // FastAPI → PROVEN
    // PostgreSQL → PROVEN
    // Git → PROVEN
    // React → PARTIAL
    // Docker → CLAIMED-ONLY
    const verifiedSkills = [
      { skill: 'Python', status: 'PROVEN' },
      { skill: 'FastAPI', status: 'PROVEN' },
      { skill: 'PostgreSQL', status: 'PROVEN' },
      { skill: 'Git', status: 'PROVEN' },
      { skill: 'React', status: 'PARTIAL' },
      { skill: 'Docker', status: 'CLAIMED-ONLY' }
    ];

    // Job requires:
    // Python, FastAPI, PostgreSQL, Git, Docker
    const jobDescription = {
      role: 'Python Backend Engineer',
      requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Git', 'Docker']
    };

    const result = compareJobWithVerifiedSkills({ verifiedSkills, jobDescription });

    // Validate Schema
    assert.equal(result.role, 'Python Backend Engineer');
    assert.equal(typeof result.score, 'number');
    assert.equal(Array.isArray(result.requiredSkills), true);
    assert.equal(Array.isArray(result.matchedSkills), true);
    assert.equal(Array.isArray(result.partialSkills), true);
    assert.equal(Array.isArray(result.skillGaps), true);
    assert.equal(typeof result.summary, 'string');

    // Required Skills: 5
    assert.equal(result.requiredSkills.length, 5);
    assert.deepEqual(result.requiredSkills, ['Python', 'FastAPI', 'PostgreSQL', 'Git', 'Docker']);

    // Matched: Python, FastAPI, PostgreSQL, Git
    assert.equal(result.matchedSkills.length, 4);
    const matchedNames = result.matchedSkills.map(s => s.skill);
    assert.deepEqual(matchedNames, ['Python', 'FastAPI', 'PostgreSQL', 'Git']);
    for (const m of result.matchedSkills) {
      assert.equal(m.status, 'PROVEN');
      assert.equal(m.points, 1.0);
    }

    // Partial: 0 (React is not in the required skills for this job)
    assert.equal(result.partialSkills.length, 0);

    // Gap: Docker (CLAIMED-ONLY must NOT count as PROVEN, receives zero credit)
    assert.equal(result.skillGaps.length, 1);
    assert.equal(result.skillGaps[0].skill, 'Docker');
    assert.equal(result.skillGaps[0].status, 'CLAIMED-ONLY');
    assert.equal(result.skillGaps[0].points, 0);
    assert.equal(result.skillGaps[0].isClaimed, true);

    // Score: 4 proven out of 5 required = 4 / 5 = 80%
    assert.equal(result.score, 80);

    // Summary contains clear factual information
    assert.match(result.summary, /4 of 5 required skills \(80%\) are proven/i);
    assert.match(result.summary, /Docker/i);
  });

  // TEST 2: Partial credit scoring (0.5 points)
  await t.test('2. Partial skill yields 0.5 points and appears in partialSkills', () => {
    const verifiedSkills = [
      { skill: 'Python', status: 'PROVEN' },
      { skill: 'FastAPI', status: 'PROVEN' },
      { skill: 'React', status: 'PARTIAL' }
    ];

    const jobDescription = {
      role: 'Full-Stack Developer',
      requiredSkills: ['Python', 'FastAPI', 'React']
    };

    const result = compareJobWithVerifiedSkills({ verifiedSkills, jobDescription });

    assert.equal(result.matchedSkills.length, 2);
    assert.equal(result.partialSkills.length, 1);
    assert.equal(result.partialSkills[0].skill, 'React');
    assert.equal(result.partialSkills[0].status, 'PARTIAL');
    assert.equal(result.partialSkills[0].points, 0.5);
    assert.equal(result.skillGaps.length, 0);

    // (1.0 + 1.0 + 0.5) / 3 = 2.5 / 3 = 83.33% -> 83%
    assert.equal(result.score, 83);
  });

  // TEST 3: NO EVIDENCE missing skill yields 0 points and appears in skillGaps
  await t.test('3. Completely missing skill receives NO EVIDENCE and 0 points', () => {
    const verifiedSkills = [
      { skill: 'Python', status: 'PROVEN' }
    ];

    const jobDescription = {
      role: 'Cloud Architect',
      requiredSkills: ['Python', 'Kubernetes']
    };

    const result = compareJobWithVerifiedSkills({ verifiedSkills, jobDescription });

    assert.equal(result.matchedSkills.length, 1);
    assert.equal(result.partialSkills.length, 0);
    assert.equal(result.skillGaps.length, 1);
    assert.equal(result.skillGaps[0].skill, 'Kubernetes');
    assert.equal(result.skillGaps[0].status, 'NO EVIDENCE');
    assert.equal(result.skillGaps[0].points, 0);
    assert.equal(result.skillGaps[0].isClaimed, false);

    // 1 / 2 = 50%
    assert.equal(result.score, 50);
  });

  // TEST 4: Job description as formatted text string
  await t.test('4. Job description passed as raw text string extracts role and skills', () => {
    const jdText = `Role: Senior Backend Engineer
Required Skills:
- Python is mandatory
- FastAPI microservices
- PostgreSQL databases
- Docker containerization`;

    const verifiedSkills = [
      { skill: 'Python', status: 'PROVEN' },
      { skill: 'FastAPI', status: 'PROVEN' },
      { skill: 'PostgreSQL', status: 'PROVEN' },
      { skill: 'Docker', status: 'CLAIMED-ONLY' }
    ];

    const result = compareJobWithVerifiedSkills({
      verifiedSkills,
      jobDescription: jdText
    });

    assert.equal(result.role, 'Senior Backend Engineer');
    assert.equal(result.matchedSkills.length, 3);
    assert.equal(result.skillGaps.length, 1);
    assert.equal(result.skillGaps[0].skill, 'Docker');
    // 3 / 4 = 75%
    assert.equal(result.score, 75);
  });

  // TEST 5: Status normalization helper
  await t.test('5. normalizeEvidenceStatus handles all case variations and synonyms', () => {
    assert.equal(normalizeEvidenceStatus('PROVEN'), 'PROVEN');
    assert.equal(normalizeEvidenceStatus('proven'), 'PROVEN');
    assert.equal(normalizeEvidenceStatus('PROVED'), 'PROVEN');
    assert.equal(normalizeEvidenceStatus('PARTIAL'), 'PARTIAL');
    assert.equal(normalizeEvidenceStatus('partially_proven'), 'PARTIAL');
    assert.equal(normalizeEvidenceStatus('CLAIMED-ONLY'), 'CLAIMED-ONLY');
    assert.equal(normalizeEvidenceStatus('CLAIMED_ONLY'), 'CLAIMED-ONLY');
    assert.equal(normalizeEvidenceStatus('claimed'), 'CLAIMED-ONLY');
    assert.equal(normalizeEvidenceStatus('unverified'), 'CLAIMED-ONLY');
    assert.equal(normalizeEvidenceStatus('NO EVIDENCE'), 'NO EVIDENCE');
    assert.equal(normalizeEvidenceStatus('missing'), 'NO EVIDENCE');
  });

});
