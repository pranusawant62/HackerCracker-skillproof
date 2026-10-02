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

  const handleAssessmentCompleted = (data) => {
    if (onEvidenceSubmitted && data.session) {
      onEvidenceSubmitted(data.session);
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
  const provenSkills = claimedSkills.filter(s => s.status === 'proven');
  const partiallyProvenSkills = claimedSkills.filter(s => s.status === 'partially_proven');
  const unverifiedSkills = claimedSkills.filter(s => s.status === 'unverified' || !s.status);

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
            const isProven = item.status === 'proven';
            const isPartial = item.status === 'partially_proven';
            const isUnverified = !isProven && !isPartial;
            const isExpanded = expandedSkillId === item.id;
            const evidenceCount = item.evidence?.length || 0;
            const isManualClaim = item.claimSource === 'manual' || item.source === 'manual';
            const confidenceScore = item.evidence?.reduce(
              (max, ev) => Math.max(max, Number(ev?.confidenceScore) || (ev?.confidence === 'high' ? 95 : (ev?.confidence === 'medium' ? 70 : 0))), 
              0
            ) || (isProven ? 95 : 0);

            const microtaskEv = item.evidence?.find(e => e.type === 'microtask_assessment');
            const certEv = item.evidence?.find(e => e.type === 'certificate' || e.type === 'credential');
            const githubEv = item.evidence?.find(e => e.type === 'github_repo' || e.type === 'project_url');

            const isMicrotaskVerified = Boolean(
              (microtaskEv && microtaskEv.passed !== false) ||
              item.verificationMethod === 'microtask_assessment' ||
              item.assessmentStatus === 'passed'
            );
            const isDocumentVerified = Boolean(certEv && !isMicrotaskVerified);
            const isGithubVerified = Boolean(githubEv && !isMicrotaskVerified && !isDocumentVerified);

            const asmtScore = item.assessmentResult?.percentage || item.assessmentResult?.score || microtaskEv?.percentage || microtaskEv?.score;
            const asmtCompetency = item.assessmentResult?.competency || microtaskEv?.competency || 'Strong';
            const isFailedAssessment = item.assessmentStatus === 'failed';

            return (
              <div 
                key={item.id || item.skill} 
                className={`sv-skill-card ${isProven ? 'status-proven' : (isPartial ? 'status-partial' : 'status-unverified')}`}
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

                      <span className="sv-confidence-tag" style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        Confidence: {confidenceScore}%
                      </span>

                      {item.category && item.category !== 'Other' && (
                        <span className="sv-category-pill">{item.category}</span>
                      )}

                      {/* Micro-task Verified Badge Indicator */}
                      {isMicrotaskVerified && (
                        <span className="sv-microtask-score-pill">
                          Score: {asmtScore}% • {asmtCompetency}
                        </span>
                      )}

                      {isFailedAssessment && (
                        <span className="sv-microtask-failed-pill">
                          Assessment Attempted ({asmtScore || 0}%) — Not Passed
                        </span>
                      )}
                    </div>

                    <p className="sv-skill-explanation">
                      {isMicrotaskVerified
                        ? `Practical competency verified through skill micro-task assessment (${asmtScore}% score, ${asmtCompetency}).`
                        : isFailedAssessment
                        ? `Practical micro-task assessment attempted (${asmtScore || 0}%), but score fell below the 70% threshold. You can retake it to demonstrate competence.`
                        : (item.explanation || (isProven ? 'Verified with observable evidence.' : 'No direct evidence found.'))}
                    </p>
                  </div>

                  {/* Right: Status Pill & Action Buttons */}
                  <div className="sv-skill-actions-right">
                    {/* Status Pill - Clearly distinguishing verification sources */}
                    {isMicrotaskVerified ? (
                      <div className="sv-status-badge badge-microtask">
                        <ShieldCheck size={14} />
                        <span>MICRO-TASK VERIFIED</span>
                        {asmtScore != null && <span className="badge-score-number">{asmtScore}%</span>}
                      </div>
                    ) : isDocumentVerified ? (
                      <div className="sv-status-badge badge-document">
                        <Award size={14} />
                        <span>DOCUMENT VERIFIED</span>
                      </div>
                    ) : isGithubVerified ? (
                      <div className="sv-status-badge badge-github">
                        <FolderGit2 size={14} />
                        <span>GITHUB VERIFIED</span>
                      </div>
                    ) : isProven ? (
                      <div className="sv-status-badge badge-proven">
                        <CheckCircle2 size={14} />
                        <span>Proven</span>
                      </div>
                    ) : isPartial ? (
                      <div className="sv-status-badge badge-partial">
                        <HelpCircle size={14} />
                        <span>Partially Proven</span>
                      </div>
                    ) : (
                      <div className="sv-status-badge badge-unverified">
                        <XCircle size={14} />
                        <span>Claimed-Only</span>
                      </div>
                    )}

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
                    {isMicrotaskVerified ? (
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
                          title={`Retake ${item.skill} assessment`}
                        >
                          <RotateCcw size={13} />
                          <span>Retake Assessment</span>
                        </button>
                      </>
                    ) : isFailedAssessment ? (
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
                        title={isProven ? `Take ${item.skill} skill assessment` : `Prove ${item.skill} with a practical micro-task`}
                      >
                        <ShieldCheck size={14} />
                        <span>{isProven ? 'Take Skill Assessment' : 'Prove with Micro-Task'}</span>
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
