/**
 * End-to-End Verification Test Script
 * 
 * Tests the exact Critical Negative Test Case and Positive Test Case requested:
 * 
 * 1. NEGATIVE TEST CASE (Critical Scenario):
 *    Resume: Swetha Konney, swetha@gmail.com, github.com/swetha
 *    Claims: Python, FastAPI, PostgreSQL
 *    Submitted GitHub: friend123
 *    Expected:
 *      - Identity Verification: MISMATCH / INSUFFICIENT_EVIDENCE
 *      - Skill Verification: BLOCKED
 *      - Proved count: 0, Partial count: 0
 *      - Python, FastAPI, PostgreSQL marked UNVERIFIED
 *      - No skills from friend123 attributed to Swetha
 * 
 * 2. POSITIVE TEST CASE:
 *    Resume: Swetha Konney, swetha@gmail.com, github.com/swetha
 *    Claims: Python, FastAPI, PostgreSQL
 *    Submitted GitHub: swetha
 *    Expected:
 *      - Identity Verification: VERIFIED
 *      - Skill Verification: PROCEED (isBlocked: false)
 */

import http from 'http';

function createSimplePdf(lines) {
  const contentStream = [
    'BT',
    '/F1 12 Tf',
    '50 720 Td'
  ];

  lines.forEach((line, idx) => {
    if (idx > 0) contentStream.push('0 -20 Td');
    const safeLine = line.replace(/[\\()]/g, '\\$&');
    contentStream.push(`(${safeLine}) Tj`);
  });

  contentStream.push('ET');
  const streamBody = contentStream.join('\n') + '\n';
  const streamLen = Buffer.byteLength(streamBody, 'utf8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLen} >>
stream
${streamBody}endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000311 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
500
%%EOF
`;

  return Buffer.from(pdf, 'utf8');
}

async function sendVerifyRequest(pdfBuffer, filename, username) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  
  const headerPart = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="githubUsername"\r\n\r\n` +
    `${username}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="resume"; filename="${filename}"\r\n` +
    `Content-Type: application/pdf\r\n\r\n`
  );

  const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([headerPart, pdfBuffer, footerPart]);

  const response = await fetch('http://localhost:5000/api/verify', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': String(body.length)
    },
    body
  });

  return await response.json();
}

