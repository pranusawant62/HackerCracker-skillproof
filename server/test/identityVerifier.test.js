import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  extractResumeIdentity, 
  extractGithubIdentity, 
  verifyCandidateIdentity 
} from '../src/services/identityVerifier.js';

test('Stage Identity Verification Service', async (t) => {

  await t.test('1. extracts name, email, GitHub, LinkedIn, and website from resume text', () => {
    const resumeText = `Swetha Konney
swetha@gmail.com | https://github.com/swetha | linkedin.com/in/swethakonney
Portfolio: https://swethakonney.dev
Full Stack Software Engineer proficient in Python, React, PostgreSQL`;

    const identity = extractResumeIdentity(resumeText);
    assert.equal(identity.name, 'Swetha Konney');
    assert.equal(identity.email, 'swetha@gmail.com');
    assert.equal(identity.githubUsername, 'swetha');
    assert.equal(identity.github, 'https://github.com/swetha');
    assert.equal(identity.linkedin, 'https://linkedin.com/in/swethakonney');
    assert.equal(identity.website, 'https://swethakonney.dev');
  });

  await t.test('2. CRITICAL TEST CASE: Resume of Swetha + Friend GitHub (friend123) -> MISMATCH & BLOCKED', () => {
    const resumeIdentity = {
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      github: 'https://github.com/swetha',
      githubUsername: 'swetha'
    };

    const githubIdentity = {
      username: 'friend123',
      name: 'Alex Friend',
      email: 'alex@friend.org',
      profileUrl: 'https://github.com/friend123'
    };

    const result = verifyCandidateIdentity({
      resumeIdentity,
      githubIdentity,
      submittedUsername: 'friend123'
    });

    assert.equal(result.status, 'MISMATCH');
    assert.equal(result.isBlocked, true);
    assert.ok(result.confidence <= 25);
    // Must flag the GitHub URL conflict
    const ghSignal = result.signals.find(s => s.type === 'github_url');
    assert.equal(ghSignal.status, 'CONFLICT');
    // Must flag the name conflict
    const nameSignal = result.signals.find(s => s.type === 'full_name');
    assert.equal(nameSignal.status, 'CONFLICT');
  });

  await t.test('3. POSITIVE TEST CASE: Matching resume + matching GitHub -> VERIFIED & ALLOWED', () => {
    const resumeIdentity = {
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      github: 'https://github.com/swetha',
      githubUsername: 'swetha'
    };

    const githubIdentity = {
      username: 'swetha',
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      profileUrl: 'https://github.com/swetha'
    };

    const result = verifyCandidateIdentity({
      resumeIdentity,
      githubIdentity,
      submittedUsername: 'swetha'
    });

    assert.equal(result.status, 'VERIFIED');
    assert.equal(result.isBlocked, false);
    assert.ok(result.confidence >= 70);
  });

  await t.test('4. Matching resume GitHub + display name without public email -> VERIFIED', () => {
    const resumeIdentity = {
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      github: 'https://github.com/swetha',
      githubUsername: 'swetha'
    };

    const githubIdentity = {
      username: 'swetha',
      name: 'Swetha Konney',
      email: null, // private email on GitHub
      profileUrl: 'https://github.com/swetha'
    };

    const result = verifyCandidateIdentity({
      resumeIdentity,
      githubIdentity,
      submittedUsername: 'swetha'
    });

    assert.equal(result.status, 'VERIFIED');
    assert.equal(result.isBlocked, false);
    const emailSignal = result.signals.find(s => s.type === 'email');
    assert.equal(emailSignal.status, 'NEUTRAL');
  });

  await t.test('5. Acceptance Test 3: GitHub username matches but secondary field (email) mismatches -> VERIFIED', () => {
    const resumeIdentity = {
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      github: 'https://github.com/swetha',
      githubUsername: 'swetha'
    };

    const githubIdentity = {
      username: 'swetha',
      name: 'Swetha Konney',
      email: 'someone_else@company.com',
      profileUrl: 'https://github.com/swetha'
    };

    const result = verifyCandidateIdentity({
      resumeIdentity,
      githubIdentity,
      submittedUsername: 'swetha'
    });

    // 1 reliable match (GitHub username) is sufficient: does not block the workflow!
    assert.equal(result.status, 'VERIFIED');
    assert.equal(result.isBlocked, false);
    const emailSignal = result.signals.find(s => s.type === 'email');
    assert.equal(emailSignal.status, 'CONFLICT');
  });

  await t.test('6. Conflicting display name causes MISMATCH', () => {
    const resumeIdentity = {
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      github: null,
      githubUsername: null
    };

    const githubIdentity = {
      username: 'swetha-dev',
      name: 'Robert Miller',
      email: null,
      profileUrl: 'https://github.com/swetha-dev'
    };

    const result = verifyCandidateIdentity({
      resumeIdentity,
      githubIdentity,
      submittedUsername: 'swetha-dev'
    });

    assert.equal(result.status, 'MISMATCH');
    assert.equal(result.isBlocked, true);
    const nameSignal = result.signals.find(s => s.type === 'full_name');
    assert.equal(nameSignal.status, 'CONFLICT');
  });

  await t.test('7. Acceptance Test 4: When zero identity signals match, status is INSUFFICIENT_EVIDENCE & blocked', () => {
    const resumeIdentity = {
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      github: null,
      githubUsername: null
    };

    const githubIdentity = {
      username: 'random_dev_42',
      name: 'John Miller',
      email: 'john@miller.io',
      profileUrl: 'https://github.com/random_dev_42'
    };

    const result = verifyCandidateIdentity({
      resumeIdentity,
      githubIdentity,
      submittedUsername: 'random_dev_42'
    });

    assert.equal(result.status, 'MISMATCH');
    assert.equal(result.identityStatus, 'insufficient');
    assert.equal(result.isBlocked, true);
    assert.ok(result.reasons.some(r => /insufficient|not match/i.test(r)));
  });

  await t.test('8. Matching personal website/portfolio corroborates candidate without explicit resume GitHub', () => {
    const resumeIdentity = {
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      website: 'https://swethakonney.dev',
      github: null,
      githubUsername: null
    };

    const githubIdentity = {
      username: 'skonney',
      name: 'Swetha Konney',
      website: 'https://swethakonney.dev',
      email: null,
      profileUrl: 'https://github.com/skonney'
    };

    const result = verifyCandidateIdentity({
      resumeIdentity,
      githubIdentity,
      submittedUsername: 'skonney'
    });

    assert.equal(result.status, 'VERIFIED');
    assert.equal(result.isBlocked, false);
    const webSignal = result.signals.find(s => s.type === 'website');
    assert.equal(webSignal.status, 'MATCH');
  });

  await t.test('9. Resume specifies one GitHub handle, user submits different handle -> MISMATCH', () => {
    const resumeIdentity = {
      name: 'Swetha Konney',
      email: 'swetha@gmail.com',
      github: 'https://github.com/swetha123',
      githubUsername: 'swetha123'
    };

    const githubIdentity = {
      username: 'friend456',
      name: null,
      email: null,
      profileUrl: 'https://github.com/friend456'
    };

    const result = verifyCandidateIdentity({
      resumeIdentity,
      githubIdentity,
      submittedUsername: 'friend456'
    });

    assert.equal(result.status, 'MISMATCH');
    assert.equal(result.isBlocked, true);
    assert.ok(result.reasons.some(r => r.includes('swetha123')));
  });

  await t.test('10. Handles completely empty inputs gracefully without throwing', () => {
    const result = verifyCandidateIdentity({});
    assert.equal(result.status, 'INSUFFICIENT_EVIDENCE');
    assert.equal(result.isBlocked, true);
  });

});
