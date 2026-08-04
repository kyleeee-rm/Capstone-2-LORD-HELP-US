import { useState, useEffect, useCallback } from 'react';
import { getFolders, createFolder } from '../api/subject-folder-service';
import type { SubjectFolder, SubjectFolderCreate } from '@/shared/types/domain';

export function useSubjectFolders(subjectId: string | undefined) {
  const [folders, setFolders] = useState<SubjectFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!subjectId) return;
    const controller = new AbortController();
    getFolders(subjectId, controller.signal)
      .then(setFolders)
      .catch(() => {
        if (!controller.signal.aborted) {
          setFolders([]);
          setError("Failed to load folders.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [subjectId, fetchKey]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setFetchKey((k) => k + 1);
  }, []);

  const addFolder = useCallback(async (payload: SubjectFolderCreate) => {
    await createFolder(payload);
    refetch();
  }, [refetch]);

  const removeFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.folder_id !== folderId));
  }, []);

  return { folders, loading, error, refetch, addFolder, removeFolder };
}
