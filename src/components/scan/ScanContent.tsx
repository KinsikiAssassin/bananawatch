"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Upload, RotateCcw, Zap } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { analyzeImage } from "@/actions/analyze";
import { compressImage, fileToBase64 } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
  "Inspecting banana...",
  "Checking spots...",
  "Calculating freshness...",
  "Consulting the banana oracle...",
  "Measuring sweetness levels...",
  "Analyzing peel patterns...",
];

export function ScanContent({ trackerId }: { trackerId?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera, capturePhoto } =
    useCamera();

  useEffect(() => {
    if (mode === "camera" && !preview) startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (cameraError) {
      toast.error(cameraError);
      setMode("upload");
    }
  }, [cameraError]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1500);
    return () => clearInterval(id);
  }, [isAnalyzing]);

  const handleCapture = () => {
    const dataUrl = capturePhoto();
    if (!dataUrl) return;
    setPreview(dataUrl);
    stopCamera();
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => setImageFile(new File([blob], "capture.jpg", { type: "image/jpeg" })));
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setPreview(null);
    setImageFile(null);
    if (mode === "camera") startCamera();
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);
    setMsgIdx(0);
    try {
      const compressed = await compressImage(imageFile);
      const base64 = await fileToBase64(compressed);
      const result = await analyzeImage({ imageBase64: base64, trackerId });
      if (result.success) {
        router.push(`/result/${result.data.scanId}`);
      } else {
        toast.error(result.error);
        setIsAnalyzing(false);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const switchMode = () => {
    stopCamera();
    setPreview(null);
    setImageFile(null);
    setMode((m) => (m === "camera" ? "upload" : "camera"));
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (isAnalyzing) {
    return (
      <div className="flex min-h-[calc(100dvh-129px)] flex-col items-center justify-center gap-8 px-8">
        <div className="relative flex items-center justify-center">
          <div className="text-8xl" style={{ animation: "spin 2.5s linear infinite" }}>🍌</div>
          <div className="absolute inset-0 -m-6 animate-ping rounded-full bg-amber-300/30" />
        </div>
        <div className="text-center">
          <p className="min-h-[28px] text-lg font-semibold text-amber-900">{LOADING_MESSAGES[msgIdx]}</p>
          <p className="mt-1 text-sm text-amber-400">AI is working its magic ✨</p>
        </div>
        <div className="flex gap-2">
          {LOADING_MESSAGES.map((_, i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === msgIdx ? "w-5 bg-amber-400" : "w-1.5 bg-amber-200")} />
          ))}
        </div>
      </div>
    );
  }

  // ─── Preview ──────────────────────────────────────────────────────────────

  if (preview) {
    return (
      <div className="flex flex-col gap-4 px-4 py-5">
        {trackerId && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-100 px-4 py-2.5">
            <span>📍</span>
            <p className="text-sm font-medium text-amber-800">This scan will be added to your tracker</p>
          </div>
        )}
        <div className="overflow-hidden rounded-3xl shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Banana preview" className="w-full object-cover" style={{ maxHeight: "58vh" }} />
        </div>
        <p className="text-center text-xs text-amber-500">Make sure the banana is clearly visible and well-lit</p>
        <div className="flex gap-3">
          <button onClick={handleRetake} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-white py-4 font-semibold text-amber-700 transition active:scale-95">
            <RotateCcw className="h-4 w-4" /> Retake
          </button>
          <button onClick={handleAnalyze} className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 font-bold text-amber-900 shadow-md transition hover:bg-amber-300 active:scale-95">
            <Zap className="h-5 w-5" /> Analyze Banana
          </button>
        </div>
      </div>
    );
  }

  // ─── Camera ───────────────────────────────────────────────────────────────

  if (mode === "camera") {
    return (
      <div className="flex flex-col">
        <div className="relative overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          {!isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
              <p className="text-sm text-amber-400">Starting camera…</p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-52 w-40 rounded-3xl border-2 border-dashed border-white/50" />
          </div>
          <button onClick={switchMode} className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>
        <div className="flex items-center justify-center py-6">
          <button onClick={handleCapture} disabled={!isStreaming} aria-label="Capture photo"
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-amber-300 transition active:scale-90 disabled:opacity-40">
            <div className="h-[58px] w-[58px] rounded-full bg-amber-400" />
          </button>
        </div>
        <p className="pb-2 text-center text-xs text-gray-400">Point at your banana and tap to capture</p>
      </div>
    );
  }

  // ─── Upload ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); e.target.value = ""; }} />
      <div
        role="button" tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
        className={cn("flex cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed px-8 py-14 text-center outline-none transition-all focus-visible:ring-2 focus-visible:ring-amber-400",
          isDragging ? "border-amber-400 bg-amber-100 scale-[1.02]" : "border-amber-300 bg-amber-50 hover:border-amber-400 hover:bg-amber-100")}
        style={{ minHeight: "55vh" }}
      >
        <span className="text-7xl drop-shadow-sm">🍌</span>
        <div>
          <p className="text-lg font-bold text-amber-800">{isDragging ? "Drop it!" : "Tap to upload a photo"}</p>
          <p className="mt-1 text-sm text-amber-500">or drag and drop an image here</p>
        </div>
        <span className="rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-amber-900 shadow-sm">Choose Photo</span>
      </div>
      <button onClick={switchMode} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-white py-3.5 font-medium text-amber-700 transition active:scale-95">
        <Camera className="h-5 w-5" /> Use Camera Instead
      </button>
    </div>
  );
}
