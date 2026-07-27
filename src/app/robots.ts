import type { MetadataRoute } from "next";

// Contenu entièrement statique : la directive permet aussi son inclusion
// dans un export statique (version de présentation GitHub Pages).
export const dynamic = "force-static";

/**
 * Indexation par les moteurs de recherche — FERMÉE par défaut.
 *
 * Tant que les contenus sont des exemples (intervenants, programme, articles)
 * et que le thème n'a pas reçu l'accord de la Brand Team, le site ne doit pas
 * remonter dans les résultats de recherche ni pouvoir être pris pour le site
 * officiel de la conférence.
 *
 * Le comité l'ouvre en posant SITE_INDEXABLE=true dans les variables
 * d'environnement de l'hébergeur, le jour où les contenus sont réels.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const indexable = process.env.SITE_INDEXABLE === "true";

  if (!indexable) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
