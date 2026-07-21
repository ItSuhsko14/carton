"use client";

import { useCallback, useEffect, useState } from "react";
import type { TemplateMeta } from "@/types/template";
import { DEFAULT_FONT_ID } from "@/lib/font-list";
import { generateSignBlob } from "@/lib/canvas-generate";
import { TEXT_IDEA_CATEGORIES } from "@/lib/text-ideas";
import {
  canShareImageFile,
  canCopyImage,
  shareImageFile,
  copyImageToClipboard,
  shareAppLink,
} from "@/lib/share";
import {
  DownloadIcon,
  ShareIcon,
  CopyIcon,
  CheckIcon,
  InviteFriendsIcon,
} from "./icons";

interface SignEditorProps {
  template: TemplateMeta;
  onBack: () => void;
}

const MAX_TEXT_LENGTH = 200;
const DOWNLOAD_FILENAME = "protest-sign.png";
const AUTO_GENERATE_DELAY_MS = 2000;

export function SignEditor({ template, onBack }: SignEditorProps) {
  const [signText, setSignText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedSignature, setGeneratedSignature] = useState<string | null>(
    null,
  );
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [isIdeaPickerOpen, setIsIdeaPickerOpen] = useState(false);

  function handleSelectIdea(idea: string) {
    const nextText = idea.slice(0, MAX_TEXT_LENGTH);
    setSignText(nextText);
    setIsIdeaPickerOpen(false);
    void generatePreview(nextText);
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

  const generatePreview = useCallback(
    async (textOverride?: string) => {
      setIsGenerating(true);
      setErrorMessage(null);

      try {
        const textToRender = textOverride ?? signText;
        const imageBlob = await generateSignBlob(
          template,
          textToRender,
          DEFAULT_FONT_ID,
        );
        const nextPreviewUrl = URL.createObjectURL(imageBlob);

        setGeneratedFile(
          new File([imageBlob], DOWNLOAD_FILENAME, { type: imageBlob.type }),
        );
        setPreviewUrl((currentPreviewUrl) => {
          if (currentPreviewUrl) {
            URL.revokeObjectURL(currentPreviewUrl);
          }
          return nextPreviewUrl;
        });
        setGeneratedSignature(`${template.id}|${textToRender}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Щось пішло не так.";
        setErrorMessage(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [template, signText],
  );

  useEffect(() => {
    if (signText.trim().length === 0) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      void generatePreview();
    }, AUTO_GENERATE_DELAY_MS);

    return () => clearTimeout(debounceTimer);
  }, [generatePreview, signText]);

  const remainingCharacters = MAX_TEXT_LENGTH - signText.length;
  const currentSignature = `${template.id}|${signText}`;
  const isAlreadyGenerated = currentSignature === generatedSignature;
  const hasText = signText.trim().length > 0;

  let generationStatus = "";
  if (isGenerating) {
    generationStatus = "Генеруємо зображення…";
  } else if (hasText && !isAlreadyGenerated) {
    generationStatus = "Оновимо зображення за мить…";
  } else if (isAlreadyGenerated) {
    generationStatus = "Зображення оновлено";
  }

  const canShareGenerated =
    generatedFile !== null && canShareImageFile(generatedFile);
  const canCopyGenerated = generatedFile !== null && canCopyImage();

  async function handleShareImage() {
    if (!generatedFile) {
      return;
    }
    try {
      await shareImageFile(generatedFile);
    } catch {
      setErrorMessage("Не вдалося поділитися зображенням.");
    }
  }

  async function handleCopyImage() {
    if (!generatedFile) {
      return;
    }
    try {
      await copyImageToClipboard(generatedFile);
      setIsImageCopied(true);
      setTimeout(() => setIsImageCopied(false), 2000);
    } catch {
      setErrorMessage("Не вдалося скопіювати зображення.");
    }
  }

  async function handleShareAppLink() {
    const result = await shareAppLink();
    if (result === "copied") {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } else if (result === "unavailable") {
      setErrorMessage("Не вдалося поділитися посиланням.");
    }
  }

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

        <label
          htmlFor="sign-text"
          className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Текст для картонки
        </label>

        <button
          type="button"
          onClick={() => setIsIdeaPickerOpen(true)}
          className="self-start text-left text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Знайти ідею тексту
        </button>
        <button
          type="button"
          onClick={() => setIsIdeasOpen((currentIsOpen) => !currentIsOpen)}
          className="self-start text-left text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {isIdeasOpen
            ? "Сховати галерею картонок kartonky.propellercrew.com"
            : "Підгледіти ідеї в галереї картонок kartonky.propellercrew.com"}
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

        <div className="flex h-6 items-center gap-2 text-sm text-zinc-500">
          {isGenerating && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
          )}
          <span>{generationStatus}</span>
        </div>

        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </div>

      <div className="flex flex-col gap-4">
        {previewUrl ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={previewUrl}
                download={DOWNLOAD_FILENAME}
                title="Завантажити зображення"
                aria-label="Завантажити зображення"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
              >
                <DownloadIcon />
              </a>
              {canShareGenerated && (
                <button
                  type="button"
                  onClick={handleShareImage}
                  title="Поділитися зображенням"
                  aria-label="Поділитися зображенням"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
                >
                  <ShareIcon />
                </button>
              )}
              {canCopyGenerated && (
                <button
                  type="button"
                  onClick={handleCopyImage}
                  title={isImageCopied ? "Скопійовано" : "Скопіювати зображення"}
                  aria-label={
                    isImageCopied ? "Скопійовано" : "Скопіювати зображення"
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
                >
                  {isImageCopied ? <CheckIcon /> : <CopyIcon />}
                </button>
              )}
              <button
                type="button"
                onClick={handleShareAppLink}
                title={isLinkCopied ? "Посилання скопійовано" : "Розкажи про нас друзям"}
                aria-label={
                  isLinkCopied ? "Посилання скопійовано" : "Розкажи про нас друзям"
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
              >
                {isLinkCopied ? <CheckIcon /> : <InviteFriendsIcon />}
              </button>
            </div>
            <img
              src={previewUrl}
              alt="Згенерований протестний плакат"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
            />
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
