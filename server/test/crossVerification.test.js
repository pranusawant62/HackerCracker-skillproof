import test from 'node:test';
import assert from 'node:assert/strict';
import { matchSkills, findEvidenceForSkill, classifySkill } from '../src/services/skillMatcher.js';

test('Stage 4 Cross-Verification Service', async (t) => {
  await t.test('classifies skill as PROVED when strong dependency evidence exists', () => {
    const claimedSkills = [
      { skill: 'React', category: 'Frontend', matchedTerm: 'React' }
    ];
    const githubData = {
      evidence: [
        {
          skill: 'React',
          repository: 'frontend-app',
          repositoryUrl: 'https://github.com/user/frontend-app',
          evidenceType: 'dependency',
          strength: 'strong',
          details: 'React found in package.json dependencies'
        }
      ],
      repositories: [
        {
          name: 'frontend-app',
          url: 'https://github.com/user/frontend-app',
          language: 'JavaScript',
          languages: ['JavaScript', 'HTML']
        }
      ]
    };

    const res = matchSkills(claimedSkills, githubData);
    assert.equal(res.summary.totalClaimed, 1);
    assert.equal(res.summary.proved, 1);
    assert.equal(res.summary.partial, 0);
    assert.equal(res.summary.unverified, 0);

    const r = res.results[0];
    assert.equal(r.skill, 'React');
    assert.equal(r.status, 'PROVED');
    assert.equal(r.repositories.length, 1);
    assert.equal(r.repositories[0].name, 'frontend-app');
    assert.equal(r.evidence.length, 1);
    assert.match(r.explanation, /package dependenc/i);
  });

  await t.test('classifies skill as PROVED when manifest configuration (Dockerfile) exists', () => {
    const claimedSkills = [
      { skill: 'Docker', category: 'DevOps', matchedTerm: 'Docker' }
    ];
    const githubData = {
      evidence: [
        {
          skill: 'Docker',
          repository: 'microservice',
          repositoryUrl: 'https://github.com/user/microservice',
          evidenceType: 'manifest',
          strength: 'strong',
          details: 'Docker configuration (Dockerfile) detected'
        }
      ],
      repositories: [
        {
          name: 'microservice',
          url: 'https://github.com/user/microservice',
          language: 'Go',
          languages: ['Go']
        }
      ]
    };

    const res = matchSkills(claimedSkills, githubData);
    assert.equal(res.summary.proved, 1);
    assert.equal(res.results[0].status, 'PROVED');
  });

  await t.test('classifies skill as PROVED when observed across 2+ repositories in language stats', () => {
    const claimedSkills = [
      { skill: 'Python', category: 'Programming Languages', matchedTerm: 'Python' }
    ];
    const githubData = {
      evidence: [
        {
          skill: 'Python',
          repository: 'repo-one',
          repositoryUrl: 'https://github.com/user/repo-one',
          evidenceType: 'repository-language',
          strength: 'supporting',
          details: 'Python detected in repository language statistics'
        },
        {
          skill: 'Python',
          repository: 'repo-two',
          repositoryUrl: 'https://github.com/user/repo-two',
          evidenceType: 'repository-language',
          strength: 'supporting',
          details: 'Python detected in repository language statistics'
        }
      ],
      repositories: [
        { name: 'repo-one', url: 'https://github.com/user/repo-one', language: 'Python', languages: ['Python'] },
        { name: 'repo-two', url: 'https://github.com/user/repo-two', language: 'Python', languages: ['Python'] }
      ]
    };

    const res = matchSkills(claimedSkills, githubData);
    assert.equal(res.summary.proved, 1);
    assert.equal(res.results[0].status, 'PROVED');
    assert.equal(res.results[0].repositories.length, 2);
  });

  await t.test('classifies skill as PARTIAL when detected in language stats of only 1 repo as secondary', () => {
    const claimedSkills = [
      { skill: 'CSS', category: 'Frontend', matchedTerm: 'CSS' }
    ];
    const githubData = {
      evidence: [
        {
          skill: 'CSS',
          repository: 'main-app',
          repositoryUrl: 'https://github.com/user/main-app',
          evidenceType: 'repository-language',
          strength: 'supporting',
          details: 'CSS detected in repository language statistics'
        }
      ],
      repositories: [
        { name: 'main-app', url: 'https://github.com/user/main-app', language: 'TypeScript', languages: ['TypeScript', 'CSS'] }
      ]
    };

    const res = matchSkills(claimedSkills, githubData);
    assert.equal(res.summary.partial, 1);
    assert.equal(res.results[0].status, 'PARTIAL');
    assert.match(res.results[0].explanation, /Observed in repository language statistics/i);
  });

  await t.test('classifies skill as UNVERIFIED when no observable evidence exists', () => {
    const claimedSkills = [
      { skill: 'Kubernetes', category: 'DevOps', matchedTerm: 'Kubernetes' },
      { skill: 'Rust', category: 'Programming Languages', matchedTerm: 'Rust' }
    ];
    const githubData = {
      evidence: [],
      repositories: []
    };

    const res = matchSkills(claimedSkills, githubData);
    assert.equal(res.summary.totalClaimed, 2);
    assert.equal(res.summary.proved, 0);
    assert.equal(res.summary.partial, 0);
    assert.equal(res.summary.unverified, 2);

    for (const r of res.results) {
      assert.equal(r.status, 'UNVERIFIED');
      assert.equal(r.repositories.length, 0);
      assert.equal(r.evidence.length, 0);
      assert.match(r.explanation, /No observable evidence was found/i);
    }
  });

  await t.test('handles empty inputs gracefully', () => {
    const res = matchSkills([], null);
    assert.equal(res.summary.totalClaimed, 0);
    assert.equal(res.summary.proved, 0);
    assert.equal(res.summary.partial, 0);
    assert.equal(res.summary.unverified, 0);
    assert.deepEqual(res.results, []);
  });
});
