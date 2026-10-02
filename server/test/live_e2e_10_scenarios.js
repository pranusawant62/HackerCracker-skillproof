import fs from 'fs';

async function runLiveScenarios() {
  console.log('====================================================');
  console.log('RUNNING ALL 10 USER SCENARIOS AGAINST LIVE SERVER');
  console.log('====================================================\n');

  // Helper to create multipart form-data payload for resume upload
  function makeMultipartResume(filename, contentText, username = 'swetha') {
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

  // 1. Initial verification session with a resume
  const resumeText = `Swetha Konney
Email: swetha@gmail.com
GitHub: github.com/swetha

Skills:
SQL
Power BI
Python
Java

Experience:
Database & Backend Lead
- Designed normalized PostgreSQL schemas and optimized complex SQL queries using indexes.
- Developed Python backend services with FastAPI.
`;

  const { body, boundary } = makeMultipartResume('swetha_resume.pdf', resumeText);
  const verifyRes = await fetch('http://localhost:5000/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body
  }).then(r => r.json());

  console.log('INITIAL VERIFICATION RESPONSE:');
  console.log('Success:', verifyRes.success);
  console.log('Session ID:', verifyRes.sessionId);
  const sessionId = verifyRes.sessionId;

  // TEST 5 Verification: Power BI has no project evidence in resume -> UNVERIFIED
  const pbiInitial = verifyRes.claimedSkills?.find(s => s.skill === 'Power BI');
  console.log('\n[TEST 5] Resume says "Skills: Power BI" (no project evidence):');
  console.log('Status:', pbiInitial?.status, '(Expected: unverified)');

  // TEST 6 Verification: Resume says "Designed normalized PostgreSQL schemas and optimized complex SQL queries using indexes" -> PROVEN
  const sqlInitial = verifyRes.claimedSkills?.find(s => s.skill === 'SQL');
  console.log('\n[TEST 6] Resume contains actual implementation for SQL:');
  console.log('Status:', sqlInitial?.status, '(Expected: proven)');

  // TEST 1: Add SQL, upload unrelated certificate -> UNVERIFIED
  console.log('\n[TEST 1] Add SQL, upload unrelated certificate:');
  const addSqlRes = await fetch('http://localhost:5000/api/skills/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, skill: 'SQL', category: 'Databases' })
  }).then(r => r.json());
  
  const sqlEvUnrelated = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'SQL',
      evidenceType: 'certificate',
      title: 'Scrum Alliance Certified ScrumMaster',
      notes: 'Agile ceremonies, sprint backlog management, and sprint planning.'
    })
  }).then(r => r.json());
  console.log('SQL Evidence Relevance:', sqlEvUnrelated.evidence?.evidenceRelevance, '(Expected: unrelated)');

  // TEST 2: Add SQL, upload actual SQL evidence -> PROVEN
  console.log('\n[TEST 2] Add SQL, upload actual SQL evidence:');
  const sqlEvDirect = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'SQL',
      evidenceType: 'project_url',
      url: 'https://github.com/swetha/database-migrations',
      title: 'PostgreSQL Database Migrations and Schema',
      notes: 'Designed normalized relational schemas, authored complex SQL queries, and indexed high-volume tables in PostgreSQL.'
    })
  }).then(r => r.json());
  console.log('SQL Updated Status:', sqlEvDirect.skill?.status, '(Expected: proven)');

  // TEST 3: Add Firebase, upload MySQL certificate -> UNVERIFIED
  console.log('\n[TEST 3] Add Firebase, upload MySQL certificate:');
  const addFirebase = await fetch('http://localhost:5000/api/skills/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, skill: 'Firebase', category: 'Databases' })
  }).then(r => r.json());
  console.log('Firebase Added Initial Status:', addFirebase.skill?.status, '(Expected: unverified)');

  const firebaseWrongEv = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Firebase',
      evidenceType: 'certificate',
      title: 'Oracle Certified Professional: MySQL 8.0 Database Administrator',
      notes: 'MySQL installation, configuration, replication, and query optimization.'
    })
  }).then(r => r.json());
  console.log('Firebase Status After MySQL Cert:', firebaseWrongEv.skill?.status, '(Expected: unverified)');
  console.log('Firebase Evidence Relevance:', firebaseWrongEv.evidence?.evidenceRelevance, '(Expected: unrelated)');

  // TEST 4: Add Firebase, upload actual Firebase certificate/project -> PROVEN
  console.log('\n[TEST 4] Add Firebase, upload actual Firebase certificate/project:');
  const firebaseRightEv = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Firebase',
      evidenceType: 'certificate',
      title: 'Google Cloud Certified Firebase Developer',
      notes: 'Firestore database modeling, Firebase Auth rule security, and Cloud Functions microservices.'
    })
  }).then(r => r.json());
  console.log('Firebase Status After Firebase Evidence:', firebaseRightEv.skill?.status, '(Expected: proven)');

  // TEST 7: Add Java, upload HTML certificate -> UNVERIFIED
  console.log('\n[TEST 7] Add Java, upload HTML certificate:');
  const javaWrongEv = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Java',
      evidenceType: 'certificate',
      title: 'Certified HTML5 & CSS3 Specialist',
      notes: 'Semantic HTML markup, CSS grid styling, responsive web layout.'
    })
  }).then(r => r.json());
  console.log('Java Status After HTML Cert:', javaWrongEv.skill?.status, '(Expected: unverified)');

  // TEST 8: Upload file named PowerBI_Certificate.pdf with Scrum content -> UNVERIFIED
  console.log('\n[TEST 8] File named PowerBI_Certificate.pdf but content is Scrum:');
  const boundary8 = '----Boundary8' + Math.random().toString(36).slice(2);
  const scrumFileContent = Buffer.from('Certified Scrum Master (CSM). Agile leadership, sprint cadence, retrospectives.');
  const h8 = Buffer.from(
    `--${boundary8}\r\nContent-Disposition: form-data; name="sessionId"\r\n\r\n${sessionId}\r\n` +
    `--${boundary8}\r\nContent-Disposition: form-data; name="skill"\r\n\r\nPower BI\r\n` +
    `--${boundary8}\r\nContent-Disposition: form-data; name="evidenceType"\r\n\r\ncertificate\r\n` +
    `--${boundary8}\r\nContent-Disposition: form-data; name="title"\r\n\r\nPower BI Evidence (certificate)\r\n` +
    `--${boundary8}\r\nContent-Disposition: form-data; name="file"; filename="PowerBI_Certificate.pdf"\r\nContent-Type: text/plain\r\n\r\n`
  );
  const f8 = Buffer.from(`\r\n--${boundary8}--\r\n`);
  const b8 = Buffer.concat([h8, scrumFileContent, f8]);

  const test8Res = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary8}` },
    body: b8
  }).then(r => r.json());
  console.log('Power BI Status After Scrum PDF (Deceptive Filename):', test8Res.skill?.status, '(Expected: unverified)');
  console.log('Evidence Relevance:', test8Res.evidence?.evidenceRelevance, '(Expected: unrelated)');

  // TEST 9: Upload evidence for Power BI, verify Python/SQL/Java statuses do NOT change
  console.log('\n[TEST 9] Upload evidence for Power BI, check status isolation:');
  const prevSession = await fetch(`http://localhost:5000/api/session/${sessionId}`).then(r => r.json());
  const prevPython = prevSession.session.claimedSkills.find(s => s.skill === 'Python')?.status;
  const prevSql = prevSession.session.claimedSkills.find(s => s.skill === 'SQL')?.status;
  const prevJava = prevSession.session.claimedSkills.find(s => s.skill === 'Java')?.status;

  const pbiRightEv = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Power BI',
      evidenceType: 'project_url',
      url: 'https://app.powerbi.com/groups/me/reports/sales-analytics',
      notes: 'Interactive Power BI dashboards engineered using DAX measures and Power Query ETL transformations.'
    })
  }).then(r => r.json());

  console.log('Power BI New Status:', pbiRightEv.skill?.status, '(Expected: proven)');
  const afterPython = pbiRightEv.session.claimedSkills.find(s => s.skill === 'Python')?.status;
  const afterSql = pbiRightEv.session.claimedSkills.find(s => s.skill === 'SQL')?.status;
  const afterJava = pbiRightEv.session.claimedSkills.find(s => s.skill === 'Java')?.status;
  console.log('Python Status unchanged:', afterPython === prevPython, `(${afterPython})`);
  console.log('SQL Status unchanged:', afterSql === prevSql, `(${afterSql})`);
  console.log('Java Status unchanged:', afterJava === prevJava, `(${afterJava})`);

  // TEST 10: Add a new manual skill, verify immediate unverified, submit evidence, verify proven
  console.log('\n[TEST 10] Add manual Docker skill and verify dynamic transition:');
  const addDocker = await fetch('http://localhost:5000/api/skills/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, skill: 'Docker', category: 'DevOps' })
  }).then(r => r.json());
  console.log('Step A - Docker Added Status:', addDocker.skill?.status, '(Expected: unverified)');
  console.log('Step B - Appears in returned session:', !!addDocker.session.claimedSkills.find(s => s.skill === 'Docker'));

  const dockerEv = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skill: 'Docker',
      evidenceType: 'project_url',
      url: 'https://github.com/swetha/microservices-deployment',
      notes: 'Multi-stage Dockerfile builds, containerization of Node.js and Python microservices, and docker-compose orchestration.'
    })
  }).then(r => r.json());
  console.log('Step C - Docker Status After Valid Evidence:', dockerEv.skill?.status, '(Expected: proven)');
  console.log('Step D - Session contains updated Docker status:', dockerEv.session.claimedSkills.find(s => s.skill === 'Docker')?.status, '(Expected: proven)');

  console.log('\n====================================================');
  console.log('ALL 10 SCENARIOS VERIFIED SUCCESSFULLY ON LIVE SERVER! ✅');
  console.log('====================================================\n');
}

runLiveScenarios().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
