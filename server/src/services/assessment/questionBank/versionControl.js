/**
 * SkillProof Assessment Question Bank - Version Control
 * 
 * Skills:
 * 1. Git
 * 2. GitHub
 * 3. GitLab
 * 
 * Strictly 5 questions per skill, progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard).
 */

export const VERSION_CONTROL_QUESTIONS = {
  // ==========================================
  // 1. Git
  // ==========================================
  'Git': [
    {
      id: 'git_q1',
      skill: 'Git',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write the Git commands to initialize a new repository, stage all modified files, and commit them with the message "Initial project commit".',
      starterCode: '# Initialize, stage, and commit:\n',
      expectedAnswer: 'git init\ngit add .\ngit commit -m "Initial project commit"',
      points: 20,
      validationCriteria: {
        requiredElements: ['git init', 'git add', 'git commit -m']
      },
      explanation: 'Core git lifecycle: git init creates repository metadata, git add stages files, and git commit creates snapshots.'
    },
    {
      id: 'git_q2',
      skill: 'Git',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write the Git commands to create and switch to a new branch named "feature/user-auth", make changes, and push the branch to the remote origin while setting the upstream tracking branch.',
      starterCode: '# Create branch and push with tracking:\n',
      expectedAnswer: 'git checkout -b feature/user-auth\n# (or git switch -c feature/user-auth)\ngit push -u origin feature/user-auth',
      points: 20,
      validationCriteria: {
        requiredElements: ['feature/user-auth', 'git push', '-u origin']
      },
      explanation: 'git checkout -b or git switch -c branches off current HEAD; -u sets upstream tracking.'
    },
    {
      id: 'git_q3',
      skill: 'Git',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write the Git command to undo the most recent commit on the current branch while keeping all modified files staged in the working index (a soft reset).',
      starterCode: '# Undo last commit keeping files staged:\n',
      expectedAnswer: 'git reset --soft HEAD~1',
      points: 20,
      validationCriteria: {
        requiredElements: ['git reset', '--soft', 'HEAD~1']
      },
      explanation: 'git reset --soft HEAD~1 moves branch pointer backward by one commit without disturbing staging index.'
    },
    {
      id: 'git_q4',
      skill: 'Git',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write the Git commands to stash your uncommitted work with a message "wip-feature", switch to "main" to pull latest changes, switch back to your branch, and re-apply the stashed work.',
      starterCode: '# Stash, update main, and re-apply:\n',
      expectedAnswer: 'git stash push -m "wip-feature"\ngit checkout main\ngit pull origin main\ngit checkout feature/user-auth\ngit stash pop',
      points: 20,
      validationCriteria: {
        requiredElements: ['git stash', 'git checkout main', 'git pull', 'git stash pop']
      },
      explanation: 'git stash safely shelving uncommitted changes on a dirty working tree.'
    },
    {
      id: 'git_q5',
      skill: 'Git',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain how to resolve a merge conflict between two branches in Git: describe how conflict markers (<<<<<<<, =======, >>>>>>>) identify conflicting changes and list the exact commands to stage the resolution and conclude the merge.',
      starterCode: '# Resolving Git Merge Conflicts:\n# 1. Understanding conflict markers:\n# 2. Resolution steps and finalization commands:\n',
      expectedAnswer: '1. In the conflicting file, <<<<<<< HEAD marks the current branch version, ======= divides changes, and >>>>>>> branch_name marks the incoming branch changes. The developer edits the file to retain desired code and removes marker lines.\n2. Commands:\ngit add <conflicted_file>\ngit commit -m "Merge branch \'feature\' and resolve conflicts" (or git merge --continue)',
      points: 20,
      validationCriteria: {
        requiredElements: ['<<<<<<<', '=======', '>>>>>>>', 'git add', 'git commit']
      },
      explanation: 'Conflict resolution involves manual reconciliation between divergent diffs followed by staging and commit.'
    }
  ],

  // ==========================================
  // 2. GitHub
  // ==========================================
  'GitHub': [
    {
      id: 'github_q1',
      skill: 'GitHub',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write the commands to clone a public GitHub repository "https://github.com/org/project.git", check remote configuration with git remote -v, and fetch all branches.',
      starterCode: '# Clone, check remotes, fetch:\n',
      expectedAnswer: 'git clone https://github.com/org/project.git\ncd project\ngit remote -v\ngit fetch --all',
      points: 20,
      validationCriteria: {
        requiredElements: ['git clone', 'git remote -v', 'git fetch']
      },
      explanation: 'Clones repository and inspects upstream remote pointers.'
    },
    {
      id: 'github_q2',
      skill: 'GitHub',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Describe the complete GitHub Pull Request (PR) workflow: from branching locally, pushing to GitHub, opening a PR via the UI or GitHub CLI ("gh pr create"), code review, and merging.',
      starterCode: '# GitHub Pull Request Workflow:\n# 1. Branch and push:\n# 2. Open PR:\n# 3. Review and Merge:\n',
      expectedAnswer: '1. Create a descriptive feature branch locally (git checkout -b feature-name), commit changes, and push to GitHub (git push -u origin feature-name).\n2. Open a Pull Request comparing feature-name against main using the GitHub UI or `gh pr create --title "..." --body "..."`.\n3. Teammates review code, leave comments, CI checks run automatically, and once approved, merge via Squash and Merge or Rebase.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Pull Request', 'gh pr create', 'review', 'merge']
      },
      explanation: 'Pull Requests facilitate peer code review, continuous integration verification, and auditability.'
    },
    {
      id: 'github_q3',
      skill: 'GitHub',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain GitHub Branch Protection Rules: list at least 3 critical protection settings enabled on the "main" branch in production repositories.',
      starterCode: '# Key GitHub Branch Protection Rules:\n# 1.\n# 2.\n# 3.\n',
      expectedAnswer: '1. Require a pull request before merging (with at least 1-2 peer approvals).\n2. Require status checks to pass before merging (e.g. CI test pipelines, linter).\n3. Require branches to be up to date before merging and restrict direct pushes (no force push / branch deletion).',
      points: 20,
      validationCriteria: {
        requiredElements: ['require a pull request', 'status checks', 'direct push', 'approval']
      },
      explanation: 'Branch protection ensures no code reaches production without automated tests and peer approvals.'
    },
    {
      id: 'github_q4',
      skill: 'GitHub',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Explain how to synchronize a forked GitHub repository with the upstream original repository using Git CLI commands.',
      starterCode: '# Syncing Fork with Upstream:\n# 1. Add upstream remote:\n# 2. Fetch and merge:\n# 3. Push to your origin:\n',
      expectedAnswer: 'git remote add upstream https://github.com/original-owner/repo.git\ngit fetch upstream\ngit checkout main\ngit merge upstream/main\ngit push origin main',
      points: 20,
      validationCriteria: {
        requiredElements: ['git remote add upstream', 'git fetch upstream', 'git merge upstream/main', 'git push origin main']
      },
      explanation: 'Upstream remotes track the parent source repo to incorporate ongoing contributions into forks.'
    },
    {
      id: 'github_q5',
      skill: 'GitHub',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the difference between GitHub Repository Secrets and GitHub Environment Secrets, and explain how to protect production deployment environments with required reviewers.',
      starterCode: '# GitHub Secrets & Environments:\n# 1. Repository vs Environment Secrets:\n# 2. Environment Protection Rules (Required Reviewers):\n',
      expectedAnswer: 'Repository Secrets are accessible to all workflows across all branches in the repo.\nEnvironment Secrets are scoped specifically to designated deployment Environments (e.g., "production").\nEnvironment Protection Rules allow repository admins to mandate that any workflow job targeting "production" pauses execution until designated Required Reviewers explicitly review and approve the deployment in GitHub.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Repository Secrets', 'Environment Secrets', 'Required Reviewers', 'production']
      },
      explanation: 'Environment secrets and required approvals prevent unauthorized deployments to production infrastructure.'
    }
  ],

  // ==========================================
  // 3. GitLab
  // ==========================================
  'GitLab': [
    {
      id: 'gitlab_q1',
      skill: 'GitLab',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a basic GitLab CI/CD configuration (.gitlab-ci.yml) defining two sequential stages: "test" and "build", with a job "unit_test" running "npm test" under the test stage.',
      starterCode: 'stages:\n  - test\n  - build\n\nunit_test:\n  # Job definition\n',
      expectedAnswer: 'stages:\n  - test\n  - build\n\nunit_test:\n  stage: test\n  image: node:20\n  script:\n    - npm install\n    - npm test',
      points: 20,
      validationCriteria: {
        requiredElements: ['stages:', '- test', '- build', 'stage: test', 'script:']
      },
      explanation: '.gitlab-ci.yml defines multi-stage pipelines executed by GitLab Runners.'
    },
    {
      id: 'gitlab_q2',
      skill: 'GitLab',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain the difference between a GitLab Merge Request (MR) and a GitHub Pull Request (PR), and list the command to push a branch with a Git push option to automatically open an MR.',
      starterCode: '# GitLab MR push option:\ngit push -o merge_request.create ...\n# Concept:\n',
      expectedAnswer: 'git push -u origin feature-branch -o merge_request.create -o merge_request.target=main\nConcept: GitLab uses the term "Merge Request" (MR) instead of Pull Request (PR), providing built-in issue linking, integrated CI pipeline visualization, and review apps directly within the MR UI.',
      points: 20,
      validationCriteria: {
        requiredElements: ['merge_request.create', 'Merge Request', 'target=main']
      },
      explanation: 'Git push options (-o) allow CLI creation of GitLab Merge Requests without visiting the web UI.'
    },
    {
      id: 'gitlab_q3',
      skill: 'GitLab',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'In .gitlab-ci.yml, configure caching for "node_modules/" based on package-lock.json so dependencies are shared between jobs and pipeline runs.',
      starterCode: 'default:\n  cache:\n    # Define cache key and paths\n',
      expectedAnswer: 'default:\n  cache:\n    key:\n      files:\n        - package-lock.json\n    paths:\n      - node_modules/',
      points: 20,
      validationCriteria: {
        requiredElements: ['cache:', 'key:', 'package-lock.json', 'paths:', 'node_modules/']
      },
      explanation: 'Keying caches to lockfiles ensures caches are reused until dependencies change.'
    },
    {
      id: 'gitlab_q4',
      skill: 'GitLab',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Configure a deploy job in .gitlab-ci.yml that only executes on the "main" branch, runs in the "production" environment, and requires manual approval ("when: manual").',
      starterCode: 'deploy_prod:\n  stage: deploy\n  # Add environment, rules, and manual execution\n',
      expectedAnswer: 'deploy_prod:\n  stage: deploy\n  environment:\n    name: production\n    url: https://example.com\n  rules:\n    - if: $CI_COMMIT_BRANCH == "main"\n      when: manual\n  script:\n    - ./deploy.sh',
      points: 20,
      validationCriteria: {
        requiredElements: ['environment:', 'production', 'rules:', '$CI_COMMIT_BRANCH == "main"', 'when: manual']
      },
      explanation: 'when: manual creates gated promotion buttons for human approval before production deployments.'
    },
    {
      id: 'gitlab_q5',
      skill: 'GitLab',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the difference between GitLab Shared Runners and Specific/Group Runners, and describe how CI tags ("tags:") route specialized jobs (e.g., GPU or Docker-in-Docker) to designated runners.',
      starterCode: '# GitLab Runner Architecture & Tags:\n# Shared vs Specific Runners:\n# Job routing with tags:\n',
      expectedAnswer: 'Shared Runners are pooled instances provided by GitLab for all projects.\nSpecific/Group Runners are dedicated machines registered to specific projects or groups, running custom hardware or inside private VPCs.\nJob Routing with tags: In .gitlab-ci.yml, specifying `tags: [docker, dind, gpu]` instructs the GitLab coordinator to dispatch the job ONLY to runners registered with matching tags.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Shared Runners', 'Specific Runners', 'tags:', 'Docker-in-Docker']
      },
      explanation: 'Runner tags ensure compute-intensive or privileged jobs land on appropriately configured infrastructure.'
    }
  ]
};
