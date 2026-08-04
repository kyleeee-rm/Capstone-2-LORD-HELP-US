import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {createFolder} from "@/features/subjects/api/subject-folder-service";
import {useSubjectFolders} from "@/features/subjects";
import {useActivityStore} from "@/shared/stores";
import {useSelectMode} from "@/shared/hooks";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import {Skeleton} from "@/shared/ui/skeleton";
import {getFolderHref, useFolderDetail} from "../hooks/use-folder-detail";
import {UploadTab} from "./UploadTab";
import {GeneratedQuestions} from "./GeneratedQuestions";

type FolderTab = "folders" | "archived" | "trash";

export default function SubjectFolder() {
	const navigate = useNavigate();
	const [newFolderName, setNewFolderName] = useState("");
	const [activeTab, setActiveTab] = useState<"materials" | "questions">(
		"materials",
	);
	const [folderTab, setFolderTab] = useState<FolderTab>("folders");
	const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
	const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
	const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
	const {selectMode, setSelectMode, selectedIds, toggleSelect, clearSelection} =
		useSelectMode();
	const addActivity = useActivityStore((s) => s.addActivity);

	const {subjectId, folderId, subjectName, isSubjectHydrating, selectedFolder} =
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
	const currentFolder = detailState.selectedFolder ?? selectedFolder;

	const handleCreateFolder = async () => {
		if (!newFolderName.trim() || !subjectId) return;
		try {
			await createFolder({
				subject_id: subjectId,
				folder_name: newFolderName.trim(),
			});
			addActivity({
				action: "created",
				type: "folder",
				name: newFolderName.trim(),
				href: `/subjects/${subjectId}`,
			});
			setNewFolderName("");
			refetchFolders();
		} catch {
			// handle error
		}
	};

	const visibleFolders = folders.filter((f) => {
		if (removedIds.has(f.folder_id)) return false;
		const isArchived = archivedIds.has(f.folder_id);
		const isDeleted = deletedIds.has(f.folder_id);
		if (folderTab === "folders") return !isArchived && !isDeleted;
		if (folderTab === "archived") return isArchived && !isDeleted;
		if (folderTab === "trash") return isDeleted;
		return false;
	});

	const handleArchive = () => {
		selectedIds.forEach((id) => {
			const folder = folders.find((f) => f.folder_id === id);
			if (folder)
				addActivity({
					action: "archived",
					type: "folder",
					name: folder.folder_name,
					href: `/subjects/${subjectId}`,
				});
			setArchivedIds((prev) => new Set(prev).add(id));
		});
		clearSelection();
	};

	const handleDelete = () => {
		selectedIds.forEach((id) => {
			const folder = folders.find((f) => f.folder_id === id);
			if (folder)
				addActivity({
					action: "deleted",
					type: "folder",
					name: folder.folder_name,
					href: `/subjects/${subjectId}`,
				});
			setArchivedIds((prev) => {
				const n = new Set(prev);
				n.delete(id);
				return n;
			});
			setDeletedIds((prev) => new Set(prev).add(id));
		});
		clearSelection();
	};

	const handleRestore = () => {
		selectedIds.forEach((id) => {
			const folder = folders.find((f) => f.folder_id === id);
			if (folder)
				addActivity({
					action: "restored",
					type: "folder",
					name: folder.folder_name,
					href: `/subjects/${subjectId}`,
				});
			setArchivedIds((prev) => {
				const n = new Set(prev);
				n.delete(id);
				return n;
			});
			setDeletedIds((prev) => {
				const n = new Set(prev);
				n.delete(id);
				return n;
			});
		});
		clearSelection();
	};

	const handlePermanentDelete = () => {
		selectedIds.forEach((id) => {
			const folder = folders.find((f) => f.folder_id === id);
			if (folder)
				addActivity({
					action: "deleted",
					type: "folder",
					name: folder.folder_name,
					href: `/subjects/${subjectId}`,
				});
		});
		setRemovedIds((prev) => new Set([...prev, ...selectedIds]));
		setDeletedIds((prev) => {
			const next = new Set(prev);
			selectedIds.forEach((id) => next.delete(id));
			return next;
		});
		clearSelection();
	};

	if (!folderId) {
		return (
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="font-heading mb-4 text-2xl font-semibold tracking-tight text-foreground">
					Subject Folders
				</h1>

				<div className="mb-4 flex flex-col gap-2 sm:flex-row">
					<input
						value={newFolderName}
						onChange={(e) => setNewFolderName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") void handleCreateFolder();
						}}
						placeholder="New folder name"
						aria-label="New folder name"
						className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
					/>
					{folderTab === "folders" && (
						<button
							onClick={() => void handleCreateFolder()}
							disabled={!newFolderName.trim()}
							className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
							Add Folder
						</button>
					)}
					{folderTab !== "folders" &&
						!selectMode &&
						visibleFolders.length > 0 && (
							<button
								onClick={() => setSelectMode(true)}
								className="rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
								Select
							</button>
						)}
				</div>

				<div className="mb-4 flex gap-2 border-b border-border">
					{(["folders", "archived", "trash"] as FolderTab[]).map((tab) => (
						<button
							key={tab}
							onClick={() => {
								setFolderTab(tab);
								clearSelection();
							}}
							className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
								folderTab === tab
									? "border-b-2 border-primary text-primary"
									: "text-muted-foreground hover:text-foreground"
							}`}>
							{tab}
						</button>
					))}
				</div>

				{selectMode && (
					<div className="mb-3 flex flex-wrap gap-2">
						{folderTab === "archived" && (
							<button
								onClick={handleRestore}
								disabled={selectedIds.size === 0}
								className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50">
								Restore ({selectedIds.size})
							</button>
						)}
						{folderTab === "trash" && (
							<>
								<button
									onClick={handleRestore}
									disabled={selectedIds.size === 0}
									className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50">
									Restore ({selectedIds.size})
								</button>
								<button
									onClick={handlePermanentDelete}
									disabled={selectedIds.size === 0}
									className="rounded-full bg-error px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-50">
									Delete Forever ({selectedIds.size})
								</button>
							</>
						)}
						{folderTab === "folders" && (
							<>
								<button
									onClick={handleArchive}
									disabled={selectedIds.size === 0}
									className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50">
									Archive ({selectedIds.size})
								</button>
								<button
									onClick={handleDelete}
									disabled={selectedIds.size === 0}
									className="rounded-full bg-error px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-50">
									Delete ({selectedIds.size})
								</button>
							</>
						)}
						<button
							onClick={clearSelection}
							className="rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
							Cancel
						</button>
					</div>
				)}

				<div className="flex flex-col gap-3">
					{foldersError && (
						<div className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-foreground">
							<p>{foldersError}</p>
							<button
								onClick={() => void refetchFolders()}
								className="mt-2 text-sm font-medium text-primary hover:underline">
								Retry
							</button>
						</div>
					)}
					{visibleFolders.length > 0 && (
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
							{visibleFolders.map((f) => (
								<button
									key={f.folder_id}
									onClick={() =>
										selectMode
											? toggleSelect(f.folder_id)
											: navigate(getFolderHref(subjectId!, f.folder_id))
									}
									className={`flex items-center gap-3 rounded-xl border bg-background p-4 text-left transition-colors ${
										selectedIds.has(f.folder_id)
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary"
									}`}>
									{selectMode && (
										<div
											className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 ${
												selectedIds.has(f.folder_id)
													? "border-primary bg-primary"
													: "border-foreground/20"
											}`}>
											{selectedIds.has(f.folder_id) && (
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
												d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
											/>
										</svg>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold text-foreground">
											{f.folder_name}
										</p>
										{f.description && (
											<p className="truncate text-xs text-muted-foreground">
												{f.description}
											</p>
										)}
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
					{visibleFolders.length === 0 && folderTab === "folders" && (
						<p className="py-12 text-center text-sm text-muted-foreground">
							No folders yet. Create one above.
						</p>
					)}
					{visibleFolders.length === 0 && folderTab === "archived" && (
						<p className="py-12 text-center text-sm text-muted-foreground">
							No archived folders.
						</p>
					)}
					{visibleFolders.length === 0 && folderTab === "trash" && (
						<p className="py-12 text-center text-sm text-muted-foreground">
							Trash is empty.
						</p>
					)}
				</div>
			</div>
		);
	}

	if (foldersLoading && !currentFolder) {
		return (
			<div className="mx-auto w-full max-w-5xl">
				<div className="mb-4 flex items-center gap-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-24" />
				</div>
				<Skeleton className="mb-4 h-8 w-48" />
				<Skeleton className="h-64 w-full rounded-xl" />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl">
			<Breadcrumb className="mb-2">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link to="/subjects" />}>
							Subjects
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link to={`/subjects/${subjectId}`} />}>
							{currentIsHydrating ? (
								<Skeleton className="inline-block h-4 w-28" />
							) : (
								(currentSubjectName ?? subjectId)
							)}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{currentFolder?.folder_name}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<h1 className="font-heading mb-2 text-2xl font-semibold tracking-tight text-foreground">
				{currentFolder?.folder_name}
			</h1>

			<div className="mb-4 flex gap-2 border-b border-border">
				<button
					onClick={() => setActiveTab("materials")}
					className={`px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "materials"
							? "border-b-2 border-primary text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}>
					Material Sources
				</button>
				<button
					onClick={() => setActiveTab("questions")}
					className={`px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "questions"
							? "border-b-2 border-primary text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}>
					Question Generation
				</button>
			</div>

			{activeTab === "materials" && <UploadTab folderId={folderId} />}
			{activeTab === "questions" && <GeneratedQuestions />}
		</div>
	);
}
