import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {
	Edit,
	Eye,
	FileText,
	MoreHorizontal,
	Trash2,
	Upload,
	Sparkles,
	CheckSquare,
	Square,
	Loader2,
} from "lucide-react";
import {
	uploadMaterial,
	getMaterialStatus,
} from "@/features/materials/api/material-service";
import {useMaterials} from "@/features/materials";
import {useActivityStore} from "@/shared/stores";
import {cn} from "@/shared/lib/utils";
import {Badge} from "@/shared/ui/badge";
import {Button} from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
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

const ACCEPTED_FILE = /\.(pdf|docx)$/i;

export function UploadTab({folderId}: {folderId: string}) {
	const navigate = useNavigate();
	const {subjectId} = useParams<{subjectId: string}>();
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [dragging, setDragging] = useState(false);
	const [removedMaterialIds, setRemovedMaterialIds] = useState<Set<string>>(
		new Set(),
	);
	const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(
		new Set(),
	);
	const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
		null,
	);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const [materialStatuses, setMaterialStatuses] = useState<
		Record<string, {status: string; progress_pct: number}>
	>({});

	const inputRef = useRef<HTMLInputElement>(null);
	const dragDepth = useRef(0);
	const {
		materials,
		error: materialsError,
		refetch: refetchMaterials,
	} = useMaterials(folderId);
	const addActivity = useActivityStore((s) => s.addActivity);

	useEffect(() => {
		const prevent = (e: DragEvent) => e.preventDefault();
		window.addEventListener("dragover", prevent);
		window.addEventListener("drop", prevent);
		return () => {
			window.removeEventListener("dragover", prevent);
			window.removeEventListener("drop", prevent);
		};
	}, []);

	// Poll status for processing materials
	useEffect(() => {
		if (!materials || materials.length === 0) return;

		const processingIds = materials
			.filter((m) => {
				const currentStatus = materialStatuses[m.id]?.status || m.status;
				return currentStatus !== "ready" && currentStatus !== "failed";
			})
			.map((m) => m.id);

		if (processingIds.length === 0) return;

		const interval = setInterval(async () => {
			try {
				const statuses = await Promise.all(
					processingIds.map(async (id) => {
						const res = await getMaterialStatus(folderId, id);
						return {id, status: res.status, progress_pct: res.progress_pct};
					}),
				);

				setMaterialStatuses((prev) => {
					const next = {...prev};
					let needsRefetch = false;
					statuses.forEach((s) => {
						next[s.id] = {status: s.status, progress_pct: s.progress_pct};
						if (s.status === "ready" || s.status === "failed") {
							needsRefetch = true;
						}
					});
					if (needsRefetch) {
						void refetchMaterials();
					}
					return next;
				});
			} catch {
				// Ignore polling network errors temporarily
			}
		}, 2500);

		return () => clearInterval(interval);
	}, [materials, materialStatuses, folderId, refetchMaterials]);

	const queueFiles = (files: FileList | File[]) => {
		const valid: File[] = [];
		const invalid: string[] = [];
		Array.from(files).forEach((f) => {
			if (ACCEPTED_FILE.test(f.name)) valid.push(f);
			else invalid.push(f.name);
		});
		setError(
			invalid.length
				? `Unsupported format: ${invalid.join(", ")}. Only PDF, DOCX are allowed.`
				: "",
		);
		setSuccess("");
		if (valid.length) setPendingFiles((prev) => [...prev, ...valid]);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		queueFiles(e.target.files || []);
		e.target.value = "";
	};

	const openPicker = () => inputRef.current?.click();

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		dragDepth.current += 1;
		setDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		dragDepth.current -= 1;
		if (dragDepth.current <= 0) {
			dragDepth.current = 0;
			setDragging(false);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		dragDepth.current = 0;
		setDragging(false);
		queueFiles(e.dataTransfer.files);
	};

	const removePendingFile = (index: number) => {
		setPendingFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUploadAll = async () => {
		if (!pendingFiles.length) return;

		setUploadingIndex(0);
		setError("");
		setSuccess("");

		try {
			for (let i = 0; i < pendingFiles.length; i++) {
				setUploadingIndex(i);
				setProgress(0);
				const file = pendingFiles[i];
				await uploadMaterial(
					folderId,
					file,
					{
						title: file.name.replace(/\.[^/.]+$/, ""),
						description: `Uploaded ${file.name}`,
						teaching_hours: 1,
					},
					(p) => setProgress(p),
				);
			}
			setSuccess(`${pendingFiles.length} file(s) uploaded successfully.`);
			pendingFiles.forEach((file) => {
				addActivity({
					action: "uploaded",
					type: "file",
					name: file.name,
				});
			});
			setPendingFiles([]);
			refetchMaterials();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploadingIndex(null);
			setProgress(0);
		}
	};

	const confirmDeleteMaterial = () => {
		if (!deleteTargetId) return;
		const material = materials.find((m) => m.id === deleteTargetId);
		if (material) {
			addActivity({action: "deleted", type: "file", name: material.filename});
			setRemovedMaterialIds((prev) => new Set(prev).add(deleteTargetId));
			setSelectedMaterialIds((prev) => {
				const next = new Set(prev);
				next.delete(deleteTargetId);
				return next;
			});
		}
		setDeleteTargetId(null);
	};

	const toggleSelectMaterial = (id: string) => {
		setSelectedMaterialIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (selectedMaterialIds.size === visibleMaterials.length) {
			setSelectedMaterialIds(new Set());
		} else {
			setSelectedMaterialIds(new Set(visibleMaterials.map((m) => m.id)));
		}
	};

	const visibleMaterials = materials.filter(
		(m) => !removedMaterialIds.has(m.id),
	);

	const extractWeekBadge = (desc?: string) => {
		if (!desc) return null;
		const match = desc.match(/\[(.*?)\]/);
		return match ? match[1] : null;
	};

	return (
		<div className="mt-2 flex flex-col gap-4">
			{/* Mobile-optimized action bar when materials are selected */}
			{selectedMaterialIds.size > 0 && (
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-secondary/10 border border-secondary/30 p-3.5 sm:px-4 sm:py-3">
					<div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
						<Sparkles className="size-4 shrink-0 text-secondary" />
						<span>{selectedMaterialIds.size} material(s) selected</span>
					</div>
					<Button
						size="lg"
						variant="secondary"
						className="w-full sm:w-auto text-sm sm:text-md"
						onClick={() => {
							navigate(
								`/dashboard/questions-generation/${subjectId}/folders/${folderId}/customize`,
								{
									state: {selectedMaterialIds: Array.from(selectedMaterialIds)},
								},
							);
						}}>
						Generate Questions ({selectedMaterialIds.size})
					</Button>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
				{/* Upload Column */}
				<div className="flex min-w-0 flex-col gap-3">
					<div
						role="button"
						tabIndex={0}
						aria-label="Upload files. Drag and drop or click to browse."
						onClick={openPicker}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								openPicker();
							}
						}}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						className={cn(
							"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
							dragging
								? "scale-[1.01] border-secondary bg-secondary/5 ring-2 ring-secondary"
								: "border-border hover:border-secondary",
							pendingFiles.length > 0
								? "min-h-16 flex-row p-3.5"
								: "min-h-36 sm:min-h-40 p-6 sm:p-8",
						)}>
						<Upload
							className={cn(
								pendingFiles.length > 0
									? "size-5"
									: "size-7 sm:size-8 text-secondary",
							)}
							aria-hidden="true"
						/>
						<div className="min-w-0 text-center">
							<p className="text-xs sm:text-sm font-medium text-foreground">
								{pendingFiles.length > 0
									? "Drop more files or tap to add"
									: "Tap or drag files here"}
							</p>
							{pendingFiles.length === 0 && (
								<p className="mt-1 text-xs text-muted-foreground">
									PDF, DOCX formats supported
								</p>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="secondary"
							className="w-full sm:w-auto"
							onClick={openPicker}>
							<Upload className="size-4" />
							Browse files
						</Button>
						<input
							ref={inputRef}
							type="file"
							accept=".pdf,.docx"
							multiple
							onChange={handleFileChange}
							className="hidden"
						/>
					</div>

					{error && (
						<p className="text-xs sm:text-sm text-destructive">{error}</p>
					)}
					{success && (
						<p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
							{success}
						</p>
					)}

					{pendingFiles.length > 0 && (
						<div className="rounded-xl border border-border bg-card">
							<div className="flex items-center justify-between border-b border-border p-3 sm:px-4">
								<h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
									Queue ({pendingFiles.length})
								</h4>
								{uploadingIndex === null && (
									<Button
										type="button"
										size="sm"
										variant="secondary"
										onClick={() => void handleUploadAll()}>
										Upload All
									</Button>
								)}
							</div>
							<ul className="divide-y divide-border">
								{pendingFiles.map((f, i) => (
									<li
										key={`${f.name}-${i}`}
										className="flex items-center justify-between p-3 sm:px-4 text-xs sm:text-sm text-foreground">
										<span className="mr-2 flex min-w-0 items-center gap-2">
											<FileText
												className="size-4 shrink-0 text-muted-foreground"
												aria-hidden="true"
											/>
											<span className="truncate">{f.name}</span>
										</span>
										{uploadingIndex === i ? (
											<span className="whitespace-nowrap text-xs font-medium text-secondary">
												{progress}%
											</span>
										) : (
											<button
												onClick={() => setPendingDeleteIndex(i)}
												className="whitespace-nowrap text-xs text-destructive hover:underline">
												Remove
											</button>
										)}
									</li>
								))}
							</ul>
							{uploadingIndex !== null && (
								<div className="p-3 sm:px-4">
									<p className="mb-1 text-xs text-muted-foreground">
										Uploading {uploadingIndex + 1} of {pendingFiles.length}...
									</p>
									<div className="h-2 w-full rounded-full bg-muted">
										<div
											className="h-2 rounded-full bg-secondary transition-all"
											style={{width: `${progress}%`}}
										/>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Uploaded Materials List Column */}
				<div className="flex min-w-0 flex-col gap-3">
					<div className="flex items-center justify-between">
						<h4 className="text-xs sm:text-sm font-semibold text-foreground">
							Uploaded Materials
						</h4>
						{visibleMaterials.length > 0 && (
							<button
								onClick={toggleSelectAll}
								className="text-xs font-medium text-secondary hover:underline">
								{selectedMaterialIds.size === visibleMaterials.length
									? "Deselect All"
									: "Select All"}
							</button>
						)}
					</div>

					{materialsError && (
						<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-xs sm:text-sm text-foreground">
							<p>{materialsError}</p>
							<button
								onClick={() => void refetchMaterials()}
								className="mt-2 text-xs sm:text-sm font-medium text-secondary hover:underline">
								Retry
							</button>
						</div>
					)}

					{visibleMaterials.length > 0 && (
						<ul className="divide-y divide-border rounded-xl border border-border bg-card">
							{visibleMaterials.map((m) => {
								const currentStatusInfo = materialStatuses[m.id] || {
									status: m.status,
									progress_pct: m.status === "ready" ? 100 : 0,
								};
								const weekBadge = extractWeekBadge(m.description);
								const isSelected = selectedMaterialIds.has(m.id);
								const isProcessing =
									currentStatusInfo.status !== "ready" &&
									currentStatusInfo.status !== "failed";

								return (
									<li
										key={m.id}
										onClick={() => toggleSelectMaterial(m.id)}
										className={cn(
											"flex flex-col gap-2 p-3 sm:px-4 text-xs sm:text-sm text-foreground transition-colors hover:bg-muted/50 cursor-pointer",
											isSelected && "bg-secondary/10",
										)}>
										<div className="flex items-center justify-between gap-2.5">
											<div className="flex min-w-0 items-center gap-2.5">
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														toggleSelectMaterial(m.id);
													}}
													className="text-secondary focus:outline-none shrink-0">
													{isSelected ? (
														<CheckSquare className="size-4 text-secondary" />
													) : (
														<Square className="size-4 text-muted-foreground" />
													)}
												</button>
												<FileText
													className="size-4 shrink-0 text-muted-foreground"
													aria-hidden="true"
												/>
												<span className="truncate font-medium min-w-0">
													{m.filename}
												</span>
												{weekBadge && (
													<Badge
														variant="secondary"
														className="shrink-0 text-[10px] sm:text-xs px-1.5 py-0.5">
														{weekBadge}
													</Badge>
												)}
											</div>
											<div className="flex items-center gap-2 shrink-0">
												<Badge
													variant={
														currentStatusInfo.status === "ready"
															? "outline"
															: "secondary"
													}
													className={cn(
														"capitalize text-[10px] sm:text-xs",
														currentStatusInfo.status === "ready" &&
															"text-emerald-600 border-emerald-300",
														currentStatusInfo.status === "failed" &&
															"text-destructive border-destructive/30",
													)}>
													{isProcessing && (
														<Loader2 className="mr-1 size-3 animate-spin inline" />
													)}
													{currentStatusInfo.status}
												</Badge>
												<div onClick={(e) => e.stopPropagation()}>
													<DropdownMenu>
														<DropdownMenuTrigger
															render={
																<Button
																	variant="ghost"
																	size="icon-xs"
																	aria-label={`Options for ${m.filename}`}
																/>
															}>
															<MoreHorizontal className="size-4" />
														</DropdownMenuTrigger>
														<DropdownMenuContent side="bottom" align="end">
															<DropdownMenuItem>
																<Eye className="size-4" />
																View
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Edit className="size-4" />
																Rename
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																variant="destructive"
																onClick={() => setDeleteTargetId(m.id)}>
																<Trash2 className="size-4" />
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</div>

										{/* Progress Bar for Processing State */}
										{isProcessing && (
											<div className="flex flex-col gap-1 w-full pl-6">
												<div className="flex justify-between text-[11px] text-muted-foreground capitalize">
													<span>{currentStatusInfo.status}ing...</span>
													<span>{currentStatusInfo.progress_pct}%</span>
												</div>
												<div className="h-1.5 w-full rounded-full bg-muted">
													<div
														className="h-1.5 rounded-full bg-secondary transition-all duration-500"
														style={{
															width: `${currentStatusInfo.progress_pct}%`,
														}}
													/>
												</div>
											</div>
										)}
									</li>
								);
							})}
						</ul>
					)}

					{visibleMaterials.length === 0 && !materialsError && (
						<p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">
							No files uploaded yet.
						</p>
					)}
				</div>
			</div>

			<AlertDialog
				open={pendingDeleteIndex !== null}
				onOpenChange={(open) => {
					if (!open) setPendingDeleteIndex(null);
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove File</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove "
							{pendingFiles[pendingDeleteIndex ?? 0]?.name}" from the queue?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => {
								if (pendingDeleteIndex !== null) {
									removePendingFile(pendingDeleteIndex);
								}
								setPendingDeleteIndex(null);
							}}>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={deleteTargetId !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTargetId(null);
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete File</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "
							{materials.find((m) => m.id === deleteTargetId)?.filename}"?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={confirmDeleteMaterial}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
