import { useState, useEffect, useCallback } from 'react';
import { getSubjects, createSubject } from '../api/subject-service';
import type { Subject, SubjectCreate } from '@/shared/types/domain';
import { useActivityStore } from '@/shared/stores';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);
  const addActivity = useActivityStore((s) => s.addActivity);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getSubjects(controller.signal)
      .then(setSubjects)
      .catch(() => { if (!controller.signal.aborted) setSubjects([]); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [fetchKey]);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  const addSubject = useCallback(async (payload: SubjectCreate) => {
    await createSubject(payload);
    addActivity({
      action: 'created',
      type: 'subject',
      name: `${payload.subject_code} - ${payload.subject_name}`,
    });
    refetch();
  }, [refetch, addActivity]);

  const archiveSubjects = useCallback((ids: Set<string>) => {
    setSubjects((prev) =>
      prev.map((s) => ids.has(s.subject_id) ? { ...s, _archived: true } : s)
    );
    ids.forEach((id) => {
      const subject = subjects.find((s) => s.subject_id === id);
      if (subject) {
        addActivity({
          action: 'archived',
          type: 'subject',
          name: `${subject.subject_code} - ${subject.subject_name}`,
        });
      }
    });
  }, [subjects, addActivity]);

  const deleteSubjects = useCallback((ids: Set<string>) => {
    setSubjects((prev) => prev.filter((s) => !ids.has(s.subject_id)));
    ids.forEach((id) => {
      const subject = subjects.find((s) => s.subject_id === id);
      if (subject) {
        addActivity({
          action: 'deleted',
          type: 'subject',
          name: `${subject.subject_code} - ${subject.subject_name}`,
        });
      }
    });
  }, [subjects, addActivity]);

  const restoreSubjects = useCallback((ids: Set<string>) => {
    ids.forEach((id) => {
      const subject = subjects.find((s) => s.subject_id === id);
      if (subject) {
        addActivity({
          action: 'restored',
          type: 'subject',
          name: `${subject.subject_code} - ${subject.subject_name}`,
        });
      }
    });
    refetch();
  }, [subjects, addActivity, refetch]);

  return {
    subjects,
    loading,
    refetch,
    addSubject,
    archiveSubjects,
    deleteSubjects,
    restoreSubjects,
  };
}
