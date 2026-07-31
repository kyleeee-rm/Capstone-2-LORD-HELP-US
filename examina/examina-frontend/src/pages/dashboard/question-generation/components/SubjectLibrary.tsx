import {useState} from "react";
import {useSubjects} from "@/features/subjects";
import {useNavigate} from "react-router-dom";
import {useSelectMode} from "@/shared/hooks";

type Tab = "all" | "archived";

export default function SubjectLibrary() {
	const {
		subjects,
		addSubject,
		archiveSubjects,
		deleteSubjects,
		restoreSubjects,
	} = useSubjects();
	const [activeTab, setActiveTab] = useState<Tab>("all");
	const [showForm, setShowForm] = useState(false);
	const [subjectCode, setSubjectCode] = useState("");
	const [subjectName, setSubjectName] = useState("");
	const [course, setCourse] = useState("");
	const [section, setSection] = useState("");
	const [semester, setSemester] = useState("");
	const [academicYear, setAcademicYear] = useState("");
	const {selectMode, setSelectMode, selectedIds, toggleSelect, clearSelection} =
		useSelectMode();
	const navigate = useNavigate();

	const handleCreate = async () => {
		if (!subjectCode.trim() || !subjectName.trim()) return;
		await addSubject({
			subject_code: subjectCode.trim(),
			subject_name: subjectName.trim(),
			course: course.trim(),
			section: section.trim(),
			semester: semester.trim(),
			academic_year: academicYear.trim(),
		});
		setSubjectCode("");
		setSubjectName("");
		setCourse("");
		setSection("");
		setSemester("");
		setAcademicYear("");
		setShowForm(false);
	};

	const handleArchive = () => {
		archiveSubjects(selectedIds);
		clearSelection();
	};

	const handleDelete = async () => {
		await deleteSubjects(selectedIds);
		clearSelection();
	};

	const handleRestore = (ids: Set<string>) => {
		restoreSubjects(ids);
		clearSelection();
	};

	return (
		<div className="mx-auto w-full max-w-5xl">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
				<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
					Subject Library
				</h1>
				<div className="flex flex-wrap items-center gap-2">
					{selectMode ? (
						<>
							{activeTab === "archived" ? (
								<button
									onClick={() => handleRestore(selectedIds)}
									disabled={selectedIds.size === 0}
									className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50">
									Restore ({selectedIds.size})
								</button>
							) : (
								<button
									onClick={handleArchive}
									disabled={selectedIds.size === 0}
									className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50">
									Archive ({selectedIds.size})
								</button>
							)}
							{activeTab === "all" && (
								<button
									onClick={() => void handleDelete()}
									disabled={selectedIds.size === 0}
									className="rounded-full bg-error px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-50">
									Delete ({selectedIds.size})
								</button>
							)}
							<button
								onClick={clearSelection}
								className="rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
								Cancel
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => setShowForm(!showForm)}
								className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
								{showForm ? "Cancel" : "+ New Subject"}
							</button>
							{subjects.length > 0 && (
								<button
									onClick={() => setSelectMode(true)}
									className="rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
									Select
								</button>
							)}
						</>
					)}
				</div>
			</div>

			<div className="mb-4 flex gap-2 border-b border-border">
				<button
					onClick={() => {
						setActiveTab("all");
						clearSelection();
					}}
					className={`px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "all"
							? "border-b-2 border-primary text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}>
					All
				</button>
				<button
					onClick={() => {
						setActiveTab("archived");
						clearSelection();
					}}
					className={`px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "archived"
							? "border-b-2 border-primary text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}>
					Archived
				</button>
			</div>

			{showForm && (
				<div className="mb-6 rounded-xl border border-border bg-background p-4">
					<div className="flex flex-col gap-3">
						<input
							value={subjectCode}
							onChange={(e) => setSubjectCode(e.target.value)}
							placeholder="Subject code (e.g. CS101)"
							aria-label="Subject code"
							className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
						/>
						<input
							value={subjectName}
							onChange={(e) => setSubjectName(e.target.value)}
							placeholder="Subject name"
							aria-label="Subject name"
							className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
						/>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<input
								value={course}
								onChange={(e) => setCourse(e.target.value)}
								placeholder="Course"
								aria-label="Course"
								className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
							/>
							<input
								value={section}
								onChange={(e) => setSection(e.target.value)}
								placeholder="Section"
								aria-label="Section"
								className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
							/>
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<input
								value={semester}
								onChange={(e) => setSemester(e.target.value)}
								placeholder="Semester"
								aria-label="Semester"
								className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
							/>
							<input
								value={academicYear}
								onChange={(e) => setAcademicYear(e.target.value)}
								placeholder="Academic Year"
								aria-label="Academic year"
								className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
							/>
						</div>
						<button
							onClick={() => void handleCreate()}
							disabled={!subjectCode.trim() || !subjectName.trim()}
							className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
							Create Subject
						</button>
					</div>
				</div>
			)}

			<div className="flex flex-col gap-3">
				{subjects.length > 0 && (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
						{subjects.map((s) => (
							<button
								key={s.subject_id}
								onClick={() =>
									selectMode
										? toggleSelect(s.subject_id)
										: navigate(`/subjects/${s.subject_id}`)
								}
								className={`flex items-center gap-3 rounded-xl border bg-background p-4 text-left transition-colors ${
									selectedIds.has(s.subject_id)
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary"
								}`}>
								{selectMode && (
									<div
										className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 ${
											selectedIds.has(s.subject_id)
												? "border-primary bg-primary"
												: "border-foreground/20"
										}`}>
										{selectedIds.has(s.subject_id) && (
											<svg
												className="size-3 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={3}>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										)}
									</div>
								)}
								<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<svg
										className="size-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
										/>
									</svg>
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-foreground">
										{s.subject_code} - {s.subject_name}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{s.course} {s.section} | {s.semester} {s.academic_year}
									</p>
								</div>
								{!selectMode && (
									<svg
										className="size-5 shrink-0 text-muted-foreground"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								)}
							</button>
						))}
					</div>
				)}
				{subjects.length === 0 && activeTab === "all" && (
					<p className="py-12 text-center text-sm text-muted-foreground">
						No subjects yet. Create one above.
					</p>
				)}
				{subjects.length === 0 && activeTab === "archived" && (
					<p className="py-12 text-center text-sm text-muted-foreground">
						No archived subjects.
					</p>
				)}
			</div>
		</div>
	);
}
