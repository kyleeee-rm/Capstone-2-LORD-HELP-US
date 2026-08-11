import {create} from "zustand";
import {
	getSubjects,
	createSubject,
	updateSubject,
	archiveSubject,
	deleteSubject,
} from "@/features/subjects/api/subject-service";
import {getAllFolders} from "@/features/subjects/api/subject-folder-service";
import {getMaterials} from "@/features/materials/api/material-service";
import {useActivityStore} from "@/shared/stores";
import type {
	Subject,
	SubjectCreate,
	SubjectUpdate,
} from "@/shared/types/domain";

type SubjectState = {
	subjects: Subject[];
	fileCounts: Record<string, number>;
	loading: boolean;
	error: string | null;
	fetchSubjects: () => Promise<void>;
	addSubject: (payload: SubjectCreate) => Promise<void>;
	editSubject: (id: string, payload: SubjectUpdate) => Promise<void>;
	archiveSubjectAction: (id: string) => Promise<void>;
	removeSubject: (id: string) => Promise<void>;
};

export const useSubjectStore = create<SubjectState>((set, get) => ({
	subjects: [],
	fileCounts: {},
	loading: true,
	error: null,

	fetchSubjects: async () => {
		set({loading: true, error: null});
		try {
			const subjects = await getSubjects(false);
			const folders = await getAllFolders().catch(() => []);

			const fileCounts: Record<string, number> = {};

			for (const subject of subjects) {
				const subjectFolders = folders.filter(
					(f) => f.subject_id === subject.subject_id,
				);
				let totalFiles = 0;
				for (const folder of subjectFolders) {
					try {
						const materials = await getMaterials(folder.folder_id);
						totalFiles += materials.length;
					} catch {
						// ignore errors for individual folders
					}
				}
				fileCounts[subject.subject_id] = totalFiles;
			}

			set({subjects, fileCounts, loading: false});
		} catch {
			set({loading: false, error: "Failed to load subjects."});
		}
	},

	addSubject: async (payload) => {
		set({error: null});
		try {
			const created = await createSubject(payload);
			set((s) => ({
				subjects: [created, ...s.subjects],
				fileCounts: {...s.fileCounts, [created.subject_id]: 0},
			}));
			useActivityStore.getState().addActivity({
				action: "created",
				type: "subject",
				name: `${created.subject_code} - ${created.subject_name}`,
				href: `/subjects/${created.subject_id}`,
			});
		} catch (err) {
			set({error: "Failed to create subject."});
			throw err;
		}
	},

	editSubject: async (id, payload) => {
		set({error: null});
		try {
			const updated = await updateSubject(id, payload);
			set((s) => ({
				subjects: s.subjects.map((subject) =>
					subject.subject_id === id ? {...subject, ...updated} : subject,
				),
			}));
			useActivityStore.getState().addActivity({
				action: "updated",
				type: "subject",
				name: `${updated.subject_code} - ${updated.subject_name}`,
				href: `/subjects/${id}`,
			});
		} catch (err) {
			set({error: "Failed to update subject."});
			throw err;
		}
	},

	archiveSubjectAction: async (id) => {
		set({error: null});
		try {
			const subject = get().subjects.find((s) => s.subject_id === id);
			await archiveSubject(id);
			set((s) => ({
				subjects: s.subjects.filter((subject) => subject.subject_id !== id),
				fileCounts: Object.fromEntries(
					Object.entries(s.fileCounts).filter(([key]) => key !== id),
				),
			}));
			if (subject) {
				useActivityStore.getState().addActivity({
					action: "archived",
					type: "subject",
					name: `${subject.subject_code} - ${subject.subject_name}`,
				});
			}
		} catch (err) {
			set({error: "Failed to archive subject."});
			throw err;
		}
	},

	removeSubject: async (id) => {
		set({error: null});
		try {
			const subject = get().subjects.find((s) => s.subject_id === id);
			await deleteSubject(id);
			set((s) => ({
				subjects: s.subjects.filter((subject) => subject.subject_id !== id),
				fileCounts: Object.fromEntries(
					Object.entries(s.fileCounts).filter(([key]) => key !== id),
				),
			}));
			if (subject) {
				useActivityStore.getState().addActivity({
					action: "deleted",
					type: "subject",
					name: `${subject.subject_code} - ${subject.subject_name}`,
				});
			}
		} catch (err) {
			set({error: "Failed to delete subject."});
			throw err;
		}
	},
}));
