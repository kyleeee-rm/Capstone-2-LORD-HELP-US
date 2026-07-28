import { useState } from "react";
import { useActivityStore } from "../../store/activityStore";

type LibraryTab = "subjects" | "archived" | "trash" | "reports" | "sheets";

type LibraryItem = {
  id: string;
  name: string;
  type: "subject" | "folder" | "file" | "report" | "sheet";
  subtitle: string;
  deletedAt?: string;
};

const mockSubjects: LibraryItem[] = [
  { id: "1", name: "CS101 - Data Structures", type: "subject", subtitle: "BSCS 3A | 1st Sem 2026" },
  { id: "2", name: "MATH201 - Linear Algebra", type: "subject", subtitle: "BSMATH 2B | 1st Sem 2026" },
];

const mockArchived: LibraryItem[] = [
  { id: "3", name: "CS101 - Intro to Programming", type: "subject", subtitle: "BSCS 1A | 2nd Sem 2025", deletedAt: "2026-07-20" },
  { id: "4", name: "Midterm Exam", type: "folder", subtitle: "CS101 - Data Structures", deletedAt: "2026-07-19" },
];

const mockTrashed: LibraryItem[] = [
  { id: "5", name: "Final Exam", type: "folder", subtitle: "CS101 - Data Structures", deletedAt: "2026-07-15" },
  { id: "6", name: "Lecture Notes.pdf", type: "file", subtitle: "Midterm Exam", deletedAt: "2026-07-10" },
];

const mockReports: LibraryItem[] = [
  { id: "7", name: "Midterm Analysis - CS101", type: "report", subtitle: "Generated Jul 18, 2026 · 60 items" },
  { id: "8", name: "Quiz 1 Analysis - MATH201", type: "report", subtitle: "Generated Jul 12, 2026 · 30 items" },
];

const mockSheets: LibraryItem[] = [
  { id: "9", name: "Answer Sheet - Midterm CS101", type: "sheet", subtitle: "Uploaded Jul 18, 2026 · 45 responses" },
  { id: "10", name: "Answer Sheet - Quiz 1 MATH201", type: "sheet", subtitle: "Uploaded Jul 12, 2026 · 38 responses" },
];

const typeIcons: Record<string, string> = {
  subject: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  file: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  report: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  sheet: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
};

const tabData: { key: LibraryTab; label: string }[] = [
  { key: "subjects", label: "Subjects" },
  { key: "archived", label: "Archived" },
  { key: "trash", label: "Trash" },
  { key: "reports", label: "Reports" },
  { key: "sheets", label: "Sheets" },
];

const mockData: Record<LibraryTab, LibraryItem[]> = {
  subjects: mockSubjects,
  archived: mockArchived,
  trash: mockTrashed,
  reports: mockReports,
  sheets: mockSheets,
};

