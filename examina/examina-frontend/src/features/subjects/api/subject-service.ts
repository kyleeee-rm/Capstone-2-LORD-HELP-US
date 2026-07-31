import api from '@/shared/api/client';
import type { Subject, SubjectCreate } from '@/shared/types/domain';

export async function getSubjects(signal?: AbortSignal): Promise<Subject[]> {
  const res = await api.get<Subject[]>('/subjects', { signal });
  return res.data;
}

export async function createSubject(payload: SubjectCreate): Promise<Subject> {
  const res = await api.post<Subject>('/subjects', payload);
  return res.data;
}
