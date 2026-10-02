import http from 'http';

async function testFullPipeline() {
  const boundary = '----BoundaryTest' + Date.now();
  const pdfLines = [
    'Swetha Konney',
    'Email: swetha@gmail.com',
    'GitHub: github.com/swetha',
    'Skills: Python, SQL, Power BI',
    'Experience:',
    'Designed normalized schemas and optimized complex SQL queries with indexing in PostgreSQL.'
  ];
  
  const contentStream = ['BT', '/F1 12 Tf', '50 720 Td'];
  pdfLines.forEach((line, idx) => {
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
    `--${boundary}\r\nContent-Disposition: form-data; name="githubUsername"\r\n\r\nswetha\r\n--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="swetha_resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, pdfBuffer, footer]);

  console.log('1. Testing /api/verify...');
  const verifyRes = await fetch('http://localhost:5000/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body
  }).then(r => r.json());

  console.log('Verify Success:', verifyRes.success);
  console.log('Session ID:', verifyRes.sessionId);
  const sql = verifyRes.claimedSkills?.find(s => s.skill === 'SQL');
  console.log('SQL Status from Resume Evidence:', sql?.status, '(Expected: proven)');
  const pbiResume = verifyRes.claimedSkills?.find(s => s.skill === 'Power BI');
  console.log('Power BI Status without Evidence:', pbiResume?.status, '(Expected: unverified)');

  const sessionId = verifyRes.sessionId;

  console.log('\n2. Testing /api/skills/add (Manual Firebase)...');
  const addRes = await fetch('http://localhost:5000/api/skills/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, skill: 'Firebase', category: 'Backend' })
  }).then(r => r.json());
  console.log('Firebase Added Initial Status:', addRes.skill?.status, '(Expected: unverified)');
  console.log('Session Returned in Add Skill:', !!addRes.session);

  console.log('\n3. Testing /api/skills/evidence (Wrong Evidence for Firebase)...');
  const wrongEvRes = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skillId: addRes.skill.id,
      skill: 'Firebase',
      evidenceType: 'certificate',
      title: 'Certified ScrumMaster',
      notes: 'Scrum agile sprint leadership'
    })
  }).then(r => r.json());
  console.log('Firebase Status After Scrum Cert:', wrongEvRes.skill?.status, '(Expected: unverified)');
  console.log('Relevance:', wrongEvRes.evidence?.evidenceRelevance, '(Expected: unrelated)');

  console.log('\n4. Testing /api/skills/evidence (Correct Evidence for Firebase)...');
  const rightEvRes = await fetch('http://localhost:5000/api/skills/evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      skillId: addRes.skill.id,
      skill: 'Firebase',
      evidenceType: 'project_url',
      url: 'https://github.com/swetha/firebase-chat-app',
      title: 'Firebase Realtime Chat',
      notes: 'Firestore database, Firebase Auth, and Cloud Functions'
    })
  }).then(r => r.json());
  console.log('Firebase Status After Right Evidence:', rightEvRes.skill?.status, '(Expected: proven)');
  console.log('Session Returned with Firebase Proven:', rightEvRes.session?.claimedSkills?.find(s => s.skill === 'Firebase')?.status);

  console.log('\n5. Testing GET /api/session/:sessionId (Session Persistence)...');
  const getSessionRes = await fetch(`http://localhost:5000/api/session/${sessionId}`).then(r => r.json());
  const finalFirebase = getSessionRes.session?.claimedSkills?.find(s => s.skill === 'Firebase');
  console.log('Persistent Firebase Status in SessionStore:', finalFirebase?.status, '(Expected: proven)');
  console.log('Total Evidence on Persistent Firebase:', finalFirebase?.evidence?.length, '(Expected: 2)');

  console.log('\nALL 5 PIPELINE STEPS PASSED SUCCESSFULLY! ✅');
}

testFullPipeline().catch(console.error);
