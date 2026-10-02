import test from 'node:test';
import assert from 'node:assert/strict';
import { matchJobSkills, normalizeJobRequirements, getCanonicalSkillName } from '../src/services/jobMatcher.js';

test('Stage 6B: Job Match Engine Service', async (t) => {
  await t.test('1. all required skills proved yields 100% match', () => {
    const jobRequirements = {
      required: [{ skill: 'Python' }, { skill: 'React' }],
      preferred: []
    };
    const crossVerification = {
      results: [
        { skill: 'Python', status: 'PROVED', explanation: 'Direct proof in repos', repositories: [{ name: 'api' }] },
        { skill: 'React', status: 'PROVED', explanation: 'Direct proof in package.json', repositories: [{ name: 'frontend' }] }
      ]
    };

    const res = matchJobSkills({ crossVerification, jobRequirements });
    assert.equal(res.summary.totalRequired, 2);
    assert.equal(res.summary.matched, 2);
    assert.equal(res.summary.partial, 0);
    assert.equal(res.summary.gaps, 0);
    assert.equal(res.summary.matchPercentage, 100);
    assert.equal(res.matchedSkills.length, 2);
  });

  await t.test('2. mixed proved/partial/unverified calculates weighted score correctly', () => {
    // 1 Proved (1.0) + 1 Partial (0.6) + 1 Unverified (0) = 1.6 / 3 = 53.33% -> 53%
    const jobRequirements = {
      required: ['Python', 'JavaScript', 'Docker']
    };
    const crossVerification = {
      results: [
        { skill: 'Python', status: 'PROVED', repositories: [{ name: 'py-app' }] },
        { skill: 'JavaScript', status: 'PARTIAL', repositories: [{ name: 'web' }] },
        { skill: 'Docker', status: 'UNVERIFIED', repositories: [] }
      ]
    };

    const res = matchJobSkills({ crossVerification, jobRequirements });
    assert.equal(res.summary.totalRequired, 3);
    assert.equal(res.summary.matched, 1);
    assert.equal(res.summary.partial, 1);
    assert.equal(res.summary.gaps, 1);
    assert.equal(res.summary.matchPercentage, 53);
    assert.equal(res.matchedSkills[0].skill, 'Python');
    assert.equal(res.partialSkills[0].skill, 'JavaScript');
    assert.equal(res.skillGaps[0].skill, 'Docker');
    assert.equal(res.skillGaps[0].isClaimedOnResume, true);
  });

  await t.test('3. all required skills unverified yields 0% match and marks unverified claims', () => {
    const jobRequirements = {
      required: ['Rust', 'Kubernetes']
    };
    const claimedSkills = [
      { skill: 'Rust' },
      { skill: 'Kubernetes' }
    ];
    const crossVerification = {
      results: [
        { skill: 'Rust', status: 'UNVERIFIED' },
        { skill: 'Kubernetes', status: 'UNVERIFIED' }
      ]
    };

    const res = matchJobSkills({ claimedSkills, crossVerification, jobRequirements });
    assert.equal(res.summary.totalRequired, 2);
    assert.equal(res.summary.matched, 0);
    assert.equal(res.summary.partial, 0);
    assert.equal(res.summary.gaps, 2);
    assert.equal(res.summary.matchPercentage, 0);
    assert.match(res.skillGaps[0].explanation, /Claimed on resume, but not supported/i);
  });

  await t.test('4. preferred skills are calculated separately and do not inflate required score', () => {
    // Required: Docker (Gap = 0%). Preferred: Python (Proved), FastAPI (Proved).
    // Score must be 0%, not inflated by preferred skills!
    const jobRequirements = {
      required: ['Docker'],
      preferred: ['Python', 'FastAPI']
    };
    const crossVerification = {
      results: [
        { skill: 'Python', status: 'PROVED', repositories: [{ name: 'api' }] },
        { skill: 'FastAPI', status: 'PROVED', repositories: [{ name: 'api' }] }
      ]
    };

    const res = matchJobSkills({ crossVerification, jobRequirements });
    assert.equal(res.summary.totalRequired, 1);
    assert.equal(res.summary.matchPercentage, 0);
    assert.equal(res.summary.gaps, 1);
    assert.equal(res.summary.totalPreferred, 2);
    assert.equal(res.preferredSkills.length, 2);
    assert.equal(res.preferredSkills[0].matchStatus, 'MATCHED');
    assert.equal(res.preferredSkills[1].matchStatus, 'MATCHED');
  });

  await t.test('5. handles skill aliases (JS -> JavaScript, Postgres -> PostgreSQL)', () => {
    const jobRequirements = {
      required: ['JS', 'Postgres', 'TS']
    };
    const crossVerification = {
      results: [
        { skill: 'JavaScript', status: 'PROVED' },
        { skill: 'PostgreSQL', status: 'PROVED' },
        { skill: 'TypeScript', status: 'PARTIAL' }
      ]
    };

    const res = matchJobSkills({ crossVerification, jobRequirements });
    assert.equal(res.summary.totalRequired, 3);
    assert.equal(res.summary.matched, 2);
    assert.equal(res.summary.partial, 1);
    assert.equal(res.matchedSkills[0].skill, 'JavaScript');
    assert.equal(res.matchedSkills[1].skill, 'PostgreSQL');
    assert.equal(res.partialSkills[0].skill, 'TypeScript');
  });

  await t.test('6. handles duplicate requirements without inflating counts', () => {
    const jobRequirements = {
      required: ['Python', 'Python', { skill: 'Python' }, 'React', 'React']
    };
    const crossVerification = {
      results: [
        { skill: 'Python', status: 'PROVED' },
        { skill: 'React', status: 'PROVED' }
      ]
    };

    const res = matchJobSkills({ crossVerification, jobRequirements });
    assert.equal(res.summary.totalRequired, 2);
    assert.equal(res.summary.matched, 2);
    assert.equal(res.summary.matchPercentage, 100);
  });

  await t.test('7. handles empty requirements gracefully', () => {
    const res = matchJobSkills({
      crossVerification: { results: [{ skill: 'Python', status: 'PROVED' }] },
      jobRequirements: { required: [], preferred: [] }
    });

    assert.equal(res.summary.totalRequired, 0);
    assert.equal(res.summary.matchPercentage, 0);
    assert.equal(res.summary.matched, 0);
    assert.equal(res.matchedSkills.length, 0);
  });

  await t.test('8. handles missing/null verification data without throwing errors', () => {
    const res = matchJobSkills({
      claimedSkills: null,
      crossVerification: null,
      jobRequirements: { required: ['Python', 'Docker'] }
    });

    assert.equal(res.summary.totalRequired, 2);
    assert.equal(res.summary.matched, 0);
    assert.equal(res.summary.gaps, 2);
    assert.equal(res.summary.matchPercentage, 0);
    assert.equal(res.skillGaps[0].status, 'MISSING');
    assert.equal(res.skillGaps[0].isClaimedOnResume, false);
  });

  await t.test('9. required-over-preferred precedence: if a skill is in both, treated as required', () => {
    const jobRequirements = {
      required: ['Python'],
      preferred: ['Python', 'Docker']
    };
    const crossVerification = {
      results: [
        { skill: 'Python', status: 'PROVED' },
        { skill: 'Docker', status: 'PROVED' }
      ]
    };

    const res = matchJobSkills({ crossVerification, jobRequirements });
    assert.equal(res.summary.totalRequired, 1);
    assert.equal(res.summary.totalPreferred, 1); // only Docker in preferred
    assert.equal(res.summary.matched, 1);
    assert.equal(res.preferredSkills[0].skill, 'Docker');
  });

  await t.test('10. deterministic score calculation adheres to PROVED=1.0 and PARTIAL=0.6', () => {
    // 2 Proved (2.0) + 1 Partial (0.6) out of 4 = 2.6 / 4 = 65%
    const jobRequirements = {
      required: ['SkillA', 'SkillB', 'SkillC', 'SkillD']
    };
    const crossVerification = {
      results: [
        { skill: 'SkillA', status: 'PROVED' },
        { skill: 'SkillB', status: 'PROVED' },
        { skill: 'SkillC', status: 'PARTIAL' },
        { skill: 'SkillD', status: 'UNVERIFIED' }
      ]
    };

    const res = matchJobSkills({ crossVerification, jobRequirements });
    assert.equal(res.summary.totalRequired, 4);
    assert.equal(res.summary.matched, 2);
    assert.equal(res.summary.partial, 1);
    assert.equal(res.summary.gaps, 1);
    assert.equal(res.summary.matchPercentage, 65);
  });
});
