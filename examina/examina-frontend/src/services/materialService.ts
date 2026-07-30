import api from "../api/axios";

export type MaterialListItem = {
  id: string;
  filename: string;
  lesson_label: string | null;
  status: string;
  chunk_count: number;
  uploaded_at: string;
};

export type MaterialUploadResponse = {
  id: string;
  folder_id: string;
  filename: string;
  lesson_label: string | null;
  title: string;
  description: string;
  teaching_hours: number;
  status: string;
  uploaded_at: string;
};

export type MaterialStatusResponse = {
  id: string;
  status: string;
  progress_pct: number;
};

export const getMaterials = async (folderId: string) => {
  const res = await api.get<{ materials: MaterialListItem[] }>(
    `/subject-folders/${folderId}/materials`
  );
  return res.data.materials;
};

export const uploadMaterial = async (
  folderId: string,
  file: File,
  metadata: { title: string; description: string; teaching_hours: number; lesson_label?: string },
  onUploadProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", metadata.title);
  formData.append("description", metadata.description);
  formData.append("teaching_hours", String(metadata.teaching_hours));
  if (metadata.lesson_label) {
    formData.append("lesson_label", metadata.lesson_label);
  }

  const res = await api.post<MaterialUploadResponse>(
    `/subject-folders/${folderId}/materials`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total && onUploadProgress) {
          onUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    }
  );

  return res.data;
};

export const getMaterialStatus = async (folderId: string, materialId: string) => {
  const res = await api.get<MaterialStatusResponse>(
    `/subject-folders/${folderId}/materials/${materialId}/status`
  );
  return res.data;
};
