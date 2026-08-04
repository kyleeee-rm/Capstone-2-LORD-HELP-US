import {useEffect, useId, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {Edit, Folder, MoreHorizontal, Plus, Search, Trash2} from "lucide-react";
import {Button} from "@/shared/ui/button";
import {Input} from "@/shared/ui/input";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import {Badge} from "@/shared/ui/badge";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {Skeleton} from "@/shared/ui/skeleton";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/shared/ui/empty";
import {Field, FieldContent, FieldError, FieldLabel} from "@/shared/ui/field";
import {toast} from "@/shared/ui/toast";
import {parseApiError} from "@/shared/lib/parse-api-error";
import {useSubjectStore} from "./subject-store";
import type {Subject, SubjectCreate, YearLevel} from "@/shared/types/domain";

function getDetailsHref(subjectId: string): string {
	return `/dashboard/questions-generation/${subjectId}`;
}

const YEAR_LEVELS: YearLevel[] = [
	"1st Year",
	"2nd Year",
	"3rd Year",
	"4th Year",
];

const EMPTY_FORM: SubjectCreate = {
	subject_code: "",
	subject_name: "",
	course: "",
	year_level: "1st Year",
	semester: "",
	academic_year: "",
};

export default function QuestionGeneration() {
	const {subjectId} = useParams<{subjectId: string}>();
	const navigate = useNavigate();

	const {
		subjects,
		fileCounts,
		loading,
		error: loadError,
		fetchSubjects,
		addSubject,
		editSubject,
		removeSubject,
	} = useSubjectStore();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Subject | null>(null);
	const [deleting, setDeleting] = useState<Subject | null>(null);
	const [form, setForm] = useState<SubjectCreate>(EMPTY_FORM);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");

	const currentSubject = subjects.find((s) => s.subject_id === subjectId);
	const baseId = useId();

	const filteredSubjects = subjects.filter((subject) => {
		const q = query.trim().toLowerCase();
		if (!q) return true;
		return (
			subject.subject_name.toLowerCase().includes(q) ||
			subject.subject_code.toLowerCase().includes(q)
		);
	});

	useEffect(() => {
		void fetchSubjects();
	}, [fetchSubjects]);

	const openCreate = () => {
		setEditing(null);
		setForm(EMPTY_FORM);
		setError("");
		setDialogOpen(true);
	};

	const openEdit = (subject: Subject) => {
		setEditing(subject);
		setForm({
			subject_code: subject.subject_code,
			subject_name: subject.subject_name,
			course: subject.course,
			year_level: subject.year_level,
			semester: subject.semester,
			academic_year: subject.academic_year,
		});
		setError("");
		setDialogOpen(true);
	};

	const setField = (key: keyof SubjectCreate, value: string) => {
		setForm((prev) => ({...prev, [key]: value}));
		if (error) setError("");
	};

	const submitForm = async () => {
		if (!form.subject_code.trim() || !form.subject_name.trim()) {
			setError("Subject code and name are required.");
			return;
		}
		try {
			if (editing) {
				await editSubject(editing.subject_id, form);
				toast.add({
					type: "success",
					title: "Subject updated",
					description: `${form.subject_name} has been updated.`,
				});
			} else {
				await addSubject(form);
				toast.add({
					type: "success",
					title: "Subject created",
					description: `${form.subject_name} was added to your folders.`,
				});
			}
			setDialogOpen(false);
		} catch (err) {
			setError(parseApiError(err));
		}
	};

	const confirmDelete = async () => {
		if (!deleting) return;
		try {
			await removeSubject(deleting.subject_id);
			toast.add({
				type: "success",
				title: "Subject deleted",
				description: `${deleting.subject_name} was removed.`,
			});
			setDeleting(null);
		} catch (err) {
			toast.add({
				type: "error",
				title: "Delete failed",
				description: parseApiError(err),
			});
			setDeleting(null);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="font-heading text-2xl font-semibold tracking-tight">
						Subject Folders
					</h1>
					<p className="text-sm text-muted-foreground">
						{currentSubject
							? `Managing materials for ${currentSubject.subject_name}`
							: "Organize subjects for question generation."}
					</p>
				</div>
				<Button
					variant="secondary"
					onClick={openCreate}
					className="w-full sm:w-auto">
					<Plus data-icon="inline-start" className="size-4" />
					New Subject
				</Button>
			</div>

			<div className="relative">
				<Search
					className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search subjects..."
					className="pl-9"
					aria-label="Search subjects"
				/>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({length: 6}).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-5 w-2/3" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : loadError ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Folder className="size-5" />
						</EmptyMedia>
						<EmptyTitle>Couldn't load subjects</EmptyTitle>
						<EmptyDescription>{loadError}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="outline" onClick={() => void fetchSubjects()}>
							Retry
						</Button>
					</EmptyContent>
				</Empty>
			) : subjects.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Folder className="size-5" />
						</EmptyMedia>
						<EmptyTitle>No subjects yet</EmptyTitle>
						<EmptyDescription>
							Create your first subject folder to start organizing materials.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							variant="secondary"
							onClick={openCreate}
							className="w-full sm:w-auto">
							<Plus data-icon="inline-start" className="size-4" />
							New Subject
						</Button>
					</EmptyContent>
				</Empty>
			) : filteredSubjects.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Search className="size-5" />
						</EmptyMedia>
						<EmptyTitle>No matching subjects</EmptyTitle>
						<EmptyDescription>
							No subjects match "{query.trim()}". Try a different search.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button
							variant="outline"
							onClick={() => setQuery("")}
							className="w-full sm:w-auto">
							Clear search
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredSubjects.map((subject) => (
						<Card
							key={subject.subject_id}
							onClick={() => navigate(getDetailsHref(subject.subject_id))}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									navigate(getDetailsHref(subject.subject_id));
								}
							}}
							role="link"
							tabIndex={0}
							aria-label={`Open ${subject.subject_name}`}
							className="cursor-pointer transition-colors hover:ring-ring/30 shadow-none border-2 py-3 gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Link
										to={getDetailsHref(subject.subject_id)}
										onClick={(e) => e.stopPropagation()}
										className="min-w-0 truncate hover:underline"
										aria-label={`Open ${subject.subject_name}`}>
										{subject.subject_name}
									</Link>
								</CardTitle>
								<Badge variant="secondary">{subject.subject_code}</Badge>
								<CardAction>
									<DropdownMenu>
										<DropdownMenuTrigger
											render={
												<Button
													variant="ghost"
													size="icon"
													aria-label={`Options for ${subject.subject_name}`}
												/>
											}
											onClick={(e) => e.stopPropagation()}>
											<MoreHorizontal className="size-4" />
										</DropdownMenuTrigger>
										<DropdownMenuContent side="bottom" align="end">
											<DropdownMenuItem onClick={() => openEdit(subject)}>
												<Edit className="size-4" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												variant="destructive"
												onClick={() => setDeleting(subject)}>
												<Trash2 className="size-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</CardAction>
							</CardHeader>
							<CardContent className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
								<span className="inline-flex items-center gap-1.5">
									<Folder
										className="size-3.5 text-secondary"
										aria-hidden="true"
									/>
									{fileCounts[subject.subject_id] ?? 0} files
								</span>
								{subject.course && (
									<span className="min-w-0">
										{subject.course}
										{subject.year_level ? ` ${subject.year_level}` : ""}
									</span>
								)}
								{(subject.course || subject.year_level) && (
									<span className="text-muted-foreground/50">•</span>
								)}
								{subject.semester && (
									<span className="min-w-0">{subject.semester}</span>
								)}
								{subject.academic_year && (
									<span className="min-w-0">{subject.academic_year}</span>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editing ? "Edit Subject" : "New Subject"}
						</DialogTitle>
						<DialogDescription>
							{editing
								? "Update the details of this subject."
								: "Create a folder to organize materials for a subject."}
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col gap-3">
						<Field>
							<FieldLabel htmlFor={`${baseId}-code`}>Subject code</FieldLabel>
							<FieldContent>
								<Input
									id={`${baseId}-code`}
									value={form.subject_code}
									onChange={(e) => setField("subject_code", e.target.value)}
									placeholder="e.g. CS101"
									autoFocus
								/>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor={`${baseId}-name`}>Subject name</FieldLabel>
							<FieldContent>
								<Input
									id={`${baseId}-name`}
									value={form.subject_name}
									onChange={(e) => setField("subject_name", e.target.value)}
									placeholder="e.g. Mathematics"
								/>
							</FieldContent>
						</Field>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor={`${baseId}-course`}>Course</FieldLabel>
								<FieldContent>
									<Input
										id={`${baseId}-course`}
										value={form.course}
										onChange={(e) => setField("course", e.target.value)}
										placeholder="e.g. BSIT"
									/>
								</FieldContent>
							</Field>
							<Field>
								<FieldLabel htmlFor={`${baseId}-year-level`}>
									Year level
								</FieldLabel>
								<FieldContent>
									<select
										id={`${baseId}-year-level`}
										value={form.year_level}
										onChange={(e) => setField("year_level", e.target.value)}
										className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
										{YEAR_LEVELS.map((level) => (
											<option key={level} value={level}>
												{level}
											</option>
										))}
									</select>
								</FieldContent>
							</Field>
							<Field>
								<FieldLabel htmlFor={`${baseId}-semester`}>Semester</FieldLabel>
								<FieldContent>
									<Input
										id={`${baseId}-semester`}
										value={form.semester}
										onChange={(e) => setField("semester", e.target.value)}
										placeholder="e.g. 1st"
									/>
								</FieldContent>
							</Field>
							<Field>
								<FieldLabel htmlFor={`${baseId}-year`}>
									Academic year
								</FieldLabel>
								<FieldContent>
									<Input
										id={`${baseId}-year`}
										value={form.academic_year}
										onChange={(e) => setField("academic_year", e.target.value)}
										placeholder="e.g. 2025-2026"
									/>
								</FieldContent>
							</Field>
						</div>
						{error && <FieldError>{error}</FieldError>}
					</div>
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							Cancel
						</DialogClose>
						<Button variant="secondary" onClick={() => void submitForm()}>
							{editing ? "Save Changes" : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={deleting !== null}
				onOpenChange={(open) => {
					if (!open) setDeleting(null);
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia>
							<Trash2 className="size-5" />
						</AlertDialogMedia>
						<AlertDialogTitle>Delete subject?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete "{deleting?.subject_name}". This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => void confirmDelete()}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}