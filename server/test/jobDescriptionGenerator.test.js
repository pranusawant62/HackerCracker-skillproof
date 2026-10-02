import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateJobDescription, 
  determineRoleFromSkills, 
  normalizeSkillsInput 
} from '../src/services/jobDescriptionGenerator.js';
import { parseJobDescription } from '../src/services/jobDescriptionParser.js';
import { matchJobSkills } from '../src/services/jobMatcher.js';

test('Stage 6C: Automatic Job Description Generator Service', async (t) => {

  // TEST 1: User Prompt Example:
  // Python -> PROVEN, FastAPI -> PROVEN, PostgreSQL -> PROVEN, Git -> PROVEN, React -> PARTIAL, Docker -> CLAIMED-ONLY
  // Target Role: Backend Developer
  await t.test('1. Determines Backend Developer from Python + FastAPI + PostgreSQL + Git', () => {
    const inputSkills = [
      { skill: 'Python', status: 'proven' },
      { skill: 'FastAPI', status: 'proven' },
      { skill: 'PostgreSQL', status: 'proven' },
      { skill: 'Git', status: 'proven' },
      { skill: 'React', status: 'partially_proven' },
      { skill: 'Docker', status: 'unverified' }
    ];

    const result = generateJobDescription({ skills: inputSkills });

    assert.equal(result.role, 'Backend Developer');
    assert.ok(result.summary.includes('Backend Developer'));
    assert.ok(result.summary.includes('Python'));

    // Proven skills must anchor the required skills
    assert.ok(result.requiredSkills.includes('Python'));
    assert.ok(result.requiredSkills.includes('FastAPI'));
    assert.ok(result.requiredSkills.includes('PostgreSQL'));
    assert.ok(result.requiredSkills.includes('Git'));

    // Partial and unverified skills must NOT be in requiredSkills
    assert.equal(result.requiredSkills.includes('React'), false);
    assert.equal(result.requiredSkills.includes('Docker'), false);

    // Partial skills must appear in preferredSkills
    assert.ok(result.preferredSkills.includes('React'));

    // Claimed-only Docker must not be treated as proven (appears in preferred or secondary)
    assert.ok(result.preferredSkills.includes('Docker') || result.technologies.includes('Docker'));

    // Responsibilities tailored
    assert.ok(result.responsibilities.length >= 4);
    assert.ok(result.responsibilities.some(r => r.includes('Python')));

    // Formatted JD text contains proper sections
    assert.ok(result.jobDescriptionText.includes('Job Title: Backend Developer'));
    assert.ok(result.jobDescriptionText.includes('Required Qualifications:'));
    assert.ok(result.jobDescriptionText.includes('Preferred Qualifications:'));
  });

  // TEST 2: Frontend Developer profile
  await t.test('2. Determines Frontend Developer from React + TypeScript + CSS + HTML', () => {
    const inputSkills = [
      { skill: 'React', status: 'proven' },
      { skill: 'TypeScript', status: 'proven' },
      { skill: 'CSS', status: 'proven' },
      { skill: 'HTML', status: 'proven' }
    ];

    const result = generateJobDescription({ skills: inputSkills });

    assert.ok(result.role.includes('Frontend'));
    assert.ok(result.requiredSkills.includes('React'));
    assert.ok(result.requiredSkills.includes('TypeScript'));
    assert.ok(result.responsibilities.some(r => r.toLowerCase().includes('frontend') || r.toLowerCase().includes('user interface')));
  });

  // TEST 3: Full-Stack Engineer profile (Both frontend and backend proven)
  await t.test('3. Determines Full-Stack Engineer when both frontend and backend are proven', () => {
    const inputSkills = [
      { skill: 'React', status: 'proven' },
      { skill: 'TypeScript', status: 'proven' },
      { skill: 'Node.js', status: 'proven' },
      { skill: 'PostgreSQL', status: 'proven' }
    ];

    const result = generateJobDescription({ skills: inputSkills });

    assert.equal(result.role, 'Full-Stack Software Engineer');
    assert.ok(result.requiredSkills.includes('React'));
    assert.ok(result.requiredSkills.includes('Node.js'));
    assert.ok(result.requiredSkills.includes('PostgreSQL'));
  });

  // TEST 4: Power BI / Data Analyst profile
  await t.test('4. Determines Data Analyst from Power BI + DAX + SQL', () => {
    const inputSkills = [
      { skill: 'Power BI', status: 'proven' },
      { skill: 'DAX', status: 'proven' },
      { skill: 'SQL', status: 'proven' }
    ];

    const result = generateJobDescription({ skills: inputSkills });

    assert.ok(result.role.includes('Power BI') || result.role.includes('Data Analyst'));
    assert.ok(result.requiredSkills.includes('Power BI'));
    assert.ok(result.responsibilities.some(r => r.includes('dashboard') || r.includes('DAX')));
  });

  // TEST 5: DevOps Engineer profile
  await t.test('5. Determines DevOps Engineer from Docker + Kubernetes + CI/CD', () => {
    const inputSkills = [
      { skill: 'Docker', status: 'proven' },
      { skill: 'Kubernetes', status: 'proven' },
      { skill: 'CI/CD', status: 'proven' }
    ];

    const result = generateJobDescription({ skills: inputSkills });

    assert.ok(result.role.includes('DevOps'));
    assert.ok(result.requiredSkills.includes('Docker'));
    assert.ok(result.requiredSkills.includes('Kubernetes'));
  });

  // TEST 6: Insufficient verified skills returns helpful fallback message
  await t.test('6. Insufficient verified skills returns helpful fallback instead of inventing skills', () => {
    const inputSkills = [
      { skill: 'Python', status: 'unverified' },
      { skill: 'React', status: 'unverified' }
    ];

    const result = generateJobDescription({ skills: inputSkills });

    assert.equal(result.role, 'Insufficient Verified Skills');
    assert.ok(result.summary.includes('No verified technical skills'));
    assert.equal(result.requiredSkills.length, 0);
    assert.ok(result.jobDescriptionText.includes('Pending Verification'));
  });

  // TEST 7: Determinism & Reproducibility
  await t.test('7. Generation is 100% deterministic for identical skill inputs', () => {
    const inputSkills = [
      { skill: 'Python', status: 'proven' },
      { skill: 'FastAPI', status: 'proven' },
      { skill: 'PostgreSQL', status: 'proven' }
    ];

    const run1 = generateJobDescription({ skills: inputSkills });
    const run2 = generateJobDescription({ skills: inputSkills });

    assert.equal(run1.role, run2.role);
    assert.equal(run1.summary, run2.summary);
    assert.deepEqual(run1.requiredSkills, run2.requiredSkills);
    assert.deepEqual(run1.preferredSkills, run2.preferredSkills);
    assert.deepEqual(run1.responsibilities, run2.responsibilities);
    assert.equal(run1.jobDescriptionText, run2.jobDescriptionText);
  });

  // TEST 8: Full pipeline interoperability with parseJobDescription and matchJobSkills
  await t.test('8. Generated job description passes through Stage 6A parser and Stage 6B matcher cleanly', () => {
    const claimedSkills = [
      { skill: 'Python', status: 'proven' },
      { skill: 'FastAPI', status: 'proven' },
      { skill: 'PostgreSQL', status: 'proven' },
      { skill: 'Git', status: 'proven' }
    ];

    const jd = generateJobDescription({ skills: claimedSkills });
    assert.ok(jd.jobDescriptionText.length >= 100);

    // Pass through Stage 6A parser
    const parsed = parseJobDescription(jd.jobDescriptionText);
    assert.ok(parsed.requirements.required.length >= 2);
    assert.ok(parsed.extractedSkills.length >= 3);

    // Pass through Stage 6B matcher
    const match = matchJobSkills({
      claimedSkills,
      crossVerification: {
        results: claimedSkills.map(s => ({ skill: s.skill, status: 'PROVED' }))
      },
      jobRequirements: parsed.requirements
    });

    assert.ok(match.summary.matchPercentage >= 75);
    assert.ok(match.matchedSkills.length >= 2);
  });

});
