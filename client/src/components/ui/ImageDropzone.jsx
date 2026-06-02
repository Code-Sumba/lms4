import { useRef, useState } from "react";
import { Upload, Link, X, Loader, Image } from "lucide-react";
import api from "../../api/axios";

/**
 * ImageDropzone
 *
 * Props:
 *   value   – current image URL (string)
 *   onChange – called with the new URL string
 *   label   – optional label shown above the zone
 */
export default function ImageDropzone({ value, onChange, label }) {
  const inputRef  = useRef(null);
  const [mode,     setMode]     = useState(value ? "preview" : "drop"); // drop | url | preview
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading,setUploading]= useState(false);
  const [error,    setError]    = useState("");

  const uploadFile = async (file) => {
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed."); return; }
    if (file.size > 5 * 1024 * 1024)    { setError("File must be under 5 MB."); return; }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
      setMode("preview");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const onFileInput = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setMode("preview");
    setUrlInput("");
  };

  const clear = () => {
    onChange("");
    setMode("drop");
    setUrlInput("");
    setError("");
  };

  return (
    <div className="space-y-1.5">
      {label && <span className="label">{label}</span>}

      {/* Preview */}
      {mode === "preview" && value && (
        <div className="relative rounded-lg overflow-hidden border border-surface-border bg-surface group">
          <img src={value} alt="preview" className="w-full max-h-48 object-contain" />
          <button onClick={clear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      {mode === "drop" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors cursor-pointer py-6
            ${dragging ? "border-blue-light bg-blue-500/10" : "border-surface-border hover:border-border-2 bg-surface"}`}>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
          {uploading ? (
            <Loader size={20} className="animate-spin text-slate-400" />
          ) : (
            <Upload size={20} className={dragging ? "text-blue-light" : "text-slate-500"} />
          )}
          <div className="text-center">
            <p className="text-xs font-medium text-slate-300">
              {uploading ? "Uploading…" : dragging ? "Drop to upload" : "Drag & drop an image"}
            </p>
            {!uploading && (
              <p className="text-xs text-slate-600 mt-0.5">or click to browse · max 5 MB</p>
            )}
          </div>
          <button type="button"
            onClick={(e) => { e.stopPropagation(); setMode("url"); }}
            className="flex items-center gap-1 text-xs text-blue-light hover:underline mt-1">
            <Link size={11} /> Use URL instead
          </button>
        </div>
      )}

      {/* URL input */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input className="input text-xs flex-1" type="url"
            placeholder="https://example.com/image.png"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()} />
          <button type="button" onClick={applyUrl}
            className="btn-primary btn-sm px-3 text-xs shrink-0">
            Apply
          </button>
          <button type="button" onClick={() => setMode("drop")}
            className="btn-ghost btn-sm p-1.5 text-slate-400 shrink-0">
            <Image size={13} />
          </button>
        </div>
      )}

      {/* Show URL toggle if already in preview */}
      {mode === "preview" && (
        <div className="flex gap-3">
          <button type="button" onClick={() => { setMode("url"); setUrlInput(value); }}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
            <Link size={11} /> Change URL
          </button>
          <button type="button" onClick={() => { inputRef.current?.click(); }}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
            <Upload size={11} /> Upload new
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
