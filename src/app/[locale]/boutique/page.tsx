import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import BoutiquePanier, {
  type ArticleVitrine,
} from "@/components/boutique/BoutiquePanier";

// Le catalogue et l'état ouvert/fermé sont pilotés depuis l'administration :
// on rafraîchit régulièrement plutôt que de figer la page au build.
export const revalidate = 300;

export default async function BoutiquePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const t = dict.boutique;

  const payload = await getPayload({ config });
  const [{ docs }, reglages] = await Promise.all([
    payload.find({
      collection: "epinglettes",
      where: { actif: { equals: true } },
      sort: "ordre",
      locale: locale as Locale,
      limit: 100,
      pagination: false,
    }),
    payload.findGlobal({ slug: "boutique", locale: locale as Locale }),
  ]);

  const articles: ArticleVitrine[] = docs.map((a) => ({
    slug: a.slug as string,
    nom: a.nom as string,
    description: (a.description as string | null) ?? null,
    prixFcfa: a.prixFcfa as number,
    photoUrl: (a.photoUrl as string | null) ?? null,
  }));

  const ouverte = Boolean(reglages?.ouverte);

  return (
    <>
      <section className="bg-hero relative overflow-hidden text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="font-display text-4xl font-black sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/75">
            {t.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {!ouverte ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-loyal-100 bg-white p-8 text-center">
            <h2 className="font-display text-2xl font-extrabold text-loyal-800">
              {t.fermeeTitre}
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {t.fermeeTexte}
            </p>
          </div>
        ) : (
          <BoutiquePanier
            locale={locale as Locale}
            articles={articles}
            ouverte={ouverte}
            delaiRemise={(reglages?.delaiRemise as string | null) ?? null}
          />
        )}
      </section>
    </>
  );
}
