import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderGit2, 
  ExternalLink, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCode2, 
  Layers, 
  FileText, 
  Star, 
  GitFork, 
  Calendar, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Cpu, 
  Database, 
  Terminal, 
  Cloud, 
  Wrench, 
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { fetchEvidenceExplorer } from '../services/api.js';

// Category icon helper
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

function getEvidenceTypeIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('microtask') || t.includes('assessment')) return <ShieldCheck size={13} color="#34d399" />;
  if (t.includes('certificate') || t.includes('credential')) return <Award size={13} color="#f59e0b" />;
  if (t.includes('dependency') || t.includes('package')) return <FileText size={13} color="#10b981" />;
  if (t.includes('config') || t.includes('manifest') || t.includes('docker')) return <Cpu size={13} color="#06b6d4" />;
  if (t.includes('language')) return <Code2 size={13} color="#60a5fa" />;
  if (t.includes('readme')) return <FileCode2 size={13} color="#fbbf24" />;
  if (t.includes('test')) return <CheckCircle2 size={13} color="#34d399" />;
  return <ShieldCheck size={13} color="#a78bfa" />;
}

export default function EvidenceExplorer({ crossVerification, github, onNavigate }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkillName, setSelectedSkillName] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRepos, setExpandedRepos] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch or normalize evidence explorer data
  useEffect(() => {
    let isMounted = true;
    if (!crossVerification && !github) {
      setSkills([]);
      return;
    }

    async function loadData() {
      setIsLoading(true);
      setApiError('');
      try {
        const res = await fetchEvidenceExplorer({ crossVerification, github });
        if (isMounted) {
          const loadedSkills = res.skills || [];
          setSkills(loadedSkills);
          if (loadedSkills.length > 0) {
            setSelectedSkillName(loadedSkills[0].skill);
          }
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.message || 'Evidence could not be loaded.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [crossVerification, github]);

  // Overall metric counts (from real data)
  const totalReposAnalyzed = github?.repositories?.length || 0;
  const totalSkillsAnalyzed = skills.length;
  const provedCount = skills.filter(s => s.status === 'PROVED' || s.status === 'PROVEN').length;
  const partialCount = skills.filter(s => s.status === 'PARTIAL' || s.status === 'PARTIALLY_PROVEN').length;
  const unverifiedCount = skills.filter(s => s.status === 'UNVERIFIED' || s.status === 'CLAIMED' || s.status === 'CLAIMED-ONLY').length;

  // Filter & Search logic
  const filteredSkills = useMemo(() => {
    return skills.filter(item => {
      const itemStatus = String(item.status || '').toUpperCase();
      // 1. Status Filter
      if (activeFilter === 'PROVED' && itemStatus !== 'PROVED' && itemStatus !== 'PROVEN') return false;
      if (activeFilter === 'PARTIAL' && itemStatus !== 'PARTIAL' && itemStatus !== 'PARTIALLY_PROVEN') return false;
      if (activeFilter === 'UNVERIFIED' && itemStatus !== 'UNVERIFIED' && itemStatus !== 'CLAIMED' && itemStatus !== 'CLAIMED-ONLY') return false;

      // 2. Search Query (skill name, category, or repo name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const skillMatch = item.skill.toLowerCase().includes(q);
        const catMatch = (item.category || '').toLowerCase().includes(q);
        const repoMatch = (item.repositories || []).some(r => r.name.toLowerCase().includes(q));
        if (!skillMatch && !catMatch && !repoMatch) return false;
      }

      return true;
    });
  }, [skills, activeFilter, searchQuery]);

  // Ensure selected skill is valid
  useEffect(() => {
    if (filteredSkills.length > 0) {
      const exists = filteredSkills.some(s => s.skill === selectedSkillName);
      if (!exists) {
        setSelectedSkillName(filteredSkills[0].skill);
      }
    }
  }, [filteredSkills, selectedSkillName]);

  const selectedSkill = skills.find(s => s.skill === selectedSkillName) || filteredSkills[0] || null;

  const toggleRepoExpand = (repoName) => {
    setExpandedRepos(prev => ({
      ...prev,
      [repoName]: !prev[repoName]
    }));
  };

  const scrollToJobMatch = () => {
    if (onNavigate) {
      onNavigate('job-match');
      return;
    }
    const el = document.getElementById('job-match-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section id="evidence-explorer-section" className="evidence-explorer-card">
        <div className="evidence-loading-state">
          <span className="btn-spinner" style={{ width: 24, height: 24 }} />
          <span>Loading observable evidence...</span>
        </div>
      </section>
    );
  }

  if (apiError) {
    return (
      <section id="evidence-explorer-section" className="evidence-explorer-card">
        <div className="evidence-error-state">
          <AlertTriangle size={20} color="#ef4444" />
          <span>Evidence could not be loaded: {apiError}</span>
        </div>
      </section>
    );
  }

  if (!skills || skills.length === 0) {
    return (
      <section id="evidence-explorer-section" className="evidence-explorer-card">
        <div className="evidence-empty-state">
          <Info size={24} color="var(--text-muted)" />
          <span>No evidence data available. Please verify a resume and GitHub profile above.</span>
        </div>
      </section>
    );
  }

  return (
    <section id="evidence-explorer-section" className="evidence-explorer-card">
      {/* ========================================================
          Header & Metrics Strip
          ======================================================== */}
      <div className="evidence-header-wrap">
        <div>
          <span className="skills-stage-badge evidence-badge">
            <ShieldCheck size={16} />
            <span>Stage 7: Evidence Explorer</span>
          </span>
          <h3 className="evidence-title">
            EVIDENCE EXPLORER
          </h3>
          <p className="evidence-subtitle">
            Inspect the observable codebase evidence behind every verified technical skill.
          </p>
        </div>

        {/* Action Button: Smooth scroll to Job Match */}
        <div className="evidence-header-action">
          <button 
            type="button" 
            className="btn-continue-job-match"
            onClick={scrollToJobMatch}
          >
            <span>Continue to Job Match</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="evidence-kpi-grid">
        <div className="evidence-kpi-item kpi-repos">
          <span className="kpi-num">{totalReposAnalyzed}</span>
          <span className="kpi-label">Repositories Analyzed</span>
        </div>
        <div className="evidence-kpi-item kpi-skills">
          <span className="kpi-num">{totalSkillsAnalyzed}</span>
          <span className="kpi-label">Skills Analyzed</span>
        </div>
        <div className="evidence-kpi-item kpi-proved">
          <span className="kpi-num">{provedCount}</span>
          <span className="kpi-label">Proved</span>
        </div>
        <div className="evidence-kpi-item kpi-partial">
          <span className="kpi-num">{partialCount}</span>
          <span className="kpi-label">Partial</span>
        </div>
        <div className="evidence-kpi-item kpi-unverified">
          <span className="kpi-num">{unverifiedCount}</span>
          <span className="kpi-label">Unverified</span>
        </div>
      </div>

      {/* ========================================================
          Search & Filters Toolbar
          ======================================================== */}
      <div className="evidence-toolbar">
        <div className="evidence-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            id="evidence-search-input"
            type="text"
            className="evidence-search-input"
            placeholder="Search skills, categories, or repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="btn-search-clear"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>

        <div className="evidence-filters-group">
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All ({skills.length})
          </button>
          <button
            type="button"
            className={`filter-btn filter-proved ${activeFilter === 'PROVED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PROVED')}
          >
            ✓ Proved ({provedCount})
          </button>
          <button
            type="button"
            className={`filter-btn filter-partial ${activeFilter === 'PARTIAL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PARTIAL')}
          >
            ! Partial ({partialCount})
          </button>
          <button
            type="button"
            className={`filter-btn filter-unverified ${activeFilter === 'UNVERIFIED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('UNVERIFIED')}
          >
            × Unverified ({unverifiedCount})
          </button>
        </div>
      </div>

      {/* ========================================================
          Master-Detail Layout (Sidebar + Selected Skill Panel)
          ======================================================== */}
      <div className="evidence-layout-grid">
        {/* Left Sidebar: Skill List */}
        <aside className="evidence-sidebar">
          <div className="sidebar-header">
            <span>SKILLS ({filteredSkills.length})</span>
          </div>

          <div className="sidebar-skills-list">
            {filteredSkills.length === 0 ? (
              <div className="sidebar-no-results">
                No skills match current filters.
              </div>
            ) : (
              filteredSkills.map((item) => {
                const isSelected = selectedSkill?.skill === item.skill;
                const repoCount = item.repositories?.length || 0;
                const statusSymbol = item.status === 'PROVED' ? '✓' : (item.status === 'PARTIAL' ? '!' : '×');

                return (
                  <button
                    key={item.skill}
                    type="button"
                    className={`sidebar-skill-btn ${isSelected ? 'selected' : ''} status-${item.status.toLowerCase()}`}
                    onClick={() => setSelectedSkillName(item.skill)}
                  >
                    <div className="sidebar-skill-left">
                      {getCategoryIcon(item.category)}
                      <span className="sidebar-skill-title">{item.skill}</span>
                    </div>

                    <div className="sidebar-skill-right">
                      <span className={`sidebar-badge badge-${item.status.toLowerCase()}`}>
                        {statusSymbol} {item.status}
                      </span>
                      <span className="sidebar-repo-count">
                        {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main Content: Selected Skill Panel */}
        <main className="evidence-main-panel">
          {selectedSkill ? (
            <div>
              {/* Selected Skill Header */}
              <div className="selected-skill-banner">
                <div className="banner-top-row">
                  <div className="banner-title-group">
                    {getCategoryIcon(selectedSkill.category)}
                    <h4 className="banner-skill-name">{selectedSkill.skill}</h4>
                    <span className="banner-cat-tag">{selectedSkill.category}</span>
                  </div>

                  <div className="banner-status-group">
                    <span className={`status-pill status-${selectedSkill.status.toLowerCase()}`}>
                      {selectedSkill.status === 'PROVED' && <CheckCircle2 size={14} />}
                      {selectedSkill.status === 'PARTIAL' && <AlertTriangle size={14} />}
                      {selectedSkill.status === 'UNVERIFIED' && <XCircle size={14} />}
                      <span>{selectedSkill.status}</span>
                    </span>

                    <span className={`confidence-pill conf-${selectedSkill.confidence.toLowerCase()}`}>
                      Confidence: <strong>{selectedSkill.confidence}</strong>
                    </span>
                  </div>
                </div>

                {/* Lead explanation */}
                <p className="banner-lead-text">
                  {selectedSkill.status === 'PROVED' && (
                    'Strong observable evidence was verified in public GitHub repositories and package manifests.'
                  )}
                  {selectedSkill.status === 'PARTIAL' && (
                    'Observed in repository language statistics, but lacking dedicated build manifest proof.'
                  )}
                  {selectedSkill.status === 'UNVERIFIED' && (
                    'Claimed on resume, but not supported by observable GitHub evidence in public repositories.'
                  )}
                </p>

                {/* Verification Explanation Box */}
                <div className="banner-explanation-box">
                  <div className="explanation-label">
                    <Info size={14} color="var(--accent-secondary)" />
                    <span>Verification Explanation</span>
                  </div>
                  <p className="explanation-content">
                    {selectedSkill.rationale}
                  </p>
                </div>

                {/* Artifact Summary Badges */}
                <div className="evidence-summary-strip">
                  <div className="summary-chip">
                    <FolderGit2 size={13} />
                    <span><strong>{selectedSkill.evidenceSummary.repositories}</strong> Repositories</span>
                  </div>
                  <div className="summary-chip">
                    <FileText size={13} />
                    <span><strong>{selectedSkill.evidenceSummary.manifests}</strong> Manifests</span>
                  </div>
                  <div className="summary-chip">
                    <Code2 size={13} />
                    <span><strong>{selectedSkill.evidenceSummary.languages}</strong> Language Matches</span>
                  </div>
                  <div className="summary-chip">
                    <Cpu size={13} />
                    <span><strong>{selectedSkill.evidenceSummary.configurations}</strong> Configurations</span>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  Repository Evidence Cards
                  ======================================================== */}
              <div className="repo-evidence-section">
                <div className="repo-evidence-header">
                  <h5>
                    <FolderGit2 size={16} color="var(--accent-secondary)" />
                    <span>Repository Evidence ({selectedSkill.repositories.length})</span>
                  </h5>
                </div>

                {/* No Evidence State for UNVERIFIED */}
                {selectedSkill.repositories.length === 0 ? (
                  <div className="no-evidence-box">
                    <div className="no-evidence-icon-wrap">
                      <HelpCircle size={24} color="#ef4444" />
                    </div>
                    <h6>No observable evidence found</h6>
                    <p className="no-evidence-text">
                      No matching codebase languages, package manifests, configuration files, or other observable artifacts were detected in the analyzed public repositories.
                    </p>
                    <div className="no-evidence-metrics">
                      <div className="no-ev-item">
                        <span className="no-ev-label">Status</span>
                        <span className="no-ev-val status-unverified">UNVERIFIED</span>
                      </div>
                      <div className="no-ev-item">
                        <span className="no-ev-label">Evidence</span>
                        <span className="no-ev-val">0 observable artifacts</span>
                      </div>
                      <div className="no-ev-item">
                        <span className="no-ev-label">Repositories</span>
                        <span className="no-ev-val">0 supporting repositories</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="repo-cards-stack">
                    {selectedSkill.repositories.map((repo) => {
                      const isExpanded = !!expandedRepos[repo.name];

                      return (
                        <div key={repo.name} className="explorer-repo-card">
                          <div className="repo-card-main">
                            <div className="repo-card-head">
                              <div>
                                <span className="repo-card-name">{repo.name}</span>
                                {repo.description && (
                                  <p className="repo-card-desc">{repo.description}</p>
                                )}
                              </div>

                              <span className={`repo-status-tag status-${selectedSkill.status.toLowerCase()}`}>
                                {selectedSkill.status}
                              </span>
                            </div>

                            {/* Repo Meta info */}
                            <div className="repo-card-meta-row">
                              {repo.language && (
                                <span className="repo-meta-item">
                                  <Code2 size={13} color="var(--accent-secondary)" />
                                  <span>{repo.language}</span>
                                </span>
                              )}
                              {repo.updatedAt && (
                                <span className="repo-meta-item">
                                  <Calendar size={13} />
                                  <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                                </span>
                              )}
                              {repo.stars > 0 && (
                                <span className="repo-meta-item">
                                  <Star size={13} fill="#facc15" color="#facc15" />
                                  <span>{repo.stars}</span>
                                </span>
                              )}
                              {repo.forks > 0 && (
                                <span className="repo-meta-item">
                                  <GitFork size={13} />
                                  <span>{repo.forks}</span>
                                </span>
                              )}
                            </div>

                            {/* Observable Artifact Pills */}
                            <div className="repo-evidence-list">
                              <span className="evidence-list-label">Observable Evidence:</span>
                              <div className="evidence-pills-row">
                                {repo.evidence && repo.evidence.length > 0 ? (
                                  repo.evidence.map((ev, idx) => (
                                    <div key={idx} className="evidence-pill-chip">
                                      {getEvidenceTypeIcon(ev.type)}
                                      <span className="ev-chip-label">{ev.label}</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="ev-none-subtle">Detected as secondary language usage.</span>
                                )}
                              </div>
                            </div>

                            {/* Expandable Details Panel */}
                            {isExpanded && (
                              <div className="repo-expanded-details">
                                <div className="details-grid">
                                  <div className="detail-item">
                                    <span className="detail-label">Full Name:</span>
                                    <span className="detail-value">{repo.fullName}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Primary Language:</span>
                                    <span className="detail-value">{repo.language || 'Not specified'}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Last Updated:</span>
                                    <span className="detail-value">{repo.updatedAt ? new Date(repo.updatedAt).toLocaleString() : 'Unknown'}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Stars / Forks:</span>
                                    <span className="detail-value">{repo.stars} stars, {repo.forks} forks</span>
                                  </div>
                                </div>

                                {repo.evidence && repo.evidence.length > 0 && (
                                  <div className="expanded-ev-breakdown">
                                    <span className="detail-label">Artifact Inspection:</span>
                                    <ul className="expanded-ev-list">
                                      {repo.evidence.map((ev, i) => (
                                        <li key={i}>
                                          <strong>{ev.type}:</strong> {ev.details}
                                          {ev.source && ev.source !== ev.details && (
                                            <span className="ev-source-hint"> (Source: {ev.source})</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Bottom Card Actions */}
                            <div className="repo-card-bottom-bar">
                              <button
                                type="button"
                                className="btn-toggle-details"
                                onClick={() => toggleRepoExpand(repo.name)}
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Hide Evidence Details</span>
                                    <ChevronUp size={14} />
                                  </>
                                ) : (
                                  <>
                                    <span>View Evidence Details</span>
                                    <ChevronDown size={14} />
                                  </>
                                )}
                              </button>

                              <a
                                href={repo.htmlUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-view-github"
                              >
                                <span>View on GitHub</span>
                                <ExternalLink size={13} />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection-placeholder">
              <Info size={24} color="var(--text-muted)" />
              <span>Select a skill from the left sidebar to inspect its observable evidence.</span>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
