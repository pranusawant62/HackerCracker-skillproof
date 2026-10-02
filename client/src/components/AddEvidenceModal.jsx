import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Link2, 
  FolderGit2, 
  Award, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  ShieldCheck,
  Github
} from 'lucide-react';
import { submitSkillEvidence } from '../services/api.js';

const EVIDENCE_TYPES = [
  { id: 'project_url', label: 'Project URL', icon: Link2, desc: 'Link to live project or interactive dashboard' },
  { id: 'github_repo', label: 'GitHub Repository', icon: FolderGit2, desc: 'Public repository containing code or models' },
  { id: 'portfolio', label: 'Portfolio URL', icon: ExternalLink, desc: 'Personal portfolio section or case study' },
  { id: 'file', label: 'File / Document', icon: FileText, desc: 'Project documentation, export, or report' },
  { id: 'certificate', label: 'Certificate', icon: Award, desc: 'Professional certification or credential' },
  { id: 'demo_url', label: 'Demo / Deployment URL', icon: ExternalLink, desc: 'Live deployed application or dashboard' },
  { id: 'other', label: 'Other Evidence', icon: FileCode, desc: 'Technical writeup or source artifacts' }
];

export default function AddEvidenceModal({ 
  isOpen, 
  onClose, 
  skill, 
  sessionId, 
  githubUsername, 
  onEvidenceSubmitted 
}) {
  const [evidenceType, setEvidenceType] = useState('project_url');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !skill) return null;

  const skillName = typeof skill === 'string' ? skill : (skill.skill || 'Skill');
  const skillId = typeof skill === 'object' ? skill.id : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (evidenceType === 'file' && !file) {
      setError('Please select a file to upload as evidence.');
      return;
    }

    if (evidenceType === 'certificate' && !file && !url.trim() && !title.trim() && !notes.trim()) {
      setError('Please upload a certificate document, provide a credential URL, or enter certificate title.');
      return;
    }

    if (evidenceType !== 'file' && evidenceType !== 'certificate' && !url.trim() && !notes.trim()) {
      setError('Please provide a URL or technical description for this evidence.');
      return;
    }

    if (!sessionId) {
      setError('Candidate session not found. Please verify candidate identity first.');
      return;
    }

    setIsSubmitting(true);
    console.log("BEFORE evidence submission:");
    console.log("sessionId:", sessionId);
    console.log("skill ID:", skillId);
    console.log("old skill status:", skill?.status);

    try {
      const result = await submitSkillEvidence({
        sessionId,
        skill: skillName,
        skillId,
        evidenceType,
        url: url.trim(),
        title: title.trim() || `${skillName} Evidence (${evidenceType.replace('_', ' ')})`,
        notes: notes.trim(),
        file
      });

      console.log("AFTER evidence submission:");
      console.log("response.skill.status:", result.skill?.status);
      console.log("response.session.claimedSkills.find(...):", result.session?.claimedSkills?.find(s => s.id === skillId || s.skill?.toLowerCase() === skillName.toLowerCase()));

      const finalStatus = result.skill?.status || result.skillStatus || 'unverified';
      setSuccessMsg(`Evidence analyzed: ${skillName} is now ${finalStatus.toUpperCase()}!`);

      if (onEvidenceSubmitted) {
        onEvidenceSubmitted(result);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1000);

    } catch (err) {
      setError(err.message || 'Evidence submission failed.');
      setIsSubmitting(false);
    }
  };

  const getPlaceholderForType = () => {
    switch (evidenceType) {
      case 'github_repo':
        return `https://github.com/${githubUsername || 'username'}/my-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-project`;
      case 'project_url':
        return `https://app.${skillName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/... or project link`;
      case 'portfolio':
        return 'https://myportfolio.dev/projects/...';
      case 'demo_url':
        return 'https://my-live-dashboard.vercel.app';
      case 'certificate':
        return 'https://learn.microsoft.com/credentials/... or credential link';
      default:
        return 'https://...';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog add-evidence-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title-wrap">
              <UploadCloud size={20} color="var(--accent-secondary)" />
              <h3>Add Observable Evidence for {skillName}</h3>
            </div>
            <div className="modal-candidate-badge">
              <ShieldCheck size={13} color="var(--status-verified)" />
              <span>Verified Session:</span>
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#f8fafc' }}>
                <Github size={12} /> @{githubUsername || 'candidate'}
              </strong>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-description">
          Provide observable technical artifacts to substantiate your claim for <strong>{skillName}</strong>. 
          Your verified GitHub account is already linked; no re-verification is needed.
        </p>

        {error && (
          <div className="modal-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="modal-success-alert">
            <CheckCircle2 size={16} color="var(--status-verified)" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Evidence Type Radio Cards */}
          <div className="form-group">
            <label className="section-sublabel">Select Evidence Type</label>
            <div className="evidence-types-grid">
              {EVIDENCE_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = evidenceType === t.id;
                return (
                  <div
                    key={t.id}
                    className={`evidence-type-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setEvidenceType(t.id)}
                  >
                    <div className="ev-card-icon">
                      <Icon size={18} color={isSelected ? 'var(--accent-secondary)' : 'var(--text-subtle)'} />
                    </div>
                    <div className="ev-card-text">
                      <span className="ev-card-title">{t.label}</span>
                      <span className="ev-card-desc">{t.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conditional Inputs Based on Evidence Type */}
          {evidenceType === 'certificate' ? (
            <>
              <div className="form-group">
                <label htmlFor="evidence-url-input">
                  Certificate Verification Link (URL)
                </label>
                <div className="input-with-icon">
                  <Link2 size={16} className="input-icon" />
                  <input
                    id="evidence-url-input"
                    type="url"
                    className="modal-input has-icon"
                    placeholder="https://learn.microsoft.com/credentials/... or https://www.credly.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="evidence-file-input">Or Upload Certificate Document (PDF / Image)</label>
                <div className="file-upload-dropzone">
                  <input
                    id="evidence-file-input"
                    type="file"
                    className="file-input-hidden"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="evidence-file-input" className="dropzone-label">
                    <Award size={28} color="#f59e0b" />
                    {file ? (
                      <div>
                        <strong>{file.name}</strong>
                        <span className="file-size-tag">({Math.round(file.size / 1024)} KB)</span>
                      </div>
                    ) : (
                      <div>
                        <span>Click or drag certificate PDF or image here</span>
                        <small>Supports PDF, PNG, JPG (e.g. Power_BI_Certificate.pdf)</small>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </>
          ) : evidenceType === 'file' ? (
            <div className="form-group">
              <label htmlFor="evidence-file-input">Upload Evidence Document / Artifact *</label>
              <div className="file-upload-dropzone">
                <input
                  id="evidence-file-input"
                  type="file"
                  className="file-input-hidden"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg,.json"
                  disabled={isSubmitting}
                />
                <label htmlFor="evidence-file-input" className="dropzone-label">
                  <UploadCloud size={28} color="var(--accent-secondary)" />
                  {file ? (
                    <div>
                      <strong>{file.name}</strong>
                      <span className="file-size-tag">({Math.round(file.size / 1024)} KB)</span>
                    </div>
                  ) : (
                    <div>
                      <span>Click or drag project document, report, or screenshot here</span>
                      <small>Supports PDF, TXT, MD, DOCX, PNG, JPG (up to 10MB)</small>
                    </div>
                  )}
                </label>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="evidence-url-input">
                {evidenceType === 'github_repo' ? 'Repository URL *' : `${EVIDENCE_TYPES.find(t => t.id === evidenceType)?.label} *`}
              </label>
              <div className="input-with-icon">
                <Link2 size={16} className="input-icon" />
                <input
                  id="evidence-url-input"
                  type="url"
                  className="modal-input has-icon"
                  placeholder={getPlaceholderForType()}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Optional Title */}
          <div className="form-group">
            <label htmlFor="evidence-title-input">Evidence Title (Optional)</label>
            <input
              id="evidence-title-input"
              type="text"
              className="modal-input"
              placeholder={`e.g. ${skillName} Production Dashboard Showcase`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Technical Notes / Artifacts Description */}
          <div className="form-group">
            <label htmlFor="evidence-notes-input">Technical Description & Observable Artifacts</label>
            <textarea
              id="evidence-notes-input"
              rows={3}
              className="modal-textarea"
              placeholder={`Describe key observable artifacts for ${skillName} (e.g. data modeling, DAX queries, backend endpoints, source files, dependencies used)...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-primary"
              disabled={isSubmitting || (evidenceType === 'file' ? !file : (!url.trim() && !notes.trim()))}
            >
              {isSubmitting ? (
                <span>Analyzing Evidence...</span>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Submit Evidence</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
