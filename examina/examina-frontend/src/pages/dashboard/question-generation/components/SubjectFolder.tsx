import {Link, useNavigate, useParams} from "react-router-dom";
import {useState, useEffect, useRef} from "react";
import {
	createFolder,
	updateFolder,
	deleteFolder,
} from "@/features/subjects/api/subject-folder-service";
import {useSubjectFolders} from "@/features/subjects";
import {useActivityStore} from "@/shared/stores";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import {Skeleton} from "@/shared/ui/skeleton";
import {Button} from "@/shared/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {FolderPlus, Plus, MoreHorizontal, Edit2, Trash2} from "lucide-react";
import {getFolderHref, useFolderDetail} from "../hooks/use-folder-detail";
import {UploadTab} from "./UploadTab";
import {GeneratedQuestions} from "./GeneratedQuestions";

export default function SubjectFolder() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<"materials" | "questions">(
		"materials",
	);
	const [newFolderName, setNewFolderName] = useState("");
	const [showNewFolderInput, setShowNewFolderInput] = useState(false);

	// Rename & Delete state
	const [isRenaming, setIsRenaming] = useState(false);
	const [renameValue, setRenameValue] = useState("");
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const isCreatingFolder = useRef(false);

	const addActivity = useActivityStore((s) => s.addActivity);

	const {subjectId, folderId, subjectName, isSubjectHydrating} =
		useFolderDetail([], false);

	const {
		folders,
		loading: foldersLoading,
		error: foldersError,
		refetch: refetchFolders,
	} = useSubjectFolders(subjectId);

	const detailState = useFolderDetail(folders, foldersLoading);
	const currentSubjectName = detailState.subjectName ?? subjectName;
	const currentIsHydrating =
		detailState.isSubjectHydrating || isSubjectHydrating;

	// Automatically ensure at least one default folder exists for this subject
	useEffect(() => {
		if (
			!foldersLoading &&
			subjectId &&
			folders.length === 0 &&
			!isCreatingFolder.current
		) {
			isCreatingFolder.current = true;
			void createFolder({
				subject_id: subjectId,
				folder_name: "General Materials",
			})
				.then(() => refetchFolders())
				.finally(() => {
					isCreatingFolder.current = false;
				});
		}
	}, [foldersLoading, subjectId, folders.length, refetchFolders]);

	const activeFolder = folderId
		? folders.find((f) => f.folder_id === folderId)
		: folders[0];

	const activeFolderId = activeFolder?.folder_id;

	const handleCreateSubFolder = async () => {
		if (!newFolderName.trim() || !subjectId) return;
		try {
			const created = await createFolder({
				subject_id: subjectId,
				folder_name: newFolderName.trim(),
			});
			addActivity({
				action: "created",
				type: "folder",
				name: newFolderName.trim(),
				href: getFolderHref(subjectId, created.folder_id),
			});
			setNewFolderName("");
			setShowNewFolderInput(false);
			await refetchFolders();
			navigate(getFolderHref(subjectId, created.folder_id));
		} catch {
			// handle error
		}
	};

	const handleRenameFolder = async () => {
		if (!activeFolderId || !renameValue.trim()) return;
		try {
			await updateFolder(activeFolderId, {folder_name: renameValue.trim()});
			setIsRenaming(false);
			await refetchFolders();
		} catch {
			// handle error
		}
	};

	const handleDeleteFolder = async () => {
		if (!activeFolderId || folders.length <= 1) return;
		try {
			await deleteFolder(activeFolderId);
			setShowDeleteDialog(false);
			await refetchFolders();
			const remaining = folders.filter((f) => f.folder_id !== activeFolderId);
			if (remaining.length > 0 && subjectId) {
				navigate(getFolderHref(subjectId, remaining[0].folder_id));
			}
		} catch {
			// handle error
		}
	};

	if (
		foldersLoading ||
		currentIsHydrating ||
		(!activeFolderId && folders.length === 0)
	) {
		return (
			<div className="mx-auto w-full max-w-5xl flex flex-col gap-4">
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full rounded-xl" />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl flex flex-col gap-4">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink
							render={<Link to="/dashboard/questions-generation" />}>
							Subjects
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink
							render={
								<Link to={`/dashboard/questions-generation/${subjectId}`} />
							}>
							{currentSubjectName ?? subjectId}
						</BreadcrumbLink>
					</BreadcrumbItem>
					{activeFolder && folders.length > 1 && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{activeFolder.folder_name}</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>

			{/* Header: title + controls - responsive column on mobile */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
						{currentSubjectName ?? "Subject Materials"}
					</h1>
					<p className="text-sm text-muted-foreground">
						Upload learning sources and generate AI exam questions for this
						subject.
					</p>
				</div>

				{/* Controls – dropdown on its own, then two buttons side by side */}
				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
					{/* Dropdown – only shown when multiple folders exist */}
					{folders.length > 1 && activeFolderId && (
						<Select
							value={activeFolderId}
							onValueChange={(folderId) =>
								folderId && navigate(getFolderHref(subjectId!, folderId))
							}>
							<SelectTrigger className="w-full sm:w-48">
								<SelectValue placeholder="Select subfolder">
									{activeFolder?.folder_name ?? "Select subfolder"}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{folders.map((f) => (
										<SelectItem key={f.folder_id} value={f.folder_id}>
											{f.folder_name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					)}

					{/* Row for "New Subfolder" + three‑dot menu – always side‑by‑side */}
					<div className="flex w-full gap-2 sm:w-auto">
						<Button
							variant="outline"
							size="sm"
							className="flex-1 sm:w-auto"
							onClick={() => setShowNewFolderInput(!showNewFolderInput)}>
							<FolderPlus className="size-4" />
							New Subfolder
						</Button>

						{activeFolderId && (
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button
											variant="outline"
											size="icon-sm"
											aria-label="Subfolder options"
											className="shrink-0">
											<MoreHorizontal className="size-4" />
										</Button>
									}
								/>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => {
											setRenameValue(activeFolder?.folder_name ?? "");
											setIsRenaming(true);
										}}>
										<Edit2 className="size-4 mr-2" />
										Rename
									</DropdownMenuItem>
									{folders.length > 1 && (
										<DropdownMenuItem
											className="text-destructive focus:text-destructive"
											onClick={() => setShowDeleteDialog(true)}>
											<Trash2 className="size-4 mr-2" />
											Delete
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</div>

			{/* Rename input - responsive stacking */}
			{isRenaming && (
				<div className="flex flex-col gap-2 rounded-xl border border-border p-3 bg-muted/30 sm:flex-row">
					<input
						value={renameValue}
						onChange={(e) => setRenameValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") void handleRenameFolder();
						}}
						placeholder="New subfolder name"
						className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none"
					/>
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="secondary"
							onClick={() => void handleRenameFolder()}
							className="flex-1 sm:flex-none">
							Save
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => setIsRenaming(false)}
							className="flex-1 sm:flex-none">
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Create input - responsive stacking */}
			{showNewFolderInput && (
				<div className="flex flex-col gap-2 rounded-xl border border-border p-3 bg-muted/30 sm:flex-row">
					<input
						value={newFolderName}
						onChange={(e) => setNewFolderName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") void handleCreateSubFolder();
						}}
						placeholder="Subfolder name (e.g. Midterm Topics)"
						className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none"
					/>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => void handleCreateSubFolder()}
						className="w-full sm:w-auto">
						<Plus className="size-4" />
						Create
					</Button>
				</div>
			)}

			{foldersError && (
				<div className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-foreground">
					<p>{foldersError}</p>
					<button
						onClick={() => void refetchFolders()}
						className="mt-2 text-xs font-medium underline">
						Retry
					</button>
				</div>
			)}

			{/* Tabs & Content */}
			<div className="flex border-b border-border">
				<button
					type="button"
					onClick={() => setActiveTab("materials")}
					className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
						activeTab === "materials"
							? "border-primary text-primary"
							: "border-transparent text-muted-foreground hover:text-foreground"
					}`}>
					Learning Materials
				</button>
				<button
					type="button"
					data-tab="questions"
					onClick={() => setActiveTab("questions")}
					className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
						activeTab === "questions"
							? "border-primary text-primary"
							: "border-transparent text-muted-foreground hover:text-foreground"
					}`}>
					Generated Questions
				</button>
			</div>

			{activeFolderId && (
				<div className="mt-2">
					{activeTab === "materials" && <UploadTab folderId={activeFolderId} />}
					{activeTab === "questions" && (
						<GeneratedQuestions folderId={activeFolderId} />
					)}
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete subfolder?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{activeFolder?.folder_name}"? All
							materials inside this subfolder will be removed. This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => void handleDeleteFolder()}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
