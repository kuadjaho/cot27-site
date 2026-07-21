import { ImageResponse } from "next/og";
import { isLocale } from "@/lib/i18n";

export const alt = "COT27 — Conférence du District 130 Toastmasters · Cotonou 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image Open Graph générée aux couleurs COT27 (partages WhatsApp/réseaux). */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const fr = !isLocale(locale) || locale === "fr";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #001a2b 0%, #003350 55%, #611c28 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 110,
            height: 110,
            borderRadius: 9999,
            background: "#f2df74",
            color: "#00263c",
            fontSize: 52,
            fontWeight: 800,
          }}
        >
          27
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#f2df74",
            fontWeight: 700,
          }}
        >
          {fr
            ? "Conférence annuelle · District 130"
            : "Annual Conference · District 130"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 132,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          COT27
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 42,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {fr
            ? "1er – 8 mai 2027 · Cotonou, Bénin"
            : "May 1 – 8, 2027 · Cotonou, Benin"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 30,
            color: "#f2df74",
          }}
        >
          {fr
            ? "12 pays · 450 participants · 2 langues"
            : "12 countries · 450 attendees · 2 languages"}
        </div>
      </div>
    ),
    { ...size }
  );
}
