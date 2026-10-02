import test from 'node:test';
import assert from 'node:assert/strict';
import { matchSkills } from '../src/services/skillMatcher.js';

test('Stage 5 Final SkillProof Report Synthesis', async (t) => {
  await t.test('generates complete final verification report separating claim, evidence, and verdict', () => {
    const claimedSkills = [
      { skill: 'React', category: 'Frontend', matchedTerm: 'React.js' },
      { skill: 'Python', category: 'Programming Languages', matchedTerm: 'Python' },
      { skill: 'Kubernetes', category: 'DevOps', matchedTerm: 'k8s' }
    ];

    const githubData = {
      evidence: [
        {
          skill: 'React',
          repository: 'my-portfolio',
          repositoryUrl: 'https://github.com/user/my-portfolio',
          evidenceType: 'dependency',
          strength: 'strong',
          details: 'React found in package.json dependencies'
        },
        {
          skill: 'Python',
          repository: 'script-tools',
          repositoryUrl: 'https://github.com/user/script-tools',
          evidenceType: 'repository-language',
          strength: 'supporting',
          details: 'Python detected in repository language statistics'
        }
      ],
      repositories: [
        {
          name: 'my-portfolio',
          url: 'https://github.com/user/my-portfolio',
          language: 'JavaScript',
          languages: ['JavaScript', 'HTML']
        },
        {
          name: 'script-tools',
          url: 'https://github.com/user/script-tools',
          language: 'Python',
          languages: ['Python']
        }
      ]
    };

    const report = matchSkills(claimedSkills, githubData);

    // Summary validation
    assert.equal(report.summary.totalClaimed, 3);
    assert.equal(report.summary.proved, 2); // React (dependency) + Python (primary language of script-tools)
    assert.equal(report.summary.partial, 0);
    assert.equal(report.summary.unverified, 1); // Kubernetes
    assert.ok(typeof report.summary.verificationRate === 'number');
    assert.match(report.summary.assessment, /SkillProof verification report objectively contrasts/i);

    // Results validation - check 3-part separation
    const reactResult = report.results.find(r => r.skill === 'React');
    assert.ok(reactResult);
    // 1. Resume claim
    assert.equal(reactResult.resumeClaim.skill, 'React');
    assert.equal(reactResult.resumeClaim.matchedTerm, 'React.js');
    assert.equal(reactResult.resumeClaim.category, 'Frontend');
    // 2. Observable evidence
    assert.equal(reactResult.evidence.length, 1);
    assert.equal(reactResult.repositories.length, 1);
    // 3. Final verdict
    assert.equal(reactResult.status, 'PROVED');

    // Unverified skill check
    const k8sResult = report.results.find(r => r.skill === 'Kubernetes');
    assert.ok(k8sResult);
    assert.equal(k8sResult.status, 'UNVERIFIED');
    assert.equal(k8sResult.evidence.length, 0);
    assert.equal(k8sResult.repositories.length, 0);
  });
});
