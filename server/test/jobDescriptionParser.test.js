import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJobDescription } from '../src/services/jobDescriptionParser.js';

test('Stage 6A: Job Description Parser Service', async (t) => {
  await t.test('extracts Python', () => {
    const jd = 'We are looking for a Software Engineer with strong experience in Python.';
    const result = parseJobDescription(jd);
    assert.equal(result.extractedSkills.length, 1);
    assert.equal(result.extractedSkills[0].skill, 'Python');
    assert.equal(result.extractedSkills[0].importance, 'required');
  });

  await t.test('extracts React.js as React', () => {
    const jd = 'Frontend development requires hands-on experience with React.js.';
    const result = parseJobDescription(jd);
    assert.equal(result.extractedSkills.length, 1);
    assert.equal(result.extractedSkills[0].skill, 'React');
    assert.equal(result.extractedSkills[0].matchedTerm, 'React.js');
  });

  await t.test('extracts PostgreSQL as PostgreSQL', () => {
    const jd = 'Database management using Postgres and relational databases.';
    const result = parseJobDescription(jd);
    assert.equal(result.extractedSkills.length, 1);
    assert.equal(result.extractedSkills[0].skill, 'PostgreSQL');
    assert.equal(result.extractedSkills[0].matchedTerm, 'Postgres');
  });

  await t.test('recognizes required skills from explicit inline requirements', () => {
    const jd = 'Candidate must have Python and must be proficient in TypeScript.';
    const result = parseJobDescription(jd);
    assert.equal(result.requirements.required.length, 2);
    assert.ok(result.requirements.required.some(s => s.skill === 'Python'));
    assert.ok(result.requirements.required.some(s => s.skill === 'TypeScript'));
  });

  await t.test('recognizes preferred skills from inline bonus cues', () => {
    const jd = 'Must have Python. Experience with Docker is a plus and familiarity with FastAPI is preferred.';
    const result = parseJobDescription(jd);
    const python = result.extractedSkills.find(s => s.skill === 'Python');
    const docker = result.extractedSkills.find(s => s.skill === 'Docker');
    const fastapi = result.extractedSkills.find(s => s.skill === 'FastAPI');

    assert.equal(python.importance, 'required');
    assert.equal(docker.importance, 'preferred');
    assert.equal(fastapi.importance, 'preferred');

    assert.equal(result.requirements.required.length, 1);
    assert.equal(result.requirements.preferred.length, 2);
  });

  await t.test('recognizes section headers for required vs preferred qualifications', () => {
    const jd = `
Requirements:
- Python
- SQL

Nice to have:
- Docker
- GraphQL
    `;
    const result = parseJobDescription(jd);
    const reqSkills = result.requirements.required.map(s => s.skill);
    const prefSkills = result.requirements.preferred.map(s => s.skill);

    assert.ok(reqSkills.includes('Python'));
    assert.ok(reqSkills.includes('SQL'));
    assert.ok(prefSkills.includes('Docker'));
    assert.ok(prefSkills.includes('GraphQL'));
  });

  await t.test('handles aliases correctly (JS, TS, NodeJS, Postgres)', () => {
    const jd = 'Looking for full-stack developers proficient in JS, TS, NodeJS, and Postgres.';
    const result = parseJobDescription(jd);
    const skillNames = result.extractedSkills.map(s => s.skill);

    assert.ok(skillNames.includes('JavaScript'));
    assert.ok(skillNames.includes('TypeScript'));
    assert.ok(skillNames.includes('Node.js'));
    assert.ok(skillNames.includes('PostgreSQL'));
  });

  await t.test('ignores unrelated text', () => {
    const jd = 'Join our innovative marketing team in downtown Austin. Competitive salary, paid time off, and 401(k) match.';
    const result = parseJobDescription(jd);
    assert.equal(result.extractedSkills.length, 0);
    assert.equal(result.requirements.required.length, 0);
    assert.equal(result.requirements.preferred.length, 0);
  });

  await t.test('handles empty and null input', () => {
    const emptyResult = parseJobDescription('');
    assert.equal(emptyResult.extractedSkills.length, 0);
    assert.equal(emptyResult.requirements.required.length, 0);

    const nullResult = parseJobDescription(null);
    assert.equal(nullResult.extractedSkills.length, 0);
  });

  await t.test('handles duplicate skills without duplicates', () => {
    const jd = 'Python engineer needed. Python is our core language. You will build microservices in Python 3. Requirements: Python.';
    const result = parseJobDescription(jd);
    const pythonOccurrences = result.extractedSkills.filter(s => s.skill === 'Python');
    assert.equal(pythonOccurrences.length, 1);
    assert.equal(pythonOccurrences[0].importance, 'required');
  });
});
