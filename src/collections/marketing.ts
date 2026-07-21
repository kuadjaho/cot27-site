import type { CollectionConfig } from "payload";

const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

/** Abonnés à la liste d'attente / newsletter (capture d'e-mails du teaser S2). */
export const Abonnes: CollectionConfig = {
  slug: "abonnes",
  admin: {
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
