"use client";

import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";

/** Lettre-type « convaincre mon employeur » — copie et téléchargement (.txt). */
export default function EmployerLetter({
  locale,
  letter,
}: {
  locale: Locale;
  letter: string;
}) {
  const dict = getDict(locale);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = locale === "fr" ? "lettre-employeur-cot27.txt" : "employer-letter-cot27.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <pre className="whitespace-pre-wrap rounded-3xl border border-loyal-100 bg-white p-8 font-body text-sm leading-relaxed text-slate-700 shadow-sm">
        {letter}
      </pre>
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={copy}
          className="rounded-full bg-loyal-700 px-8 py-3 font-display text-sm font-bold text-white transition hover:bg-loyal-600"
        >
          {copied ? `✓ ${dict.employer.copied}` : dict.employer.copy}
        </button>
        <button
          onClick={download}
          className="rounded-full border border-loyal-200 px-8 py-3 font-display text-sm font-bold text-loyal-700 transition hover:border-loyal-700"
        >
          ⬇ {dict.employer.download}
        </button>
      </div>
    </div>
  );
}
