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
}: {
  locale: Locale;
  refToken: string;
  initialStatut: Statut;
  modePaiement: string;
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

  if (statut === "payee") {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-lagune/30 bg-lagune/10 px-5 py-4 text-left">
        <svg className="mt-0.5 flex-none text-lagune" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </svg>
        <p className="text-sm font-semibold leading-relaxed text-loyal-800">
          {flipped.current ? dict.thanks.justConfirmed : dict.thanks.paid}
        </p>
      </div>
    );
  }

  if (statut === "annulee") {
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
    // En attente, paiement en ligne : vérification en cours.
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

  // En attente, paiement manuel (virement / sur place) : message fixe.
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
