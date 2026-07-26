import type { CollectionConfig, GlobalConfig } from "payload";

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

/**
 * Catalogue des épinglettes proposées à la réservation.
 *
 * Les prix sont FIXÉS À LA MAIN, article par article, en francs CFA. Le
 * comité annonce un tarif rond ; il le saisit ici. La référence TI est
 * conservée pour retrouver chaque article sur shop.toastmasters.org au moment
 * de passer la commande groupée.
 */
export const Epinglettes: CollectionConfig = {
  slug: "epinglettes",
  admin: {
    useAsTitle: "nom",
    group: "Boutique",
    defaultColumns: ["nom", "prixFcfa", "refTi", "actif", "ordre"],
    description:
      "Épinglettes réservables. Le prix affiché aux visiteurs est celui saisi ici.",
  },
  access: {
    // Le catalogue est public en lecture : c'est la vitrine.
    read: () => true,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Identifiant stable, ex. pin-president" },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === "string"
              ? value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
              : value,
        ],
      },
    },
    { name: "nom", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", localized: true },
    {
      name: "prixFcfa",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description:
          "Prix de vente en FCFA, fixé par le comité. C'est ce montant qui est facturé.",
      },
    },
    {
      name: "refTi",
      type: "text",
      admin: {
        description:
          "Référence sur shop.toastmasters.org (ex. 5801), pour la commande groupée",
      },
    },
    {
      name: "photoUrl",
      type: "text",
      admin: { description: "Ex. /produits/pin-president.webp" },
    },
    { name: "ordre", type: "number", defaultValue: 100 },
    {
      name: "actif",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Décocher retire l'article de la vitrine" },
    },
  ],
};

/**
 * Réservations d'épinglettes.
 *
 * ⚠️ INVARIANT REPRIS DU KIT ÉPROUVÉ (scripts/boutique/BOUTIQUE.md) :
 * `create` est FERMÉ à l'API. Une réservation ne peut naître que par la route
 * serveur /api/boutique/reserver, qui relit les prix en base et recalcule le
 * total. Ne pas « rétablir » cet accès : tant que le client pouvait écrire
 * lui-même, il choisissait le statut, le total et le prix unitaire — donc il
 * pouvait se réserver une commande « confirmée » à 0 F, qui entrait dans la
 * liste d'achat que le comité paie en dollars.
 *
 * Les lignes portent un INSTANTANÉ (nom + prix unitaire) : la remise a lieu
 * pendant la conférence, des semaines plus tard, et le catalogue peut changer
 * d'ici là.
 */
export const Reservations: CollectionConfig = {
  slug: "reservations",
  admin: {
    useAsTitle: "reference",
    group: "Boutique",
    defaultColumns: ["reference", "nom", "totalFcfa", "statut", "createdAt"],
    description:
      "Réservations d'épinglettes. La liste d'achat agrégée n'inclut que les réservations confirmées.",
  },
  access: {
    read: staffOnly,
    create: () => false, // ⚠️ volontaire — voir le commentaire ci-dessus
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    {
      name: "reference",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true, description: "Référence lisible, ex. COT27-P0042" },
    },
    {
      name: "token",
      type: "text",
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description:
          "Jeton aléatoire de la page de confirmation. Jamais l'identifiant, qui est énumérable.",
      },
    },
    { name: "prenom", type: "text", required: true },
    { name: "nom", type: "text", required: true },
    { name: "email", type: "email", required: true, index: true },
    { name: "telephone", type: "text", required: true },
    { name: "club", type: "text" },
    { name: "pays", type: "text" },
    {
      name: "statut",
      type: "select",
      required: true,
      defaultValue: "en_attente",
      // Cycle de vie repris du kit : en attente → confirmée → commandée chez
      // TI → arrivée au Bénin → remise en main propre.
      options: [
        { label: "En attente", value: "en_attente" },
        { label: "Confirmée", value: "confirmee" },
        { label: "Commandée chez TI", value: "commandee" },
        { label: "Arrivée", value: "arrivee" },
        { label: "Remise", value: "remise" },
        { label: "Annulée", value: "annulee" },
      ],
    },
    {
      name: "lignes",
      type: "array",
      required: true,
      admin: {
        readOnly: true,
        description: "Instantané figé à la réservation — ne pas modifier",
      },
      fields: [
        { name: "slug", type: "text", required: true },
        { name: "nom", type: "text", required: true },
        { name: "prixUnitaire", type: "number", required: true },
        { name: "quantite", type: "number", required: true },
      ],
    },
    {
      name: "totalFcfa",
      type: "number",
      required: true,
      admin: {
        readOnly: true,
        description: "Recalculé par le serveur depuis les prix du catalogue",
      },
    },
    {
      name: "modePaiement",
      type: "select",
      defaultValue: "sur_place",
      options: [
        { label: "Sur place (remise)", value: "sur_place" },
        { label: "Mobile Money / carte", value: "fedapay" },
        { label: "Virement", value: "virement" },
      ],
    },
    {
      name: "fedapayTransactionId",
      type: "text",
      index: true,
      admin: { readOnly: true },
    },
    { name: "note", type: "textarea" },
    { name: "payeeLe", type: "date", admin: { readOnly: true } },
    { name: "remiseLe", type: "date" },
  ],
  timestamps: true,
};

/**
 * Réglages de la boutique.
 *
 * La boutique est livrée FERMÉE, comme dans le kit d'origine : on l'ouvre
 * depuis l'administration une fois les prix vérifiés.
 */
export const Boutique: GlobalConfig = {
  slug: "boutique",
  admin: {
    group: "Boutique",
    description:
      "La boutique est livrée fermée. Vérifiez les prix avant d'ouvrir les réservations.",
  },
  access: { read: () => true, update: staffOnly },
  fields: [
    {
      name: "ouverte",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Ouvre les réservations sur le site public" },
    },
    {
      name: "delaiRemise",
      type: "text",
      localized: true,
      defaultValue: "Remise pendant la conférence, du 1er au 8 mai 2027",
      admin: { description: "Affiché aux visiteurs, sous le panier" },
    },
  ],
};
