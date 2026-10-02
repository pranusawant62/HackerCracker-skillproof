import { SKILL_TAXONOMY, buildAliasPattern } from '../utils/skillTaxonomy.js';

/**
 * Section header detection patterns
 */
const PREFERRED_SECTION_REGEX = /(?:preferred|nice\s+to\s+have|good\s+to\s+have|bonus|pluses|plus|optional|desired|what\s+would\s+be\s+nice)(?:\s+qualifications|\s+skills|\s+experience|\s+requirements)?\s*[:\n]/i;

const REQUIRED_SECTION_REGEX = /(?:required|requirements|must\s+have|minimum|what\s+you(?:'ll|\s+will)\s+need|qualifications|core\s+skills|responsibilities|technical\s+stack|essential)(?:\s+qualifications|\s+skills|\s+experience|\s+requirements)?\s*[:\n]/i;

/**
 * Inline context cues for requirement strength
 */
const PREFERRED_INLINE_REGEX = /\b(?:nice\s+to\s+have|good\s+to\s+have|bonus|preferred|plus|optional|desired|ideally|advantageous|a\s+plus)\b/i;

const REQUIRED_INLINE_REGEX = /\b(?:must\s+have|must\s+be|required|essential|mandatory|strong\s+knowledge|experience\s+with|proficient|proven\s+experience|solid\s+understanding|minimum)\b/i;

/**
 * Breaks text into sentences and labels each with its active section context.
 * 
 * @param {string} text 
 * @returns {Array<{ text: string, section: 'required' | 'preferred' | 'general' }>}
 */
function parseTextSegments(text) {
  const rawLines = text.split(/\r?\n/);
  const segments = [];
  let currentSection = 'general';

  for (const rawLine of rawLines) {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) continue;

    // Split line into sentences or clauses (e.g. period, semicolon, bullet points)
    const sentences = trimmedLine.split(/(?<=[.;•·!])\s+/);
    for (const s of sentences) {
      const sentence = s.trim();
      if (!sentence) continue;

      // Check if this sentence or clause introduces a new section
      if (PREFERRED_SECTION_REGEX.test(sentence)) {
        currentSection = 'preferred';
      } else if (REQUIRED_SECTION_REGEX.test(sentence)) {
        currentSection = 'required';
      }

      segments.push({
        text: sentence,
        section: currentSection
      });
    }
  }

  return segments;
}

/**
 * Evaluates the requirement strength ('required' vs 'preferred') of a skill occurrence
 * based on its surrounding sentence and the active section header.
 * 
 * @param {string} sentence - The sentence containing the match
 * @param {string} section - Active section header ('required', 'preferred', or 'general')
 * @returns {'required' | 'preferred'}
 */
function evaluateImportance(sentence, section) {
  // 1. Explicit inline "must have" or "required" takes priority
  if (REQUIRED_INLINE_REGEX.test(sentence) && !PREFERRED_INLINE_REGEX.test(sentence)) {
    return 'required';
  }

  // 2. Explicit inline "nice to have", "bonus", "plus", or "preferred"
  if (PREFERRED_INLINE_REGEX.test(sentence)) {
    return 'preferred';
  }

  // 3. Fallback to active section header
  if (section === 'preferred') {
    return 'preferred';
  }

  // 4. Default for technical skills in job descriptions is required
  return 'required';
}

/**
 * Deterministically parses a Job Description and extracts its required technical skills,
 * normalizing aliases and detecting requirement strength (required vs preferred).
 * 
 * @param {string} text - Raw Job Description text
 * @returns {{
 *   rawText: string,
 *   extractedSkills: Array<{ skill: string, category: string, matchedTerm: string, importance: 'required' | 'preferred' }>,
 *   requirements: {
 *     required: Array<{ skill: string, category: string, matchedTerm: string, importance: 'required' }>,
 *     preferred: Array<{ skill: string, category: string, matchedTerm: string, importance: 'preferred' }>
 *   }
 * }}
 */
export function parseJobDescription(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return {
      rawText: text || '',
      extractedSkills: [],
      requirements: {
        required: [],
        preferred: []
      }
    };
  }

  const rawText = text;
  const segments = parseTextSegments(text);

  // Map canonical skill name to aggregated extraction info
  const skillOccurrences = new Map();

  for (const entry of SKILL_TAXONOMY) {
    // Sort aliases by length descending to match more specific aliases first (e.g. 'React.js' before 'React')
    const sortedAliases = [...entry.aliases].sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      // Use case-sensitivity for short words/symbols like C, Go, Java, REST to prevent false triggers
      const isCaseSensitive = (entry.caseSensitive && (alias.length <= 2 || alias === 'Java' || alias === 'Go')) || alias === 'REST';
      const pattern = buildAliasPattern(alias, isCaseSensitive);

      // Scan each segment for this alias
      for (const { text: sentence, section } of segments) {
        const match = sentence.match(pattern);
        if (match) {
          const matchedTerm = match[2];
          const importance = evaluateImportance(sentence, section);

          if (!skillOccurrences.has(entry.name)) {
            skillOccurrences.set(entry.name, {
              skill: entry.name,
              category: entry.category,
              matchedTerm,
              importances: [importance]
            });
          } else {
            const existing = skillOccurrences.get(entry.name);
            existing.importances.push(importance);
          }
        }
      }
    }
  }

  // Finalize deduplicated skills and determine overall importance
  const extractedSkills = [];

  for (const [skillName, data] of skillOccurrences.entries()) {
    // If any occurrence is 'required', the overall skill requirement is 'required'
    const finalImportance = data.importances.includes('required') ? 'required' : 'preferred';

    extractedSkills.push({
      skill: skillName,
      category: data.category,
      matchedTerm: data.matchedTerm,
      importance: finalImportance
    });
  }

  // Sort deterministically: required first, then alphabetically
  extractedSkills.sort((a, b) => {
    if (a.importance !== b.importance) {
      return a.importance === 'required' ? -1 : 1;
    }
    return a.skill.localeCompare(b.skill);
  });

  const required = extractedSkills.filter(s => s.importance === 'required');
  const preferred = extractedSkills.filter(s => s.importance === 'preferred');

  return {
    rawText,
    extractedSkills,
    requirements: {
      required,
      preferred
    }
  };
}
