"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";

type Statut = "en_attente" | "payee" | "annulee";

/**
 * Bannière de statut de paiement, réactive. Après un paiement Mobile Money, le
 * webhook FedaPay confirme souvent avec du retard sur réseau congestionné : le
 * participant atterrit sur « en attente » et doute d'avoir payé. Ce composant
 * interroge un point d'API léger et bascule sur « confirmé ✓ » dès l'arrivée du
 * webhook, sans rechargement — fermant la boucle du doute.
 *
 * Ne sonde QUE pour un paiement en ligne encore en attente. Se met en pause
 * quand l'onglet est masqué (données économisées) et plafonne les essais ;
 * passé ce plafond, l'e-mail de confirmation prend le relais.
 */
export default function PaymentStatus({
  locale,
  refToken,
  initialStatut,
  modePaiement,
  reference,
}: {
  locale: Locale;
  refToken: string;
  initialStatut: Statut;
  modePaiement: string;
  /** Référence lisible — affichée dans le partage WhatsApp. */
  reference?: string;
}) {
  const dict = getDict(locale);
  const [statut, setStatut] = useState<Statut>(initialStatut);
  const flipped = useRef(false);
  const online = modePaiement === "fedapay";
  const shouldPoll = online && statut === "en_attente";

  useEffect(() => {
    if (!shouldPoll) return;
    let attempts = 0;
    const MAX = 45; // ~3 min à 4 s l'essai, hors pauses d'onglet masqué
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedule = (delay: number) => {
      timer = setTimeout(tick, delay);
    };

    const tick = async () => {
      if (cancelled) return;
      // Onglet masqué : on repousse sans consommer d'essai ni de données.
      if (typeof document !== "undefined" && document.hidden) {
        schedule(4000);
        return;
      }
      try {
        const res = await fetch(
          `/api/inscription/status?ref=${encodeURIComponent(refToken)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.statut && data.statut !== "en_attente") {
            flipped.current = true;
            setStatut(data.statut as Statut);
            return;
          }
        }
      } catch {
        // Réseau instable : on réessaiera au prochain tour.
      }
      attempts += 1;
      if (!cancelled && attempts < MAX) schedule(4000);
    };

    // Première vérification rapide : le webhook a pu passer avant l'hydratation.
    schedule(1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [shouldPoll, refToken]);

  // ------------------------------------------------------------------
  // En-tête ET bannière sont rendus ICI, ensemble.
  //
  // La page titrait « Inscription confirmée ! » quel que soit l'état réel du
  // paiement — y compris après un échec. Le titre doit donc suivre le statut ;
  // et comme ce statut bascule en direct par interrogation périodique, il doit
  // vivre dans ce composant client, sans quoi le titre dirait « en attente »
  // pendant que la bannière dit « confirmé ».
  // ------------------------------------------------------------------
  const paye = statut === "payee";
  const echoue = statut === "annulee";

  const titre = paye
    ? dict.thanks.title
    : echoue
      ? dict.thanks.titleFailed
      : dict.thanks.titlePending;
  const sousTitre = paye
    ? dict.thanks.subtitle
    : echoue
      ? dict.thanks.subtitleFailed
      : dict.thanks.subtitlePending;

  function bannière() {
    if (paye) {
      return (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-loyal-700/25 bg-loyal-100 px-5 py-4 text-left">
          <svg className="mt-0.5 flex-none text-loyal-700" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12.5l2.5 2.5 4.5-5" />
          </svg>
          <p className="text-sm font-semibold leading-relaxed text-loyal-800">
            {flipped.current ? dict.thanks.justConfirmed : dict.thanks.paid}
          </p>
        </div>
      );
    }

    if (echoue) {
      return (
        <div className="mt-6 rounded-2xl border border-maroon-400 bg-maroon-600/10 px-5 py-4 text-left">
          <p className="text-sm font-semibold leading-relaxed text-maroon-600">
            {dict.thanks.failed}
          </p>
          <Link
            href={`/${locale}/inscription`}
            className="mt-3 inline-block rounded-full bg-maroon-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-maroon-500"
          >
            {dict.thanks.retry}
          </Link>
        </div>
      );
    }

    if (online) {
      return (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-loyal-50 px-5 py-4 text-left">
          <svg className="mt-0.5 flex-none animate-spin text-loyal-500" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-semibold leading-relaxed text-loyal-800">
              {dict.thanks.verifying}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {dict.thanks.verifyingHint}
            </p>
          </div>
        </div>
      );
    }

    const message =
      modePaiement === "virement"
        ? dict.thanks.wire
        : modePaiement === "sur_place"
          ? dict.thanks.onsite
          : dict.thanks.pending;
    return (
      <p className="mt-6 rounded-2xl bg-loyal-50 px-5 py-4 text-left text-sm leading-relaxed text-loyal-800">
        {message}
      </p>
    );
  }

  function partagerWhatsapp() {
    const message = `${dict.thanks.shareWhatsapp ? dict.thanks.shareWaText : ""} ${reference ?? ""}\n\n${window.location.href}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message.trim())}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      <div
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
          echoue ? "bg-maroon-600/10" : "bg-gold-300/30"
        }`}
        aria-hidden
      >
        {paye ? "\u{1F389}" : echoue ? "\u{1F4AC}" : "\u{23F3}"}
      </div>
      <h1 className="mt-6 font-display text-4xl font-black text-loyal-800">
        {titre}
      </h1>
      <p className="mt-3 text-lg text-slate-600">{sousTitre}</p>
      {bannière()}
      {/* La preuve d'achat survit à la fermeture de l'onglet : la référence
          part dans WhatsApp, le canal que ce public utilise réellement. */}
      {reference && !echoue && (
        <button
          type="button"
          onClick={partagerWhatsapp}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1ea952] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#199548]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.16c-.24.68-1.42 1.32-1.96 1.36-.5.05-.98.23-3.3-.7-2.78-1.1-4.56-3.94-4.7-4.12-.14-.18-1.13-1.5-1.13-2.86 0-1.36.71-2.03.97-2.31.24-.26.53-.32.7-.32.18 0 .35.002.5.01.16.007.38-.06.59.45.24.58.8 1.98.87 2.12.07.14.12.3.02.48-.09.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.29.29-.12.57.17.28.74 1.22 1.6 1.98 1.1.98 2.03 1.29 2.32 1.43.29.14.46.12.63-.07.18-.2.72-.84.91-1.13.19-.28.38-.24.64-.14.26.09 1.66.78 1.94.93.28.14.47.21.53.32.07.11.07.62-.17 1.3Z" />
          </svg>
          {dict.thanks.shareWhatsapp}
        </button>
      )}
    </>
  );
}
