// src/services/materialService.ts
import api from "../api/axios";

export const getMaterials = async (subjectId: string) => {
  const res = await api.get("/materials", { params: { subject_id: subjectId } });
  return res.data;
};

export const deleteMaterial = async (materialId: string) => {
  const res = await api.delete(`/materials/${materialId}`);
  return res.data;
};
export const uploadMaterial = async (
  subjectId: string,
  file: File,
  onUploadProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject_id", subjectId);

  const res = await api.post("/materials/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (event.total && onUploadProgress) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onUploadProgress(percent);
      }
    },
  });

  return res.data;
};