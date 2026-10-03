import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  PlusCircle, 
  UploadCloud, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Link2, 
  Award, 
  FolderGit2, 
  Sparkles,
  Info,
  Trash2,
  AlertTriangle,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import AddSkillModal from './AddSkillModal.jsx';
import AddEvidenceModal from './AddEvidenceModal.jsx';
import MicroTaskAssessment from './MicroTaskAssessment.jsx';
import { deleteSkillApi } from '../services/api.js';

export default function SkillVerificationDashboard({
  sessionId,
  githubUsername,
  claimedSkills = [],
  summary,
  onSkillAdded,
  onEvidenceSubmitted,
  onSkillDeleted
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'proven', 'partial', 'unverified'
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [evidenceModalSkill, setEvidenceModalSkill] = useState(null);
  const [expandedSkillId, setExpandedSkillId] = useState(null);
  const [skillPendingDelete, setSkillPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [assessmentModalState, setAssessmentModalState] = useState({
    isOpen: false,
    skillName: '',
    existingResult: null
  });

  const handleOpenAssessment = (skillItem, viewExisting = false) => {
    const sName = skillItem.skill || skillItem.name;
    const existingResult = viewExisting 
      ? (skillItem.assessmentResult || skillItem.evidence?.find(e => e.type === 'microtask_assessment'))
      : null;

    setAssessmentModalState({
      isOpen: true,
      skillName: sName,
      existingResult
    });
  };

  const handleCloseAssessment = () => {
    setAssessmentModalState({
      isOpen: false,
      skillName: '',
      existingResult: null
    });
  };

  const resolveSkillStatus = (item) => {
    const asmt = item.assessmentResult || item.evidence?.find(e => e.type === 'microtask_assessment');
    const asmtStatus = item.assessmentStatus || asmt?.status;
    const hasScore = item.assessmentResult?.percentage != null || item.assessmentResult?.score != null || asmt?.percentage != null || asmt?.score != null;
    const rawScore = item.assessmentResult?.percentage ?? item.assessmentResult?.score ?? asmt?.percentage ?? asmt?.score;
    const asmtScore = hasScore ? Number(rawScore) : null;

    // 1. Invalidated assessment
    if (item.status === 'invalidated' || asmtStatus === 'invalidated') {
      return {
        type: 'invalidated',
        badge: 'Assessment Invalidated',
        badgeClass: 'badge-invalidated',
        subPill: 'Assessment Invalidated — Focus Violation',
        explanation: 'Assessment Invalidated — Focus Violation',
        canRetake: true
      };
    }

    // 2. Assessment attempted
    const isAssessed = asmt != null || asmtStatus === 'passed' || asmtStatus === 'failed' || asmtStatus === 'not_passed' || item.status === 'failed' || item.status === 'not_passed';
    if (isAssessed) {
      const isPassed = asmtStatus === 'passed' || (asmtScore != null && asmtScore >= 70 && asmt?.passed !== false);
      if (isPassed) {
        const passScore = asmtScore != null ? asmtScore : (asmt?.percentage ?? 80);
        return {
          type: 'proven',
          badge: 'Proven',
          badgeClass: 'badge-proven',
          subPill: `Assessment Attempted (${passScore}%) — Passed`,
          explanation: `Assessment Attempted (${passScore}%) — Passed`,
          score: passScore,
          isPassed: true,
          canRetake: true
        };
      } else {
        const displayScore = asmtScore != null ? asmtScore : 0;
        return {
          type: 'failed',
          badge: 'Not Passed',
          badgeClass: 'badge-failed',
          subPill: `Assessment Attempted (${displayScore}%) — Not Passed`,
          explanation: `Assessment Attempted (${displayScore}%) — Not Passed`,
          score: displayScore,
          isFailed: true,
          canRetake: true
        };
      }
    }

    // 3. No assessment attempted: check genuine non-assessment evidence
    const nonAsmtEvidence = (item.evidence || []).filter(e => e.type !== 'microtask_assessment');
    const certEv = nonAsmtEvidence.find(e => e.type === 'certificate' || e.type === 'credential');
    const githubEv = nonAsmtEvidence.find(e => e.type === 'github_repo' || e.type === 'project_url');

    if (item.status === 'proven' || certEv || githubEv) {
      return {
        type: 'proven',
        badge: certEv ? 'DOCUMENT VERIFIED' : (githubEv ? 'GITHUB VERIFIED' : 'Proven'),
        badgeClass: certEv ? 'badge-document' : (githubEv ? 'badge-github' : 'badge-proven'),
        subPill: null,
        explanation: item.explanation || 'Verified with observable evidence.',
        isProven: true,
        canRetake: false
      };
    }

    if (item.status === 'partially_proven') {
      const hasGenuinePartial = nonAsmtEvidence.some(e => e.verificationStatus === 'partially_proven' || e.evidenceRelevance === 'partial');
      if (hasGenuinePartial) {
        return {
          type: 'partially_proven',
          badge: 'Partially Proven',
          badgeClass: 'badge-partial',
          subPill: null,
          explanation: item.explanation || 'Partial observable evidence detected.',
          isPartial: true,
          canRetake: false
        };
      }
    }

    // Default: Claimed-Only (Not Attempted)
    return {
      type: 'unverified',
      badge: 'Claimed-Only',
      badgeClass: 'badge-unverified',
      subPill: null,
      explanation: 'No assessment has been attempted for this skill.',
      isUnverified: true,
      canRetake: false
    };
  };

  const handleAssessmentCompleted = (data) => {
    if (data.session) {
      if (onEvidenceSubmitted) onEvidenceSubmitted(data.session);
    } else if (data.skillName) {
      const targetSkillName = data.skillName.toLowerCase();
      const updatedSkills = claimedSkills.map(s => {
        if ((s.skill || s.name || '').toLowerCase() === targetSkillName) {
          if (data.invalidated) {
            return {
              ...s,
              status: 'invalidated',
              assessmentStatus: 'invalidated',
              explanation: 'Assessment Invalidated — Focus Violation'
            };
          }
          const asmtRes = data.assessmentResult;
          const passed = asmtRes?.passed === true && (asmtRes?.percentage >= 70);
          return {
            ...s,
            status: passed ? 'proven' : 'failed',
            assessmentStatus: passed ? 'passed' : 'failed',
            assessmentResult: asmtRes,
            explanation: passed
              ? `Assessment Attempted (${asmtRes?.percentage}%) — Passed`
              : `Assessment Attempted (${asmtRes?.percentage || 0}%) — Not Passed`
          };
        }
        return s;
      });

      if (onEvidenceSubmitted) {
        onEvidenceSubmitted({
          claimedSkills: updatedSkills
        });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!skillPendingDelete) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const result = await deleteSkillApi({
        sessionId,
        skillId: skillPendingDelete.id || skillPendingDelete.skill
      });

      if (onSkillDeleted) {
        onSkillDeleted(result);
      }

      setSkillPendingDelete(null);
    } catch (err) {
      console.error('[Delete Skill Error]', err);
      setDeleteError(err.message || 'Failed to delete skill. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Categorize skills into the 3 canonical groups
  const provenSkills = claimedSkills.filter(s => resolveSkillStatus(s).type === 'proven');
  const partiallyProvenSkills = claimedSkills.filter(s => resolveSkillStatus(s).type === 'partially_proven');
  const unverifiedSkills = claimedSkills.filter(s => {
    const t = resolveSkillStatus(s).type;
    return t === 'unverified' || t === 'failed' || t === 'invalidated';
  });

  const displayedSkills = activeTab === 'proven' 
    ? provenSkills 
    : (activeTab === 'partial' 
        ? partiallyProvenSkills 
        : (activeTab === 'unverified' ? unverifiedSkills : claimedSkills));

  const toggleExpand = (skillId) => {
    setExpandedSkillId(expandedSkillId === skillId ? null : skillId);
  };

  const getEvidenceIcon = (type) => {
    switch (type) {
      case 'github_repo':
        return <FolderGit2 size={13} color="var(--accent-secondary)" />;
      case 'certificate':
        return <Award size={13} color="#f59e0b" />;
      case 'microtask_assessment':
        return <ShieldCheck size={13} color="#34d399" />;
      case 'file':
        return <FileText size={13} color="#a78bfa" />;
      default:
        return <Link2 size={13} color="var(--accent-primary)" />;
    }
  };

  return (
    <section id="skill-verification-dashboard" className="skill-verification-dashboard-card">
      {/* Dashboard Top Header */}
      <div className="sv-header-row">
        <div>
          <span className="skills-stage-badge">
            <ShieldCheck size={16} />
            <span>Multi-Source Skill Verification</span>
          </span>
          <h2 className="sv-title">
            SKILL VERIFICATION BREAKDOWN
          </h2>
          <p className="sv-subtitle">
            Every claimed skill is verified independently through observable GitHub code, project URLs, and candidate-submitted evidence.
          </p>
        </div>

        {/* Global Action: Add Skill */}
        <button
          type="button"
          className="btn-add-skill-primary"
          onClick={() => setIsAddSkillOpen(true)}
          title="Add an additional skill to your candidate profile"
        >
          <PlusCircle size={16} />
          <span>+ Add Skill</span>
        </button>
      </div>

      {/* Summary KPI Cards Grid (Requirement 16 & 17) */}
      <div className="sv-summary-bar">
        <div className="sv-kpi-item total">
          <span className="kpi-count">{claimedSkills.length}</span>
          <span className="kpi-label">Total Claimed</span>
        </div>

        <div className="sv-kpi-item proven" onClick={() => setActiveTab('proven')} style={{ cursor: 'pointer' }}>
          <div className="kpi-head">
            <CheckCircle2 size={16} color="var(--status-verified)" />
            <span className="kpi-count" style={{ color: 'var(--status-verified)' }}>{provenSkills.length}</span>
          </div>
          <span className="kpi-label">✓ Proven</span>
        </div>

        <div className="sv-kpi-item partial" onClick={() => setActiveTab('partial')} style={{ cursor: 'pointer' }}>
          <div className="kpi-head">
            <HelpCircle size={16} color="var(--status-weak)" />
            <span className="kpi-count" style={{ color: 'var(--status-weak)' }}>{partiallyProvenSkills.length}</span>
          </div>
          <span className="kpi-label">◐ Partially Proven</span>
        </div>

        <div className="sv-kpi-item unverified" onClick={() => setActiveTab('unverified')} style={{ cursor: 'pointer' }}>
          <div className="kpi-head">
            <XCircle size={16} color="var(--text-subtle)" />
            <span className="kpi-count" style={{ color: '#94a3b8' }}>{unverifiedSkills.length}</span>
          </div>
          <span className="kpi-label">○ Unverified</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="sv-tabs-row">
        <button 
          type="button" 
          className={`sv-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Claimed Skills ({claimedSkills.length})
        </button>
        <button 
          type="button" 
          className={`sv-tab-btn tab-proven ${activeTab === 'proven' ? 'active' : ''}`}
          onClick={() => setActiveTab('proven')}
        >
          ✓ Proven Skills ({provenSkills.length})
        </button>
        <button 
          type="button" 
          className={`sv-tab-btn tab-partial ${activeTab === 'partial' ? 'active' : ''}`}
          onClick={() => setActiveTab('partial')}
        >
          ◐ Partially Proven ({partiallyProvenSkills.length})
        </button>
        <button 
          type="button" 
          className={`sv-tab-btn tab-unverified ${activeTab === 'unverified' ? 'active' : ''}`}
          onClick={() => setActiveTab('unverified')}
        >
          ○ Unverified Skills ({unverifiedSkills.length})
        </button>
      </div>

      {/* Three Categories Display (Requirement 6) */}
      <div className="sv-skills-list-container">
        {displayedSkills.length === 0 ? (
          <div className="sv-empty-state">
            <Info size={24} color="var(--text-subtle)" />
            <span>No skills found in this category.</span>
          </div>
        ) : (
          displayedSkills.map((item) => {
            const resolved = resolveSkillStatus(item);
            const isExpanded = expandedSkillId === item.id;
            const evidenceCount = item.evidence?.length || 0;
            const isManualClaim = item.claimSource === 'manual' || item.source === 'manual';
            const confidenceScore = item.evidence?.reduce(
              (max, ev) => Math.max(max, Number(ev?.confidenceScore) || (ev?.confidence === 'high' ? 95 : (ev?.confidence === 'medium' ? 70 : 0))), 
              0
            ) || (resolved.isPassed ? (resolved.score || 95) : (resolved.isProven ? 95 : 0));

            return (
              <div 
                key={item.id || item.skill} 
                className={`sv-skill-card ${resolved.type === 'proven' ? 'status-proven' : (resolved.type === 'failed' || resolved.type === 'invalidated' ? 'status-failed' : (resolved.type === 'partially_proven' ? 'status-partial' : 'status-unverified'))}`}
              >
                <div className="sv-skill-main-row">
                  {/* Left: Skill Name & Claim Source Badge */}
                  <div className="sv-skill-info-left">
                    <div className="sv-skill-title-line">
                      <span className="sv-skill-name">{item.skill}</span>
                      
                      {/* Claim Source */}
                      <span className={`sv-claim-badge ${isManualClaim ? 'badge-manual' : 'badge-resume'}`}>
                        {isManualClaim ? 'Added by Candidate' : 'From Resume'}
                      </span>

                      {resolved.type === 'unverified' ? (
                        <span className="sv-confidence-tag" style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          Not Attempted
                        </span>
                      ) : (
                        <span className="sv-confidence-tag" style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          Confidence: {confidenceScore}%
                        </span>
                      )}

                      {item.category && item.category !== 'Other' && (
                        <span className="sv-category-pill">{item.category}</span>
                      )}

                      {/* Sub-Pill: Assessment Attempted / Invalidated */}
                      {resolved.subPill && (
                        <span className={resolved.isPassed ? 'sv-microtask-score-pill' : 'sv-microtask-failed-pill'}>
                          {resolved.subPill}
                        </span>
                      )}
                    </div>

                    <p className="sv-skill-explanation">
                      {resolved.explanation}
                    </p>
                  </div>

                  {/* Right: Status Pill & Action Buttons */}
                  <div className="sv-skill-actions-right">
                    {/* Status Pill */}
                    <div className={`sv-status-badge ${resolved.badgeClass}`}>
                      {resolved.type === 'proven' ? (
                        <CheckCircle2 size={14} />
                      ) : resolved.type === 'partially_proven' ? (
                        <HelpCircle size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      <span>{resolved.badge}</span>
                      {resolved.isPassed && resolved.score != null && (
                        <span className="badge-score-number">{resolved.score}%</span>
                      )}
                    </div>

                    {/* View Evidence Toggle */}
                    {evidenceCount > 0 && (
                      <button
                        type="button"
                        className="btn-sv-view-evidence"
                        onClick={() => toggleExpand(item.id)}
                      >
                        <span>Evidence ({evidenceCount})</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}

                    {/* Micro-Task Assessment Action Buttons */}
                    {resolved.isPassed ? (
                      <>
                        <button
                          type="button"
                          className="btn-sv-view-assessment"
                          onClick={() => handleOpenAssessment(item, true)}
                          title={`View ${item.skill} assessment result`}
                        >
                          <ShieldCheck size={14} />
                          <span>View Assessment</span>
                        </button>
                        <button
                          type="button"
                          className="btn-sv-retake-assessment"
                          onClick={() => handleOpenAssessment(item, false)}
                          title={`Retake ${item.skill} micro-task assessment`}
                        >
                          <RotateCcw size={13} />
                          <span>Retake Micro-Task</span>
                        </button>
                      </>
                    ) : resolved.canRetake ? (
                      <button
                        type="button"
                        className="btn-sv-retake-microtask"
                        onClick={() => handleOpenAssessment(item, false)}
                        title={`Retake ${item.skill} micro-task assessment`}
                      >
                        <RotateCcw size={13} />
                        <span>Retake Micro-Task</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-sv-prove-microtask"
                        onClick={() => handleOpenAssessment(item, false)}
                        title={resolved.type === 'proven' ? `Take ${item.skill} skill assessment` : `Prove ${item.skill} with a practical micro-task`}
                      >
                        <ShieldCheck size={14} />
                        <span>Take Skill Assessment</span>
                      </button>
                    )}

                    {/* Add Evidence Button */}
                    <button
                      type="button"
                      className="btn-sv-add-evidence"
                      onClick={() => setEvidenceModalSkill(item)}
                      title={`Add evidence for ${item.skill}`}
                    >
                      <UploadCloud size={14} />
                      <span>+ Add Evidence</span>
                    </button>

                    {/* Delete Skill Button (Only for manually added skills) */}
                    {isManualClaim && (
                      <button
                        type="button"
                        className="btn-sv-delete-skill"
                        onClick={() => {
                          setDeleteError('');
                          setSkillPendingDelete(item);
                        }}
                        disabled={isDeleting && skillPendingDelete?.id === item.id}
                        title={`Delete ${item.skill}`}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Observable Evidence Section (Requirement 8 & 13) */}
                {isExpanded && evidenceCount > 0 && (
                  <div className="sv-evidence-drawer">
                    <div className="drawer-header">
                      <ShieldCheck size={14} color="var(--accent-secondary)" />
                      <span>Observable Evidence Sources for {item.skill} ({evidenceCount})</span>
                    </div>

                    <div className="drawer-evidence-list">
                      {item.evidence.map((ev, evIdx) => {
                        const rel = ev.evidenceRelevance || (ev.verified ? 'direct' : 'unrelated');
                        const status = ev.verificationStatus || (ev.verified ? 'proven' : 'unverified');
                        const artifacts = ev.observableArtifacts || ev.artifacts || [];

                        return (
                          <div key={ev.id || evIdx} className={`drawer-evidence-item relevance-${rel}`}>
                            <div className="ev-item-top">
                              <div className="ev-item-title-wrap">
                                {getEvidenceIcon(ev.type)}
                                <strong>{ev.title || ev.filename || `Evidence #${evIdx + 1}`}</strong>
                                {ev.submittedByCandidate && (
                                  <span className="ev-candidate-tag">Candidate-Submitted</span>
                                )}
                              </div>

                              {ev.url && (
                                <a 
                                  href={ev.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="ev-item-link"
                                >
                                  <span>Inspect Artifact</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>

                            {/* Section 15 Structured Verification Signals */}
                            <div className="ev-evaluation-meta-grid">
                              <div className="ev-meta-item">
                                <span className="ev-meta-label">Target Skill:</span>
                                <span className="ev-meta-val">{item.skill}</span>
                              </div>
                              <div className="ev-meta-item">
                                <span className="ev-meta-label">Evidence Type:</span>
                                <span className="ev-meta-val">{ev.type ? ev.type.replace('_', ' ').toUpperCase() : 'DOCUMENT'}</span>
                              </div>
                              <div className="ev-meta-item">
                                <span className="ev-meta-label">Candidate Identity:</span>
                                <span className={`ev-meta-badge id-${ev.candidateIdentityMatch === true ? 'match' : (ev.candidateIdentityMatch === false ? 'mismatch' : 'unspecified')}`}>
                                  {ev.candidateIdentityMatch === true ? '✓ Match' : (ev.candidateIdentityMatch === false ? '✕ Mismatch' : '○ Verified Session')}
                                </span>
                              </div>
                              <div className="ev-meta-item">
                                <span className="ev-meta-label">Skill Relevance:</span>
                                <span className={`ev-relevance-pill ${rel}`}>
                                  {rel === 'direct' && '✓ Direct'}
                                  {rel === 'partial' && '◐ Partial'}
                                  {rel === 'unrelated' && '✕ Unrelated'}
                                  {rel === 'invalid' && '⚠ Invalid'}
                                </span>
                              </div>
                              <div className="ev-meta-item">
                                <span className="ev-meta-label">Verification:</span>
                                <span className={`ev-status-pill status-${status}`}>
                                  {status === 'proven' && '✓ Proven'}
                                  {status === 'partially_proven' && '◐ Partially Proven'}
                                  {status === 'unverified' && '○ Unverified'}
                                  {status === 'invalid' && '⚠ Invalid'}
                                </span>
                              </div>
                              <div className="ev-meta-item">
                                <span className="ev-meta-label">Confidence:</span>
                                <span className={`ev-meta-val confidence-badge-${ev.confidence || 'none'}`} style={{ fontWeight: 600 }}>
                                  {ev.confidenceScore != null ? `${ev.confidenceScore}% — ` : ''}{ev.confidence ? (ev.confidence.charAt(0).toUpperCase() + ev.confidence.slice(1)) : 'None'}
                                </span>
                              </div>
                            </div>

                            {/* Section 15 Reason Explanation Box */}
                            <div className="ev-reason-box">
                              <span className="ev-reason-label">Reason:</span>
                              <span className="ev-reason-text">&ldquo;{ev.explanation || ev.details}&rdquo;</span>
                            </div>

                            {artifacts.length > 0 && (
                              <div className="ev-artifacts-tags">
                                {artifacts.map((art, aIdx) => (
                                  <span key={aIdx} className={`ev-artifact-pill ${rel === 'unrelated' || rel === 'invalid' ? 'pill-subtle' : ''}`}>
                                    {rel === 'unrelated' || rel === 'invalid' ? '○' : '✓'} {art}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        sessionId={sessionId}
        onSkillAdded={onSkillAdded}
      />

      {/* Add Evidence Modal */}
      {evidenceModalSkill && (
        <AddEvidenceModal
          isOpen={Boolean(evidenceModalSkill)}
          onClose={() => setEvidenceModalSkill(null)}
          skill={evidenceModalSkill}
          sessionId={sessionId}
          githubUsername={githubUsername}
          onEvidenceSubmitted={onEvidenceSubmitted}
        />
      )}

      {/* Delete Confirmation Modal */}
      {skillPendingDelete && (
        <div className="modal-backdrop" onClick={() => !isDeleting && setSkillPendingDelete(null)}>
          <div className="modal-dialog delete-skill-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon-wrap">
              <AlertTriangle size={28} color="#ef4444" />
            </div>

            <h3 className="delete-modal-title">Delete this skill?</h3>
            <p className="delete-modal-body">
              This will remove <strong>{skillPendingDelete.skill}</strong> and all evidence associated with it from your candidate profile.
            </p>

            {deleteError && (
              <div className="job-match-error-banner" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-delete-cancel"
                onClick={() => setSkillPendingDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-delete-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practical Micro-Task Assessment Modal */}
      <MicroTaskAssessment 
        isOpen={assessmentModalState.isOpen}
        onClose={handleCloseAssessment}
        skillName={assessmentModalState.skillName}
        sessionId={sessionId}
        existingAssessmentResult={assessmentModalState.existingResult}
        onAssessmentCompleted={handleAssessmentCompleted}
      />
    </section>
  );
}
