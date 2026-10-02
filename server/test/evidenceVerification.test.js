import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSkillEvidence } from '../src/services/evidenceAnalyzer.js';
import { 
  createSession, 
  getSession, 
  addSkillToSession, 
  updateSkillEvidence, 
  calculateSessionSummary 
} from '../src/services/sessionStore.js';
import { verifyCandidateIdentity } from '../src/services/identityVerifier.js';

test('Strict Evidence Verification Engine (All 15 Required Scenarios)', async (t) => {

  // SCENARIO 1: Power BI + Power BI certificate -> DIRECT
  await t.test('1. Power BI + Power BI certificate => DIRECT', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Microsoft Certified: Power BI Data Analyst Associate',
      url: 'https://learn.microsoft.com/credentials/certifications/power-bi-data-analyst-associate',
      notes: 'Official Microsoft PL-300 Power BI certification'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(analysis.evidenceItem.verificationStatus, 'proven');
    assert.equal(analysis.evidenceItem.skillMatch, true);
    assert.equal(analysis.evidenceItem.verified, true);
    assert.match(analysis.explanation, /power bi/i);
  });

  // SCENARIO 2: Power BI + Scrum certificate -> UNRELATED
  await t.test('2. Power BI + Scrum certificate => UNRELATED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Certified ScrumMaster (CSM)',
      url: 'https://bcert.me/bc/csm-credential',
      notes: 'Agile Scrum sprint planning and methodology certificate'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.skillMatch, false);
    assert.equal(analysis.evidenceItem.verified, false);
  });

  // SCENARIO 3: Power BI + Python certificate -> UNRELATED
  await t.test('3. Power BI + Python certificate => UNRELATED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Certified Python Developer Certificate',
      url: 'https://pythoninstitute.org/pcap',
      notes: 'PCAP Certified Associate in Python Programming'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.skillMatch, false);
  });

  // SCENARIO 4: Power BI + Java certificate -> UNRELATED
  await t.test('4. Power BI + Java certificate => UNRELATED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Oracle Certified Professional Java Developer',
      url: 'https://oracle.com/cert/java17'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.skillMatch, false);
  });

  // SCENARIO 5: Power BI + Power BI project -> DIRECT
  await t.test('5. Power BI + Power BI project => DIRECT', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'project_url',
      url: 'https://app.powerbi.com/view?r=executive-dashboard-demo',
      notes: 'Production Power BI dashboard report with DAX measures and pbix data model'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(analysis.evidenceItem.verificationStatus, 'proven');
    assert.equal(analysis.evidenceItem.skillMatch, true);
  });

  // SCENARIO 6: Java + Java certificate -> DIRECT
  await t.test('6. Java + Java certificate => DIRECT', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Java',
      evidenceType: 'certificate',
      title: 'Oracle Certified Professional: Java SE 17 Developer',
      url: 'https://catalog-education.oracle.com/pls/certview/sharebadge?id=java17'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'direct');
    assert.equal(analysis.evidenceItem.verificationStatus, 'proven');
    assert.equal(analysis.evidenceItem.skillMatch, true);
  });

  // SCENARIO 7: Java + HTML certificate -> UNRELATED
  await t.test('7. Java + HTML certificate => UNRELATED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Java',
      evidenceType: 'certificate',
      title: 'HTML5 & CSS Responsive Web Design Certificate',
      url: 'https://freecodecamp.org/certification/responsive-web-design'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.skillMatch, false);
  });

  // SCENARIO 8: Git + Scrum certificate -> UNRELATED
  await t.test('8. Git + Scrum certificate => UNRELATED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Git',
      evidenceType: 'certificate',
      title: 'Certified ScrumMaster (CSM)',
      url: 'https://scrumalliance.org/cert/csm',
      notes: 'Certified ScrumMaster credential'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.skillMatch, false);
  });

  // SCENARIO 9: Python + Power BI certificate -> UNRELATED
  await t.test('9. Python + Power BI certificate => UNRELATED', async () => {
    const analysis = await analyzeSkillEvidence({
      skill: 'Python',
      evidenceType: 'certificate',
      title: 'Microsoft Certified: Power BI Data Analyst Associate',
      url: 'https://learn.microsoft.com/credentials/certifications/power-bi'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.skillMatch, false);
  });

  // SCENARIO 10: Candidate name mismatch -> identity mismatch
  await t.test('10. Candidate name mismatch => identity mismatch', async () => {
    // Verified candidate is Swetha Konney, but uploaded document is awarded to Pranav Sharma
    const fakeCertText = 'Certificate of Excellence. This certifies that Pranav Sharma has successfully completed Microsoft Power BI Data Analyst Training on 2024-05-10.';
    const buffer = Buffer.from(fakeCertText, 'utf8');

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: buffer,
      filename: 'PowerBI_Cert.txt',
      candidateName: 'Swetha Konney'
    });

    assert.equal(analysis.evidenceItem.candidateIdentityMatch, false);
    assert.equal(analysis.evidenceItem.evidenceRelevance, 'invalid');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.match(analysis.explanation, /identity does not match the verified candidate/i);
  });

  // SCENARIO 11: Same candidate + unrelated certificate -> identity can match, but SKILL must remain UNVERIFIED
  await t.test('11. Same candidate + unrelated certificate => identity match true, skill UNVERIFIED', async () => {
    const certText = 'This is to certify that Swetha Konney has successfully completed Certified ScrumMaster (CSM) credential on 2024-01-15.';
    const buffer = Buffer.from(certText, 'utf8');

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI', // Target is Power BI
      evidenceType: 'certificate',
      fileBuffer: buffer,
      filename: 'Scrum_Cert.txt',
      candidateName: 'Swetha Konney'
    });

    // Identity matches Swetha Konney
    assert.equal(analysis.evidenceItem.candidateIdentityMatch, true);
    // But skill is UNRELATED and status must remain UNVERIFIED
    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.skillMatch, false);
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
  });

  // SCENARIO 12: Filename says Power BI but content says Scrum -> UNRELATED
  await t.test('12. Filename says Power BI but content says Scrum => UNRELATED (Filename not trusted)', async () => {
    // Filename deceitfully says PowerBI_Certificate.pdf, but content is Scrum
    const scamText = 'Certified ScrumMaster Certificate. Awarded by Scrum Alliance for agile sprint planning and scrum team leadership.';
    const buffer = Buffer.from(scamText, 'utf8');

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: buffer,
      filename: 'PowerBI_Certificate.pdf', // Filename claims Power BI!
      candidateName: 'Swetha Konney'
    });

    // The actual document content is authoritative: must be UNRELATED!
    assert.equal(analysis.evidenceItem.evidenceRelevance, 'unrelated');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.skillMatch, false);
    assert.match(analysis.explanation, /SCRUM.*does not substantiate Power BI/i);
  });

  // SCENARIO 13: Empty PDF -> INVALID
  await t.test('13. Empty PDF => INVALID', async () => {
    const emptyBuffer = Buffer.alloc(0);

    const analysis = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      fileBuffer: emptyBuffer,
      filename: 'empty.pdf'
    });

    assert.equal(analysis.evidenceItem.evidenceRelevance, 'invalid');
    assert.equal(analysis.evidenceItem.verificationStatus, 'unverified');
    assert.equal(analysis.evidenceItem.skillMatch, false);
    assert.match(analysis.explanation, /empty/i);
  });

  // SCENARIO 14: Multiple evidence: Scrum + Power BI -> final Power BI = PROVEN
  await t.test('14. Multiple evidence: Scrum + Power BI => final Power BI = PROVEN', async () => {
    const session = createSession({
      sessionId: 'test_multi_ev_success',
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Power BI', status: 'unverified', claimSource: 'manual' }
      ]
    });

    // Evidence 1: Scrum certificate (unrelated)
    const ev1 = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Scrum Master Certificate'
    });
    assert.equal(ev1.evidenceItem.evidenceRelevance, 'unrelated');
    const { skill: step1Skill } = updateSkillEvidence(session.sessionId, 'Power BI', ev1.evidenceItem, ev1.status, ev1.explanation);
    assert.equal(step1Skill.status, 'unverified');

    // Evidence 2: Power BI certificate (direct)
    const ev2 = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Microsoft Certified: Power BI Data Analyst'
    });
    assert.equal(ev2.evidenceItem.evidenceRelevance, 'direct');
    const { skill: step2Skill } = updateSkillEvidence(session.sessionId, 'Power BI', ev2.evidenceItem, ev2.status, ev2.explanation);

    // Final Power BI is PROVEN because at least one direct valid evidence item exists
    assert.equal(step2Skill.status, 'proven');
    assert.equal(step2Skill.evidence.length, 2);
  });

  // SCENARIO 15: Multiple unrelated evidence: Scrum + Java + Python for Power BI -> final Power BI = UNVERIFIED
  await t.test('15. Multiple unrelated evidence: Scrum + Java + Python for Power BI => final Power BI = UNVERIFIED', async () => {
    const session = createSession({
      sessionId: 'test_multi_unrelated_blocked',
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Power BI', status: 'unverified', claimSource: 'manual' }
      ]
    });

    // Evidence 1: Scrum
    const ev1 = await analyzeSkillEvidence({ skill: 'Power BI', evidenceType: 'certificate', title: 'Scrum Master' });
    updateSkillEvidence(session.sessionId, 'Power BI', ev1.evidenceItem, ev1.status, ev1.explanation);

    // Evidence 2: Java
    const ev2 = await analyzeSkillEvidence({ skill: 'Power BI', evidenceType: 'certificate', title: 'Java Developer' });
    updateSkillEvidence(session.sessionId, 'Power BI', ev2.evidenceItem, ev2.status, ev2.explanation);

    // Evidence 3: Python
    const ev3 = await analyzeSkillEvidence({ skill: 'Power BI', evidenceType: 'certificate', title: 'Python Programming' });
    const { skill: finalSkill } = updateSkillEvidence(session.sessionId, 'Power BI', ev3.evidenceItem, ev3.status, ev3.explanation);

    // Power BI MUST REMAIN UNVERIFIED! Unrelated evidence cannot increase verification status!
    assert.equal(finalSkill.status, 'unverified');
    assert.equal(finalSkill.evidence.length, 3);
  });

  // EXTRA SAFETY TEST: Evidence isolation between skills
  await t.test('16. Skill Isolation: Uploading evidence for Power BI never modifies Python or Java', async () => {
    const session = createSession({
      sessionId: 'test_skill_isolation',
      githubUsername: 'swetha',
      claimedSkills: [
        { skill: 'Python', status: 'proven', claimSource: 'resume' },
        { skill: 'Power BI', status: 'unverified', claimSource: 'manual' },
        { skill: 'Java', status: 'partially_proven', claimSource: 'resume' }
      ]
    });

    const pbiEv = await analyzeSkillEvidence({
      skill: 'Power BI',
      evidenceType: 'project_url',
      url: 'https://app.powerbi.com/view?r=dash',
      notes: 'Interactive Power BI dashboard report with DAX model'
    });

    updateSkillEvidence(session.sessionId, 'Power BI', pbiEv.evidenceItem, pbiEv.status, pbiEv.explanation);

    const s = getSession(session.sessionId);
    assert.equal(s.claimedSkills.find(k => k.skill === 'Power BI').status, 'proven');
    assert.equal(s.claimedSkills.find(k => k.skill === 'Python').status, 'proven');
    assert.equal(s.claimedSkills.find(k => k.skill === 'Java').status, 'partially_proven');
  });

});
