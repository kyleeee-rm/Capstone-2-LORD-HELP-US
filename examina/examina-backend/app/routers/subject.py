from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.db.session import get_db
from app.deps import get_current_user
from app.models.faculty import Faculty
from app.models.material_chunk import MaterialChunk
from app.schemas.retrieval import RetrievalResponse, RetrievedChunk
from app.schemas.subject import (
    SubjectCreate,
    SubjectResponse,
    SubjectUpdate,
)
from app.services.ai_provider import embed_text
from app.services.ai_provider.config import settings as ai_settings
from app.services.chroma import get_subject_collection
from app.services.subject_service import SubjectService

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.post(
    "",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    return SubjectService.create_subject(
        db=db,
        faculty_id=current_user.faculty_id,
        subject_data=payload,
    )


@router.get("", response_model=list[SubjectResponse])
def get_subjects(
    archived: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subjects = SubjectService.get_all_subjects(
        db=db,
        archived=archived,
    )

    return [
        subject
        for subject in subjects
        if subject.faculty_id == current_user.faculty_id
    ]


@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

    if subject is None:
        raise AppError(
            404,
            "subject_not_found",
            "Subject not found.",
        )

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this subject.",
        )

    return subject


@router.get("/{subject_id}/retrieve", response_model=RetrievalResponse)
def retrieve_chunks(
    subject_id: UUID,
    query: str = Query(...),
    top_k: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

    if subject is None:
        raise AppError(
            404,
            "subject_not_found",
            "Subject not found.",
        )

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this subject.",
        )

    query_vector = embed_text(query)

    collection = get_subject_collection(
        subject_id=str(subject_id),
        embedding_model=ai_settings.EMBEDDING_MODEL,
        embedding_dimension=ai_settings.EMBEDDING_DIMENSION,
    )

    chroma_results = collection.query(
        query_embeddings=[query_vector],
        n_results=top_k,
    )

    chroma_ids = chroma_results["ids"][0] if chroma_results["ids"] else []
    distances = chroma_results["distances"][0] if chroma_results["distances"] else []

    if not chroma_ids:
        return RetrievalResponse(subject_id=subject_id, query=query, results=[])

    # Map back to real Postgres chunk rows so chunk_id is available for
    # QuestionBank.source_chunk_id once Week 6 generation consumes this.
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
            # Chroma has a vector Postgres doesn't know about - shouldn't
            # happen given they're written together in
            # material_processing_service.py, but don't silently drop
            # it without a trace if it ever does.
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

    return RetrievalResponse(subject_id=subject_id, query=query, results=results)


@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: UUID,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

    if subject is None:
        raise AppError(
            404,
            "subject_not_found",
            "Subject not found.",
        )

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this subject.",
        )

    return SubjectService.update_subject(
        db=db,
        subject=subject,
        subject_data=payload,
    )


@router.patch("/{subject_id}/archive")
def archive_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

    if subject is None:
        raise AppError(
            404,
            "subject_not_found",
            "Subject not found.",
        )

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this subject.",
        )

    if subject.is_archived:
        raise AppError(
            400,
            "already_archived",
            "Subject is already archived.",
        )

    SubjectService.archive_subject(
        db=db,
        subject=subject,
    )

    return {
        "message": "Subject archived successfully.",
    }


@router.patch("/{subject_id}/restore")
def restore_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

    if subject is None:
        raise AppError(
            404,
            "subject_not_found",
            "Subject not found.",
        )

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this subject.",
        )

    if not subject.is_archived:
        raise AppError(
            400,
            "not_archived",
            "Subject is not archived.",
        )

    SubjectService.restore_subject(
        db=db,
        subject=subject,
    )

    return {
        "message": "Subject restored successfully.",
    }


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

    if subject is None:
        raise AppError(
            404,
            "subject_not_found",
            "Subject not found.",
        )

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this subject.",
        )

    SubjectService.delete_subject(
        db=db,
        subject=subject,
    )

    return {
        "message": "Subject deleted successfully.",
    }
