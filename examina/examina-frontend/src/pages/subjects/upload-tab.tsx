import { useEffect, useState } from "react";
import { uploadMaterial, getMaterials, type MaterialListItem } from "../../services/material-service";
import { useActivityStore } from "../../store/activity-store";

export default function UploadTab({ folderId }: { folderId: string }) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [materials, setMaterials] = useState<MaterialListItem[]>([]);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const addActivity = useActivityStore((s) => s.addActivity);

  const fetchMaterials = () => getMaterials(folderId).then(setMaterials).catch(() => setMaterials([]));

  useEffect(() => {
    fetchMaterials();
  }, [folderId]);

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
      fetchMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingIndex(null);
      setProgress(0);
    }
  };

  return (
    <div>
      <label className="mt-2 block cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary">
        <span className="text-sm text-text-muted">Click to add files (PDF, DOCX)</span>
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
          <h4 className="mb-2 text-sm font-semibold text-text">
            Queue ({pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""})
          </h4>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {pendingFiles.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between px-4 py-3 text-sm text-text">
                <span className="truncate mr-2">{f.name}</span>
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

          <button
            onClick={handleUploadAll}
            disabled={uploadingIndex !== null}
            className="mt-3 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {uploadingIndex !== null
              ? `Uploading ${uploadingIndex + 1} of ${pendingFiles.length}...`
              : `Upload All (${pendingFiles.length})`}
          </button>

          {uploadingIndex !== null && (
            <div className="mt-2 h-2 w-full rounded-full bg-border">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}

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

      {materials.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-text">Uploaded Files</h4>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3 text-sm text-text">
                <div>
                  <span className="truncate font-medium">{m.filename}</span>
                  <span className="ml-2 text-xs text-text-muted">
                    {m.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
