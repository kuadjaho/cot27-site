"use client";

import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";

/**
 * Partage d'un article (§4.3). WhatsApp d'abord — c'est le canal dominant au
 * Bénin et le vecteur naturel de diffusion dans les groupes de clubs — avec un
 * message déjà rédigé dans la langue de la page. Le bouton générique (Web Share
 * ou copie du lien) reste en repli pour les autres canaux.
 */
export default function ShareArticle({
  locale,
  title,
}: {
  locale: Locale;
  title: string;
}) {
  const dict = getDict(locale);
  const [copied, setCopied] = useState(false);

  function shareWhatsapp() {
    const url = window.location.href;
    const message = `${dict.magazine.shareWaLead.replace("{title}", title)}\n\n${url}`;
    // wa.me ouvre l'app sur mobile, WhatsApp Web sur ordinateur.
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function shareGeneric() {
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
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={shareWhatsapp}
        className="inline-flex items-center gap-2 rounded-full bg-[#1ea952] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#199548]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.16c-.24.68-1.42 1.32-1.96 1.36-.5.05-.98.23-3.3-.7-2.78-1.1-4.56-3.94-4.7-4.12-.14-.18-1.13-1.5-1.13-2.86 0-1.36.71-2.03.97-2.31.24-.26.53-.32.7-.32.18 0 .35.002.5.01.16.007.38-.06.59.45.24.58.8 1.98.87 2.12.07.14.12.3.02.48-.09.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.29.29-.12.57.17.28.74 1.22 1.6 1.98 1.1.98 2.03 1.29 2.32 1.43.29.14.46.12.63-.07.18-.2.72-.84.91-1.13.19-.28.38-.24.64-.14.26.09 1.66.78 1.94.93.28.14.47.21.53.32.07.11.07.62-.17 1.3Z" />
        </svg>
        {dict.magazine.shareWhatsapp}
      </button>

      <button
        onClick={shareGeneric}
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
    </div>
  );
}
