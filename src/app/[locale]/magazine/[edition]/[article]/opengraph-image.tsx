import { ImageResponse } from "next/og";
import { getPayload } from "payload";
import config from "@payload-config";
import { isLocale } from "@/lib/i18n";
import { rubriqueLabels } from "@/lib/magazine";
import { montserratBold } from "@/lib/og-font";
import { brand } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "COT27 Magazine";

/** Image Open Graph générée automatiquement pour chaque article (§4.3). */
export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; article: string }>;
}) {
  const { locale: rawLocale, article: articleSlug } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "fr";

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "articles",
    locale,
    where: { slug: { equals: articleSlug } },
    limit: 1,
  });
  const article = docs[0];

  const titre = article?.titre ?? "COT27 Magazine";
  const rubrique = article
    ? (rubriqueLabels[article.rubrique]?.[locale] ?? article.rubrique)
    : "";
  const auteur = article?.auteur ?? "";
  const montserrat = await montserratBold();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #001a2b 0%, #00263c 55%, #004165 100%)",
          color: "white",
          fontFamily: "Montserrat",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "#e8c94a",
              color: "#00263c",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {brand.mark}
          </div>
          {/* La p. 38 du manuel de marque impose le numéro de District et les
              mots « annual conference » sur CHAQUE support — image de partage
              comprise, puisqu'elle circule seule sur les réseaux. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>
              {brand.name} MAGAZINE
            </div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: 1,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {brand.legalName.en}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {rubrique && (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "8px 24px",
                borderRadius: 999,
                border: "2px solid rgba(242,223,116,0.5)",
                background: "rgba(242,223,116,0.12)",
                color: "#f2df74",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {rubrique}
            </div>
          )}
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            {titre}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <div>{auteur}</div>
          <div>Cotonou · 1–8 mai 2027</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: montserrat, weight: 700, style: "normal" },
      ],
    }
  );
}
