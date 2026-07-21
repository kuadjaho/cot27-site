import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getDict, isLocale } from "@/lib/i18n";
import { editionTypeLabels } from "@/lib/magazine";
import PageHeader from "@/components/PageHeader";

export const revalidate = 3600;

const typeHues: Record<string, number> = {
  "early-bird": 210,
  officiel: 345,
  "post-conference": 160,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).magazine.title };
}

export default async function MagazineKioskPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  const payload = await getPayload({ config });
  const [{ docs: editions }, { docs: articles }] = await Promise.all([
    payload.find({
      collection: "editions",
      locale,
      sort: "-publieLe",
      limit: 20,
    }),
    payload.find({ collection: "articles", locale, limit: 200, depth: 0 }),
  ]);

  const articleCount = (editionId: number) =>
    articles.filter((a) =>
      typeof a.edition === "object" ? a.edition.id === editionId : a.edition === editionId
    ).length;

  return (
    <>
      <PageHeader title={dict.magazine.title} subtitle={dict.magazine.subtitle} />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {editions.length === 0 && (
          <p className="rounded-3xl border border-loyal-100 bg-white p-10 text-center text-slate-500">
            {dict.magazine.empty}
          </p>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {editions.map((edition) => {
            const hue = typeHues[edition.type] ?? 210;
            return (
              <Link
                key={edition.id}
                href={`/${locale}/magazine/${edition.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-loyal-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Couverture placeholder — remplacée par le média de l'édition */}
                <div
                  className="relative flex aspect-[3/4] max-h-72 items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(160deg, hsl(${hue} 60% 20%), hsl(${hue} 55% 38%))`,
                  }}
                >
                  <div className="px-8 text-center">
                    <div className="font-display text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                      COT27 Magazine
                    </div>
                    <div className="mt-3 font-display text-2xl font-black text-white">
                      {editionTypeLabels[edition.type]?.[locale] ?? edition.type}
                    </div>
                  </div>
                  <span className="absolute right-4 top-4 rounded-full bg-gold-400 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-loyal-900">
                    {new Date(edition.publieLe).getFullYear()}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-lg font-bold text-loyal-800 group-hover:text-maroon-600">
                    {edition.titre}
                  </h2>
                  {edition.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                      {edition.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                    <span className="font-semibold text-slate-400">
                      {articleCount(edition.id)} {dict.magazine.articlesCount}
                    </span>
                    <span className="font-bold text-loyal-700 group-hover:text-maroon-600">
                      {dict.magazine.readEdition} →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
