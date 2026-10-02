import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  FileCheck, 
  X, 
  AlertCircle, 
  Github, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

const LOADING_MESSAGES = [
  'Extracting resume text...',
  'Analyzing GitHub profile...',
  'Analyzing repositories & languages...',
  'Collecting technology evidence...'
];

export default function UploadSection({ 
  resumeFile, 
  setResumeFile, 
  githubUsername, 
  setGithubUsername,
  isLoading,
  onVerify,
  apiError
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loadingIndex, setLoadingIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Progressive loading status message
  useEffect(() => {
    if (!isLoading) {
      setLoadingIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1100);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Validate and handle chosen file
  const handleFileSelection = (file) => {
    setLocalError('');

    if (!file) return;

    // Strict PDF validation check (MIME type or file extension)
    const isPdfType = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfType && !isPdfExt) {
      setLocalError('Invalid file format. Please upload a PDF resume (.pdf) only.');
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setResumeFile(file);
  };

  // Drag-and-drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    if (isLoading) return;
    setResumeFile(null);
    setLocalError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!resumeFile) {
      setLocalError('Please select or drop a valid PDF resume first.');
      return;
    }
    if (!githubUsername || !githubUsername.trim()) {
      setLocalError('Please enter a GitHub username to verify.');
      return;
    }

    onVerify();
  };

  const activeError = localError || apiError;

  return (
    <div className="verification-card">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          
          {/* Left Column: Resume Upload Section */}
          <div className="form-group">
            <div className="form-group-title">
              <FileText size={20} color="var(--accent-secondary)" />
              <span>1. Candidate Resume</span>
            </div>
            <p className="form-group-desc">
              Upload your resume (PDF only) to extract technical claims and skills.
            </p>

            <input 
              type="file" 
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              disabled={isLoading}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            <div 
              className={`dropzone ${isDragging ? 'dragging' : ''} ${resumeFile ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              {resumeFile ? (
                <>
                  <div className="dropzone-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-verified)' }}>
                    <FileCheck size={28} />
                  </div>
                  <div className="file-pill">
                    <FileText size={18} color="var(--status-verified)" />
                    <span className="file-pill-name" title={resumeFile.name}>
                      {resumeFile.name}
                    </span>
                    {!isLoading && (
                      <button 
                        type="button" 
                        className="file-remove-btn" 
                        title="Remove file"
                        onClick={handleRemoveFile}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <span className="dropzone-subtext" style={{ marginTop: '0.6rem' }}>
                    {isLoading ? 'Processing document...' : 'Click to choose a different PDF'}
                  </span>
                </>
              ) : (
                <>
                  <div className="dropzone-icon-wrap">
                    <UploadCloud size={28} />
                  </div>
                  <p className="dropzone-text">Drag & drop your resume PDF here</p>
                  <span className="dropzone-subtext">PDF files only &bull; Up to 5MB</span>
                  <button 
                    type="button" 
                    className="btn-upload"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <UploadCloud size={16} />
                    <span>Upload Resume</span>
                  </button>
                </>
              )}
            </div>

            {/* Error Banner */}
            {activeError && (
              <div className="error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{activeError}</span>
              </div>
            )}
          </div>

          {/* Right Column: GitHub Handle Section */}
          <div className="form-group github-box">
            <div>
              <div className="form-group-title">
                <Github size={20} color="var(--accent-secondary)" />
                <span>2. GitHub Profile</span>
              </div>
              <p className="form-group-desc">
                Provide your public GitHub handle to inspect repositories and code activity.
              </p>

              <div className="input-container">
                <Github size={22} className="input-icon" />
                <input 
                  type="text"
                  className="github-input"
                  placeholder="Enter GitHub username (e.g. torvalds)"
                  value={githubUsername}
                  disabled={isLoading}
                  onChange={(e) => {
                    setGithubUsername(e.target.value);
                    setLocalError('');
                  }}
                  spellCheck="false"
                  autoComplete="off"
                />
              </div>

              <ul className="github-helper-list">
                <li className="github-helper-item">
                  <CheckCircle2 size={15} color="var(--status-verified)" />
                  <span>In-memory PDF parsing preserves privacy</span>
                </li>
                <li className="github-helper-item">
                  <CheckCircle2 size={15} color="var(--status-verified)" />
                  <span>Audits language statistics & package manifests</span>
                </li>
                <li className="github-helper-item">
                  <CheckCircle2 size={15} color="var(--status-verified)" />
                  <span>Collects observable evidence from public repos</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Main CTA Button */}
        <div className="cta-container">
          <button 
            type="submit" 
            className="btn-cta"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={22} className="spin" />
                <span>{LOADING_MESSAGES[loadingIndex]}</span>
              </>
            ) : (
              <>
                <ShieldCheck size={22} />
                <span>Verify My Skills</span>
              </>
            )}
          </button>

          <p className="cta-note">
            SkillProof compares your resume claims with genuine repository evidence.
          </p>
        </div>
      </form>
    </div>
  );
}