export default function Library() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("subjects");
  const [items, setItems] = useState(mockData);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const addActivity = useActivityStore((s) => s.addActivity);

  const currentItems = items[activeTab];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleArchive = () => {
    const toArchive = items.subjects.filter((i) => selectedIds.has(i.id));
    toArchive.forEach((i) => addActivity({ action: "archived", type: i.type, name: i.name }));
    setItems((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((i) => !selectedIds.has(i.id)),
      archived: [...prev.archived, ...toArchive.map((i) => ({ ...i, deletedAt: new Date().toISOString().slice(0, 10) }))],
    }));
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleRestore = () => {
    if (activeTab === "archived") {
      const toRestore = items.archived.filter((i) => selectedIds.has(i.id));
      toRestore.forEach((i) => addActivity({ action: "restored", type: i.type, name: i.name }));
      setItems((prev) => ({
        ...prev,
        subjects: [...prev.subjects, ...toRestore.map(({ deletedAt, ...rest }) => rest)],
        archived: prev.archived.filter((i) => !selectedIds.has(i.id)),
      }));
    } else if (activeTab === "trash") {
      const toRestore = items.trash.filter((i) => selectedIds.has(i.id));
      toRestore.forEach((i) => addActivity({ action: "restored", type: i.type, name: i.name }));
      setItems((prev) => ({
        ...prev,
        archived: [...prev.archived, ...toRestore.map((i) => ({ ...i, deletedAt: new Date().toISOString().slice(0, 10) }))],
        trash: prev.trash.filter((i) => !selectedIds.has(i.id)),
      }));
    }
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleDelete = () => {
    items.trash.filter((i) => selectedIds.has(i.id)).forEach((i) => addActivity({ action: "deleted", type: i.type, name: i.name }));
    setItems((prev) => ({
      ...prev,
      trash: prev.trash.filter((i) => !selectedIds.has(i.id)),
    }));
    setSelectedIds(new Set());
    setSelectMode(false);
    setConfirmDeleteId(null);
  };

  const handleRestoreSingle = (id: string) => {
    if (activeTab === "archived") {
      const item = items.archived.find((i) => i.id === id);
      if (item) {
        addActivity({ action: "restored", type: item.type, name: item.name });
        setItems((prev) => ({
          ...prev,
          subjects: [...prev.subjects, { id: item.id, name: item.name, type: item.type as "subject", subtitle: item.subtitle }],
          archived: prev.archived.filter((i) => i.id !== id),
        }));
      }
    } else if (activeTab === "trash") {
      const item = items.trash.find((i) => i.id === id);
      if (item) addActivity({ action: "deleted", type: item.type, name: item.name });
      setItems((prev) => ({
        ...prev,
        trash: prev.trash.filter((i) => i.id !== id),
      }));
    }
  };

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Library</h1>
        {currentItems.length > 0 && (
          selectMode ? (
            <div className="flex items-center gap-2">
              {(activeTab === "archived" || activeTab === "trash") && (
                <button
                  onClick={handleRestore}
                  disabled={selectedIds.size === 0}
                  className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
                >
                  Restore ({selectedIds.size})
                </button>
              )}
              {activeTab === "subjects" && (
                <button
                  onClick={handleArchive}
                  disabled={selectedIds.size === 0}
                  className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
                >
                  Archive ({selectedIds.size})
                </button>
              )}
              {activeTab === "trash" && (
                <button
                  onClick={() => setConfirmDeleteId("bulk")}
                  disabled={selectedIds.size === 0}
                  className="rounded-full bg-error px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-error/90 disabled:opacity-50"
                >
                  Delete Forever ({selectedIds.size})
                </button>
              )}
              <button
                onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
                className="rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-text transition-colors hover:bg-muted-bg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectMode(true)}
              className="rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-text transition-colors hover:bg-muted-bg"
            >
              Select
            </button>
          )
        )}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto border-b border-border">
        {tabData.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); setSelectMode(false); }}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {currentItems.map((item) => (
          <div
            key={item.id}
            onClick={() => selectMode && toggleSelect(item.id)}
            className={`flex items-center gap-3 rounded-xl border bg-surface p-4 transition-colors ${
              selectedIds.has(item.id)
                ? "border-primary bg-primary/5"
                : "border-border"
            } ${selectMode ? "cursor-pointer" : ""}`}
          >
            {selectMode && (
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                selectedIds.has(item.id)
                  ? "border-primary bg-primary"
                  : "border-border-strong"
              }`}>
                {selectedIds.has(item.id) && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[item.type]} />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text">{item.name}</p>
              <p className="text-xs text-text-muted">
                {item.subtitle}
                {item.deletedAt && ` · Deleted ${item.deletedAt}`}
              </p>
            </div>
            {!selectMode && (activeTab === "archived" || activeTab === "trash") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestoreSingle(item.id);
                }}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-text transition-colors hover:bg-muted-bg"
              >
                Restore
              </button>
            )}
          </div>
        ))}
        {currentItems.length === 0 && (
          <p className="py-12 text-center text-sm text-text-muted">
            {activeTab === "subjects" && "No subjects yet."}
            {activeTab === "archived" && "No archived items."}
            {activeTab === "trash" && "Trash is empty."}
            {activeTab === "reports" && "No reports yet."}
            {activeTab === "sheets" && "No sheets uploaded."}
          </p>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-text">Delete Forever?</h3>
            <p className="mb-4 text-sm text-text-muted">
              This action cannot be undone. The item will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-full bg-error px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-error/90"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
