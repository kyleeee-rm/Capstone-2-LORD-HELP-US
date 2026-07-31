import api from '@/shared/api/client';
import type { SubjectFolder, SubjectFolderCreate } from '@/shared/types/domain';

export async function getAllFolders(signal?: AbortSignal): Promise<SubjectFolder[]> {
  const res = await api.get<SubjectFolder[]>('/subject-folders', { signal });
  return res.data;
}

export async function getFolders(subjectId: string, signal?: AbortSignal): Promise<SubjectFolder[]> {
  const folders = await getAllFolders(signal);
  return folders.filter((folder) => folder.subject_id === subjectId);
}

export async function createFolder(payload: SubjectFolderCreate): Promise<SubjectFolder> {
  const res = await api.post<SubjectFolder>(`/subjects/${payload.subject_id}/folders`, payload);
  return res.data;
}
