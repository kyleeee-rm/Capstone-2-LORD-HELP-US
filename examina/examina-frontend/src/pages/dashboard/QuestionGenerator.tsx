import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditModal from "../../components/EditModal";
import { getSubjects, createSubject } from "../../services/subjectService";
import {
  uploadMaterial,
  getMaterials,
  deleteMaterial,
} from "../../services/materialService";

type View = "subjects" | "options" | "upload-lm" | "generation" | "upload-qa";

interface UploadedFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  teachingHours?: number;
  teachingMinutes?: number;
  blendedDate?: string;
}

export default function QuestionGenerator() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
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

  // Generation settings
  const [fileName, setFileName] = useState("");
  const [totalItems, setTotalItems] = useState(60);
  const [mcCount, setMcCount] = useState(24);
  const [tfCount, setTfCount] = useState(18);
  const [selectedTypes, setSelectedTypes] = useState({ mc: true, tf: true });

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
  const [editPrompt, setEditPrompt] = useState("");

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

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

  const fetchMaterials = (subjectId: string) =>
    getMaterials(subjectId).then(setMaterials);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async () => {
    if (!newSubject.trim()) return;
    await createSubject(newSubject.trim());
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
          blendedDate: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
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
    setFileName(`${selectedSubject?.name || "Exam"} - ${new Date().toLocaleDateString()}`);
    setView("generation");
  };

  const handleDelete = async (materialId: string) => {
    try {
      await deleteMaterial(materialId);
      fetchMaterials(selectedSubjectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const openEditModal = (index: number) => {
    setEditFileIndex(index);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (data: {
    hours: number;
    minutes: number;
    blooms: { name: string; value: number; color: string }[];
    prompt: string;
  }) => {
    if (editFileIndex === null) return;
    setUploadedFiles((prev) =>
      prev.map((f, i) =>
        i === editFileIndex
          ? { ...f, teachingHours: data.hours, teachingMinutes: data.minutes }
          : f
      )
    );
    setEditBlooms(data.blooms);
    setEditPrompt(data.prompt);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    // TODO: Call generation API
    alert(`Generating ${totalItems} questions from ${uploadedFiles.length} files...`);
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
    return "bg-gray-100 text-gray-600";
  };

  // ── VIEW: Subject List ──
  if (view === "subjects") {
    return (
      <div>
        <button
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text transition-colors hover:bg-muted-bg"
          aria-label="Back"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="mb-4 mt-1 pl-1.5 text-2xl font-bold text-secondary">Exam Generation</h1>
        <p className="pl-1.5 text-sm text-text-muted">Select a subject folder to get started.</p>

        <div className="mt-4 flex gap-2 pl-1.5">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="New subject name"
              className="flex-1 rounded-xl border border-border bg-transparent px-4 py-3 text-base text-text outline-none placeholder:text-text-muted focus:border-secondary"
            />
            <button
              onClick={handleCreate}
              disabled={!newSubject.trim()}
              className="rounded-full bg-secondary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSubject(s.id)}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-secondary"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="flex-1 text-base font-medium text-text">{s.name}</span>
                <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
            {subjects.length === 0 && (
              <p className="py-12 text-center text-sm text-text-muted">
                No subjects yet. Create one above.
              </p>
            )}
          </div>
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
        <h1 className="mb-2 mt-1 text-2xl font-bold text-secondary pl-1.5">{selectedSubject?.name}</h1>
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
        <h1 className="mb-4 text-2xl font-bold text-secondary pl-1.5">{selectedSubject?.name}</h1>

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
            Sources ({materials.length})
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
                  <h4 className="mb-2 text-sm font-medium text-text">
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
                            onClick={() => removePendingFile(i)}
                            className="whitespace-nowrap text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleUploadAll}
                    disabled={uploadingIndex !== null}
                    className="mt-3 w-full rounded-full bg-secondary py-3 text-sm font-medium text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {uploadingIndex !== null
                      ? `Uploading ${uploadingIndex + 1} of ${pendingFiles.length}...`
                      : `Upload All (${pendingFiles.length})`}
                  </button>

                  {uploadingIndex !== null && (
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
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
                  <h4 className="mb-2 text-sm font-medium text-text">Uploaded Files</h4>
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
                              Teaching Hours: {f.teachingHours} | Blended's Date: {f.blendedDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="rounded-lg border border-secondary px-3 py-1 text-xs font-medium text-secondary transition-colors hover:bg-secondary/10">
                            Edit
                          </button>
                          <button
                            onClick={() => removeUploadedFile(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {materials.length > 0 && uploadedFiles.length === 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium text-text">Previously Uploaded Sources</h4>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {materials.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600">
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
                className="mt-4 w-full rounded-full bg-secondary py-3.5 text-base font-medium text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
    );
  }

  // ── VIEW: Generation Settings (screenshot-inspired) ──
  if (view === "generation") {
    const totalHours = uploadedFiles.reduce((sum, f) => sum + (f.teachingHours || 0), 0);
    const otherCount = Math.max(0, totalItems - mcCount - tfCount);

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
        <h1 className="mb-4 text-2xl font-bold text-secondary pl-1.5">{selectedSubject?.name}</h1>

        <div className="flex flex-col gap-5">
          {/* File name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">File name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="File name"
              className="w-full rounded-xl border-2 border-secondary/30 bg-transparent px-4 py-3 text-base text-text outline-none placeholder:text-text-muted focus:border-secondary"
            />
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-col gap-3">
              {uploadedFiles.map((f, i) => (
                <div key={`${f.name}-${i}`} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${getFileIconColor(f.type)}`}>
                      {getFileIcon(f.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">{f.name}</p>
                      <div className="mt-2 flex flex-col gap-1 text-xs text-text-muted">
                        <span>Teaching Hours: {f.teachingHours || 0}h {f.teachingMinutes || 0}m</span>
                        {f.blendedDate && <span>Blended Date: {f.blendedDate}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => openEditModal(i)}
                      className="rounded-lg border border-secondary px-3 py-1 text-xs font-medium text-secondary transition-colors hover:bg-secondary/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeUploadedFile(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Total items:</span>
              <input
                type="number"
                value={totalItems}
                onChange={(e) => setTotalItems(parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-border bg-transparent px-2 py-1 text-right text-sm font-medium text-text outline-none focus:border-secondary"
                min={1}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-text-muted">Total hours:</span>
              <span className="font-medium text-text">{totalHours}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-text-muted">Distribution ({totalItems} items):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={mcCount}
                  onChange={(e) => setMcCount(parseInt(e.target.value) || 0)}
                  className="w-14 rounded-lg border border-border bg-transparent px-2 py-1 text-center text-sm font-medium text-text outline-none focus:border-secondary"
                  min={0}
                />
                <span className="text-text-muted">/</span>
                <input
                  type="number"
                  value={tfCount}
                  onChange={(e) => setTfCount(parseInt(e.target.value) || 0)}
                  className="w-14 rounded-lg border border-border bg-transparent px-2 py-1 text-center text-sm font-medium text-text outline-none focus:border-secondary"
                  min={0}
                />
                {otherCount > 0 && (
                  <>
                    <span className="text-text-muted">/</span>
                    <span className="w-14 text-center text-sm font-medium text-text">{otherCount}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Question types */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-text">Question types</h3>
            <div className="flex flex-col gap-2.5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTypes.mc}
                  onChange={(e) => setSelectedTypes((prev) => ({ ...prev, mc: e.target.checked }))}
                  className="h-5 w-5 rounded border-border accent-secondary"
                />
                <span className="text-sm text-text">Multiple Choice</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTypes.tf}
                  onChange={(e) => setSelectedTypes((prev) => ({ ...prev, tf: e.target.checked }))}
                  className="h-5 w-5 rounded border-border accent-secondary"
                />
                <span className="text-sm text-text">True or False</span>
              </label>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={uploadedFiles.length === 0 || totalItems === 0}
            className="w-full rounded-full bg-secondary py-4 text-base font-semibold text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
          prompt={editPrompt}
          onSave={handleSaveEdit}
          onClose={() => setEditModalOpen(false)}
        />
      )}
      </>
    );
  }

  // ── VIEW: Option 2 — Import Question Bank ──
  if (view === "upload-qa") {
    return (
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
        <h1 className="mb-4 text-2xl font-bold text-secondary pl-1.5">{selectedSubject?.name}</h1>

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
            Sources ({materials.length})
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
                  <h4 className="mb-2 text-sm font-medium text-text">
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
                            onClick={() => removePendingFile(i)}
                            className="whitespace-nowrap text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={uploadingIndex !== null}
                    className="mt-3 w-full rounded-full bg-secondary py-3 text-sm font-medium text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {uploadingIndex !== null
                      ? `Uploading ${uploadingIndex + 1} of ${pendingFiles.length}...`
                      : `Extract Questions (${pendingFiles.length})`}
                  </button>

                  {uploadingIndex !== null && (
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
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
                  <h4 className="mb-2 text-sm font-medium text-text">Previously Imported</h4>
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {materials.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600">
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
    );
  }

  return null;
}
