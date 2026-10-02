import assert from 'node:assert/strict';

async function runAll20LiveScenarios() {
  console.log('========================================================');
  console.log('VERIFYING ALL 20 MANDATORY ACCEPTANCE SCENARIOS ON LIVE API');
  console.log('========================================================\n');

  function makeMultipart(filename, contentText, username = 'swetha') {
    const boundary = '----Boundary' + Math.random().toString(36).slice(2);
    const contentStream = ['BT', '/F1 12 Tf', '50 720 Td'];
    const lines = contentText.split('\n');
    lines.forEach((line, idx) => {
      if (idx > 0) contentStream.push('0 -20 Td');
      contentStream.push(`(${line.replace(/[\\()]/g, '\\$&')}) Tj`);
    });
    contentStream.push('ET');
    const streamBody = contentStream.join('\n') + '\n';
    const streamLen = Buffer.byteLength(streamBody, 'utf8');
    const pdfBuffer = Buffer.from(
      `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamBody}endstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000241 00000 n \n0000000311 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n500\n%%EOF\n`,
      'utf8'
    );

    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="githubUsername"\r\n\r\n${username}\r\n--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="${filename}"\r\nContent-Type: application/pdf\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, pdfBuffer, footer]);

    return { body, boundary };
  }

  function makeMultipartEvidence(fieldName, filename, contentText, fields = {}) {
    const boundary = '----Boundary' + Math.random().toString(36).slice(2);
    const parts = [];

    for (const [k, v] of Object.entries(fields)) {
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`));
    }

    const fileHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: application/pdf\r\n\r\n`
    );
    const fileBody = Buffer.from(contentText, 'utf8');
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([...parts, fileHeader, fileBody, footer]);

    return { body, boundary };
  }

  // 1. Initial resume session setup
  const resumeText = `Swetha Konney
Email: swetha@gmail.com
GitHub: github.com/swetha

Skills:
SQL
Power BI
Python
Java

Experience:
Database Lead
- Designed normalized PostgreSQL schemas and optimized complex SQL queries using indexes.
- Developed Python backend services with FastAPI.
`;

  const { body: resumeBody, boundary: resumeBoundary } = makeMultipart('swetha_resume.pdf', resumeText);
  const verifyRes = await fetch('http://localhost:5000/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${resumeBoundary}` },
    body: resumeBody
  }).then(r => r.json());

  if (!verifyRes.success) {
    console.error('VERIFY ERROR:', verifyRes);
  }
  assert.equal(verifyRes.success, true);
  const sessionId = verifyRes.sessionId;
  console.log(`[SETUP] Session initialized: ${sessionId}`);

  // CASE 1: SQL + Java certificate -> UNRELATED / UNVERIFIED / 0%
  const c1 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'SQL',
      evidenceType: 'certificate',
      title: 'Java Certificate',
      notes: 'Oracle Certified Professional: Java SE 17 Developer. Spring Boot microservices, multithreading, and JVM internals.'
    })
  }).then(r => r.json());
  assert.equal(c1.evidence.evidenceRelevance, 'unrelated');
  assert.equal(c1.evidence.verificationStatus, 'unverified');
  assert.equal(c1.evidence.confidenceScore, 0);
  console.log('✓ Case 1: SQL + Java certificate -> UNRELATED / UNVERIFIED / 0%');

  // CASE 2: SQL + genuine SQL evidence -> DIRECT / PROVEN / >=75%
  const c2 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'SQL',
      evidenceType: 'certificate',
      title: 'Oracle Database Administrator Certified',
      notes: 'Demonstrated proficiency in SQL queries, CREATE TABLE schemas, JOINs, and database indexing.'
    })
  }).then(r => r.json());
  assert.equal(c2.evidence.evidenceRelevance, 'direct');
  assert.equal(c2.evidence.verificationStatus, 'proven');
  assert.ok(c2.evidence.confidenceScore >= 75);
  console.log(`✓ Case 2: SQL + genuine SQL evidence -> DIRECT / PROVEN / ${c2.evidence.confidenceScore}%`);

  // CASE 3: Firebase + MySQL certificate -> UNRELATED / UNVERIFIED / 0%
  await fetch('http://localhost:5000/api/skills/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, skill: 'Firebase', category: 'Databases' })
  });
  const c3 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Firebase',
      evidenceType: 'certificate',
      title: 'MySQL 8.0 Administrator Certified',
      notes: 'MySQL database backup, clustering, and storage engines.'
    })
  }).then(r => r.json());
  assert.equal(c3.evidence.evidenceRelevance, 'unrelated');
  assert.equal(c3.evidence.verificationStatus, 'unverified');
  assert.equal(c3.evidence.confidenceScore, 0);
  console.log('✓ Case 3: Firebase + MySQL certificate -> UNRELATED / UNVERIFIED / 0%');

  // CASE 4: Firebase + genuine Firebase evidence -> DIRECT / PROVEN / >=75%
  const c4 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Firebase',
      evidenceType: 'certificate',
      title: 'Google Cloud Certified Firebase Developer',
      notes: 'Firestore database, Firebase Auth, and Cloud Functions.'
    })
  }).then(r => r.json());
  assert.equal(c4.evidence.evidenceRelevance, 'direct');
  assert.equal(c4.evidence.verificationStatus, 'proven');
  assert.ok(c4.evidence.confidenceScore >= 75);
  console.log(`✓ Case 4: Firebase + genuine Firebase evidence -> DIRECT / PROVEN / ${c4.evidence.confidenceScore}%`);

  // CASE 5: Power BI + Scrum certificate -> UNRELATED / UNVERIFIED / 0%
  const c5 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Certified ScrumMaster (CSM)',
      notes: 'Agile sprint planning, standups, and retrospective ceremonies.'
    })
  }).then(r => r.json());
  assert.equal(c5.evidence.evidenceRelevance, 'unrelated');
  assert.equal(c5.evidence.verificationStatus, 'unverified');
  assert.equal(c5.evidence.confidenceScore, 0);
  console.log('✓ Case 5: Power BI + Scrum certificate -> UNRELATED / UNVERIFIED / 0%');

  // CASE 6: Power BI + genuine Power BI certificate -> DIRECT / PROVEN / >=75%
  const c6 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Microsoft Certified: Power BI Data Analyst Associate',
      notes: 'DAX expressions, Power Query transformations, and interactive dashboard modeling.'
    })
  }).then(r => r.json());
  assert.equal(c6.evidence.evidenceRelevance, 'direct');
  assert.equal(c6.evidence.verificationStatus, 'proven');
  assert.ok(c6.evidence.confidenceScore >= 75);
  console.log(`✓ Case 6: Power BI + genuine Power BI certificate -> DIRECT / PROVEN / ${c6.evidence.confidenceScore}%`);

  // CASE 7: PowerBI_Certificate.pdf containing Java -> UNRELATED / UNVERIFIED / 0%
  const c7Data = makeMultipartEvidence('file', 'PowerBI_Certificate.pdf', 'Oracle Certified Professional: Java Spring Boot Developer. Backend microservices with Gradle.', {
    sessionId,
    skill: 'Power BI',
    evidenceType: 'certificate',
    title: 'Power BI Evidence (certificate)'
  });
  const c7 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${c7Data.boundary}` },
    body: c7Data.body
  }).then(r => r.json());
  assert.equal(c7.evidence.evidenceRelevance, 'unrelated');
  assert.equal(c7.evidence.verificationStatus, 'unverified');
  assert.equal(c7.evidence.confidenceScore, 0);
  console.log('✓ Case 7: PowerBI_Certificate.pdf containing Java -> UNRELATED / UNVERIFIED / 0%');

  // CASE 8: Empty PDF -> INVALID / UNVERIFIED / 0%
  const c8Data = makeMultipartEvidence('file', 'empty.pdf', '', {
    sessionId,
    skill: 'SQL',
    evidenceType: 'file',
    title: 'Empty document'
  });
  const c8 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${c8Data.boundary}` },
    body: c8Data.body
  }).then(r => r.json());
  assert.equal(c8.evidence.evidenceRelevance, 'invalid');
  assert.equal(c8.evidence.verificationStatus, 'unverified');
  assert.equal(c8.evidence.confidenceScore, 0);
  console.log('✓ Case 8: Empty PDF -> INVALID / UNVERIFIED / 0%');

  // CASE 9: Java + HTML certificate -> UNRELATED / UNVERIFIED / 0%
  const c9 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Java',
      evidenceType: 'certificate',
      title: 'Certified HTML5 & CSS3 Developer',
      notes: 'HTML semantic tags, responsive styling, and web accessibility.'
    })
  }).then(r => r.json());
  assert.equal(c9.evidence.evidenceRelevance, 'unrelated');
  assert.equal(c9.evidence.verificationStatus, 'unverified');
  assert.equal(c9.evidence.confidenceScore, 0);
  console.log('✓ Case 9: Java + HTML certificate -> UNRELATED / UNVERIFIED / 0%');

  // CASE 10: Resume containing only Skills: SQL, Power BI, Python -> all UNVERIFIED
  const resumeOnlyClaims = `John Doe
Email: john@gmail.com
Skills:
SQL
Power BI
Python
Experience:
Cashier - Store
Assisted customers at checkout.`;
  const { body: r10Body, boundary: r10Boundary } = makeMultipart('claims_resume.pdf', resumeOnlyClaims, 'john');
  const v10 = await fetch('http://localhost:5000/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${r10Boundary}` },
    body: r10Body
  }).then(r => r.json());
  v10.claimedSkills.forEach(s => {
    assert.equal(s.status, 'unverified');
  });
  console.log('✓ Case 10: Resume containing only Skills list -> all UNVERIFIED');

  // CASE 11: Resume containing implementation context for SQL -> SQL PROVEN
  const sqlInVerify = verifyRes.claimedSkills.find(s => s.skill === 'SQL');
  assert.equal(sqlInVerify.status, 'proven');
  console.log('✓ Case 11: Resume containing implementation context for SQL -> SQL PROVEN');

  // CASE 12: Manual skill Firebase unverified -> wrong MySQL evidence -> unverified -> correct Firebase evidence -> PROVEN
  const fbSession = await fetch(`http://localhost:5000/api/session/${sessionId}`).then(r => r.json());
  const fbSkill = fbSession.session.claimedSkills.find(s => s.skill === 'Firebase');
  assert.equal(fbSkill.status, 'proven');
  assert.equal(fbSkill.evidence.length >= 2, true);
  console.log('✓ Case 12: Manual skill Firebase accumulates evidence and reaches PROVEN');

  // CASE 13: GitHub repository with only README claiming SQL -> UNVERIFIED
  const c13 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'SQL',
      evidenceType: 'github_repo',
      url: 'https://github.com/swetha/sql-repo',
      notes: 'SQL project'
    })
  }).then(r => r.json());
  assert.equal(c13.evidence.evidenceRelevance, 'unrelated');
  assert.equal(c13.evidence.verificationStatus, 'unverified');
  assert.equal(c13.evidence.confidenceScore, 0);
  console.log('✓ Case 13: GitHub repository with only README claiming SQL -> UNVERIFIED');

  // CASE 14: GitHub repository with actual SQL files and implementation -> PROVEN
  const c14 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'SQL',
      evidenceType: 'github_repo',
      url: 'https://github.com/swetha/analytics-db',
      notes: 'PostgreSQL schema files (.sql) with CREATE TABLE statements, foreign keys, complex queries, and indexing.'
    })
  }).then(r => r.json());
  assert.equal(c14.evidence.evidenceRelevance, 'direct');
  assert.equal(c14.evidence.verificationStatus, 'proven');
  assert.ok(c14.evidence.confidenceScore >= 75);
  console.log(`✓ Case 14: GitHub repository with actual SQL files and implementation -> PROVEN / ${c14.evidence.confidenceScore}%`);

  // CASE 15: Filename spoofing: PowerBI.pdf containing Scrum -> UNRELATED / UNVERIFIED
  const c15Data = makeMultipartEvidence('file', 'PowerBI.pdf', 'Certified ScrumMaster (CSM). Agile sprint planning, standups, and retrospective ceremonies.', {
    sessionId,
    skill: 'Power BI',
    evidenceType: 'certificate'
  });
  const c15 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${c15Data.boundary}` },
    body: c15Data.body
  }).then(r => r.json());
  assert.equal(c15.evidence.evidenceRelevance, 'unrelated');
  assert.equal(c15.evidence.verificationStatus, 'unverified');
  assert.equal(c15.evidence.confidenceScore, 0);
  console.log('✓ Case 15: Filename spoofing: PowerBI.pdf containing Scrum -> UNRELATED / UNVERIFIED');

  // CASE 16: Filename spoofing: SQL.pdf containing Java -> UNRELATED / UNVERIFIED
  const c16Data = makeMultipartEvidence('file', 'SQL.pdf', 'Oracle Certified Professional: Java SE 17 Developer. Spring Boot microservices, multithreading, and JVM.', {
    sessionId,
    skill: 'SQL',
    evidenceType: 'certificate'
  });
  const c16 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${c16Data.boundary}` },
    body: c16Data.body
  }).then(r => r.json());
  assert.equal(c16.evidence.evidenceRelevance, 'unrelated');
  assert.equal(c16.evidence.verificationStatus, 'unverified');
  assert.equal(c16.evidence.confidenceScore, 0);
  console.log('✓ Case 16: Filename spoofing: SQL.pdf containing Java -> UNRELATED / UNVERIFIED');

  // CASE 17: Recipient identity mismatch -> INVALID / UNVERIFIED / 0%
  const c17 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Microsoft Certified: Power BI Data Analyst',
      notes: 'Awarded to Pranav Sharma. Certified in DAX and Power Query.'
    })
  }).then(r => r.json());
  assert.equal(c17.evidence.candidateIdentityMatch, false);
  assert.equal(c17.evidence.evidenceRelevance, 'invalid');
  assert.equal(c17.evidence.verificationStatus, 'unverified');
  assert.equal(c17.evidence.confidenceScore, 0);
  console.log('✓ Case 17: Recipient identity mismatch -> INVALID / UNVERIFIED / 0%');

  // CASE 18: Evidence for Power BI must not modify SQL/Python/Java (Skill Isolation)
  const sessionBeforePbi = await fetch(`http://localhost:5000/api/session/${sessionId}`).then(r => r.json());
  const pyBefore = sessionBeforePbi.session.claimedSkills.find(s => s.skill === 'Python').status;
  const sqlBefore = sessionBeforePbi.session.claimedSkills.find(s => s.skill === 'SQL').status;
  
  await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Power BI',
      evidenceType: 'certificate',
      title: 'Power BI Specialist',
      notes: 'Microsoft Certified: Power BI Data Analyst Associate. DAX expressions, Power Query transformations, and interactive dashboard modeling.'
    })
  });
  const sessionAfterPbi = await fetch(`http://localhost:5000/api/session/${sessionId}`).then(r => r.json());
  const pyAfter = sessionAfterPbi.session.claimedSkills.find(s => s.skill === 'Python').status;
  const sqlAfter = sessionAfterPbi.session.claimedSkills.find(s => s.skill === 'SQL').status;
  assert.equal(pyBefore, pyAfter);
  assert.equal(sqlBefore, sqlAfter);
  console.log('✓ Case 18: Skill isolation confirmed (Python and SQL statuses unchanged)');

  // CASE 19: Dashboard updates immediately after evidence submission
  const c19 = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Firebase',
      evidenceType: 'certificate',
      title: 'Firebase Associate',
      notes: 'Google Cloud Certified Firebase Developer. Firestore and Cloud Functions.'
    })
  }).then(r => r.json());
  assert.equal(c19.success, true);
  assert.ok(c19.session);
  assert.ok(c19.skill);
  assert.equal(c19.skill.status, 'proven');
  const fbInReturnedSession = c19.session.claimedSkills.find(s => s.skill === 'Firebase');
  assert.equal(fbInReturnedSession.status, 'proven');
  console.log('✓ Case 19: Authoritative session and skill returned immediately for reactive dashboard update');

  // CASE 20: Confidence score is visible in evidence item
  assert.ok(typeof c19.evidence.confidenceScore === 'number');
  assert.ok(c19.evidence.confidenceScore >= 75);
  assert.ok(c19.evidence.confidence === 'high');
  console.log(`✓ Case 20: Confidence score visible and calibrated (${c19.evidence.confidenceScore}% — ${c19.evidence.confidence})`);

  console.log('\n========================================================');
  console.log('ALL 20 MANDATORY ACCEPTANCE SCENARIOS PASSED ON LIVE API! 🏆');
  console.log('========================================================\n');
}

runAll20LiveScenarios().catch(err => {
  console.error('LIVE SCENARIOS FAILED:', err);
  process.exit(1);
});
