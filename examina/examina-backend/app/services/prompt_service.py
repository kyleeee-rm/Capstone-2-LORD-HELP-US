"""Prompt Construction module (Week 6, BE2 scope). Pure function — no DB,
no ChromaDB, no HTTP calls. Builds the exact prompt string sent to
generate_questions(). Kept separate from orchestration (generation_service.py)
so prompt wording can be iterated and tested without hitting any live
service — this matters given Week 1's spike findings showed prompt behavior
needs empirical re-validation per provider/model, not just written once and
trusted.
"""

from app.models.question_bank import BloomLevel, QuestionType
from app.schemas.retrieval import RetrievedChunk

MAX_QUESTIONS_PER_CALL = 5  # per Week 1 spike Section 7 — caps avoid both
# the truncation bug (Section 8) and near-duplicate generation (Section 5)
# seen at larger batch sizes. Callers needing more must call generate_questions()
# multiple times, not raise this ceiling.


def construct_prompt(
    lesson: str,
    retrieved_chunks: list[RetrievedChunk],
    bloom_level: BloomLevel,
    question_type: QuestionType,
    num_questions: int,
) -> str:
    """Builds a structured generation prompt from retrieval context.

    Raises ValueError if num_questions exceeds the spike-recommended cap
    or if no chunks are provided — a prompt with no source material would
    let the model hallucinate content, defeating the RAG-grounding purpose
    of this whole pipeline.
    """
    if num_questions > MAX_QUESTIONS_PER_CALL:
        raise ValueError(
            f"num_questions={num_questions} exceeds the per-call cap of "
            f"{MAX_QUESTIONS_PER_CALL} (Week 1 spike finding — see "
            f"week1_spike_findings.md Section 7). Call generate_questions() "
            f"multiple times for larger totals instead."
        )

    if not retrieved_chunks:
        raise ValueError(
            "construct_prompt() requires at least one retrieved chunk — "
            "generating questions with no source material would not be "
            "grounded in faculty-uploaded content."
        )

    context_block = "\n\n".join(
        f"[chunk_id: {chunk.chunk_id}]\n{chunk.content}"
        for chunk in retrieved_chunks
    )

    if question_type == QuestionType.multiple_choice:
        shape_instruction = (
            'Each question object must have this exact shape: '
            '{"question_text": "...", "choices": {"A": "...", "B": "...", '
            '"C": "...", "D": "..."}, "correct_answer": "A"} '
            '(correct_answer must be one of "A", "B", "C", "D").'
        )
    elif question_type == QuestionType.true_false:
        shape_instruction = (
            'Each question object must have this exact shape: '
            '{"question_text": "...", "choices": null, '
            '"correct_answer": "True"} '
            '(correct_answer must be exactly "True" or "False").'
        )
    else:
        raise ValueError(f"Unsupported question_type: {question_type}")

    prompt = f"""You are generating exam questions for the topic: "{lesson}".

Use ONLY the following source material as your factual basis. Do not introduce facts that are not present in this material. However, write each question as a standalone exam question — do NOT reference "the source material," "the text," "the passage," or similar meta-references. A student reading the question should not know it was generated from a specific document.

--- SOURCE MATERIAL ---
{context_block}
--- END SOURCE MATERIAL ---

Generate exactly {num_questions} {question_type.value.replace('_', ' ')} questions at the "{bloom_level.value}" level of Bloom's Taxonomy.

{shape_instruction}

Return ONLY a JSON object with this exact top-level shape:
{{"questions": [ ... ]}}

STOP as soon as you have written exactly {num_questions} questions. Do not write a {num_questions + 1}th question. Do not include any text outside the JSON object."""

    return prompt