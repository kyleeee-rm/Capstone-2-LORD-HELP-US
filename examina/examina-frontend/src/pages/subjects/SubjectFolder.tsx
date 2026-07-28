import { useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { getFolders, createFolder, type SubjectFolder } from "../../services/subjectFolderService";
import { useActivityStore } from "../../store/activityStore";
import UploadTab from "./UploadTab";

type FolderTab = "folders" | "archived" | "trash";

export default function SubjectFolder() {
  const { id: subjectId } = useParams();
  const [folders, setFolders] = useState<SubjectFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [activeTab, setActiveTab] = useState<"materials" | "questions">("materials");
  const [folderTab, setFolderTab] = useState<FolderTab>("folders");
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const addActivity = useActivityStore((s) => s.addActivity);

  const fetchFolders = () => {
    if (!subjectId) return;
    getFolders(subjectId).then(setFolders).catch(() => setFolders([]));
  };

  useEffect(() => {
    fetchFolders();
  }, [subjectId]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !subjectId) return;
    try {
      await createFolder({ subject_id: subjectId, folder_name: newFolderName.trim() });
      addActivity({ action: "created", type: "folder", name: newFolderName.trim() });
      setNewFolderName("");
      fetchFolders();
    } catch {
      // handle error
    }
  };

  const visibleFolders = folders.filter((f) => {
    const isArchived = archivedIds.has(f.folder_id);
    const isDeleted = deletedIds.has(f.folder_id);
    if (folderTab === "folders") return !isArchived && !isDeleted;
    if (folderTab === "archived") return isArchived && !isDeleted;
    if (folderTab === "trash") return isDeleted;
    return false;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleArchive = () => {
    selectedIds.forEach((id) => {
      const folder = folders.find((f) => f.folder_id === id);
      if (folder) addActivity({ action: "archived", type: "folder", name: folder.folder_name });
      setArchivedIds((prev) => new Set(prev).add(id));
    });
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleDelete = () => {
    selectedIds.forEach((id) => {
      const folder = folders.find((f) => f.folder_id === id);
      if (folder) addActivity({ action: "deleted", type: "folder", name: folder.folder_name });
      setArchivedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setDeletedIds((prev) => new Set(prev).add(id));
    });
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleRestore = () => {
    selectedIds.forEach((id) => {
      const folder = folders.find((f) => f.folder_id === id);
      if (folder) addActivity({ action: "restored", type: "folder", name: folder.folder_name });
      setArchivedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setDeletedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    });
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handlePermanentDelete = () => {
    selectedIds.forEach((id) => {
      const folder = folders.find((f) => f.folder_id === id);
      if (folder) addActivity({ action: "deleted", type: "folder", name: folder.folder_name });
    });
    setFolders((prev) => prev.filter((f) => !selectedIds.has(f.folder_id)));
    setDeletedIds((prev) => {
      const next = new Set(prev);
      selectedIds.forEach((id) => next.delete(id));
      return next;
    });
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const selectedFolder = folders.find((f) => f.folder_id === selectedFolderId);

  if (!selectedFolderId) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold text-text">Subject Folders</h1>

        <div className="mb-4 flex gap-2">
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            placeholder="New folder name"
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
          />
          {folderTab === "folders" && (
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Add Folder
            </button>
          )}
          {folderTab !== "folders" && !selectMode && visibleFolders.length > 0 && (
            <button
              onClick={() => setSelectMode(true)}
              className="rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-text transition-colors hover:bg-muted-bg"
            >
              Select
            </button>
          )}
        </div>

        <div className="mb-4 flex gap-2 border-b border-border">
          {(["folders", "archived", "trash"] as FolderTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setFolderTab(tab); setSelectedIds(new Set()); setSelectMode(false); }}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                folderTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {selectMode && (
          <div className="mb-3 flex gap-2">
            {folderTab === "archived" && (
              <button
                onClick={handleRestore}
                disabled={selectedIds.size === 0}
                className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
              >
                Restore ({selectedIds.size})
              </button>
            )}
            {folderTab === "trash" && (
              <>
                <button
                  onClick={handleRestore}
                  disabled={selectedIds.size === 0}
                  className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
                >
                  Restore ({selectedIds.size})
                </button>
                <button
                  onClick={handlePermanentDelete}
                  disabled={selectedIds.size === 0}
                  className="rounded-full bg-error px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-50"
                >
                  Delete Forever ({selectedIds.size})
                </button>
              </>
            )}
            {folderTab === "folders" && (
              <>
                <button
                  onClick={handleArchive}
                  disabled={selectedIds.size === 0}
                  className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
                >
                  Archive ({selectedIds.size})
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selectedIds.size === 0}
                  className="rounded-full bg-error px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-50"
                >
                  Delete ({selectedIds.size})
                </button>
              </>
            )}
            <button
              onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
              className="rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-text transition-colors hover:bg-muted-bg"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {visibleFolders.map((f) => (
            <button
              key={f.folder_id}
              onClick={() => selectMode ? toggleSelect(f.folder_id) : setSelectedFolderId(f.folder_id)}
              className={`flex items-center gap-3 rounded-xl border bg-surface p-4 text-left transition-colors ${
                selectedIds.has(f.folder_id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary"
              }`}
            >
              {selectMode && (
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                  selectedIds.has(f.folder_id)
                    ? "border-primary bg-primary"
                    : "border-border-strong"
                }`}>
                  {selectedIds.has(f.folder_id) && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text">{f.folder_name}</p>
                {f.description && <p className="text-xs text-text-muted">{f.description}</p>}
              </div>
              {!selectMode && (
                <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
          {visibleFolders.length === 0 && folderTab === "folders" && (
            <p className="py-12 text-center text-sm text-text-muted">
              No folders yet. Create one above.
            </p>
          )}
          {visibleFolders.length === 0 && folderTab === "archived" && (
            <p className="py-12 text-center text-sm text-text-muted">
              No archived folders.
            </p>
          )}
          {visibleFolders.length === 0 && folderTab === "trash" && (
            <p className="py-12 text-center text-sm text-text-muted">
              Trash is empty.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setSelectedFolderId(null)}
        className="mb-2 text-sm text-primary hover:underline"
      >
        &larr; Back to folders
      </button>
      <h1 className="mb-2 text-2xl font-bold text-text">{selectedFolder?.folder_name}</h1>

      <div className="mb-4 flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "materials"
              ? "border-b-2 border-primary text-primary"
              : "text-text-muted hover:text-text"
          }`}
        >
          Material Sources
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "questions"
              ? "border-b-2 border-primary text-primary"
              : "text-text-muted hover:text-text"
          }`}
        >
          Question Generation
        </button>
      </div>

      {activeTab === "materials" && <UploadTab folderId={selectedFolderId} />}
      {activeTab === "questions" && (
        <div className="py-12 text-center text-sm text-text-muted">Coming soon...</div>
      )}
    </div>
  );
}
