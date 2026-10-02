import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  ArrowUpRight, 
  TrendingUp, 
  Target, 
  BrainCircuit, 
  Terminal, 
  Cpu, 
  GitBranch, 
  Check, 
  Clock, 
  FileCode2, 
  ChevronRight,
  Zap,
  Award
} from 'lucide-react';
import { fetchAiSkillAnalysisApi } from '../services/api.js';

export default function AiSkillAnalysisSection({
  jobMatchResult = null,
  claimedSkills = [],
  sessionId = '',
  github = {},
  skillGrowth = null,
  skillGaps = [],
  onStartTask = null
}) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAnalysis = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAiSkillAnalysisApi({
        jobMatchResult,
        jobMatch: jobMatchResult,
        verifiedSkills: claimedSkills,
        claimedSkills,
        skillGaps,
        skillGrowth,
        github,
        sessionId
      });
      setAnalysis(data);
    } catch (err) {
      console.error('[AiSkillAnalysis] Error loading analysis:', err);
      setError(err.message || 'Failed to generate AI skill analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const skillsSig = (claimedSkills || [])
    .map(s => `${s.skill || s.name}:${s.status}:${s.evidence?.length || 0}`)
    .join('|');

  useEffect(() => {
    loadAnalysis();
  }, [sessionId, jobMatchResult, skillsSig]);

  return (
    <section id="ai-skill-analysis-section" className="job-match-card" style={{ marginTop: '2.5rem' }}>
      {/* Stage Header */}
      <div className="skills-stage-header">
        <div>
          <span 
            className="skills-stage-badge job-match-badge" 
            style={{ 
              background: 'rgba(168, 85, 247, 0.15)', 
              borderColor: 'rgba(168, 85, 247, 0.35)', 
              color: '#c084fc' 
            }}
          >
            <BrainCircuit size={16} />
            <span>Stage 10: Empirical AI Skill Analysis</span>
          </span>
          <h3 style={{ fontSize: '1.5rem', marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>AI SKILL ANALYSIS</span>
          </h3>
          <p className="job-match-intro">
            Factual profile synthesis derived directly from verified skills, repository artifacts, job match metrics, and evidence coverage.
          </p>
        </div>

        <button
          type="button"
          className="btn-sample-jd"
          onClick={loadAnalysis}
          disabled={isLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', height: 'fit-content' }}
        >
          <RefreshCw size={13} className={isLoading ? 'btn-spinner' : ''} />
          <span>{isLoading ? 'Analyzing...' : 'Re-Run Analysis'}</span>
        </button>
      </div>

      {error && (
        <div className="job-match-error-banner" style={{ marginTop: '1rem' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isLoading && !analysis && (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <div className="growth-spinner" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Synthesizing verified repository artifacts, skill evidence, and job match metrics...
          </p>
        </div>
      )}

      {analysis && (
        <div className="ai-analysis-container" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* ========================================================
              1. AI Summary Card
              ======================================================== */}
          <div 
            className="ai-card ai-summary-card" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div 
                style={{ 
                  background: 'rgba(168, 85, 247, 0.2)', 
                  color: '#c084fc', 
                  padding: '6px', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Sparkles size={18} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
                AI Summary
              </h4>
              <span 
                style={{ 
                  marginLeft: 'auto', 
                  fontSize: '0.72rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  color: '#34d399', 
                  border: '1px solid rgba(16, 185, 129, 0.3)' 
                }}
              >
                Zero-Hallucination Guardrail Active
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.65', color: '#e2e8f0' }}>
              {analysis.summary}
            </p>
          </div>

          {/* ========================================================
              2. Key Strengths & Evidence Gaps Grid
              ======================================================== */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Key Strengths */}
            <div 
              className="ai-card"
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#10b981" />
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#10b981', fontWeight: 700 }}>
                    Key Strengths
                  </h4>
                </div>
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: 'rgba(16, 185, 129, 0.12)', 
                    color: '#34d399', 
                    border: '1px solid rgba(16, 185, 129, 0.25)' 
                  }}
                >
                  {analysis.strengths?.length || 0} Verified
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysis.strengths && analysis.strengths.length > 0 ? (
                  analysis.strengths.map((item, idx) => {
                    const text = typeof item === 'string' ? item : item.text || item.skill || '';
                    const parts = text.split(' — ');
                    const skillTitle = parts[0] || text;
                    const detail = parts[1] || '';

                    return (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          background: 'rgba(16, 185, 129, 0.05)',
                          borderRadius: '8px',
                          border: '1px solid rgba(16, 185, 129, 0.15)'
                        }}
                      >
                        <span style={{ color: '#10b981', fontWeight: 800, marginTop: '1px' }}>✓</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                            {skillTitle.replace(/^✓\s*/, '')}
                          </span>
                          {detail && (
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              {detail}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    No verified strengths detected yet. Upload project code or credentials to verify skills.
                  </p>
                )}
              </div>
            </div>

            {/* Evidence Gaps */}
            <div 
              className="ai-card"
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="#f59e0b" />
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f59e0b', fontWeight: 700 }}>
                    Evidence Gaps
                  </h4>
                </div>
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: 'rgba(245, 158, 11, 0.12)', 
                    color: '#fbbf24', 
                    border: '1px solid rgba(245, 158, 11, 0.25)' 
                  }}
                >
                  {analysis.evidenceGaps?.length || 0} Action Items
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysis.evidenceGaps && analysis.evidenceGaps.length > 0 ? (
                  analysis.evidenceGaps.map((item, idx) => {
                    const text = typeof item === 'string' ? item : item.text || item.skill || '';
                    return (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          background: 'rgba(245, 158, 11, 0.05)',
                          borderRadius: '8px',
                          border: '1px solid rgba(245, 158, 11, 0.15)'
                        }}
                      >
                        <span style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '1px' }}>⚠</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
                            {text.replace(/^⚠\s*/, '')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <p style={{ margin: 0, color: '#34d399', fontSize: '0.88rem' }}>
                      All required profile skills have verified evidence! Zero active gaps.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ========================================================
              3. Recommended Next Steps
              ======================================================== */}
          <div 
            className="ai-card"
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="#818cf8" />
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  Recommended Next Steps
                </h4>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                Prioritized Action Plan
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysis.nextSteps && analysis.nextSteps.length > 0 ? (
                analysis.nextSteps.map((step, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '0.85rem 1rem',
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span 
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.2)',
                          color: '#818cf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {step.replace(/^[0-9]+\.\s*/, '')}
                      </span>
                    </div>

                    {onStartTask && (
                      <button
                        type="button"
                        onClick={() => {
                          // Extract skill name if recognizable in step
                          const match = step.match(/(Docker|React|PostgreSQL|FastAPI|Python|Git)/i);
                          onStartTask(match ? match[1] : null);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: '6px',
                          color: '#a5b4fc',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>Take Action</span>
                        <ArrowUpRight size={13} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  No immediate actions required.
                </p>
              )}
            </div>
          </div>

          {/* ========================================================
              4. Job Readiness / Profile Summary
              ======================================================== */}
          {analysis.profileSummary && (
            <div 
              className="ai-card"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ flex: '1 1 450px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Award size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', fontWeight: 700 }}>
                    Job Readiness / Profile Assessment
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {analysis.profileSummary}
                </p>
              </div>

              {analysis.readinessLevel && (
                <div 
                  style={{ 
                    padding: '0.6rem 1rem', 
                    borderRadius: '8px', 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '150px'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                    Readiness Rating
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#818cf8', marginTop: '2px' }}>
                    {analysis.readinessLevel.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </section>
  );
}
