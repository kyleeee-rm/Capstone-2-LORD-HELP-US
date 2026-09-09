"""Reusable Semantic Retrieval logic (Week 5, extracted Week 6). Originally
inline inside routers/subject.py's retrieve_chunks() route handler. Pulled
out so app/services/generation_service.py can call the same logic directly
— per Week 6 BE1 task ('integrate the Semantic Retrieval endpoint into the
AI generation workflow') — without an internal HTTP round-trip or a second,
possibly-drifting copy of the embed -> query -> map logic.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.material_chunk import MaterialChunk
from app.schemas.retrieval import RetrievedChunk
from app.services.ai_provider import embed_text, get_embedding_metadata
from app.services.chroma import get_subject_collection


def retrieve_context(
    db: Session,
    subject_id: UUID,
    query: str,
    top_k: int = 5,
) -> list[RetrievedChunk]:
    """Embeds query, searches the Subject's ChromaDB collection, maps
    results back to real MaterialChunk rows. Caller (route or generation
    workflow) is responsible for ownership/existence checks on subject_id
    before calling this — this function assumes subject_id is already
    validated.
    """
    query_vector = embed_text(query)

    embedding_meta = get_embedding_metadata()

    collection = get_subject_collection(
        subject_id=str(subject_id),
        embedding_model=embedding_meta["embedding_model"],
        embedding_dimension=embedding_meta["embedding_dimension"],
    )

    chroma_results = collection.query(
        query_embeddings=[query_vector],
        n_results=top_k,
    )

    chroma_ids = chroma_results["ids"][0] if chroma_results["ids"] else []
    distances = chroma_results["distances"][0] if chroma_results["distances"] else []

    if not chroma_ids:
        return []

    chunk_rows = db.scalars(
        select(MaterialChunk).where(
            MaterialChunk.chroma_vector_id.in_(chroma_ids)
        )
    ).all()
    chunks_by_vector_id = {c.chroma_vector_id: c for c in chunk_rows}

    results = []
    for vector_id, distance in zip(chroma_ids, distances):
        chunk = chunks_by_vector_id.get(vector_id)
        if chunk is None:
            continue
        results.append(
            RetrievedChunk(
                chunk_id=chunk.chunk_id,
                material_id=chunk.material_id,
                content=chunk.content,
                page_number=chunk.page_number,
                locator_type=chunk.locator_type,
                distance=distance,
            )
        )

    return results
