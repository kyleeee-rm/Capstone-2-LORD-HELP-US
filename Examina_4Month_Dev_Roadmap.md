# EXAMINA — 4-Month Development Roadmap

**Team:** FE1, FE2 (React + Vite) · BE1, BE2 (FastAPI) · INFRA (PostgreSQL / ChromaDB / Docker / Nginx, doubles as DevOps + docs lead)
**Stack:** React + Vite · FastAPI · PostgreSQL · ChromaDB · Nginx (reverse proxy) · Docker Compose · OpenAI API (GPT-4o) · OpenCV (OMR) · Username/password auth
**Modules covered:** (1) Assessment Generation — AI-assisted + teacher-uploaded, (2) Automated Answer Checking (OMR), (3) Item Analysis
**Repo strategy:** single monorepo, branch-per-feature off `develop`, PR into `develop`, `main` = deployable

> Paste this doc back into chat anytime (e.g. "we're in Week 6, help me with X") — each week is self-contained enough for me to pick up context.

---

## Role Legend

| Tag | Owner | Scope |
|---|---|---|
| FE1 | Frontend Dev A | Auth, Subject Library shell, Material Sources UI, Answer Sheet/Scanning UI |
| FE2 | Frontend Dev B | Question Generation UI, Exam Preview/Edit, Item Analysis & Reports Dashboard |
| BE1 | Backend Dev A | Material Sources pipeline (upload → extraction → embeddings → ChromaDB), Traceability |
| BE2 | Backend Dev B | Question Bank schema, TOS/Bloom logic, AI generation + validation pipeline, Exam assembly |
| INFRA | Infra/DB | Docker Compose, PostgreSQL schema/migrations, Nginx, OMR/OpenCV service, deployment, CI, docs |

---

## MONTH 1 — Foundations & Material Sources

**Goal:** working skeleton (auth + subject folders + material upload → embeddings), infra reproducible via `docker compose up`.

### Week 1 — Environment & Spike

- **INFRA:** Docker Compose skeleton — FastAPI + PostgreSQL + ChromaDB + Nginx + React/Vite containers; `/health` route wired end-to-end; repo structure + branch protection rules.
- **BE1/BE2:** Standalone LLM spike — extract 1 real PDF (PyMuPDF), chunk it, prompt GPT-4o for 3–5 MCQs in JSON, manually judge quality. Document findings (prompt quality, chunk size, JSON reliability) — this decides prompt design for Month 2.
- **FE1/FE2:** Project scaffolding — Vite app, routing skeleton, component library decisions, design tokens/theme.
- **Milestone:** `docker compose up` boots all 5 services; spike report written.

### Week 2 — Auth & DB Schema

- **INFRA:** PostgreSQL schema v1 — `users(faculty)`, `subjects`, `subject_folders`, migrations tool (Alembic) set up.
- **BE1:** Auth endpoints (register/login, username+password, hashed passwords, session/JWT).
- **BE2:** Draft schema for `question_bank`, `learning_materials`, `exams` tables (design only, no build yet).
- **FE1:** Login/Register pages + auth flow, protected routes, token storage.
- **FE2:** Home/Dashboard shell, navigation shell (Question Generation tab / Material Sources tab per system flow diagram).
- **Milestone:** Faculty can register/login; empty dashboard renders.

### Week 3 — Subject Library + Upload

- **BE1:** Upload endpoint for PDF/DOCX (multer-equivalent in FastAPI), file storage, `learning_materials` table wired.
- **BE2:** Subject Folder CRUD (Create/select subject, per manuscript Fig. 11 flow — "learning materials completed or partial").
- **FE1:** Subject Folder shell (Open Subject Library → Select Subject Folder → Tabs: Question Generation / Material Sources), Upload UI with progress indicator.
- **INFRA:** Nginx reverse-proxy routing for `/api` and static frontend confirmed in Docker network.
- **Milestone:** Faculty can create a subject, upload a PDF/DOCX, see it listed.

### Week 4 — Extraction → Embeddings → ChromaDB

- **BE1:** PyMuPDF text extraction + NLP preprocessing (cleaning/chunking) → embedding generation → store in ChromaDB (per Fig. 15 pipeline).
- **BE2:** Begin Question Bank table finalization (subject, lesson, Bloom level, question type, usage count fields) based on Week 1 spike learnings.
- **FE1:** "Processing status" indicator per material (extracting → chunking → embedding → ready).
- **INFRA:** ChromaDB persistence volume, backup strategy note, seed script for test subjects.
- **Milestone (End of Month 1):** Upload → extract → chunk → embed → searchable in ChromaDB, fully demoable.

