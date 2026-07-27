"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatFCFA } from "@/lib/content";
import { getDict, type Locale } from "@/lib/i18n";
import { QUANTITE_MAX } from "@/lib/boutique";

export type ArticleVitrine = {
  slug: string;
  nom: string;
  description?: string | null;
  prixFcfa: number;
  photoUrl?: string | null;
};

/**
 * Vitrine + panier de réservation.
 *
 * Le total affiché ici est un CONFORT DE LECTURE : la référence est le total
 * recalculé par le serveur à partir des prix en base. Le panier n'envoie que
 * des slugs et des quantités.
 */
export default function BoutiquePanier({
  locale,
  articles,
  ouverte,
  delaiRemise,
}: {
  locale: Locale;
  articles: ArticleVitrine[];
  ouverte: boolean;
  delaiRemise?: string | null;
}) {
  const dict = getDict(locale);
  const t = dict.boutique;
  const router = useRouter();

  const [panier, setPanier] = useState<Record<string, number>>({});
  const [identite, setIdentite] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    club: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const lignes = useMemo(
    () =>
      articles
        .filter((a) => (panier[a.slug] ?? 0) > 0)
        .map((a) => ({ ...a, quantite: panier[a.slug] })),
    [articles, panier]
  );
  const total = lignes.reduce((s, l) => s + l.prixFcfa * l.quantite, 0);

  const bouger = (slug: string, delta: number) =>
    setPanier((p) => {
      const q = Math.min(Math.max((p[slug] ?? 0) + delta, 0), QUANTITE_MAX);
      const suivant = { ...p };
      if (q === 0) delete suivant[slug];
      else suivant[slug] = q;
      return suivant;
    });

  const identiteValide =
    identite.prenom.trim() &&
    identite.nom.trim() &&
    identite.telephone.trim() &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identite.email);

  async function reserver() {
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch("/api/boutique/reserver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          ...identite,
          panier: lignes.map((l) => ({ slug: l.slug, quantite: l.quantite })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErreur(data.error === "CLOSED" ? t.fermee : t.erreur);
        setEnvoi(false);
        return;
      }
      router.push(`/${locale}/boutique/merci?ref=${data.ref}`);
    } catch {
      setErreur(t.erreur);
      setEnvoi(false);
    }
  }

  return (
    <div className="pb-40">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => {
          const q = panier[a.slug] ?? 0;
          return (
            <div
              key={a.slug}
              className={`flex flex-col rounded-3xl border-2 bg-white p-5 transition ${
                q > 0 ? "border-loyal-700" : "border-loyal-100"
              }`}
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-loyal-50">
                {a.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.photoUrl}
                    alt=""
                    width={96}
                    height={96}
                    className="h-24 w-24 object-contain"
                  />
                ) : (
                  <span className="font-display text-2xl font-black text-loyal-300">
                    27
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-center font-display font-bold text-loyal-900">
                {a.nom}
              </h3>
              {a.description && (
                <p className="mt-1 text-center text-xs leading-relaxed text-slate-500">
                  {a.description}
                </p>
              )}
              <div className="mt-3 text-center font-display text-xl font-black text-maroon-600">
                {formatFCFA(a.prixFcfa, locale)}
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => bouger(a.slug, -1)}
                  disabled={q === 0}
                  aria-label={`${t.retirer} ${a.nom}`}
                  className="h-9 w-9 rounded-full border border-loyal-200 font-bold text-loyal-700 transition hover:border-loyal-700 disabled:opacity-30"
                >
                  −
                </button>
                <span className="nums w-8 text-center font-display text-lg font-black text-loyal-800">
                  {q}
                </span>
                <button
                  type="button"
                  onClick={() => bouger(a.slug, 1)}
                  aria-label={`${t.ajouter} ${a.nom}`}
                  className="h-9 w-9 rounded-full bg-loyal-700 font-bold text-white transition hover:bg-loyal-600"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {lignes.length > 0 && (
        <div className="mt-10 rounded-3xl border border-loyal-100 bg-white p-6">
          <h2 className="font-display text-lg font-extrabold text-loyal-800">
            {t.recapTitre}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lignes.map((l) => (
              <li key={l.slug} className="flex justify-between">
                <span className="text-slate-600">
                  {l.quantite} × {l.nom}
                </span>
                <span className="font-semibold text-loyal-800">
                  {formatFCFA(l.prixFcfa * l.quantite, locale)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-3 border-t border-loyal-100 pt-5 sm:grid-cols-2">
            {(
              [
                ["prenom", t.prenom, "given-name"],
                ["nom", t.nom, "family-name"],
                ["email", t.email, "email"],
                ["telephone", t.telephone, "tel"],
                ["club", t.club, "organization"],
              ] as const
            ).map(([key, label, auto]) => (
              <label key={key} className="block">
                <span className="text-xs font-semibold text-slate-500">
                  {label}
                  {key !== "club" && " *"}
                </span>
                <input
                  type={key === "email" ? "email" : key === "telephone" ? "tel" : "text"}
                  autoComplete={auto}
                  value={identite[key]}
                  onChange={(e) =>
                    setIdentite((s) => ({ ...s, [key]: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-loyal-200 px-4 py-2.5 text-sm outline-none focus:border-loyal-700"
                />
              </label>
            ))}
          </div>

          {delaiRemise && (
            <p className="mt-4 rounded-2xl bg-loyal-50 px-4 py-3 text-sm text-loyal-800">
              {delaiRemise}
            </p>
          )}
          {erreur && (
            <p className="mt-4 rounded-2xl border border-maroon-400 bg-maroon-600/10 px-4 py-3 text-sm font-semibold text-maroon-600">
              {erreur}
            </p>
          )}
        </div>
      )}

      {/* Barre de total fixe, comme le tunnel d'inscription */}
      {lignes.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-loyal-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.total}
              </div>
              <div className="nums font-display text-xl font-black text-loyal-800">
                {formatFCFA(total, locale)}
              </div>
            </div>
            <button
              type="button"
              onClick={reserver}
              disabled={!ouverte || !identiteValide || envoi}
              className="rounded-full bg-gold-400 px-8 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-loyal-900 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {envoi ? t.envoi : t.reserver}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
