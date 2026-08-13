import uuid

from pydantic import BaseModel


class RetrievedChunk(BaseModel):
    chunk_id: uuid.UUID
    material_id: uuid.UUID
    content: str
    page_number: int
    locator_type: str
    # Raw distance as returned by ChromaDB (lower = more similar for the
    # default L2 space). Not converted to a 0-1 "similarity score" since
    # the collection doesn't explicitly configure hnsw:space - converting
    # without knowing the real index metric would be a guess dressed up
    # as a number. Revisit if a normalized score is needed later.
    distance: float


class RetrievalResponse(BaseModel):
    subject_id: uuid.UUID
    query: str
    results: list[RetrievedChunk]