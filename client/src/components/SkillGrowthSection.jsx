import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Target, 
  Compass, 
  Code2, 
  Layers, 
  Terminal, 
  Database, 
  Cloud, 
  Cpu, 
  Wrench, 
  Award, 
  RefreshCw, 
  PlayCircle, 
  Clock, 
  ChevronRight,
  ListOrdered
} from 'lucide-react';
import { fetchSkillGrowthApi } from '../services/api.js';

// Category icon helper
function getCategoryIcon(category = '') {
  const cat = (category || '').toLowerCase();
  if (cat.includes('program') || cat.includes('language')) return <Code2 size={16} color="var(--accent-secondary)" />;
  if (cat.includes('front')) return <Layers size={16} color="#60a5fa" />;
  if (cat.includes('back')) return <Terminal size={16} color="#34d399" />;
  if (cat.includes('database')) return <Database size={16} color="#fbbf24" />;
  if (cat.includes('cloud')) return <Cloud size={16} color="#38bdf8" />;
  if (cat.includes('devops')) return <Cpu size={16} color="#a78bfa" />;
  if (cat.includes('tool')) return <Wrench size={16} color="#f472b6" />;
  return <Award size={16} color="var(--accent-primary)" />;
}

export default function SkillGrowthSection({
  jobMatchResult = null,
  claimedSkills = [],
  sessionId = '',
  onStartTask = null
}) {
  const [growthData, setGrowthData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL', 'NEEDS_IMPROVEMENT', 'VERIFIED'

  const loadGrowthData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchSkillGrowthApi({
        jobMatchResult,
        verifiedSkills: claimedSkills,
        claimedSkills,
        sessionId
      });
      setGrowthData(data);
    } catch (err) {
      setError(err.message || 'Failed to load skill growth analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const skillsSig = (claimedSkills || [])
    .map(s => `${s.skill || s.name}:${s.status}:${s.evidence?.length || 0}`)
    .join('|');

  useEffect(() => {
    loadGrowthData();
  }, [jobMatchResult, skillsSig, sessionId]);

  const skillsList = growthData?.skills || [];
  const overallCoverage = growthData?.overallCoverage || 0;
  const skillsNeedingImprovement = growthData?.skillsNeedingImprovement || [];
  const recommendations = growthData?.recommendations || [];

  const filteredSkills = skillsList.filter(s => {
    if (filterMode === 'NEEDS_IMPROVEMENT') return s.needsImprovement;
    if (filterMode === 'VERIFIED') return !s.needsImprovement;
    return true;
  });

  // Coverage Rating Color Helper
  const getCoverageColor = (cov) => {
    if (cov >= 80) return '#10b981';
    if (cov >= 50) return '#6366f1';
    return '#f59e0b';
  };

  const coverageColor = getCoverageColor(overallCoverage);

  // Status Badge Class Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PROVEN':
        return <span className="growth-badge badge-proven">PROVEN</span>;
      case 'PARTIAL':
        return <span className="growth-badge badge-partial">PARTIAL</span>;
      case 'CLAIMED-ONLY':
        return <span className="growth-badge badge-claimed">CLAIMED-ONLY</span>;
      default:
        return <span className="growth-badge badge-missing">NO EVIDENCE</span>;
    }
  };

  // Progress Bar Gradient
  const getProgressGradient = (progress) => {
    if (progress >= 80) return 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
    if (progress >= 50) return 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)';
    if (progress >= 20) return 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
    return 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)';
  };

  return (
    <section id="skill-growth-section" className="job-match-card" style={{ marginTop: '2.5rem' }}>
      {/* Stage Header */}
      <div className="skills-stage-header">
        <div>
          <span className="skills-stage-badge job-match-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.35)', color: '#818cf8' }}>
            <TrendingUp size={16} />
            <span>Stage 9: Skill Growth & Progress Engine</span>
          </span>
          <h3 style={{ fontSize: '1.5rem', marginTop: '0.65rem' }}>
            YOUR SKILL GROWTH
          </h3>
          <p className="job-match-intro">
            Deterministic progress mapping calculated directly from verified evidence, target job requirements, and active skill gaps.
          </p>
        </div>

        <button
          type="button"
          className="btn-sample-jd"
          onClick={loadGrowthData}
          disabled={isLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', height: 'fit-content' }}
        >
          <RefreshCw size={13} className={isLoading ? 'btn-spinner' : ''} />
          <span>Recalculate Progress</span>
        </button>
      </div>

      {error && (
        <div className="job-match-error-banner" style={{ marginTop: '1rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {growthData && (
        <div className="growth-content-wrap">

          {/* Top Scorecard: Overall Evidence Coverage & Summary Strip */}
          <div className="growth-hero-scorecard">
            {/* Left: Overall Evidence Coverage Radial Circle */}
            <div className="growth-ring-col">
              <div className="growth-coverage-circle" style={{ borderColor: coverageColor }}>
                <div className="growth-coverage-inner">
                  <span className="growth-coverage-number" style={{ color: coverageColor }}>
                    {overallCoverage}%
                  </span>
                  <span className="growth-coverage-label">Evidence Coverage</span>
                </div>
              </div>
              <div className="growth-target-pill">
                <Target size={12} />
                <span>Target Role: <strong>{growthData.role || 'Target Role'}</strong></span>
              </div>
            </div>

            {/* Right: Summary Metrics */}
            <div className="growth-metrics-col">
              <div className="growth-kpis-grid">
                <div className="growth-kpi-item">
                  <span className="growth-kpi-num">{skillsList.length}</span>
                  <span className="growth-kpi-label">Evaluated Skills</span>
                </div>
                <div className="growth-kpi-item">
                  <span className="growth-kpi-num" style={{ color: '#10b981' }}>
                    {skillsList.filter(s => s.status === 'PROVEN').length}
                  </span>
                  <span className="growth-kpi-label">Verified (High)</span>
                </div>
                <div className="growth-kpi-item">
                  <span className="growth-kpi-num" style={{ color: '#60a5fa' }}>
                    {skillsList.filter(s => s.status === 'PARTIAL').length}
                  </span>
                  <span className="growth-kpi-label">Partial Evidence</span>
                </div>
                <div className="growth-kpi-item">
                  <span className="growth-kpi-num" style={{ color: '#f59e0b' }}>
                    {skillsNeedingImprovement.length}
                  </span>
                  <span className="growth-kpi-label">Needs Improvement</span>
                </div>
              </div>

              {/* Progress Summary Explanation */}
              <div className="growth-summary-text">
                <Sparkles size={16} color="var(--accent-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{growthData.summary}</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              Section: Recommended Next Steps Checklist
              ======================================================== */}
          {recommendations.length > 0 && (
            <div className="growth-next-steps-card">
              <div className="growth-steps-header">
                <div className="growth-steps-title">
                  <ListOrdered size={18} color="var(--accent-secondary)" />
                  <span>Recommended Next Steps:</span>
                </div>
                <span className="growth-steps-badge">
                  {recommendations.length} Action Items
                </span>
              </div>

              <div className="growth-steps-list">
                {recommendations.map((step, idx) => (
                  <div key={idx} className="growth-step-item">
                    <span className="growth-step-idx">{idx + 1}</span>
                    <span className="growth-step-text">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              Section: Skill Progress Bars & Target Levels
              ======================================================== */}
          <div className="growth-progress-section">
            <div className="growth-section-bar">
              <h4 className="growth-section-heading">
                Skill Progress & Evidence Levels
              </h4>

              {/* Filter tabs */}
              <div className="growth-filter-group">
                <button
                  type="button"
                  className={`gap-filter-btn ${filterMode === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilterMode('ALL')}
                >
                  All Skills ({skillsList.length})
                </button>
                <button
                  type="button"
                  className={`gap-filter-btn ${filterMode === 'NEEDS_IMPROVEMENT' ? 'active' : ''}`}
                  onClick={() => setFilterMode('NEEDS_IMPROVEMENT')}
                >
                  Needs Improvement ({skillsNeedingImprovement.length})
                </button>
                <button
                  type="button"
                  className={`gap-filter-btn ${filterMode === 'VERIFIED' ? 'active' : ''}`}
                  onClick={() => setFilterMode('VERIFIED')}
                >
                  Verified High ({skillsList.filter(s => !s.needsImprovement).length})
                </button>
              </div>
            </div>

            {/* Practical Assessment Progress History (Requirement 24) */}
            {Array.isArray(growthData?.assessmentProgress) && growthData.assessmentProgress.length > 0 && (
              <div className="growth-assessment-card" style={{ marginBottom: '1.5rem', background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={20} color="var(--accent-secondary)" />
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                      Micro-Task Assessment Progress
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    Tracked separately from GitHub codebase activity
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {growthData.assessmentProgress.map((asmt, aIdx) => (
                    <div key={aIdx} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '1rem' }}>{asmt.skill}</span>
                          <span className={`sv-status-badge ${asmt.status === 'PASSED' ? 'badge-proven' : 'badge-unverified'}`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                            {asmt.status === 'PASSED' ? 'MICRO-TASK VERIFIED' : 'NOT PASSED'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: asmt.growthDelta >= 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                            Growth: {asmt.growthText}
                          </span>
                        </div>
                      </div>

                      {/* Attempt timeline pills */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {asmt.attempts.map((att, attIdx) => (
                          <div key={attIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Attempt {att.attemptNumber} &rarr; <strong style={{ color: att.passed ? '#34d399' : '#fbbf24' }}>{att.percentage}%</strong></span>
                            {attIdx < asmt.attempts.length - 1 && <span style={{ color: 'var(--text-subtle)' }}>&bull;</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Progress Bars */}
            <div className="growth-bars-list">
              {filteredSkills.map((skill) => (
                <div key={skill.skill} className="growth-bar-card">
                  {/* Top line: Name, Icon, Badges, and Percentage */}
                  <div className="growth-bar-top">
                    <div className="growth-bar-skill-wrap">
                      <div className="growth-skill-icon">
                        {getCategoryIcon(skill.category)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span className="growth-bar-skill-name">{skill.skill}</span>
                          {getStatusBadge(skill.status)}
                        </div>
                        <span className="growth-bar-cat">{skill.category}</span>
                      </div>
                    </div>

                    <div className="growth-bar-stats-wrap">
                      <span className="growth-pct-number" style={{ color: skill.progress >= 80 ? '#34d399' : (skill.progress >= 50 ? '#60a5fa' : '#fbbf24') }}>
                        {skill.progress}%
                      </span>
                      <span className="growth-target-label">
                        Target: {skill.targetLevel}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar Track & Fill */}
                  <div className="growth-track">
                    <div
                      className="growth-fill"
                      style={{
                        width: `${skill.progress}%`,
                        background: getProgressGradient(skill.progress)
                      }}
                    />
                    {/* Target indicator line */}
                    <div 
                      className="growth-target-marker" 
                      style={{ left: `${skill.targetLevel}%` }}
                      title={`Target Level: ${skill.targetLevel}%`}
                    />
                  </div>

                  {/* Foot metadata & Action */}
                  <div className="growth-bar-foot">
                    <div className="growth-level-desc">
                      <span className="level-tag">{skill.levelLabel}</span>
                      <span className="level-explanation">{skill.explanation}</span>
                    </div>

                    {skill.needsImprovement && onStartTask && (
                      <button
                        type="button"
                        className="btn-growth-action"
                        onClick={() => onStartTask(skill.skill)}
                      >
                        <PlayCircle size={13} />
                        <span>Work on {skill.skill}</span>
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
