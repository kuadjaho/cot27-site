import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getDict, isLocale } from "@/lib/i18n";
import {
  editionTypeLabels,
  rubriqueLabels,
  readingTimeMinutes,
  type LexicalDoc,
} from "@/lib/magazine";

export const revalidate = 3600;

const rubriqueHues: Record<string, number> = {
  portrait: 275,
  destination: 165,
  conference: 210,
  district: 345,
  "art-oratoire": 30,
};

async function getData(editionSlug: string, locale: "fr" | "en") {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "editions",
    locale,
    where: { slug: { equals: editionSlug } },
    limit: 1,
  });
  const edition = docs[0];
  if (!edition) return null;

  const { docs: articles } = await payload.find({
    collection: "articles",
    locale,
    where: { edition: { equals: edition.id } },
    sort: "publieLe",
    limit: 100,
  });
  return { edition, articles };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; edition: string }>;
}) {
  const { locale, edition } = await params;
  if (!isLocale(locale)) return {};
  const data = await getData(edition, locale);
  return data
    ? { title: data.edition.titre, description: data.edition.description }
    : {};
}

export default async function EditionPage({
  params,
}: {
  params: Promise<{ locale: string; edition: string }>;
}) {
  const { locale, edition: editionSlug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  const data = await getData(editionSlug, locale);
  if (!data) notFound();
  const { edition, articles } = data;

  const pdfUrl =
    edition.pdf && typeof edition.pdf === "object" ? edition.pdf.url : null;

  return (
    <>
      <section className="bg-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="text-sm font-semibold text-white/60">
            <Link href={`/${locale}/magazine`} className="hover:text-gold-300">
              ← {dict.magazine.backToKiosk}
            </Link>
          </nav>
          <p className="mt-6 inline-flex rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
            {editionTypeLabels[edition.type]?.[locale] ?? edition.type}
          </p>
          <h1 className="mt-4 font-display text-4xl font-black text-balance sm:text-5xl">
            {edition.titre}
          </h1>
          {edition.description && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">
              {edition.description}
            </p>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              className="mt-6 inline-block rounded-full border border-white/30 px-6 py-2.5 text-sm font-bold transition hover:border-gold-300 hover:text-gold-300"
            >
              ⬇ {dict.magazine.downloadPdf}
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => {
            const hue = rubriqueHues[article.rubrique] ?? 210;
            const minutes =
              article.tempsLecture ??
              readingTimeMinutes(article.corps as LexicalDoc);
            return (
              <Link
                key={article.id}
                href={`/${locale}/magazine/${edition.slug}/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-loyal-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="flex h-40 items-end p-5"
                  style={{
                    background: `linear-gradient(150deg, hsl(${hue} 55% 22%), hsl(${hue} 60% 42%))`,
                  }}
                >
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                    {rubriqueLabels[article.rubrique]?.[locale] ?? article.rubrique}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="font-mono text-xs font-bold text-slate-400">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="mt-1 font-display text-lg font-bold leading-snug text-loyal-800 group-hover:text-maroon-600">
                    {article.titre}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {article.chapo}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-5 text-xs font-semibold text-slate-400">
                    <span>{article.auteur}</span>
                    <span>
                      {minutes} {dict.magazine.readingTime}
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
