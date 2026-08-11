import axios from "axios";
import api from "@/shared/api/client";
import type {
	Subject,
	SubjectCreate,
	SubjectUpdate,
	SubjectFolder,
} from "@/shared/types/domain";

// ---------- API Functions ----------

// Get all subjects
export const getSubjects = async (archived?: boolean): Promise<Subject[]> => {
	const response = await api.get<BackendSubject[]>("/subjects", {
		params: archived !== undefined ? { archived } : undefined,
	});
	return response.data.map(normalizeSubject);
};

// Get a single subject by ID
export const getSubjectById = async (
	subjectId: string,
): Promise<Subject | null> => {
	try {
		const response = await api.get<BackendSubject>(`/subjects/${subjectId}`);
		return normalizeSubject(response.data);
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return null;
		}
		throw error;
	}
};

// Create a new subject
// NOTE: the backend API still uses the `year_level` field internally. To keep the
// frontend `Subject` shape using `section`, we transparently map `section` to
// `year_level` in outgoing payloads and back when normalizing responses.
export const createSubject = async (
	payload: SubjectCreate,
): Promise<Subject> => {
	const {section, ...rest} = payload;
	const response = await api.post<Subject>("/subjects", {
		...rest,
		year_level: section,
	});
	return normalizeSubject(response.data);
};

// Update an existing subject
export const updateSubject = async (
	id: string,
	payload: SubjectUpdate,
): Promise<Subject> => {
	const {section, ...rest} = payload;
	const response = await api.put<Subject>(`/subjects/${id}`, {
		...rest,
		...(section !== undefined ? {year_level: section} : {}),
	});
	return normalizeSubject(response.data);
};

// Internal: coerce a backend subject (`year_level` field) to the frontend `Subject` shape (`section`).
type BackendSubject = Subject & {year_level?: string};
function normalizeSubject(data: Subject): Subject {
	const raw = data as BackendSubject;
	const {year_level, ...rest} = raw;
	return year_level !== undefined ? {...rest, section: year_level} : rest;
}

//archive a subject
export const archiveSubject = async (id: string): Promise<void> => {
	await api.patch(`/subjects/${id}/archive`);
};

//restore a subject
export const restoreSubject = async (id: string): Promise<void> => {
	await api.patch(`/subjects/${id}/restore`);
};

// Delete a subject
export const deleteSubject = async (id: string): Promise<void> => {
	await api.delete(`/subjects/${id}`);
};

// Create a new folder inside a subject
export const createFolder = async (
	subjectId: string,
	folderName: string,
	description?: string,
): Promise<SubjectFolder> => {
	const response = await api.post<SubjectFolder>(
		`/subjects/${subjectId}/folders`,
		{
			folder_name: folderName,
			description,
		},
	);
	return response.data;
};

// Get a specific folder with its materials
export const getFolderById = async (
	subjectId: string,
	folderId: string,
): Promise<SubjectFolder | null> => {
	try {
		const response = await api.get<SubjectFolder>(
			`/subjects/${subjectId}/folders/${folderId}`,
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return null;
		}
		throw error;
	}
};

// Update a folder
export const updateFolder = async (
	subjectId: string,
	folderId: string,
	payload: {folder_name: string; description?: string},
): Promise<SubjectFolder> => {
	const response = await api.put<SubjectFolder>(
		`/subjects/${subjectId}/folders/${folderId}`,
		payload,
	);
	return response.data;
};

// Delete a folder
export const deleteFolder = async (
	subjectId: string,
	folderId: string,
): Promise<void> => {
	await api.delete(`/subjects/${subjectId}/folders/${folderId}`);
};

// Upload a file to a folder
export const uploadFile = async (
	subjectId: string,
	folderId: string,
	file: File,
	onProgress?: (progress: number) => void,
): Promise<{id: string; name: string; size: string; uploadedAt: string}> => {
	const formData = new FormData();
	formData.append("file", file);

	const response = await api.post<{
		id: string;
		name: string;
		size: string;
		uploadedAt: string;
	}>(`/subjects/${subjectId}/folders/${folderId}/files`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
		onUploadProgress: (progressEvent) => {
			if (onProgress && progressEvent.total) {
				const percentCompleted = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total,
				);
				onProgress(percentCompleted);
			}
		},
	});
	return response.data;
};

// Delete a file from a folder
export const deleteFile = async (
	subjectId: string,
	folderId: string,
	fileId: string,
): Promise<void> => {
	await api.delete(
		`/subjects/${subjectId}/folders/${folderId}/files/${fileId}`,
	);
};

// Generate questions for a folder
export const generateQuestions = async (
	subjectId: string,
	folderId: string,
	payload: {count: number; difficulty?: string; topics?: string[]},
): Promise<{jobId: string; status: string}> => {
	const response = await api.post<{jobId: string; status: string}>(
		`/subjects/${subjectId}/folders/${folderId}/generate`,
		payload,
	);
	return response.data;
};

type GeneratedQuestion = {
	id: string;
	text: string;
	status: "active" | "archived";
	createdAt: string;
};

// Get generated questions for a folder
export const getGeneratedQuestions = async (
	subjectId: string,
	folderId: string,
): Promise<GeneratedQuestion[]> => {
	const response = await api.get<GeneratedQuestion[]>(
		`/subjects/${subjectId}/folders/${folderId}/questions`,
	);
	return response.data;
};

// Update a question
export const updateQuestion = async (
	subjectId: string,
	folderId: string,
	questionId: string,
	payload: {text: string; status?: "active" | "archived"},
): Promise<GeneratedQuestion> => {
	const response = await api.put<GeneratedQuestion>(
		`/subjects/${subjectId}/folders/${folderId}/questions/${questionId}`,
		payload,
	);
	return response.data;
};

// Delete a question
export const deleteQuestion = async (
	subjectId: string,
	folderId: string,
	questionId: string,
): Promise<void> => {
	await api.delete(
		`/subjects/${subjectId}/folders/${folderId}/questions/${questionId}`,
	);
};

export const getSubject = getSubjectById;
