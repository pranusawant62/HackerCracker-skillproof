const http = require('http');

async function testEndpoint(path, postData) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(postData);
    const req = http.request('http://localhost:5000' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function runTests() {
  console.log('1. Starting JavaScript assessment without sessionId (auto-create)...');
  const startJs = await testEndpoint('/api/skill-assessment/start', {
    skill: 'JavaScript',
    difficulty: 'intermediate'
  });
  console.log('Start Status:', startJs.status);
  console.log('Assessment ID:', startJs.body.assessment?.assessmentId);
  console.log('Skill:', startJs.body.assessment?.skill);
  console.log('Question count:', startJs.body.assessment?.questions?.length);
  console.log('First Question prompt:', startJs.body.assessment?.questions?.[0]?.question);

  console.log('\n2. Submitting answers...');
  const questions = startJs.body.assessment?.questions || [];
  const answers = questions.map(q => ({
    questionId: q.id,
    answer: q.options ? (q.options[0]?.text || q.options[0]?.key || q.options[0]) : 'console.log("hello");'
  }));

  const submitRes = await testEndpoint('/api/skill-assessment/submit', {
    assessmentId: startJs.body.assessment?.assessmentId,
    sessionId: startJs.body.assessment?.sessionId,
    answers
  });
  console.log('Submit Status:', submitRes.status);
  console.log('Score:', submitRes.body.assessmentResult?.score);
  console.log('Percentage:', submitRes.body.assessmentResult?.percentage);
  console.log('Status:', submitRes.body.assessmentResult?.status);

  console.log('\n3. Testing skill isolation for SQL...');
  const startSql = await testEndpoint('/api/skill-assessment/start', {
    skill: 'SQL'
  });
  console.log('SQL questions count:', startSql.body.assessment?.questions?.length);
  console.log('SQL first question:', startSql.body.assessment?.questions?.[0]?.question);
}

runTests().catch(console.error);
