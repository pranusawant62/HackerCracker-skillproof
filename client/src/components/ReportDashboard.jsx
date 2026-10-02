import React, { useState } from 'react';
import { 
  FileSearch, 
  ShieldCheck, 
  GitBranch, 
  Award, 
  HelpCircle, 
  BarChart3,
  FileCheck2,
  Github,
  Hash,
  BookOpen,
  Code2,
  Terminal,
  Cpu,
  Database,
  Cloud,
  Layers,
  Wrench,
  AlertTriangle,
  ExternalLink,
  Star,
  GitFork,
  Check,
  AlertCircle,
  FolderGit2,
  PlusCircle
} from 'lucide-react';
import CrossVerificationSection from './CrossVerificationSection.jsx';
import FinalReportSection from './FinalReportSection.jsx';
import EvidenceExplorer from './EvidenceExplorer.jsx';
import JobMatchSection from './JobMatchSection.jsx';
import IdentityVerificationSection from './IdentityVerificationSection.jsx';
import SkillVerificationDashboard from './SkillVerificationDashboard.jsx';
import AddSkillModal from './AddSkillModal.jsx';
import AddEvidenceModal from './AddEvidenceModal.jsx';
import SkillGapSection from './SkillGapSection.jsx';
import SkillGrowthSection from './SkillGrowthSection.jsx';
import AiSkillAnalysisSection from './AiSkillAnalysisSection.jsx';

// Category icon helper
function getCategoryIcon(category = '') {
  const cat = category.toLowerCase();
  if (cat.includes('program') || cat.includes('language')) return <Code2 size={16} color="var(--accent-secondary)" />;
  if (cat.includes('front')) return <Layers size={16} color="#60a5fa" />;
  if (cat.includes('back')) return <Terminal size={16} color="#34d399" />;
  if (cat.includes('database')) return <Database size={16} color="#fbbf24" />;
  if (cat.includes('cloud')) return <Cloud size={16} color="#38bdf8" />;
  if (cat.includes('devops')) return <Cpu size={16} color="#a78bfa" />;
  if (cat.includes('tool')) return <Wrench size={16} color="#f472b6" />;
  return <Award size={16} color="var(--accent-primary)" />;
}

// Canonical display order for skill categories
const CATEGORY_ORDER = [
  'Programming Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Cloud',
  'DevOps',
  'AI / ML',
  'Data',
  'Tools'
];

/**
 * ReportDashboard Component
 * 
 * Renders:
 * - Empty state: Before upload
 * - Stage 1: Resume Ingestion & Parsing metrics
 * - Stage 2: Claimed Skills Detected grouped by category
 * - Stage 3: GitHub Repository Evidence (User profile, Analyzed repos, Technology evidence)
 */
