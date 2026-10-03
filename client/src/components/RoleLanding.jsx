import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Briefcase, 
  ArrowRight, 
  Lock, 
  Mail, 
  CheckCircle2, 
  UserPlus,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function RoleLanding({ onLogin }) {
  // viewMode: 'landing' | 'candidate_login' | 'recruiter_login' | 'candidate_register'
  const [viewMode, setViewMode] = useState('landing');

  // Candidate Login state
  const [candidateEmail, setCandidateEmail] = useState('candidate@skillproof.dev');
  const [candidatePassword, setCandidatePassword] = useState('candidate123');
  const [loginError, setLoginError] = useState('');

  // Recruiter Login state
  const [recruiterEmail, setRecruiterEmail] = useState('recruiter@techcorp.io');
  const [recruiterPassword, setRecruiterPassword] = useState('recruiter123');

  // Candidate Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Helper to get registered candidates from localStorage
  const getRegisteredCandidates = () => {
    try {
      const stored = localStorage.getItem('skillproof_candidates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const handleCandidateLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const email = candidateEmail.trim().toLowerCase();
    const password = candidatePassword;

    // Check default demo account
    if (email === 'candidate@skillproof.dev' && password === 'candidate123') {
      onLogin({
        role: 'candidate',
        email: 'candidate@skillproof.dev',
        name: 'Swetha Konney'
      });
      return;
    }

    // Check registered accounts in localStorage
    const accounts = getRegisteredCandidates();
    const matched = accounts.find(
      acc => acc.email.toLowerCase() === email && acc.password === password
    );

    if (matched) {
      onLogin({
        role: 'candidate',
        email: matched.email,
        name: matched.name || 'Candidate'
      });
      return;
    }

    // If demo password used or simple fallback for demo purposes
    if (email && password) {
      onLogin({
        role: 'candidate',
        email: email,
        name: email.split('@')[0]
      });
      return;
    }

    setLoginError('Invalid email or password. Please use demo credentials or register.');
  };

  const handleRecruiterLoginSubmit = (e) => {
    e.preventDefault();
    onLogin({
      role: 'recruiter',
      email: recruiterEmail.trim() || 'recruiter@techcorp.io',
      name: 'Sarah Jenkins (Recruiter)',
      company: 'TechCorp Talent'
    });
  };

  const handleCandidateRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Validation 1: All required fields filled
    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword) {
      setRegError('All fields are required.');
      return;
    }

    // Validation 2: Email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(regEmail.trim())) {
      setRegError('Please enter a valid email address.');
      return;
    }

    // Validation 3: Password match
    if (regPassword !== regConfirmPassword) {
      setRegError('Password and Confirm Password do not match.');
      return;
    }

    // Save candidate locally
    const accounts = getRegisteredCandidates();
    const exists = accounts.some(acc => acc.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (exists) {
      setRegError('An account with this email already exists. Please log in.');
      return;
    }

    const newCandidate = {
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      createdAt: new Date().toISOString()
    };

    accounts.push(newCandidate);
    try {
      localStorage.setItem('skillproof_candidates', JSON.stringify(accounts));
    } catch {
      // ignore storage errors
    }

    // Prefill login with registered credentials
    setCandidateEmail(newCandidate.email);
    setCandidatePassword(newCandidate.password);
    setRegSuccess('Candidate account created successfully.');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');

    // Switch to Candidate Login mode
    setTimeout(() => {
      setViewMode('candidate_login');
    }, 900);
  };

  return (
    <div className="role-landing-container" style={{
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          color: 'var(--accent-secondary)'
        }}>
          <ShieldCheck size={16} />
          <span>Objective Proof Engine</span>
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: '0.5rem',
          lineHeight: 1.1
        }}>
          SKILL<span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>PROOF</span>
        </h1>

        <p style={{
          fontSize: '1.35rem',
          color: 'var(--text-main)',
          fontWeight: 500,
          marginBottom: '0.5rem'
        }}>
          &ldquo;Verify Skills. Prove Capability.&rdquo;
        </p>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          maxWidth: '520px',
          margin: '0 auto'
        }}>
          Bridging resume claims with verifiable GitHub evidence, practical micro-tasks, and authoritative talent evaluation.
        </p>
      </div>

      {/* VIEW 1: LANDING WITH [CANDIDATE LOGIN], [RECRUITER LOGIN], AND [REGISTER AS CANDIDATE] */}
      {viewMode === 'landing' && (
        <div style={{ width: '100%', maxWidth: '740px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* Candidate Entry Card */}
            <div 
              style={{
                background: 'rgba(17, 24, 39, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '18px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                marginBottom: '1.25rem'
              }}>
                <User size={24} />
              </div>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#fff' }}>
                Candidate Portal
              </h3>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                Upload your resume, connect your GitHub, take practical micro-tasks, and prove your capabilities.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn-primary-action"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '0.75rem 1rem'
                  }}
                  onClick={() => setViewMode('candidate_login')}
                >
                  <span>CANDIDATE LOGIN</span>
                  <ArrowRight size={16} />
                </button>

                <button 
                  type="button" 
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.88rem'
                  }}
                  onClick={() => setViewMode('candidate_register')}
                >
                  <UserPlus size={15} />
                  <span>Register as Candidate</span>
                </button>
              </div>
            </div>

            {/* Recruiter Entry Card */}
            <div 
              style={{
                background: 'rgba(17, 24, 39, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '18px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4',
                marginBottom: '1.25rem'
              }}>
                <Briefcase size={24} />
              </div>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#fff' }}>
                Recruiter Portal
              </h3>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                Post jobs, inspect verified candidate evidence, review practical assessment scores, and match candidates.
              </p>

              <div style={{ marginTop: 'auto' }}>
                <button 
                  type="button" 
                  className="btn-primary-action"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #0891b2 0%, #6366f1 100%)'
                  }}
                  onClick={() => setViewMode('recruiter_login')}
                >
                  <span>RECRUITER LOGIN</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CANDIDATE LOGIN FORM */}
      {viewMode === 'candidate_login' && (
        <div style={{
          width: '100%',
          maxWidth: '440px',
          margin: '0 auto',
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}>
                <User size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Candidate Login</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Candidate Workspace</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewMode('landing');
                setLoginError('');
                setRegSuccess('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          {/* Success banner if redirected from registration */}
          {regSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{regSuccess}</span>
            </div>
          )}

          {/* Error banner */}
          {loginError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleCandidateLoginSubmit}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="candidate@skillproof.dev"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={candidatePassword}
                  onChange={(e) => setCandidatePassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-action"
              style={{
                width: '100%',
                padding: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                marginBottom: '1rem'
              }}
            >
              <span>Login as Candidate</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Registration link */}
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setViewMode('candidate_register');
                setLoginError('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Register as Candidate
            </button>
          </div>

          {/* Quick Demo Hint */}
          <div style={{
            marginTop: '1.25rem',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            fontSize: '0.78rem',
            color: 'var(--text-subtle)',
            textAlign: 'center'
          }}>
            Demo credentials: <strong>candidate@skillproof.dev</strong> / <strong>candidate123</strong>
          </div>
        </div>
      )}

      {/* VIEW 3: CANDIDATE REGISTRATION FORM */}
      {viewMode === 'candidate_register' && (
        <div style={{
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}>
                <UserPlus size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Register as Candidate</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Create your candidate profile</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewMode('landing');
                setRegError('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          {/* Validation Alert */}
          {regError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleCandidateRegisterSubmit}>
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Mercer"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="alex.mercer@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary-action"
              style={{
                width: '100%',
                padding: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                marginBottom: '1rem'
              }}
            >
              <span>Register as Candidate</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setViewMode('candidate_login');
                setRegError('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Candidate Login
            </button>
          </div>
        </div>
      )}

      {/* VIEW 4: RECRUITER LOGIN FORM */}
      {viewMode === 'recruiter_login' && (
        <div style={{
          width: '100%',
          maxWidth: '440px',
          margin: '0 auto',
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4'
              }}>
                <Briefcase size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Recruiter Login</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Recruiter Workspace</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('landing')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          <form onSubmit={handleRecruiterLoginSubmit}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="recruiter@techcorp.io"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={recruiterPassword}
                  onChange={(e) => setRecruiterPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-action"
              style={{
                width: '100%',
                padding: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #0891b2 0%, #6366f1 100%)'
              }}
            >
              <span>Login as Recruiter</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Hint */}
          <div style={{
            marginTop: '1.25rem',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            fontSize: '0.78rem',
            color: 'var(--text-subtle)',
            textAlign: 'center'
          }}>
            Demo credentials: <strong>recruiter@techcorp.io</strong> / <strong>recruiter123</strong>
          </div>
        </div>
      )}
    </div>
  );
}
