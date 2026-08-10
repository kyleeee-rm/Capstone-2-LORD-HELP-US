import api from "@/shared/api/client";
import type {SubjectFolder, SubjectFolderCreate} from "@/shared/types/domain";

export type SubjectFolderUpdate = {
	folder_name: string;
};

export async function getAllFolders(
	signal?: AbortSignal,
): Promise<SubjectFolder[]> {
	const res = await api.get<SubjectFolder[]>("/subject-folders", {signal});
	return res.data;
}

export async function getFolders(
	subjectId: string,
	signal?: AbortSignal,
): Promise<SubjectFolder[]> {
	const res = await api.get<SubjectFolder[]>("/subject-folders", {
		signal,
	});

	return res.data.filter((folder) => folder.subject_id === subjectId);
}

export async function createFolder(
	payload: SubjectFolderCreate,
): Promise<SubjectFolder> {
	const res = await api.post<SubjectFolder>("/subject-folders", payload);

	return res.data;
}

export async function updateFolder(
	folderId: string,
	payload: SubjectFolderUpdate,
): Promise<SubjectFolder> {
	const res = await api.put<SubjectFolder>(
		`/subject-folders/${folderId}`,
		payload,
	);
	return res.data;
}

export async function deleteFolder(
	folderId: string,
): Promise<{message: string}> {
	const res = await api.delete<{message: string}>(
		`/subject-folders/${folderId}`,
	);
	return res.data;
}
