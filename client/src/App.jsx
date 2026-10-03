import React, { useState } from 'react';
import UploadSection from './components/UploadSection.jsx';
import ReportDashboard from './components/ReportDashboard.jsx';
import RoleLanding from './components/RoleLanding.jsx';
import RecruiterDashboard from './components/RecruiterDashboard.jsx';
import { verifyCandidate } from './services/api.js';
import { Sparkles, ShieldCheck, Github, LogOut } from 'lucide-react';

const DEFAULT_DEMO_SESSION = {
  sessionId: 'session_demo_candidate',
  candidateName: 'Swetha Konney',
  githubUsername: 'skillproof-demo',
  identityStatus: 'verified',
  claimedSkills: [
    { id: 'skill_1_javascript', skill: 'JavaScript', category: 'Programming Languages', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] },
    { id: 'skill_2_python', skill: 'Python', category: 'Programming Languages', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] },
    { id: 'skill_3_sql', skill: 'SQL', category: 'Databases', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] },
    { id: 'skill_4_docker', skill: 'Docker', category: 'DevOps', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] },
    { id: 'skill_5_postgresql', skill: 'PostgreSQL', category: 'Databases', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] },
    { id: 'skill_6_fastapi', skill: 'FastAPI', category: 'Backend', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] },
    { id: 'skill_7_firebase', skill: 'Firebase', category: 'Cloud', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] },
    { id: 'skill_8_github', skill: 'GitHub', category: 'Tools', status: 'unverified', explanation: 'No assessment has been attempted for this skill.', evidence: [] }
  ],
  resume: { filename: 'sample_resume.pdf' }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // { role: 'candidate' | 'recruiter', email: string }
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
      const candidateName = currentUser?.name || session?.candidateName || 'Swetha Konney';
      const data = await verifyCandidate(resumeFile, githubUsername, candidateName);
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
      setSession(prev => {
        const base = prev || DEFAULT_DEMO_SESSION;
        return {
          ...base,
          ...newSession,
          claimedSkills: newSession.claimedSkills || base.claimedSkills || []
        };
      });
      console.log("React session state (after add skill):", newSession);
    }
  };

  const handleEvidenceSubmitted = (response) => {
    const newSession = response?.session || response;
    if (newSession) {
      setSession(prev => {
        const base = prev || DEFAULT_DEMO_SESSION;
        return {
          ...base,
          ...newSession,
          claimedSkills: newSession.claimedSkills || base.claimedSkills || []
        };
      });
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

  // If unauthenticated, display Landing & Role Selection
  if (!currentUser) {
    return <RoleLanding onLogin={(user) => setCurrentUser(user)} />;
  }

  // If Recruiter logged in, render Recruiter Dashboard
  if (currentUser.role === 'recruiter') {
    return (
      <RecruiterDashboard 
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        session={session || DEFAULT_DEMO_SESSION}
      />
    );
  }

  // Otherwise Candidate logged in: render EXISTING candidate dashboard exactly as-is
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {session?.githubUsername ? (
            <div className="nav-user-tag">
              <Github size={14} />
              <span>@{session.githubUsername}</span>
            </div>
          ) : (
            <div className="nav-status-indicator">
              <span className="status-live-dot" />
              <span>Candidate Mode</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCurrentUser(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 500,
              marginLeft: '6px'
            }}
            title="Log out as Candidate"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
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
          session={session || DEFAULT_DEMO_SESSION}
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
