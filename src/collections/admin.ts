import type { CollectionConfig } from "payload";

/** Utilisateurs du back-office (comité d'organisation). */
export const Users: CollectionConfig = {
  slug: "users",
  // libellés users
  labels: { singular: "Compte administrateur", plural: "Comptes administrateurs" },
  auth: true,
  admin: {
    description:
      "Qui peut se connecter à cette administration.",
    useAsTitle: "email",
    group: "Administration",
  },
  fields: [
    { name: "nom", type: "text" },
    {
      name: "role",
      type: "select",
      defaultValue: "editeur",
      options: [
        { label: "Administrateur", value: "admin" },
        { label: "Éditeur", value: "editeur" },
      ],
    },
  ],
};

/** Médias : photos intervenants, couvertures magazine, logos sponsors. */
export const Media: CollectionConfig = {
  slug: "media",
  // libellés media
  labels: { singular: "Fichier", plural: "Photos et fichiers" },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "application/pdf"],
  },
  admin: {
    description:
      "Photos et fichiers réutilisables dans les articles et les fiches.", group: "Administration" },
  access: { read: () => true },
  fields: [
    { name: "alt", type: "text", localized: true },
  ],
};
