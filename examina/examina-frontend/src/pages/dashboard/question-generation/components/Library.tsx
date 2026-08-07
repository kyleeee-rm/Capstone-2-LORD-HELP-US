import {useState, useEffect, useId} from "react";
import {Link} from "react-router-dom";
import {
	Archive,
	BarChart3,
	FileSpreadsheet,
	Folder,
	Trash2,
	RefreshCw,
	MoreHorizontal,
	Edit,
} from "lucide-react";
import {
	getSubjects,
	restoreSubject,
	deleteSubject,
	updateSubject,
	archiveSubject,
} from "@/features/subjects/api/subject-service";
import {Button} from "@/shared/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import {Badge} from "@/shared/ui/badge";
import {Skeleton} from "@/shared/ui/skeleton";
import {toast} from "@/shared/ui/toast";
import {parseApiError} from "@/shared/lib/parse-api-error";
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
import {Field, FieldContent, FieldError, FieldLabel} from "@/shared/ui/field";
import {Input} from "@/shared/ui/input";
import type {Subject, SubjectCreate, YearLevel} from "@/shared/types/domain";

type LibraryTab =
	| "resources"
	| "archives"
	| "scanned-results"
	| "item-analysis";

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

export default function Library() {
	const [activeTab, setActiveTab] = useState<LibraryTab>("resources");
	const [activeSubjects, setActiveSubjects] = useState<Subject[]>([]);
	const [archivedSubjects, setArchivedSubjects] = useState<Subject[]>([]);
	const [loading, setLoading] = useState(true);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Subject | null>(null);
	const [deleting, setDeleting] = useState<Subject | null>(null);
	const [archiving, setArchiving] = useState<Subject | null>(null);
	const [form, setForm] = useState<SubjectCreate>(EMPTY_FORM);
	const [error, setError] = useState("");
	const baseId = useId();

	const fetchData = async () => {
		setLoading(true);
		try {
			const [active, archived] = await Promise.all([
				getSubjects(false),
				getSubjects(true),
			]);
			setActiveSubjects(active);
			setArchivedSubjects(archived);
		} catch (err) {
			toast.add({
				type: "error",
				title: "Failed to load library data",
				description: parseApiError(err),
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchData();
	}, []);

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
				await updateSubject(editing.subject_id, form);
				toast.add({
					type: "success",
					title: "Subject updated",
					description: `${form.subject_name} has been updated.`,
				});
			}
			setDialogOpen(false);
			void fetchData();
		} catch (err) {
			setError(parseApiError(err));
		}
	};

	const confirmArchive = async () => {
		if (!archiving) return;
		try {
			await archiveSubject(archiving.subject_id);
			toast.add({
				type: "success",
				title: "Subject archived",
				description: `${archiving.subject_name} has been archived.`,
			});
			setArchiving(null);
			void fetchData();
		} catch (err) {
			toast.add({
				type: "error",
				title: "Archive failed",
				description: parseApiError(err),
			});
			setArchiving(null);
		}
	};

	const handleRestore = async (id: string, name: string) => {
		try {
			await restoreSubject(id);
			toast.add({
				type: "success",
				title: "Subject restored",
				description: `${name} has been restored successfully.`,
			});
			void fetchData();
		} catch (err) {
			toast.add({
				type: "error",
				title: "Restore failed",
				description: parseApiError(err),
			});
		}
	};

	const confirmDelete = async () => {
		if (!deleting) return;
		try {
			await deleteSubject(deleting.subject_id);
			toast.add({
				type: "success",
				title: "Subject deleted",
				description: `${deleting.subject_name} was removed.`,
			});
			setDeleting(null);
			void fetchData();
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
			<div className="flex flex-col gap-1">
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					Library
				</h1>
				<p className="text-sm text-muted-foreground">
					Manage all your active subjects, archives, scanned results, and item
					analysis reports.
				</p>
			</div>

			<div className="flex gap-2 border-b border-border overflow-x-auto">
				{[
					{id: "resources", label: "Resource Library", icon: Folder},
					{id: "archives", label: "Archives", icon: Archive},
					{
						id: "scanned-results",
						label: "Scanned Results",
						icon: FileSpreadsheet,
					},
					{id: "item-analysis", label: "Item Analysis", icon: BarChart3},
				].map((tab) => {
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as LibraryTab)}
							className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
								activeTab === tab.id
									? "border-b-2 border-primary text-primary"
									: "text-muted-foreground hover:text-foreground"
							}`}>
							<Icon className="size-4" />
							{tab.label}
						</button>
					);
				})}
			</div>

			{loading ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
			) : (
				<>
					{activeTab === "resources" && (
						<div className="flex flex-col gap-4">
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{activeSubjects.map((subject) => (
									<Card
										key={subject.subject_id}
										className="cursor-pointer transition-colors hover:ring-ring/30 shadow-none border-2 py-3 gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										onClick={() =>
											(window.location.href = `/dashboard/questions-generation/${subject.subject_id}`)
										}>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Link
													to={`/dashboard/questions-generation/${subject.subject_id}`}
													onClick={(e) => e.stopPropagation()}
													className="min-w-0 truncate hover:underline">
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
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																openEdit(subject);
															}}>
															<Edit className="size-4" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																setArchiving(subject);
															}}>
															<Archive className="size-4" />
															Archive
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant="destructive"
															onClick={(e) => {
																e.stopPropagation();
																setDeleting(subject);
															}}>
															<Trash2 className="size-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</CardAction>
										</CardHeader>
										<CardContent className="text-sm text-muted-foreground">
											{subject.course} {subject.year_level} • {subject.semester}{" "}
											({subject.academic_year})
										</CardContent>
									</Card>
								))}
								{activeSubjects.length === 0 && (
									<p className="col-span-full py-12 text-center text-sm text-muted-foreground">
										No active subjects in your library.
									</p>
								)}
							</div>
						</div>
					)}

					{activeTab === "archives" && (
						<div className="flex flex-col gap-4">
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{archivedSubjects.map((subject) => (
									<Card
										key={subject.subject_id}
										className="border-2 py-3 border-muted">
										<CardHeader>
											<CardTitle>{subject.subject_name}</CardTitle>
											<Badge variant="outline">{subject.subject_code}</Badge>
										</CardHeader>
										<CardContent className="flex flex-col gap-3">
											<p className="text-xs text-muted-foreground">
												Archived on{" "}
												{new Date(subject.updated_at).toLocaleDateString()}
											</p>
											<div className="flex items-center gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														void handleRestore(
															subject.subject_id,
															subject.subject_name,
														)
													}
													className="flex-1">
													<RefreshCw className="size-3.5" />
													Restore
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() => setDeleting(subject)}
													className="flex-1">
													<Trash2 className="size-3.5" />
													Delete Forever
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
								{archivedSubjects.length === 0 && (
									<p className="col-span-full py-12 text-center text-sm text-muted-foreground">
										No archived subjects or trash items found.
									</p>
								)}
							</div>
						</div>
					)}

					{activeTab === "scanned-results" && (
						<div className="rounded-xl border border-border p-8 text-center bg-card">
							<FileSpreadsheet className="mx-auto size-12 text-muted-foreground mb-3" />
							<h3 className="text-lg font-semibold text-foreground">
								Scanned Exam Results
							</h3>
							<p className="text-sm text-muted-foreground mt-1 mb-4">
								View scanned answer sheets, student score sheets, and automated
								grading outputs.
							</p>
							<Button
								variant="secondary"
								onClick={() =>
									(window.location.href = "/dashboard/sheet-scanning")
								}>
								Go to Sheet Scanning
							</Button>
						</div>
					)}

					{activeTab === "item-analysis" && (
						<div className="rounded-xl border border-border p-8 text-center bg-card">
							<BarChart3 className="mx-auto size-12 text-muted-foreground mb-3" />
							<h3 className="text-lg font-semibold text-foreground">
								Psychometric Item Analysis
							</h3>
							<p className="text-sm text-muted-foreground mt-1 mb-4">
								Analyze exam reliability, question difficulty indices, and
								student performance statistics.
							</p>
							<Button
								variant="secondary"
								onClick={() => (window.location.href = "/dashboard/analysis")}>
								Go to Item Analysis
							</Button>
						</div>
					)}
				</>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Subject</DialogTitle>
						<DialogDescription>
							Update the details of this subject.
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
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={archiving !== null}
				onOpenChange={(open) => {
					if (!open) setArchiving(null);
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia>
							<Archive className="size-5" />
						</AlertDialogMedia>
						<AlertDialogTitle>Archive subject?</AlertDialogTitle>
						<AlertDialogDescription>
							This will move "{archiving?.subject_name}" to archives. You can
							restore it later from the Archives tab.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => void confirmArchive()}>
							Archive
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

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
