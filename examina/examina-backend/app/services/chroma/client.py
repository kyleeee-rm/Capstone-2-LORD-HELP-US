from typing import Optional
from urllib.parse import urlparse

import chromadb

from app.core.config import settings

_client: Optional["chromadb.ClientAPI"] = None


def get_client():
    """Lazy singleton — one ChromaDB client shared across the process."""
    global _client
    if _client is None:
        parsed = urlparse(settings.CHROMA_URL)
        _client = chromadb.HttpClient(host=parsed.hostname, port=parsed.port)
    return _client


def get_subject_collection(subject_id: str, embedding_model: str, embedding_dimension: int):
    """One ChromaDB collection per Subject. Tagged with embedding_model +
    embedding_dimension metadata per AI_PROVIDER_ABSTRACTION.md's checklist,
    so mismatched vectors (e.g. after a provider switch) are detectable.
    """
    client = get_client()
    collection_name = f"subject_{subject_id}"
    return client.get_or_create_collection(
        name=collection_name,
        metadata={
            "embedding_model": embedding_model,
            "embedding_dimension": embedding_dimension,
        },
    )