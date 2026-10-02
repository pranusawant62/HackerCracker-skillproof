import test from 'node:test';
import assert from 'node:assert/strict';
import { getSkillGapDetails, analyzeSkillGaps } from '../src/services/skillGapService.js';

test('Skill Gap Details Service Tests', async (t) => {

  // TEST 1: Docker CLAIMED-ONLY matching prompt specification
  await t.test('1. Docker CLAIMED-ONLY generates expected reason, missing evidence, and micro-task', () => {
    const gap = getSkillGapDetails({
      skill: 'Docker',
      status: 'CLAIMED-ONLY',
      candidateEvidence: {
        skill: 'Docker',
        status: 'unverified'
      }
    });

    assert.equal(gap.skill, 'Docker');
    assert.equal(gap.status, 'CLAIMED-ONLY');
    assert.match(gap.reason, /Docker is claimed but repository evidence was not found/i);
    assert.ok(gap.missingEvidence.some(e => e.includes('Dockerfile')));
    assert.ok(gap.missingEvidence.some(e => e.includes('docker-compose')));
    assert.match(gap.recommendation, /Create a Dockerfile.*PostgreSQL/i);
    assert.equal(gap.estimatedTime, '1–2 hours');
    assert.ok(gap.microTask);
    assert.ok(gap.microTask.steps.length >= 3);
    assert.ok(gap.microTask.steps.some(s => s.includes('Dockerfile')));
  });

  // TEST 2: React PARTIAL matching prompt specification
  await t.test('2. React PARTIAL generates expected reason, missing evidence, and micro-task', () => {
    const gap = getSkillGapDetails({
      skill: 'React',
      status: 'PARTIAL',
      candidateEvidence: {
        skill: 'React',
        status: 'partial',
        repositories: ['web-sample']
      }
    });

    assert.equal(gap.skill, 'React');
    assert.equal(gap.status, 'PARTIAL');
    assert.match(gap.reason, /React evidence exists but is limited/i);
    assert.ok(gap.missingEvidence.some(e => e.includes('React') || e.includes('package.json')));
    assert.match(gap.recommendation, /Build a small React frontend connected to the FastAPI backend/i);
    assert.equal(gap.estimatedTime, '2–3 hours');
    assert.ok(gap.microTask.steps.length >= 3);
  });

  // TEST 3: PROVEN skills are omitted from skill gaps in analyzeSkillGaps
  await t.test('3. PROVEN skills are not treated as skill gaps', () => {
    const verifiedSkills = [
      { skill: 'Python', status: 'PROVEN' },
      { skill: 'FastAPI', status: 'PROVEN' },
      { skill: 'PostgreSQL', status: 'PROVEN' },
      { skill: 'Git', status: 'PROVEN' },
      { skill: 'React', status: 'PARTIAL' },
      { skill: 'Docker', status: 'CLAIMED-ONLY' }
    ];

    const jobDescription = {
      role: 'Python Backend Engineer',
      requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Git', 'Docker']
    };

    const result = analyzeSkillGaps({ verifiedSkills, jobDescription });

    assert.equal(result.success, true);
    assert.equal(result.role, 'Python Backend Engineer');

    // Only Docker (CLAIMED-ONLY) is a gap for the required skills (and React if candidate claimed it)
    const gapSkills = result.skillGaps.map(g => g.skill);
    assert.ok(gapSkills.includes('Docker'));
    assert.ok(!gapSkills.includes('Python'));
    assert.ok(!gapSkills.includes('FastAPI'));
    assert.ok(!gapSkills.includes('PostgreSQL'));
    assert.ok(!gapSkills.includes('Git'));

    const dockerGap = result.skillGaps.find(g => g.skill === 'Docker');
    assert.equal(dockerGap.status, 'CLAIMED-ONLY');
    assert.match(dockerGap.reason, /Docker is claimed but repository evidence was not found/i);
    assert.equal(dockerGap.estimatedTime, '1–2 hours');
  });

  // TEST 4: Job match result input directly into analyzeSkillGaps
  await t.test('4. Directly accepts jobMatchResult object from Job Match Analysis', () => {
    const jobMatchResult = {
      role: 'Senior Backend Engineer',
      score: 80,
      requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Git', 'Docker'],
      matchedSkills: [
        { skill: 'Python', status: 'PROVEN' },
        { skill: 'FastAPI', status: 'PROVEN' },
        { skill: 'PostgreSQL', status: 'PROVEN' },
        { skill: 'Git', status: 'PROVEN' }
      ],
      partialSkills: [],
      skillGaps: [
        { skill: 'Docker', status: 'CLAIMED-ONLY', isClaimed: true }
      ]
    };

    const result = analyzeSkillGaps({ jobMatchResult });

    assert.equal(result.success, true);
    assert.equal(result.role, 'Senior Backend Engineer');
    assert.equal(result.skillGaps.length, 1);
    assert.equal(result.skillGaps[0].skill, 'Docker');
    assert.equal(result.skillGaps[0].status, 'CLAIMED-ONLY');
    assert.ok(result.skillGaps[0].missingEvidence.length > 0);
    assert.ok(result.skillGaps[0].recommendation.length > 0);
    assert.equal(result.skillGaps[0].estimatedTime, '1–2 hours');
  });

  // TEST 5: All required skills proven produces 0 skill gaps
  await t.test('5. Zero skill gaps when all skills are proven', () => {
    const verifiedSkills = [
      { skill: 'Python', status: 'PROVEN' },
      { skill: 'FastAPI', status: 'PROVEN' }
    ];

    const jobDescription = {
      role: 'Python Developer',
      requiredSkills: ['Python', 'FastAPI']
    };

    const result = analyzeSkillGaps({ verifiedSkills, jobDescription });

    assert.equal(result.success, true);
    assert.equal(result.skillGaps.length, 0);
    assert.match(result.summary, /Zero skill gaps detected/i);
  });

});
