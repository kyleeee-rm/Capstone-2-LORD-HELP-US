import { useState, useEffect, useCallback } from 'react';
import { getMaterials, uploadMaterial, type MaterialListItem } from '../api/material-service';

export function useMaterials(folderId: string) {
  const [materials, setMaterials] = useState<MaterialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMaterials(folderId, controller.signal)
      .then(setMaterials)
      .catch(() => {
        if (!controller.signal.aborted) {
          setMaterials([]);
          setError("Failed to load materials.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [folderId, fetchKey]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setFetchKey((k) => k + 1);
  }, []);

  return { materials, loading, error, refetch, uploadMaterial };
}
