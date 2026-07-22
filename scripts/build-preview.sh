#!/usr/bin/env bash
#
# Construit la version statique de présentation publiée sur GitHub Pages.
#
# Pourquoi une construction à part : GitHub Pages ne sert que des fichiers, il
# n'exécute aucun serveur. Or l'application réelle a besoin d'un serveur pour
# la base Postgres, les six routes d'API, le webhook de paiement et
# l'administration Payload. On produit donc une copie amputée de tout ce qui
# exige un serveur, et l'on n'y publie que des pages consultables.
#
# La construction se fait EN LOCAL et non sur GitHub, parce que les pages du
# magazine interrogent Postgres au moment du rendu : les serveurs de GitHub
# n'ont pas cette base.
#
# Ce que la version publiée NE FAIT PAS : inscription, paiement, newsletter,
# administration, images de partage. C'est une maquette consultable, pas le
# site en service.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD="${TMPDIR:-/tmp}/cot27-preview"
SORTIE="$REPO/out"

echo "→ Copie du projet vers $BUILD"
rm -rf "$BUILD"
mkdir -p "$BUILD"
rsync -a --exclude node_modules --exclude .next --exclude .git --exclude out \
  "$REPO/" "$BUILD/"
ln -s "$REPO/node_modules" "$BUILD/node_modules"

echo "→ Retrait de ce qui exige un serveur"
rm -rf "$BUILD/src/app/api"
rm -rf "$BUILD/src/app/(payload)"
rm -f  "$BUILD/src/middleware.ts"
rm -f  "$BUILD/src/app/[locale]/opengraph-image.tsx"
rm -f  "$BUILD/src/app/[locale]/magazine/[edition]/[article]/opengraph-image.tsx"
rm -f  "$BUILD/src/app/[locale]/inscription/merci/page.tsx"
rmdir  "$BUILD/src/app/[locale]/inscription/merci" 2>/dev/null || true
# La route « attrape-tout » des URL inconnues ne peut pas être pré-rendue : un
# export statique n'a pas de serveur pour intercepter une adresse quelconque.
# Next produit un 404.html à sa place.
rm -rf "$BUILD/src/app/[locale]/[...introuvable]"

echo "→ Remplacement du tunnel d'inscription par un avis"
cat > "$BUILD/src/app/[locale]/inscription/page.tsx" <<'PAGE'
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";

// Version de présentation : le tunnel d'inscription a besoin d'un serveur et
// d'une base de données, que GitHub Pages ne fournit pas. Plutôt que d'exposer
// un formulaire dont le bouton « Payer » échouerait, on affiche un avis franc.
export default async function InscriptionPreview({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const fr = locale === "fr";
  const dict = getDict(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="section-kicker">{dict.nav.register}</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-loyal-900 sm:text-4xl">
        {fr ? "Inscriptions bientôt ouvertes" : "Registration opening soon"}
      </h1>
      <p className="mt-5 leading-relaxed text-loyal-700">
        {fr
          ? "Cette page est une maquette de présentation destinée au comité d'organisation. Le tunnel d'inscription et le paiement en ligne fonctionnent dans l'application complète, mais ne sont pas activés sur cette version de démonstration."
          : "This page is a preview for the organising committee. The registration flow and online payment work in the full application, but are not enabled on this demonstration version."}
      </p>
      <Link
        href={`/${locale}`}
        className="mt-8 inline-block rounded-full bg-loyal-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-loyal-600"
      >
        {fr ? "Retour à l'accueil" : "Back to home"}
      </Link>
    </div>
  );
}
PAGE

echo "→ Interdiction d'indexation par les moteurs de recherche"
# La version publiée porte l'identité COT27 sans validation de la Brand Team et
# ne contient que des contenus de démonstration : elle ne doit pas remonter
# dans les résultats de recherche ni être prise pour le site officiel.
cat > "$BUILD/src/app/robots.ts" <<'ROBOTS'
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
ROBOTS

echo "→ Configuration d'export statique"
BASE_PATH="${PREVIEW_BASE_PATH:-}"
cat > "$BUILD/next.config.ts" <<CONFIG
import type { NextConfig } from "next";

// Configuration réservée à la version de présentation. L'application réelle
// utilise le next.config.ts du dépôt, qui passe par withPayload.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "${BASE_PATH}",
  images: { unoptimized: true },
};

export default nextConfig;
CONFIG

echo "→ Construction"
cd "$BUILD"
NEXT_PUBLIC_SITE_URL="${PREVIEW_SITE_URL:-https://example.invalid}" npx next build

echo "→ Récupération du résultat"
rm -rf "$SORTIE"
cp -R "$BUILD/out" "$SORTIE"
touch "$SORTIE/.nojekyll"   # sans ce fichier, GitHub ignore le dossier _next

echo
echo "✓ Version statique dans $SORTIE"
find "$SORTIE" -name "index.html" | wc -l | xargs echo "  pages produites :"
