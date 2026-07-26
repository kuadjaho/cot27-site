import { describe, it, expect } from "vitest";
import {
  buildInscriptionRecue,
  buildPaiementConfirme,
  formatReference,
  type ModePaiement,
} from "./email";

/**
 * Les e-mails transactionnels portent un montant, une référence et un lien de
 * confirmation : un modèle cassé se traduit par un participant qui ne sait pas
 * ce qu'il a payé ni où retrouver son inscription. Ces tests figent le contenu
 * des deux messages, dans les deux langues, et couvrent la branche « paiement
 * confirmé » que l'on ne peut pas déclencher en local sans FedaPay.
 */

const base = {
  prenom: "Aïcha",
  reference: "COT27-00042",
  offre: "Standard",
  montant: 125_000,
  confirmationUrl: "https://cot27.org/fr/inscription/merci?ref=jeton-abc",
};

describe("formatReference", () => {
  it("préfixe et complète l'identifiant à cinq chiffres", () => {
    expect(formatReference(42)).toBe("COT27-00042");
    expect(formatReference(7)).toBe("COT27-00007");
    expect(formatReference(123456)).toBe("COT27-123456");
  });
});

describe("inscription reçue — contenu commun", () => {
  const m = buildInscriptionRecue({ ...base, locale: "fr", modePaiement: "sur_place" });

  it("porte la référence dans le sujet", () => {
    expect(m.subject).toContain("COT27-00042");
    expect(m.subject).toContain("Inscription reçue");
  });

  it("montre le montant formaté en FCFA, la formule et le prénom", () => {
    expect(m.html).toContain("Aïcha");
    expect(m.html).toContain("Standard");
    expect(m.html).toMatch(/125[\s  ]?000\s*FCFA/);
  });

  it("mène à la page de confirmation par son jeton", () => {
    expect(m.html).toContain(base.confirmationUrl);
    expect(m.text).toContain(base.confirmationUrl);
  });
});

describe("inscription reçue — l'étape dépend du mode de paiement", () => {
  const etapePour = (modePaiement: ModePaiement, locale: "fr" | "en") =>
    buildInscriptionRecue({ ...base, locale, modePaiement }).html;

  it("paiement en ligne : annonce une confirmation à venir", () => {
    expect(etapePour("fedapay", "fr")).toContain("en cours de traitement");
    expect(etapePour("fedapay", "en")).toContain("being processed");
  });

  it("virement : renvoie vers le comité", () => {
    expect(etapePour("virement", "fr")).toContain("virement bancaire");
    expect(etapePour("virement", "en")).toContain("bank transfer");
  });

  it("sur place : réservation le jour J", () => {
    expect(etapePour("sur_place", "fr")).toContain("sur place");
    expect(etapePour("sur_place", "en")).toContain("on site");
  });
});

describe("bilingue", () => {
  it("bascule intégralement le sujet et le corps en anglais", () => {
    const m = buildInscriptionRecue({
      ...base,
      locale: "en",
      offre: "Delegation (6 people)",
      modePaiement: "virement",
    });
    expect(m.subject).toContain("Registration received");
    expect(m.html).toContain("Hello Aïcha");
    expect(m.html).toContain("Delegation (6 people)");
    expect(m.html).not.toContain("Bonjour");
  });
});

describe("paiement confirmé", () => {
  it("annonce la place garantie, avec référence et montant", () => {
    const fr = buildPaiementConfirme({ ...base, locale: "fr" });
    expect(fr.subject).toContain("Paiement confirmé");
    expect(fr.subject).toContain("COT27-00042");
    expect(fr.html).toContain("garantie");
    expect(fr.html).toMatch(/125[\s  ]?000\s*FCFA/);

    const en = buildPaiementConfirme({ ...base, locale: "en" });
    expect(en.subject).toContain("Payment confirmed");
    expect(en.html).toContain("secured");
  });
});

describe("robustesse du gabarit HTML", () => {
  it("produit un document complet et équilibré en balises", () => {
    const { html } = buildPaiementConfirme({ ...base, locale: "fr" });
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect((html.match(/<div/g) ?? []).length).toBe(
      (html.match(/<\/div>/g) ?? []).length
    );
  });
});
