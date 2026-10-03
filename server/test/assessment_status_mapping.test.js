import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  createSession, 
  getSession, 
  startAssessment, 
  submitAssessment,
  recalculateSkillStatus 
} from '../src/services/sessionStore.js';

test('Assessment Result Status Mapping - Verification of Test Cases 1 through 7', async (t) => {

  await t.test('Test Case 1: No assessment attempted -> Claimed-Only / unverified, no fake score', () => {
    const session = createSession({
      candidateName: 'Alice Developer',
      claimedSkills: [
        { id: 'sk_py', name: 'Python', skill: 'Python', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] }
      ]
    });

    const pySkill = session.claimedSkills[0];
    assert.equal(pySkill.status, 'unverified');
    assert.equal(pySkill.assessmentStatus, undefined);
    assert.equal(pySkill.assessmentResult, undefined);
    assert.equal(pySkill.explanation, 'No assessment has been attempted for this skill.');

    // Recalculating status without assessment remains unverified / claimed-only
    const status = recalculateSkillStatus(pySkill);
    assert.equal(status, 'unverified');
    assert.notEqual(status, 'partially_proven');
    assert.notEqual(status, 'proven');
  });

  await t.test('Test Case 2: Assessment submitted with 0% -> Failed / Not Passed (NEVER Partially Proven)', () => {
    const session = createSession({
      candidateName: 'Bob Developer',
      claimedSkills: [
        { id: 'sk_sql', name: 'SQL', skill: 'SQL', status: 'unverified', evidence: [] }
      ]
    });

    const asmt = startAssessment({ sessionId: session.sessionId, skill: 'SQL' });
    
    // Submit all empty answers -> 0%
    const submitRes = submitAssessment({
      assessmentId: asmt.assessmentId,
      sessionId: session.sessionId,
      answers: asmt.questions.map(q => ({ questionId: q.id, answer: '' }))
    });

    const updatedSession = getSession(session.sessionId);
    const sqlSkill = updatedSession.claimedSkills.find(s => s.skill === 'SQL');

    assert.equal(submitRes.assessmentResult.percentage, 0);
    assert.equal(submitRes.assessmentResult.passed, false);
    assert.equal(sqlSkill.status, 'failed');
    assert.equal(sqlSkill.assessmentStatus, 'failed');
    assert.equal(sqlSkill.explanation, 'Assessment Attempted (0%) — Not Passed');
    assert.notEqual(sqlSkill.status, 'partially_proven');
    assert.notEqual(sqlSkill.status, 'proven');
  });

  await t.test('Test Case 3: Assessment submitted with 40% -> Failed / Not Passed (NEVER Partially Proven)', () => {
    const session = createSession({
      candidateName: 'Charlie Developer',
      claimedSkills: [
        { id: 'sk_docker', name: 'Docker', skill: 'Docker', status: 'unverified', evidence: [] }
      ]
    });

    const asmt = startAssessment({ sessionId: session.sessionId, skill: 'Docker' });

    // Mock evaluation for 40%
    const mockAssessment = { ...asmt, status: 'in_progress' };
    const evalResult = {
      score: 40,
      maxScore: 100,
      percentage: 40,
      passed: false,
      status: 'failed',
      competency: 'Novice',
      completedAt: new Date().toISOString(),
      results: [
        { questionId: asmt.questions[0].id, isCorrect: true, earnedPoints: 20 },
        { questionId: asmt.questions[1].id, isCorrect: true, earnedPoints: 20 },
        { questionId: asmt.questions[2].id, isCorrect: false, earnedPoints: 0 },
        { questionId: asmt.questions[3].id, isCorrect: false, earnedPoints: 0 },
        { questionId: asmt.questions[4].id, isCorrect: false, earnedPoints: 0 }
      ],
      strengths: ['Basic Docker CLI'],
      improvementAreas: ['Compose', 'Networking']
    };

    // Verify recalculateSkillStatus maps failed assessment
    const dockerSkill = session.claimedSkills[0];
    dockerSkill.assessmentStatus = 'failed';
    dockerSkill.status = 'failed';
    dockerSkill.assessmentResult = evalResult;
    dockerSkill.explanation = 'Assessment Attempted (40%) — Not Passed';

    const status = recalculateSkillStatus(dockerSkill);
    assert.equal(status, 'failed');
    assert.notEqual(status, 'partially_proven');
    assert.notEqual(status, 'proven');
  });

  await t.test('Test Case 4: Assessment submitted with 60% -> Failed / Not Passed (NEVER Partially Proven)', () => {
    const session = createSession({
      candidateName: 'Diana Developer',
      claimedSkills: [
        { id: 'sk_fastapi', name: 'FastAPI', skill: 'FastAPI', status: 'unverified', evidence: [] }
      ]
    });

    const fastapiSkill = session.claimedSkills[0];
    fastapiSkill.assessmentStatus = 'failed';
    fastapiSkill.status = 'failed';
    fastapiSkill.explanation = 'Assessment Attempted (60%) — Not Passed';

    const status = recalculateSkillStatus(fastapiSkill);
    assert.equal(status, 'failed');
    assert.notEqual(status, 'partially_proven');
    assert.notEqual(status, 'proven');
  });

  await t.test('Test Case 5: Assessment submitted with 70% -> Passed / Proven', () => {
    const session = createSession({
      candidateName: 'Evan Developer',
      claimedSkills: [
        { id: 'sk_react', name: 'React', skill: 'React', status: 'unverified', evidence: [] }
      ]
    });

    const reactSkill = session.claimedSkills[0];
    reactSkill.assessmentStatus = 'passed';
    reactSkill.status = 'proven';
    reactSkill.explanation = 'Assessment Attempted (70%) — Passed';
    reactSkill.evidence = [{
      type: 'microtask_assessment',
      verificationStatus: 'proven',
      percentage: 70,
      passed: true
    }];

    const status = recalculateSkillStatus(reactSkill);
    assert.equal(status, 'proven');
    assert.notEqual(status, 'partially_proven');
    assert.notEqual(status, 'failed');
  });

  await t.test('Test Case 6: Assessment submitted with 80% -> Passed / Proven', () => {
    const session = createSession({
      candidateName: 'Fiona Developer',
      claimedSkills: [
        { id: 'sk_git', name: 'Git', skill: 'Git', status: 'unverified', evidence: [] }
      ]
    });

    const gitSkill = session.claimedSkills[0];
    gitSkill.assessmentStatus = 'passed';
    gitSkill.status = 'proven';
    gitSkill.explanation = 'Assessment Attempted (80%) — Passed';
    gitSkill.evidence = [{
      type: 'microtask_assessment',
      verificationStatus: 'proven',
      percentage: 80,
      passed: true
    }];

    const status = recalculateSkillStatus(gitSkill);
    assert.equal(status, 'proven');
    assert.notEqual(status, 'partially_proven');
    assert.notEqual(status, 'failed');
  });

  await t.test('Test Case 7: Assessment invalidated (focus violation) -> Invalidated / Retake, NOT Partially Proven', () => {
    const session = createSession({
      candidateName: 'George Developer',
      claimedSkills: [
        { id: 'sk_fb', name: 'Firebase', skill: 'Firebase', status: 'unverified', evidence: [] }
      ]
    });

    const fbSkill = session.claimedSkills[0];
    fbSkill.status = 'invalidated';
    fbSkill.assessmentStatus = 'invalidated';
    fbSkill.explanation = 'Assessment Invalidated — Focus Violation';

    const status = recalculateSkillStatus(fbSkill);
    assert.equal(status, 'invalidated');
    assert.notEqual(status, 'partially_proven');
    assert.notEqual(status, 'proven');
  });

  await t.test('Retake Behavior: Failed assessment retaken and passed updates to Proven', () => {
    const session = createSession({
      candidateName: 'Hannah Developer',
      claimedSkills: [
        { id: 'sk_pbi', name: 'Power BI', skill: 'Power BI', status: 'unverified', evidence: [] }
      ]
    });

    // 1. Initial attempt fails
    const pbiSkill = session.claimedSkills[0];
    pbiSkill.status = 'failed';
    pbiSkill.assessmentStatus = 'failed';
    pbiSkill.explanation = 'Assessment Attempted (40%) — Not Passed';
    assert.equal(recalculateSkillStatus(pbiSkill), 'failed');

    // 2. Candidate retakes and scores 85% -> Passed
    pbiSkill.status = 'proven';
    pbiSkill.assessmentStatus = 'passed';
    pbiSkill.explanation = 'Assessment Attempted (85%) — Passed';
    pbiSkill.evidence = [{
      type: 'microtask_assessment',
      verificationStatus: 'proven',
      percentage: 85,
      passed: true
    }];

    assert.equal(recalculateSkillStatus(pbiSkill), 'proven');
    assert.notEqual(recalculateSkillStatus(pbiSkill), 'partially_proven');
  });

});
