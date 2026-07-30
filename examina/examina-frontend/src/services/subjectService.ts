import api from "../api/axios";

export type Subject = {
  subject_id: string;
  faculty_id: string;
  subject_code: string;
  subject_name: string;
  course: string;
  section: string;
  semester: string;
  academic_year: string;
  created_at: string;
  updated_at: string;
};

export type SubjectCreate = {
  subject_code: string;
  subject_name: string;
  course: string;
  section: string;
  semester: string;
  academic_year: string;
};

export const getSubjects = async (): Promise<Subject[]> => {
  const res = await api.get<Subject[]>("/subjects");
  return res.data;
};

export const createSubject = async (payload: SubjectCreate): Promise<Subject> => {
  const res = await api.post<Subject>("/subjects", payload);
  return res.data;
};
