import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Github, 
  User, 
  Mail, 
  Globe, 
  Linkedin, 
  Building, 
  Info,
  ExternalLink
} from 'lucide-react';

export default function IdentityVerificationSection({ identityVerification, isBlocked, blockReason }) {
  if (!identityVerification) return null;

  const {
    status = 'INSUFFICIENT_EVIDENCE',
    confidence = 0,
    reasons = [],
    signals = [],
    resumeIdentity = {},
    githubIdentity = {}
  } = identityVerification;

  const isVerified = status === 'VERIFIED';
  const isMismatch = status === 'MISMATCH';

  return (
    <section id="identity-verification-section" className={`identity-card ${isVerified ? 'border-verified' : (isMismatch ? 'border-mismatch' : 'border-insufficient')}`}>
      {/* Stage Header */}
      <div className="identity-header-row">
        <div>
          <span className={`skills-stage-badge ${isVerified ? 'badge-verified-theme' : (isMismatch ? 'badge-mismatch-theme' : 'badge-insufficient-theme')}`}>
            {isVerified ? <ShieldCheck size={16} /> : (isMismatch ? <XCircle size={16} /> : <AlertTriangle size={16} />)}
            <span>Candidate Identity Verification</span>
          </span>

          <h3 className="identity-title">
            {isVerified ? 'IDENTITY VERIFIED — ELIGIBLE FOR SKILL VERIFICATION' : 'IDENTITY VERIFICATION FAILED'}
          </h3>

          <p className="identity-subtitle">
            {isVerified 
              ? 'The candidate identity was successfully verified across registration, resume, and GitHub.' 
              : (blockReason || 'Identity verification failed — evidence not counted toward skill verification.')}
          </p>
        </div>

        {/* Status & Confidence Badge */}
        <div className="identity-status-box">
          <div className={`identity-pill ${isVerified ? 'pill-verified' : 'pill-mismatch'}`}>
            {isVerified ? <Unlock size={14} /> : <Lock size={14} />}
            <span>{isVerified ? 'VERIFIED' : 'Identity Verification Failed'}</span>
          </div>
          <span className="identity-confidence">
            Confidence: <strong>{confidence}%</strong>
          </span>
        </div>
      </div>

      {/* Security Gate Notice if Blocked */}
      {isBlocked && (
        <div className="identity-blocked-banner">
          <div className="blocked-banner-left">
            <Lock size={20} color="#f87171" style={{ flexShrink: 0 }} />
            <div>
              <strong>SKILL VERIFICATION BLOCKED:</strong>
              <span> Skills from an unlinked GitHub account cannot be attributed to this candidate. The system will never credit a candidate with skills from another person&apos;s GitHub repository.</span>
            </div>
          </div>
        </div>
      )}

      {/* Identity Comparison Grid: Resume vs Submitted GitHub */}
      <div className="identity-comparison-grid">
        {/* Left: Resume Candidate */}
        <div className="identity-box resume-box">
          <div className="identity-box-head">
            <User size={16} color="var(--accent-secondary)" />
            <span>Resume Candidate Profile</span>
          </div>

          <div className="identity-field-list">
            <div className="identity-field">
              <span className="field-label">Candidate Name:</span>
              <span className="field-value">
                {resumeIdentity.name ? <strong>{resumeIdentity.name}</strong> : <em className="text-subtle">Not detected</em>}
              </span>
            </div>

            <div className="identity-field">
              <span className="field-label">Email Address:</span>
              <span className="field-value">
                {resumeIdentity.email ? resumeIdentity.email : <em className="text-subtle">Not listed in resume</em>}
              </span>
            </div>

            <div className="identity-field">
              <span className="field-label">Resume GitHub URL:</span>
              <span className="field-value">
                {resumeIdentity.githubUsername ? (
                  <span className="field-link-pill">
                    <Github size={12} />
                    <span>@{resumeIdentity.githubUsername}</span>
                  </span>
                ) : (
                  <em className="text-subtle">No GitHub link in resume</em>
                )}
              </span>
            </div>

            <div className="identity-field">
              <span className="field-label">LinkedIn URL:</span>
              <span className="field-value">
                {resumeIdentity.linkedin ? (
                  <span className="field-text-truncate">{resumeIdentity.linkedin}</span>
                ) : (
                  <em className="text-subtle">Not listed</em>
                )}
              </span>
            </div>

            <div className="identity-field">
              <span className="field-label">Website / Portfolio:</span>
              <span className="field-value">
                {resumeIdentity.website ? (
                  <span className="field-text-truncate">{resumeIdentity.website}</span>
                ) : (
                  <em className="text-subtle">Not listed</em>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Submitted GitHub Profile */}
        <div className="identity-box github-box">
          <div className="identity-box-head">
            <Github size={16} color="#f8fafc" />
            <span>Submitted GitHub Profile</span>
          </div>

          <div className="identity-field-list">
            <div className="identity-field">
              <span className="field-label">Username:</span>
              <span className="field-value">
                <strong>@{githubIdentity.username}</strong>
                {githubIdentity.profileUrl && (
                  <a href={githubIdentity.profileUrl} target="_blank" rel="noopener noreferrer" className="btn-ext-link">
                    <ExternalLink size={12} />
                  </a>
                )}
              </span>
            </div>

            <div className="identity-field">
              <span className="field-label">Display Name:</span>
              <span className="field-value">
                {githubIdentity.name ? <strong>{githubIdentity.name}</strong> : <em className="text-subtle">None specified</em>}
              </span>
            </div>

            <div className="identity-field">
              <span className="field-label">Public Email:</span>
              <span className="field-value">
                {githubIdentity.email ? githubIdentity.email : <em className="text-subtle">Not publicly exposed</em>}
              </span>
            </div>

            <div className="identity-field">
              <span className="field-label">Bio:</span>
              <span className="field-value">
                {githubIdentity.bio ? <span className="field-text-truncate">{githubIdentity.bio}</span> : <em className="text-subtle">Empty bio</em>}
              </span>
            </div>

            <div className="identity-field">
              <span className="field-label">Blog / Website:</span>
              <span className="field-value">
                {githubIdentity.website ? (
                  <span className="field-text-truncate">{githubIdentity.website}</span>
                ) : (
                  <em className="text-subtle">Not specified</em>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signals Evaluated Breakdown */}
      {signals && signals.length > 0 && (
        <div className="identity-signals-section">
          <div className="signals-header">
            <Info size={14} color="var(--accent-secondary)" />
            <span>Identity Signals Evaluated</span>
          </div>

          <div className="signals-grid">
            {signals.map((sig, idx) => {
              const isMatch = sig.status === 'MATCH';
              const isConflict = sig.status === 'CONFLICT';

              return (
                <div key={idx} className={`signal-item ${isMatch ? 'sig-match' : (isConflict ? 'sig-conflict' : 'sig-neutral')}`}>
                  <div className="sig-head">
                    <span className="sig-label">{sig.label}</span>
                    <span className={`sig-tag ${isMatch ? 'tag-match' : (isConflict ? 'tag-conflict' : 'tag-neutral')}`}>
                      {isMatch ? '✓ MATCH' : (isConflict ? '✕ CONFLICT' : '— NEUTRAL')}
                    </span>
                  </div>
                  <p className="sig-details">{sig.details}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanatory Reasons */}
      {reasons && reasons.length > 0 && (
        <div className="identity-reasons-box">
          <span className="reasons-label">Verification Assessment:</span>
          <ul className="reasons-list">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
