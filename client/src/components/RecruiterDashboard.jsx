import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Search, 
  Plus, 
  LogOut, 
  ExternalLink, 
  FileText, 
  Github, 
  Award, 
  Filter, 
  TrendingUp, 
  Building, 
  User, 
  Sparkles,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  X,
  Clock,
  Layers,
  Check,
  Calendar
} from 'lucide-react';

export default function RecruiterDashboard({ currentUser, onLogout, session }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'jobs' | 'candidates' | 'verification' | 'job-matching' | 'profile'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedJobForMatch, setSelectedJobForMatch] = useState('job_1');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [interviewModalCandidate, setInterviewModalCandidate] = useState(null);
  const [interviewScheduledToast, setInterviewScheduledToast] = useState('');
  const [jobFormError, setJobFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (showCreateJobModal || selectedCandidate || interviewModalCandidate) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
      };
    }
  }, [showCreateJobModal, selectedCandidate, interviewModalCandidate]);

  // Initial Recruiter Jobs
  const [jobs, setJobs] = useState([
    {
      id: 'job_1',
      title: 'Backend Developer',
      company: 'TechCorp',
      department: 'Engineering',
      location: 'Remote / Hybrid',
      requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      optionalSkills: ['Redis', 'AWS'],
      description: 'Design and implement high-performance, fault-tolerant REST APIs and microservices using Python and FastAPI. Manage containerized deployments with Docker and design relational schemas in PostgreSQL.',
      postedDate: '2 days ago',
      applicantCount: 4,
      status: 'Active'
    },
    {
      id: 'job_2',
      title: 'Frontend Developer',
      company: 'TechCorp',
      department: 'Product Web',
      location: 'San Francisco, CA',
      requiredSkills: ['React', 'JavaScript', 'TypeScript'],
      optionalSkills: ['Tailwind CSS', 'Next.js'],
      description: 'Build responsive, accessible user interfaces using React and modern TypeScript. Collaborate with design systems and connect real-time streaming backend APIs.',
      postedDate: '5 days ago',
      applicantCount: 7,
      status: 'Active'
    },
    {
      id: 'job_3',
      title: 'Full Stack Engineer',
      company: 'TechCorp',
      department: 'Core Platform',
      location: 'Remote',
      requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      optionalSkills: ['AWS', 'CI/CD'],
      description: 'End-to-end full stack developer building robust web applications with React on the client and Node.js/PostgreSQL services running in containerized environments.',
      postedDate: '1 week ago',
      applicantCount: 3,
      status: 'Active'
    }
  ]);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('TechCorp');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobRequiredSkills, setNewJobRequiredSkills] = useState('');
  const [newJobOptionalSkills, setNewJobOptionalSkills] = useState('');

  // Built-in Candidates Data (integrating active candidate session if available)
  const baseCandidates = [
    {
      id: 'cand_a',
      name: 'Alex Mercer',
      email: 'alex.mercer@dev.io',
      role: 'Senior Backend Engineer',
      githubUsername: 'alexmercer-dev',
      summary: 'Backend specialist with deep experience in asynchronous Python, microservices architecture, and containerized deployments.',
      provenSkills: ['Python', 'FastAPI', 'Docker'],
      partiallyProvenSkills: ['PostgreSQL'],
      claimedOnlySkills: ['Redis', 'Kubernetes'],
      unverifiedSkills: [],
      skillsDetail: [
        {
          name: 'Python',
          status: 'proven',
          evidence: [
            'GitHub repo: fast-async-worker (24 commits, 4 releases)',
            'Direct observable FastAPI controller code',
            'Practical Assessment: 90% (MICRO-TASK VERIFIED)'
          ]
        },
        {
          name: 'FastAPI',
          status: 'proven',
          evidence: [
            'Production OpenAPI route implementation with Pydantic v2',
            'Practical Assessment: 85% (MICRO-TASK VERIFIED)'
          ]
        },
        {
          name: 'PostgreSQL',
          status: 'partially_proven',
          evidence: [
            'SQL migration scripts observed in 2 repositories',
            'Requires additional index query optimization evidence'
          ]
        },
        {
          name: 'Docker',
          status: 'proven',
          evidence: [
            'Multi-stage Dockerfile and docker-compose.yml with healthchecks',
            'Practical Assessment: 95% (MICRO-TASK VERIFIED)'
          ]
        },
        {
          name: 'Redis',
          status: 'claimed_only',
          evidence: []
        },
        {
          name: 'Kubernetes',
          status: 'claimed_only',
          evidence: []
        }
      ],
      githubEvidence: {
        totalRepos: 18,
        observableCommits: 342,
        primaryLanguages: ['Python (68%)', 'TypeScript (22%)', 'Dockerfile (10%)'],
        verifiedHandle: 'alexmercer-dev'
      },
      certificateEvidence: [
        { title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', verified: true },
        { title: 'Professional Python Developer', issuer: 'Python Institute', verified: true }
      ],
      assessmentResults: [
        { skill: 'Python', score: 90, status: 'VERIFIED', focusViolations: 0 },
        { skill: 'Docker', score: 95, status: 'VERIFIED', focusViolations: 0 }
      ],
      matchScores: {
        job_1: 94,
        job_2: 42,
        job_3: 82
      }
    },
    {
      id: 'cand_b',
      name: 'Jordan Lee',
      email: 'jordan.lee@dev.io',
      role: 'Frontend UI/UX Engineer',
      githubUsername: 'jordanlee-code',
      summary: 'Frontend engineer passionate about accessible interfaces, component libraries, and interactive visualization in React and modern JavaScript.',
      provenSkills: ['Python', 'React'],
      partiallyProvenSkills: ['JavaScript', 'TypeScript'],
      claimedOnlySkills: ['Docker'],
      unverifiedSkills: [],
      skillsDetail: [
        {
          name: 'Python',
          status: 'proven',
          evidence: [
            'GitHub repo: data-viz-tools (Python data parsing)',
            'Practical Assessment: 80% (MICRO-TASK VERIFIED)'
          ]
        },
        {
          name: 'React',
          status: 'proven',
          evidence: [
            'Production React component library with custom hooks',
            'Verified client-side state machine implementation'
          ]
        },
        {
          name: 'JavaScript',
          status: 'partially_proven',
          evidence: [
            'Modular ES6 scripts observed across 8 client projects'
          ]
        },
        {
          name: 'TypeScript',
          status: 'partially_proven',
          evidence: [
            'Strict typing definitions in react-data-grid repo'
          ]
        },
        {
          name: 'Docker',
          status: 'claimed_only',
          evidence: []
        }
      ],
      githubEvidence: {
        totalRepos: 24,
        observableCommits: 512,
        primaryLanguages: ['JavaScript (52%)', 'TypeScript (34%)', 'Python (14%)'],
        verifiedHandle: 'jordanlee-code'
      },
      certificateEvidence: [
        { title: 'Meta Frontend Developer Professional Certificate', issuer: 'Coursera / Meta', verified: true }
      ],
      assessmentResults: [
        { skill: 'React', score: 88, status: 'VERIFIED', focusViolations: 0 },
        { skill: 'Python', score: 80, status: 'VERIFIED', focusViolations: 1 }
      ],
      matchScores: {
        job_1: 45,
        job_2: 92,
        job_3: 74
      }
    }
  ];

  // If active candidate session exists in parent App, prepend it to candidate pool
  let candidates = [...baseCandidates];
  if (session && (session.candidateName || session.githubUsername || (session.claimedSkills && session.claimedSkills.length > 0))) {
    const sessionCandidateName = session.candidateName || session.resume?.identity?.name || `@${session.githubUsername}` || 'Active Candidate';
    const proven = (session.claimedSkills || []).filter(s => s.status === 'proven').map(s => s.skill);
    const partial = (session.claimedSkills || []).filter(s => s.status === 'partially_proven').map(s => s.skill);
    const claimed = (session.claimedSkills || []).filter(s => s.status === 'unverified' || s.status === 'claimed_only').map(s => s.skill);
    const failed = (session.claimedSkills || []).filter(s => s.status === 'failed' || s.status === 'not_passed').map(s => s.skill);
    const invalidated = (session.claimedSkills || []).filter(s => s.status === 'invalidated').map(s => s.skill);

    const activeCandidateObj = {
      id: session.sessionId || 'cand_live',
      name: sessionCandidateName,
      email: session.resume?.identity?.email || `${session.githubUsername || 'candidate'}@verified.proof`,
      role: 'Full Stack Applicant',
      githubUsername: session.githubUsername || 'unlinked',
      summary: 'Verified SkillProof applicant evaluated via direct resume extraction and live GitHub code analysis.',
      provenSkills: proven,
      partiallyProvenSkills: partial,
      claimedOnlySkills: claimed,
      failedSkills: failed,
      invalidatedSkills: invalidated,
      unverifiedSkills: [],
      skillsDetail: (session.claimedSkills || []).map(s => {
        let st = 'claimed_only';
        if (s.status === 'proven') st = 'proven';
        else if (s.status === 'partially_proven') st = 'partially_proven';
        if (s.status === 'failed' || s.status === 'not_passed') st = 'failed';
        else if (s.status === 'invalidated') st = 'invalidated';
        return {
          name: s.skill,
          status: st,
          score: s.score,
          explanation: s.explanation,
          evidence: Array.isArray(s.evidence) && s.evidence.length > 0 
            ? s.evidence.map(e => e.title || e.details || 'Observable repository artifact')
            : [s.explanation || (st === 'failed' ? `Assessment Attempted (${s.score ?? 0}%) — Not Passed` : st === 'invalidated' ? 'Assessment Invalidated — Focus Violation' : 'Claimed on resume')]
        };
      }),
      githubEvidence: {
        totalRepos: session.github?.repositories?.length || 12,
        observableCommits: session.github?.totalCommits || 164,
        primaryLanguages: session.github?.topLanguages || ['JavaScript', 'Python'],
        verifiedHandle: session.githubUsername || 'verified_user'
      },
      certificateEvidence: [
        { title: 'Verified GitHub SkillProof Attestation', issuer: 'SkillProof Verification Engine', verified: true }
      ],
      assessmentResults: (session.claimedSkills || []).some(s => s.assessmentStatus || s.score !== undefined || s.status === 'failed' || s.status === 'invalidated' || s.status === 'proven')
        ? (session.claimedSkills || [])
            .filter(s => s.assessmentStatus || s.score !== undefined || s.status === 'failed' || s.status === 'invalidated' || (s.status === 'proven' && s.assessmentAttempted))
            .map(s => ({
              skill: s.skill,
              score: s.score ?? 0,
              status: s.status === 'proven' ? 'PASSED' : s.status === 'invalidated' ? 'INVALIDATED' : 'NOT PASSED',
              focusViolations: s.focusViolations || 0
            }))
        : (session.assessmentResults || []),
      matchScores: {
        job_1: 88,
        job_2: 81,
        job_3: 86
      },
      isLiveCandidate: true
    };

    candidates = [activeCandidateObj, ...baseCandidates];
  }

  // Handle Create Job Submission with Validation
  const handleCreateJob = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setJobFormError('');

    const cleanTitle = newJobTitle.trim();
    if (!cleanTitle) {
      setJobFormError('Job title is required.');
      return;
    }

    const reqSkills = newJobRequiredSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (reqSkills.length === 0) {
      setJobFormError('At least one required skill is required.');
      return;
    }

    const optSkills = newJobOptionalSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newJob = {
      id: `job_${Date.now()}`,
      title: cleanTitle,
      company: newJobCompany.trim() || 'TechCorp',
      department: 'Engineering',
      location: 'Remote / Hybrid',
      requiredSkills: reqSkills,
      optionalSkills: optSkills,
      description: newJobDescription.trim() || 'Exciting engineering role requiring verified capability.',
      postedDate: 'Just now',
      applicantCount: candidates.length,
      status: 'Active'
    };

    setJobs(prevJobs => [newJob, ...prevJobs]);
    setNewJobTitle('');
    setNewJobCompany('TechCorp');
    setNewJobDescription('');
    setNewJobRequiredSkills('');
    setNewJobOptionalSkills('');
    setJobFormError('');
    setShowCreateJobModal(false);
    setSuccessToast('Job created successfully.');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const filteredCandidates = candidates.filter(c => {
    const q = candidateSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || 
           c.role.toLowerCase().includes(q) ||
           c.provenSkills.some(s => s.toLowerCase().includes(q));
  });

  const totalVerifiedSkillsCount = candidates.reduce((acc, c) => acc + c.provenSkills.length, 0);

  return (
    <div className="recruiter-app-container" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Recruiter Navigation Bar */}
      <nav className="top-navbar" style={{ position: 'sticky', top: 0, zIndex: 100, marginBottom: '2rem' }}>
        <div 
          className="nav-brand" 
          onClick={() => setActiveTab('dashboard')}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <ShieldCheck size={22} color="var(--accent-secondary)" />
          <span className="nav-brand-text">
            SKILL<strong>PROOF</strong> <span style={{ fontSize: '0.72rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.12)', marginLeft: '6px' }}>Recruiter</span>
          </span>
        </div>

        <div className="nav-links">
          <button 
            type="button" 
            className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            type="button" 
            className={`nav-link-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button 
            type="button" 
            className={`nav-link-btn ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            Candidates
          </button>
          <button 
            type="button" 
            className={`nav-link-btn ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            Skill Verification
          </button>
          <button 
            type="button" 
            className={`nav-link-btn ${activeTab === 'job-matching' ? 'active' : ''}`}
            onClick={() => setActiveTab('job-matching')}
          >
            Job Matching
          </button>
          <button 
            type="button" 
            className={`nav-link-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Building size={15} color="#06b6d4" />
            <span>TechCorp Talent</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            title="Log out from Recruiter Portal"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Recruiter Content Views */}
      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Toast for scheduled interview */}
        {interviewScheduledToast && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 10001,
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{interviewScheduledToast}</span>
          </div>
        )}

        {/* Toast for Job Creation Success */}
        {successToast && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 10001,
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{successToast}</span>
          </div>
        )}

        {/* ========================================================
            TAB 1: RECRUITER DASHBOARD
           ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="recruiter-dashboard-view">
            {/* Header Greeting */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '0.3rem', color: '#fff' }}>
                  Welcome, <span className="brand-gradient">Recruiter</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Review objective proof of candidate capability backed by deterministic GitHub evidence and micro-tasks.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setShowCreateJobModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem' }}
              >
                <Plus size={16} />
                <span>Create Job</span>
              </button>
            </div>

            {/* Metrics Overview Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem'
            }}>
              <div style={{
                background: 'rgba(17, 24, 39, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8'
                }}>
                  <Briefcase size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Jobs
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#fff' }}>
                    {jobs.length}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(17, 24, 39, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4'
                }}>
                  <Users size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Candidates
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#fff' }}>
                    {candidates.length}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(17, 24, 39, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399'
                }}>
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Verified Skills
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#34d399' }}>
                    {totalVerifiedSkillsCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Jobs Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>Recent Jobs</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-secondary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View All Jobs</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobs.map(job => (
                  <div 
                    key={job.id}
                    style={{
                      background: 'rgba(17, 24, 39, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.35rem' }}>
                        <h4 style={{ fontSize: '1.15rem', color: '#fff' }}>{job.title}</h4>
                        <span style={{
                          fontSize: '0.72rem',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#34d399',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}>
                          {job.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                        {job.company} &bull; {job.location} &bull; Posted {job.postedDate}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {job.requiredSkills.map((sk, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              background: 'rgba(99, 102, 241, 0.12)',
                              color: '#818cf8',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(99, 102, 241, 0.2)'
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {candidates.length} candidate matches
                      </span>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '7px 14px', fontSize: '0.85rem' }}
                        onClick={() => {
                          setSelectedJobForMatch(job.id);
                          setActiveTab('job-matching');
                        }}
                      >
                        Match Candidates
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidates Quick Preview */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>Top Verified Candidates</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('candidates')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-secondary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View All Candidates</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {candidates.slice(0, 2).map(cand => (
                  <div
                    key={cand.id}
                    style={{
                      background: 'rgba(17, 24, 39, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', color: '#fff' }}>{cand.name}</h4>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cand.role}</span>
                        </div>
                        {cand.isLiveCandidate && (
                          <span style={{
                            fontSize: '0.7rem',
                            background: 'rgba(6, 182, 212, 0.15)',
                            color: '#06b6d4',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(6, 182, 212, 0.3)'
                          }}>
                            Live Candidate
                          </span>
                        )}
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Verified Skills
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {cand.provenSkills.map((sk, idx) => (
                            <span 
                              key={idx}
                              style={{
                                fontSize: '0.78rem',
                                color: '#34d399',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>{sk}</span>
                              <span>&check;</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-primary-action"
                      style={{ width: '100%', padding: '8px', fontSize: '0.85rem', marginTop: '0.5rem' }}
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: JOBS MANAGEMENT
           ======================================================== */}
        {activeTab === 'jobs' && (
          <div className="recruiter-jobs-view">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.3rem' }}>Job Openings</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Define requirements and let SkillProof identify candidates with verified capability.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setShowCreateJobModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem' }}
              >
                <Plus size={16} />
                <span>Create Job</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {jobs.map(job => (
                <div 
                  key={job.id}
                  style={{
                    background: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>{job.title}</h3>
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          {job.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {job.company} &bull; {job.department} &bull; {job.location} &bull; Posted {job.postedDate}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-primary-action"
                      style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                      onClick={() => {
                        setSelectedJobForMatch(job.id);
                        setActiveTab('job-matching');
                      }}
                    >
                      Match Candidates ({candidates.length})
                    </button>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {job.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
                        Required Skills (Strict Verification)
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {job.requiredSkills.map((sk, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '0.8rem',
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: '#818cf8',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {job.optionalSkills && job.optionalSkills.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
                          Optional Skills (Bonus)
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {job.optionalSkills.map((sk, idx) => (
                            <span 
                              key={idx}
                              style={{
                                fontSize: '0.8rem',
                                background: 'rgba(6, 182, 212, 0.1)',
                                color: '#06b6d4',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(6, 182, 212, 0.25)'
                              }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: CANDIDATES VIEW
           ======================================================== */}
        {activeTab === 'candidates' && (
          <div className="recruiter-candidates-view">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.3rem' }}>Candidates</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Browse candidates with objective capability proof. Review GitHub code evidence and micro-task verification.
                </p>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search candidate or skill..."
                  value={candidateSearch}
                  onChange={e => setCandidateSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            {/* Candidates Table / Card Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredCandidates.map(cand => (
                <div 
                  key={cand.id}
                  style={{
                    background: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{cand.name}</h3>
                      {cand.isLiveCandidate && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: '#06b6d4',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          Current Session
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {cand.role} &bull; @{cand.githubUsername}
                    </div>
                  </div>

                  {/* Skills badges matching user example:
                      Candidate A: Python ✓ Proven, FastAPI ✓ Proven, PostgreSQL ◐ Partially Proven, Docker ✓ Proven
                      Candidate B: Python ✓ Proven, React ✓ Proven, Docker ○ Claimed-Only */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
                      {cand.skillsDetail && cand.skillsDetail.map((sk, idx) => (
                        <span 
                          key={idx}
                          style={{
                            fontSize: '0.8rem',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: sk.status === 'proven' 
                              ? 'rgba(16, 185, 129, 0.12)' 
                              : sk.status === 'partially_proven' 
                                ? 'rgba(245, 158, 11, 0.12)' 
                                : (sk.status === 'failed' || sk.status === 'not_passed' || sk.status === 'invalidated')
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : 'rgba(100, 116, 139, 0.15)',
                            color: sk.status === 'proven' 
                              ? '#34d399' 
                              : sk.status === 'partially_proven' 
                                ? '#fbbf24' 
                                : (sk.status === 'failed' || sk.status === 'not_passed' || sk.status === 'invalidated')
                                  ? '#f87171'
                                  : '#94a3b8',
                            border: `1px solid ${
                              sk.status === 'proven' 
                                ? 'rgba(16, 185, 129, 0.3)' 
                                : sk.status === 'partially_proven' 
                                  ? 'rgba(245, 158, 11, 0.3)' 
                                  : (sk.status === 'failed' || sk.status === 'not_passed' || sk.status === 'invalidated')
                                    ? 'rgba(239, 68, 68, 0.35)'
                                    : 'rgba(100, 116, 139, 0.3)'
                            }`
                          }}
                        >
                          <strong>{sk.name}</strong>
                          <span>
                            {sk.status === 'proven' 
                              ? '✓ Proven' 
                              : sk.status === 'partially_proven' 
                                ? '◐ Partially Proven' 
                                : (sk.status === 'failed' || sk.status === 'not_passed')
                                  ? '✕ Not Passed'
                                  : sk.status === 'invalidated'
                                    ? '⚠ Invalidated'
                                    : '○ Claimed-Only'}
                          </span>
                        </span>
                      ))}
                    </div>

                  <button
                    type="button"
                    className="btn-primary-action"
                    style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: SKILL VERIFICATION RECRUITER VIEW
           ======================================================== */}
        {activeTab === 'verification' && (
          <div className="recruiter-verification-view">
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.3rem' }}>Skill Verification Hub</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Deterministic cross-verification matrix comparing claimed candidate skills against verified repository code and assessment scores.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'React'].map((skill, sIdx) => {
                const provenCands = candidates.filter(c => c.provenSkills.includes(skill));
                const partialCands = candidates.filter(c => c.partiallyProvenSkills.includes(skill));
                
                return (
                  <div 
                    key={sIdx}
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      padding: '1.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{skill}</h3>
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {provenCands.length} Proven
                      </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Verified Proven Candidates:
                      </div>
                      {provenCands.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {provenCands.map(c => (
                            <div 
                              key={c.id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                background: 'rgba(15, 23, 42, 0.6)',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <span>{c.name}</span>
                              <span style={{ color: '#34d399', fontSize: '0.75rem' }}>✓ Verified</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>No candidates evaluated for this skill yet.</span>
                      )}
                    </div>

                    {partialCands.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          Partially Proven Candidates:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {partialCands.map(c => (
                            <div 
                              key={c.id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                background: 'rgba(15, 23, 42, 0.6)',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <span>{c.name}</span>
                              <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>◐ Partial</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: JOB MATCHING RECRUITER VIEW
           ======================================================== */}
        {activeTab === 'job-matching' && (
          <div className="recruiter-matching-view">
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.3rem' }}>Job & Candidate Matching</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Algorithmic fit scoring based solely on verified technical evidence and required job specifications.
              </p>
            </div>

            {/* Select Target Job */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Select Job to Match Against:
                </label>
                <select
                  value={selectedJobForMatch}
                  onChange={e => setSelectedJobForMatch(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    minWidth: '260px'
                  }}
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} &bull; {j.company}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const targetJob = jobs.find(j => j.id === selectedJobForMatch) || jobs[0];
                return (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>Requirements:</span>
                    {targetJob.requiredSkills.map((sk, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.78rem',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        marginRight: '6px'
                      }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Ranked Candidates for Selected Job */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(() => {
                const targetJob = jobs.find(j => j.id === selectedJobForMatch) || jobs[0];
                
                return candidates.map(cand => {
                  const matchScore = cand.matchScores?.[targetJob.id] || 80;
                  const matchingSkills = targetJob.requiredSkills.filter(s => cand.provenSkills.includes(s));
                  const missingSkills = targetJob.requiredSkills.filter(s => !cand.provenSkills.includes(s));

                  return (
                    <div
                      key={cand.id}
                      style={{
                        background: 'rgba(17, 24, 39, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1.5rem'
                      }}
                    >
                      <div style={{ minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{cand.name}</h3>
                          {cand.isLiveCandidate && (
                            <span style={{ fontSize: '0.7rem', color: '#06b6d4', background: 'rgba(6, 182, 212, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                              Live
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cand.role}</div>
                      </div>

                      {/* Match Score Gauge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          border: `3px solid ${matchScore >= 80 ? '#10b981' : matchScore >= 60 ? '#f59e0b' : '#ef4444'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: '#fff'
                        }}>
                          {matchScore}%
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: matchScore >= 80 ? '#34d399' : '#fbbf24' }}>
                            {matchScore >= 80 ? 'Strong Fit' : 'Moderate Fit'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            {matchingSkills.length} of {targetJob.requiredSkills.length} required proven
                          </div>
                        </div>
                      </div>

                      {/* Matching vs Missing Breakdown */}
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          {matchingSkills.map((sk, idx) => (
                            <span key={idx} style={{
                              fontSize: '0.75rem',
                              color: '#34d399',
                              background: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              ✓ {sk}
                            </span>
                          ))}
                          {missingSkills.map((sk, idx) => (
                            <span key={idx} style={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              background: 'rgba(100, 116, 139, 0.15)',
                              border: '1px solid rgba(100, 116, 139, 0.3)',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              ○ {sk} (Gap)
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                          onClick={() => setSelectedCandidate(cand)}
                        >
                          View Evidence
                        </button>
                        <button
                          type="button"
                          className="btn-primary-action"
                          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                          onClick={() => setInterviewModalCandidate(cand)}
                        >
                          Interview
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: RECRUITER PROFILE
           ======================================================== */}
        {activeTab === 'profile' && (
          <div className="recruiter-profile-view" style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{
              background: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4'
                }}>
                  <Briefcase size={32} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2px' }}>
                    {currentUser?.name || 'Sarah Jenkins'}
                  </h2>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Lead Technical Recruiter &bull; TechCorp Talent Acquisition
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Email</label>
                  <div style={{ color: '#fff', fontSize: '0.95rem' }}>{currentUser?.email || 'recruiter@techcorp.io'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Company</label>
                  <div style={{ color: '#fff', fontSize: '0.95rem' }}>TechCorp International Inc.</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Active Postings</label>
                  <div style={{ color: '#fff', fontSize: '0.95rem' }}>{jobs.length} open technical roles</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Verification Standard</label>
                  <div style={{ color: '#34d399', fontSize: '0.95rem' }}>
                    Strict Proof-of-Work (Observable GitHub Artifacts & Micro-Task Assessments)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          CANDIDATE PROFILE MODAL (RECRUITER VIEW ONLY)
          Strictly NO candidate actions:
          No Take Skill Assessment, No Add Evidence, No Upload Certificate, etc.
         ======================================================== */}
      {selectedCandidate && (
        <div 
          className="microtask-modal-backdrop" 
          onClick={() => setSelectedCandidate(null)}
          role="dialog" 
          aria-modal="true"
        >
          <div 
            className="microtask-modal-box" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '840px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Modal Header */}
            <div className="microtask-modal-header">
              <div className="microtask-title-group">
                <span className="microtask-badge" style={{ color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                  <User size={14} />
                  RECRUITER CANDIDATE EVALUATION
                </span>
                <h3>{selectedCandidate.name}</h3>
                <span className="microtask-header-meta">
                  {selectedCandidate.role} &bull; GitHub: @{selectedCandidate.githubUsername}
                </span>
              </div>
              <button 
                type="button" 
                className="microtask-close-btn"
                onClick={() => setSelectedCandidate(null)}
                aria-label="Close candidate profile"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="microtask-modal-body" style={{ padding: '1.5rem' }}>

              {/* Summary Stats Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', textTransform: 'uppercase' }}>Verified Proven</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399' }}>{selectedCandidate.provenSkills.length}</div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#fbbf24', textTransform: 'uppercase' }}>Partially Proven</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fbbf24' }}>{selectedCandidate.partiallyProvenSkills.length}</div>
                </div>

                <div style={{ background: 'rgba(100, 116, 139, 0.12)', border: '1px solid rgba(100, 116, 139, 0.25)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Claimed-Only</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#94a3b8' }}>{selectedCandidate.claimedOnlySkills.length}</div>
                </div>
              </div>

              {/* Explicit Claimed-Only Clarification Banner */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '1.5rem',
                fontSize: '0.84rem',
                color: '#fde68a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <HelpCircle size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Note on Claimed-Only Skills:</strong> "Claimed-Only" means there is insufficient available evidence to verify the skill. It does NOT mean the candidate lacks capability.
                </span>
              </div>

              {/* Skills and Observable Evidence Details */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="var(--accent-secondary)" />
                  <span>Candidate Skills & Evidence Breakdown</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedCandidate.skillsDetail && selectedCandidate.skillsDetail.map((sk, idx) => (
                    <div 
                      key={idx}
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>{sk.name}</span>
                        <span style={{
                          fontSize: '0.78rem',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: sk.status === 'proven' 
                            ? 'rgba(16, 185, 129, 0.15)' 
                            : sk.status === 'partially_proven' 
                              ? 'rgba(245, 158, 11, 0.15)' 
                              : (sk.status === 'failed' || sk.status === 'not_passed' || sk.status === 'invalidated')
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(100, 116, 139, 0.2)',
                          color: sk.status === 'proven' 
                            ? '#34d399' 
                            : sk.status === 'partially_proven' 
                              ? '#fbbf24' 
                              : (sk.status === 'failed' || sk.status === 'not_passed' || sk.status === 'invalidated')
                                ? '#f87171'
                                : '#94a3b8',
                          fontWeight: 600
                        }}>
                          {sk.status === 'proven' 
                            ? '✓ Proven' 
                            : sk.status === 'partially_proven' 
                              ? '◐ Partially Proven' 
                              : (sk.status === 'failed' || sk.status === 'not_passed')
                                ? '✕ Not Passed'
                                : sk.status === 'invalidated'
                                  ? '⚠ Invalidated'
                                  : '○ Claimed-Only'}
                        </span>
                      </div>

                      {sk.evidence && sk.evidence.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {sk.evidence.map((ev, eIdx) => (
                            <li key={eIdx} style={{ marginBottom: '3px' }}>{ev}</li>
                          ))}
                        </ul>
                      ) : (
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                          Claimed on resume; no direct observable repository artifacts or micro-tasks found.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub Evidence Section */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Github size={18} color="#818cf8" />
                  <span>GitHub Repository Evidence</span>
                </h4>
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Verified Handle</div>
                      <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>@{selectedCandidate.githubEvidence.verifiedHandle}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Observable Repositories</div>
                      <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>{selectedCandidate.githubEvidence.totalRepos} active repos</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Language Distribution</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {selectedCandidate.githubEvidence.primaryLanguages.join(' • ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Evidence Section */}
              {selectedCandidate.certificateEvidence && selectedCandidate.certificateEvidence.length > 0 && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="#fbbf24" />
                    <span>Certificate & Credential Evidence</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedCandidate.certificateEvidence.map((cert, cIdx) => (
                      <div key={cIdx} style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>{cert.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cert.issuer}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Assessment Results */}
              {selectedCandidate.assessmentResults && selectedCandidate.assessmentResults.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#34d399" />
                    <span>Practical Assessment Results</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedCandidate.assessmentResults.map((asmt, aIdx) => (
                      <div key={aIdx} style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>{asmt.skill} Practical Micro-Task</span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            5 Skill Tasks Evaluated &bull; {asmt.score}% Score
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: asmt.status === 'PASSED' || asmt.status === 'VERIFIED' ? '#34d399' : '#f87171', 
                            background: asmt.status === 'PASSED' || asmt.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            fontWeight: 600 
                          }}>
                            {asmt.status}
                          </span>
                          {asmt.focusViolations !== undefined && (
                            <div style={{ fontSize: '0.72rem', color: asmt.focusViolations === 0 ? '#34d399' : '#f59e0b', marginTop: '3px' }}>
                              Focus Violations: {asmt.focusViolations}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recruiter Evaluation Actions (Candidate-actions strictly excluded!) */}
            <div className="microtask-actions-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-primary-action"
                onClick={() => {
                  const cand = selectedCandidate;
                  setSelectedCandidate(null);
                  setInterviewModalCandidate(cand);
                }}
              >
                Schedule Technical Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CREATE JOB MODAL (CONTROLLED SCROLLING PANEL)
         ======================================================== */}
      {showCreateJobModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflow: 'hidden'
          }}
          onClick={() => {
            setShowCreateJobModal(false);
            setJobFormError('');
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(6, 182, 212, 0.15)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(17, 24, 39, 0.95)',
              flexShrink: 0
            }}>
              <div>
                <span style={{
                  color: '#06b6d4',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '2px'
                }}>
                  <Briefcase size={13} />
                  TALENT ACQUISITION
                </span>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                  Create New Technical Job
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowCreateJobModal(false);
                  setJobFormError('');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-muted)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body Container */}
            <div style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1,
              maxHeight: 'calc(90vh - 140px)'
            }}>
              {/* Validation alert message */}
              {jobFormError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span>{jobFormError}</span>
                </div>
              )}

              <form id="create-job-form" onSubmit={handleCreateJob}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Backend Developer"
                    value={newJobTitle}
                    onChange={e => {
                      setNewJobTitle(e.target.value);
                      if (jobFormError) setJobFormError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="TechCorp"
                    value={newJobCompany}
                    onChange={e => setNewJobCompany(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    Job Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe key responsibilities and expectations..."
                    value={newJobDescription}
                    onChange={e => setNewJobDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    Required Skills (comma-separated) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Python, FastAPI, PostgreSQL, Docker"
                    value={newJobRequiredSkills}
                    onChange={e => {
                      setNewJobRequiredSkills(e.target.value);
                      if (jobFormError) setJobFormError('');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    Optional Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Git, AWS, Redis"
                    value={newJobOptionalSkills}
                    onChange={e => setNewJobOptionalSkills(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </form>
            </div>

            {/* Fixed Modal Actions Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'rgba(17, 24, 39, 0.95)',
              flexShrink: 0
            }}>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowCreateJobModal(false);
                  setJobFormError('');
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="create-job-form"
                className="btn-primary-action"
                style={{ padding: '8px 22px' }}
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCHEDULE INTERVIEW MODAL
         ======================================================== */}
      {interviewModalCandidate && (
        <div 
          className="microtask-modal-backdrop" 
          onClick={() => setInterviewModalCandidate(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="microtask-modal-box" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            <div className="microtask-modal-header">
              <div className="microtask-title-group">
                <span className="microtask-badge" style={{ color: '#06b6d4' }}>
                  <Calendar size={14} />
                  INTERVIEW INVITATION
                </span>
                <h3>Schedule Interview</h3>
                <span className="microtask-header-meta">Invite {interviewModalCandidate.name} for technical discussion</span>
              </div>
              <button 
                type="button" 
                className="microtask-close-btn"
                onClick={() => setInterviewModalCandidate(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Candidate Email
                </label>
                <input
                  type="email"
                  readOnly
                  value={interviewModalCandidate.email}
                  style={{ width: '100%', padding: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Proposed Date & Time
                </label>
                <input
                  type="datetime-local"
                  defaultValue="2026-10-06T14:00"
                  style={{ width: '100%', padding: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setInterviewModalCandidate(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary-action"
                  onClick={() => {
                    const name = interviewModalCandidate.name;
                    setInterviewModalCandidate(null);
                    setInterviewScheduledToast(`Technical interview invitation sent to ${name}!`);
                    setTimeout(() => setInterviewScheduledToast(''), 4000);
                  }}
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
