import {Link, useNavigate, useParams} from "react-router-dom";
import {useState, useEffect, useRef} from "react";
import {createFolder} from "@/features/subjects/api/subject-folder-service";
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
import {FolderPlus, Plus} from "lucide-react";
import {getFolderHref, useFolderDetail} from "../hooks/use-folder-detail";
import {UploadTab} from "./UploadTab";
import {GeneratedQuestions} from "./GeneratedQuestions";

export default function SubjectFolder() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<"materials" | "questions">("materials");
	const [newFolderName, setNewFolderName] = useState("");
	const [showNewFolderInput, setShowNewFolderInput] = useState(false);
	const isCreatingFolder = useRef(false);

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
	const currentIsHydrating = detailState.isSubjectHydrating || isSubjectHydrating;

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

	// Select the active folder (either from URL param or default to the first folder)
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

	if (foldersLoading || currentIsHydrating || (!activeFolderId && folders.length === 0)) {
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
						<BreadcrumbLink render={<Link to="/dashboard/questions-generation" />}>
							Subjects
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link to={`/dashboard/questions-generation/${subjectId}`} />}>
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

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
						{currentSubjectName ?? "Subject Materials"}
					</h1>
					<p className="text-sm text-muted-foreground">
						Upload learning sources and generate AI exam questions for this subject.
					</p>
				</div>

				{/* Optional Sub-folder Selector if subject has multiple folders */}
				<div className="flex items-center gap-2">
					{folders.length > 1 && activeFolderId && (
						<Select value={activeFolderId} onValueChange={(folderId) => folderId && navigate(getFolderHref(subjectId!, folderId))}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Select subfolder" />
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
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowNewFolderInput(!showNewFolderInput)}>
						<FolderPlus className="size-4" />
						New Subfolder
					</Button>
				</div>
			</div>

			{showNewFolderInput && (
				<div className="flex gap-2 rounded-xl border border-border p-3 bg-muted/30">
					<input
						value={newFolderName}
						onChange={(e) => setNewFolderName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") void handleCreateSubFolder();
						}}
						placeholder="Subfolder name (e.g. Midterm Topics)"
						className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none"
					/>
					<Button size="sm" variant="secondary" onClick={() => void handleCreateSubFolder()}>
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
						className="mt-2 text-sm font-medium text-primary hover:underline">
						Retry
					</button>
				</div>
			)}

			{/* Main Content Tabs: Material Sources & Question Generation */}
			<div className="flex gap-2 border-b border-border">
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
					data-tab="questions"
					onClick={() => setActiveTab("questions")}
					className={`px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "questions"
							? "border-b-2 border-primary text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}>
					Question Generation
				</button>
			</div>

			{activeFolderId && (
				<>
					{activeTab === "materials" && <UploadTab folderId={activeFolderId} />}
					{activeTab === "questions" && <GeneratedQuestions />}
				</>
			)}
		</div>
	);
}
