"use client";

import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";

/** Partage d'un article isolé (§4.3) — Web Share API + copie du lien. */
export default function ShareArticle({
  locale,
  title,
}: {
  locale: Locale;
  title: string;
}) {
  const dict = getDict(locale);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // partage annulé — on retombe sur la copie
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full border border-loyal-200 px-5 py-2.5 text-sm font-bold text-loyal-700 transition hover:border-loyal-700"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 10.6l6.8-4.2M8.6 13.4l6.8 4.2" />
      </svg>
      {copied ? dict.magazine.linkCopied : dict.magazine.share}
    </button>
  );
}