export default function ReportDashboard({ 
  session,
  extractionResult,
  onReset,
  onSkillAdded,
  onEvidenceSubmitted,
  onSkillDeleted,
  activeView = 'dashboard',
  setActiveView
}) {
  const [isStage2AddSkillOpen, setIsStage2AddSkillOpen] = useState(false);
  const [jobMatchResult, setJobMatchResult] = useState(null);
  const [gapEvidenceSkill, setGapEvidenceSkill] = useState(null);

  const activeSession = session || extractionResult;

  if (!activeSession) {
    if (activeView !== 'dashboard') {
      const viewTitle = activeView === 'skills' 
        ? 'Skill Verification' 
        : activeView === 'evidence' 
        ? 'Evidence View' 
        : activeView === 'job-match'
        ? 'Job Match Analysis'
        : activeView === 'skill-gaps'
        ? 'Skill Gaps & Micro-Tasks'
        : activeView === 'growth'
        ? 'Skill Growth Tracking'
        : activeView === 'ai-analysis'
        ? 'AI Skill Analysis'
        : 'Dashboard View';

      return (
        <section className="report-placeholder-card">
          <div className="placeholder-icon-wrap">
            <ShieldCheck size={28} color="var(--accent-secondary)" />
          </div>
          <h3 className="placeholder-title">{viewTitle}</h3>
          <p className="placeholder-text">
            Upload your resume PDF and enter your GitHub username on the Dashboard to populate verified data for this section.
          </p>
          <div style={{ marginTop: '1.25rem' }}>
            <button 
              type="button" 
              className="btn-add-skill-primary" 
              onClick={() => setActiveView && setActiveView('dashboard')}
              style={{ margin: '0 auto', padding: '0.5rem 1.25rem' }}
            >
              <span>Go to Dashboard</span>
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="report-placeholder-card">
        <div className="placeholder-icon-wrap">
          <FileSearch size={28} />
        </div>
        
        <h3 className="placeholder-title">SkillProof Verification Report</h3>
        <p className="placeholder-text">
          Upload your resume PDF and enter your GitHub username above to generate your live verification breakdown.
        </p>

        <div className="feature-pills-row">
          <div className="feature-pill">
            <ShieldCheck size={14} color="var(--status-verified)" />
            <span>Verified Skills with Direct Proof</span>
          </div>
          <div className="feature-pill">
            <HelpCircle size={14} color="var(--status-weak)" />
            <span>Skills with Weak / No Evidence</span>
          </div>
          <div className="feature-pill">
            <GitBranch size={14} color="var(--accent-secondary)" />
            <span>Repository & Commit Evidence Links</span>
          </div>
          <div className="feature-pill">
            <BarChart3 size={14} color="var(--accent-primary)" />
            <span>Overall Proof Confidence Score</span>
          </div>
        </div>
      </section>
    );
  }

  // Active session is the single source of truth for skills and verification status
  const claimedSkills = activeSession?.claimedSkills || [];

  const calculateMetrics = (skillsList) => {
    const total = skillsList.length;
    let proven = 0;
    let partiallyProven = 0;
    let unverified = 0;
    skillsList.forEach(s => {
      const st = String(s.status || '').toLowerCase();
      if (st === 'proven' || st === 'proved') proven++;
      else if (st === 'partially_proven' || st === 'partial') partiallyProven++;
      else unverified++;
    });
    const rate = total > 0 ? Math.round(((proven + partiallyProven * 0.5) / total) * 100) : 0;
    return { total, proven, partiallyProven, unverified, verificationRate: rate };
  };

  const summary = calculateMetrics(claimedSkills);

  const { 
    sessionId = activeSession?.sessionId,
    githubUsername = activeSession?.githubUsername, 
    resume = activeSession?.resume, 
    github = activeSession?.github, 
    githubError = activeSession?.githubError, 
    crossVerification = activeSession?.crossVerification,
    identityVerification = activeSession?.identityVerification,
    isBlocked = activeSession?.identityStatus === 'blocked' || activeSession?.isBlocked,
    blockReason = activeSession?.blockReason
  } = activeSession || {};

  // Group skills by category for Stage 2
  const groupedSkills = claimedSkills.reduce((acc, curr) => {
    const category = curr.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(curr);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedSkills).sort((a, b) => {
    const idxA = CATEGORY_ORDER.indexOf(a);
    const idxB = CATEGORY_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const renderGitHubEvidence = () => (
    <section className="github-evidence-card">
      <div className="skills-stage-header">
        <div>
          <span className="skills-stage-badge" style={{ background: 'rgba(99, 102, 241, 0.12)', borderColor: 'rgba(99, 102, 241, 0.35)', color: '#818cf8' }}>
            <GitBranch size={16} />
            <span>Stage 3: GitHub Evidence</span>
          </span>
          <h3 style={{ fontSize: '1.5rem', marginTop: '0.65rem' }}>
            OBSERVABLE REPOSITORY EVIDENCE
          </h3>
        </div>
        {github?.evidence?.length > 0 && (
          <span className="skills-count-pill" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}>
            {github.evidence.length} Evidence {github.evidence.length === 1 ? 'Point' : 'Points'} Found
          </span>
        )}
      </div>

      {/* GitHub Error Notification */}
      {githubError && (
        <div className="github-error-card">
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.35rem' }}>
              GitHub analysis could not be completed.
            </strong>
            <span>{githubError}</span>
          </div>
        </div>
      )}

      {/* Security Gate Blocked Notification */}
      {isBlocked && (
        <div className="github-error-card" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.35)' }}>
          <AlertCircle size={24} style={{ flexShrink: 0, color: '#f87171' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.35rem', color: '#f87171' }}>
              GitHub Repository Analysis Blocked
            </strong>
            <span>Because candidate identity verification did not pass, repositories from @{githubUsername} cannot be inspected or credited as skill evidence for this resume.</span>
          </div>
        </div>
      )}

      {/* GitHub User Profile Header Card */}
      {github?.profile && (
        <div className="github-profile-box">
          <div className="github-profile-left">
            {github.profile.avatarUrl ? (
              <img 
                src={github.profile.avatarUrl} 
                alt={github.profile.username}
                className="github-avatar"
              />
            ) : (
              <div className="github-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Github size={30} />
              </div>
            )}
            <div className="github-user-info">
              <h4>@{github.profile.username}</h4>
              <div className="github-stats-row">
                <span className="github-stat-item">
                  <FolderGit2 size={15} color="var(--accent-secondary)" />
                  <strong>{github.profile.publicRepositories}</strong> public repos
                </span>
                <span className="github-stat-item">
                  <strong>{github.profile.followers.toLocaleString()}</strong> followers
                </span>
              </div>
            </div>
          </div>

          <a 
            href={github.profile.profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-github-profile"
          >
            <Github size={16} />
            <span>View GitHub Profile</span>
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Analyzed Repositories Cards Grid */}
      {github?.repositories && github.repositories.length > 0 && (
        <div>
          <h4 className="repo-grid-title">
            <FolderGit2 size={18} color="var(--accent-secondary)" />
            <span>Analyzed Repositories ({github.repositories.length})</span>
          </h4>

          <div className="repos-container">
            {github.repositories.map((repo) => (
              <div key={repo.name} className="repo-item-card">
                <div className="repo-card-top">
                  <div className="repo-card-header">
                    <span className="repo-title">{repo.name}</span>
                    {repo.stars > 0 && (
                      <span className="repo-stars" title={`${repo.stars} stars`}>
                        <Star size={13} fill="#facc15" />
                        <span>{repo.stars.toLocaleString()}</span>
                      </span>
                    )}
                  </div>

                  <p className="repo-desc">
                    {repo.description}
                  </p>

                  {/* Detected Languages */}
                  {repo.languages && repo.languages.length > 0 && (
                    <div className="repo-languages-pills">
                      {repo.languages.slice(0, 5).map((lang) => (
                        <span key={lang} className="repo-lang-pill">
                          {lang}
                        </span>
                      ))}
                      {repo.languages.length > 5 && (
                        <span className="repo-lang-pill" style={{ opacity: 0.6 }}>
                          +{repo.languages.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Observable Technology Evidence Box */}
                  {repo.evidence && repo.evidence.length > 0 ? (
                    <div className="repo-evidence-box">
                      <div className="repo-evidence-header">Observable Evidence</div>
                      <div className="evidence-list">
                        {repo.evidence.map((ev, idx) => {
                          const isDep = ev.evidenceType === 'dependency';
                          const isManifest = ev.evidenceType === 'manifest';
                          const tagClass = isDep ? 'dependency' : (isManifest ? 'manifest' : 'language');
                          const tagLabel = isDep 
                            ? 'Detected Dependency' 
                            : (isManifest ? 'Detected Manifest' : 'Supporting Evidence');

                          return (
                            <div key={idx} className="evidence-row">
                              <div className="evidence-left">
                                <Check size={14} color={isDep ? 'var(--status-verified)' : 'var(--accent-secondary)'} />
                                <span>{ev.skill}</span>
                              </div>
                              <span className={`evidence-tag ${tagClass}`}>
                                {tagLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="repo-evidence-box" style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
                      No direct taxonomy evidence detected in this repository.
                    </div>
                  )}
                </div>

                <div className="repo-card-bottom">
                  <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-repo-view"
                  >
                    <span>View Repository</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no GitHub profile is linked */}
      {!github?.profile && !githubError && !isBlocked && (
        <div className="repos-empty-state" style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
          <FolderGit2 size={24} style={{ color: 'var(--text-subtle)', margin: '0 auto 0.5rem auto' }} />
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No GitHub repositories currently linked. You can manually attach repository proof, URLs, or certificates to each skill below.
          </p>
        </div>
      )}
    </section>
  );

  return (
    <div id="dashboard-section">
      {/* ========================================================
          View: Dashboard (Overview, Stages 1-5)
          ======================================================== */}
      {activeView === 'dashboard' && (
        <div id="dashboard-view" className="spa-view-container">
          {/* Candidate Identity Verification (Security Gate) */}
          {identityVerification && (
            <IdentityVerificationSection 
              identityVerification={identityVerification}
              isBlocked={isBlocked}
              blockReason={blockReason}
            />
          )}

          {/* Stage 1: Resume Ingestion Status */}
          <section className="extraction-success-card">
            <div className="success-header">
              <div>
                <span className="success-badge">
                  <FileCheck2 size={16} />
                  <span>Stage 1: Resume Ingestion</span>
                </span>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.65rem' }}>
                  Resume Parsed Successfully
                </h3>
              </div>
            </div>

            {/* Ingestion & Parsing Metrics Grid */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-wrap">
                  <FileCheck2 size={20} color="var(--status-verified)" />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Filename</span>
                  <span className="metric-value" title={resume?.filename}>
                    {resume?.filename || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap">
                  <BookOpen size={20} color="var(--accent-secondary)" />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Page Count</span>
                  <span className="metric-value">
                    {resume?.pages ? `${resume.pages} ${resume.pages === 1 ? 'Page' : 'Pages'}` : '1 Page'}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap">
                  <Hash size={20} color="var(--accent-primary)" />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Extracted Chars</span>
                  <span className="metric-value">
                    {resume?.textLength ? `${resume.textLength.toLocaleString()} characters` : '0 characters'}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap">
                  <Github size={20} color="#f8fafc" />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Target GitHub</span>
                  <span className="metric-value" title={`@${githubUsername}`}>
                    @{githubUsername}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Stage 2: Skills Detected (Claimed Skills) */}
          <section className="skills-detected-card">
            <div className="skills-stage-header">
              <div>
                <span className="skills-stage-badge">
                  <ShieldCheck size={16} />
                  <span>Stage 2: Skills Detected</span>
                </span>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.65rem' }}>
                  CLAIMED SKILLS
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {claimedSkills.length > 0 && (
                  <span className="skills-count-pill">
                    {claimedSkills.length} {claimedSkills.length === 1 ? 'Skill' : 'Skills'} Identified
                  </span>
                )}
                {!isBlocked && (
                  <button
                    type="button"
                    className="btn-add-skill-primary"
                    onClick={() => setIsStage2AddSkillOpen(true)}
                    title="Add a technical skill manually to claimed skills"
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                  >
                    <PlusCircle size={15} />
                    <span>+ Add Skill</span>
                  </button>
                )}
              </div>
            </div>

            {claimedSkills.length === 0 ? (
              <div className="no-skills-banner">
                <AlertTriangle size={24} color="#f59e0b" />
                <span>No recognized technical skills were found in this resume.</span>
              </div>
            ) : (
              <div>
                {sortedCategories.map((category) => {
                  const skills = groupedSkills[category];
                  return (
                    <div key={category} className="skills-category-group">
                      <div className="skills-category-title">
                        {getCategoryIcon(category)}
                        <span>{category}</span>
                        <span className="skills-category-count">({skills.length})</span>
                      </div>

                      <div className="skill-pill-list">
                        {skills.map((item) => (
                          <div 
                            key={item.id || item.skill} 
                            className={`skill-pill ${item.claimSource === 'manual' ? 'pill-manual-source' : ''}`}
                            title={item.claimSource === 'manual' ? 'Added manually by candidate' : (item.matchedTerm !== item.skill ? `Matched in resume as: "${item.matchedTerm}"` : `Matched as: "${item.skill}"`)}
                          >
                            <span className="skill-pill-dot" />
                            <span>{item.skill}</span>
                            {item.claimSource === 'manual' && (
                              <span className="skill-pill-manual-tag">Manual</span>
                            )}
                            {item.matchedTerm && item.claimSource !== 'manual' && item.matchedTerm.toLowerCase() !== item.skill.toLowerCase() && (
                              <span className="skill-pill-alias">({item.matchedTerm})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Stage 3: GitHub Evidence Section */}
          {renderGitHubEvidence()}

          {/* Stage 4: Cross-Verification Results */}
          <CrossVerificationSection 
            crossVerification={crossVerification} 
            claimedSkills={claimedSkills} 
            github={github} 
          />

          {/* Stage 5: Final SkillProof Report */}
          <FinalReportSection 
            extractionResult={activeSession} 
            onReset={onReset} 
            onNavigate={(view) => setActiveView && setActiveView(view)}
          />
        </div>
      )}

      {/* ========================================================
          View: Skill Verification
          ======================================================== */}
      {activeView === 'skills' && (
        <div id="skills-view" className="spa-view-container">
          {!isBlocked && (
            <SkillVerificationDashboard 
              key={activeSession?.updatedAt || activeSession?.sessionId}
              sessionId={sessionId}
              githubUsername={githubUsername}
              claimedSkills={claimedSkills}
              summary={summary}
              onSkillAdded={onSkillAdded}
              onEvidenceSubmitted={onEvidenceSubmitted}
              onSkillDeleted={onSkillDeleted}
            />
          )}
        </div>
      )}

      {/* ========================================================
          View: Evidence (Verification Dashboard + Explorer + GitHub)
          ======================================================== */}
      {activeView === 'evidence' && (
        <div id="evidence-view" className="spa-view-container">
          {/* Multi-Source Skill Verification & Direct Evidence Cards */}
          {!isBlocked && (
            <SkillVerificationDashboard 
              key={activeSession?.updatedAt || activeSession?.sessionId}
              sessionId={sessionId}
              githubUsername={githubUsername}
              claimedSkills={claimedSkills}
              summary={summary}
              onSkillAdded={onSkillAdded}
              onEvidenceSubmitted={onEvidenceSubmitted}
              onSkillDeleted={onSkillDeleted}
            />
          )}

          {/* Stage 7: Evidence Explorer */}
          <EvidenceExplorer 
            crossVerification={crossVerification}
            github={github}
            onNavigate={(view) => setActiveView && setActiveView(view)}
          />

          {/* Stage 3: GitHub Evidence Section */}
          {renderGitHubEvidence()}
        </div>
      )}

      {/* ========================================================
          View: Job Match
          ======================================================== */}
      {activeView === 'job-match' && (
        <div id="job-match-view" className="spa-view-container">
          <JobMatchSection 
            claimedSkills={claimedSkills}
            crossVerification={crossVerification}
            sessionId={activeSession?.sessionId || activeSession?.id}
            onMatchAnalyzed={(res) => setJobMatchResult(res)}
          />
        </div>
      )}

      {/* ========================================================
          View: Skill Gaps
          ======================================================== */}
      {activeView === 'skill-gaps' && (
        <div id="skill-gaps-view" className="spa-view-container">
          <SkillGapSection 
            jobMatchResult={jobMatchResult}
            claimedSkills={claimedSkills}
            sessionId={sessionId}
            onStartTask={(skillName) => setGapEvidenceSkill(skillName)}
          />
        </div>
      )}

      {/* ========================================================
          View: Growth
          ======================================================== */}
      {activeView === 'growth' && (
        <div id="growth-view" className="spa-view-container">
          <SkillGrowthSection 
            jobMatchResult={jobMatchResult}
            claimedSkills={claimedSkills}
            sessionId={sessionId}
            onStartTask={(skillName) => setGapEvidenceSkill(skillName)}
          />
        </div>
      )}

      {/* ========================================================
          View: AI Analysis
          ======================================================== */}
      {activeView === 'ai-analysis' && (
        <div id="ai-analysis-view" className="spa-view-container">
          <AiSkillAnalysisSection 
            jobMatchResult={jobMatchResult}
            claimedSkills={claimedSkills}
            sessionId={sessionId}
            github={github}
            onStartTask={(skillName) => setGapEvidenceSkill(skillName)}
          />
        </div>
      )}

      {/* Evidence Submission Modal for Skill Gaps */}
      {gapEvidenceSkill && (
        <AddEvidenceModal
          isOpen={Boolean(gapEvidenceSkill)}
          onClose={() => setGapEvidenceSkill(null)}
          skill={{
            skill: gapEvidenceSkill,
            name: gapEvidenceSkill
          }}
          sessionId={sessionId}
          githubUsername={githubUsername}
          onEvidenceSubmitted={(res) => {
            setGapEvidenceSkill(null);
            if (onEvidenceSubmitted) onEvidenceSubmitted(res);
          }}
        />
      )}

      {/* Add Skill Modal triggered from Stage 2 Header */}
      <AddSkillModal
        isOpen={isStage2AddSkillOpen}
        onClose={() => setIsStage2AddSkillOpen(false)}
        sessionId={sessionId}
        onSkillAdded={onSkillAdded}
      />
    </div>
  );
}
