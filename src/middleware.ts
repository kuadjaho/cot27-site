import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isLocale, type Locale } from "./lib/i18n";

/** Nom du cookie posé par le commutateur de langue. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Choisit la langue d'un visiteur arrivé sur une URL sans préfixe.
 *
 * Priorité : le choix EXPLICITE (cookie posé par le commutateur) l'emporte
 * toujours ; sinon on lit l'en-tête Accept-Language que le navigateur envoie
 * déjà à chaque requête et qu'on jetait — un anglophone du District était
 * redirigé de force vers le français. Repli sur la langue par défaut.
 */
function choisirLangue(request: NextRequest): Locale {
  const choixExplicite = request.cookies.get(LOCALE_COOKIE)?.value;
  if (choixExplicite && isLocale(choixExplicite)) return choixExplicite;

  const entete = request.headers.get("accept-language");
  if (entete) {
    // « fr-FR,fr;q=0.9,en;q=0.8 » → on retient la première langue reconnue,
    // en respectant l'ordre de préférence déclaré par le navigateur.
    const preferences = entete
      .split(",")
      .map((partie) => {
        const [etiquette, q] = partie.trim().split(";q=");
        return {
          code: etiquette.trim().slice(0, 2).toLowerCase(),
          poids: q ? Number(q) : 1,
        };
      })
      .filter((p) => !Number.isNaN(p.poids))
      .sort((a, b) => b.poids - a.poids);

    for (const { code } of preferences) {
      if (isLocale(code)) return code;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    const langue = choisirLangue(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${langue}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    // Indispensable : sans Vary, un CDN servirait la même redirection à tout
    // le monde — le premier visiteur déciderait de la langue des suivants.
    response.headers.set("Vary", "Accept-Language, Cookie");
    return response;
  }
}

export const config = {
  // Tout sauf les API, l'admin Payload, les assets Next et les fichiers statiques
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
