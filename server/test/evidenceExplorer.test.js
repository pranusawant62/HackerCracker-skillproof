import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEvidenceExplorer } from '../src/services/evidenceExplorer.js';

test('Stage 7: Evidence Explorer Service', async (t) => {

  const sampleCrossVerification = {
    results: [
      {
        skill: 'Python',
        category: 'Programming Languages',
        status: 'PROVED',
        explanation: 'Direct proof verified through package dependency declarations.',
        repositories: [
          { name: 'api-backend', url: 'https://github.com/alice/api-backend' }
        ],
        evidence: [
          {
            skill: 'Python',
            repository: 'api-backend',
            evidenceType: 'dependency',
            file: 'requirements.txt',
            details: 'FastAPI dependency listed in requirements.txt'
          },
          {
            skill: 'Python',
            repository: 'api-backend',
            evidenceType: 'repository-language',
            details: 'Python detected in repository language statistics'
          }
        ]
      },
      {
        skill: 'JavaScript',
        category: 'Programming Languages',
        status: 'PARTIAL',
        explanation: 'Observed in repository language statistics for "frontend-ui".',
        repositories: [
          { name: 'frontend-ui', url: 'https://github.com/alice/frontend-ui' }
        ],
        evidence: [
          {
            skill: 'JavaScript',
            repository: 'frontend-ui',
            evidenceType: 'repository-language',
            details: 'JavaScript detected in repository language statistics'
          }
        ]
      },
      {
        skill: 'Docker',
        category: 'DevOps',
        status: 'UNVERIFIED',
        explanation: 'No observable evidence was found in public repositories, commit language statistics, or package manifests.',
        repositories: [],
        evidence: []
      }
    ]
  };

  const sampleGithub = {
    repositories: [
      {
        name: 'api-backend',
        fullName: 'alice/api-backend',
        url: 'https://github.com/alice/api-backend',
        description: 'REST API service',
        language: 'Python',
        stars: 12,
        forks: 3,
        updatedAt: '2026-09-15T12:00:00Z',
        languages: ['Python', 'Dockerfile']
      },
      {
        name: 'frontend-ui',
        fullName: 'alice/frontend-ui',
        url: 'https://github.com/alice/frontend-ui',
        description: 'Web dashboard',
        language: 'JavaScript',
        stars: 4,
        forks: 1,
        updatedAt: '2026-09-10T12:00:00Z',
        languages: ['JavaScript', 'HTML']
      }
    ]
  };

  await t.test('1. Builds explorer from valid verification data', () => {
    const explorer = buildEvidenceExplorer(sampleCrossVerification, sampleGithub);
    assert.ok(explorer);
    assert.ok(Array.isArray(explorer.skills));
    assert.equal(explorer.skills.length, 3);
  });

  await t.test('2. Correctly groups repositories by skill', () => {
    const explorer = buildEvidenceExplorer(sampleCrossVerification, sampleGithub);
    const pythonSkill = explorer.skills.find(s => s.skill === 'Python');
    assert.ok(pythonSkill);
    assert.equal(pythonSkill.repositories.length, 1);
    assert.equal(pythonSkill.repositories[0].name, 'api-backend');
    assert.equal(pythonSkill.repositories[0].evidence.length, 2);
  });

  await t.test('3. Preserves PROVED status and High confidence', () => {
    const explorer = buildEvidenceExplorer(sampleCrossVerification, sampleGithub);
    const pythonSkill = explorer.skills.find(s => s.skill === 'Python');
    assert.equal(pythonSkill.status, 'PROVED');
    assert.equal(pythonSkill.confidence, 'High');
  });

  await t.test('4. Preserves PARTIAL status and Moderate confidence', () => {
    const explorer = buildEvidenceExplorer(sampleCrossVerification, sampleGithub);
    const jsSkill = explorer.skills.find(s => s.skill === 'JavaScript');
    assert.equal(jsSkill.status, 'PARTIAL');
    assert.equal(jsSkill.confidence, 'Moderate');
  });

  await t.test('5. Preserves UNVERIFIED status and Unsubstantiated confidence', () => {
    const explorer = buildEvidenceExplorer(sampleCrossVerification, sampleGithub);
    const dockerSkill = explorer.skills.find(s => s.skill === 'Docker');
    assert.equal(dockerSkill.status, 'UNVERIFIED');
    assert.equal(dockerSkill.confidence, 'Unsubstantiated');
  });

  await t.test('6. Handles skill with zero repositories', () => {
    const explorer = buildEvidenceExplorer(sampleCrossVerification, sampleGithub);
    const dockerSkill = explorer.skills.find(s => s.skill === 'Docker');
    assert.ok(Array.isArray(dockerSkill.repositories));
    assert.equal(dockerSkill.repositories.length, 0);
    assert.equal(dockerSkill.evidenceSummary.repositories, 0);
  });

  await t.test('7. Handles missing evidence without throwing', () => {
    const partialCross = {
      results: [
        {
          skill: 'Rust',
          status: 'UNVERIFIED',
          repositories: null,
          evidence: null
        }
      ]
    };
    const explorer = buildEvidenceExplorer(partialCross, null);
    assert.equal(explorer.skills.length, 1);
    assert.equal(explorer.skills[0].skill, 'Rust');
    assert.equal(explorer.skills[0].repositories.length, 0);
  });

  await t.test('8. Handles empty input gracefully', () => {
    const empty1 = buildEvidenceExplorer(null, null);
    assert.deepEqual(empty1, { skills: [] });

    const empty2 = buildEvidenceExplorer({}, {});
    assert.deepEqual(empty2, { skills: [] });
  });

  await t.test('9. Does not fabricate evidence', () => {
    const emptyCross = {
      results: [
        { skill: 'Kubernetes', status: 'UNVERIFIED', repositories: [], evidence: [] }
      ]
    };
    const explorer = buildEvidenceExplorer(emptyCross, sampleGithub);
    const k8s = explorer.skills[0];
    assert.equal(k8s.repositories.length, 0);
    assert.equal(k8s.evidenceSummary.manifests, 0);
    assert.equal(k8s.evidenceSummary.languages, 0);
    assert.equal(k8s.evidenceSummary.configurations, 0);
  });

  await t.test('10. Preserves real GitHub URLs', () => {
    const explorer = buildEvidenceExplorer(sampleCrossVerification, sampleGithub);
    const pythonSkill = explorer.skills.find(s => s.skill === 'Python');
    assert.equal(pythonSkill.repositories[0].htmlUrl, 'https://github.com/alice/api-backend');
  });

  await t.test('11. Correctly calculates repository counts', () => {
    const multiRepoCross = {
      results: [
        {
          skill: 'TypeScript',
          status: 'PROVED',
          repositories: [{ name: 'repo-one' }, { name: 'repo-two' }],
          evidence: [
            { skill: 'TypeScript', repository: 'repo-one', evidenceType: 'dependency', details: 'package.json' },
            { skill: 'TypeScript', repository: 'repo-two', evidenceType: 'repository-language', details: 'TS detected' }
          ]
        }
      ]
    };
    const explorer = buildEvidenceExplorer(multiRepoCross, {});
    assert.equal(explorer.skills[0].evidenceSummary.repositories, 2);
    assert.equal(explorer.skills[0].repositories.length, 2);
  });

  await t.test('12. Correctly creates evidence summaries', () => {
    const explorer = buildEvidenceExplorer(sampleCrossVerification, sampleGithub);
    const pythonSkill = explorer.skills.find(s => s.skill === 'Python');
    assert.deepEqual(pythonSkill.evidenceSummary, {
      repositories: 1,
      commits: null,
      languages: 1,
      manifests: 1,
      configurations: 0,
      tests: 0,
      readmeReferences: 0
    });
  });

});
