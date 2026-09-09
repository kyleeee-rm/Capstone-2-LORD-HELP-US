"""Generation orchestration (Week 6, BE1+BE2 shared scope). Ties together
retrieve_context() (BE1's Week 6 task: wiring Semantic Retrieval into the
generation workflow), construct_prompt() (BE2's Prompt Construction module),
and generate_questions() (the AI provider call). Returns raw generated
question dicts — does NOT persist to QuestionBank; that's the actual
generation endpoint's job (subject_id, lesson, status, source, and
source_chunk_id all get attached there, not here).
"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.question_bank import BloomLevel, QuestionType
from app.services.ai_provider import generate_questions
from app.services.prompt_service import MAX_QUESTIONS_PER_CALL, construct_prompt
from app.services.retrieval_service import retrieve_context


class NoRetrievableContentError(Exception):
    """Raised when a lesson/topic has no retrievable chunks — e.g. no
    material uploaded/processed yet for this subject. Deliberately loud:
    generating questions with no grounding material would defeat RAG's
    purpose. The calling route is responsible for catching this and
    returning a faculty-facing AppError (see backlog — route not yet
    built as of Week 6)."""


def generate_exam_questions(
    db: Session,
    subject_id: UUID,
    lesson: str,
    bloom_level: BloomLevel,
    question_type: QuestionType,
    num_questions: int,
    top_k: int = 5,
) -> list[dict]:
    """Orchestrates: retrieve context once, generate questions in batches
    of at most MAX_QUESTIONS_PER_CALL, reusing the same retrieved context
    across all batches (source material for a lesson doesn't change
    between batches — re-retrieving per batch would be wasted work for
    identical results).

    Fails the WHOLE request if any batch fails (see dev discussion,
    2026-09-XX) — a partial result would silently under-deliver against
    the faculty's requested count with no signal why. Retry-per-batch is
    a deferred backlog item, not implemented here.
    """
    chunks = retrieve_context(
        db=db,
        subject_id=subject_id,
        query=lesson,  # per Aug 13 finding: query built from lesson label
        # alone, NOT prefixed/suffixed with the subject name — subject
        # scoping is already handled by subject_id, not by query text.
        top_k=top_k,
    )

    if not chunks:
        raise NoRetrievableContentError(
            f"No retrievable material chunks found for lesson '{lesson}' "
            f"in subject {subject_id}. Upload and process learning "
            f"material for this lesson before generating questions."
        )

    all_questions: list[dict] = []
    remaining = num_questions

    while remaining > 0:
        batch_size = min(remaining, MAX_QUESTIONS_PER_CALL)

        prompt = construct_prompt(
            lesson=lesson,
            retrieved_chunks=chunks,
            bloom_level=bloom_level,
            question_type=question_type,
            num_questions=batch_size,
        )

        # No try/except here — an exception from generate_questions()
        # (bad JSON, wrong shape, API error) propagates up and fails the
        # whole request, per the "fail whole batch" decision above. The
        # caller (future route) is responsible for catching it.
        batch_questions = generate_questions(prompt, num_questions=batch_size)

        all_questions.extend(batch_questions)
        remaining -= batch_size

    return all_questions