import React, { useState, useRef, useEffect } from "react";
import { Camera, StopCircle, RefreshCw, CheckCircle2, Video, Upload } from "lucide-react";
import { toast } from "sonner";

interface VideoCaptureProps {
  onCapture: (base64: string | null) => void;
  value: string | null;
  label: string;
}

export function VideoCapture({ onCapture, value, label }: VideoCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<"idle" | "preview" | "recording" | "done">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Use a ref for chunks to avoid stale-closure issues with React state
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) setMode("done");
  }, [value]);

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

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : undefined;

    const recorder = new MediaRecorder(previewStream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      // Use chunksRef.current — not stale state
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
        setMode("done");
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
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file must be under 100 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture(reader.result as string);
      setMode("done");
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    onCapture(null);
    setMode("idle");
    chunksRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        ${mode === "done" ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-slate-900"}`}>

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
                <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Recording</span>
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
