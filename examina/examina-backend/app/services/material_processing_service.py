import re

import fitz
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.db.session import SessionLocal
from app.models.learning_material import LearningMaterial
from app.models.material_chunk import MaterialChunk
from app.models.subject_folder import SubjectFolder
from app.services import storage
from app.services.ai_provider import embed_batch
from app.services.ai_provider.config import settings as ai_settings
from app.services.chroma import get_subject_collection

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100


def _extract_pdf_text(path) -> list[tuple[int, str]]:
    """Returns list of (page_number, page_text) tuples, 1-indexed pages."""
    pages: list[tuple[int, str]] = []
    with fitz.open(path) as doc:
        for i, page in enumerate(doc):
            pages.append((i + 1, page.get_text()))
    return pages


def _clean_text(text: str) -> str:
    """Minimal cleaning per Week 4 scope: collapse whitespace, strip empty
    lines. No header/footer or hyphenation heuristics yet — revisit once
    the LLM spike report informs whether it's actually needed.
    """
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def process_material(material_id) -> None:
    """Runs the full extraction -> chunking -> embedding -> storage
    pipeline for one LearningMaterial. Intended to be called from a
    FastAPI BackgroundTask after upload.

    Owns its own DB session rather than reusing the request's — the
    request's session (from Depends(get_db)) is closed as soon as the
    response is sent, which happens BEFORE this background task runs.
    Reusing it would operate on a closed session.
    """
    db = SessionLocal()
    try:
        material = db.get(LearningMaterial, material_id)
        if material is None:
            return

        try:
            folder = db.get(SubjectFolder, material.folder_id)
            subject_id = str(folder.subject_id)

            file_path = storage.get_absolute_path(material.storage_path)
            extension = file_path.suffix.lower()

            if extension != ".pdf":
                raise NotImplementedError(
                    f"Extraction for '{extension}' files is not yet implemented. "
                    "Only PDF is supported in this pass."
                )

            # --- Extract ---
            material.upload_status = "extracting"
            db.commit()

            pages = _extract_pdf_text(file_path)

            # --- Chunk ---
            material.upload_status = "chunking"
            db.commit()

            splitter = RecursiveCharacterTextSplitter(
                chunk_size=CHUNK_SIZE,
                chunk_overlap=CHUNK_OVERLAP,
            )

            chunk_records: list[dict] = []
            for page_number, page_text in pages:
                cleaned = _clean_text(page_text)
                if not cleaned:
                    continue
                for piece in splitter.split_text(cleaned):
                    chunk_records.append({"page_number": page_number, "content": piece})

            if not chunk_records:
                raise ValueError("No extractable text found in this material.")

            # --- Embed ---
            material.upload_status = "embedding"
            db.commit()

            texts = [c["content"] for c in chunk_records]
            vectors = embed_batch(texts)

            # --- Store in ChromaDB ---
            collection = get_subject_collection(
                subject_id=subject_id,
                embedding_model=ai_settings.EMBEDDING_MODEL,
                embedding_dimension=ai_settings.EMBEDDING_DIMENSION,
            )

            chroma_ids = [f"{material.material_id}_{i}" for i in range(len(chunk_records))]

            collection.add(
                ids=chroma_ids,
                embeddings=vectors,
                documents=texts,
                metadatas=[
                    {
                        "material_id": str(material.material_id),
                        "folder_id": str(material.folder_id),
                        "page_number": c["page_number"],
                    }
                    for c in chunk_records
                ],
            )

            # --- Persist chunk rows in Postgres ---
            for i, c in enumerate(chunk_records):
                db.add(
                    MaterialChunk(
                        material_id=material.material_id,
                        chunk_index=i,
                        content=c["content"],
                        page_number=c["page_number"],
                        chroma_vector_id=chroma_ids[i],
                        embedding_model=ai_settings.EMBEDDING_MODEL,
                        embedding_dimension=ai_settings.EMBEDDING_DIMENSION,
                    )
                )

            material.upload_status = "ready"
            db.commit()

        except Exception as exc:
            db.rollback()
            material = db.get(LearningMaterial, material_id)
            if material is not None:
                material.upload_status = "failed"
                material.error_log = str(exc)
                db.commit()

    finally:
        db.close()