async function runTests() {
  console.log('================================================================');
  console.log('SKILLPROOF IDENTITY VERIFICATION & SECURITY GATE E2E TESTS');
  console.log('================================================================\n');

  const swethaPdfLines = [
    'Swetha Konney - Backend Engineer',
    'Email: swetha@gmail.com',
    'GitHub: github.com/swetha',
    'LinkedIn: linkedin.com/in/swetha-konney',
    'Skills: Python, FastAPI, PostgreSQL, Docker, Git',
    'Experience: Built production microservices with FastAPI and PostgreSQL.'
  ];

  const swethaPdf = createSimplePdf(swethaPdfLines);

  // -------------------------------------------------------------
  // TEST CASE 1: CRITICAL NEGATIVE TEST CASE
  // -------------------------------------------------------------
  console.log('▶ TEST CASE 1: CRITICAL NEGATIVE TEST CASE (Friend\'s GitHub Submitted)');
  console.log('Candidate Resume:');
  console.log('  Name: Swetha Konney');
  console.log('  Email: swetha@gmail.com');
  console.log('  GitHub: github.com/swetha');
  console.log('  Claimed Skills: Python, FastAPI, PostgreSQL');
  console.log('Submitted GitHub Handle: friend123\n');

  const result1 = await sendVerifyRequest(swethaPdf, 'swetha_resume.pdf', 'friend123');

  console.log('--- ACTUAL RESPONSE SUMMARY ---');
  console.log(`Success: ${result1.success}`);
  console.log(`Identity Status: ${result1.identityVerification?.status}`);
  console.log(`Is Blocked: ${result1.isBlocked}`);
  console.log(`Block Reason: ${result1.blockReason}`);
  console.log(`Proved Skills Count: ${result1.crossVerification?.summary?.proved}`);
  console.log(`Partial Skills Count: ${result1.crossVerification?.summary?.partial}`);
  console.log(`Unverified Skills Count: ${result1.crossVerification?.summary?.unverified}`);
  console.log('\nIndividual Skill Verdicts:');
  result1.crossVerification?.results?.forEach(s => {
    console.log(`  - ${s.skill}: [${s.status}] -> ${s.explanation}`);
  });

  const passedTest1 = 
    result1.identityVerification?.status === 'MISMATCH' &&
    result1.isBlocked === true &&
    result1.crossVerification?.summary?.proved === 0 &&
    result1.crossVerification?.summary?.partial === 0;

  console.log(`\nTEST CASE 1 RESULT: ${passedTest1 ? '✅ PASSED (Security Gate Enforced)' : '❌ FAILED'}\n`);

  // -------------------------------------------------------------
  // TEST CASE 2: POSITIVE TEST CASE
  // -------------------------------------------------------------
  console.log('================================================================');
  console.log('▶ TEST CASE 2: POSITIVE TEST CASE (Matching Candidate Profile)');
  console.log('Candidate Resume:');
  console.log('  Name: Swetha Konney');
  console.log('  Email: swetha@gmail.com');
  console.log('  GitHub: github.com/swetha');
  console.log('Submitted GitHub Handle: swetha\n');

  const result2 = await sendVerifyRequest(swethaPdf, 'swetha_resume.pdf', 'swetha');

  console.log('--- ACTUAL RESPONSE SUMMARY ---');
  console.log(`Success: ${result2.success}`);
  console.log(`Identity Status: ${result2.identityVerification?.status}`);
  console.log(`Confidence: ${result2.identityVerification?.confidence}%`);
  console.log(`Is Blocked: ${result2.isBlocked}`);
  console.log(`Signals Evaluated:`);
  result2.identityVerification?.signals?.forEach(sig => {
    console.log(`  - [${sig.signal}] ${sig.status.toUpperCase()}: ${sig.details}`);
  });
  console.log(`Skill Verification Allowed: ${!result2.isBlocked}`);

  const passedTest2 = 
    result2.identityVerification?.status === 'VERIFIED' &&
    result2.isBlocked === false;

  console.log(`\nTEST CASE 2 RESULT: ${passedTest2 ? '✅ PASSED (Verification Allowed)' : '❌ FAILED'}\n`);

  // -------------------------------------------------------------
  // TEST CASE 3: INSUFFICIENT EVIDENCE (Name alone, no resume GitHub)
  // -------------------------------------------------------------
  console.log('================================================================');
  console.log('▶ TEST CASE 3: INSUFFICIENT EVIDENCE TEST (Name alone, no resume GitHub link)');
  console.log('Candidate Resume:');
  console.log('  Name: Jane Doe');
  console.log('  No email, no GitHub URL on resume');
  console.log('Submitted GitHub Handle: janedoe\n');

  const janePdf = createSimplePdf([
    'Jane Doe - Software Engineer',
    'Skills: Python, Docker, JavaScript',
    'Experience: Full stack development.'
  ]);

  const result3 = await sendVerifyRequest(janePdf, 'jane_resume.pdf', 'janedoe');

  console.log('--- ACTUAL RESPONSE SUMMARY ---');
  console.log(`Success: ${result3.success}`);
  console.log(`Identity Status: ${result3.identityVerification?.status}`);
  console.log(`Is Blocked: ${result3.isBlocked}`);
  console.log(`Block Reason: ${result3.blockReason}`);
  console.log(`Proved Skills Count: ${result3.crossVerification?.summary?.proved}`);

  const passedTest3 = 
    result3.identityVerification?.status === 'INSUFFICIENT_EVIDENCE' &&
    result3.isBlocked === true &&
    result3.crossVerification?.summary?.proved === 0;

  console.log(`\nTEST CASE 3 RESULT: ${passedTest3 ? '✅ PASSED (Insufficient Evidence Blocks Verification)' : '❌ FAILED'}\n`);
  console.log('================================================================');
}

runTests().catch(console.error);
