import { useEffect, useState } from "react";
import { getSubjects, createSubject } from "../../services/subjectService";
import {
  uploadMaterial,
  getMaterials,
  deleteMaterial,
} from "../../services/materialService";

type View = "subjects" | "options" | "upload-lm" | "upload-qa";

export default function QuestionGenerator() {
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [view, setView] = useState<View>("subjects");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [materials, setMaterials] = useState<{ id: string; filename: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"sources" | "generated">("sources");
  const [qaTab, setQaTab] = useState<"sources" | "extracted">("sources");

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const fetchSubjects = () => getSubjects().then(setSubjects);

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
    setError("");
    setSuccess("");
  };

  const goBack = () => {
    if (view === "options") {
      setView("subjects");
      setSelectedSubjectId("");
    } else if (view === "upload-lm" || view === "upload-qa") {
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
      for (let i = 0; i < pendingFiles.length; i++) {
        setUploadingIndex(i);
        setProgress(0);
        await uploadMaterial(selectedSubjectId, pendingFiles[i], (p) =>
          setProgress(p)
        );
      }
      setSuccess(`${pendingFiles.length} file(s) uploaded successfully`);
      setPendingFiles([]);
      fetchMaterials(selectedSubjectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingIndex(null);
      setProgress(0);
    }
  };

  const handleDelete = async (materialId: string) => {
    try {
      await deleteMaterial(materialId);
      fetchMaterials(selectedSubjectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  // ── Tab style helper ──
  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      active
        ? "bg-surface text-secondary border border-border border-b-transparent -mb-px"
        : "text-muted hover:text-text"
    }`;

  // ── VIEW: Subject List ──
  if (view === "subjects") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-secondary text-xl">⚡</span>
          <h2 className="text-xl font-semibold text-text">Question Generator</h2>
        </div>
        <p className="text-sm text-muted mt-1">Select a subject folder to get started.</p>

        <div className="mt-4 flex gap-2">
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New subject name"
            className="flex-1 border border-border rounded-lg px-3 py-2 bg-surface text-text"
          />
          <button
            onClick={handleCreate}
            disabled={!newSubject.trim()}
            className="px-4 py-2 bg-secondary text-white rounded-lg disabled:opacity-50"
          >
            Add Subject
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSubject(s.id)}
              className="flex items-center gap-3 p-4 border border-border rounded-lg bg-surface hover:border-secondary transition-colors text-left"
            >
              <span className="text-lg">📁</span>
              <span className="text-text font-medium">{s.name}</span>
            </button>
          ))}
          {subjects.length === 0 && (
            <p className="text-sm text-muted col-span-full text-center py-8">
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
        <button onClick={goBack} className="text-sm text-secondary hover:underline mb-4">
          ← Back to subjects
        </button>
        <h2 className="text-xl font-semibold text-text">{selectedSubject?.name}</h2>
        <p className="text-sm text-muted mt-1">Choose how you want to generate questions.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => {
              setActiveTab("sources");
              fetchMaterials(selectedSubjectId);
              setView("upload-lm");
            }}
            className="p-6 border-2 border-border rounded-xl bg-surface hover:border-secondary transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-2xl mb-3">
              📚
            </div>
            <h3 className="text-base font-semibold text-text">Upload Learning Materials</h3>
            <p className="text-sm text-muted mt-1">
              Upload PDF/DOCX files as sources, then generate questions from them.
            </p>
          </button>

          <button
            onClick={() => {
              setQaTab("sources");
              setView("upload-qa");
            }}
            className="p-6 border-2 border-border rounded-xl bg-surface hover:border-secondary transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-2xl mb-3">
              📝
            </div>
            <h3 className="text-base font-semibold text-text">Upload Generated Questions</h3>
            <p className="text-sm text-muted mt-1">
              Upload an existing question & answer file to extract and import.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // ── VIEW: Option 1 — Upload Learning Materials ──
  if (view === "upload-lm") {
    return (
      <div className="flex flex-col h-full">
        <button onClick={goBack} className="text-sm text-secondary hover:underline mb-4">
          ← Back to options
        </button>
        <h2 className="text-xl font-semibold text-text">{selectedSubject?.name}</h2>

        {/* Tabs: Sources | Generated */}
        <div className="flex gap-1 mt-4 border-b border-border">
          <button onClick={() => setActiveTab("sources")} className={tabClass(activeTab === "sources")}>
            Sources ({materials.length})
          </button>
          <button onClick={() => setActiveTab("generated")} className={tabClass(activeTab === "generated")}>
            Generated Questions
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-surface border border-border rounded-b-lg rounded-tr-lg p-4 mt-0">
          {activeTab === "sources" && (
            <div>
              {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
              {success && <p className="text-sm text-green-600 mb-2">{success}</p>}

              <label className="block border-2 border-dashed border-secondary/40 rounded-lg p-6 text-center cursor-pointer hover:border-secondary transition-colors">
                <span className="text-sm text-muted">Click to add files (PDF, DOCX)</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {pendingFiles.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-text mb-1">
                    Queue ({pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""})
                  </h4>
                  <ul className="divide-y divide-border border border-border rounded-lg">
                    {pendingFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between px-3 py-2 text-sm text-text"
                      >
                        <span className="truncate mr-2">{f.name}</span>
                        {uploadingIndex === i ? (
                          <span className="text-xs text-secondary font-medium whitespace-nowrap">{progress}%</span>
                        ) : (
                          <button
                            onClick={() => removePendingFile(i)}
                            className="text-red-500 hover:text-red-700 text-xs whitespace-nowrap"
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
                    className="mt-3 w-full px-4 py-2 bg-secondary text-white rounded-lg disabled:opacity-50"
                  >
                    {uploadingIndex !== null
                      ? `Uploading ${uploadingIndex + 1} of ${pendingFiles.length}...`
                      : `Upload All (${pendingFiles.length})`}
                  </button>

                  {uploadingIndex !== null && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {materials.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-text mb-1">Uploaded Sources</h4>
                  <ul className="divide-y divide-border border border-border rounded-lg">
                    {materials.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between px-3 py-2 text-sm text-text"
                      >
                        <span className="truncate mr-2">📄 {m.filename}</span>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-red-500 hover:text-red-700 text-xs whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                disabled={materials.length === 0}
                className="mt-4 w-full px-4 py-3 bg-secondary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Questions from Sources
              </button>
            </div>
          )}

          {activeTab === "generated" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-3xl mb-3">
                ✨
              </div>
              <p className="text-text font-medium">No questions generated yet</p>
              <p className="text-sm text-muted mt-1">
                Upload sources in the Sources tab, then click Generate.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VIEW: Option 2 — Upload Generated Q&A File ──
  if (view === "upload-qa") {
    return (
      <div>
        <button onClick={goBack} className="text-sm text-secondary hover:underline mb-4">
          ← Back to options
        </button>
        <h2 className="text-xl font-semibold text-text">{selectedSubject?.name}</h2>

        {/* Tabs: Sources | Extracted Q&A */}
        <div className="flex gap-1 mt-4 border-b border-border">
          <button onClick={() => setQaTab("sources")} className={tabClass(qaTab === "sources")}>
            Sources
          </button>
          <button onClick={() => setQaTab("extracted")} className={tabClass(qaTab === "extracted")}>
            Extracted Q&A
          </button>
        </div>

        <div className="flex-1 bg-surface border border-border rounded-b-lg rounded-tr-lg p-4 mt-0">
          {qaTab === "sources" && (
            <div>
              <label className="block border-2 border-dashed border-secondary/40 rounded-lg p-8 text-center cursor-pointer hover:border-secondary transition-colors">
                <span className="text-2xl">📋</span>
                <p className="text-sm text-muted mt-2">Click to select a file (PDF, DOCX, CSV)</p>
                <input
                  type="file"
                  accept=".pdf,.docx,.csv"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {pendingFiles.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-text mb-1">
                    Queue ({pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""})
                  </h4>
                  <ul className="divide-y divide-border border border-border rounded-lg">
                    {pendingFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between px-3 py-2 text-sm text-text"
                      >
                        <span className="truncate mr-2">📄 {f.name}</span>
                        <button
                          onClick={() => removePendingFile(i)}
                          className="text-red-500 hover:text-red-700 text-xs whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button className="mt-3 w-full px-4 py-3 bg-secondary text-white rounded-lg font-medium">
                    Extract Questions
                  </button>
                  <p className="text-xs text-muted mt-2 text-center">
                    Extraction is not yet functional. This is a placeholder for future implementation.
                  </p>
                </div>
              )}
            </div>
          )}

          {qaTab === "extracted" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-3xl mb-3">
                📝
              </div>
              <p className="text-text font-medium">No extracted questions yet</p>
              <p className="text-sm text-muted mt-1">
                Upload a Q&A file in the Sources tab, then click Extract.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
