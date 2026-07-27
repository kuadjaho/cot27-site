import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getTicket, formatFCFA } from "@/lib/content";
import PaymentStatus from "@/components/PaymentStatus";
import ClearDraft from "@/components/ClearDraft";

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

  // Recherche par jeton aléatoire, jamais par identifiant. L'identifiant d'une
  // inscription est un entier séquentiel : une boucle sur ?ref=1, 2, 3… aurait
  // exposé le nom, la catégorie et le montant payé de chaque inscrit du site.
  if (!ref) notFound();

  const payload = await getPayload({ config });
  const found = await payload
    .find({
      collection: "inscriptions",
      where: { qrToken: { equals: ref } },
      depth: 1,
      limit: 1,
    })
    .catch(() => null);
  const inscription = found?.docs[0];
  if (!inscription) notFound();

  const participant =
    typeof inscription.participant === "object" ? inscription.participant : null;
  const ticket = getTicket(inscription.categorie);
  const reference = `COT27-${String(inscription.id).padStart(5, "0")}`;

  const isDelegation = inscription.categorie === "delegation";

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      {/* Le brouillon n'est effacé qu'ICI : l'inscription est acquise. */}
      <ClearDraft storageKey="cot27-tunnel" />

      {/* Pictogramme, titre, sous-titre ET bannière sont rendus par
          PaymentStatus : ils dépendent tous du statut réel, qui bascule en
          direct. La page affichait « Inscription confirmée ! » même après un
          paiement échoué. */}
      <PaymentStatus
        locale={locale as Locale}
        refToken={ref}
        initialStatut={inscription.statut as "en_attente" | "payee" | "annulee"}
        modePaiement={inscription.modePaiement ?? ""}
        reference={reference}
      />

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
              {isDelegation
                ? `${dict.thanks.delegationLabel} — ${inscription.nombreParticipants ?? 1} ${dict.tunnel.participantsLabel}`
                : ticket
                  ? ticket.name[locale]
                  : inscription.categorie}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">{dict.register.total}</dt>
            <dd className="font-display font-extrabold text-maroon-600">
              {formatFCFA(inscription.montant, locale)}
            </dd>
          </div>
        </dl>
        {inscription.modePaiement === "virement" && (
          <div className="mt-4 rounded-2xl border border-gold-400/60 bg-gold-300/15 px-5 py-4">
            <p className="font-display text-sm font-extrabold uppercase tracking-wide text-loyal-800">
              🏦 {dict.thanks.wireDetailsTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-loyal-800">
              {dict.thanks.wireDetails}
            </p>
          </div>
        )}
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
