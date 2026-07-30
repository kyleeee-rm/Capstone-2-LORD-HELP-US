import { useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { getFolders, createFolder, type SubjectFolder } from "../../services/subjectFolderService";
import UploadTab from "./UploadTab";

export default function SubjectFolder() {
  const { id: subjectId } = useParams();
  const [folders, setFolders] = useState<SubjectFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [activeTab, setActiveTab] = useState<"materials" | "questions">("materials");

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
      setNewFolderName("");
      fetchFolders();
    } catch {
      // handle error
    }
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
            className="flex-1 rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
          />
          <button
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim()}
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Add Folder
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {folders.map((f) => (
            <button
              key={f.folder_id}
              onClick={() => setSelectedFolderId(f.folder_id)}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text">{f.folder_name}</p>
                {f.description && <p className="text-xs text-text-muted">{f.description}</p>}
              </div>
              <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
          {folders.length === 0 && (
            <p className="py-12 text-center text-sm text-text-muted">
              No folders yet. Create one above.
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
