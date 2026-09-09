# EXAMINA — API Contract (Draft v0.3)

### ⚠️ Revision Note (2026-09-09)

Material endpoints were retargeted from `Subject` → `SubjectFolder` to match
the correct hierarchy: **Faculty → Subject → SubjectFolder → LearningMaterial**.
Every material path below now lives under `/subject-folders/{folder_id}/...`,
**not** `/subjects/{subject_id}/...` as originally drafted in v0.2. If your FE
mocks or calls still point at the old `/subjects/.../materials` paths, update
them — those routes no longer exist.

The Semantic Retrieval endpoint (`/subjects/{subject_id}/retrieve`) is the one
exception and is correct as-is: retrieval is scoped per-**Subject** (one
ChromaDB collection per Subject, not per-folder), so it intentionally does not
follow the folder-based path. This is by design, not leftover inconsistency.

This revision also adds real request/response shapes for the two endpoints
that existed in code but were never documented (`PATCH`/`DELETE` materials),
and formally specs the Semantic Retrieval endpoint (built Week 5, previously
listed only as "Not Yet Specced").

---

### Cookie Policy

Refresh Tokens are stored in **HttpOnly Secure Cookies** and are automatically included by the browser only when calling authentication endpoints. Frontend HTTP requests that require cookies must enable credentialed requests (e.g., `withCredentials: true` in Axios or `credentials: "include"` in Fetch).

**Purpose:** Lets FE1/FE2 build against realistic mock data while BE1/BE2/INFRA build the real endpoints. Update this file as endpoints firm up — treat it as the source of truth both sides sync against, not a one-time doc.

**Base URL (dev):** `http://localhost/api`

**Auth:** Protected endpoints require a JWT Access Token in the `Authorization: Bearer <token>` header. `/health`, `/auth/register`, `/auth/login`, and `/auth/refresh` do not require an access token. Authentication uses short-lived JWT Access Tokens with long-lived Refresh Tokens stored as HttpOnly Secure Cookies.

**Content-Type:** `application/json` unless noted (file upload = `multipart/form-data`)

**AI provider note:** Generation and embedding calls are provider-abstracted internally (dev may run on Groq for cost, deployment targets OpenAI GPT-4o + `text-embedding-3-small`/`large`). This is invisible to FE — no endpoint here changes shape based on provider. BE devs: keep provider config (base URL, model name, embedding dimension) out of business logic so the Week 16 provider switch doesn't touch route handlers.

**Error shape (all endpoints):**

```json
{
  "error": "string_code",
  "message": "Human readable message",
  "details": {}
}
```

---

## Week 1 — Health Check

### `GET /health`

No auth. Confirms Nginx → FastAPI → DB network path.

**Response `200`**

```json
{
  "status": "ok",
  "services": {
    "api": "ok",
    "postgres": "ok",
    "chromadb": "ok"
  }
}
```

---

## Week 2 — Auth

### `POST /auth/register`

```json
// Request
{
  "username": "jdelacruz",
  "password": "string (min 8 chars)",
  "full_name": "Juan Dela Cruz"
}
```

**Response `201`**

```json
{
  "id": "uuid",
  "username": "jdelacruz",
  "full_name": "Juan Dela Cruz",
  "created_at": "2026-07-22T00:00:00Z"
}
```

**Errors:**

- `400 username_taken`
- `400 weak_password`

---

### `POST /auth/login`

```json
// Request
{
  "username": "jdelacruz",
  "password": "string"
}
```

**Response `200`**

```json
{
  "access_token": "jwt.access.token.here",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "username": "jdelacruz",
    "full_name": "Juan Dela Cruz"
  }
}
```

> **Response Header**
>
> ```
> Set-Cookie:
> refresh_token=<token>;
> HttpOnly;
> Secure;
> SameSite=Lax;
> Path=/auth/refresh
> ```

**Errors:**

- `401 invalid_credentials`

---

### `POST /auth/refresh`

