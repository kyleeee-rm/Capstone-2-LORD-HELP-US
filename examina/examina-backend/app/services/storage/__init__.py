"""Storage boundary. Everything outside this package should call only
save_upload_stream() / get_absolute_path() / delete_file() — never touch
local disk paths directly. If this ever moves to S3-style object storage,
only local_disk.py changes; storage_path just becomes an object key instead
of a filesystem path, and callers don't notice. Same philosophy as
app/services/ai_provider/ (see AI_PROVIDER_ABSTRACTION.md)."""

from .local_disk import delete_file, get_absolute_path, save_upload_stream

__all__ = ["save_upload_stream", "get_absolute_path", "delete_file"]
