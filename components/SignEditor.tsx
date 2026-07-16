"use client";

import { useState } from "react";
import type { TemplateMeta } from "@/types/template";
import { FONT_CHOICES } from "@/lib/font-list";
import { generateSignBlob } from "@/lib/canvas-generate";

interface SignEditorProps {
  template: TemplateMeta;
  onBack: () => void;
}

const MAX_TEXT_LENGTH = 200;
const DOWNLOAD_FILENAME = "protest-sign.png";

export function SignEditor({ template, onBack }: SignEditorProps) {
  const [signText, setSignText] = useState("");
  const [selectedFontId, setSelectedFontId] = useState(FONT_CHOICES[0].id);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const imageBlob = await generateSignBlob(
        template,
        signText,
        selectedFontId,
      );
      const nextPreviewUrl = URL.createObjectURL(imageBlob);

      setPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
        }
        return nextPreviewUrl;
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Щось пішло не так.";
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  }

  const remainingCharacters = MAX_TEXT_LENGTH - signText.length;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Назад до шаблонів
        </button>

        <label htmlFor="sign-text" className="text-sm font-medium">
          Текст плаката
        </label>
        <textarea
          id="sign-text"
          value={signText}
          maxLength={MAX_TEXT_LENGTH}
          onChange={(event) => setSignText(event.target.value)}
          rows={5}
          placeholder="Введіть текст…"
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
        />
        <p className="text-right text-sm text-zinc-500">
          Залишилось символів: {remainingCharacters}
        </p>

        <span className="text-sm font-medium">Шрифт</span>
        <div className="flex flex-wrap gap-2">
          {FONT_CHOICES.map((fontChoice) => (
            <button
              key={fontChoice.id}
              type="button"
              onClick={() => setSelectedFontId(fontChoice.id)}
              className={
                selectedFontId === fontChoice.id
                  ? "rounded-full bg-zinc-900 px-3 py-1 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
              }
            >
              {fontChoice.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || signText.trim().length === 0}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isGenerating ? "Генерування…" : "Згенерувати"}
        </button>

        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Попередній перегляд</h2>
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Згенерований протестний плакат"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
            />
            <a
              href={previewUrl}
              download={DOWNLOAD_FILENAME}
              className="self-start rounded-lg border border-zinc-900 px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
            >
              Завантажити PNG
            </a>
          </>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 text-zinc-500 dark:border-zinc-700">
Тут з’явиться ваш згенерований плакат.
          </div>
        )}
      </div>
    </div>
  );
}
