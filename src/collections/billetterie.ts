import type { CollectionConfig } from "payload";

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

/** Participant — §5.2 du cahier de spécifications. */
export const Participants: CollectionConfig = {
  slug: "participants",
  admin: {
    useAsTitle: "email",
    group: "Billetterie",
    defaultColumns: ["prenom", "nom", "email", "pays", "club"],
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    { name: "prenom", type: "text", required: true },
    { name: "nom", type: "text", required: true },
    { name: "email", type: "email", required: true, index: true },
    { name: "telephone", type: "text", required: true },
    { name: "pays", type: "text", defaultValue: "Bénin" },
    { name: "ville", type: "text" },
    { name: "club", type: "text" },
    { name: "districtRole", type: "text" },
    {
      name: "langue",
      type: "select",
      defaultValue: "fr",
      options: ["fr", "en"],
    },
    { name: "regimeAlimentaire", type: "text" },
    { name: "besoinsAccessibilite", type: "text" },
    { name: "premiereConference", type: "checkbox", defaultValue: false },
  ],
};

/** Inscription — reliée à un participant, une catégorie tarifaire, un statut. */
export const Inscriptions: CollectionConfig = {
  slug: "inscriptions",
  admin: {
    useAsTitle: "id",
    group: "Billetterie",
    defaultColumns: ["participant", "categorie", "montant", "statut", "createdAt"],
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    {
      name: "participant",
      type: "relationship",
      relationTo: "participants",
      required: true,
    },
    {
      name: "categorie",
      type: "select",
      required: true,
      options: [
        { label: "Early Bird", value: "early" },
        { label: "Standard", value: "standard" },
        { label: "Late", value: "late" },
        { label: "Étudiant", value: "etudiant" },
        { label: "Délégation", value: "delegation" },
        { label: "VIP", value: "vip" },
      ],
    },
    { name: "montant", type: "number", required: true },
    {
      name: "devise",
      type: "select",
      defaultValue: "XOF",
      options: ["XOF", "USD", "EUR"],
    },
    {
      name: "statut",
      type: "select",
      defaultValue: "en_attente",
      options: [
        { label: "En attente", value: "en_attente" },
        { label: "Payée", value: "payee" },
        { label: "Annulée", value: "annulee" },
        { label: "Remboursée", value: "remboursee" },
      ],
    },
    {
      name: "optionsSelectionnees",
      type: "select",
      hasMany: true,
      options: [
        { label: "Excursions", value: "excursions" },
        { label: "Soirée de gala", value: "gala" },
        { label: "Tote bag", value: "totebag" },
      ],
    },
    { name: "codePromo", type: "text" },
    {
      name: "modePaiement",
      type: "select",
      defaultValue: "sur_place",
      options: [
        { label: "FedaPay (Mobile Money / carte)", value: "fedapay" },
        { label: "Sur place", value: "sur_place" },
      ],
    },
    { name: "qrToken", type: "text", admin: { readOnly: true } },
    { name: "checkedInAt", type: "date" },
  ],
  timestamps: true,
};

/** Paiement — trace de chaque tentative, webhook inclus (idempotence). */
export const Paiements: CollectionConfig = {
  slug: "paiements",
  admin: {
    useAsTitle: "referenceExterne",
    group: "Billetterie",
    defaultColumns: ["inscription", "fournisseur", "montant", "statut"],
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    {
      name: "inscription",
      type: "relationship",
      relationTo: "inscriptions",
      required: true,
    },
    {
      name: "fournisseur",
      type: "select",
      required: true,
      options: ["fedapay", "kkiapay", "stripe"],
    },
    { name: "referenceExterne", type: "text", index: true },
    { name: "montant", type: "number", required: true },
    { name: "devise", type: "select", defaultValue: "XOF", options: ["XOF", "USD", "EUR"] },
    {
      name: "statut",
      type: "select",
      defaultValue: "initie",
      options: ["initie", "approuve", "refuse", "annule"],
    },
    { name: "payloadWebhook", type: "json" },
  ],
  timestamps: true,
};
