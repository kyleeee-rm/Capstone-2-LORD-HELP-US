import api from '@/shared/api/client';
import type { MaterialListItem } from '@/shared/types/domain';

export type { MaterialListItem };

export type MaterialUploadResponse = {
  id: string;
  filename: string;
};

export type MaterialStatusResponse = {
  id: string;
  status: string;
  progress?: number;
};

type MaterialsResponse = {
  materials: MaterialListItem[];
};

export async function getMaterials(
  folderId: string,
  signal?: AbortSignal,
): Promise<MaterialListItem[]> {

  const res = await api.get<MaterialsResponse>(
    `/subject-folders/${folderId}/materials`,
    { signal }
  );

  return res.data.materials;
}

export async function uploadMaterial(
  folderId: string,
  file: File,
  meta: { title: string; description: string; teaching_hours: number },
  onProgress?: (p: number) => void
): Promise<MaterialUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', meta.title);
  formData.append('description', meta.description);
  formData.append('teaching_hours', String(meta.teaching_hours));

  const res = await api.post(
  `/subject-folders/${folderId}/materials`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data;
}

export async function getMaterialStatus(
  folderId: string,
  materialId: string,
): Promise<MaterialStatusResponse> {
  const res = await api.get<MaterialStatusResponse>(
    `/subject-folders/${folderId}/materials/${materialId}/status`
  );

  return res.data;
}
