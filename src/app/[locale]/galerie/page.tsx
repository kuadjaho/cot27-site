import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { galleryEditions } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).gallery.title };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <PageHeader title={dict.gallery.title} subtitle={dict.gallery.subtitle} />

      <section className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6">
        {galleryEditions.map((edition) => (
          <div key={edition.year}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-display text-3xl font-extrabold text-loyal-800">
                {dict.gallery.edition} {edition.year} — {edition.city}
              </h2>
              <p className="font-display text-sm font-semibold text-maroon-600">
                « {edition.theme[locale]} »
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {edition.photos.map((photo) => (
                <figure
                  key={photo.caption.fr}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm"
                >
                  {/* Placeholder visuel — remplacer par de vraies photos dans /public */}
                  <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, hsl(${photo.hue} 50% 25%), hsl(${(photo.hue + 40) % 360} 60% 45%))`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
                    📷
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 text-sm font-semibold text-white">
                    {photo.caption[locale]}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
