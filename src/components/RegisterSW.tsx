"use client";

import { useEffect } from "react";

/** Enregistre le service worker (production uniquement — §5.3). */
export default function RegisterSW() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* hors ligne ou non supporté : le site fonctionne sans */
      });
    }
  }, []);

  return null;
}
