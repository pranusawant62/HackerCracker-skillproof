import React, { useState, useMemo } from 'react';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FolderGit2, 
  ExternalLink, 
  FileText, 
  Github, 
  RotateCcw, 
  Printer, 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  Code2, 
  Terminal, 
  Database, 
  Cloud, 
  Cpu, 
  Wrench, 
  Check, 
  ArrowRight,
  Info,
  Calendar,
  Percent,
  Target
} from 'lucide-react';

function getCategoryIcon(category = '') {
  const cat = category.toLowerCase();
  if (cat.includes('program') || cat.includes('language')) return <Code2 size={15} color="var(--accent-secondary)" />;
  if (cat.includes('front')) return <Layers size={15} color="#60a5fa" />;
  if (cat.includes('back')) return <Terminal size={15} color="#34d399" />;
  if (cat.includes('database')) return <Database size={15} color="#fbbf24" />;
  if (cat.includes('cloud')) return <Cloud size={15} color="#38bdf8" />;
  if (cat.includes('devops')) return <Cpu size={15} color="#a78bfa" />;
  if (cat.includes('tool')) return <Wrench size={15} color="#f472b6" />;
  return <Award size={15} color="var(--accent-primary)" />;
}

export default function FinalReportSection({ extractionResult, session, onReset, onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const activeData = extractionResult || session;
  if (!activeData) return null;

  const { 
    githubUsername, 
    resume, 
    claimedSkills = [], 
    github, 
    crossVerification 
  } = activeData;

  // Use crossVerification results or fallback
  const results = crossVerification?.results || claimedSkills.map(c => ({
    skill: c.skill,
    category: c.category || 'Other',
    matchedTerm: c.matchedTerm || c.skill,
    resumeClaim: {
      skill: c.skill,
      category: c.category || 'Other',
      matchedTerm: c.matchedTerm || c.skill
    },
    status: 'UNVERIFIED',
    explanation: 'No observable evidence was found in public repositories, commit language statistics, or package manifests.',
    repositories: [],
    evidence: []
  }));

  const summary = crossVerification?.summary || {
    totalClaimed: claimedSkills.length,
    proved: 0,
    partial: 0,
    unverified: claimedSkills.length,
    verificationRate: 0,
    assessment: 'This SkillProof verification report objectively contrasts technical skills claimed on the uploaded resume with observable, empirical evidence from public GitHub repositories, commit language breakdowns, and package/build manifests. Skills without observable codebase or manifest artifacts remain unverified.'
  };

  const total = summary.totalClaimed || results.length || 0;
  const proved = summary.proved || 0;
  const partial = summary.partial || 0;
  const unverified = summary.unverified || 0;
  const proofRate = total > 0 ? Math.round(((proved + (partial * 0.5)) / total) * 100) : 0;

  // Filter & Search
  const filteredSkills = useMemo(() => {
    return results.filter(item => {
      // Status filter
      if (activeFilter === 'PROVED' && item.status !== 'PROVED') return false;
      if (activeFilter === 'PARTIAL' && item.status !== 'PARTIAL') return false;
      if (activeFilter === 'UNVERIFIED' && item.status !== 'UNVERIFIED') return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const skillMatch = item.skill.toLowerCase().includes(query);
        const categoryMatch = (item.category || '').toLowerCase().includes(query);
        const repoMatch = (item.repositories || []).some(r => r.name.toLowerCase().includes(query));
        return skillMatch || categoryMatch || repoMatch;
      }

      return true;
    });
  }, [results, activeFilter, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="final-report-card" id="final-report">
      {/* Header Banner */}
      <div className="final-report-header">
        <div className="report-title-area">
          <div className="final-stage-badge">
            <Sparkles size={16} />
            <span>Stage 5: Final SkillProof Report</span>
          </div>
          <h2 className="report-main-heading">
            FINAL SKILLPROOF REPORT
          </h2>
          <p className="report-subheading">
            Objective verification comparing candidate resume claims with observable GitHub repository evidence.
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="report-header-actions no-print">
          <button 
            type="button" 
            className="btn-report-action secondary" 
            onClick={handlePrint}
            title="Print or Save Report as PDF"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>

          {onReset && (
            <button 
              type="button" 
              className="btn-report-action primary" 
              onClick={onReset}
              title="Start a new verification with different resume or GitHub user"
            >
              <RotateCcw size={15} />
              <span>Start New Verification</span>
            </button>
          )}
        </div>
      </div>

      {/* Candidate & Verification Meta Strip */}
      <div className="report-meta-strip">
        <div className="meta-strip-item">
          <FileText size={16} color="var(--accent-secondary)" />
          <span>Resume:</span>
          <strong>{resume?.filename || 'Uploaded Resume'}</strong>
          <span className="meta-sub">({resume?.pages || 1} {resume?.pages === 1 ? 'Page' : 'Pages'})</span>
        </div>

        <div className="meta-strip-item">
          <Github size={16} color="#ffffff" />
          <span>Target GitHub:</span>
          <strong>@{githubUsername}</strong>
        </div>

        <div className="meta-strip-item">
          <FolderGit2 size={16} color="#a78bfa" />
          <span>Repositories Analyzed:</span>
          <strong>{github?.repositories?.length || 0} Repos</strong>
        </div>

        <div className="meta-strip-item">
          <Calendar size={16} color="#34d399" />
          <span>Verified At:</span>
          <strong>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
        </div>
      </div>

      {/* Overall Verification Summary Notice */}
      <div className="overall-summary-notice">
        <div className="notice-icon-box">
          <Info size={20} color="var(--accent-secondary)" />
        </div>
        <div className="notice-content">
          <h4 className="notice-title">Overall Verification Summary</h4>
          <p className="notice-body">
            This SkillProof verification report objectively contrasts technical skills claimed on the candidate's resume with observable, empirical evidence from public GitHub repositories, commit language breakdowns, and package/build manifests. Skills without observable codebase or manifest artifacts remain strictly <strong>UNVERIFIED</strong>. No evidence has been inferred or fabricated.
          </p>
        </div>
      </div>

      {/* Summary Scorecard Grid */}
      <div className="report-scorecard-grid">
        {/* Total Claimed */}
        <div className="scorecard-item total">
          <div className="scorecard-top">
            <span className="scorecard-label">Total Claimed Skills</span>
            <FileText size={18} color="var(--accent-primary)" />
          </div>
          <div className="scorecard-number">{total}</div>
          <div className="scorecard-sub">From resume taxonomy</div>
        </div>

        {/* Proved */}
        <div className="scorecard-item proved">
          <div className="scorecard-top">
            <span className="scorecard-label">PROVED Skills</span>
            <CheckCircle2 size={18} color="var(--status-verified)" />
          </div>
          <div className="scorecard-number" style={{ color: 'var(--status-verified)' }}>{proved}</div>
          <div className="scorecard-sub">
            {total > 0 ? `${Math.round((proved / total) * 100)}% verified with proof` : '0% verified'}
          </div>
        </div>

        {/* Partial */}
        <div className="scorecard-item partial">
          <div className="scorecard-top">
            <span className="scorecard-label">PARTIAL Skills</span>
            <AlertTriangle size={18} color="var(--status-weak)" />
          </div>
          <div className="scorecard-number" style={{ color: 'var(--status-weak)' }}>{partial}</div>
          <div className="scorecard-sub">
            {total > 0 ? `${Math.round((partial / total) * 100)}% supporting evidence` : '0% supporting'}
          </div>
        </div>

        {/* Unverified */}
        <div className="scorecard-item unverified">
          <div className="scorecard-top">
            <span className="scorecard-label">UNVERIFIED Skills</span>
            <XCircle size={18} color="var(--status-unverified)" />
          </div>
          <div className="scorecard-number" style={{ color: 'var(--status-unverified)' }}>{unverified}</div>
          <div className="scorecard-sub">
            {total > 0 ? `${Math.round((unverified / total) * 100)}% unobserved on GitHub` : '0% unverified'}
          </div>
        </div>
      </div>

      {/* Proof Confidence Rate Progress Bar */}
      <div className="proof-rate-bar-container">
        <div className="proof-rate-header">
          <span className="proof-rate-title">
            <ShieldCheck size={16} color="var(--status-verified)" />
            <span>Overall Verification Proof Index</span>
          </span>
          <span className="proof-rate-percent">{proofRate}%</span>
        </div>
        <div className="proof-rate-track">
          <div 
            className="proof-rate-fill" 
            style={{ 
              width: `${proofRate}%`,
              background: proofRate >= 50 
                ? 'linear-gradient(90deg, #10b981, #06b6d4)' 
                : 'linear-gradient(90deg, #f59e0b, #ef4444)'
            }} 
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="report-controls-bar no-print">
        <div className="report-filter-pills">
          <button 
            type="button" 
            className={`pill-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            <span>All Claimed Skills</span>
            <span className="count-tag">{total}</span>
          </button>

          <button 
            type="button" 
            className={`pill-btn proved-pill ${activeFilter === 'PROVED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PROVED')}
          >
            <CheckCircle2 size={13} />
            <span>Proved</span>
            <span className="count-tag">{proved}</span>
          </button>

          <button 
            type="button" 
            className={`pill-btn partial-pill ${activeFilter === 'PARTIAL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PARTIAL')}
          >
            <AlertTriangle size={13} />
            <span>Partial</span>
            <span className="count-tag">{partial}</span>
          </button>

          <button 
            type="button" 
            className={`pill-btn unverified-pill ${activeFilter === 'UNVERIFIED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('UNVERIFIED')}
          >
            <XCircle size={13} />
            <span>Unverified</span>
            <span className="count-tag">{unverified}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="report-search-box">
          <Search size={15} color="var(--text-subtle)" />
          <input 
            type="text" 
            placeholder="Search skill, category, or repo..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Skills Matrix / Verification Cards List */}
      <div className="report-skills-list">
        {filteredSkills.length === 0 ? (
          <div className="report-empty-state">
            <Filter size={24} color="var(--text-subtle)" />
            <p>No claimed skills match the selected filter or search query.</p>
          </div>
        ) : (
          filteredSkills.map((item) => {
            const isProved = item.status === 'PROVED';
            const isPartial = item.status === 'PARTIAL';
            const isUnverified = item.status === 'UNVERIFIED';

            const statusTheme = isProved ? 'proved-theme' : (isPartial ? 'partial-theme' : 'unverified-theme');

            return (
              <div key={item.skill} className={`skill-verification-tri-card ${statusTheme}`}>
                {/* 3-Part Column Grid: 1. Resume Claim | 2. GitHub Evidence | 3. Final Verification Status */}
                <div className="tri-grid">
                  
                  {/* =========================================
                      Column 1: RESUME CLAIM
                      ========================================= */}
                  <div className="tri-col claim-col">
                    <div className="col-header-tag">
                      <FileText size={13} />
                      <span>Resume Claim</span>
                    </div>

                    <div className="claim-identity">
                      <div className="claim-icon-wrap">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <h4 className="claim-skill-name">{item.skill}</h4>
                        <span className="claim-category">{item.category}</span>
                      </div>
                    </div>

                    <div className="claim-details-box">
                      <div className="claim-detail-row">
                        <span className="detail-label">Matched in PDF:</span>
                        <span className="detail-value">&ldquo;{item.matchedTerm || item.skill}&rdquo;</span>
                      </div>
                      <div className="claim-detail-row">
                        <span className="detail-label">Document Source:</span>
                        <span className="detail-value">{resume?.filename || 'Resume PDF'}</span>
                      </div>
                    </div>
                  </div>

                  {/* =========================================
                      Column 2: GITHUB EVIDENCE
                      ========================================= */}
                  <div className="tri-col evidence-col">
                    <div className="col-header-tag">
                      <FolderGit2 size={13} />
                      <span>Observable GitHub Evidence</span>
                    </div>

                    {item.evidence && item.evidence.length > 0 ? (
                      <div className="evidence-content-wrap">
                        {/* Supporting Repositories */}
                        {item.repositories && item.repositories.length > 0 && (
                          <div className="evidence-sub-block">
                            <span className="evidence-sub-title">Supporting Repositories:</span>
                            <div className="evidence-repo-links">
                              {item.repositories.map((repo) => (
                                <a 
                                  key={repo.name}
                                  href={repo.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="repo-chip-link"
                                  title={`Open ${repo.name} on GitHub`}
                                >
                                  <Github size={12} />
                                  <span>{repo.name}</span>
                                  <ExternalLink size={10} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Observable Evidence Tags */}
                        <div className="evidence-sub-block">
                          <span className="evidence-sub-title">Artifacts Observed:</span>
                          <div className="artifacts-list">
                            {item.evidence.map((ev, evIdx) => {
                              const isDep = ev.evidenceType === 'dependency';
                              const isManifest = ev.evidenceType === 'manifest';
                              const typeClass = isDep ? 'dep' : (isManifest ? 'manifest' : 'lang');
                              const typeText = isDep ? 'Dependency' : (isManifest ? 'Manifest' : 'Language Stats');

                              return (
                                <div key={evIdx} className="artifact-item-row">
                                  <span className={`artifact-pill ${typeClass}`}>
                                    {typeText}
                                  </span>
                                  <span className="artifact-desc" title={ev.details}>
                                    {ev.details}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="no-evidence-box">
                        <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>No Observable Evidence:</strong> No matching codebase languages, package manifests, or configuration files observed in public repositories.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* =========================================
                      Column 3: FINAL VERIFICATION STATUS
                      ========================================= */}
                  <div className="tri-col verdict-col">
                    <div className="col-header-tag">
                      <ShieldCheck size={13} />
                      <span>Verification Verdict</span>
                    </div>

                    {/* Status Badge */}
                    <div className={`verdict-status-badge ${statusTheme}`}>
                      {isProved && <CheckCircle2 size={16} />}
                      {isPartial && <AlertTriangle size={16} />}
                      {isUnverified && <XCircle size={16} />}
                      <span>{item.status}</span>
                    </div>

                    {/* Explanation */}
                    <div className="verdict-explanation-box">
                      <span className="verdict-exp-label">Evidence-Based Rationale:</span>
                      <p className="verdict-exp-text">
                        {item.explanation}
                      </p>
                    </div>

                    {/* Proof Confidence Level Indicator */}
                    <div className="verdict-confidence-row">
                      <span className="conf-label">Confidence:</span>
                      <span className={`conf-value ${statusTheme}`}>
                        {isProved && 'High (Empirical Proof)'}
                        {isPartial && 'Moderate (Supporting Evidence)'}
                        {isUnverified && 'Unsubstantiated (0 Evidence)'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="report-bottom-action-bar no-print">
        <div className="bottom-left-info">
          <Sparkles size={16} color="var(--accent-secondary)" />
          <span>SkillProof Verification Pipeline: All 5 Stages Complete.</span>
        </div>

        <div className="bottom-actions">
          <button 
            type="button" 
            className="btn-bottom-secondary"
            onClick={() => {
              if (onNavigate) {
                onNavigate('evidence');
                return;
              }
              const el = document.getElementById('evidence-explorer-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
          >
            <ShieldCheck size={15} />
            <span>Explore Evidence →</span>
          </button>

          <button 
            type="button" 
            className="btn-bottom-secondary"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>

          {onReset && (
            <button 
              type="button" 
              className="btn-bottom-primary"
              onClick={onReset}
            >
              <RotateCcw size={15} />
              <span>Start New Verification</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
