import { useEffect, useState } from "react";
import { uploadMaterial, getMaterials, deleteMaterial } from "../../services/materialService";

export default function UploadTab({ subjectId }: { subjectId: string }) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [materials, setMaterials] = useState<{ id: string; filename: string }[]>([]);

  const fetchMaterials = () => getMaterials(subjectId).then(setMaterials);

  useEffect(() => {
    fetchMaterials();
  }, [subjectId]);

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
        await uploadMaterial(subjectId, pendingFiles[i], (p) => setProgress(p));
      }
      setSuccess(`${pendingFiles.length} file(s) uploaded successfully`);
      setPendingFiles([]);
      fetchMaterials();
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
      fetchMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-text">Upload Learning Material</h2>

      <label className="mt-2 block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
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
          <h4 className="text-sm font-medium text-text mb-1">Queue ({pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""})</h4>
          <ul className="divide-y divide-border border border-border rounded-lg">
            {pendingFiles.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between px-3 py-2 text-sm text-text bg-surface">
                <span className="truncate mr-2">{f.name}</span>
                {uploadingIndex === i ? (
                  <span className="text-xs text-muted whitespace-nowrap">{progress}%</span>
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
            className="mt-3 w-full px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            {uploadingIndex !== null
              ? `Uploading ${uploadingIndex + 1} of ${pendingFiles.length}...`
              : `Upload All (${pendingFiles.length})`}
          </button>

          {uploadingIndex !== null && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}

      {materials.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-text mb-1">Uploaded Files</h4>
          <ul className="divide-y divide-border border border-border rounded-lg">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-3 py-2 text-sm text-text bg-surface">
                <span className="truncate mr-2">{m.filename}</span>
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
    </div>
  );
}
