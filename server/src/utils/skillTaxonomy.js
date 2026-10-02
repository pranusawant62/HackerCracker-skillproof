/**
 * Canonical Technical Skill Taxonomy & Matcher
 * 
 * Organized by category with aliases, keyword boundaries,
 * and case-sensitivity rules for deterministic skill extraction.
 */

export const SKILL_TAXONOMY = [
  // ==========================================
  // Programming Languages
  // ==========================================
  {
    name: 'JavaScript',
    category: 'Programming Languages',
    aliases: ['javascript', 'js', 'ecmascript', 'es6', 'es2020']
  },
  {
    name: 'TypeScript',
    category: 'Programming Languages',
    aliases: ['typescript', 'ts']
  },
  {
    name: 'Python',
    category: 'Programming Languages',
    aliases: ['python', 'python3', 'python2']
  },
  {
    name: 'Java',
    category: 'Programming Languages',
    aliases: ['Java', 'Core Java', 'J2EE'],
    caseSensitive: true
  },
  {
    name: 'C++',
    category: 'Programming Languages',
    aliases: ['c++', 'cpp']
  },
  {
    name: 'C',
    category: 'Programming Languages',
    aliases: ['C'],
    caseSensitive: true
  },
  {
    name: 'C#',
    category: 'Programming Languages',
    aliases: ['c#', 'csharp', 'c-sharp']
  },
  {
    name: 'Go',
    category: 'Programming Languages',
    aliases: ['golang', 'Go'],
    caseSensitive: true
  },
  {
    name: 'Rust',
    category: 'Programming Languages',
    aliases: ['rust', 'rustlang']
  },
  {
    name: 'PHP',
    category: 'Programming Languages',
    aliases: ['php', 'php7', 'php8']
  },
  {
    name: 'Ruby',
    category: 'Programming Languages',
    aliases: ['ruby', 'ruby on rails']
  },
  {
    name: 'Swift',
    category: 'Programming Languages',
    aliases: ['swift']
  },
  {
    name: 'Kotlin',
    category: 'Programming Languages',
    aliases: ['kotlin']
  },
  {
    name: 'SQL',
    category: 'Programming Languages',
    aliases: ['sql']
  },

  // ==========================================
  // Frontend
  // ==========================================
  {
    name: 'React',
    category: 'Frontend',
    aliases: ['react', 'react.js', 'reactjs']
  },
  {
    name: 'Next.js',
    category: 'Frontend',
    aliases: ['next.js', 'nextjs', 'next js']
  },
  {
    name: 'Angular',
    category: 'Frontend',
    aliases: ['angular', 'angular.js', 'angularjs', 'angular 2+']
  },
  {
    name: 'Vue',
    category: 'Frontend',
    aliases: ['vue', 'vue.js', 'vuejs', 'vue3']
  },
  {
    name: 'HTML',
    category: 'Frontend',
    aliases: ['html', 'html5']
  },
  {
    name: 'CSS',
    category: 'Frontend',
    aliases: ['css', 'css3']
  },
  {
    name: 'Tailwind CSS',
    category: 'Frontend',
    aliases: ['tailwind css', 'tailwind', 'tailwindcss']
  },
  {
    name: 'Sass',
    category: 'Frontend',
    aliases: ['sass', 'scss']
  },
  {
    name: 'Redux',
    category: 'Frontend',
    aliases: ['redux', 'redux toolkit']
  },

  // ==========================================
  // Backend
  // ==========================================
  {
    name: 'Node.js',
    category: 'Backend',
    aliases: ['node.js', 'nodejs', 'node js', 'node']
  },
  {
    name: 'Express',
    category: 'Backend',
    aliases: ['express', 'express.js', 'expressjs']
  },
  {
    name: 'Django',
    category: 'Backend',
    aliases: ['django', 'django rest framework', 'drf']
  },
  {
    name: 'Flask',
    category: 'Backend',
    aliases: ['flask']
  },
  {
    name: 'FastAPI',
    category: 'Backend',
    aliases: ['fastapi', 'fast api']
  },
  {
    name: 'Spring Boot',
    category: 'Backend',
    aliases: ['spring boot', 'springboot', 'spring framework']
  },
  {
    name: 'GraphQL',
    category: 'Backend',
    aliases: ['graphql', 'apollo graphql']
  },
  {
    name: 'NestJS',
    category: 'Backend',
    aliases: ['nestjs', 'nest.js']
  },
  {
    name: 'REST API',
    category: 'Backend',
    aliases: ['rest api', 'restful api', 'rest apis', 'restful apis', 'REST', 'restful']
  },

  // ==========================================
  // Databases
  // ==========================================
  {
    name: 'PostgreSQL',
    category: 'Databases',
    aliases: ['postgresql', 'postgres', 'psql']
  },
  {
    name: 'MySQL',
    category: 'Databases',
    aliases: ['mysql']
  },
  {
    name: 'MongoDB',
    category: 'Databases',
    aliases: ['mongodb', 'mongo']
  },
  {
    name: 'Redis',
    category: 'Databases',
    aliases: ['redis']
  },
  {
    name: 'SQLite',
    category: 'Databases',
    aliases: ['sqlite', 'sqlite3']
  },
  {
    name: 'Firebase',
    category: 'Databases',
    aliases: ['firebase', 'firestore']
  },
  {
    name: 'Supabase',
    category: 'Databases',
    aliases: ['supabase']
  },

  // ==========================================
  // Cloud
  // ==========================================
  {
    name: 'AWS',
    category: 'Cloud',
    aliases: ['aws', 'amazon web services', 'amazon s3', 'amazon ec2', 'aws lambda']
  },
  {
    name: 'Azure',
    category: 'Cloud',
    aliases: ['azure', 'microsoft azure']
  },
  {
    name: 'Google Cloud',
    category: 'Cloud',
    aliases: ['google cloud', 'gcp', 'google cloud platform']
  },

  // ==========================================
  // DevOps
  // ==========================================
  {
    name: 'Docker',
    category: 'DevOps',
    aliases: ['docker', 'dockerfile', 'docker compose', 'docker-compose']
  },
  {
    name: 'Kubernetes',
    category: 'DevOps',
    aliases: ['kubernetes', 'k8s']
  },
  {
    name: 'GitHub Actions',
    category: 'DevOps',
    aliases: ['github actions', 'gh actions']
  },
  {
    name: 'Jenkins',
    category: 'DevOps',
    aliases: ['jenkins']
  },
  {
    name: 'Terraform',
    category: 'DevOps',
    aliases: ['terraform']
  },
  {
    name: 'CI/CD',
    category: 'DevOps',
    aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous delivery']
  },
  {
    name: 'Nginx',
    category: 'DevOps',
    aliases: ['nginx']
  },

  // ==========================================
  // AI / ML
  // ==========================================
  {
    name: 'TensorFlow',
    category: 'AI / ML',
    aliases: ['tensorflow', 'tf']
  },
  {
    name: 'PyTorch',
    category: 'AI / ML',
    aliases: ['pytorch', 'torch']
  },
  {
    name: 'Scikit-learn',
    category: 'AI / ML',
    aliases: ['scikit-learn', 'scikit learn', 'sklearn']
  },
  {
    name: 'Pandas',
    category: 'AI / ML',
    aliases: ['pandas']
  },
  {
    name: 'NumPy',
    category: 'AI / ML',
    aliases: ['numpy']
  },
  {
    name: 'OpenAI',
    category: 'AI / ML',
    aliases: ['openai', 'gpt-4', 'chatgpt api']
  },

  // ==========================================
  // Data
  // ==========================================
  {
    name: 'Apache Spark',
    category: 'Data',
    aliases: ['apache spark', 'spark']
  },
  {
    name: 'Apache Kafka',
    category: 'Data',
    aliases: ['apache kafka', 'kafka']
  },
  {
    name: 'Power BI',
    category: 'Data',
    aliases: ['power bi', 'powerbi', 'microsoft power bi', 'power bi desktop']
  },
  {
    name: 'Tableau',
    category: 'Data',
    aliases: ['tableau']
  },

  // ==========================================
  // Tools
  // ==========================================
  {
    name: 'Git',
    category: 'Tools',
    aliases: ['git']
  },
  {
    name: 'GitHub',
    category: 'Tools',
    aliases: ['github']
  },
  {
    name: 'Postman',
    category: 'Tools',
    aliases: ['postman']
  },
  {
    name: 'Linux',
    category: 'Tools',
    aliases: ['linux', 'ubuntu', 'debian', 'centos']
  }
];

