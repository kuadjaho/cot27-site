import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Catalogue des épinglettes réservables.
 *
 * Références et coûts d'achat relevés le 26/07/2026 sur shop.toastmasters.org
 * (colonne « Member Price »). Les PRIX DE VENTE ci-dessous sont ceux pratiqués
 * par Toastmasters Bénin — ils servent de point de départ, PAS de vérité :
 * le comité COT27 doit les valider avant d'ouvrir la boutique.
 *
 * ⚠️ Point de vigilance repris du kit d'origine : les pins d'officier achetés
 * 8,00 $ reviennent à environ 7 400 F débarqués. Vendus 7 500 F, ils ne
 * dégagent que ~100 F, soit 1 % — c'est vendre à prix coûtant. Une conférence
 * qui doit financer quelque chose vise plutôt 8 900 F (≈ 17 %).
 *
 * Rejouable : chaque article est mis à jour s'il existe déjà.
 */

type Pin = {
  slug: string;
  nomFr: string;
  nomEn: string;
  descFr: string;
  descEn: string;
  refTi: string;
  prixFcfa: number;
  ordre: number;
};

const PINS: Pin[] = [
  {
    slug: "pin-membre",
    nomFr: "Épinglette Membre",
    nomEn: "Membership Pin",
    descFr: "Épinglette officielle du membre Toastmasters, tout en couleur.",
    descEn: "Official Toastmasters membership pin, full colour.",
    refTi: "5757",
    prixFcfa: 7500,
    ordre: 10,
  },
  {
    slug: "pin-where-leaders",
    nomFr: "Épinglette « Where Leaders Are Made »",
    nomEn: "“Where Leaders Are Made” Pin",
    descFr: "La signature Toastmasters.",
    descEn: "The Toastmasters signature.",
    refTi: "5758",
    prixFcfa: 7500,
    ordre: 20,
  },
  {
    slug: "pin-dtm",
    nomFr: "Épinglette DTM",
    nomEn: "DTM Pin",
    descFr:
      "Distinguished Toastmaster : la plus haute distinction du parcours éducatif.",
    descEn: "Distinguished Toastmaster: the highest educational award.",
    refTi: "5800",
    prixFcfa: 10000,
    ordre: 30,
  },
  {
    slug: "pin-officier-lot",
    nomFr: "Lot Bureau complet (8 épinglettes)",
    nomEn: "Club Officer Pin Set (8)",
    descFr:
      "Les 8 épinglettes de fonction du bureau, en un lot. Souvent en rupture chez Toastmasters International : disponibilité à vérifier avant l'annonce.",
    descEn:
      "The 8 club officer pins as one set. Frequently on backorder at Toastmasters International: check availability before announcing.",
    refTi: "5801Z",
    prixFcfa: 60000,
    ordre: 40,
  },
  {
    slug: "pin-president",
    nomFr: "Pin Président",
    nomEn: "Club President Pin",
    descFr: "Épinglette de fonction : Président de club.",
    descEn: "Officer pin: Club President.",
    refTi: "5801",
    prixFcfa: 7500,
    ordre: 50,
  },
  {
    slug: "pin-past-president",
    nomFr: "Pin Past President",
    nomEn: "Club Past President Pin",
    descFr: "Épinglette de fonction : Past President.",
    descEn: "Officer pin: Past President.",
    refTi: "5808",
    prixFcfa: 7500,
    ordre: 60,
  },
  {
    slug: "pin-vp-education",
    nomFr: "Pin VP Éducation",
    nomEn: "VP Education Pin",
    descFr: "Épinglette de fonction : Vice-Président Éducation.",
    descEn: "Officer pin: Vice President Education.",
    refTi: "5813",
    prixFcfa: 7500,
    ordre: 70,
  },
  {
    slug: "pin-vp-adhesion",
    nomFr: "Pin VP Adhésion",
    nomEn: "VP Membership Pin",
    descFr: "Épinglette de fonction : Vice-Président Adhésion.",
    descEn: "Officer pin: Vice President Membership.",
    refTi: "5815",
    prixFcfa: 7500,
    ordre: 80,
  },
  {
    slug: "pin-vp-rp",
    nomFr: "Pin VP Relations Publiques",
    nomEn: "VP Public Relations Pin",
    descFr: "Épinglette de fonction : Vice-Président Relations Publiques.",
    descEn: "Officer pin: Vice President Public Relations.",
    refTi: "5814",
    prixFcfa: 7500,
    ordre: 90,
  },
  {
    slug: "pin-secretaire",
    nomFr: "Pin Secrétaire",
    nomEn: "Secretary Pin",
    descFr: "Épinglette de fonction : Secrétaire.",
    descEn: "Officer pin: Secretary.",
    refTi: "5805",
    prixFcfa: 7500,
    ordre: 100,
  },
  {
    slug: "pin-tresorier",
    nomFr: "Pin Trésorier",
    nomEn: "Treasurer Pin",
    descFr: "Épinglette de fonction : Trésorier.",
    descEn: "Officer pin: Treasurer.",
    refTi: "5806",
    prixFcfa: 7500,
    ordre: 110,
  },
  {
    slug: "pin-sergent",
    nomFr: "Pin Sergent d'Armes",
    nomEn: "Sergeant at Arms Pin",
    descFr: "Épinglette de fonction : Sergent d'Armes.",
    descEn: "Officer pin: Sergeant at Arms.",
    refTi: "5807",
    prixFcfa: 7500,
    ordre: 120,
  },
];

const payload = await getPayload({ config });

for (const p of PINS) {
  const existant = await payload.find({
    collection: "epinglettes",
    where: { slug: { equals: p.slug } },
    limit: 1,
  });

  const commun = {
    slug: p.slug,
    prixFcfa: p.prixFcfa,
    refTi: p.refTi,
    photoUrl: `/produits/${p.slug}.webp`,
    ordre: p.ordre,
    actif: true,
  };

  if (existant.docs[0]) {
    const id = existant.docs[0].id;
    await payload.update({
      collection: "epinglettes",
      id,
      locale: "fr",
      data: { ...commun, nom: p.nomFr, description: p.descFr },
    });
    await payload.update({
      collection: "epinglettes",
      id,
      locale: "en",
      data: { nom: p.nomEn, description: p.descEn },
    });
  } else {
    const cree = await payload.create({
      collection: "epinglettes",
      locale: "fr",
      data: { ...commun, nom: p.nomFr, description: p.descFr },
    });
    await payload.update({
      collection: "epinglettes",
      id: cree.id,
      locale: "en",
      data: { nom: p.nomEn, description: p.descEn },
    });
  }
}

// La boutique reste FERMÉE : on l'ouvre depuis l'administration une fois les
// prix validés par le comité.
await payload.updateGlobal({
  slug: "boutique",
  data: { ouverte: false },
});

console.log(
  `Catalogue : ${PINS.length} épinglettes en place. Boutique FERMÉE — à ouvrir depuis l'administration après validation des prix.`
);
process.exit(0);
