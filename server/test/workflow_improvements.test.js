import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  createSession, 
  getSession, 
  addSkillToSession, 
  updateSkillEvidence, 
  calculateSessionSummary,
  normalizeSkillStatus
} from '../src/services/sessionStore.js';
import { analyzeSkillEvidence } from '../src/services/evidenceAnalyzer.js';
import { verifyCandidateIdentity } from '../src/services/identityVerifier.js';

test('SkillProof Verification Workflow Improvements', async (t) => {

  await t.test('1. Simplified Identity Rule: 1 match verifies identity without blocking on secondary mismatches', () => {
    // TEST 1 & TEST 3
    const result = verifyCandidateIdentity({
      resumeIdentity: {
        name: 'Swetha Konney',
        email: 'swetha@gmail.com',
        github: 'https://github.com/swetha',
        githubUsername: 'swetha'
      },
      githubIdentity: {
        username: 'swetha',
        name: 'Different Name', // mismatch
        email: null // unknown
      },
      submittedUsername: 'swetha'
    });

    assert.equal(result.status, 'VERIFIED');
    assert.equal(result.identityStatus, 'verified');
    assert.equal(result.isBlocked, false);
    assert.match(result.reasons[0], /identity verified using available profile evidence/i);
  });

  await t.test('2. Simplified Identity Rule: 0 matches blocks identity verification', () => {
    // TEST 4
    const result = verifyCandidateIdentity({
      resumeIdentity: {
        name: 'Swetha Konney',
        email: 'swetha@gmail.com',
        github: 'https://github.com/swetha',
        githubUsername: 'swetha'
      },
      githubIdentity: {
        username: 'friend123',
        name: 'Alex Friend',
        email: 'alex@friend.org'
      },
      submittedUsername: 'friend123'
    });

    assert.notEqual(result.status, 'VERIFIED');
    assert.equal(result.identityStatus, 'insufficient');
    assert.equal(result.isBlocked, true);
  });

  await t.test('3. Session Creation: Candidate verification session stores identity, skills, and sources', () => {
    const session = createSession({
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Python', category: 'Programming Languages', claimSource: 'resume' },
        { skill: 'FastAPI', category: 'Backend', claimSource: 'resume' }
      ],
      crossVerification: {
        results: [
          { skill: 'Python', status: 'PROVED', explanation: 'Found python files' },
          { skill: 'FastAPI', status: 'UNVERIFIED', explanation: 'No evidence found' }
        ]
      }
    });

    assert.ok(session.sessionId);
    assert.equal(session.identityStatus, 'verified');
    assert.equal(session.githubUsername, 'swetha');
    assert.equal(session.claimedSkills.length, 2);

    const py = session.claimedSkills.find(s => s.skill === 'Python');
    assert.equal(py.status, 'proven');
    assert.equal(py.claimSource, 'resume');

    const fast = session.claimedSkills.find(s => s.skill === 'FastAPI');
    assert.equal(fast.status, 'unverified');
    assert.equal(fast.claimSource, 'resume');
  });

  await t.test('4. Add Skill: Allows manual addition of Power BI with claimSource="manual"', () => {
    // TEST 6 & TEST 7
    const session = createSession({
      sessionId: 'test_session_powerbi',
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Python', category: 'Programming Languages', claimSource: 'resume', status: 'proven' }
      ]
    });

    const { skill, isNew } = addSkillToSession(session.sessionId, 'Power BI', 'Data');

    assert.equal(isNew, true);
    assert.equal(skill.skill, 'Power BI');
    assert.equal(skill.claimSource, 'manual');
    assert.equal(skill.status, 'unverified');
    assert.deepEqual(skill.evidence, []);

    // Session now has 2 skills
    const updatedSession = getSession(session.sessionId);
    assert.equal(updatedSession.claimedSkills.length, 2);
  });

  await t.test('5. Non-blocking verification: Python is Proven while Power BI is Unverified (whole candidate does not fail)', () => {
    // TEST 10
    const session = createSession({
      sessionId: 'test_session_summary',
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' },
        { skill: 'Power BI', status: 'unverified', claimSource: 'manual' }
      ]
    });

    const summary = calculateSessionSummary(session);
    assert.equal(summary.total, 2);
    assert.equal(summary.proven, 1);
    assert.equal(summary.unverified, 1);

    // Python remains proven
    const py = session.claimedSkills.find(s => s.skill === 'Python');
    assert.equal(py.status, 'proven');
  });

  await t.test('6. Evidence Submission: Submitting Power BI project URL analyzes and updates ONLY Power BI to proven', async () => {
    // TEST 8, 9, 11
    const session = createSession({
      sessionId: 'test_session_ev',
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' },
        { skill: 'Power BI', status: 'unverified', claimSource: 'manual' }
      ]
    });

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'project_url',
      url: 'https://github.com/swetha/powerbi-executive-dashboard',
      notes: 'Interactive Power BI dashboard report with DAX measures and data modeling'
    });

    assert.equal(analysis.status, 'proven');
    assert.ok(analysis.evidenceItem);

    // Update skill in session
    const { skill: updatedSkill } = updateSkillEvidence(
      session.sessionId,
      'Power BI',
      analysis.evidenceItem,
      analysis.status,
      analysis.explanation
    );

    assert.equal(updatedSkill.skill, 'Power BI');
    assert.equal(updatedSkill.status, 'proven');
    assert.equal(updatedSkill.evidence.length, 1);

    // Verify Python is untouched
    const currentSession = getSession(session.sessionId);
    const pythonSkill = currentSession.claimedSkills.find(s => s.skill === 'Python');
    assert.equal(pythonSkill.status, 'proven');
  });

  await t.test('7. Multiple Evidence Sources: A skill can accumulate multiple evidence items in an array', async () => {
    // TEST 12
    const session = createSession({
      sessionId: 'test_session_multi_ev',
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Power BI', status: 'unverified', claimSource: 'manual' }
      ]
    });

    // Evidence 1: Project link
    const ev1 = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'project_url',
      url: 'https://app.powerbi.com/view?r=sample-dashboard'
    });
    updateSkillEvidence(session.sessionId, 'Power BI', ev1.evidenceItem, ev1.status, ev1.explanation);

    // Evidence 2: Certificate
    const ev2 = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      url: 'https://learn.microsoft.com/credentials/certifications/power-bi-data-analyst-associate',
      title: 'Microsoft Certified: Power BI Data Analyst'
    });
    updateSkillEvidence(session.sessionId, 'Power BI', ev2.evidenceItem, ev2.status, ev2.explanation);

    const updatedSession = getSession(session.sessionId);
    const pbi = updatedSession.claimedSkills.find(s => s.skill === 'Power BI');
    assert.equal(pbi.evidence.length, 2);
    assert.equal(pbi.status, 'proven');
  });

  await t.test('8. Java Example: Adding Java after initial verification and independently verifying it', async () => {
    // TEST 11 & Java requirement
    const session = createSession({
      sessionId: 'test_session_java',
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' },
        { skill: 'JavaScript', status: 'proven', claimSource: 'resume' }
      ]
    });

    // 1. Candidate adds Java
    const { skill: javaSkill } = addSkillToSession(session.sessionId, 'Java', 'Programming Languages');
    assert.equal(javaSkill.status, 'unverified');

    // 2. Candidate provides Java repo evidence
    const javaAnalysis = await analyzeSkillEvidence({
      skill: 'Java',
      evidenceType: 'github_repo',
      url: 'https://github.com/swetha/springboot-ecommerce-api',
      notes: 'Built with Java 17, Spring Boot, Maven, and PostgreSQL'
    });

    assert.equal(javaAnalysis.status, 'proven');

    // 3. Update Java
    const { skill: updatedJava } = updateSkillEvidence(
      session.sessionId,
      'Java',
      javaAnalysis.evidenceItem,
      javaAnalysis.status,
      javaAnalysis.explanation
    );

    assert.equal(updatedJava.status, 'proven');
    assert.equal(updatedJava.evidence.length, 1);

    // 4. Existing skills remain intact
    const sessionState = getSession(session.sessionId);
    assert.equal(sessionState.claimedSkills.find(s => s.skill === 'Python').status, 'proven');
    assert.equal(sessionState.claimedSkills.find(s => s.skill === 'JavaScript').status, 'proven');
  });

});
