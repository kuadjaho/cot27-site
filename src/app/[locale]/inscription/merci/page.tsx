import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getDict, isLocale } from "@/lib/i18n";
import { getTicket, formatFCFA } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ThanksPage({
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

  const id = Number(ref);
  if (!ref || Number.isNaN(id)) notFound();

  const payload = await getPayload({ config });
  const inscription = await payload
    .findByID({ collection: "inscriptions", id, depth: 1 })
    .catch(() => null);
  if (!inscription) notFound();

  const participant =
    typeof inscription.participant === "object" ? inscription.participant : null;
  const ticket = getTicket(inscription.categorie);
  const reference = `COT27-${String(inscription.id).padStart(5, "0")}`;

  const statusMessage =
    inscription.statut === "payee"
      ? dict.thanks.paid
      : inscription.modePaiement === "sur_place"
        ? dict.thanks.onsite
        : dict.thanks.pending;

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-300/30 text-4xl">
        🎉
      </div>
      <h1 className="mt-6 font-display text-4xl font-black text-loyal-800">
        {dict.thanks.title}
      </h1>
      <p className="mt-3 text-lg text-slate-600">{dict.thanks.subtitle}</p>

      <div className="mt-10 rounded-3xl border border-loyal-100 bg-white p-8 text-left shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-loyal-100 pb-4">
          <span className="text-sm font-semibold text-slate-500">
            {dict.thanks.refLabel}
          </span>
          <code className="rounded-lg bg-loyal-50 px-3 py-1 font-mono text-sm font-bold text-loyal-800">
            {reference}
          </code>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">
              {participant ? `${participant.prenom} ${participant.nom}` : "—"}
            </dt>
            <dd className="font-semibold text-loyal-800">
              {ticket ? ticket.name[locale] : inscription.categorie}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">{dict.register.total}</dt>
            <dd className="font-display font-extrabold text-maroon-600">
              {formatFCFA(inscription.montant, locale)}
            </dd>
          </div>
        </dl>
        <p className="mt-6 rounded-2xl bg-loyal-50 px-5 py-4 text-sm leading-relaxed text-loyal-800">
          {statusMessage}
        </p>
      </div>

      <Link
        href={`/${locale}`}
        className="mt-10 inline-block rounded-full border border-loyal-200 px-8 py-3 text-sm font-bold text-loyal-700 transition hover:border-loyal-700"
      >
        ← {dict.thanks.backHome}
      </Link>
    </section>
  );
}
