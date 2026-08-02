import type { CollectionConfig } from "payload";

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

/** Abonnés à la liste d'attente / newsletter (capture d'e-mails du teaser S2). */
/** Codes promo du tunnel d'inscription (§6.1). */
export const CodesPromo: CollectionConfig = {
  slug: "codes-promo",
  // libellés codes-promo
  labels: { singular: "Code promo", plural: "Codes promo" },
  admin: {
    description:
      "Le code est enregistré en majuscules. La réduction s'applique sur le sous-total.",
    useAsTitle: "code",
    group: "Marketing",
    defaultColumns: ["code", "reductionPct", "actif"],
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    {
      // Normalisé en majuscules à l'enregistrement. La route d'inscription
      // cherche le code en majuscules ; sans cette normalisation, un code saisi
      // « Cot27Deleg » dans l'administration et diffusé aux clubs n'aurait
      // jamais été reconnu, la comparaison Postgres étant sensible à la casse.
      name: "code",
      type: "text",
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === "string" ? value.trim().toUpperCase() : value,
        ],
      },
      admin: { description: "Enregistré en majuscules, quelle que soit la saisie" },
    },
    {
      name: "reductionPct",
      type: "number",
      required: true,
      min: 1,
      max: 100,
      admin: { description: "Réduction en % sur le sous-total" },
    },
    { name: "actif", type: "checkbox", defaultValue: true },
  ],
};

/** Brouillons du tunnel — progression sauvegardée, reprise par lien (§6.1). */
export const Brouillons: CollectionConfig = {
  slug: "brouillons",
  // libellés brouillons
  labels: { singular: "Brouillon", plural: "Brouillons d'inscription" },
  admin: {
    // Plomberie interne : état des paniers abandonnés du tunnel.
    // Masqué du menu pour ne pas encombrer le comité.
    hidden: true,
    useAsTitle: "token",
    group: "Marketing",
    defaultColumns: ["token", "etape", "updatedAt"],
  },
  access: {
    read: staffOnly,
    create: staffOnly, // manipulés uniquement via /api/tunnel/draft (API locale)
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    { name: "token", type: "text", required: true, unique: true, index: true },
    { name: "etape", type: "number", defaultValue: 0 },
    { name: "data", type: "json" },
  ],
  timestamps: true,
};

export const Abonnes: CollectionConfig = {
  slug: "abonnes",
  // libellés abonnes
  labels: { singular: "Abonné", plural: "Abonnés à la newsletter" },
  admin: {
    description:
      "Adresses collectées par le formulaire « Restez informé » du site.",
    useAsTitle: "email",
    group: "Marketing",
    defaultColumns: ["email", "langue", "source", "createdAt"],
  },
  access: {
    read: staffOnly,
    create: staffOnly, // les créations publiques passent par /api/newsletter (API locale)
    update: staffOnly,
    delete: staffOnly,
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true },
    {
      name: "langue",
      type: "select",
      defaultValue: "fr",
      options: ["fr", "en"],
    },
    {
      name: "source",
      type: "text",
      admin: { description: "Page d'origine de l'inscription (accueil, benin…)" },
    },
  ],
  timestamps: true,
};
