export type Subject = {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  course: string;
  section: string;
  semester: string;
  academic_year: string;
};

export type SubjectCreate = {
  subject_code: string;
  subject_name: string;
  course: string;
  section: string;
  semester: string;
  academic_year: string;
};

export type SubjectFolder = {
  folder_id: string;
  subject_id: string;
  folder_name: string;
  description?: string;
};

export type SubjectFolderCreate = {
  subject_id: string;
  folder_name: string;
};

export type MaterialListItem = {
  id: string;
  filename: string;
  status: string;
};

export type Activity = {
  id: string;
  action: string;
  type: string;
  name: string;
  timestamp: number;
};
