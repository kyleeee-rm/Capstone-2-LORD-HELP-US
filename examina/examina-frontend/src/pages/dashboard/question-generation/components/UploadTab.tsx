import { useEffect, useRef, useState } from "react";
import { Edit, Eye, FileText, MoreHorizontal, Trash2, Upload } from "lucide-react";
import { uploadMaterial } from "@/features/materials/api/material-service";
import { useMaterials } from "@/features/materials";
import { useActivityStore } from "@/shared/stores";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
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

export function UploadTab({ folderId }: { folderId: string }) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);
  const [removedMaterialIds, setRemovedMaterialIds] = useState<Set<string>>(new Set());
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const { materials, error: materialsError, refetch: refetchMaterials } = useMaterials(folderId);
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
        : ""
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
          (p) => setProgress(p)
        );
      }
      setSuccess(`${pendingFiles.length} file(s) uploaded successfully`);
      pendingFiles.forEach((file) => {
        addActivity({ action: "uploaded", type: "file", name: file.name });
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
      addActivity({ action: "deleted", type: "file", name: material.filename });
      setRemovedMaterialIds((prev) => new Set(prev).add(deleteTargetId));
    }
    setDeleteTargetId(null);
  };

  const visibleMaterials = materials.filter((m) => !removedMaterialIds.has(m.id));

  return (
    <div className="mt-2 flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start">
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
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dragging
              ? "scale-[1.01] border-primary bg-primary/5 ring-2 ring-primary"
              : "border-border hover:border-primary",
            pendingFiles.length > 0 ? "min-h-16 flex-row p-4" : "min-h-40 p-8"
          )}
        >
          <Upload
            className={cn(pendingFiles.length > 0 ? "size-5" : "size-8 text-primary")}
            aria-hidden="true"
          />
          <div className="min-w-0 text-center">
            <p className="text-sm font-medium text-foreground">
              {pendingFiles.length > 0
                ? "Drop more files or click to add"
                : "Drag & drop files here or click to browse"}
            </p>
            {pendingFiles.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={openPicker}>
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

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {pendingFiles.length > 0 && (
          <div className="rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold text-foreground">
                Queue ({pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""})
              </h4>
              {uploadingIndex === null && (
                <Button type="button" size="sm" onClick={() => void handleUploadAll()}>
                  Upload All
                </Button>
              )}
            </div>
            <ul className="divide-y divide-border">
              {pendingFiles.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between px-4 py-3 text-sm text-foreground">
                  <span className="mr-2 flex min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{f.name}</span>
                  </span>
                  {uploadingIndex === i ? (
                    <span className="whitespace-nowrap text-xs font-medium text-primary">{progress}%</span>
                  ) : (
                    <button
                      onClick={() => setPendingDeleteIndex(i)}
                      className="whitespace-nowrap text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {uploadingIndex !== null && (
              <div className="px-4 py-3">
                <p className="mb-1 text-xs text-muted-foreground">
                  Uploading {uploadingIndex + 1} of {pendingFiles.length}...
                </p>
                <div className="h-2 w-full rounded-full bg-border">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <h4 className="text-sm font-semibold text-foreground">Uploaded Files</h4>

        {materialsError && (
          <div className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-foreground">
            <p>{materialsError}</p>
            <button
              onClick={() => void refetchMaterials()}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {visibleMaterials.length > 0 && (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {visibleMaterials.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-foreground">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate font-medium">{m.filename}</span>
                  <Badge variant="outline" className="shrink-0 capitalize text-muted-foreground">
                    {m.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Options for ${m.filename}`}
                      />
                    }
                  >
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
                      onClick={() => setDeleteTargetId(m.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}

        {visibleMaterials.length === 0 && !materialsError && (
          <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
        )}
      </div>

      <AlertDialog
        open={pendingDeleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteIndex(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{pendingFiles[pendingDeleteIndex ?? 0]?.name}" from the queue?
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
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{materials.find((m) => m.id === deleteTargetId)?.filename}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeleteMaterial}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
