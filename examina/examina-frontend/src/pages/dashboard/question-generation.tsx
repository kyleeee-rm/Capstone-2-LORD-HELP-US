import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {PaginationPrevious} from "@/components/ui/pagination";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {
	Item,
	ItemGroup,
	ItemContent,
	ItemTitle,
	ItemMedia,
	ItemActions,
} from "@/components/ui/item";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
	Plus,
	MoreVertical,
	FolderOpen,
	Pencil,
	Archive,
	Trash2,
	CheckCircle,
} from "lucide-react";
import {useIsMobile} from "@/hooks/use-mobile";
import {
	getSubjects,
	createSubject,
	type Subject,
} from "@/services/subject-service";

export default function QuestionsGeneration() {
	const navigate = useNavigate();
	const [subjectName, setSubjectName] = useState("");
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectMode, setSelectMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const isMobile = useIsMobile();

	const fetchSubjects = () => {
		getSubjects()
			.then(setSubjects)
			.catch(() => setSubjects([]))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchSubjects();
	}, []);

	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleAddSubject = async () => {
		if (!subjectName.trim()) return;
		try {
			await createSubject({
				subject_name: subjectName.trim(),
				subject_code: subjectName.trim().slice(0, 3).toUpperCase(),
				course: "BSIT",
				section: "A",
				semester: "1st",
				academic_year: "2025-2026",
			});
			setSubjectName("");
			fetchSubjects();
		} catch {
			// handle error
		}
	};

	const handleBulkAction = (action: string) => {
		console.log(action, Array.from(selectedIds));
		setSelectedIds(new Set());
		setSelectMode(false);
	};

	return (
		<div className="flex flex-col gap-2 pb-20">
			<div className="flex items-center py-3">
				<PaginationPrevious
					text="Back"
					onClick={() => navigate(-1)}
					className="text-secondary hover:bg-secondary/10"
				/>
				<h1 className="text-xl font-bold text-secondary">
					Questions Generation
				</h1>
			</div>
			<div
				className={`flex gap-3.5 ${isMobile ? "flex-col" : "flex-row items-end"}`}>
				<Input
					type="text"
					placeholder="Enter subject name"
					value={subjectName}
					onChange={(e) => setSubjectName(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
					className={isMobile ? "w-full" : "flex-1"}
				/>
				<Button
					variant="secondary"
					className={isMobile ? "w-full" : "w-auto"}
					disabled={!subjectName.trim()}
					onClick={handleAddSubject}>
					<Plus className="size-4" />
					Add Subject
				</Button>
			</div>

			{!loading && subjects.length > 0 && (
				<div className="flex items-center justify-between mt-2">
					{selectMode ? (
						<div className="flex gap-2">
							<AlertDialog>
								<AlertDialogTrigger
									render={
										<Button
											variant="secondary"
											size="sm"
											disabled={selectedIds.size === 0}
										/>
									}>
									<Archive className="size-4" />
									Archive ({selectedIds.size})
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Archive subjects?</AlertDialogTitle>
										<AlertDialogDescription>
											This will archive {selectedIds.size} selected subject(s).
											You can restore them later from the archive.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => handleBulkAction("archive")}>
											Archive
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>

							<AlertDialog>
								<AlertDialogTrigger
									render={
										<Button
											variant="destructive"
											size="sm"
											disabled={selectedIds.size === 0}
										/>
									}>
									<Trash2 className="size-4" />
									Delete ({selectedIds.size})
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Delete subjects?</AlertDialogTitle>
										<AlertDialogDescription>
											This will permanently delete {selectedIds.size} selected
											subject(s). This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											variant="destructive"
											onClick={() => handleBulkAction("delete")}>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>

							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setSelectMode(false);
									setSelectedIds(new Set());
								}}>
								Cancel
							</Button>
						</div>
					) : (
						<div className="ml-auto">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectMode(true)}>
								<CheckCircle className="size-4" />
								Select
							</Button>
						</div>
					)}
				</div>
			)}

			{loading ? (
				<Item variant="muted" size="sm">
					<ItemContent>
						<ItemTitle className="text-text-muted justify-center">
							Loading...
						</ItemTitle>
					</ItemContent>
				</Item>
			) : subjects.length === 0 ? (
				<Item variant="muted" size="sm">
					<ItemContent>
						<ItemTitle className="text-text-muted justify-center">
							No subjects yet
						</ItemTitle>
					</ItemContent>
				</Item>
			) : (
				<ItemGroup className="gap-0 mt-2">
					{subjects.map((subject) => (
						<Item
							key={subject.subject_id}
							variant="outline"
							size="sm"
							onClick={() =>
								selectMode
									? toggleSelect(subject.subject_id)
									: navigate(
											`/dashboard/question-generation/${subject.subject_id}`,
										)
							}
							className={
								selectMode && selectedIds.has(subject.subject_id)
									? "border-secondary bg-secondary/5"
									: ""
							}>
							{selectMode && (
								<ItemMedia>
									<Checkbox
										variant="secondary"
										checked={selectedIds.has(subject.subject_id)}
										onCheckedChange={() => toggleSelect(subject.subject_id)}
									/>
								</ItemMedia>
							)}
							<ItemContent>
								<ItemTitle className="text-text font-semibold">
									{subject.subject_name}
								</ItemTitle>
								<Label className="text-xs text-text-muted">
									{subject.subject_code} &middot; {subject.course}{" "}
									{subject.section}
								</Label>
							</ItemContent>
							<ItemActions>
								{!selectMode && (
									<DropdownMenu>
										<DropdownMenuTrigger
											render={
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label="More options"
													onClick={(e) => e.stopPropagation()}
												/>
											}>
											<MoreVertical className="size-4" />
										</DropdownMenuTrigger>
										<DropdownMenuContent side="bottom" align="end">
											<DropdownMenuItem
												onClick={() =>
													navigate(
														`/dashboard/question-generation/${subject.subject_id}`,
													)
												}>
												<FolderOpen className="size-4" />
												View Folders
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Pencil className="size-4" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem>
												<Archive className="size-4" />
												Archive
											</DropdownMenuItem>
											<DropdownMenuItem variant="destructive">
												<Trash2 className="size-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			)}
		</div>
	);
}
