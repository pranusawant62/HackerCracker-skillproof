import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSkillProgress, calculateSkillGrowth } from '../src/services/skillGrowthService.js';

test('Skill Growth System Tests', async (t) => {

  // TEST 1: Exact User Scenario - Progress calculation per status
  await t.test('1. Exact User Scenario: Proven (high), Partial (medium), Claimed-Only (low)', () => {
    const verifiedSkills = [
      { skill: 'Python', status: 'PROVEN', repositories: ['api', 'cli'], evidence: [{ confidenceScore: 95 }] },
      { skill: 'FastAPI', status: 'PROVEN', repositories: ['api'], evidence: [{ confidenceScore: 92 }] },
      { skill: 'PostgreSQL', status: 'PROVEN', repositories: ['db-models'], evidence: [{ confidenceScore: 90 }] },
      { skill: 'React', status: 'PARTIAL', repositories: ['web-frontend'] },
      { skill: 'Docker', status: 'CLAIMED-ONLY' }
    ];

    const jobDescription = {
      role: 'Full-Stack Developer',
      requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'React', 'Docker']
    };

    const growth = calculateSkillGrowth({ verifiedSkills, jobDescription });

    assert.equal(growth.success, true);
    assert.equal(growth.role, 'Full-Stack Developer');
    assert.equal(typeof growth.overallCoverage, 'number');
    assert.ok(growth.overallCoverage >= 65 && growth.overallCoverage <= 85);

    // Validate individual skill progress
    const python = growth.skills.find(s => s.skill === 'Python');
    const fastApi = growth.skills.find(s => s.skill === 'FastAPI');
    const postgres = growth.skills.find(s => s.skill === 'PostgreSQL');
    const react = growth.skills.find(s => s.skill === 'React');
    const docker = growth.skills.find(s => s.skill === 'Docker');

    assert.ok(python, 'Python should be present');
    assert.ok(fastApi, 'FastAPI should be present');
    assert.ok(postgres, 'PostgreSQL should be present');
    assert.ok(react, 'React should be present');
    assert.ok(docker, 'Docker should be present');

    // High progress for PROVEN
    assert.ok(python.progress >= 85, `Python progress should be high (>=85), got ${python.progress}`);
    assert.ok(fastApi.progress >= 80, `FastAPI progress should be high (>=80), got ${fastApi.progress}`);
    assert.ok(postgres.progress >= 80, `PostgreSQL progress should be high (>=80), got ${postgres.progress}`);

    // Medium progress for PARTIAL
    assert.ok(react.progress >= 45 && react.progress <= 65, `React progress should be medium (45-65), got ${react.progress}`);

    // Low progress for CLAIMED-ONLY
    assert.ok(docker.progress >= 20 && docker.progress <= 35, `Docker progress should be low (20-35), got ${docker.progress}`);

    // Needs improvement checks
    assert.equal(python.needsImprovement, false);
    assert.equal(react.needsImprovement, true);
    assert.equal(docker.needsImprovement, true);

    // Recommendations generated
    assert.ok(growth.recommendations.length >= 3);
    assert.ok(growth.recommendations.some(r => r.includes('Docker')));
    assert.ok(growth.recommendations.some(r => r.includes('React')));
    assert.ok(growth.recommendations.some(r => r.includes('PostgreSQL')));
  });

  // TEST 2: calculateSkillProgress helper function invariants
  await t.test('2. calculateSkillProgress enforces evidence level tiers', () => {
    const provenProgress = calculateSkillProgress({ skill: 'Go', status: 'PROVEN' });
    assert.ok(provenProgress.progress >= 80 && provenProgress.progress <= 95);
    assert.equal(provenProgress.currentLevel, 'Verified / High');

    const partialProgress = calculateSkillProgress({ skill: 'Vue', status: 'PARTIAL' });
    assert.ok(partialProgress.progress >= 45 && partialProgress.progress <= 65);
    assert.equal(partialProgress.currentLevel, 'Partial Evidence');

    const claimedProgress = calculateSkillProgress({ skill: 'Terraform', status: 'CLAIMED-ONLY' });
    assert.ok(claimedProgress.progress >= 20 && claimedProgress.progress <= 30);
    assert.equal(claimedProgress.currentLevel, 'Claimed Only');

    const missingProgress = calculateSkillProgress({ skill: 'Rust', status: 'NO EVIDENCE' });
    assert.equal(missingProgress.progress, 0);
    assert.equal(missingProgress.currentLevel, 'No Evidence');
  });

  // TEST 3: All proven produces high overall coverage
  await t.test('3. All proven skills produces >= 85% overall coverage', () => {
    const verifiedSkills = [
      { skill: 'Python', status: 'PROVEN' },
      { skill: 'FastAPI', status: 'PROVEN' }
    ];

    const jobDescription = {
      role: 'Backend Engineer',
      requiredSkills: ['Python', 'FastAPI']
    };

    const growth = calculateSkillGrowth({ verifiedSkills, jobDescription });
    assert.ok(growth.overallCoverage >= 80);
    assert.equal(growth.skillsNeedingImprovement.length, 0);
  });

});
