import { describe, it, expect } from "vitest";
import {
  computeTunnelTotal,
  delegationDiscountPct,
  getTicket,
  tickets,
  ticketOptions,
} from "./content";

/**
 * Le tunnel d'inscription manipule de l'argent réel, en francs CFA — une
 * devise sans décimales, où un écart d'une unité est un écart visible sur un
 * relevé bancaire. Ces tests fixent le comportement attendu du calcul, y
 * compris aux bords que le formulaire ne produit pas mais qu'un appel direct
 * à l'API peut atteindre.
 */

const PRIX = {
  early: 75_000,
  standard: 95_000,
  etudiant: 40_000,
  vip: 150_000,
};

const OPTIONS = {
  excursions: 25_000,
  gala: 30_000,
  totebag: 10_000,
};

const calcul = (over: Partial<Parameters<typeof computeTunnelTotal>[0]> = {}) =>
  computeTunnelTotal({
    ticketKey: "standard",
    optionKeys: [],
    participants: 1,
    promoPct: 0,
    ...over,
  });

describe("catalogue", () => {
  it("expose les quatre billets du cahier des charges à leur tarif", () => {
    for (const [key, price] of Object.entries(PRIX)) {
      expect(getTicket(key)?.price, `billet ${key}`).toBe(price);
    }
    expect(tickets).toHaveLength(4);
  });

  it("expose les trois options à leur tarif", () => {
    for (const [key, price] of Object.entries(OPTIONS)) {
      expect(ticketOptions.find((o) => o.key === key)?.price, key).toBe(price);
    }
  });
});

describe("remise de délégation, par palier", () => {
  it("n'accorde aucune remise en dessous de 5 participants", () => {
    for (const n of [1, 2, 3, 4]) {
      expect(delegationDiscountPct(n), `${n} participants`).toBe(0);
    }
  });

  it("applique le bon palier à chaque seuil et juste en dessous", () => {
    expect(delegationDiscountPct(4)).toBe(0);
    expect(delegationDiscountPct(5)).toBe(5);
    expect(delegationDiscountPct(9)).toBe(5);
    expect(delegationDiscountPct(10)).toBe(10);
    expect(delegationDiscountPct(19)).toBe(10);
    expect(delegationDiscountPct(20)).toBe(15);
    expect(delegationDiscountPct(500)).toBe(15);
  });
});

describe("inscription individuelle", () => {
  it("facture le prix du billet, sans plus", () => {
    expect(calcul().total).toBe(95_000);
    expect(calcul({ ticketKey: "etudiant" }).total).toBe(40_000);
    expect(calcul({ ticketKey: "vip" }).total).toBe(150_000);
  });

  it("ajoute les options choisies", () => {
    expect(calcul({ optionKeys: ["gala"] }).total).toBe(125_000);
    expect(calcul({ optionKeys: ["gala", "excursions", "totebag"] }).total).toBe(
      160_000
    );
  });

  it("ignore une option inconnue plutôt que de la facturer", () => {
    expect(calcul({ optionKeys: ["option-qui-n-existe-pas"] }).total).toBe(
      95_000
    );
  });

  it("applique le code promo sur le sous-total, options comprises", () => {
    const r = calcul({ optionKeys: ["gala"], promoPct: 10 });
    expect(r.promoRebate).toBe(12_500);
    expect(r.total).toBe(112_500);
  });
});

describe("inscription de délégation", () => {
  it("multiplie par le nombre de participants", () => {
    expect(calcul({ participants: 4 }).total).toBe(380_000);
  });

  it("applique la remise au premier palier", () => {
    const r = calcul({ participants: 5 });
    expect(r.base).toBe(475_000);
    expect(r.delegationPct).toBe(5);
    expect(r.delegationRebate).toBe(23_750);
    expect(r.total).toBe(451_250);
  });

  it("cumule remise de délégation et code promo", () => {
    const r = calcul({ participants: 10, promoPct: 10 });
    expect(r.base).toBe(950_000);
    expect(r.delegationRebate).toBe(95_000);
    expect(r.promoRebate).toBe(85_500);
    expect(r.total).toBe(769_500);
  });

  it("n'applique aucune option en délégation, même si elles sont demandées", () => {
    const r = calcul({ participants: 6, optionKeys: ["gala", "excursions"] });
    expect(r.optionsTotal).toBe(0);
  });
});

describe("entrées hostiles — atteignables par un appel direct à l'API", () => {
  it("ne facture jamais un montant négatif", () => {
    expect(calcul({ promoPct: 150 }).total).toBeGreaterThanOrEqual(0);
    expect(calcul({ promoPct: 1000 }).total).toBeGreaterThanOrEqual(0);
  });

  /**
   * Un billet inconnu produit un total nul. Ce n'est PAS une faille : la route
   * d'API rejette la requête en amont avec INVALID_TICKET, et le formulaire
   * ramène tout billet périmé vers le catalogue à l'hydratation. Ce test fixe
   * le contrat pour que la disparition de l'une de ces deux gardes se voie.
   */
  it("rend un total nul sur un billet inconnu — les appelants doivent donc valider", () => {
    expect(calcul({ ticketKey: "gratuit" }).total).toBe(0);
    expect(getTicket("gratuit")).toBeUndefined();
    expect(getTicket("")).toBeUndefined();
  });

  it("traite un nombre de participants absurde comme une personne", () => {
    expect(calcul({ participants: 0 }).total).toBe(95_000);
    expect(calcul({ participants: -5 }).total).toBe(95_000);
  });

  it("ne produit jamais un total fractionnaire — le franc CFA n'a pas de centimes", () => {
    for (const n of [3, 5, 7, 11, 13, 17, 23]) {
      for (const pct of [3, 7, 11, 33]) {
        const t = calcul({ participants: n, promoPct: pct }).total;
        expect(Number.isInteger(t), `${n} participants, promo ${pct}%`).toBe(
          true
        );
      }
    }
  });

  it("reste cohérent : le total est toujours la somme de ses composantes", () => {
    for (const n of [1, 5, 12, 25]) {
      for (const pct of [0, 10, 50]) {
        const r = calcul({ participants: n, promoPct: pct, optionKeys: ["gala"] });
        expect(r.total, `${n} participants, promo ${pct}%`).toBe(
          r.base - r.delegationRebate + r.optionsTotal - r.promoRebate
        );
      }
    }
  });
});
