import React, { useState } from 'react';
import UploadSection from './components/UploadSection.jsx';
import ReportDashboard from './components/ReportDashboard.jsx';
import { verifyCandidate } from './services/api.js';
import { Sparkles, ShieldCheck, Github } from 'lucide-react';

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [session, setSession] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

  const handleVerify = async () => {
    setApiError('');
    setIsLoading(true);

    try {
      const data = await verifyCandidate(resumeFile, githubUsername);
      const authoritativeSession = data.session || data.candidateVerificationSession || data;
      setSession(authoritativeSession);
      console.log("[SkillProof] Verification complete. Session initialized:", authoritativeSession);
    } catch (err) {
      setApiError(err.message || 'Verification request failed. Please check the backend connection.');
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setGithubUsername('');
    setSession(null);
    setApiError('');
    setActiveView('dashboard');
  };

  const handleSkillAdded = (response) => {
    const newSession = response?.session || response;
    if (newSession) {
      setSession(newSession);
      console.log("React session state (after add skill):", newSession);
    }
  };

  const handleEvidenceSubmitted = (response) => {
    const newSession = response?.session || response;
    if (newSession) {
      setSession(newSession);
      console.log("React session state:", newSession);
    }
  };

  const handleSkillDeleted = (response) => {
    const newSession = response?.session || response;
    if (newSession) {
      setSession(newSession);
      console.log("React session state (after delete skill):", newSession);
    }
  };

  const handleNavigate = (viewKey) => {
    setActiveView(viewKey);
  };

  return (
    <div className="app-container">
      {/* Top Professional Sticky Navigation Bar */}
      <nav className="top-navbar" aria-label="Main Navigation">
        <div 
          className="nav-brand" 
          onClick={() => handleNavigate('dashboard')}
          role="button"
          tabIndex={0}
        >
          <ShieldCheck size={22} color="var(--accent-secondary)" />
          <span className="nav-brand-text">SKILL<strong>PROOF</strong></span>
        </div>

        <div className="nav-links">
          <button 
            type="button" 
            id="nav-btn-dashboard"
            className={`nav-link-btn ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigate('dashboard')}
          >
            Dashboard
          </button>
          <button 
            type="button" 
            id="nav-btn-skills"
            className={`nav-link-btn ${activeView === 'skills' ? 'active' : ''}`}
            onClick={() => handleNavigate('skills')}
          >
            Skill Verification
          </button>
          <button 
            type="button" 
            id="nav-btn-evidence"
            className={`nav-link-btn ${activeView === 'evidence' ? 'active' : ''}`}
            onClick={() => handleNavigate('evidence')}
          >
            Evidence
          </button>
          <button 
            type="button" 
            id="nav-btn-job-match"
            className={`nav-link-btn ${activeView === 'job-match' ? 'active' : ''}`}
            onClick={() => handleNavigate('job-match')}
          >
            Job Match
          </button>
          <button 
            type="button" 
            id="nav-btn-skill-gaps"
            className={`nav-link-btn ${activeView === 'skill-gaps' ? 'active' : ''}`}
            onClick={() => handleNavigate('skill-gaps')}
          >
            Skill Gaps
          </button>
          <button 
            type="button" 
            id="nav-btn-growth"
            className={`nav-link-btn ${activeView === 'growth' ? 'active' : ''}`}
            onClick={() => handleNavigate('growth')}
          >
            Growth
          </button>
          <button 
            type="button" 
            id="nav-btn-ai-analysis"
            className={`nav-link-btn ${activeView === 'ai-analysis' ? 'active' : ''}`}
            onClick={() => handleNavigate('ai-analysis')}
          >
            AI Analysis
          </button>
        </div>

        {session?.githubUsername ? (
          <div className="nav-user-tag">
            <Github size={14} />
            <span>@{session.githubUsername}</span>
          </div>
        ) : (
          <div className="nav-status-indicator">
            <span className="status-live-dot" />
            <span>Deterministic Engine</span>
          </div>
        )}
      </nav>

      {/* Hero Header: Shown on initial landing or dashboard view */}
      {(!session || activeView === 'dashboard') && (
        <header className="hero-section">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>Hackathon Skill Verification</span>
          </div>

          <h1 className="hero-title">
            SKILL<span className="brand-gradient">PROOF</span>
          </h1>

          <p className="hero-tagline">
            &ldquo;Prove what you can actually build.&rdquo;
          </p>

          <p className="hero-subtitle">
            Compare the skills claimed on a resume with evidence from real GitHub projects.
          </p>
        </header>
      )}

      {/* Main Content Area */}
      <main>
        {(!session || activeView === 'dashboard') && (
          <UploadSection 
            resumeFile={resumeFile}
            setResumeFile={(file) => {
              setResumeFile(file);
              setApiError('');
            }}
            githubUsername={githubUsername}
            setGithubUsername={(username) => {
              setGithubUsername(username);
              setApiError('');
            }}
            isLoading={isLoading}
            onVerify={handleVerify}
            apiError={apiError}
          />
        )}

        {/* Verification Report & Section Views */}
        <ReportDashboard 
          session={session}
          activeView={activeView}
          setActiveView={setActiveView}
          onReset={handleReset} 
          onSkillAdded={handleSkillAdded}
          onEvidenceSubmitted={handleEvidenceSubmitted}
          onSkillDeleted={handleSkillDeleted}
        />
      </main>
    </div>
  );
}