---

## MONTH 2 — Question Bank, TOS/Bloom Logic & AI Generation

**Goal:** faculty can configure an assessment (TOS + Bloom distribution) and the system either pulls from the question bank or generates new validated questions.

### Week 5 — Question Bank Search + TOS Engine

- **BE2:** PostgreSQL Question Bank search logic — filter by subject/lesson/Bloom level/type; "sufficient questions?" branch (Fig. 12); seed data for testing.
- **BE1:** Semantic Retrieval endpoint — given a topic/lesson, return top-k relevant chunks from ChromaDB.
- **FE2:** Assessment Customization UI — TOS % per lesson, Bloom's distribution sliders, question type + count selectors (per Fig. 22 "Exam Generator and Bloom Distribution").
- **INFRA:** Add `least-used` tracking column + index for anti-repetition logic.
- **Milestone:** Faculty can configure TOS/Bloom settings; backend can query existing bank and report sufficiency.

### Week 6 — Prompt Construction & LLM Generation

- **BE2:** Prompt Construction module (lesson context + Bloom level + question type → structured prompt) using spike findings; GPT-4o call returning JSON MCQ/TF with answer key.
- **BE1:** Wire semantic retrieval results into prompt context (RAG-style).
- **FE2:** "Generating…" state + live progress (retrieval → generation → validation) in UI.
- **INFRA:** Add OpenAI API key management (env secrets), rate-limit/retry handling.
- **Milestone:** End-to-end: topic → retrieved chunks → generated MCQ/TF with answer key (unvalidated).

### Week 7 — Validation Pipeline (Part 1)

Build the rule-based pipeline from `Algorithm-for-ai-assisted-generation.txt`, in order:

- **BE2:** TOS Coverage Validation (generated < required?) + Topic Alignment Validation.
- **BE1:** Retrieval/Answerability Validation — "can this be answered using ONLY the uploaded material?" (LLM YES/NO check) + reject/regenerate loop.
- **FE2:** Show validation status per question (pass/fail/regenerating) in generation preview.
- **INFRA:** Log validation outcomes to a `validation_log` table for later debugging/traceability.
- **Milestone:** Generated questions pass/fail TOS + answerability checks automatically.

### Week 8 — Validation Pipeline (Part 2) + Duplicate/Bloom/Grammar

- **BE2:** Bloom Validation (LLM classifies question → must match instructor-selected level, 100% match rule) + Grammar pass/fail check.
- **BE1:** Duplicate Detection — embedding cosine similarity vs. existing bank (thresholds: 0.95–1.0 near-identical, 0.90–0.95 extremely similar, etc.), flag/regenerate/faculty-override logic + traceability record (generated Q, most similar existing Q, similarity score, status, action).
- **FE1/FE2:** Faculty Review screen — approve/edit/regenerate individual questions (per Fig. 24 "Edit Question and Finalize Exam").
- **INFRA:** Docker healthchecks + logging aggregation; write ADR (architecture decision record) for validation pipeline.
- **Milestone (End of Month 2):** Full validation pipeline operational; faculty can review/approve AI-generated + manually uploaded questions into the Question Bank.

---

## MONTH 3 — Exam Assembly, Traceability & Answer Checking (OMR)

**Goal:** faculty can assemble/export a full exam with traceable sources, and scanned answer sheets are auto-scored.

### Week 9 — Exam Assembly + Answer Key + Traceability UI

- **BE2:** Assemble Complete Exam (existing + newly generated questions), generate Answer Key, save to Question Bank/Exam library.
- **BE1:** Question Traceability endpoint — link each question to its source page/paragraph/sentence; expose via API.
- **FE2:** Exam Preview screen (all questions + traceability source shown per question, Fig. 23).
- **INFRA:** PostgreSQL indices for exam retrieval performance; backup/versioning of saved exams.
- **Milestone:** Faculty previews a full assembled exam with visible source citations per question.

### Week 10 — Manual/Teacher-Uploaded Question Path

- **BE2:** "Uploaded by user" question path — manual question entry/import into Question Bank (parallel to AI path per `major-module-features.txt` item 1b), same schema/validation minus LLM steps (still runs duplicate/grammar checks).
- **FE2:** Manual question entry form + bulk import (CSV/DOCX) UI.
- **BE1:** Support material-linked manual questions (optional traceability tagging).
- **FE1:** Faculty Approval workflow (Yes → Save/Store; No → Edit → return to preview), per Fig. 11 bottom loop.
- **Milestone:** Both AI-assisted and manually-uploaded question paths converge into one Question Bank + approval flow.

### Week 11 — Answer Sheet Generation + Scanning Pipeline

