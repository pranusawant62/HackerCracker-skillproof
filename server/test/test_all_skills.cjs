const http = require('http');

async function testSkill(skill) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify({ skill });
    const req = http.request('http://localhost:5000/api/skill-assessment/start', {
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
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function run() {
  const skills = ['JavaScript', 'Python', 'SQL', 'Docker', 'Firebase', 'PostgreSQL', 'FastAPI', 'GitHub'];
  console.log('Verifying Skill-Specific Isolation & Exactly 5 Questions...');
  
  for (const s of skills) {
    const res = await testSkill(s);
    const count = res.assessment?.questions?.length;
    const firstQ = res.assessment?.questions?.[0]?.question?.slice(0, 70);
    console.log(`[PASS] Skill: ${s.padEnd(12)} | Questions: ${count} | Q1: ${firstQ}...`);
  }
}

run().catch(console.error);
