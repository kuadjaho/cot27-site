import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

const routes = [
  "",
  "/decouvrir",
  "/decouvrir/premiere-fois",
  "/decouvrir/convaincre-mon-employeur",
  "/benin",
  "/programme",
  "/intervenants",
  "/infos",
  "/galerie",
  "/magazine",
  "/inscription",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/inscription" ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}${route}`])
        ),
      },
    }))
  );
}
