import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  verifyCandidateIdentity,
  checkNameConsistency,
  checkGithubIdentityConsistency
} from '../src/services/identityVerifier.js';

describe('Candidate Identity Consistency - Test Cases 1 through 7', () => {

  it('TEST 1: Candidate "Swetha Konney", Resume "Swetha Konney", matching GitHub identity -> PASS', () => {
    const result = verifyCandidateIdentity({
      candidateName: 'Swetha Konney',
      resumeIdentity: {
        name: 'Swetha Konney',
        email: 'swetha@example.com',
        githubUsername: 'swethakonney'
      },
      githubIdentity: {
        username: 'swethakonney',
        name: 'Swetha Konney',
        email: 'swetha@example.com'
      },
      submittedUsername: 'swethakonney'
    });

    assert.strictEqual(result.status, 'VERIFIED');
    assert.strictEqual(result.identityStatus, 'verified');
    assert.strictEqual(result.isBlocked, false);
    assert.ok(result.confidence >= 70);
  });

  it('TEST 2: Candidate "Swetha Konney", Resume "Rahul Sharma" -> FAIL (Identity mismatch on resume)', () => {
    const result = verifyCandidateIdentity({
      candidateName: 'Swetha Konney',
      resumeIdentity: {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        githubUsername: 'rahulsharma'
      },
      githubIdentity: {
        username: 'rahulsharma',
        name: 'Rahul Sharma',
        email: 'rahul@example.com'
      },
      submittedUsername: 'rahulsharma'
    });

    assert.strictEqual(result.status, 'MISMATCH');
    assert.strictEqual(result.identityStatus, 'failed');
    assert.strictEqual(result.isBlocked, true);
    assert.strictEqual(
      result.blockReason,
      'Identity mismatch: The name on this resume does not match the registered candidate.'
    );
  });

  it('TEST 3: Candidate "Swetha Konney", GitHub belongs to another person -> FAIL (Identity mismatch on GitHub)', () => {
    const result = verifyCandidateIdentity({
      candidateName: 'Swetha Konney',
      resumeIdentity: {
        name: 'Swetha Konney',
        email: 'swetha@example.com'
      },
      githubIdentity: {
        username: 'rahuldev99',
        name: 'Rahul Sharma',
        email: 'rahul@techcorp.io'
      },
      submittedUsername: 'rahuldev99'
    });

    assert.strictEqual(result.status, 'MISMATCH');
    assert.strictEqual(result.identityStatus, 'failed');
    assert.strictEqual(result.isBlocked, true);
    assert.strictEqual(
      result.blockReason,
      'Identity mismatch: This GitHub profile could not be matched to the registered candidate.'
    );
  });

  it('TEST 4: Candidate "Swetha Konney", GitHub username "swetha123", display name "Swetha Konney" -> PASS', () => {
    const result = verifyCandidateIdentity({
      candidateName: 'Swetha Konney',
      resumeIdentity: {
        name: 'Swetha Konney',
        email: 'swetha@example.com'
      },
      githubIdentity: {
        username: 'swetha123',
        name: 'Swetha Konney',
        email: null
      },
      submittedUsername: 'swetha123'
    });

    assert.strictEqual(result.status, 'VERIFIED');
    assert.strictEqual(result.identityStatus, 'verified');
    assert.strictEqual(result.isBlocked, false);
  });

  it('TEST 5: Candidate "Swetha Konney", Resume "SWETHA KONNEY" (all caps) -> PASS', () => {
    const nameMatch = checkNameConsistency('Swetha Konney', 'SWETHA KONNEY');
    assert.strictEqual(nameMatch.isMatch, true);
    assert.strictEqual(nameMatch.isConflict, false);

    const result = verifyCandidateIdentity({
      candidateName: 'Swetha Konney',
      resumeIdentity: {
        name: 'SWETHA KONNEY',
        email: 'swetha@example.com',
        githubUsername: 'swethak'
      },
      githubIdentity: {
        username: 'swethak',
        name: 'Swetha Konney',
        email: 'swetha@example.com'
      },
      submittedUsername: 'swethak'
    });

    assert.strictEqual(result.status, 'VERIFIED');
    assert.strictEqual(result.identityStatus, 'verified');
    assert.strictEqual(result.isBlocked, false);
  });

  it('TEST 6: Candidate "Swetha Konney", Resume name cannot be extracted reliably -> NOT VERIFIED', () => {
    const result = verifyCandidateIdentity({
      candidateName: 'Swetha Konney',
      resumeIdentity: {
        name: null,
        email: 'user@example.com'
      },
      githubIdentity: {
        username: 'swethak',
        name: 'Swetha Konney'
      },
      submittedUsername: 'swethak'
    });

    assert.strictEqual(result.identityStatus, 'failed');
    assert.strictEqual(result.isBlocked, true);
    assert.strictEqual(
      result.blockReason,
      "Unable to verify the resume owner's identity. Please upload a resume containing your name."
    );
  });

  it('TEST 7: Name normalization handles punctuation and initials intelligently', () => {
    // Abbreviations & initials
    assert.strictEqual(checkNameConsistency('Swetha Konney', 'Swetha K.').isMatch, true);
    assert.strictEqual(checkNameConsistency('Swetha Konney', 'S. Konney').isMatch, true);
    assert.strictEqual(checkNameConsistency('Swetha Konney', 'Konney, Swetha').isMatch, true);
    assert.strictEqual(checkNameConsistency('Swetha Konney', 'swetha   konney').isMatch, true);
    
    // Clear contradiction
    assert.strictEqual(checkNameConsistency('Swetha Konney', 'Rahul Sharma').isConflict, true);
  });

});
