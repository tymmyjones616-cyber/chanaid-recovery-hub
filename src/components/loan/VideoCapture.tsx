import React, { useState, useRef, useEffect } from "react";
import { Camera, StopCircle, RefreshCw, CheckCircle2, Video, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VideoCaptureProps {
  onCapture: (base64: string | null) => void;
  value: string | null;
  label: string;
  progress?: number;
}

export function VideoCapture({ onCapture, value, label, progress }: VideoCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<"idle" | "preview" | "recording" | "uploading" | "done">("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Use a ref for chunks to avoid stale-closure issues with React state
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isUploading = typeof progress === "number" && progress > 0 && progress < 100;
  const pct = Math.min(Math.round(progress ?? 0), 100);

  useEffect(() => {
    if (value && !isUploading) setMode("done");
    else if (isUploading) setMode("uploading");
  }, [value, isUploading]);

  // Clean up recording timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPreviewStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode("preview");
    } catch {
      toast.error("Could not access camera. Please check permissions or upload a video file instead.");
    }
  };

  const startRecording = () => {
    if (!previewStream) return;
    chunksRef.current = [];
    setRecordingTime(0);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : undefined;

    const recorder = new MediaRecorder(previewStream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

      // Use chunksRef.current — not stale state
      const blob = new Blob(chunksRef.current, { type: "video/webm" });

      // Enforce 15 MB limit
      if (blob.size > 15 * 1024 * 1024) {
        toast.error("Video file is too large. Please record a shorter clip (under 15 MB).");
        setMode("idle");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setMode("uploading");
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(blob);

      if (previewStream) {
        previewStream.getTracks().forEach((t) => t.stop());
        setPreviewStream(null);
      }
    };

    recorder.start(250); // collect chunks every 250 ms
    setIsRecording(true);
    setMode("recording");

    // Timer for recording duration
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);

    // Auto-stop after 15 seconds
    setTimeout(() => {
      if (recorder.state === "recording") stopRecording();
    }, 15000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Video file must be under 15 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMode("uploading");
      onCapture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    onCapture(null);
    setMode("idle");
    setRecordingTime(0);
    chunksRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-bold text-slate-800">{label}</span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
          Required Video
        </span>
      </div>

      <div className={`relative rounded-2xl overflow-hidden border-2 transition-all min-h-[300px] flex flex-col items-center justify-center
        ${mode === "done" ? "border-emerald-400 bg-emerald-50" : mode === "uploading" ? "border-primary bg-primary/5" : "border-slate-300 bg-slate-900"}`}>

        {mode === "idle" && (
          <div className="text-center p-8 space-y-5 w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <Video className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Video Selfie — Holding ID Card</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Record or upload a short video showing your face and holding the front and back of your government-issued ID card.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={startPreview}
                className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 justify-center"
              >
                <Camera className="w-4 h-4" /> Record with Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-700 text-slate-200 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-slate-600 transition-all flex items-center gap-2 justify-center"
              >
                <Upload className="w-4 h-4" /> Upload Video File
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {(mode === "preview" || mode === "recording") && (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 pointer-events-none flex flex-col items-center justify-between p-6">
              <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-white/20">
                <p className="text-white text-[11px] font-bold text-center">
                  {mode === "preview"
                    ? "Align your face — then press Record"
                    : "Show ID front, then back — state your full name"}
                </p>
              </div>

              {mode === "recording" && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Recording</span>
                    <span className="text-[11px] font-mono font-bold tabular-nums ml-1">{formatTime(recordingTime)}</span>
                  </div>
                  {/* Recording time bar */}
                  <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${Math.min((recordingTime / 15) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pointer-events-auto">
                {mode === "preview" ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl hover:scale-110 transition-all"
                    title="Start Recording"
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-4 border-red-600 shadow-xl hover:scale-110 transition-all"
                    title="Stop Recording"
                  >
                    <StopCircle className="w-6 h-6 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Uploading state ── */}
        {mode === "uploading" && (
          <div className="flex flex-col items-center gap-5 p-10 w-full max-w-sm">
            {/* Animated spinner with pulsing ring */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: "1.5s" }} />
              </div>
            </div>

            {/* Status text */}
            <div className="text-center">
              <h4 className="text-slate-900 font-bold text-sm mb-1">Uploading Video</h4>
              <p className="text-slate-500 text-[11px]">Encrypting and uploading to secure storage…</p>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-2">
              <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                {/* Animated gradient fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7, #ec4899, #6366f1)",
                    backgroundSize: "300% 100%",
                    animation: "shimmer 2s infinite linear",
                  }}
                />
                {/* Glow effect on the leading edge */}
                <div
                  className="absolute inset-y-0 rounded-full opacity-50 blur-md transition-all duration-500"
                  style={{
                    width: `${Math.min(pct + 12, 100)}%`,
                    left: 0,
                    background: "linear-gradient(90deg, transparent 50%, #8b5cf6)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Processing…
                </span>
                <span className="text-sm font-black text-primary tabular-nums">{pct}%</span>
              </div>
            </div>
          </div>
        )}

        {mode === "done" && (
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-emerald-900 font-bold mb-1">Video Captured</h4>
            <p className="text-emerald-600 text-xs mb-5">
              Video selfie with ID ready for submission.
            </p>
            <button
              type="button"
              onClick={reset}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider hover:bg-slate-300 transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake / Replace
            </button>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h5 className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Verification Checklist</h5>
        <ul className="space-y-1.5">
          {[
            "Face clearly visible throughout the video",
            "State your full name clearly",
            "Hold ID card FRONT to camera for 3 seconds",
            "Hold ID card BACK to camera for 3 seconds",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-[11px] text-slate-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
