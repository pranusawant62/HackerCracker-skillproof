import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  createSession, 
  getSession, 
  addSkillToSession, 
  deleteSkillFromSession, 
  updateSkillEvidence, 
  calculateSessionSummary 
} from '../src/services/sessionStore.js';
import { matchJobSkills, compareJobWithVerifiedSkills } from '../src/services/jobMatcher.js';
import { generateJobDescription } from '../src/services/jobDescriptionGenerator.js';

describe('Delete Skill Feature - Authoritative Invariants', () => {

  test('Test 1: Add manual skill -> delete skill -> skill no longer exists', () => {
    const session = createSession({
      sessionId: 'sess_del_1',
      candidateName: 'Alice Developer',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' }
      ]
    });

    // Add manual skill Firebase
    const { session: afterAdd, skill: addedSkill } = addSkillToSession('sess_del_1', 'Firebase', 'Databases');
    assert.strictEqual(afterAdd.claimedSkills.length, 2);
    assert.ok(afterAdd.claimedSkills.some(s => s.skill === 'Firebase'));

    // Delete skill Firebase
    const { session: afterDelete, deletedSkill } = deleteSkillFromSession('sess_del_1', addedSkill.id);
    assert.strictEqual(afterDelete.claimedSkills.length, 1);
    assert.strictEqual(afterDelete.claimedSkills[0].skill, 'Python');
    assert.strictEqual(deletedSkill.skill, 'Firebase');
    assert.ok(!afterDelete.claimedSkills.some(s => s.skill === 'Firebase'));
  });

  test('Test 2: Delete a skill with evidence -> skill and its evidence are removed', () => {
    const session = createSession({
      sessionId: 'sess_del_2',
      candidateName: 'Alice Developer',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' }
      ]
    });

    // Add manual skill Docker
    const { skill: dockerSkill } = addSkillToSession('sess_del_2', 'Docker', 'DevOps');

    // Attach evidence to Docker
    updateSkillEvidence('sess_del_2', dockerSkill.id, {
      type: 'project_url',
      title: 'Docker Container Project',
      url: 'https://github.com/alice/dockerized-app',
      evidenceRelevance: 'direct',
      verificationStatus: 'proven',
      confidenceScore: 92,
      observableArtifacts: ['Dockerfile', 'docker-compose.yml'],
      candidateIdentityMatch: true,
      skillMatch: true
    });

    const sessionWithEv = getSession('sess_del_2');
    const dockerBeforeDelete = sessionWithEv.claimedSkills.find(s => s.skill === 'Docker');
    assert.strictEqual(dockerBeforeDelete.status, 'proven');
    assert.strictEqual(dockerBeforeDelete.evidence.length, 1);

    // Delete Docker skill
    const { session: afterDelete, deletedSkill } = deleteSkillFromSession('sess_del_2', dockerSkill.id);
    
    // Skill and its evidence must no longer exist anywhere in session
    assert.ok(!afterDelete.claimedSkills.some(s => s.skill === 'Docker'));
    assert.strictEqual(deletedSkill.skill, 'Docker');
    assert.strictEqual(deletedSkill.evidence.length, 1);

    // Verify session store reflects exact deletion
    const reloaded = getSession('sess_del_2');
    assert.ok(!reloaded.claimedSkills.some(s => s.skill === 'Docker'));
  });

  test('Test 3: Delete Firebase -> Python/SQL/Power BI remain completely unchanged (Skill Isolation)', () => {
    const session = createSession({
      sessionId: 'sess_del_3',
      candidateName: 'Alice Developer',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' },
        { skill: 'SQL', status: 'proven', claimSource: 'resume' }
      ]
    });

    // Add manual skills Power BI and Firebase
    const { skill: powerBiSkill } = addSkillToSession('sess_del_3', 'Power BI', 'Data');
    const { skill: firebaseSkill } = addSkillToSession('sess_del_3', 'Firebase', 'Databases');

    // Add evidence to Power BI
    updateSkillEvidence('sess_del_3', powerBiSkill.id, {
      type: 'project_url',
      title: 'Power BI Dashboard',
      url: 'https://github.com/alice/powerbi-reports',
      evidenceRelevance: 'direct',
      verificationStatus: 'proven',
      confidenceScore: 94,
      observableArtifacts: ['DAX models', 'Power BI dashboard'],
      candidateIdentityMatch: true,
      skillMatch: true
    });

    // Delete only Firebase
    const { session: afterDelete } = deleteSkillFromSession('sess_del_3', 'Firebase');

    // Verify Firebase is gone
    assert.ok(!afterDelete.claimedSkills.some(s => s.skill === 'Firebase'));

    // Verify Python, SQL, and Power BI are untouched
    const python = afterDelete.claimedSkills.find(s => s.skill === 'Python');
    const sql = afterDelete.claimedSkills.find(s => s.skill === 'SQL');
    const powerBi = afterDelete.claimedSkills.find(s => s.skill === 'Power BI');

    assert.ok(python, 'Python must exist');
    assert.strictEqual(python.status, 'proven');
    assert.ok(sql, 'SQL must exist');
    assert.strictEqual(sql.status, 'proven');
    assert.ok(powerBi, 'Power BI must exist');
    assert.strictEqual(powerBi.status, 'proven');
    assert.strictEqual(powerBi.evidence.length, 1);
    assert.strictEqual(powerBi.evidence[0].confidenceScore, 94);
  });

  test('Test 4: Attempt to delete nonexistent skill -> appropriate error', () => {
    createSession({
      sessionId: 'sess_del_4',
      candidateName: 'Alice Developer',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' }
      ]
    });

    assert.throws(() => {
      deleteSkillFromSession('sess_del_4', 'NonExistentSkill');
    }, /Skill not found/i);
  });

  test('Test 5: Invalid/missing session -> appropriate error', () => {
    assert.throws(() => {
      deleteSkillFromSession('', 'Firebase');
    }, /Session ID is required/i);

    assert.throws(() => {
      deleteSkillFromSession('invalid_sess_999', 'Firebase');
    }, /Verification session not found/i);
  });

  test('Test 6: Deleted skill no longer contributes to Job Match Analysis', () => {
    const session = createSession({
      sessionId: 'sess_del_6',
      candidateName: 'Alice Developer',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' }
      ]
    });

    // Add Firebase and prove it
    const { skill: fbSkill } = addSkillToSession('sess_del_6', 'Firebase', 'Databases');
    updateSkillEvidence('sess_del_6', fbSkill.id, {
      type: 'project_url',
      title: 'Firebase Realtime App',
      url: 'https://github.com/alice/firebase-app',
      evidenceRelevance: 'direct',
      verificationStatus: 'proven',
      confidenceScore: 90,
      observableArtifacts: ['firebase.json', 'firestore rules'],
      candidateIdentityMatch: true,
      skillMatch: true
    });

    const jobDescription = 'Looking for Python and Firebase developer';
    
    // Before delete: Firebase is matched
    const beforeMatch = compareJobWithVerifiedSkills({
      verifiedSkills: session.claimedSkills,
      jobDescription
    });
    assert.ok(beforeMatch.matchedSkills.some(s => s.skill.toLowerCase() === 'firebase'));

    // Delete Firebase
    const { session: afterDelete } = deleteSkillFromSession('sess_del_6', 'Firebase');

    // After delete: Firebase must NOT be matched
    const afterMatch = compareJobWithVerifiedSkills({
      verifiedSkills: afterDelete.claimedSkills,
      jobDescription
    });
    assert.ok(!afterMatch.matchedSkills.some(s => s.skill.toLowerCase() === 'firebase'));
  });

  test('Test 7: Deleted skill no longer contributes to Job Description Generator', () => {
    const session = createSession({
      sessionId: 'sess_del_7',
      candidateName: 'Alice Developer',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' }
      ]
    });

    // Add React and prove it
    const { skill: reactSkill } = addSkillToSession('sess_del_7', 'React', 'Frontend');
    updateSkillEvidence('sess_del_7', reactSkill.id, {
      type: 'project_url',
      title: 'React Client',
      url: 'https://github.com/alice/react-client',
      evidenceRelevance: 'direct',
      verificationStatus: 'proven',
      confidenceScore: 95,
      observableArtifacts: ['package.json', 'React components'],
      candidateIdentityMatch: true,
      skillMatch: true
    });

    // Delete React
    const { session: afterDelete } = deleteSkillFromSession('sess_del_7', 'React');

    // Generate JD using current claimedSkills
    const jdResult = generateJobDescription({
      skills: afterDelete.claimedSkills
    });

    // React must not be a required skill for the generated role
    assert.ok(!jdResult.requiredSkills.includes('React'), 'React must not be required once deleted');
  });

  test('Test 8: Authoritative session returns updated summary metrics without page refresh', () => {
    const session = createSession({
      sessionId: 'sess_del_8',
      candidateName: 'Alice Developer',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' }
      ]
    });

    // Add Firebase
    const { skill: fbSkill } = addSkillToSession('sess_del_8', 'Firebase', 'Databases');
    const summaryBefore = calculateSessionSummary(session);
    assert.strictEqual(summaryBefore.total, 2);
    assert.strictEqual(summaryBefore.unverified, 1);

    // Delete Firebase
    const { session: afterDelete } = deleteSkillFromSession('sess_del_8', fbSkill.id);
    const summaryAfter = calculateSessionSummary(afterDelete);

    assert.strictEqual(summaryAfter.total, 1);
    assert.strictEqual(summaryAfter.unverified, 0);
    assert.strictEqual(summaryAfter.proven, 1);
  });

  test('Test 9: Attempt to delete extracted resume skill is blocked with clear error', () => {
    createSession({
      sessionId: 'sess_del_9',
      candidateName: 'Alice Developer',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' }
      ]
    });

    assert.throws(() => {
      deleteSkillFromSession('sess_del_9', 'Python');
    }, /Only manually added skills can be deleted/i);
  });

});
