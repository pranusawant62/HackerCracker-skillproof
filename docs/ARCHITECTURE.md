# SkillProof — Full-Stack Architecture & Design

## 1. System Overview

SkillProof connects two disparate data sources to produce a factual verification report:
1. **Unstructured Resume Text** (claims)
2. **Structured & Semi-Structured GitHub Data** (evidence)

```
[ Candidate Resume (PDF) ]        [ GitHub Handle ]
            │                              │
            ▼                              ▼
  [ PDF Ingestion & NLP ]        [ GitHub REST API Engine ]
  - Text & Section Parser        - Repositories & Languages
  - Skill Taxonomy Matching      - Dependency Manifests (package.json, etc.)
  - Claim Extraction Engine      - Commit activity & recency
            │                              │
            └──────────────┬───────────────┘
                           ▼
             [ Skill Proof Matching Engine ]
             - Direct Language Match
             - Framework/Library Dependency Match
             - Project Depth & Recency Scoring
                           ▼
             [ Verification Report Generator ]
             - Proven Skills (high confidence + evidence links)
             - Weak / Unverified Skills
             - Visual Breakdown & Recruiter Insights
                           ▼
                 [ Interactive UI Dashboard ]
```

---

## 2. Technology Stack Recommendation

| Tier | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | **React + Vite** | Instant HMR, lightweight bundle, rapid component iteration during a hackathon. |
| **Styling** | **Modern Vanilla CSS (Custom Design System)** | High-aesthetic dark/glassmorphic look, zero build configuration overhead, full control over animations and badges. |
| **Backend API** | **Node.js + Express** | Unified JS runtime across stack, handles async GitHub API requests and stream-based multipart file uploads easily. |
| **PDF Extraction**| **`pdf-parse` / `multer`** | Fast in-memory parsing of text streams without external system dependencies like poppler. |
| **GitHub Engine** | **GitHub REST API (v3) / Octokit** | Access public repos, language statistics, commit counts, and repository file contents (e.g., `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`). |
| **Matching Engine**| **Rule-based & Heuristic Skill Taxonomy** | Fast, deterministic, and transparent scoring that can easily be augmented with an LLM for semantic alignment. |

---

## 3. Core Modules (Planned)

### A. Resume Claim Extraction (`server/src/services/pdfParser.js`)
- Parses PDF files into sanitized text.
- Applies a canonical tech skill taxonomy (Languages, Frameworks, Databases, Cloud & DevOps, Core CS).
- Extracts candidate name, contact, and list of claimed skills with contextual mentions.

### B. GitHub Analysis Engine (`server/src/services/githubAnalyzer.js`)
- Fetches all public non-fork (and fork) repositories.
- Aggregates language byte counts.
- Inspects repository dependencies (e.g., detecting React, Express, PyTorch, Docker, PostgreSQL).
- Evaluates repo recency, star count, and commit contribution frequency.

### C. Skill Verification Engine (`server/src/services/skillMatcher.js`)
Calculates an **Evidence Score** for each claimed skill:
- **Verified**: Directly backed by language stats or explicit dependencies in active repos.
- **Weak Evidence**: Found only in older repos, small snippet usage, or minimal language percentages.
- **No Evidence**: Claimed on resume but not detected across any repositories.

---

## 4. API Endpoints Plan

- `POST /api/verify`: Multipart endpoint accepting `resume` (PDF file) and `githubUsername` (string).
- `GET /api/health`: Health-check endpoint.
