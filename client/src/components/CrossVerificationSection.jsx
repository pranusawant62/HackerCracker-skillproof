import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FolderGit2, 
  ExternalLink, 
  Layers, 
  Code2, 
  Terminal, 
  Database, 
  Cloud, 
  Cpu, 
  Wrench, 
  Award,
  Sparkles,
  GitBranch,
  FileCheck2,
  Check,
  Tag
} from 'lucide-react';

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

export default function CrossVerificationSection({ crossVerification, claimedSkills = [], github = {} }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Fallback computation if crossVerification is not pre-populated in payload
  const verificationData = crossVerification || {
    summary: {
      totalClaimed: claimedSkills.length,
      proved: 0,
      partial: 0,
      unverified: claimedSkills.length
    },
    results: claimedSkills.map(c => ({
      skill: c.skill,
      category: c.category || 'Other',
      status: 'UNVERIFIED',
      explanation: 'No observable evidence was found in public repositories, commit language statistics, or package manifests.',
      repositories: [],
      evidence: []
    }))
  };

  const { summary = {}, results = [] } = verificationData;
  const total = summary.totalClaimed || claimedSkills.length || 0;
  const proved = summary.proved || 0;
  const partial = summary.partial || 0;
  const unverified = summary.unverified || 0;

  // Filter results based on selected tab
  const filteredResults = results.filter(item => {
    if (activeFilter === 'PROVED') return item.status === 'PROVED';
    if (activeFilter === 'PARTIAL') return item.status === 'PARTIAL';
    if (activeFilter === 'UNVERIFIED') return item.status === 'UNVERIFIED';
    return true;
  });

  return (
    <section className="cross-verification-card">
      {/* Header */}
      <div className="skills-stage-header">
        <div>
          <span className="skills-stage-badge stage-4-badge">
            <Sparkles size={16} />
            <span>Stage 4: Cross-Verification</span>
          </span>
          <h3 style={{ fontSize: '1.6rem', marginTop: '0.65rem', letterSpacing: '-0.02em' }}>
            CROSS-VERIFICATION RESULTS
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Deterministic comparison between claimed resume skills and observable GitHub repository evidence.
          </p>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="verification-summary-grid">
        {/* Total Claimed */}
        <div className="summary-stat-card total-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Claimed Skills</span>
            <FileCheck2 size={18} color="var(--accent-primary)" />
          </div>
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-desc">Extracted from resume taxonomy</div>
        </div>

        {/* Proved */}
        <div className="summary-stat-card proved-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Proved Skills</span>
            <CheckCircle2 size={18} color="var(--status-verified)" />
          </div>
          <div className="stat-card-value" style={{ color: 'var(--status-verified)' }}>{proved}</div>
          <div className="stat-card-desc">
            {total > 0 ? `${Math.round((proved / total) * 100)}% verified with direct proof` : '0% verified'}
          </div>
        </div>

        {/* Partial */}
        <div className="summary-stat-card partial-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Partial Skills</span>
            <AlertTriangle size={18} color="var(--status-weak)" />
          </div>
          <div className="stat-card-value" style={{ color: 'var(--status-weak)' }}>{partial}</div>
          <div className="stat-card-desc">
            {total > 0 ? `${Math.round((partial / total) * 100)}% supporting evidence only` : '0% supporting'}
          </div>
        </div>

        {/* Unverified */}
        <div className="summary-stat-card unverified-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Unverified Skills</span>
            <XCircle size={18} color="var(--status-unverified)" />
          </div>
          <div className="stat-card-value" style={{ color: 'var(--status-unverified)' }}>{unverified}</div>
          <div className="stat-card-desc">
            {total > 0 ? `${Math.round((unverified / total) * 100)}% no observable proof` : '0% unverified'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="verification-filter-row">
        <div className="verification-filter-tabs">
          <button 
            type="button"
            className={`filter-tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            <span>All Skills</span>
            <span className="filter-count-badge">{total}</span>
          </button>

          <button 
            type="button"
            className={`filter-tab-btn proved-tab ${activeFilter === 'PROVED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PROVED')}
          >
            <CheckCircle2 size={14} />
            <span>Proved</span>
            <span className="filter-count-badge">{proved}</span>
          </button>

          <button 
            type="button"
            className={`filter-tab-btn partial-tab ${activeFilter === 'PARTIAL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PARTIAL')}
          >
            <AlertTriangle size={14} />
            <span>Partial</span>
            <span className="filter-count-badge">{partial}</span>
          </button>

          <button 
            type="button"
            className={`filter-tab-btn unverified-tab ${activeFilter === 'UNVERIFIED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('UNVERIFIED')}
          >
            <XCircle size={14} />
            <span>Unverified</span>
            <span className="filter-count-badge">{unverified}</span>
          </button>
        </div>
      </div>

      {/* Skill Cards List */}
      <div className="verification-results-container">
        {filteredResults.length === 0 ? (
          <div className="empty-filter-state">
            <p>No skills match the "{activeFilter.toLowerCase()}" filter.</p>
          </div>
        ) : (
          filteredResults.map((item) => {
            const isProved = item.status === 'PROVED';
            const isPartial = item.status === 'PARTIAL';
            const isUnverified = item.status === 'UNVERIFIED';

            const statusClass = isProved ? 'status-proved' : (isPartial ? 'status-partial' : 'status-unverified');

            return (
              <div key={item.skill} className={`cross-verification-item-card ${statusClass}`}>
                {/* Header Row: Skill Name & Category + Status Badge */}
                <div className="cv-card-top-row">
                  <div className="cv-skill-info">
                    <div className="cv-category-icon">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h4 className="cv-skill-title">{item.skill}</h4>
                      <span className="cv-skill-category">{item.category}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`cv-status-badge ${statusClass}`}>
                    {isProved && <CheckCircle2 size={15} />}
                    {isPartial && <AlertTriangle size={15} />}
                    {isUnverified && <XCircle size={15} />}
                    <span>{item.status}</span>
                  </div>
                </div>

                {/* Evidence Explanation Callout */}
                <div className="cv-explanation-box">
                  <span className="cv-explanation-label">Verification Assessment:</span>
                  <p className="cv-explanation-text">{item.explanation}</p>
                </div>

                {/* Supporting Repositories Row (if any) */}
                {item.repositories && item.repositories.length > 0 && (
                  <div className="cv-section-block">
                    <div className="cv-section-title">
                      <FolderGit2 size={14} color="var(--accent-secondary)" />
                      <span>Supporting {item.repositories.length === 1 ? 'Repository' : 'Repositories'} ({item.repositories.length})</span>
                    </div>
                    <div className="cv-repo-pill-list">
                      {item.repositories.map((repo) => (
                        <a
                          key={repo.name}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cv-repo-link-pill"
                          title={`View ${repo.name} repository on GitHub`}
                        >
                          <GitBranch size={13} />
                          <span>{repo.name}</span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observable Evidence Used */}
                {item.evidence && item.evidence.length > 0 && (
                  <div className="cv-section-block">
                    <div className="cv-section-title">
                      <Tag size={14} color="var(--accent-primary)" />
                      <span>Observable Evidence Used ({item.evidence.length})</span>
                    </div>
                    <div className="cv-evidence-grid">
                      {item.evidence.map((ev, evIdx) => {
                        const isDep = ev.evidenceType === 'dependency';
                        const isManifest = ev.evidenceType === 'manifest';
                        const badgeType = isDep ? 'dep' : (isManifest ? 'manifest' : 'lang');
                        const badgeLabel = isDep 
                          ? 'Dependency Manifest' 
                          : (isManifest ? 'Configuration Manifest' : 'Language Statistics');

                        return (
                          <div key={evIdx} className="cv-evidence-pill-item">
                            <div className="cv-evidence-pill-header">
                              <span className={`cv-evidence-type-tag ${badgeType}`}>
                                {badgeLabel}
                              </span>
                              <span className="cv-evidence-repo-name">
                                in <strong>{ev.repository}</strong>
                              </span>
                            </div>
                            <div className="cv-evidence-detail-text">
                              <Check size={13} color={isDep ? 'var(--status-verified)' : 'var(--accent-secondary)'} />
                              <span>{ev.details}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Unverified Information Notice */}
                {isUnverified && (
                  <div className="cv-unverified-notice">
                    <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Observable Evidence Not Found:</strong> No project manifests, dependency records, or repository language statistics matching <em>"{item.skill}"</em> were detected across the public repositories analyzed.
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
