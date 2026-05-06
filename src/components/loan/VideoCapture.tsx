import React, { useRef, useEffect } from "react";
import { CheckCircle2, Video, Upload, RefreshCw, FileVideo, X } from "lucide-react";
import { toast } from "sonner";
import { PremiumProgressBar } from "../ui/PremiumProgressBar";

interface VideoCaptureProps {
  onCapture: (base64: string | null) => void;
  value: string | null;
  label: string;
  progress?: number;
}

export function VideoCapture({ onCapture, value, label, progress }: VideoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const isUploading = typeof progress === "number" && progress > 0 && progress < 100;
  const isDone = Boolean(value) && !isUploading;
  const pct = Math.min(Math.round(progress ?? 0), 100);

  // Sync done state
  useEffect(() => {
    if (!value) setFileName(null);
  }, [value]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Video file must be under 15 MB.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  };

  const reset = () => {
    onCapture(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-800">{label}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          isDone ? "bg-emerald-100 text-emerald-700" : "bg-fuchsia-100 text-fuchsia-700"
        }`}>
          {isDone ? "Uploaded" : "Required"}
        </span>
      </div>

      {/* Upload area */}
      {isUploading ? (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
          <PremiumProgressBar
            progress={pct}
            status={pct < 100 ? "uploading" : "processing"}
            fileName={fileName ?? "video-selfie"}
          />
        </div>
      ) : isDone ? (
        /* ── Done state ── */
        <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-emerald-900 text-sm">Video uploaded successfully</p>
            {fileName && (
              <p className="text-[11px] text-emerald-600 font-medium truncate mt-0.5">{fileName}</p>
            )}
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold uppercase tracking-wider">Ready for submission</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-all group"
            title="Remove and re-upload"
          >
            <X className="w-4 h-4 text-emerald-700 group-hover:text-emerald-900" />
          </button>
        </div>
      ) : (
        /* ── Idle / Upload state ── */
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-900 overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Video className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Video Selfie — Holding ID Card</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Short video of your face while holding your government-issued ID</p>
            </div>
          </div>

          {/* Upload zone */}
          <label className="group flex flex-col items-center justify-center gap-4 px-6 py-10 cursor-pointer hover:bg-white/5 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
              <Upload className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm mb-1">
                <span className="text-primary group-hover:underline">Choose video file</span>
                {" "}or drag and drop
              </p>
              <p className="text-slate-500 text-[11px]">MP4, MOV, WEBM · Max 15 MB · 5–30 seconds</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all">
              <FileVideo className="w-3.5 h-3.5" />
              Upload Video File
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {/* Checklist */}
      {!isDone && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h5 className="text-[10px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">What to include in your video</h5>
          <ul className="space-y-2">
            {[
              "Face clearly visible throughout the video",
              "State your full name clearly",
              "Hold ID card FRONT to camera for 3 seconds",
              "Hold ID card BACK to camera for 3 seconds",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-[11px] text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