- **FE1:** Printable Answer Sheet generator UI — numbering, paper size, layout customization, alignment markers, Name/Student # boxes (ALL CAPS), per `answer-checking.txt`.
- **BE1:** Endpoint to generate answer sheet template tied to Exam ID.
- **INFRA:** Set up OpenCV service/container (or module within BE1's service) — image preprocessing pipeline (perspective correction, noise removal, thresholding).
- **BE2:** Scan intake endpoint: accept scanned image, run "properly positioned?" check, flag/request rescan branch.
- **Milestone:** Faculty can generate/print answer sheets; scan upload validates orientation.

### Week 12 — OCR/OMR + Scoring

- **BE1:** OCR for student ID fields (name, student number).
- **BE2:** OMR bubble detection (OpenCV) + response analysis — compare to answer key, detect multiple marks, blank answers, invalid marks, missing student info.
- **FE1:** Processing progress UI + results display (score, remarks) per sheet.
- **INFRA:** Processing log table (`scan_log`) for audit; performance test with a batch of scans.
- **Milestone (End of Month 3):** End-to-end scan → OCR/OMR → auto-scored results saved to DB.

---

## MONTH 4 — Item Analysis, Reporting, Integration & Deployment

**Goal:** full system integrated, item analysis + dashboards live, deployed to cloud, documentation complete.

### Week 13 — Item Analysis Engine

- **BE2:** Difficulty Index (P-value) computation — `P-Value = (Total Correct ÷ Total Students) × 100`; classification: 85–100% Mastered, 75–84% Nearing Mastery, ≤74% Not Mastered (per `item-analysis-workflow.txt`).
- **BE1:** (Stretch, if time allows) Discrimination Index / Point-Biserial / Distractor Effectiveness per Table 4 feature list — otherwise defer to backlog.
- **FE2:** Item Analysis report UI — per-question P-value + mastery tag (Fig. 28/29 layouts).
- **INFRA:** Export pipeline scaffolding (Excel/PDF/CSV) shared by Item Analysis + Answer Checking reports.
- **Milestone:** Item analysis report generated automatically after scoring a class set.

### Week 14 — Analytics Dashboard + Reports Export

- **FE2:** Assessment Analytics Dashboard — tables/charts for student performance, mastery levels, item quality (per Fig. 27–29).
- **BE2:** Report Generation & Export Module — PDF/CSV/Excel outputs for exams, results, item analysis.
- **FE1:** Individual score view + class summary view.
- **INFRA:** Centralized DB reporting queries optimized (views/materialized views if needed).
- **Milestone:** Faculty can export Excel/CSV/PDF reports for any completed exam.

### Week 15 — Integration, End-to-End Testing, Bug Fixing

- **All BE + FE:** Full regression pass across all 3 modules (Assessment Generation, Answer Checking, Item Analysis); fix integration bugs; cross-browser/device checks for scanning UI.
- **INFRA:** Load-test OMR pipeline + AI generation concurrency; finalize Docker Compose for production (multi-stage builds, env separation).
- **Milestone:** Feature-complete build on `develop`, tagged as release candidate.

### Week 16 — Deployment, Documentation, Final Polish

- **INFRA:** Cloud deployment (containers to chosen cloud provider), Nginx SSL/reverse proxy config, environment secrets, CI/CD pipeline finalized, backups configured.
- **All:** Finalize documentation — system architecture, API docs, user manual (faculty-facing), setup/README for the monorepo, ISO 25010 evaluation prep (functional suitability, performance efficiency, reliability, security checklist).
- **FE1/FE2:** UI polish pass (empty states, error states, loading states) across all screens.
- **Milestone (End of Month 4):** System deployed on cloud, demoable end-to-end, full documentation package ready for faculty evaluation/testing phase.

---

## Cross-Cutting Threads (ongoing every week)

- **Documentation:** each dev logs decisions/blockers weekly (feeds into Chapter 3 methodology + system diagrams already drafted).
- **Branching:** `feature/<module>-<short-desc>` → PR into `develop` → weekly merge to `main` after milestone demo.
- **Security/Privacy:** Data Privacy Act (RA 10173) compliance — access control, data retention notes — bake in from Month 1 auth work, not bolted on later.
- **Faculty feedback loop:** where possible, informally validate UI/flows against the interview-guide findings from Chapter 3 as features land, rather than waiting for the formal evaluation.

## How to use this with me later

When you come back, tell me: **which week you're on**, **which role's task**, and **what's blocking you** (e.g. "Week 7, BE1, answerability validation isn't rejecting correctly") — I'll pick up context from this roadmap directly.
