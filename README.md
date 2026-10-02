# SkillProof 🛡️

> **Bridging the gap between claimed resume skills and verified GitHub code.** Built for hackathons.

## The Problem
Certificates and keyword-stuffed resumes tell recruiters what a candidate claims, but not what they can actually build. 

## The Solution
**SkillProof** automates technical skill validation:
1. **Resume Analysis**: Ingests a student's resume PDF and extracts claimed skills, technologies, and proficiencies.
2. **GitHub Repository Deep-Dive**: Fetches public repositories, analyzes language statistics, package manifests (`package.json`, `requirements.txt`, etc.), commit history, and code patterns.
3. **Skill Evidence Matcher**: Maps claimed skills to concrete GitHub evidence (lines of code, dependency usage, project recency, and complexity).
4. **Verification Report**: Generates an actionable, transparent report categorizing skills into:
   - **Verified / Proven Skills** (backed by active repos & direct evidence)
   - **Emerging / Partially Proven Skills** (minimal repos or auxiliary tools)
   - **Unverified / No Evidence** (claimed on resume but absent in code)

---

## High-Level Architecture

```
SkillProof/
├── client/          # Frontend Web Application (React + Vite)
│   ├── src/
│   │   ├── components/  # UI Components (Upload, Results, Charts)
│   │   ├── services/    # API calls to backend
│   │   └── styles/      # Modern CSS design system
│   └── index.html
├── server/          # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/ # HTTP Request handlers
│   │   ├── routes/      # REST API endpoints
│   │   ├── services/    # PDF parsing, GitHub analysis, Skill matching
│   │   └── utils/       # Skill taxonomy & helper functions
│   └── app.js       # Express server entry point
└── docs/            # Architecture specifications & hackathon notes
```

---

## Setup & Running (Upcoming)
*Detailed setup and run commands will be provided once application logic is integrated.*