/**
 * Escapes characters for safe RegExp construction.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&');
}

/**
 * Constructs a RegExp boundary pattern matching a specific alias.
 * Ensures symbols like C++, C#, node.js, and words like Go, Java
 * are correctly matched without false positives.
 */
function buildAliasPattern(alias, isCaseSensitive = false) {
  const escaped = escapeRegex(alias);
  const flags = isCaseSensitive ? '' : 'i';

  // For symbols like C++ or C# where word boundary \b doesn't apply to the end
  if (alias.endsWith('+') || alias.endsWith('#')) {
    return new RegExp(`(^|[^a-zA-Z0-9#+])(${escaped})(?![a-zA-Z0-9#+])`, flags);
  }

  // Prevent file extensions / library names like React.js, Node JS from triggering standalone 'js' or 'ts'
  if (alias.toLowerCase() === 'js') {
    return new RegExp(`(^|[^a-zA-Z0-9.])(?<!\\b(?:node|react|vue|next|express|angular|ember|nest|three|d3|chart)\\s+)(${escaped})(?![a-zA-Z0-9])`, flags);
  }

  if (alias.toLowerCase() === 'ts') {
    return new RegExp(`(^|[^a-zA-Z0-9.])(?<!\\b(?:node|react|vue|next|express|angular|ember|nest)\\s+)(${escaped})(?![a-zA-Z0-9])`, flags);
  }

  // Standard boundary check
  return new RegExp(`(^|[^a-zA-Z0-9])(${escaped})(?![a-zA-Z0-9])`, flags);
}

/**
 * Extracts claimed technical skills from resume text using deterministic
 * taxonomy matching.
 * 
 * @param {string} text - Cleaned / normalized resume text
 * @returns {Array<{ skill: string, category: string, matchedTerm: string }>}
 */
export function extractClaimedSkills(text = '') {
  if (!text || typeof text !== 'string') return [];

  const claimedSkills = [];
  const seenSkills = new Set();

  for (const entry of SKILL_TAXONOMY) {
    if (seenSkills.has(entry.name)) continue;

    for (const alias of entry.aliases) {
      // Use case-sensitivity for short symbols/words like C, Go, Java, REST to prevent false triggers
      const isCaseSensitive = (entry.caseSensitive && (alias.length <= 2 || alias === 'Java' || alias === 'Go')) || alias === 'REST';
      const pattern = buildAliasPattern(alias, isCaseSensitive);

      const match = text.match(pattern);
      if (match) {
        seenSkills.add(entry.name);
        claimedSkills.push({
          skill: entry.name,
          category: entry.category,
          matchedTerm: match[2] // The exact captured term as it appeared in the resume
        });
        break; // Found canonical skill, avoid adding it again for other aliases
      }
    }
  }

  return claimedSkills;
}

export { buildAliasPattern, escapeRegex };
