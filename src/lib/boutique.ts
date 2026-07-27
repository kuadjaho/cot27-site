/**
 * Boutique d'épinglettes — réservation ferme.
 *
 * Modèle repris du kit éprouvé en production sur toastmastersbenin.org
 * (scripts/boutique/BOUTIQUE.md), volontairement simplifié : les prix sont
 * FIXÉS À LA MAIN dans l'administration, article par article. Pas de calcul de
 * coût débarqué ici — le comité annonce un prix rond, il le saisit.
 *
 * Ce qui est repris du kit, en revanche, c'est l'invariant qui protège la
 * trace : le navigateur n'envoie QUE des slugs et des quantités. Jamais un
 * prix, jamais un total, jamais un statut. Le serveur relit les prix en base
 * et recalcule — sans quoi un visiteur pourrait se réserver dix épinglettes
 * à 0 F, qui entreraient dans la liste d'achat du comité.
 */

/** Une ligne de panier telle que le NAVIGATEUR l'envoie — jamais son prix. */
export type LignePanier = { slug: string; quantite: number };

/** Plafond par article, repris du kit (contrainte `order_items_qty`). */
export const QUANTITE_MAX = 50;

/** Nombre maximum d'articles distincts dans une réservation. */
export const LIGNES_MAX = 20;

/**
 * Nettoie et fusionne un panier reçu du client.
 *
 * Le client contrôle chaque octet : on ne garde que des slugs plausibles et
 * des quantités entières, on FUSIONNE les doublons (un slug envoyé deux fois
 * ne crée pas deux lignes) et on plafonne des deux côtés.
 */
export function normaliserPanier(brut: unknown): LignePanier[] {
  if (!Array.isArray(brut)) return [];
  const parSlug = new Map<string, number>();

  for (const item of brut) {
    if (!item || typeof item !== "object") continue;
    const slug = String((item as Record<string, unknown>).slug ?? "").trim();
    const q = Number((item as Record<string, unknown>).quantite);
    if (!/^[a-z0-9-]{1,60}$/.test(slug)) continue;
    if (!Number.isInteger(q) || q < 1) continue;
    parSlug.set(slug, Math.min((parSlug.get(slug) ?? 0) + q, QUANTITE_MAX));
  }

  return [...parSlug.entries()]
    .slice(0, LIGNES_MAX)
    .map(([slug, quantite]) => ({ slug, quantite }));
}

/** Article du catalogue, tel que relu en base au moment de la réservation. */
export type ArticleTarife = { slug: string; nom: string; prixFcfa: number };

export type LigneReservation = {
  slug: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  sousTotal: number;
};

export type TotalReservation = {
  lignes: LigneReservation[];
  total: number;
  /** Slugs demandés qui n'existent pas ou ne sont plus en vente. */
  introuvables: string[];
};

/**
 * Compose la réservation à partir du panier client et des articles RELUS EN
 * BASE. Le prix unitaire est figé ici : la remise a lieu pendant la
 * conférence, des semaines plus tard, et le tarif ne doit pas bouger entre la
 * réservation et la remise.
 *
 * Les articles introuvables sont signalés plutôt qu'ignorés : une réservation
 * partielle, que le participant validerait sans s'en apercevoir, est pire
 * qu'un refus qui lui demande de recharger la page.
 */
export function composerReservation(
  panier: LignePanier[],
  catalogue: ArticleTarife[]
): TotalReservation {
  const parSlug = new Map(catalogue.map((a) => [a.slug, a]));
  const lignes: LigneReservation[] = [];
  const introuvables: string[] = [];
  let total = 0;

  for (const { slug, quantite } of panier) {
    const article = parSlug.get(slug);
    if (!article || !(article.prixFcfa > 0)) {
      introuvables.push(slug);
      continue;
    }
    const sousTotal = article.prixFcfa * quantite;
    lignes.push({
      slug,
      nom: article.nom,
      prixUnitaire: article.prixFcfa,
      quantite,
      sousTotal,
    });
    total += sousTotal;
  }

  return { lignes, total, introuvables };
}

/**
 * Liste d'achat agrégée, à recopier sur shop.toastmasters.org.
 *
 * N'agrège QUE les réservations confirmées : le kit rappelle qu'une liste
 * incluant les paniers abandonnés fait commander — et payer en dollars — des
 * épinglettes que personne n'a réservées.
 */
export function listeAchat(
  reservations: { statut: string; lignes: LigneReservation[] }[]
): { nom: string; slug: string; quantite: number }[] {
  const cumul = new Map<string, { nom: string; quantite: number }>();

  for (const r of reservations) {
    if (r.statut === "annulee" || r.statut === "en_attente") continue;
    for (const l of r.lignes) {
      const acc = cumul.get(l.slug);
      cumul.set(l.slug, {
        nom: l.nom,
        quantite: (acc?.quantite ?? 0) + l.quantite,
      });
    }
  }

  return [...cumul.entries()]
    .map(([slug, v]) => ({ slug, nom: v.nom, quantite: v.quantite }))
    .sort((a, b) => b.quantite - a.quantite);
}
