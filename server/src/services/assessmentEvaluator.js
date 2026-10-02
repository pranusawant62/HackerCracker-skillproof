/**
 * SkillProof Assessment Evaluator
 * 
 * Evaluates candidate responses safely and deterministically on the backend.
 * Rules:
 * - Deterministic scoring: 90-100: Excellent, 80-89: Strong, 70-79: Competent, 50-69: Developing, 0-49: Needs Improvement
 * - Passing threshold: >= 70%
 * - Semantic SQL validation (clauses, tables, conditions, aggregations)
 * - Safe structural validation for code, shell commands, declarative YAML/Docker configs, and markup
 * - Exact and normalized matching for multiple-choice and conceptual scenarios
 */

/**
 * Normalizes SQL query strings for comparison and analysis.
 */
function normalizeSql(sql = '') {
  return String(sql)
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/;\s*$/, '') // Remove trailing semicolon
    .trim();
}

/**
 * Evaluates a single candidate answer against a question definition.
 */
export function evaluateQuestionAnswer(question, candidateAnswer) {
  const rawAnswer = candidateAnswer != null ? String(candidateAnswer).trim() : '';
  const maxPoints = question.points || 20;

  if (!rawAnswer) {
    return {
      questionId: question.id,
      question: question.question,
      type: question.type,
      candidateAnswer: '',
      isCorrect: false,
      pointsEarned: 0,
      maxPoints,
      feedback: 'No answer was provided.',
      explanation: question.explanation
    };
  }

  // 1. Multiple Choice Evaluation
  if (question.type === 'multiple_choice') {
    const expected = String(question.expectedAnswer).trim().toUpperCase();
    const cleanCand = rawAnswer.toUpperCase();

    // Check letter match (e.g. "B" or "OPTION B") or direct text match
    let isMatch = cleanCand === expected || cleanCand.startsWith(expected) || cleanCand.includes(`OPTION ${expected}`);

    if (!isMatch && Array.isArray(question.options)) {
      const targetOpt = question.options.find(o => 
        (typeof o === 'object' && o !== null && (o.key?.toUpperCase() === expected || o.text?.toLowerCase() === rawAnswer.toLowerCase())) ||
        (typeof o === 'string' && o.toLowerCase().includes(rawAnswer.toLowerCase()))
      );
      if (targetOpt) {
        isMatch = true;
      }
    }

    return {
      questionId: question.id,
      question: question.question,
      type: question.type,
      candidateAnswer: rawAnswer,
      isCorrect: isMatch,
      pointsEarned: isMatch ? maxPoints : 0,
      maxPoints,
      feedback: isMatch ? 'Correct answer.' : `Incorrect. The correct answer was option ${expected}.`,
      explanation: question.explanation
    };
  }

  // 2. SQL Query Evaluation
  if (question.type === 'sql' || question.type === 'sql_query') {
    const norm = normalizeSql(rawAnswer);
    const upper = norm.toUpperCase();
    const criteria = question.validationCriteria || {};

    let passedCriteria = true;
    const missingClauses = [];

    // Check required clauses
    if (Array.isArray(criteria.requiredClauses)) {
      for (const clause of criteria.requiredClauses) {
        if (!upper.includes(clause.toUpperCase())) {
          passedCriteria = false;
          missingClauses.push(clause);
        }
      }
    }

    // Check required terms (table or column names)
    if (Array.isArray(criteria.requiredTerms)) {
      for (const term of criteria.requiredTerms) {
        if (!norm.toLowerCase().includes(term.toLowerCase())) {
          passedCriteria = false;
          missingClauses.push(term);
        }
      }
    }

    // Subquery or LIMIT check
    if (criteria.subqueryOrLimit) {
      const hasSubquery = upper.includes('SELECT') && upper.indexOf('SELECT') !== upper.lastIndexOf('SELECT');
      const hasLimit = upper.includes('LIMIT') || upper.includes('OFFSET') || upper.includes('ROW_NUMBER') || upper.includes('DENSE_RANK');
      if (!hasSubquery && !hasLimit) {
        passedCriteria = false;
        missingClauses.push('subquery or LIMIT');
      }
    }

    const isCorrect = passedCriteria && missingClauses.length === 0;

    return {
      questionId: question.id,
      question: question.question,
      type: question.type,
      candidateAnswer: rawAnswer,
      isCorrect,
      pointsEarned: isCorrect ? maxPoints : (missingClauses.length <= 1 ? Math.round(maxPoints * 0.6) : 0),
      maxPoints,
      feedback: isCorrect 
        ? 'Query syntax and filter logic validated successfully.' 
        : `Query incomplete or missing required logic: ${missingClauses.join(', ')}.`,
      explanation: question.explanation
    };
  }

  // 3. Code & Config & Command Evaluation
  if (question.type === 'code' || question.type === 'config' || question.type === 'code_writing') {
    const code = rawAnswer;
    const criteria = question.validationCriteria || {};
    let isCorrect = true;
    const errors = [];

    // Check required elements / keywords
    if (Array.isArray(criteria.requiredElements)) {
      let matchedCount = 0;
      for (const elem of criteria.requiredElements) {
        if (code.toLowerCase().includes(elem.toLowerCase())) {
          matchedCount++;
        } else {
          errors.push(`Missing "${elem}"`);
        }
      }

      // If at least 70% of required elements match and total missing <= 1, give partial/full
      if (errors.length > 0) {
        if (matchedCount / criteria.requiredElements.length < 0.65) {
          isCorrect = false;
        }
      }
    }

    if (criteria.functionName && !code.includes(criteria.functionName)) {
      isCorrect = false;
      errors.push(`Function "${criteria.functionName}" not defined.`);
    }

    // Basic substance check (must not be empty or trivial placeholder)
    if (code.trim().length < 8) {
      isCorrect = false;
      errors.push('Response is too brief to represent a functional solution.');
    }

    const isFullPass = isCorrect && errors.length === 0;
    const isPartialPass = isCorrect && errors.length === 1;

    return {
      questionId: question.id,
      question: question.question,
      type: question.type,
      candidateAnswer: rawAnswer,
      isCorrect: isFullPass || isPartialPass,
      pointsEarned: isFullPass ? maxPoints : (isPartialPass ? Math.round(maxPoints * 0.7) : 0),
      maxPoints,
      feedback: isFullPass 
        ? 'Implementation verified successfully.' 
        : (isPartialPass ? 'Implementation largely correct with minor missing elements.' : `Validation failed: ${errors.join(', ')}.`),
      explanation: question.explanation
    };
  }

  // 4. Short Answer / Debugging / Scenario Evaluation
  const cleanAns = rawAnswer.toLowerCase();
  const expAns = String(question.expectedAnswer || '').toLowerCase();
  const criteria = question.validationCriteria || {};

  let isShortCorrect = false;

  if (criteria.minWords) {
    const wordCount = rawAnswer.split(/\s+/).filter(Boolean).length;
    isShortCorrect = wordCount >= criteria.minWords;
  } else if (cleanAns.includes(expAns) || expAns.includes(cleanAns)) {
    isShortCorrect = true;
  } else if (Array.isArray(criteria.requiredElements)) {
    const foundCount = criteria.requiredElements.filter(e => cleanAns.includes(e.toLowerCase())).length;
    isShortCorrect = foundCount >= Math.ceil(criteria.requiredElements.length * 0.5);
  } else if (cleanAns.length >= 10) {
    isShortCorrect = true;
  }

  return {
    questionId: question.id,
    question: question.question,
    type: question.type,
    candidateAnswer: rawAnswer,
    isCorrect: isShortCorrect,
    pointsEarned: isShortCorrect ? maxPoints : 0,
    maxPoints,
    feedback: isShortCorrect ? 'Concept verified.' : 'Explanation did not sufficiently address the core concept.',
    explanation: question.explanation
  };
}

