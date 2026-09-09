import re

import fitz
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.db.session import SessionLocal
from app.models.learning_material import LearningMaterial
from app.models.material_chunk import MaterialChunk
from app.models.subject_folder import SubjectFolder
from app.services import storage
from app.services.ai_provider import embed_batch, get_embedding_metadata
from app.services.chroma import get_subject_collection
from docx import Document as DocxDocument
from docx.oxml.ns import qn

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100


def _extract_pdf_text(path) -> list[tuple[int, str]]:
    """Returns list of (page_number, page_text) tuples, 1-indexed pages."""
    pages: list[tuple[int, str]] = []
    with fitz.open(path) as doc:
        for i, page in enumerate(doc):
            pages.append((i + 1, page.get_text()))
    return pages



def _is_list_item(para) -> bool:
    pPr = para._p.pPr
    if pPr is None:
        return False
    return pPr.find(qn("w:numPr")) is not None


def _looks_like_heading(para) -> bool:
    """Two signals, in order of reliability:
    1. Real Word Heading styles (Heading 1, Heading 2, ...) — used when
       the source document is properly structured.
    2. Fallback heuristic: a paragraph is treated as a section break if
       EVERY run in it is bold AND it is not itself a bulleted/numbered
       list item. This catches the common case of study notes where
       headings are just bolded lines rather than real Heading styles,
       while avoiding false positives on bolded terms inside bullet
       lists (e.g. "Residencia", "Visitador" as list items under a real
       bolded section header).

    Known limitation: sub-headers that are themselves formatted as list
    items (e.g. a bolded sub-topic one indent level in) will merge into
    their parent section rather than starting a new one. Acceptable
    granularity trade-off for Week 4 scope — revisit only if traceability
    UI feedback (Week 9) shows this is too coarse in practice.
    """
    style_name = (para.style.name or "") if para.style else ""
    if style_name.startswith("Heading"):
        return True

    if _is_list_item(para):
        return False

    runs = para.runs
    return bool(runs) and all(r.bold for r in runs)


def _extract_docx_text(path) -> list[tuple[int, str]]:
    """Returns list of (section_number, section_text) tuples, 1-indexed.

    DOCX has no native page concept — page breaks are a rendering-time
    artifact, not stored per-paragraph. So unlike PDF's real page numbers,
    'section_number' here is a heading-based counter (see
    _looks_like_heading for detection logic). Documents with no detected
    headings at all become a single section (1). Distinguished from PDF's
    real page numbers via MaterialChunk.locator_type ('section' vs 'page').

    Table content is NOT extracted in this pass — paragraphs only, same
    "minimal scope, revisit later" approach as PDF cleaning/chunking.
    """
    doc = DocxDocument(path)
    sections: list[tuple[int, str]] = []
    current_section = 0
    current_lines: list[str] = []

    def flush():
        nonlocal current_section, current_lines
        if current_lines:
            current_section += 1
            sections.append((current_section, "\n".join(current_lines)))
        current_lines = []

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        if _looks_like_heading(para):
            flush()
        current_lines.append(text)

    flush()
    return sections


def _clean_text(text: str) -> str:
    """Minimal cleaning per Week 4 scope: collapse whitespace, strip empty
    lines. No header/footer or hyphenation heuristics yet — revisit once
    the LLM spike report informs whether it's actually needed.
    """
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def process_material(material_id) -> None:
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

            if extension not in (".pdf", ".docx"):
                raise NotImplementedError(
                    f"Extraction for '{extension}' files is not yet implemented. "
                    "Only PDF and DOCX are supported."
                )

            # --- Extract ---
            material.upload_status = "extracting"
            db.commit()

            if extension == ".pdf":
                pages = _extract_pdf_text(file_path)
                locator_type = "page"
            else:
                pages = _extract_docx_text(file_path)
                locator_type = "section"

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
            embedding_meta = get_embedding_metadata()
            collection = get_subject_collection(
                subject_id=subject_id,
                embedding_model=embedding_meta["embedding_model"],
                embedding_dimension=embedding_meta["embedding_dimension"],
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
                        "locator_type": locator_type,
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
                        locator_type=locator_type,
                        chroma_vector_id=chroma_ids[i],
                        embedding_model=embedding_meta["embedding_model"],
                        embedding_dimension=embedding_meta["embedding_dimension"],
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