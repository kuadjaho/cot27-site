import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import {
  extractHeadings,
  readingTimeMinutes,
  rubriqueLabels,
  type LexicalDoc,
} from "@/lib/magazine";
import Lexical from "@/components/magazine/Lexical";
import ReadingProgress from "@/components/magazine/ReadingProgress";
import ShareArticle from "@/components/magazine/ShareArticle";

export const revalidate = 3600;

/**
 * Même raison que pour la page d'édition : sans cette liste, l'article ne peut
 * pas être pré-rendu et l'export statique de présentation échoue.
 */
export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "articles",
    limit: 500,
    pagination: false,
    depth: 1,
  });
  return docs.flatMap((article) => {
    const edition =
      typeof article.edition === "object" && article.edition
        ? article.edition.slug
        : null;
    if (!edition || !article.slug) return [];
    return ["fr", "en"].map((locale) => ({
      locale,
      edition,
      article: article.slug as string,
    }));
  });
}

async function getData(articleSlug: string, locale: Locale) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "articles",
    locale,
    where: { slug: { equals: articleSlug } },
    depth: 1,
    limit: 1,
  });
  const article = docs[0];
  if (!article) return null;

  const edition = typeof article.edition === "object" ? article.edition : null;

  const { docs: others } = edition
    ? await payload.find({
        collection: "articles",
        locale,
        where: {
          and: [
            { edition: { equals: edition.id } },
            { slug: { not_equals: articleSlug } },
          ],
        },
        limit: 3,
      })
    : { docs: [] };

  const { docs: sponsors } = await payload.find({
    collection: "sponsors",
    locale,
    limit: 1,
  });

  return { article, edition, others, sponsor: sponsors[0] ?? null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; edition: string; article: string }>;
}) {
  const { locale, article } = await params;
  if (!isLocale(locale)) return {};
  const data = await getData(article, locale);
  if (!data) return {};
  return {
    title: data.article.titre,
    description: data.article.chapo,
    openGraph: {
      title: data.article.titre,
      description: data.article.chapo,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; edition: string; article: string }>;
}) {
  const { locale, edition: editionSlug, article: articleSlug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  const data = await getData(articleSlug, locale);
  if (!data) notFound();
  const { article, edition, others, sponsor } = data;

  const corps = article.corps as LexicalDoc;
  const headings = extractHeadings(corps);
  const minutes = article.tempsLecture ?? readingTimeMinutes(corps);
  const published = new Date(article.publieLe).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <>
      <ReadingProgress />

      {/* ------------------------------------------------ EN-TÊTE */}
      <header className="bg-hero py-14 text-white sm:py-18">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="text-sm font-semibold text-white/60">
            <Link
              href={`/${locale}/magazine/${editionSlug}`}
              className="hover:text-gold-300"
            >
              ← {edition?.titre ?? dict.magazine.backToEdition}
            </Link>
          </nav>
          <p className="mt-6 inline-flex rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
            {rubriqueLabels[article.rubrique]?.[locale] ?? article.rubrique}
          </p>
          <h1 className="mt-4 font-display text-3xl font-black leading-tight text-balance sm:text-5xl">
            {article.titre}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/80">{article.chapo}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-white/60">
            <span className="text-gold-300">
              {dict.magazine.by} {article.auteur}
            </span>
            <span>{dict.magazine.publishedOn} {published}</span>
            <span>
              {minutes} {dict.magazine.readingTime}
            </span>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------ CORPS + SOMMAIRE */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
        <aside className="max-lg:hidden lg:block">
          {headings.length > 0 && (
            <nav className="sticky top-28 rounded-3xl border border-loyal-100 bg-white p-6 shadow-sm">
              <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-maroon-600">
                {dict.magazine.toc}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="block leading-snug font-semibold text-slate-500 transition hover:text-loyal-700"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>

        <div className="min-w-0">
          <article
            className="prose-cot27 mx-auto max-w-3xl lg:mx-0"
            lang={locale}
          >
            <Lexical doc={corps} />
          </article>

          {/* Encart sponsor natif et mesurable (§4.3) */}
          <aside className="mx-auto mt-12 max-w-3xl rounded-3xl border border-gold-400/50 bg-gold-300/10 p-6 lg:mx-0">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-gold-600">
              {dict.magazine.sponsored}
            </p>
            <p className="mt-2 font-display text-lg font-bold text-loyal-800">
              {sponsor ? sponsor.nom : "Votre marque ici"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {sponsor?.description ??
                (locale === "fr"
                  ? "Cet emplacement natif est proposé aux partenaires de COT27 — impressions et clics mesurés."
                  : "This native slot is offered to COT27 partners — impressions and clicks measured.")}
            </p>
          </aside>

          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between lg:mx-0">
            <ShareArticle locale={locale} title={article.titre} />
            <Link
              href={`/${locale}/magazine/${editionSlug}`}
              className="text-sm font-bold text-loyal-700 hover:text-maroon-600"
            >
              {dict.magazine.backToEdition} →
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ MÊME ÉDITION */}
      {others.length > 0 && (
        <section className="border-t border-loyal-100 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-extrabold text-loyal-800">
              {dict.magazine.otherArticles}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/${locale}/magazine/${editionSlug}/${other.slug}`}
                  className="group rounded-3xl border border-loyal-100 bg-[#fdfcf9] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-[0.65rem] font-extrabold uppercase tracking-wider text-maroon-600">
                    {rubriqueLabels[other.rubrique]?.[locale] ?? other.rubrique}
                  </p>
                  <h3 className="mt-2 font-display font-bold leading-snug text-loyal-800 group-hover:text-maroon-600">
                    {other.titre}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {other.chapo}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
