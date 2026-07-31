import { useState, useEffect, useCallback } from 'react';
import { getFolders, createFolder } from '../api/subject-folder-service';
import type { SubjectFolder, SubjectFolderCreate } from '@/shared/types/domain';

export function useSubjectFolders(subjectId: string | undefined) {
  const [folders, setFolders] = useState<SubjectFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!subjectId) return;
    const controller = new AbortController();
    setLoading(true);
    getFolders(subjectId, controller.signal)
      .then(setFolders)
      .catch(() => { if (!controller.signal.aborted) setFolders([]); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [subjectId, fetchKey]);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  const addFolder = useCallback(async (payload: SubjectFolderCreate) => {
    await createFolder(payload);
    refetch();
  }, [refetch]);

  return { folders, loading, refetch, addFolder };
}
