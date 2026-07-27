import { describe, it, expect } from "vitest";
import {
  normaliserPanier,
  composerReservation,
  listeAchat,
  QUANTITE_MAX,
  type ArticleTarife,
} from "./boutique";

/**
 * La boutique manipule de l'argent et produit la liste d'achat que le comité
 * paiera en dollars. Ces tests figent les deux garanties qui comptent : le
 * client ne peut pas influencer un prix, et la liste d'achat n'inclut jamais
 * une réservation non confirmée.
 */

const CATALOGUE: ArticleTarife[] = [
  { slug: "pin-membre", nom: "Épinglette Membre", prixFcfa: 7500 },
  { slug: "pin-dtm", nom: "Épinglette DTM", prixFcfa: 10000 },
  { slug: "pin-president", nom: "Pin Président", prixFcfa: 8900 },
];

describe("normalisation du panier", () => {
  it("garde les lignes valides", () => {
    expect(
      normaliserPanier([{ slug: "pin-membre", quantite: 2 }])
    ).toEqual([{ slug: "pin-membre", quantite: 2 }]);
  });

  it("fusionne un article envoyé plusieurs fois", () => {
    expect(
      normaliserPanier([
        { slug: "pin-dtm", quantite: 1 },
        { slug: "pin-dtm", quantite: 3 },
      ])
    ).toEqual([{ slug: "pin-dtm", quantite: 4 }]);
  });

  it("écarte les entrées malformées sans faire tomber le reste", () => {
    const panier = normaliserPanier([
      { slug: "pin-membre", quantite: 1 },
      { slug: "PIN MEMBRE!", quantite: 1 },
      { slug: "pin-dtm", quantite: 0 },
      { slug: "pin-dtm", quantite: -5 },
      { slug: "pin-dtm", quantite: 1.5 },
      null,
      "n'importe quoi",
      { quantite: 3 },
    ]);
    expect(panier).toEqual([{ slug: "pin-membre", quantite: 1 }]);
  });

  it("plafonne la quantité par article", () => {
    const [ligne] = normaliserPanier([{ slug: "pin-membre", quantite: 9999 }]);
    expect(ligne.quantite).toBe(QUANTITE_MAX);
  });

  it("rend un panier vide sur une entrée qui n'est pas un tableau", () => {
    expect(normaliserPanier(null)).toEqual([]);
    expect(normaliserPanier({ slug: "pin-dtm", quantite: 1 })).toEqual([]);
  });
});

describe("composition de la réservation", () => {
  it("applique le prix du CATALOGUE, jamais celui du client", () => {
    // Un client malveillant enverrait un prix ; il n'a aucun moyen de le faire
    // entrer ici — la signature n'accepte que slug + quantité.
    const r = composerReservation(
      [{ slug: "pin-membre", quantite: 2 }],
      CATALOGUE
    );
    expect(r.lignes[0].prixUnitaire).toBe(7500);
    expect(r.total).toBe(15000);
  });

  it("additionne plusieurs articles", () => {
    const r = composerReservation(
      [
        { slug: "pin-membre", quantite: 2 },
        { slug: "pin-dtm", quantite: 1 },
        { slug: "pin-president", quantite: 3 },
      ],
      CATALOGUE
    );
    expect(r.total).toBe(7500 * 2 + 10000 + 8900 * 3);
    expect(r.lignes).toHaveLength(3);
  });

  it("signale un article inconnu plutôt que de le facturer à zéro", () => {
    const r = composerReservation(
      [
        { slug: "pin-membre", quantite: 1 },
        { slug: "pin-inexistant", quantite: 1 },
      ],
      CATALOGUE
    );
    expect(r.introuvables).toEqual(["pin-inexistant"]);
    expect(r.total).toBe(7500);
  });

  it("refuse un article dont le prix est nul ou absent", () => {
    const r = composerReservation([{ slug: "pin-gratuit", quantite: 1 }], [
      ...CATALOGUE,
      { slug: "pin-gratuit", nom: "Pin sans prix", prixFcfa: 0 },
    ]);
    expect(r.introuvables).toEqual(["pin-gratuit"]);
    expect(r.total).toBe(0);
  });

  it("fige le sous-total ligne à ligne", () => {
    const r = composerReservation([{ slug: "pin-dtm", quantite: 4 }], CATALOGUE);
    expect(r.lignes[0].sousTotal).toBe(40000);
  });
});

describe("liste d'achat agrégée", () => {
  const ligne = (slug: string, nom: string, quantite: number) => ({
    slug,
    nom,
    prixUnitaire: 7500,
    quantite,
    sousTotal: 7500 * quantite,
  });

  it("cumule les quantités par article, tous acheteurs confondus", () => {
    const liste = listeAchat([
      { statut: "confirmee", lignes: [ligne("pin-membre", "Membre", 3)] },
      { statut: "remise", lignes: [ligne("pin-membre", "Membre", 9)] },
    ]);
    expect(liste).toEqual([{ slug: "pin-membre", nom: "Membre", quantite: 12 }]);
  });

  it("EXCLUT les réservations en attente et annulées", () => {
    // Le piège vécu en production : commander sur une liste qui contient des
    // paniers abandonnés fait payer en dollars des pins que personne n'a pris.
    const liste = listeAchat([
      { statut: "confirmee", lignes: [ligne("pin-dtm", "DTM", 2)] },
      { statut: "en_attente", lignes: [ligne("pin-dtm", "DTM", 40)] },
      { statut: "annulee", lignes: [ligne("pin-dtm", "DTM", 15)] },
    ]);
    expect(liste).toEqual([{ slug: "pin-dtm", nom: "DTM", quantite: 2 }]);
  });

  it("classe du plus demandé au moins demandé", () => {
    const liste = listeAchat([
      {
        statut: "confirmee",
        lignes: [ligne("pin-membre", "Membre", 2), ligne("pin-dtm", "DTM", 7)],
      },
    ]);
    expect(liste.map((l) => l.slug)).toEqual(["pin-dtm", "pin-membre"]);
  });

  it("rend une liste vide quand rien n'est confirmé", () => {
    expect(
      listeAchat([{ statut: "en_attente", lignes: [ligne("pin-dtm", "DTM", 5)] }])
    ).toEqual([]);
  });
});
