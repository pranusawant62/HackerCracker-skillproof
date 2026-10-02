import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  RotateCcw, 
  X, 
  AlertCircle,
  Lightbulb,
  Check,
  TrendingUp,
  Award
} from 'lucide-react';
import { startAssessmentApi, submitAssessmentApi } from '../services/api.js';

export default function MicroTaskAssessment({
  isOpen,
  onClose,
  skillName,
  sessionId,
  existingAssessmentResult = null,
  onAssessmentCompleted
}) {
  // Assessment phases: 'intro' | 'loading' | 'taking' | 'submitting' | 'results' | 'error'
  const [phase, setPhase] = useState('intro');
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // When modal opens or existingAssessmentResult is provided
  useEffect(() => {
    if (!isOpen) return;

    if (existingAssessmentResult) {
      setSubmissionResult(existingAssessmentResult);
      setPhase('results');
    } else {
      setPhase('intro');
      setAssessment(null);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setSubmissionResult(null);
      setErrorMessage('');
      setTimeLeft(600);
    }
  }, [isOpen, existingAssessmentResult, skillName]);

  // Timer countdown while taking assessment
  useEffect(() => {
    let timer = null;
    if (phase === 'taking' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase, timeLeft]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStart = async () => {
    setPhase('loading');
    setErrorMessage('');
    try {
      const data = await startAssessmentApi({
        sessionId,
        skill: skillName,
        difficulty: 'intermediate'
      });

      if (!data.assessment || !Array.isArray(data.assessment.questions)) {
        throw new Error('Received invalid assessment structure from server.');
      }

      // Strictly ensure 5 questions
      const questions = data.assessment.questions.slice(0, 5);
      const normalizedAssessment = {
        ...data.assessment,
        questions
      };

      setAssessment(normalizedAssessment);
      setTimeLeft(data.assessment.estimatedTimeMinutes ? data.assessment.estimatedTimeMinutes * 60 : 600);
      
      // Initialize starter answers
      const initialAnswers = {};
      questions.forEach(q => {
        initialAnswers[q.id] = q.starterCode || '';
      });
      setAnswers(initialAnswers);
      setCurrentQuestionIndex(0);
      setPhase('taking');
    } catch (err) {
      console.error('[MicroTask Assessment Start Error]', err);
      setErrorMessage(err.message || 'Failed to start micro-task assessment. Please try again.');
      setPhase('error');
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setPhase('submitting');
    setErrorMessage('');

    // Format answers array strictly matching assessment questions
    const formattedAnswers = assessment.questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] || ''
    }));

    try {
      const response = await submitAssessmentApi({
        assessmentId: assessment.assessmentId,
        sessionId,
        answers: formattedAnswers
      });

      const res = response.assessmentResult;
      setSubmissionResult(res);
      setPhase('results');

      if (onAssessmentCompleted) {
        onAssessmentCompleted({
          assessmentResult: res,
          session: response.session,
          skillName: res.skill || skillName
        });
      }
    } catch (err) {
      console.error('[MicroTask Assessment Submit Error]', err);
      setErrorMessage(err.message || 'Failed to submit assessment answers.');
      setPhase('error');
    }
  };

  const handleRetake = () => {
    setPhase('intro');
    setAssessment(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSubmissionResult(null);
    setErrorMessage('');
    setTimeLeft(600);
  };

  const currentQuestion = assessment?.questions?.[currentQuestionIndex];
  const totalQuestions = assessment?.questions?.length || 5;

  return (
    <div className="microtask-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="microtask-modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="microtask-modal-header">
          <div className="microtask-title-group">
            <span className="microtask-badge">
              <ShieldCheck size={14} color="var(--accent-secondary)" />
              PRACTICAL MICRO-TASK
            </span>
            <h3>{skillName} Skill Demonstration Assessment</h3>
            <span className="microtask-header-meta">
              Estimated Time: 10 minutes &bull; Total Questions: 5 &bull; Passing Score: 70%
            </span>
          </div>
          <button 
            type="button" 
            className="microtask-close-btn"
            onClick={onClose}
            aria-label="Close assessment"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="microtask-modal-body">
          {/* Phase 1: Intro Screen */}
          {phase === 'intro' && (
            <div className="microtask-intro-view">
              <div className="microtask-info-card">
                <div className="info-grid">
                  <div className="info-cell">
                    <span className="info-cell-label">Selected Skill</span>
                    <span className="info-cell-val highlight">{skillName}</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Assessment Type</span>
                    <span className="info-cell-val">Practical Micro-Task</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Difficulty</span>
                    <span className="info-cell-val">Progressive (Easy &rarr; Hard)</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Estimated Time</span>
                    <span className="info-cell-val">10 minutes</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Total Questions</span>
                    <span className="info-cell-val">Exactly 5 questions</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Passing Score</span>
                    <span className="info-cell-val success">&ge; 70% Required</span>
                  </div>
                </div>

                <div className="microtask-rules-box">
                  <div className="rules-header">
                    <Lightbulb size={16} color="var(--accent-secondary)" />
                    <strong>How Practical Micro-Task Verification Works</strong>
                  </div>
                  <p>
                    This assessment is <strong>100% specific to {skillName}</strong>. You will solve exactly 5 hands-on 
                    tasks designed to test real practical competency:
                  </p>
                  <ul>
                    <li><strong>Questions 1 &ndash; 5:</strong> Progress from foundational tasks to real-world problem solving.</li>
                    <li><strong>Authoritative Backend Grading:</strong> Your solutions are evaluated deterministically on the backend.</li>
                    <li><strong>Passing Threshold:</strong> Scoring <strong>70% or higher</strong> grants <strong>MICRO-TASK VERIFIED</strong> status for {skillName}.</li>
                    <li>Your work and timer are preserved as you navigate between questions.</li>
                  </ul>
                </div>
              </div>

              <div className="microtask-actions-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="btn-primary-action" onClick={handleStart}>
                  <span>Start Assessment</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Loading State */}
          {phase === 'loading' && (
            <div className="microtask-center-state">
              <div className="microtask-spinner" />
              <h4>Generating {skillName} Assessment...</h4>
              <p>Preparing 5 skill-specific practical tasks with authoritative validation rules.</p>
            </div>
          )}

          {/* Phase 3: Taking Assessment */}
          {phase === 'taking' && currentQuestion && (
            <div className="microtask-taking-view">
              {/* Taking Top Bar: Question Number of 5 & Timer */}
              <div className="taking-top-bar">
                <div className="taking-progress-info">
                  <span className="progress-step-pill">
                    Question {currentQuestionIndex + 1} of 5
                  </span>
                  <span className="progress-fraction-pill">
                    {currentQuestionIndex + 1}/5
                  </span>
                  <span className="question-type-pill">
                    {currentQuestion.type?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className={`taking-timer-pill ${timeLeft < 120 ? 'timer-warning' : ''}`}>
                  <Clock size={15} />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Progress Bar (1/5 to 5/5) */}
              <div className="taking-progress-track">
                <div 
                  className="taking-progress-fill"
                  style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }}
                />
              </div>

              {/* Question Display Card */}
              <div className="question-display-card">
                <div className="question-prompt-header">
                  <span className="question-number-badge">Task {currentQuestionIndex + 1}</span>
                  <h4 className="question-prompt-text">{currentQuestion.question}</h4>
                </div>

                {/* Multiple Choice Options if MCQ */}
                {currentQuestion.options && Array.isArray(currentQuestion.options) ? (
                  <div className="mcq-options-container">
                    {currentQuestion.options.map((option, optIdx) => {
                      const optionText = typeof option === 'object' && option !== null ? option.text : String(option);
                      const optionKey = typeof option === 'object' && option !== null ? option.key : String.fromCharCode(65 + optIdx);
                      const isSelected = answers[currentQuestion.id] === optionText || answers[currentQuestion.id] === optionKey;
                      
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          className={`mcq-option-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleAnswerChange(currentQuestion.id, optionText)}
                        >
                          <span className="mcq-opt-marker">
                            {optionKey}
                          </span>
                          <span className="mcq-opt-text">{optionText}</span>
                          {isSelected && <Check size={16} className="mcq-check-icon" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Code / Query / Configuration Editor */
                  <div className="code-editor-wrapper">
                    <div className="code-editor-header">
                      <span className="code-lang-label">
                        {currentQuestion.type === 'sql' || currentQuestion.type === 'sql_query' 
                          ? 'SQL Query Editor' 
                          : `${skillName} Solution Editor`}
                      </span>
                      <span className="code-editor-hint">Authoritative Backend Grader</span>
                    </div>
                    <textarea
                      className="code-editor-textarea"
                      value={answers[currentQuestion.id] || ''}
                      onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.starterCode || `-- Write your ${skillName} solution / query here...`}
                      spellCheck="false"
                      aria-label={`${skillName} solution input`}
                    />
                  </div>
                )}
              </div>

              {/* Question Navigation Footer */}
              <div className="taking-footer-nav">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="nav-dots">
                  {assessment.questions.slice(0, 5).map((q, idx) => (
                    <button
                      key={q.id || idx}
                      type="button"
                      className={`nav-dot ${idx === currentQuestionIndex ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      title={`Go to Question ${idx + 1} of 5`}
                    >
                      <span className="nav-dot-num">{idx + 1}</span>
                    </button>
                  ))}
                </div>

                {currentQuestionIndex < 4 ? (
                  <button
                    type="button"
                    className="btn-primary-action"
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(4, prev + 1))}
                  >
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary-action submit-action"
                    onClick={handleSubmit}
                  >
                    <Send size={15} />
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Phase 4: Submitting State */}
          {phase === 'submitting' && (
            <div className="microtask-center-state">
              <div className="microtask-spinner" />
              <h4>Evaluating Your Answers...</h4>
              <p>The backend evaluation engine is scoring your 5 {skillName} solutions against authoritative criteria.</p>
            </div>
          )}

          {/* Phase 5: Final Result Screen */}
          {phase === 'results' && submissionResult && (
            <div className="microtask-results-view">
              {/* Summary Card */}
              <div className="results-summary-box">
                <div className="results-summary-header">
                  <Award size={20} color="var(--accent-secondary)" />
                  <h4>Assessment Completed</h4>
                </div>

                <div className="results-metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">Skill</span>
                    <span className="metric-val highlight">{submissionResult.skill || skillName}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Questions</span>
                    <span className="metric-val">5</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Correct</span>
                    <span className="metric-val">
                      {Array.isArray(submissionResult.results) 
                        ? submissionResult.results.filter(r => r.isCorrect).length 
                        : (submissionResult.passed ? 4 : 2)}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Score</span>
                    <span className="metric-val highlight">
                      {submissionResult.percentage}%
                    </span>
                  </div>
                  <div className="metric-item status-metric">
                    <span className="metric-label">Status</span>
                    <span className={`status-badge-val ${submissionResult.passed ? 'passed' : 'failed'}`}>
                      {submissionResult.passed ? 'MICRO-TASK VERIFIED' : 'NOT VERIFIED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`results-hero-card ${submissionResult.passed ? 'passed' : 'failed'}`}>
                <div className="results-hero-left">
                  <div className="results-status-icon">
                    {submissionResult.passed ? (
                      <CheckCircle2 size={40} color="#34d399" />
                    ) : (
                      <XCircle size={40} color="#f87171" />
                    )}
                  </div>
                  <div>
                    <span className="results-status-label">
                      {submissionResult.passed ? 'CRITERIA MET (\u2265 70%)' : 'PASSING THRESHOLD NOT MET (< 70%)'}
                    </span>
                    <h3 className="results-score-heading">
                      {submissionResult.score} / {submissionResult.maxScore || 100} Points ({submissionResult.percentage}%)
                    </h3>
                    <p className="results-competency-line">
                      Competency Level: <strong>{submissionResult.competency || (submissionResult.passed ? 'Competent' : 'Developing')}</strong>
                      {submissionResult.passed && ` \u2022 ${submissionResult.skill || skillName} Verified via Practical Micro-Task`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Breakdown */}
              {Array.isArray(submissionResult.results) && submissionResult.results.length > 0 && (
                <div className="results-section-card">
                  <h4 className="section-title">Question Breakdown (5 Tasks)</h4>
                  <div className="results-breakdown-list">
                    {submissionResult.results.slice(0, 5).map((res, rIdx) => (
                      <div key={rIdx} className={`breakdown-item ${res.isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="item-icon-title">
                          {res.isCorrect ? (
                            <CheckCircle2 size={16} className="icon-correct" />
                          ) : (
                            <XCircle size={16} className="icon-incorrect" />
                          )}
                          <span className="item-title">
                            Task {rIdx + 1}: {res.question ? (res.question.length > 50 ? `${res.question.slice(0, 48)}...` : res.question) : `Task ${rIdx + 1}`}
                          </span>
                        </div>
                        <span className="item-status-text">
                          {res.isCorrect ? 'Verified' : 'Needs Review'} ({res.pointsEarned ?? res.earnedPoints ?? 0}/{res.maxPoints || 20} pts)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Improvement Areas */}
              <div className="results-split-grid">
                <div className="split-column strengths-col">
                  <div className="column-title">
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Demonstrated Strengths</span>
                  </div>
                  {Array.isArray(submissionResult.strengths) && submissionResult.strengths.length > 0 ? (
                    <ul className="results-bullet-list">
                      {submissionResult.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-subtext">No strong competencies recorded on this attempt.</p>
                  )}
                </div>

                <div className="split-column improvements-col">
                  <div className="column-title">
                    <TrendingUp size={16} color="#fbbf24" />
                    <span>Areas to Improve</span>
                  </div>
                  {Array.isArray(submissionResult.improvementAreas) && submissionResult.improvementAreas.length > 0 ? (
                    <ul className="results-bullet-list">
                      {submissionResult.improvementAreas.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-subtext">Excellent work! All tested areas achieved passing marks.</p>
                  )}
                </div>
              </div>

              {/* Footer Actions: Retake & Done */}
              <div className="results-footer-row">
                <button type="button" className="btn-secondary" onClick={handleRetake}>
                  <RotateCcw size={15} />
                  <span>Retake Assessment</span>
                </button>
                <button type="button" className="btn-primary-action" onClick={onClose}>
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase 6: Error State */}
          {phase === 'error' && (
            <div className="microtask-center-state">
              <AlertCircle size={44} color="#f87171" />
              <h4>Assessment Error</h4>
              <p className="error-text">{errorMessage || 'An unexpected error occurred during the assessment.'}</p>
              <div className="error-actions">
                <button type="button" className="btn-secondary" onClick={handleRetake}>
                  <RotateCcw size={15} />
                  <span>Try Again</span>
                </button>
                <button type="button" className="btn-primary-action" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
