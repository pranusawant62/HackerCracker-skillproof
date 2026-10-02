import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  createSession, 
  getSession, 
  addSkillToSession, 
  updateSkillEvidence, 
  recalculateSkillStatus,
  calculateSessionSummary 
} from '../src/services/sessionStore.js';
import { analyzeSkillEvidence, extractResumeEvidenceForSkill } from '../src/services/evidenceAnalyzer.js';

test('Status Recalculation & Dashboard Verification Pipeline (Scenarios A through F)', async (t) => {

  // TEST A: MANUAL SKILL CORRECT EVIDENCE
  await t.test('TEST A: Manual skill Power BI starts unverified, becomes proven with valid evidence', async () => {
    const session = createSession({
      sessionId: 'session_test_a',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    // 1. Add skill manually
    const { skill: addedSkill, session: updatedSession } = addSkillToSession(session.sessionId, 'Power BI', 'Data');
    assert.equal(addedSkill.skill, 'Power BI');
    assert.equal(addedSkill.status, 'unverified');
    assert.equal(addedSkill.claimSource, 'manual');
    assert.deepEqual(addedSkill.evidence, []);

    // 2. Submit valid Power BI evidence
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'project_url',
      url: 'https://app.powerbi.com/groups/me/reports/sales-dashboard',
      title: 'Power BI Interactive Sales Report',
      notes: 'Interactive dashboards created using Power BI Desktop, DAX calculations, and Power Query data transformation.',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(analysis.evidenceItem.verificationStatus, 'proven');

    // 3. Update skill evidence in session
    const { skill: updatedSkill, session: finalSession } = updateSkillEvidence(
      session.sessionId,
      addedSkill.id,
      analysis.evidenceItem
    );

    assert.equal(updatedSkill.status, 'proven');
    assert.equal(updatedSkill.evidence.length, 1);
    assert.equal(finalSession.claimedSkills.find(s => s.id === addedSkill.id).status, 'proven');
  });

  // TEST B: MANUAL SKILL WRONG EVIDENCE
  await t.test('TEST B: Manual skill SQL + Scrum certificate remains unverified', async () => {
    const session = createSession({
      sessionId: 'session_test_b',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill: addedSkill } = addSkillToSession(session.sessionId, 'SQL', 'Databases');
    assert.equal(addedSkill.status, 'unverified');

    // Submit Scrum certificate for SQL
    const analysis = await analyzeSkillEvidence({
      skill: 'SQL',
      evidenceType: 'certificate',
      title: 'Certified ScrumMaster (CSM)',
      notes: 'Agile sprint planning, backlog grooming, and scrum leadership credential.',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');

    const { skill: updatedSkill, session: finalSession } = updateSkillEvidence(
      session.sessionId,
      addedSkill.id,
      analysis.evidenceItem
    );

    assert.equal(updatedSkill.status, 'unverified');
    assert.equal(finalSession.claimedSkills.find(s => s.id === addedSkill.id).status, 'unverified');
  });

  // TEST C: RESUME CORRECT EVIDENCE
  await t.test('TEST C: Resume containing real SQL implementation evidence yields proven SQL', async () => {
    const resumeText = `
Swetha Konney
Full Stack & Database Engineer
swetha@gmail.com

Technical Skills:
Python, JavaScript, SQL, PostgreSQL, Docker

Experience:
Senior Software Engineer - Tech Solutions (2022-Present)
- Designed relational database schemas and optimized complex SQL queries with JOINs and indexing in PostgreSQL.
- Authored stored procedures and performance-tuned database schemas handling 50k transactions daily.
`;

    const resumeEv = await extractResumeEvidenceForSkill(resumeText, 'SQL', 'Swetha Konney');
    assert.ok(resumeEv);
    assert.equal(resumeEv.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(resumeEv.evidenceItem.verificationStatus, 'proven');

    const skillObj = {
      id: 'skill_sql_test',
      skill: 'SQL',
      claimSource: 'resume',
      evidence: [resumeEv.evidenceItem]
    };

    const finalStatus = recalculateSkillStatus(skillObj);
    assert.equal(finalStatus, 'proven');
  });

  // TEST D: RESUME CLAIM WITHOUT EVIDENCE
  await t.test('TEST D: Resume claiming Power BI in skills list without supporting evidence remains unverified', async () => {
    const resumeText = `
Swetha Konney
Software Developer
swetha@gmail.com

Skills:
Python, Java, Power BI, HTML, CSS

Experience:
Web Developer - App Corp
- Developed user interfaces in HTML, CSS and JavaScript.
- Built backend APIs using Python and Java.
`;

    const resumeEv = await extractResumeEvidenceForSkill(resumeText, 'Power BI', 'Swetha Konney');
    // Since Power BI was only listed in the "Skills:" list and not in any project/experience description
    assert.equal(resumeEv, null);

    const skillObj = {
      id: 'skill_pbi_test',
      skill: 'Power BI',
      claimSource: 'resume',
      evidence: []
    };

    const finalStatus = recalculateSkillStatus(skillObj);
    assert.equal(finalStatus, 'unverified');
  });

  // TEST E: MANUAL SKILL + MULTIPLE EVIDENCE
  await t.test('TEST E: Firebase with MySQL cert (unrelated) then Firebase cert (direct) updates to proven', async () => {
    const session = createSession({
      sessionId: 'session_test_e',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill: addedSkill } = addSkillToSession(session.sessionId, 'Firebase', 'Backend');
    assert.equal(addedSkill.status, 'unverified');

    // Evidence 1: Unrelated certificate (MySQL)
    const ev1 = await analyzeSkillEvidence({
      skill: 'Firebase',
      evidenceType: 'certificate',
      title: 'MySQL Database Administrator Certified',
      notes: 'Certified in MySQL relational database administration.',
      candidateName: 'Swetha Konney'
    });
    const res1 = updateSkillEvidence(session.sessionId, addedSkill.id, ev1.evidenceItem);
    assert.equal(res1.skill.status, 'unverified');

    // Evidence 2: Direct certificate (Firebase)
    const ev2 = await analyzeSkillEvidence({
      skill: 'Firebase',
      evidenceType: 'certificate',
      title: 'Google Cloud Certified Firebase Developer',
      notes: 'Firestore, Cloud Functions, and Firebase Authentication implementation.',
      candidateName: 'Swetha Konney'
    });
    const res2 = updateSkillEvidence(session.sessionId, addedSkill.id, ev2.evidenceItem);
    assert.equal(res2.skill.status, 'proven');
    assert.equal(res2.session.claimedSkills.find(s => s.id === addedSkill.id).status, 'proven');
  });

  // TEST F: ISOLATION
  await t.test('TEST F: Submitting Power BI evidence leaves Python and SQL untouched', async () => {
    const session = createSession({
      sessionId: 'session_test_f',
      candidateName: 'Swetha Konney',
      claimedSkills: [
        { id: 'sk_py', skill: 'Python', status: 'proven', claimSource: 'resume', evidence: [{ verificationStatus: 'proven', evidenceRelevance: 'direct', candidateIdentityMatch: true, observableArtifacts: ['Python backend codebase'] }] },
        { id: 'sk_pbi', skill: 'Power BI', status: 'unverified', claimSource: 'manual', evidence: [] },
        { id: 'sk_sql', skill: 'SQL', status: 'partially_proven', claimSource: 'resume', evidence: [{ verificationStatus: 'partially_proven', evidenceRelevance: 'partial', candidateIdentityMatch: true, observableArtifacts: ['Database fundamentals'] }] }
      ]
    });

    // Submit valid Power BI evidence
    const pbiAnalysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'project_url',
      url: 'https://app.powerbi.com/view?r=dashboard',
      notes: 'DAX expressions and interactive Power BI report visualization.',
      candidateName: 'Swetha Konney'
    });

    const { session: updatedSession } = updateSkillEvidence(session.sessionId, 'sk_pbi', pbiAnalysis.evidenceItem);

    const py = updatedSession.claimedSkills.find(s => s.id === 'sk_py');
    const pbi = updatedSession.claimedSkills.find(s => s.id === 'sk_pbi');
    const sql = updatedSession.claimedSkills.find(s => s.id === 'sk_sql');

    assert.equal(py.status, 'proven');
    assert.equal(py.evidence.length, 1);

    assert.equal(pbi.status, 'proven');
    assert.equal(pbi.evidence.length, 1);

    assert.equal(sql.status, 'partially_proven');
    assert.equal(sql.evidence.length, 1);
  });
});
