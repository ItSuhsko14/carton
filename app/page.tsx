"use client";

import { useState } from "react";
import type { TemplateMeta } from "@/types/template";
import { AppHeader } from "@/components/AppHeader";
import { TemplateGallery } from "@/components/TemplateGallery";
import { SignEditor } from "@/components/SignEditor";
import { AboutContent } from "@/components/AboutContent";

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMeta | null>(
    null,
  );

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {selectedTemplate ? (
          <SignEditor
            template={selectedTemplate}
            onBack={() => setSelectedTemplate(null)}
          />
        ) : (
          <>
            <TemplateGallery onSelectTemplate={setSelectedTemplate} />
            <AboutContent />
          </>
        )}
      </main>
    </div>
  );
}
