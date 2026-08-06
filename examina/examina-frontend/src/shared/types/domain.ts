export type YearLevel = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";

export type Subject = {
	subject_id: string;
	subject_code: string;
	subject_name: string;
	course: string;
	year_level: YearLevel;
	semester: string;
	academic_year: string;
};

export type SubjectCreate = {
	subject_code: string;
	subject_name: string;
	course: string;
	year_level: YearLevel;
	semester: string;
	academic_year: string;
};

export type SubjectUpdate = Partial<SubjectCreate>;

export type SubjectFolder = {
	folder_id: string;
	subject_id: string;
	folder_name: string;
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