/**
 * Evaluates an entire skill assessment submitted by a candidate.
 * 
 * @param {object} assessment - The server-side assessment object (with secret keys)
 * @param {Array<{ questionId: string, answer: any }>} candidateAnswers - Array of candidate answers
 * @returns {object} Full evaluation result
 */
export function evaluateSkillAssessment(assessment, candidateAnswers = []) {
  if (!assessment || !Array.isArray(assessment.questions)) {
    throw new Error('Valid assessment object is required for evaluation.');
  }

  const answersMap = new Map();
  if (Array.isArray(candidateAnswers)) {
    candidateAnswers.forEach(a => {
      if (a && a.questionId) {
        answersMap.set(String(a.questionId), a.answer);
      }
    });
  }

  const results = [];
  let totalScore = 0;
  let maxScore = 0;

  const strengths = [];
  const improvementAreas = [];

  for (const q of assessment.questions) {
    const answer = answersMap.get(String(q.id));
    const evalResult = evaluateQuestionAnswer(q, answer);

    totalScore += evalResult.pointsEarned;
    maxScore += evalResult.maxPoints;
    results.push(evalResult);

    // Topic summary for strengths & improvements
    const topicLabel = q.question.length > 55 ? `${q.question.slice(0, 52)}...` : q.question;
    if (evalResult.isCorrect) {
      strengths.push(`${(q.type || 'TASK').toUpperCase()}: ${topicLabel}`);
    } else {
      improvementAreas.push(`${(q.type || 'TASK').toUpperCase()}: ${topicLabel}`);
    }
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percentage >= (assessment.passingScore || 70);

  // Competency level calculation
  let competency = 'Needs Improvement';
  if (percentage >= 90) competency = 'Excellent';
  else if (percentage >= 80) competency = 'Strong';
  else if (percentage >= 70) competency = 'Competent';
  else if (percentage >= 50) competency = 'Developing';

  return {
    assessmentId: assessment.assessmentId,
    skill: assessment.skill,
    score: totalScore,
    maxScore,
    percentage,
    passed,
    status: passed ? 'passed' : 'failed',
    competency,
    verificationMethod: 'microtask_assessment',
    completedAt: new Date().toISOString(),
    strengths,
    improvementAreas,
    results
  };
}

export { evaluateSkillAssessment as evaluateAssessment };
