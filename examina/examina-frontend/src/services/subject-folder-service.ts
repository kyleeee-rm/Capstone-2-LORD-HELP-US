import api from "../api/axios";

export type SubjectFolder = {
  folder_id: string;
  subject_id: string;
  folder_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type SubjectFolderCreate = {
  subject_id: string;
  folder_name: string;
  description?: string;
};

export const getFolders = async (subjectId?: string): Promise<SubjectFolder[]> => {
  const res = await api.get<SubjectFolder[]>("/subject-folders", {
    params: subjectId ? { subject_id: subjectId } : undefined,
  });
  return res.data;
};

export const createFolder = async (payload: SubjectFolderCreate): Promise<SubjectFolder> => {
  const res = await api.post<SubjectFolder>("/subject-folders", payload);
  return res.data;
};
