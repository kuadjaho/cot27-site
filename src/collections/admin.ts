import type { CollectionConfig } from "payload";

/** Utilisateurs du back-office (comité d'organisation). */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
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
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "application/pdf"],
  },
  admin: { group: "Administration" },
  access: { read: () => true },
  fields: [
    { name: "alt", type: "text", localized: true },
  ],
};