Exchanges a valid Refresh Token cookie for a new JWT Access Token.

> **Request Body**
>
> None.
>
> The browser automatically sends the HttpOnly Refresh Token cookie.

**Response `200`**

```json
{
  "access_token": "new.jwt.access.token",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Errors:**

- `401 invalid_refresh_token`
- `401 refresh_token_expired`

---

### `POST /auth/logout`

Revokes the current Refresh Token and clears the authentication cookie.

> **Request Body**
>
> None.

**Response `200`**

```json
{
  "message": "Logged out successfully."
}
```

**Errors:**

- `401 unauthorized`

---

### `GET /auth/me`

Auth required. Returns current session's faculty profile (for protected-route checks on FE).

**Response `200`**

```json
{
  "id": "uuid",
  "username": "jdelacruz",
  "full_name": "Juan Dela Cruz"
}
```

**Errors:**

- `401 unauthorized` (expired or missing access token. FE should automatically call `/auth/refresh` before redirecting the user to login.)

---

## Week 2 — Subject Library

*(Subject CRUD is unchanged from prior drafts — `GET/POST /subjects`, `GET/PUT /subjects/{subject_id}`, `PATCH /subjects/{subject_id}/archive|restore`, `DELETE /subjects/{subject_id}`. Not re-listed here since these paths did not move. Ping BE1/BE2 in sync if FE needs the full shape re-documented.)*

---

## Week 3 (Revised) — Learning Materials

**⚠️ All paths below are scoped to `/subject-folders/{folder_id}/...`, not `/subjects/{subject_id}/...`.**

### `POST /subject-folders/{folder_id}/materials`

`multipart/form-data`. Uploads a learning material file and kicks off async processing (extraction → chunking → embedding).

**Form fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | file | ✅ | PDF or DOCX only |
| `title` | string | ✅ | |
| `description` | string | ✅ | |
| `teaching_hours` | number | ✅ | |
| `lesson_label` | string | optional | |

> **Change from earlier draft:** `title`, `description`, and `teaching_hours` are now **required** form fields, not optional. Only `lesson_label` is optional.

**Response `202`**

```json
{
  "id": "uuid",
  "folder_id": "uuid",
  "filename": "Lesson1_Arrays.pdf",
  "lesson_label": "Lesson 1",
  "title": "Arrays and Linked Lists",
  "description": "Intro lecture notes",
  "teaching_hours": 1.5,
  "status": "uploaded",
  "uploaded_at": "2026-09-09T00:00:00Z"
}
```

**Errors:** `400 unsupported_file_type` (only pdf/docx), `404 folder_not_found`

---

### `GET /subject-folders/{folder_id}/materials`

Lists all materials in a folder, with chunk counts.

**Response `200`**

```json
{
  "materials": [
    {
      "id": "uuid",
      "filename": "Lesson1_Arrays.pdf",
      "lesson_label": "Lesson 1",
      "status": "ready",
      "chunk_count": 42,
      "uploaded_at": "2026-09-09T00:00:00Z"
    }
  ]
}
```

**Errors:** `404 folder_not_found`

---

### `GET /subject-folders/{folder_id}/materials/{material_id}/status`

Lightweight polling endpoint for the FE1 "processing status" indicator.

**Response `200`**

```json
{ "id": "uuid", "status": "embedding", "progress_pct": 75 }
```

> `progress_pct` is a **stepped estimate**, not a live/continuous computation:
> `uploaded`=0, `extracting`=25, `chunking`=50, `embedding`=75, `ready`=100, `failed`=0.

**Errors:** `404 folder_not_found`, `404 material_not_found`

---

### `PATCH /subject-folders/{folder_id}/materials/{material_id}`

*(New — not in earlier draft.)* Partial update. Only send the fields you want to change; omitted fields are left untouched.

```json
// Request (all fields optional)
{
  "filename": "Renamed.pdf",
  "title": "New title",
  "description": "New description",
  "teaching_hours": 2.0,
  "lesson_label": "Lesson 2"
}
```

**Response `200`** — same shape as the upload response (`MaterialUploadResponse`).

**Errors:** `404 folder_not_found`, `404 material_not_found`

---

### `DELETE /subject-folders/{folder_id}/materials/{material_id}`

*(New — not in earlier draft.)*

**Response `200`**

```json
{ "message": "Material deleted successfully." }
```

**Errors:** `404 folder_not_found`, `404 material_not_found`

---

## Week 5 — Semantic Retrieval

### `GET /subjects/{subject_id}/retrieve`

Auth required, ownership-checked against the requesting faculty. Embeds the
query, searches that Subject's ChromaDB collection, and maps results back to
real `MaterialChunk` rows in Postgres.

**Note:** scoped per **Subject** (`subject_id`), not per-folder — a Subject's
materials share one ChromaDB collection regardless of which SubjectFolder
they were uploaded into.

**Query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `query` | string | required | See note below on query construction |
| `top_k` | int | 5 | range 1–20 |

**Response `200`**

```json
{
  "subject_id": "uuid",
  "query": "Early Childhood",
  "results": [
    {
      "chunk_id": "uuid",
      "material_id": "uuid",
      "content": "Full chunk text...",
      "page_number": 4,
      "locator_type": "section",
      "distance": 0.97
    }
  ]
}
```

**Errors:** `404 subject_not_found`, `403 forbidden`

> **Important for FE2/whoever builds Prompt Construction UI or any caller
> of this endpoint:** `distance` is the **raw** ChromaDB distance value
> (currently L2, not cosine — the collection was never explicitly configured
> for a distance metric), **not** a normalized 0–1 similarity score. Lower is
> more relevant. Do not display it to faculty as a percentage or confidence
> score without converting it first — there's no conversion formula yet
> since the metric itself may change (flagged for Week 6–8 validation
> tuning).
>
> **Query construction guidance:** build `query` from the topic/lesson label
> alone. Do not prepend or append the Subject's own name/title to the query
> string — since results are already scoped to that Subject's collection,
> adding the subject name as a query term adds noise rather than
> discriminating signal (confirmed via testing: it can measurably worsen
> ranking quality by pulling toward generic subject-wide content instead of
> the specific topic).

---

## Status Enum Reference (shared vocabulary — use exact strings)
- **Material processing:** `uploaded` → `extracting` → `chunking` → `embedding` → `ready` | `failed`
- **Subject material_status:** `none` | `partial` | `complete`

**Internal only (not exposed to FE):** each ChromaDB collection/material row should be tagged server-side with the embedding model + dimension used at embed time. Not a response field for now — just needed so BE can detect and re-embed mismatched vectors if the provider changes later (see roadmap Week 16 provider-switch checklist).

---

## Not Yet Specced (placeholder — filled in during Month 2–4 sync)
- `POST /subjects/{id}/exams/generate` (Week 6–8 — Prompt Construction, LLM generation, validation)
- `GET /question-bank` (search/filter — sufficiency-check logic already implemented server-side; endpoint shape TBD)
- `POST /exams/{id}/answer-sheets` (Week 11)
- `POST /exams/{id}/scans` (Week 11–12, OMR)
- `GET /exams/{id}/item-analysis` (Week 13)
- `GET /exams/{id}/reports/export` (Week 14)

Each of these gets its own contract section added the week before that role starts building it — bring it up in the prior week's sync so FE isn't blocked.

---

## How to keep this useful
- BE devs: update the real response shape here *before* merging the endpoint, not after — this is what FE builds mocks from.
- FE devs: if a field you need isn't here, add it as a proposed addition (mark `// PROPOSED`) rather than guessing silently — flag it in the next sync.
- Treat mismatches between this doc and actual behavior as a bug, same priority as a broken endpoint. (This revision exists because that happened — the Week 3 material paths drifted from `/subjects/...` to `/subject-folders/...` in code without the contract being updated, which cost debugging time. Please don't let it happen again.)
