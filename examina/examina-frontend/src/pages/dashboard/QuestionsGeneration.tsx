import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditModal from "../../components/EditModal";
import { getSubjects, createSubject } from "../../services/subjectService";
import { useActivityStore } from "../../store/activityStore";

type View = "subjects" | "options" | "upload-lm" | "generation" | "upload-qa";

interface UploadedFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  teachingHours?: number;
  teachingMinutes?: number;
  blooms?: { name: string; value: number; color: string }[];
}

export default function QuestionsGeneration() {
  const navigate = useNavigate();
  const addActivity = useActivityStore((s) => s.addActivity);
  const [subjects, setSubjects] = useState<{ subject_id: string; subject_name: string }[]>([]);
  const [view, setView] = useState<View>("subjects");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [materials, setMaterials] = useState<{ id: string; filename: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"sources" | "generated">("sources");
  const [qaTab, setQaTab] = useState<"sources" | "extracted">("sources");

  // Selection mode for subjects
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    action: "archive" | "delete";
    count: number;
  } | null>(null);
  const [deleteFileIndex, setDeleteFileIndex] = useState<number | null>(null);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [uploadedDeleteIndex, setUploadedDeleteIndex] = useState<number | null>(null);

  // Generation settings
  const [fileName, setFileName] = useState("");
  const [mcCount, setMcCount] = useState(36);
  const [tfCount, setTfCount] = useState(24);
  const [promptText, setPromptText] = useState("");
  const totalItems = mcCount + tfCount;
  const [tosExpanded, setTosExpanded] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFileIndex, setEditFileIndex] = useState<number | null>(null);
  const [editBlooms, setEditBlooms] = useState([
    { name: "Remember", value: 30, color: "#eab308" },
    { name: "Understand", value: 20, color: "#f97316" },
    { name: "Apply", value: 20, color: "#ec4899" },
    { name: "Analyze", value: 15, color: "#06b6d4" },
    { name: "Evaluate", value: 10, color: "#0ea5e9" },
    { name: "Create", value: 5, color: "#3b82f6" },
  ]);

  const selectedSubject = subjects.find((s) => s.subject_id === selectedSubjectId);

  // Hide bottomnav on generation view
  useEffect(() => {
    if (view === "generation") {
      document.querySelector("main")?.classList.add("fullpage");
    } else {
      document.querySelector("main")?.classList.remove("fullpage");
    }
    return () => {
      document.querySelector("main")?.classList.remove("fullpage");
    };
  }, [view]);

  const fetchSubjects = () =>
    getSubjects()
      .then(setSubjects)
      .catch(() => setSubjects([]));

  const fetchMaterials = (_subjectId: string) =>
    Promise.resolve([]).then(setMaterials);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async () => {
    if (!newSubject.trim()) return;
    await createSubject({
      subject_code: newSubject.trim().slice(0, 10).toUpperCase().replace(/\s/g, ""),
      subject_name: newSubject.trim(),
      course: "",
      section: "",
      semester: "",
      academic_year: "",
    });
    addActivity({ action: "created", type: "subject", name: newSubject.trim() });
    setNewSubject("");
    fetchSubjects();
  };

  const selectSubject = (id: string) => {
    setSelectedSubjectId(id);
    setView("options");
    setPendingFiles([]);
    setUploadedFiles([]);
    setError("");
    setSuccess("");
    setFileName("");
  };

  // ── Selection helpers ──
  const toggleSubjectSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllSubjects = () => {
    if (selectedIds.size === subjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subjects.map((s) => s.subject_id)));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const executeBulkSubjectAction = () => {
    if (!confirmDialog) return;
    if (confirmDialog.action === "archive") {
      // Optimistic: remove from visible list
      setSubjects((prev) => prev.filter((s) => !selectedIds.has(s.subject_id)));
    } else {
      setSubjects((prev) => prev.filter((s) => !selectedIds.has(s.subject_id)));
    }
    setSelectedIds(new Set());
    setConfirmDialog(null);
    setSelectMode(false);
  };

  const goBack = () => {
    if (view === "options") {
      setView("subjects");
      setSelectedSubjectId("");
    } else if (view === "upload-lm") {
      setView("options");
      setPendingFiles([]);
      setUploadedFiles([]);
      setError("");
      setSuccess("");
    } else if (view === "generation") {
      setView("upload-lm");
    } else if (view === "upload-qa") {
      setView("options");
      setPendingFiles([]);
      setError("");
      setSuccess("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setPendingFiles((prev) => [...prev, ...selected]);
    setError("");
    setSuccess("");
    e.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (!pendingFiles.length || !selectedSubjectId) return;

    setUploadingIndex(0);
    setError("");
    setSuccess("");

    try {
      const uploaded: UploadedFile[] = [];
      for (let i = 0; i < pendingFiles.length; i++) {
        setUploadingIndex(i);
        setProgress(0);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setProgress(100);
        uploaded.push({
          name: pendingFiles[i].name,
          size: pendingFiles[i].size,
          type: pendingFiles[i].type,
          teachingHours: Math.floor(Math.random() * 3) + 1,
        });
      }
      setUploadedFiles((prev) => [...prev, ...uploaded]);
      setSuccess(`${pendingFiles.length} file(s) uploaded successfully`);
      setPendingFiles([]);
      fetchMaterials(selectedSubjectId).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingIndex(null);
      setProgress(0);
    }
  };

  const handleProceedToGeneration = () => {
    if (uploadedFiles.length === 0) return;
    setFileName(`${selectedSubject?.subject_name || "Exam"} - ${new Date().toLocaleDateString()}`);
    setView("generation");
  };

  const handleDelete = async (_materialId: string) => {
    // TODO: Implement delete when backend supports it
  };

  const openEditModal = (index: number) => {
    setEditFileIndex(index);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (data: {
    hours: number;
    minutes: number;
    blooms: { name: string; value: number; color: string }[];
  }) => {
    if (editFileIndex === null) return;
    setUploadedFiles((prev) =>
      prev.map((f, i) =>
        i === editFileIndex
          ? { ...f, teachingHours: data.hours, teachingMinutes: data.minutes, blooms: data.blooms }
          : f
      )
    );
    setEditBlooms(data.blooms);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    addActivity({ action: "generated", type: "exam", name: examName || "Untitled Exam" });
    alert(`Generating ${totalItems} questions from ${uploadedFiles.length} files...${promptText ? `\nPrompt: ${promptText}` : ""}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "PDF";
    if (type.includes("word") || type.includes("docx")) return "DOC";
    return "FILE";
  };

  const getFileIconColor = (type: string) => {
    if (type.includes("pdf")) return "bg-red-100 text-red-600";
    if (type.includes("word") || type.includes("docx")) return "bg-blue-100 text-blue-600";
    return "bg-muted-bg text-text-muted";
  };

  // ── VIEW: Subject List ──
  if (view === "subjects") {
    return (
      <div className="pb-20">
        <button
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text transition-colors hover:bg-muted-bg"
          aria-label="Back"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="mb-1 pl-1.5 text-2xl font-bold text-secondary">Exam Generation</h1>
        <p className="pl-1.5 text-sm text-text-muted">Select a subject folder to get started.</p>

        <div className="mt-4 flex flex-col gap-3 pl-1.5">
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New subject name"
            disabled={selectMode}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-secondary disabled:opacity-50"
          />
          <button
            onClick={handleCreate}
            disabled={!newSubject.trim() || selectMode}
            className="w-full rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
          >
            Add Subject
          </button>
        </div>

        {/* Select all + Cancel | Select row */}
        <div className="mt-3 flex items-center justify-between pl-1.5">
          {selectMode && subjects.length > 0 ? (
            <>
              <button
                onClick={selectAllSubjects}
                className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    selectedIds.size === subjects.length
                      ? "border-secondary bg-secondary"
                      : "border-border"
                  }`}
                >
                  {selectedIds.size === subjects.length && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {selectedIds.size === subjects.length ? "Deselect all" : "Select all"}
              </button>
              <button
                onClick={exitSelectMode}
                className="text-sm font-medium text-secondary transition-colors hover:underline"
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="flex w-full justify-end">
              <button
                onClick={() => setSelectMode(true)}
                disabled={subjects.length === 0}
                className="text-sm font-medium text-secondary transition-colors hover:underline disabled:opacity-50"
              >
                Select
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3">
          {subjects.map((s) => {
            const isSelected = selectedIds.has(s.subject_id);
            return (
              <button
                key={s.subject_id}
                onClick={() =>
                  selectMode
                    ? toggleSubjectSelect(s.subject_id)
                    : selectSubject(s.subject_id)
                }
                className={`flex items-center gap-3 rounded-xl border bg-surface p-4 text-left transition-colors ${
                  selectMode
                    ? isSelected
                      ? "border-secondary bg-secondary/5"
                      : "border-border"
                    : "border-border hover:border-secondary"
                }`}
              >
                {selectMode && (
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      isSelected ? "border-secondary bg-secondary" : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="flex-1 text-base font-medium text-text">{s.subject_name}</span>
                {!selectMode && (
                  <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}
          {subjects.length === 0 && (
            <p className="py-12 text-center text-sm text-text-muted">
              No subjects yet. Create one above.
            </p>
          )}
        </div>

        {/* Bulk actions bar */}
        {selectMode && selectedIds.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface px-4 py-3 shadow-lg">
            <div className="mx-auto flex max-w-lg items-center justify-between">
              <span className="text-sm font-medium text-text">
                {selectedIds.size} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDialog({ action: "archive", count: selectedIds.size })}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-muted-bg"
                >
                  Archive
                </button>
                <button
                  onClick={() => setConfirmDialog({ action: "delete", count: selectedIds.size })}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation dialog */}
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-text">
                {confirmDialog.action === "archive" ? "Archive Subjects" : "Delete Subjects"}
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                {confirmDialog.action === "archive"
                  ? `Are you sure you want to archive ${confirmDialog.count} subject${confirmDialog.count > 1 ? "s" : ""}? They will be moved to the Archived tab.`
                  : `Are you sure you want to permanently delete ${confirmDialog.count} subject${confirmDialog.count > 1 ? "s" : ""}? This action cannot be undone.`}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-muted-bg"
                >
                  Cancel
                </button>
                <button
                  onClick={executeBulkSubjectAction}
                  className={`rounded-full px-4 py-2 text-sm font-medium text-white transition-colors ${
                    confirmDialog.action === "delete"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-secondary hover:bg-secondary/90"
                  }`}
                >
                  {confirmDialog.action === "archive" ? "Archive" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── VIEW: Two Option Boxes ──
  if (view === "options") {
    return (
      <div>
        <button
          onClick={goBack}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text transition-colors hover:bg-muted-bg"
          aria-label="Back"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="mb-2 mt-1 text-2xl font-bold text-secondary pl-1.5">{selectedSubject?.subject_name}</h1>
        <p className="mb-6 text-sm text-text-muted">Choose how you want to generate questions.</p>

        <div className="mt-6 grid gap-4">
          <button
            onClick={() => {
              setActiveTab("sources");
              fetchMaterials(selectedSubjectId);
              setUploadedFiles([]);
              setPendingFiles([]);
              setView("upload-lm");
            }}
            className="rounded-xl border-2 border-border bg-surface p-6 text-left transition-colors hover:border-secondary"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-text">Upload Learning Materials</h3>
            <p className="mt-1 text-sm text-text-muted">
              Upload PDF/DOCX files as sources, then generate questions from them.
            </p>
          </button>

          <button
            onClick={() => {
              setQaTab("sources");
              setView("upload-qa");
            }}
            className="rounded-xl border-2 border-border bg-surface p-6 text-left transition-colors hover:border-secondary"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-text">Import Question Bank</h3>
            <p className="mt-1 text-sm text-text-muted">
              Import a ready-made question file to extract and save.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // ── VIEW: Option 1 — Upload Learning Materials ──
  if (view === "upload-lm") {
    return (
    <>
      <div className="flex flex-col">
        <button
          onClick={goBack}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text transition-colors hover:bg-muted-bg mb-2"
          aria-label="Back"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="mb-4 text-2xl font-bold text-secondary pl-1.5">{selectedSubject?.subject_name}</h1>

        {/* Tabs: Sources | Generated */}
        <div className="mt-4 flex border-b border-border">
          <button
            onClick={() => setActiveTab("sources")}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "sources"
                ? "bg-surface text-secondary border border-border border-b-transparent -mb-px"
                : "text-text-muted hover:text-text"
            }`}
          >
            Sources ({uploadedFiles.length})
          </button>
          <button
            onClick={() => setActiveTab("generated")}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "generated"
                ? "bg-surface text-secondary border border-border border-b-transparent -mb-px"
                : "text-text-muted hover:text-text"
            }`}
          >
            Generated Questions
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-b-lg rounded-tr-lg border border-border bg-surface p-4">
          {activeTab === "sources" && (
            <div>
              {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
              {success && <p className="mb-2 text-sm text-green-600">{success}</p>}

              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-secondary/40 p-8 text-center transition-colors hover:border-secondary">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-secondary">+ Add files</span>
                <span className="mt-1 text-xs text-text-muted">Supported: PDF, DOCX, TXT (max 50MB)</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {pendingFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold text-text">
                    Queue ({pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""})
                  </h4>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {pendingFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${getFileIconColor(f.type)}`}>
                            {getFileIcon(f.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">{f.name}</p>
                            <p className="text-xs text-text-muted">{formatFileSize(f.size)}</p>
                          </div>
                        </div>
                        {uploadingIndex === i ? (
                          <span className="whitespace-nowrap text-xs font-medium text-secondary">{progress}%</span>
                        ) : (
                          <button
                            onClick={() => setPendingDeleteIndex(i)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleUploadAll}
                    disabled={uploadingIndex !== null}
                    className="mt-3 w-full rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {uploadingIndex !== null
                      ? `Uploading ${uploadingIndex + 1} of ${pendingFiles.length}...`
                      : `Upload All (${pendingFiles.length})`}
                  </button>

                  {uploadingIndex !== null && (
                    <div className="mt-2 h-2 w-full rounded-full bg-border">
                      <div
                        className="h-2 rounded-full bg-secondary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold text-text">Uploaded Files</h4>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {uploadedFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${getFileIconColor(f.type)}`}>
                            {getFileIcon(f.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">{f.name}</p>
                            <p className="text-xs text-text-muted">
                              Teaching Hours: {f.teachingHours}h {f.teachingMinutes || 0}m
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setUploadedDeleteIndex(i)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {materials.length > 0 && uploadedFiles.length === 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold text-text">Previously Uploaded Sources</h4>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {materials.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg text-xs font-bold text-text-muted">
                            FILE
                          </div>
                          <span className="truncate text-sm font-medium text-text">{m.filename}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="whitespace-nowrap text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleProceedToGeneration}
                disabled={uploadedFiles.length === 0}
                className="mt-4 w-full rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start Generation
              </button>
            </div>
          )}

          {activeTab === "generated" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-medium text-text">No questions generated yet</p>
              <p className="mt-1 text-sm text-text-muted">
                Upload sources in the Sources tab, then click Generate.
              </p>
            </div>
          )}
        </div>
      </div>

      {pendingDeleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-text">Remove File</h3>
            <p className="mt-2 text-sm text-text-muted">
              Are you sure you want to remove "{pendingFiles[pendingDeleteIndex]?.name}" from the queue?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingDeleteIndex(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removePendingFile(pendingDeleteIndex);
                  setPendingDeleteIndex(null);
                }}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadedDeleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-text">Remove File</h3>
            <p className="mt-2 text-sm text-text-muted">
              Are you sure you want to remove "{uploadedFiles[uploadedDeleteIndex]?.name}"?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setUploadedDeleteIndex(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeUploadedFile(uploadedDeleteIndex);
                  setUploadedDeleteIndex(null);
                }}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    );
  }
  if (view === "generation") {
    const totalHours = uploadedFiles.reduce((sum, f) => sum + (f.teachingHours || 0), 0);

    return (
      <>
      <div className="flex flex-col">
        <button
          onClick={goBack}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text transition-colors hover:bg-muted-bg mb-2"
          aria-label="Back"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="mb-4 text-2xl font-bold text-secondary pl-1.5">{selectedSubject?.subject_name}</h1>

        <div className="flex flex-col gap-5">
          {/* File name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-text">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. Midterm Exam - Math 101"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-secondary"
            />
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-col gap-3">
              {uploadedFiles.map((f, i) => (
                <div key={`${f.name}-${i}`} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${getFileIconColor(f.type)}`}>
                      {getFileIcon(f.type)}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-text">{f.name}</p>
                    <button
                      onClick={() => setDeleteFileIndex(i)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 pl-13">
                    <span className="text-xs text-text-muted">{f.teachingHours || 0}h {f.teachingMinutes || 0}m</span>
                    <button
                      onClick={() => openEditModal(i)}
                      className="rounded-lg border border-secondary px-2.5 py-0.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/10"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Question Types */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-text">Question Types</label>
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
                <span className="text-sm font-medium text-text-muted">MC</span>
                <input
                  type="number"
                  value={mcCount}
                  onChange={(e) => setMcCount(parseInt(e.target.value) || 0)}
                  className="w-12 bg-transparent text-right text-sm font-medium text-text outline-none"
                  min={0}
                />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
                <span className="text-sm font-medium text-text-muted">TF</span>
                <input
                  type="number"
                  value={tfCount}
                  onChange={(e) => setTfCount(parseInt(e.target.value) || 0)}
                  className="w-12 bg-transparent text-right text-sm font-medium text-text outline-none"
                  min={0}
                />
              </div>
              <span className="text-sm font-bold text-text">= {totalItems}</span>
            </div>
          </div>

          {/* TOS collapsible */}
          {uploadedFiles.length > 0 && totalHours > 0 && (
            <div className="rounded-xl border border-border bg-surface">
              <button
                onClick={() => setTosExpanded(!tosExpanded)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-text"
              >
                <span>Table of Specifications</span>
                <svg
                  className={`h-4 w-4 text-text-muted transition-transform ${tosExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {tosExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <div className="flex flex-col gap-3">
                    {uploadedFiles.map((f, i) => {
                      const fileHours = f.teachingHours || 0;
                      const topicWeight = fileHours / totalHours;
                      const mcForFile = Math.round(mcCount * topicWeight);
                      const tfForFile = Math.round(tfCount * topicWeight);
                      const itemsForFile = mcForFile + tfForFile;
                      const fileBlooms = f.blooms || editBlooms;

                      return (
                        <div key={`${f.name}-${i}`} className="rounded-lg bg-muted-bg px-3 py-2.5">
                          <p className="text-sm font-medium text-text">{f.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-muted">
                            <span>{fileHours}h</span>
                            <span className="text-text-muted/40">|</span>
                            <span>MC {mcForFile}</span>
                            <span>TF {tfForFile}</span>
                            <span className="text-text-muted/40">|</span>
                            <span className="font-medium text-text">{itemsForFile} items</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                            {fileBlooms.filter((b) => b.value > 0).map((b) => (
                              <span key={b.name} className="flex items-center gap-1.5 text-xs text-text-muted">
                                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
                                {b.name} {Math.round(itemsForFile * (b.value / 100))}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadedFiles.length > 0 && totalHours === 0 && (
            <p className="text-center text-sm text-text-muted">
              Set teaching hours per file to enable the Table of Specifications.
            </p>
          )}

          {/* Prompt */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-text">Prompt (optional)</label>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Focus on higher-order thinking skills"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-secondary"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={uploadedFiles.length === 0 || totalItems === 0}
            className="w-full rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      </div>

      {editModalOpen && editFileIndex !== null && (
        <EditModal
          fileName={uploadedFiles[editFileIndex]?.name || ""}
          teachingHours={uploadedFiles[editFileIndex]?.teachingHours || 1}
          teachingMinutes={uploadedFiles[editFileIndex]?.teachingMinutes || 0}
          blooms={editBlooms}
          onSave={handleSaveEdit}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {deleteFileIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-text">Remove File</h3>
            <p className="mt-2 text-sm text-text-muted">
              Are you sure you want to remove "{uploadedFiles[deleteFileIndex]?.name}"?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteFileIndex(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeUploadedFile(deleteFileIndex);
                  setDeleteFileIndex(null);
                }}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      </>
    );
  }

  // ── VIEW: Option 2 — Import Question Bank ──
  if (view === "upload-qa") {
    return (
    <>
      <div className="flex flex-col">
        <button
          onClick={goBack}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text transition-colors hover:bg-muted-bg mb-2"
          aria-label="Back"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="mb-4 text-2xl font-bold text-secondary pl-1.5">{selectedSubject?.subject_name}</h1>

        {/* Tabs: Sources | Extracted Q&A */}
        <div className="mt-4 flex border-b border-border">
          <button
            onClick={() => setQaTab("sources")}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              qaTab === "sources"
                ? "bg-surface text-secondary border border-border border-b-transparent -mb-px"
                : "text-text-muted hover:text-text"
            }`}
          >
            Sources ({uploadedFiles.length})
          </button>
          <button
            onClick={() => setQaTab("extracted")}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              qaTab === "extracted"
                ? "bg-surface text-secondary border border-border border-b-transparent -mb-px"
                : "text-text-muted hover:text-text"
            }`}
          >
            Extracted Q&A
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-b-lg rounded-tr-lg border border-border bg-surface p-4">
          {qaTab === "sources" && (
            <div>
              {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
              {success && <p className="mb-2 text-sm text-green-600">{success}</p>}

              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-secondary/40 p-8 text-center transition-colors hover:border-secondary">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-secondary">+ Add files</span>
                <span className="mt-1 text-xs text-text-muted">Supported: PDF, DOCX, CSV (max 50MB)</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.csv"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {pendingFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold text-text">
                    Queue ({pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""})
                  </h4>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {pendingFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${getFileIconColor(f.type)}`}>
                            {getFileIcon(f.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">{f.name}</p>
                            <p className="text-xs text-text-muted">{formatFileSize(f.size)}</p>
                          </div>
                        </div>
                        {uploadingIndex === i ? (
                          <span className="whitespace-nowrap text-xs font-medium text-secondary">{progress}%</span>
                        ) : (
                          <button
                            onClick={() => setPendingDeleteIndex(i)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={uploadingIndex !== null}
                    className="mt-3 w-full rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {uploadingIndex !== null
                      ? `Uploading ${uploadingIndex + 1} of ${pendingFiles.length}...`
                      : `Extract Questions (${pendingFiles.length})`}
                  </button>

                  {uploadingIndex !== null && (
                    <div className="mt-2 h-2 w-full rounded-full bg-border">
                      <div
                        className="h-2 rounded-full bg-secondary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {materials.length > 0 && pendingFiles.length === 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold text-text">Previously Imported</h4>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {materials.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg text-xs font-bold text-text-muted">
                            FILE
                          </div>
                          <span className="truncate text-sm font-medium text-text">{m.filename}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="whitespace-nowrap text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {qaTab === "extracted" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="font-medium text-text">No extracted questions yet</p>
              <p className="mt-1 text-sm text-text-muted">
                Import a question file in the Sources tab, then click Extract.
              </p>
            </div>
          )}
        </div>
      </div>

      {pendingDeleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-text">Remove File</h3>
            <p className="mt-2 text-sm text-text-muted">
              Are you sure you want to remove "{pendingFiles[pendingDeleteIndex]?.name}" from the queue?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingDeleteIndex(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removePendingFile(pendingDeleteIndex);
                  setPendingDeleteIndex(null);
                }}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    );
  }

  return null;
}
