"use client";

import { useEffect, useState } from "react";
import type { TemplateMeta } from "@/types/template";

interface TemplateGalleryProps {
  onSelectTemplate: (template: TemplateMeta) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadTemplates() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/templates/manifest.json");
        if (!response.ok) {
          throw new Error("Failed to load templates.");
        }
        const data: TemplateMeta[] = await response.json();
        if (!isCancelled) {
          setTemplates(data);
        }
      } catch {
        if (!isCancelled) {
          setErrorMessage("Не вдалося завантажити шаблони. Спробуйте ще раз.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTemplates();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return <p className="text-zinc-500">Завантаження шаблонів…</p>;
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>;
  }

  if (templates.length === 0) {
    return <p className="text-zinc-500">Немає доступних шаблонів.</p>;
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Оберіть шаблон</h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {templates.map((template) => (
          <li key={template.id}>
            <button
              type="button"
              onClick={() => onSelectTemplate(template)}
              className="block w-full overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors hover:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-100"
            >
              <img
                src={template.imageUrl}
                alt={`Шаблон ${template.id}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
