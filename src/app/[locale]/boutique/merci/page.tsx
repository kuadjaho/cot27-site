import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { formatFCFA } from "@/lib/content";

export const dynamic = "force-dynamic";

type Ligne = { nom: string; prixUnitaire: number; quantite: number };

export default async function MerciBoutique({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  const { ref } = await searchParams;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const t = dict.boutique;

  // Adressage par le jeton aléatoire, jamais par l'identifiant : celui-ci est
  // séquentiel, une boucle exposerait le nom et le montant de chaque acheteur.
  if (!ref) notFound();

  const payload = await getPayload({ config });
  const found = await payload
    .find({
      collection: "reservations",
      where: { token: { equals: ref } },
      limit: 1,
      locale: locale as Locale,
    })
    .catch(() => null);

  const reservation = found?.docs[0];
  if (!reservation) notFound();

  const lignes = (reservation.lignes ?? []) as Ligne[];

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-300/30 text-4xl">
        📌
      </div>
      <h1 className="mt-6 font-display text-4xl font-black text-loyal-800">
        {t.merciTitre}
      </h1>
      <p className="mt-3 text-lg text-slate-600">{t.merciSous}</p>

      <div className="mt-10 rounded-3xl border border-loyal-100 bg-white p-8 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-loyal-100 pb-4">
          <span className="text-sm font-semibold text-slate-500">
            {t.refLabel}
          </span>
          <code className="rounded-lg bg-loyal-50 px-3 py-1 font-mono text-sm font-bold text-loyal-800">
            {reservation.reference}
          </code>
        </div>

        <ul className="mt-4 space-y-2 text-sm">
          {lignes.map((l, i) => (
            <li key={i} className="flex justify-between">
              <span className="text-slate-600">
                {l.quantite} × {l.nom}
              </span>
              <span className="font-semibold text-loyal-800">
                {formatFCFA(l.prixUnitaire * l.quantite, locale as Locale)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-loyal-100 pt-4">
          <span className="text-sm font-semibold text-slate-500">
            {t.aRegler}
          </span>
          <span className="font-display text-lg font-black text-maroon-600">
            {formatFCFA(reservation.totalFcfa as number, locale as Locale)}
          </span>
        </div>

        <p className="mt-6 rounded-2xl bg-loyal-50 px-5 py-4 text-sm leading-relaxed text-loyal-800">
          {t.merciNote}
        </p>
      </div>

      <Link
        href={`/${locale}/boutique`}
        className="mt-10 inline-block rounded-full border border-loyal-200 px-8 py-3 text-sm font-bold text-loyal-700 transition hover:border-loyal-700"
      >
        ← {t.retour}
      </Link>
    </section>
  );
}
