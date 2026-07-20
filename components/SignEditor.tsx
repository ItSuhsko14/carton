"use client";

import { useEffect, useState } from "react";
import type { TemplateMeta } from "@/types/template";
import { FONT_CHOICES } from "@/lib/font-list";
import { generateSignBlob } from "@/lib/canvas-generate";
import { TEXT_IDEA_CATEGORIES } from "@/lib/text-ideas";

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
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [isIdeaPickerOpen, setIsIdeaPickerOpen] = useState(false);

  function handleSelectIdea(idea: string) {
    setSignText(idea.slice(0, MAX_TEXT_LENGTH));
    setIsIdeaPickerOpen(false);
  }

  useEffect(() => {
    if (!isIdeaPickerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsIdeaPickerOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isIdeaPickerOpen]);

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

        <div className="flex items-center justify-between">
          <label htmlFor="sign-text" className="text-sm font-medium">
            Текст плаката
          </label>
          <button
            type="button"
            onClick={() => setIsIdeaPickerOpen(true)}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Знайти ідею тексту
          </button>
        </div>
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

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsIdeasOpen((currentIsOpen) => !currentIsOpen)}
            className="self-start text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {isIdeasOpen
              ? "Сховати ідеї"
              : "Шукати ідеї картонок на kartonky.propellercrew.com"}
          </button>

          {isIdeasOpen && (
            <div className="flex flex-col gap-2">
              <iframe
                src="https://kartonky.propellercrew.com/"
                title="Ідеї для тексту картонок"
                className="h-96 w-full rounded-lg border border-zinc-300 dark:border-zinc-700"
              />
              <a
                href="https://kartonky.propellercrew.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="self-start text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Відкрити в новій вкладці: kartonky.propellercrew.com
              </a>
            </div>
          )}
        </div>
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

      {isIdeaPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setIsIdeaPickerOpen(false)}
        >
          <div
            className="my-8 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Ідеї для тексту</h2>
              <button
                type="button"
                onClick={() => setIsIdeaPickerOpen(false)}
                aria-label="Закрити"
                className="text-2xl leading-none text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                ×
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-6">
              {TEXT_IDEA_CATEGORIES.map((category) => (
                <div key={category.title}>
                  <h3 className="text-sm font-medium text-zinc-500">
                    {category.title}
                  </h3>
                  <ul className="mt-2 flex flex-col gap-1">
                    {category.ideas.map((idea) => (
                      <li key={idea}>
                        <button
                          type="button"
                          onClick={() => handleSelectIdea(idea)}
                          className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          {idea}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
