import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateDeterministicSkillAnalysis, performAiSkillAnalysis } from '../src/services/aiSkillAnalysis.js';

describe('AI Skill Analysis Engine', () => {

  test('1. Core Structure: returns all required keys without generic motivational text', async () => {
    const mockVerifiedSkills = [
      { name: 'Python', status: 'proven', evidence: [{ confidenceScore: 95, type: 'github_repo' }] },
      { name: 'FastAPI', status: 'proven', evidence: [{ confidenceScore: 92, type: 'github_repo' }] },
      { name: 'PostgreSQL', status: 'proven', evidence: [{ confidenceScore: 88, type: 'github_repo' }] },
      { name: 'React', status: 'partial', evidence: [{ confidenceScore: 55 }] },
      { name: 'Docker', status: 'unverified', claimSource: 'resume' }
    ];

    const result = await performAiSkillAnalysis({
      verifiedSkills: mockVerifiedSkills,
      jobMatch: {
        jobTitle: 'Senior Backend Developer',
        matchedSkills: ['Python', 'FastAPI', 'PostgreSQL'],
        partialSkills: ['React'],
        missingSkills: ['Docker']
      },
      skillGaps: [
        { skill: 'React', status: 'PARTIAL', whyGap: 'React evidence exists but is limited to language breakdown' },
        { skill: 'Docker', status: 'CLAIMED-ONLY', whyGap: 'Docker is claimed on resume but no repository evidence found' }
      ],
      skillGrowth: {
        overallCoverage: 66,
        recommendations: [
          'Complete Docker micro-task: create Dockerfile, build container image, and verify port bindings',
          'Build React + FastAPI project: connect interactive frontend client to backend endpoints'
        ]
      },
      github: {
        repositories: [
          { name: 'fastapi-backend-service', pushedAt: '2026-04-12T10:00:00Z' }
        ]
      }
    });

    assert.ok(result.summary, 'Should include summary');
    assert.ok(Array.isArray(result.strengths), 'strengths should be an array');
    assert.ok(Array.isArray(result.evidenceGaps), 'evidenceGaps should be an array');
    assert.ok(Array.isArray(result.nextSteps), 'nextSteps should be an array');
    assert.ok(result.profileSummary, 'Should include profileSummary');

    // Verify factual, technical content
    assert.match(result.summary, /Python/i);
    assert.match(result.summary, /FastAPI/i);
    assert.match(result.summary, /PostgreSQL/i);
    assert.ok(!result.summary.includes('you are a rockstar'), 'Must not have generic fluff');
  });

  test('2. Strict Invariant: Never marks a skill as proven unless verified as PROVEN', () => {
    const mockSkills = [
      { name: 'Docker', status: 'unverified', claimSource: 'resume' },
      { name: 'Kubernetes', status: 'unverified', claimSource: 'resume' },
      { name: 'React', status: 'partial' }
    ];

    const result = generateDeterministicSkillAnalysis({
      verifiedSkills: mockSkills
    });

    // None of Docker, Kubernetes, or React should be in strengths as proven
    const strengthTexts = result.strengths.join(' ');
    assert.ok(!strengthTexts.includes('Docker — Verified'), 'Docker must not be listed as a verified strength');
    assert.ok(!strengthTexts.includes('Kubernetes — Verified'), 'Kubernetes must not be listed as a verified strength');
    assert.ok(!strengthTexts.includes('React — Verified'), 'React must not be listed as a verified strength');

    // Both must appear in evidence gaps
    const gapTexts = result.evidenceGaps.join(' ');
    assert.match(gapTexts, /Docker/i);
    assert.match(gapTexts, /Kubernetes/i);
    assert.match(gapTexts, /React/i);
  });

  test('3. Key Strengths: Only PROVEN skills with direct evidence become strengths', () => {
    const mockSkills = [
      { name: 'Python', status: 'proven', evidence: [{ confidenceScore: 95 }] },
      { name: 'PostgreSQL', status: 'proven', evidence: [{ confidenceScore: 90 }] }
    ];

    const result = generateDeterministicSkillAnalysis({
      verifiedSkills: mockSkills,
      github: {
        repositories: [{ name: 'db-service', pushedAt: '2026-01-01' }]
      }
    });

    assert.strictEqual(result.strengths.length, 3); // Python, PostgreSQL, Git/GitHub
    assert.ok(result.strengths[0].includes('Python'));
    assert.ok(result.strengths[1].includes('PostgreSQL'));
    assert.ok(result.strengths[2].includes('Git/GitHub'));
  });

  test('4. Evidence Gaps & Next Steps: Synthesizes actionable next steps', () => {
    const result = generateDeterministicSkillAnalysis({
      verifiedSkills: [
        { name: 'Python', status: 'proven' },
        { name: 'Docker', status: 'unverified' }
      ],
      skillGaps: [
        { skill: 'Docker', status: 'CLAIMED-ONLY', whyGap: 'Docker is claimed but no repository evidence found' }
      ]
    });

    assert.ok(result.evidenceGaps.some(g => g.includes('Docker')));
    assert.ok(result.nextSteps.some(step => step.toLowerCase().includes('docker')));
  });

  test('5. Profile Readiness: Accurate job readiness assessment', () => {
    const resultHigh = generateDeterministicSkillAnalysis({
      verifiedSkills: [
        { name: 'Python', status: 'proven' },
        { name: 'FastAPI', status: 'proven' },
        { name: 'PostgreSQL', status: 'proven' }
      ],
      skillGrowth: { overallCoverage: 85 }
    });

    assert.strictEqual(resultHigh.readinessLevel, 'High (Job-Ready for Target Role)');
    assert.match(resultHigh.profileSummary, /verified competence/i);

    const resultLow = generateDeterministicSkillAnalysis({
      verifiedSkills: [
        { name: 'Docker', status: 'unverified' }
      ],
      skillGrowth: { overallCoverage: 20 }
    });

    assert.strictEqual(resultLow.readinessLevel, 'Foundational (Requires Evidence Submissions)');
  });

  test('6. Graceful Fallback: Handles empty or missing input data', () => {
    const result = generateDeterministicSkillAnalysis({});
    assert.ok(result.summary);
    assert.strictEqual(result.strengths.length, 0);
    assert.ok(Array.isArray(result.nextSteps));
    assert.ok(result.nextSteps.length > 0);
    assert.strictEqual(result.overallCoverage, 0);
  });

});
