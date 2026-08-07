import {create} from "zustand";
import {
	getSubjects,
	createSubject,
	updateSubject,
	archiveSubject,
	restoreSubject,
	deleteSubject,
} from "@/features/subjects/api/subject-service";
import {useActivityStore} from "@/shared/stores";
import type {
	Subject,
	SubjectCreate,
	SubjectUpdate,
} from "@/shared/types/domain";

function mockFileCount(subjectId: string): number {
	let hash = 0;
	for (let i = 0; i < subjectId.length; i++) {
		hash = (hash * 31 + subjectId.charCodeAt(i)) % 1000;
	}
	return hash % 8;
}

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
			const subjects = await getSubjects();
			console.log("Fetched subjects:", subjects);
			const fileCounts: Record<string, number> = {};
			for (const subject of subjects) {
				fileCounts[subject.subject_id] = mockFileCount(subject.subject_id);
			}
			set({subjects, fileCounts, loading: false});
		} catch {
			set({loading: false, error: "Failed to load subjects."});
		}
	},

	addSubject: async (payload) => {
		const created = await createSubject(payload);
		set((s) => ({
			subjects: [created, ...s.subjects],
			fileCounts: {
				...s.fileCounts,
				[created.subject_id]: mockFileCount(created.subject_id),
			},
		}));
		useActivityStore.getState().addActivity({
			action: "created",
			type: "subject",
			name: `${created.subject_code} - ${created.subject_name}`,
			href: `/subjects/${created.subject_id}`,
		});
	},

	editSubject: async (id, payload) => {
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
	},

	archiveSubjectAction: async (id) => {
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
	},

	removeSubject: async (id) => {
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
	},
}));
