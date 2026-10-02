import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  createSession, 
  getSession, 
  addSkillToSession, 
  updateSkillEvidence, 
  recalculateSkillStatus 
} from '../src/services/sessionStore.js';
import { analyzeSkillEvidence, extractResumeEvidenceForSkill } from '../src/services/evidenceAnalyzer.js';

test('User Mandated Acceptance Tests (TEST 1 to TEST 12)', async (t) => {

  // TEST 1: Target: SQL, Upload: Java certificate -> UNRELATED, UNVERIFIED, confidence 0, NOT PROVEN
  await t.test('TEST 1: Target SQL, upload Java certificate -> UNRELATED, UNVERIFIED', async () => {
    const session = createSession({
      sessionId: 'sess_test_1',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'SQL', 'Databases');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'SQL',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Oracle Certified Professional: Java SE 17 Developer. Spring Boot microservices, multithreading, and JVM internals.'),
      filename: 'Java_Certificate.pdf',
      mimetype: 'text/plain',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'unverified');
  });

  // TEST 2: Target: SQL, Upload: actual SQL project/doc containing queries and schema -> DIRECT, PROVEN, high confidence
  await t.test('TEST 2: Target SQL, upload actual SQL queries and schema -> DIRECT, PROVEN', async () => {
    const session = createSession({
      sessionId: 'sess_test_2',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'SQL', 'Databases');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'SQL',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Oracle Database Administrator Certified. Demonstrated proficiency in SQL queries, CREATE TABLE schemas, JOINs, and database indexing.'),
      filename: 'SQL_Certification.txt',
      mimetype: 'text/plain',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(analysis.evidenceItem.verificationStatus, 'proven');
    assert.ok(analysis.evidenceItem.confidenceScore >= 75);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'proven');
  });

  // TEST 3: Target: Firebase, Upload: MySQL certificate -> UNRELATED, UNVERIFIED
  await t.test('TEST 3: Target Firebase, upload MySQL certificate -> UNRELATED, UNVERIFIED', async () => {
    const session = createSession({
      sessionId: 'sess_test_3',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'Firebase', 'Databases');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'Firebase',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('MySQL 8.0 Database Administrator Certified Professional credential awarded to candidate.'),
      filename: 'MySQL_Cert.pdf',
      mimetype: 'text/plain',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'unverified');
  });

  // TEST 4: Target: Firebase, Upload: actual Firebase certificate/project evidence -> DIRECT, PROVEN
  await t.test('TEST 4: Target Firebase, upload actual Firebase evidence -> DIRECT, PROVEN', async () => {
    const session = createSession({
      sessionId: 'sess_test_4',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'Firebase', 'Databases');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'Firebase',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Google Cloud Certified Firebase Developer. Demonstrated expertise in Firestore database, Firebase Auth, and Cloud Functions.'),
      filename: 'Firebase_Developer_Cert.txt',
      mimetype: 'text/plain',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(analysis.evidenceItem.verificationStatus, 'proven');
    assert.ok(analysis.evidenceItem.confidenceScore >= 75);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'proven');
  });

  // TEST 5: Target: Power BI, Upload: Scrum certificate -> UNRELATED, UNVERIFIED
  await t.test('TEST 5: Target Power BI, upload Scrum certificate -> UNRELATED, UNVERIFIED', async () => {
    const session = createSession({
      sessionId: 'sess_test_5',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'Power BI', 'Data');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Certified Scrum Master (CSM). Agile sprint planning, standups, and retrospective ceremonies.'),
      filename: 'Scrum_Cert.pdf',
      mimetype: 'text/plain',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'unverified');
  });

  // TEST 6: Target: Power BI, Upload: actual Power BI certificate -> DIRECT, PROVEN
  await t.test('TEST 6: Target Power BI, upload actual Power BI certificate -> DIRECT, PROVEN', async () => {
    const session = createSession({
      sessionId: 'sess_test_6',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'Power BI', 'Data');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Microsoft Certified: Power BI Data Analyst Associate. DAX expressions, Power Query transformations, and interactive dashboard modeling.'),
      filename: 'PowerBI_Analyst_Cert.pdf',
      mimetype: 'text/plain',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(analysis.evidenceItem.verificationStatus, 'proven');
    assert.ok(analysis.evidenceItem.confidenceScore >= 75);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'proven');
  });

  // TEST 7: Target: Power BI, Upload file: PowerBI_Certificate.pdf but content is Java -> UNRELATED, UNVERIFIED
  await t.test('TEST 7: Deceptive filename PowerBI_Certificate.pdf with Java content -> UNRELATED, UNVERIFIED', async () => {
    const session = createSession({
      sessionId: 'sess_test_7',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'Power BI', 'Data');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Power BI Evidence (certificate)',
      fileBuffer: Buffer.from('Oracle Certified Professional: Java Spring Boot Developer. Backend microservices with Gradle.'),
      filename: 'PowerBI_Certificate.pdf',
      mimetype: 'text/plain',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'unverified');
  });

  // TEST 8: Target: SQL, Upload empty/corrupt PDF -> INVALID, UNVERIFIED
  await t.test('TEST 8: Target SQL, upload empty/corrupt file -> INVALID, UNVERIFIED', async () => {
    const session = createSession({
      sessionId: 'sess_test_8',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'SQL', 'Databases');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'SQL',
      evidenceType: 'file',
      fileBuffer: Buffer.from(''),
      filename: 'empty.pdf',
      mimetype: 'application/pdf',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'invalid');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'unverified');
  });

  // TEST 9: Target: Java, Upload: HTML certificate -> UNRELATED, UNVERIFIED
  await t.test('TEST 9: Target Java, upload HTML certificate -> UNRELATED, UNVERIFIED', async () => {
    const session = createSession({
      sessionId: 'sess_test_9',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    const { skill } = addSkillToSession(session.sessionId, 'Java', 'Programming Languages');
    assert.equal(skill.status, 'unverified');

    const analysis = await analyzeSkillEvidence({
      skill: 'Java',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Certified HTML5 & CSS3 Web Developer. Semantic HTML layout and styling.'),
      filename: 'HTML_Cert.pdf',
      mimetype: 'text/plain',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);

    const { skill: updatedSkill } = updateSkillEvidence(session.sessionId, skill.id, analysis.evidenceItem);
    assert.equal(updatedSkill.status, 'unverified');
  });

  // TEST 10: Resume contains: Skills: SQL, Power BI, Python (no project evidence) -> All UNVERIFIED
  await t.test('TEST 10: Resume claiming SQL, Power BI, Python in Skills list only -> All UNVERIFIED', async () => {
    const resumeText = `
Swetha Konney
Software Developer
swetha@gmail.com

Skills:
SQL
Power BI
Python

Experience:
Web Developer - Tech Corp
- Built web pages using HTML and CSS.
`;

    const sqlEv = await extractResumeEvidenceForSkill(resumeText, 'SQL', 'Swetha Konney');
    const pbiEv = await extractResumeEvidenceForSkill(resumeText, 'Power BI', 'Swetha Konney');
    const pyEv = await extractResumeEvidenceForSkill(resumeText, 'Python', 'Swetha Konney');

    assert.equal(sqlEv, null);
    assert.equal(pbiEv, null);
    assert.equal(pyEv, null);

    assert.equal(recalculateSkillStatus({ skill: 'SQL', evidence: [] }), 'unverified');
    assert.equal(recalculateSkillStatus({ skill: 'Power BI', evidence: [] }), 'unverified');
    assert.equal(recalculateSkillStatus({ skill: 'Python', evidence: [] }), 'unverified');
  });

  // TEST 11: Resume contains: Designed normalized PostgreSQL schemas and optimized complex SQL queries with indexing -> SQL PROVEN
  await t.test('TEST 11: Resume containing implementation context for SQL -> PROVEN', async () => {
    const resumeText = `
Swetha Konney
Database Engineer
swetha@gmail.com

Experience:
Database Lead - Analytics Co
- Designed normalized PostgreSQL schemas and optimized complex SQL queries with indexing.
`;

    const sqlEv = await extractResumeEvidenceForSkill(resumeText, 'SQL', 'Swetha Konney');
    assert.ok(sqlEv);
    assert.equal(sqlEv.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(sqlEv.evidenceItem.verificationStatus, 'proven');
    assert.ok(sqlEv.evidenceItem.confidenceScore >= 75);

    const status = recalculateSkillStatus({ skill: 'SQL', evidence: [sqlEv.evidenceItem] });
    assert.equal(status, 'proven');
  });

  // TEST 12: Add new skill Firebase -> UNVERIFIED -> Upload wrong evidence -> UNVERIFIED -> Upload correct -> PROVEN
  await t.test('TEST 12: Manual skill Firebase unverified -> wrong evidence unverified -> correct evidence proven', async () => {
    const session = createSession({
      sessionId: 'sess_test_12',
      candidateName: 'Swetha Konney',
      claimedSkills: []
    });

    // 1. Add skill
    const { skill: addedSkill, session: sessionAfterAdd } = addSkillToSession(session.sessionId, 'Firebase', 'Databases');
    assert.equal(addedSkill.status, 'unverified');
    assert.equal(addedSkill.claimSource, 'manual');
    const inList = sessionAfterAdd.claimedSkills.find(s => s.id === addedSkill.id);
    assert.ok(inList);
    assert.equal(inList.status, 'unverified');

    // 2. Upload wrong evidence (MySQL)
    const wrongAnalysis = await analyzeSkillEvidence({
      skill: 'Firebase',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('MySQL 8.0 Administrator Certified.'),
      filename: 'MySQL.pdf',
      candidateName: 'Swetha Konney'
    });
    const { skill: wrongSkill } = updateSkillEvidence(session.sessionId, addedSkill.id, wrongAnalysis.evidenceItem);
    assert.equal(wrongSkill.status, 'unverified');

    // 3. Upload correct evidence (Firebase)
    const rightAnalysis = await analyzeSkillEvidence({
      skill: 'Firebase',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Google Cloud Certified Firebase Developer. Firestore, Cloud Functions, and Firebase Auth.'),
      filename: 'Firebase_Cert.pdf',
      candidateName: 'Swetha Konney'
    });
    const { skill: rightSkill, session: sessionAfterRight } = updateSkillEvidence(session.sessionId, addedSkill.id, rightAnalysis.evidenceItem);
    assert.equal(rightSkill.status, 'proven');
    assert.ok(rightAnalysis.evidenceItem.confidenceScore >= 75);
    const finalInList = sessionAfterRight.claimedSkills.find(s => s.id === addedSkill.id);
    assert.equal(finalInList.status, 'proven');
  });

  // TEST 13: GitHub repository with only README claiming SQL -> UNVERIFIED
  await t.test('TEST 13: GitHub repository with only README claiming SQL -> UNVERIFIED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'SQL',
      evidenceType: 'github_repo',
      url: 'https://github.com/swetha/sql-practice',
      notes: 'SQL project',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);
  });

  // TEST 14: GitHub repository with actual SQL files and implementation -> PROVEN
  await t.test('TEST 14: GitHub repository with actual SQL files and implementation -> PROVEN', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'SQL',
      evidenceType: 'github_repo',
      url: 'https://github.com/swetha/database-migrations',
      notes: 'PostgreSQL database implementation with schema definitions, queries, CREATE TABLE statements, foreign keys, and indexes.',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(analysis.evidenceItem.verificationStatus, 'proven');
    assert.ok(analysis.evidenceItem.confidenceScore >= 75);
  });

  // TEST 15: Filename spoofing: PowerBI.pdf containing Scrum -> UNRELATED / UNVERIFIED
  await t.test('TEST 15: Filename spoofing: PowerBI.pdf containing Scrum -> UNRELATED / UNVERIFIED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Certified ScrumMaster credential. Agile ceremonies, sprints, and backlogs.'),
      filename: 'PowerBI.pdf',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);
  });

  // TEST 16: Filename spoofing: SQL.pdf containing Java -> UNRELATED / UNVERIFIED
  await t.test('TEST 16: Filename spoofing: SQL.pdf containing Java -> UNRELATED / UNVERIFIED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'SQL',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Oracle Certified Professional: Java SE 17 Developer. Spring Boot microservices and JVM.'),
      filename: 'SQL.pdf',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);
  });

  // TEST 17: Identity mismatch -> INVALID / UNVERIFIED / 0%
  await t.test('TEST 17: Recipient identity mismatch -> INVALID / UNVERIFIED / 0%', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Microsoft Certified: Power BI Data Analyst Associate. Awarded to Pranav Sharma.'),
      filename: 'PowerBI_Cert.pdf',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.candidateIdentityMatch, false);
    assert.equal(analysis.evidenceItem.evidenceRelevance, 'invalid');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.confidenceScore, 0);
    assert.equal(analysis.evidenceItem.confidence, 'none');
  });

  // TEST 18: Evidence for Power BI must not modify SQL/Python/Java (Skill Isolation)
  await t.test('TEST 18: Evidence for Power BI must not modify SQL/Python/Java (Skill Isolation)', async () => {
    const session = createSession({
      sessionId: 'sess_test_18',
      candidateName: 'Swetha Konney',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' },
        { skill: 'SQL', status: 'unverified', claimSource: 'resume' },
        { skill: 'Java', status: 'proven', claimSource: 'resume' },
        { skill: 'Power BI', status: 'unverified', claimSource: 'manual' }
      ]
    });

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Microsoft Certified: Power BI Data Analyst Associate. DAX expressions, Power Query transformations, and interactive dashboard modeling.'),
      filename: 'PowerBI_Cert.pdf',
      candidateName: 'Swetha Konney'
    });

    const { session: updatedSession } = updateSkillEvidence(session.sessionId, 'Power BI', analysis.evidenceItem);

    // Verify Power BI is updated to proven
    const pbi = updatedSession.claimedSkills.find(s => s.skill === 'Power BI');
    assert.equal(pbi.status, 'proven');

    // Verify all other skills are completely untouched
    const py = updatedSession.claimedSkills.find(s => s.skill === 'Python');
    assert.equal(py.status, 'proven');

    const sql = updatedSession.claimedSkills.find(s => s.skill === 'SQL');
    assert.equal(sql.status, 'unverified');

    const java = updatedSession.claimedSkills.find(s => s.skill === 'Java');
    assert.equal(java.status, 'proven');
  });

  // TEST 19: Dashboard updates immediately after evidence submission
  await t.test('TEST 19: Dashboard updates immediately after evidence submission', async () => {
    const session = createSession({
      sessionId: 'sess_test_19',
      candidateName: 'Swetha Konney',
      claimedSkills: [
        { skill: 'Firebase', status: 'unverified', claimSource: 'manual' }
      ]
    });

    const analysis = await analyzeSkillEvidence({
      skill: 'Firebase',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Google Cloud Certified Firebase Developer. Firestore and Cloud Functions.'),
      filename: 'Firebase.pdf',
      candidateName: 'Swetha Konney'
    });

    const result = updateSkillEvidence(session.sessionId, 'Firebase', analysis.evidenceItem);

    // Assert that the returned authoritative session reflects the updated skill status immediately
    assert.ok(result.session);
    assert.ok(result.skill);
    assert.equal(result.skill.status, 'proven');

    const skillInSession = result.session.claimedSkills.find(s => s.skill === 'Firebase');
    assert.equal(skillInSession.status, 'proven');
    assert.equal(result.session.updatedAt !== session.createdAt, true);
  });

  // TEST 20: Confidence score is visible in evidence item
  await t.test('TEST 20: Confidence score is visible in evidence item', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: Buffer.from('Microsoft Certified: Power BI Data Analyst Associate. DAX expressions, Power Query transformations, and interactive dashboard modeling.'),
      filename: 'PowerBI_Cert.pdf',
      candidateName: 'Swetha Konney'
    });

    assert.ok(typeof analysis.evidenceItem.confidenceScore === 'number');
    assert.ok(analysis.evidenceItem.confidenceScore >= 75);
    assert.ok(['high', 'medium', 'low', 'none'].includes(analysis.evidenceItem.confidence));
  });

});
