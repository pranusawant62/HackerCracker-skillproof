import React, { useState, useEffect } from 'react';
import { 
  ListTodo, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  CheckSquare, 
  Info, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Layers, 
  Terminal, 
  Database, 
  Cloud, 
  Cpu, 
  Wrench, 
  Award,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { fetchSkillGapsApi } from '../services/api.js';

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

export default function SkillGapSection({
  jobMatchResult = null,
  claimedSkills = [],
  sessionId = '',
  onStartTask = null
}) {
  const [gapData, setGapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'CLAIMED-ONLY', 'PARTIAL', 'NO EVIDENCE'

  const loadSkillGaps = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchSkillGapsApi({
        jobMatchResult,
        verifiedSkills: claimedSkills,
        claimedSkills,
        sessionId
      });
      setGapData(data);
    } catch (err) {
      setError(err.message || 'Failed to load skill gap details.');
    } finally {
      setIsLoading(false);
    }
  };

  const skillsSig = (claimedSkills || [])
    .map(s => `${s.skill || s.name}:${s.status}:${s.evidence?.length || 0}`)
    .join('|');

  useEffect(() => {
    loadSkillGaps();
  }, [jobMatchResult, skillsSig, sessionId]);

  const allGaps = gapData?.skillGaps || [];
  const claimedGaps = allGaps.filter(g => g.status === 'CLAIMED-ONLY');
  const partialGaps = allGaps.filter(g => g.status === 'PARTIAL');
  const missingGaps = allGaps.filter(g => g.status === 'NO EVIDENCE');

  const filteredGaps = activeFilter === 'ALL'
    ? allGaps
    : allGaps.filter(g => g.status === activeFilter);

  return (
    <section id="skill-gaps-section" className="job-match-card" style={{ marginTop: '2.5rem' }}>
      {/* Header */}
      <div className="skills-stage-header">
        <div>
          <span className="skills-stage-badge job-match-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.35)', color: '#f87171' }}>
            <ListTodo size={16} />
            <span>Stage 8: Skill Gap Details & Micro-Tasks</span>
          </span>
          <h3 style={{ fontSize: '1.5rem', marginTop: '0.65rem' }}>
            SKILL GAP DETAILS
          </h3>
          <p className="job-match-intro">
            Structured gap analysis synthesized directly from target job requirements and observable candidate evidence. Complete the recommended micro-tasks to prove proficiency.
          </p>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          className="btn-sample-jd"
          onClick={loadSkillGaps}
          disabled={isLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', height: 'fit-content' }}
        >
          <RefreshCw size={13} className={isLoading ? 'btn-spinner' : ''} />
          <span>Refresh Gaps</span>
        </button>
      </div>

      {/* Target Role & Summary Bar */}
      {gapData && (
        <div className="skill-gap-summary-bar">
          <div className="gap-role-info">
            <span className="gap-role-label">Target Role:</span>
            <span className="gap-role-title">{gapData.role || 'Target Technical Role'}</span>
          </div>

          {/* Filter Pills */}
          <div className="gap-filter-pills">
            <button
              type="button"
              className={`gap-filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All Gaps ({allGaps.length})
            </button>
            <button
              type="button"
              className={`gap-filter-btn ${activeFilter === 'CLAIMED-ONLY' ? 'active' : ''}`}
              onClick={() => setActiveFilter('CLAIMED-ONLY')}
            >
              Claimed-Only ({claimedGaps.length})
            </button>
            <button
              type="button"
              className={`gap-filter-btn ${activeFilter === 'PARTIAL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('PARTIAL')}
            >
              Partial Evidence ({partialGaps.length})
            </button>
            {missingGaps.length > 0 && (
              <button
                type="button"
                className={`gap-filter-btn ${activeFilter === 'NO EVIDENCE' ? 'active' : ''}`}
                onClick={() => setActiveFilter('NO EVIDENCE')}
              >
                No Evidence ({missingGaps.length})
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="job-match-error-banner" style={{ marginTop: '1rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Zero Gaps Celebratory State */}
      {gapData && allGaps.length === 0 && !isLoading && (
        <div className="skill-gap-empty-state">
          <CheckCircle2 size={40} color="#10b981" />
          <h4 style={{ fontSize: '1.2rem', marginTop: '0.8rem', color: '#10b981' }}>
            Zero Skill Gaps Detected!
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '540px', marginTop: '0.35rem' }}>
            All required technical competencies are supported by direct observable evidence across your verified repositories.
          </p>
        </div>
      )}

      {/* Gap Cards Grid */}
      {filteredGaps.length > 0 && (
        <div className="skill-gap-cards-container">
          {filteredGaps.map((gap) => {
            const isClaimedOnly = gap.status === 'CLAIMED-ONLY';
            const isPartial = gap.status === 'PARTIAL';
            const statusClass = isClaimedOnly ? 'badge-claimed' : (isPartial ? 'badge-partial' : 'badge-missing');
            const cardBorderClass = isClaimedOnly ? 'border-amber' : (isPartial ? 'border-blue' : 'border-red');

            return (
              <div key={gap.skill} className={`skill-gap-card ${cardBorderClass}`}>
                {/* Card Header */}
                <div className="gap-card-header">
                  <div className="gap-card-title-group">
                    <div className="gap-cat-icon">
                      {getCategoryIcon(gap.category)}
                    </div>
                    <div>
                      <h4 className="gap-skill-name">{gap.skill}</h4>
                      <span className="gap-skill-category">{gap.category || 'Other'}</span>
                    </div>
                  </div>

                  <div className="gap-card-badges">
                    <span className={`gap-status-pill ${statusClass}`}>
                      {gap.status}
                    </span>
                    <span className="gap-time-pill">
                      <Clock size={12} />
                      <span>{gap.estimatedTime}</span>
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="gap-card-body">
                  
                  {/* 1. Why it is a gap */}
                  <div className="gap-info-row reason-row">
                    <div className="gap-info-label">
                      <AlertTriangle size={15} color="#f59e0b" />
                      <span>Why it's a gap:</span>
                    </div>
                    <p className="gap-info-text">{gap.reason}</p>
                  </div>

                  {/* 2. Evidence currently found */}
                  <div className="gap-info-row evidence-row">
                    <div className="gap-info-label">
                      <Info size={15} color="#60a5fa" />
                      <span>Evidence currently found:</span>
                    </div>
                    <p className="gap-info-text">{gap.currentEvidence}</p>
                  </div>

                  {/* 3. What evidence is missing */}
                  <div className="gap-info-row missing-row">
                    <div className="gap-info-label">
                      <XCircle size={15} color="#ef4444" />
                      <span>What evidence is missing:</span>
                    </div>
                    <div className="missing-evidence-list">
                      {gap.missingEvidence?.map((item, idx) => (
                        <div key={idx} className="missing-evidence-pill">
                          <span className="bullet-cross">✕</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Recommended Micro-Task */}
                  <div className="gap-info-row microtask-row">
                    <div className="gap-info-label">
                      <CheckSquare size={15} color="#34d399" />
                      <span>Recommended Micro-Task:</span>
                    </div>
                    
                    {gap.microTask?.title && (
                      <div className="microtask-title">
                        {gap.microTask.title}
                      </div>
                    )}

                    {gap.microTask?.steps?.length > 0 ? (
                      <div className="microtask-steps-list">
                        {gap.microTask.steps.map((step, idx) => (
                          <div key={idx} className="microtask-step-item">
                            <span className="step-badge">{idx + 1}</span>
                            <span className="step-text">{step}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="gap-info-text">{gap.recommendation}</p>
                    )}
                  </div>

                </div>

                {/* Footer Action */}
                <div className="gap-card-footer">
                  <div className="gap-est-time-notice">
                    <Clock size={13} color="var(--accent-secondary)" />
                    <span>Estimated completion time: <strong>{gap.estimatedTime}</strong></span>
                  </div>

                  <button
                    type="button"
                    className="btn-start-microtask"
                    onClick={() => onStartTask && onStartTask(gap.skill)}
                  >
                    <PlayCircle size={16} />
                    <span>Start Task / Add Evidence</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
