import axios from "axios";
import type {
	Subject,
	SubjectCreate,
	SubjectUpdate,
	SubjectFolder,
} from "@/shared/types/domain";

// ---------- Axios Client ----------
const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for auth token (if needed)
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		// Handle 401 unauthorized (redirect to login)
		if (error.response?.status === 401) {
			localStorage.removeItem("access_token");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

// ---------- API Functions ----------

// Get all subjects with folders and materials
export const getSubjects = async (): Promise<Subject[]> => {
	const response = await apiClient.get<Subject[]>("/subjects");
	return response.data.map((subject) => ({
		...subject,
		description: subject.description ?? "",
		folders: subject.folders ?? [],
	}));
};

// Get a single subject by ID with its folders and materials
export const getSubjectById = async (
	subjectId: string,
): Promise<Subject | null> => {
	try {
		const response = await apiClient.get<Subject>(`/subjects/${subjectId}`);
		return {
			...response.data,
			description: response.data.description ?? "",
			folders: response.data.folders ?? [],
		};
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return null;
		}
		throw error;
	}
};

// Create a new subject
export const createSubject = async (
	payload: SubjectCreate,
): Promise<Subject> => {
	const response = await apiClient.post<Subject>("/subjects", payload);
	return {
		...response.data,
		description: response.data.description ?? "",
		folders: response.data.folders ?? [],
	};
};

// Update an existing subject
export const updateSubject = async (
	id: string,
	payload: SubjectUpdate,
): Promise<Subject> => {
	const response = await apiClient.put<Subject>(`/subjects/${id}`, payload);
	return {
		...response.data,
		description: response.data.description ?? "",
		folders: response.data.folders ?? [],
	};
};

// Delete a subject
export const deleteSubject = async (id: string): Promise<void> => {
	await apiClient.delete(`/subjects/${id}`);
};

// Create a new folder inside a subject
export const createFolder = async (
	subjectId: string,
	folderName: string,
	description?: string,
): Promise<SubjectFolder> => {
	const response = await apiClient.post<SubjectFolder>(
		`/subjects/${subjectId}/folders`,
		{
			folder_name: folderName,
			description,
		},
	);
	return {
		...response.data,
		description: response.data.description ?? "",
		materials: response.data.materials ?? [],
	};
};

// Get a specific folder with its materials
export const getFolderById = async (
	subjectId: string,
	folderId: string,
): Promise<SubjectFolder | null> => {
	try {
		const response = await apiClient.get<SubjectFolder>(
			`/subjects/${subjectId}/folders/${folderId}`,
		);
		return {
			...response.data,
			description: response.data.description ?? "",
			materials: response.data.materials ?? [],
		};
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
	const response = await apiClient.put<SubjectFolder>(
		`/subjects/${subjectId}/folders/${folderId}`,
		payload,
	);
	return {
		...response.data,
		description: response.data.description ?? "",
		materials: response.data.materials ?? [],
	};
};

// Delete a folder
export const deleteFolder = async (
	subjectId: string,
	folderId: string,
): Promise<void> => {
	await apiClient.delete(`/subjects/${subjectId}/folders/${folderId}`);
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

	const response = await apiClient.post<{
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
	await apiClient.delete(
		`/subjects/${subjectId}/folders/${folderId}/files/${fileId}`,
	);
};

// Generate questions for a folder
export const generateQuestions = async (
	subjectId: string,
	folderId: string,
	payload: {count: number; difficulty?: string; topics?: string[]},
): Promise<{jobId: string; status: string}> => {
	const response = await apiClient.post<{jobId: string; status: string}>(
		`/subjects/${subjectId}/folders/${folderId}/generate`,
		payload,
	);
	return response.data;
};

// Get generated questions for a folder
export const getGeneratedQuestions = async (
	subjectId: string,
	folderId: string,
): Promise<
	Array<{
		id: string;
		text: string;
		status: "active" | "archived";
		createdAt: string;
	}>
> => {
	const response = await apiClient.get<
		Array<{
			id: string;
			text: string;
			status: "active" | "archived";
			createdAt: string;
		}>
	>(`/subjects/${subjectId}/folders/${folderId}/questions`);
	return response.data;
};

// Update a question
export const updateQuestion = async (
	subjectId: string,
	folderId: string,
	questionId: string,
	payload: {text: string; status?: "active" | "archived"},
): Promise<{
	id: string;
	text: string;
	status: "active" | "archived";
	createdAt: string;
}> => {
	const response = await apiClient.put<{
		id: string;
		text: string;
		status: "active" | "archived";
		createdAt: string;
	}>(
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
	await apiClient.delete(
		`/subjects/${subjectId}/folders/${folderId}/questions/${questionId}`,
	);
};

export const getSubject = getSubjectById;
