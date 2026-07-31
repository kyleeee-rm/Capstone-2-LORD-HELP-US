import api from '@/shared/api/client';
import type { SubjectFolder, SubjectFolderCreate } from '@/shared/types/domain';

export async function getFolders(subjectId: string, signal?: AbortSignal): Promise<SubjectFolder[]> {
  const res = await api.get<SubjectFolder[]>(`/subjects/${subjectId}/folders`, { signal });
  return res.data;
}

export async function createFolder(payload: SubjectFolderCreate): Promise<SubjectFolder> {
  const res = await api.post<SubjectFolder>(`/subjects/${payload.subject_id}/folders`, payload);
  return res.data;
}
