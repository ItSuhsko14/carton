"use client";

import { useRef, useState } from "react";
import type { Point } from "@/types/template";
import CornerMarkers from "@/components/admin/CornerMarkers";

interface DisplayedSize {
  width: number;
  height: number;
}

type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "success"; id: string }
  | { kind: "error"; message: string };

const CORNER_LABELS = [
  "top-left",
  "top-right",
  "bottom-right",
  "bottom-left",
] as const;

const ADMIN_SERVER_URL = "http://localhost:4000/save-template";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read the image file"));
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const imageElementRef = useRef<HTMLImageElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<DisplayedSize | null>(null);
  const [displayedSize, setDisplayedSize] = useState<DisplayedSize | null>(null);
  const [originalPoints, setOriginalPoints] = useState<Point[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: "idle" });

  const allPointsPlaced = originalPoints.length === 4;
  const nextCornerLabel = CORNER_LABELS[originalPoints.length];

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }
    if (imageObjectUrl) {
      URL.revokeObjectURL(imageObjectUrl);
    }
    setImageFile(selectedFile);
    setImageObjectUrl(URL.createObjectURL(selectedFile));
    setNaturalSize(null);
    setDisplayedSize(null);
    setOriginalPoints([]);
    setSaveStatus({ kind: "idle" });
  }

  function handleImageLoad() {
    const imageElement = imageElementRef.current;
    if (!imageElement) {
      return;
    }
    setNaturalSize({
      width: imageElement.naturalWidth,
      height: imageElement.naturalHeight,
    });
    setDisplayedSize({
      width: imageElement.clientWidth,
      height: imageElement.clientHeight,
    });
  }

  function handleImageClick(event: React.MouseEvent<HTMLImageElement>) {
    if (allPointsPlaced || !naturalSize) {
      return;
    }
    const imageElement = imageElementRef.current;
    if (!imageElement) {
      return;
    }
    const boundingRect = imageElement.getBoundingClientRect();
    const displayedX = event.clientX - boundingRect.left;
    const displayedY = event.clientY - boundingRect.top;
    const horizontalRatio = naturalSize.width / boundingRect.width;
    const verticalRatio = naturalSize.height / boundingRect.height;
    const originalPoint: Point = {
      x: Math.round(displayedX * horizontalRatio),
      y: Math.round(displayedY * verticalRatio),
    };
    setOriginalPoints((currentPoints) => [...currentPoints, originalPoint]);
  }

  function handleResetPoints() {
    setOriginalPoints([]);
    setSaveStatus({ kind: "idle" });
  }

  async function handleSaveTemplate() {
    if (!imageFile || !allPointsPlaced) {
      return;
    }
    setSaveStatus({ kind: "saving" });

    try {
      const imageBase64 = await readFileAsDataUrl(imageFile);
      const response = await fetch(ADMIN_SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, corners: originalPoints }),
      });
      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        setSaveStatus({
          kind: "error",
          message: errorBody.error ?? "Failed to save template",
        });
        return;
      }
      const successBody = (await response.json()) as { id: string };
      setSaveStatus({ kind: "success", id: successBody.id });
    } catch {
      setSaveStatus({
        kind: "error",
        message: "Cannot reach the admin server. Run: npm run admin",
      });
    }
  }

  const displayedPoints: Point[] =
    naturalSize && displayedSize
      ? originalPoints.map((point) => ({
          x: (point.x / naturalSize.width) * displayedSize.width,
          y: (point.y / naturalSize.height) * displayedSize.height,
        }))
      : [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Create sign template</h1>

      <div className="rounded border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        <p className="font-medium">Local tool only</p>
        <p className="mt-1">
          This page saves templates through a local server. Start it with{" "}
          <code>npm run admin</code> before saving. Templates are written to{" "}
          <code>public/templates/</code> and are not part of the deployed app.
        </p>
      </div>

      <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <p className="font-medium">Use a blank cardboard photo</p>
        <p className="mt-1">
          The generated text is drawn on top of the photo. If the cardboard
          already has writing on it, that writing will show through. Pick an
          image with an empty sign.
        </p>
      </div>

      <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
        <li>Upload a photo of a blank cardboard sign.</li>
        <li>
          Click the four corners of the writable area{" "}
          <strong>in this exact order</strong>: top-left → top-right →
          bottom-right → bottom-left (clockwise from the top-left).
        </li>
        <li>
          Click along the <strong>inner clean edge</strong> of the cardboard,
          slightly inside the border, so the text keeps a margin.
        </li>
        <li>Save. Wrong order makes the text skew — use Reset to redo.</li>
      </ol>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm"
      />

      {imageObjectUrl && (
        <div className="relative inline-block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageElementRef}
            src={imageObjectUrl}
            alt="Template source"
            onLoad={handleImageLoad}
            onClick={handleImageClick}
            className="block h-auto w-full cursor-crosshair select-none"
          />
          {displayedSize && (
            <CornerMarkers
              displayedPoints={displayedPoints}
              displayedWidth={displayedSize.width}
              displayedHeight={displayedSize.height}
            />
          )}
        </div>
      )}

      {imageObjectUrl && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {allPointsPlaced ? (
            <span className="font-medium text-green-600">
              All 4 corners placed. Review the outline, then save.
            </span>
          ) : (
            <>
              {originalPoints.length} of 4 corners placed — next click:{" "}
              <span className="font-medium text-blue-600">
                {nextCornerLabel}
              </span>
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleResetPoints}
          disabled={originalPoints.length === 0}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700"
        >
          Reset points
        </button>
        <button
          type="button"
          onClick={handleSaveTemplate}
          disabled={!allPointsPlaced || saveStatus.kind === "saving"}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          {saveStatus.kind === "saving" ? "Saving..." : "Save template"}
        </button>
      </div>

      {saveStatus.kind === "success" && (
        <p className="text-sm text-green-600">
          Template saved with id: {saveStatus.id}
        </p>
      )}
      {saveStatus.kind === "error" && (
        <p className="text-sm text-red-600">{saveStatus.message}</p>
      )}
    </main>
  );
}
